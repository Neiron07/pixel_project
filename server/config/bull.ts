import { Queue } from "bullmq";
import { redisConnection } from "./redis";

const fileProcessingQueue = new Queue("file-processing", {
  connection: redisConnection,
});

export { fileProcessingQueue };
