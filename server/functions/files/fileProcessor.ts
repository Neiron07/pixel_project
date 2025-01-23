import { Worker } from 'bullmq';
import File from "../../models/files";  // Модель File
import Logging, { ApiType } from "@functions/logging";

// Список запрещённых слов
const bannedWords = ['badword1', 'badword2', 'badword3'];

const worker = new Worker('file-processing', async (job) => {
  const { fileId, fileData } = job.data;

  try {
    // Конвертируем файл в строку, если это текстовый файл
    const fileContent = fileData.toString('utf8');

    // Проверяем наличие запрещённых слов
    const foundWords = bannedWords.filter(word => fileContent.includes(word));

    if (foundWords.length > 0) {
      // Обновляем статус файла в базе данных, если нашли запрещённые слова
      await File.update(
        { status: 'rejected', reason: `Contains banned words: ${foundWords.join(', ')}` },
        { where: { id: fileId } }
      );
      Logging.upload(ApiType.POST, `[REJECTED] File contains banned words: ${foundWords.join(', ')}`);
    } else {
      // Обновляем статус файла, если слова не найдены
      await File.update(
        { status: 'approved' },
        { where: { id: fileId } }
      );
      Logging.upload(ApiType.POST, `[APPROVED] File passed word check.`);
    }
  } catch (error) {
    Logging.upload(ApiType.POST, `[ERROR] Error processing file: ${fileId}`);
    await File.update(
      { status: 'failed', reason: 'Error processing file' },
      { where: { id: fileId } }
    );
  }
});

export { worker };
