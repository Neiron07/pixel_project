import express from "express";
import multer from "multer";
import MulterOptions from "../../middleware/multersettings";
import _settings from "@functions/files/settings";
import authenticator from "../../middleware/authenticator";
import Logging, { ApiType } from "@functions/logging";
import File from "../../models/files";
import { fileProcessingQueue } from "../../config/bullQueue";

const settings = _settings();

const multerOptions = {
    destination: MulterOptions.destination,
    filename: MulterOptions.filename,
    onerror: MulterOptions.onerror,
};

const storage = multer.memoryStorage();  // Используем memoryStorage для загрузки файла в память

const router = express.Router();
const upload = multer({ storage: storage }).any();

router.post("/upload", authenticator, async (req: express.Request, res: express.Response) => {
    upload(req, res, async (err) => {
        if (err) {
            Logging.upload(ApiType.POST, "[ERROR] Error uploading file");
            return res.status(500).send("Error uploading file.");
        }

        const files = req.files as Express.Multer.File[];
        const userId = (req as any).user?.id;

        for (const file of files) {
            try {
                // Сохраняем файл в базу данных как бинарные данные
                const newFile = await File.create({
                    userId,
                    filename: file.originalname,
                    fileData: file.buffer,  // Сохраняем бинарные данные из памяти
                    status: "pending",
                });

                Logging.upload(ApiType.POST, `[SUCCESS] File saved to DB: ${file.originalname}`);

                // Добавляем задачу в очередь для проверки файла
                await fileProcessingQueue.add('check-file', {
                    fileId: newFile.id,
                    fileData: file.buffer, // Передаем данные файла для проверки
                });

            } catch (error) {
                Logging.upload(ApiType.POST, `[ERROR] Error saving file to DB: ${file.originalname}`);
                return res.status(500).send("Error saving file to database.");
            }
        }

        res.status(200).send("File uploaded and saved to database successfully.");
    });
});

router.get("/file/:fileId", authenticator, async (req: express.Request, res: express.Response) => {
    const userId = (req as any).user?.id;
    const fileId = req.params.fileId;

    try {
        const file = await File.findOne({
            where: {
                id: fileId,
                userId: userId
            },
        });

        if (!file) {
            return res.status(404).send("File not found.");
        }

        // Устанавливаем заголовки для скачивания
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename=${file.filename}`);
        
        // Отправляем бинарные данные файла
        res.send(file.fileData);
    } catch (error) {
        console.error("Error fetching file:", error);
        res.status(500).send("Error fetching file.");
    }
});


router.get("/all", authenticator, async (req: express.Request, res: express.Response) => {
    const userId = (req as any).user?.id;

    try {
        const files = await File.findAll({
            where: {
                userId: userId
            },
        });

        if (!files || files.length === 0) {
            return res.status(404).send("No files found.");
        }

        res.status(200).json(files.map(file => ({
            id: file.id,
            filename: file.filename,
            status: file.status,
            reason: file.reason,
        })));
    } catch (error) {
        res.status(500).send("Error fetching files.");
    }
});

export { router };
