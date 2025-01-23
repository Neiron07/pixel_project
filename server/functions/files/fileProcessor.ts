import { Worker } from "bullmq";
import File from "../../models/files"; // Модель File
import Logging, { ApiType } from "@functions/logging";
import { redisConnection } from "config/redis";

// Список запрещённых слов
const bannedWords = ["badword1", "badword2", "badword3", "test"];

// Создание Worker
const worker = new Worker(
  "file-processing",
  async (job) => {
    const { fileId, fileData } = job.data;

    try {
      // Конвертируем файл в строку, если это текстовый файл
      const fileContent = Buffer.from(fileData.data).toString('utf8');
      // console.log(fileContent)
      /* {
        type: 'Buffer',
        data: [
           98,  97, 100, 119, 111,
          114, 100,  49,  32, 116,
          101, 115, 116
        ]
      } */
      // Проверяем наличие запрещённых слов
      const foundWords = bannedWords.filter((word) => fileContent.includes(word));

      // console.log(`Found banned words: ${foundWords}`);
      if (foundWords.length > 0) {
        // Обновляем статус файла в базе данных, если нашли запрещённые слова
        await File.update(
          { status: "rejected", reason: `Contains banned words: ${foundWords.join(", ")}` },
          { where: { id: fileId } }
        );
        Logging.upload(ApiType.POST, `[REJECTED] File contains banned words: ${foundWords.join(", ")}`);
      } else {
        // Обновляем статус файла, если слова не найдены
        await File.update(
          { status: "approved" },
          { where: { id: fileId } }
        );
        Logging.upload(ApiType.POST, `[APPROVED] File passed word check.`);
      }
    } catch (error) {
      Logging.upload(ApiType.POST, `[ERROR] Error processing file: ${fileId}`);
      await File.update(
        { status: "failed", reason: "Error processing file" },
        { where: { id: fileId } }
      );
    }
  },
  {
    connection: redisConnection, // Передаём подключение Redis
  }
);

export { worker };
