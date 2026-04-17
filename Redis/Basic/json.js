import redisClient from "./config/redis.js"

await redisClient.set("user", "ogXdev", {
  EX: 60, // NX: true (Only set the key if it does not already exist.)
}); // return OK

const result = await redisClient.get("user");
console.log(result); // ogXdev

// 1. Store JSON as a string
// ============================================
// await redisClient.set("user:1", JSON.stringify({ id: 1, name: "Alice" }));

// const raw = await redisClient.get("user:1");
// const parsed = JSON.parse(raw);

// console.log(parsed.name); // "Alice"

// 2. Use RedisJSON module
// =============================================
// await redisClient.json.set("user:2", "$", { id: 1, name: "ogXdev" });

// const output = await redisClient.json.get("user:1");
// // console.log(JSON.parse(output));
// console.log(output)

// 3. Use Hashes (structured fields)
// =============================================
// If you want structured fields → use hashes.
await redisClient.hSet("user:1", {
  id: "1",
  name: "Alice",
  email: "alice@example.com"
});

const user = await redisClient.hGetAll("user:1");
console.log(user); // { id: '1', name: 'Alice', email: 'alice@example.com' }

// Hashes → when you want structured fields, partial updates, or efficient memory usage.
// JSON (stringified) → when you don’t need field-level operations, just store/retrieve whole objects.
// RedisJSON module → when you want native JSON querying and manipulation.


await redisClient.quit();
