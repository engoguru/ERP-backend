// config/redis.js
import dotenv from "dotenv";
dotenv.config();
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest:null,
  reconnectOnError: (err) => { 
    console.error("Redis reconnect triggered:", err);
    return true;
  },
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err));

// Function to explicitly test connection
export const redisConnect = async () => {
  try {
    const pong = await redis.ping();
    console.log("Redis ping:", pong);
  } catch (err) {
    console.error("Redis connection failed:", err);
    throw err;
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await redis.quit();
  process.exit(0);
});

export default redis;
