// config/redis.ts
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = createClient({
  url: redisUrl,
  socket: {
    keepAlive: true,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("Redis reconnect failed after 10 attempts.");
        return new Error("Redis reconnect failed");
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on("connect", () => {
  console.log("Redis client connected successfully.");
});

redisClient.on("ready", () => {
  console.log("Redis client is ready to use.");
});

redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});

redisClient.on("end", () => {
  console.log("Redis connection closed.");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Closing Redis connection...");
  await redisClient.quit();
  process.exit(0);
});

export default redisClient;
