import Redis from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "./config";

const redisConnection = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: true,
});

export { redisConnection };
