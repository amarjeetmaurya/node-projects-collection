import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://127.0.0.1:6379", // local Redis
});

// handle errors
redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

// connect
// Initial connection
try {
  await redisClient.connect();
  console.log("✅ Redis Connected");
} catch (err) {
  console.error("Initial Redis connection failed:", err.message);
}


export default redisClient;