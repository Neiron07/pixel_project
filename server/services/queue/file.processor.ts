import { Worker } from "bullmq";

import { redisConnection } from "../../config/redis";
import File from "../../models/file.model";
import Logging from "../../utils/logging";
import { Enums } from "../../types/exporter";
import { BannedWords } from "../../constants/exporter";
import { ErrorMessages } from "../../constants/exporter";

/**
 * BullMQ Worker for processing files.
 * Listens to the "file-processing" queue and checks files for banned words.
 */
const worker = new Worker(
  "file-processing",
  async (job) => {
    const { fileId, fileData } = job.data;

    try {
      // Convert Buffer to string (UTF-8)
      const fileContent = Buffer.from(fileData.data).toString("utf8");

      // Check for banned words
      const foundWords = BannedWords.filter((word) =>
        fileContent.toLowerCase().includes(word.toLowerCase())
      );

      if (foundWords.length > 0) {
        // Reject file if banned words are found
        await File.update(
          {
            status: Enums.BullMqStatuses.Rejected,
            reason: ErrorMessages.Functions.BullMq.ContainBannedWords(foundWords),
          },
          { where: { id: fileId } }
        );

        Logging.warn(
          Enums.HttpRequestTypes.POST,
          ErrorMessages.Functions.BullMq.FileRejectedDue(fileId, foundWords)
        );
      } else {
        // Approve file if no banned words are found
        await File.update(
          { status: Enums.BullMqStatuses.Approved },
          { where: { id: fileId } }
        );

        Logging.success(
          Enums.HttpRequestTypes.POST,
          ErrorMessages.Functions.BullMq.FileApproved(fileId)
        );
      }
    } catch (error) {
      // Handle processing error
      Logging.error(
        Enums.HttpRequestTypes.POST,
        ErrorMessages.Functions.BullMq.ProcessingFileError(fileId),
        error
      );

      await File.update(
        {
          status: Enums.BullMqStatuses.Failed,
          reason: ErrorMessages.Texts.BullMq.ErrorProcessingFile,
        },
        { where: { id: fileId } }
      );
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Limit the number of concurrent jobs
  }
);

export { worker };
