import { Queue } from 'bullmq';
import { redis } from './redis';

const fileProcessingQueue = new Queue('file-processing', {
  connection: redis
});

export { fileProcessingQueue };
