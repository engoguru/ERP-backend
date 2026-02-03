import { Queue } from "bullmq";
// import redisConnection from "../config/redis.js";
// import { redisConnect } from "./redis.js";
import redis from "./redis.js";

export const PAYROLL_QUEUE = "payroll-queue";

export const payrollQueue = new Queue(PAYROLL_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 1,
    backoff: {
      type: "exponential",
      delay: 5000
    },
    removeOnComplete: true,
    removeOnFail: true
  }
});
