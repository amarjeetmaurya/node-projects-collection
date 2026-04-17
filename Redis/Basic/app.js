import redisClient from "./config/redis.js"

const user = {
  id: 1,
  name: "John",
};

// store
await redisClient.set("user:1", JSON.stringify(user));

// retrieve
const data = await redisClient.get("user:1");
const parsed = JSON.parse(data);

console.log(parsed);

await redisClient.set("token", "abc123", {
  EX: 60, // expires in 60 seconds
});
