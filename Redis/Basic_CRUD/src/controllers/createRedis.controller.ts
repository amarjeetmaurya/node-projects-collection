// controllers/createRedis.controller.ts
import type { Request, Response } from "express";
import redisClient from "../config/redis.js";

/**
 * POST /create/simple
 * Description: Store a simple string key → value using Redis SET.
 * Redis command: SET <key> <value>
 * Redis CLI: redis-cli SET username alice
 */
export async function createSimpleWay(req: Request, res: Response) {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res
        .status(400)
        .json({ error: "Missing required fields: key and value" });
    }

    await redisClient.set(key, String(value));
    return res.status(201).json({ message: `Stored ${key} → ${value}` });
  } catch (err) {
    console.error("createSimpleWay error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /create/with-expiry
 * Description: Store a key with TTL (seconds) using SET with EX or SETEX.
 * Redis command (SET with EX): SET <key> <value> EX <seconds>
 * Redis CLI: redis-cli SETEX session 60 abc123
 */
export async function createWithExpiry(req: Request, res: Response) {
  try {
    console.log(req.body);
    const { key, value, ttl } = req.body;
    if (!key || value === undefined || ttl === undefined) {
      return res
        .status(400)
        .json({ error: "Missing required fields: key, value, ttl" });
    }
    const seconds = Number(ttl);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return res
        .status(400)
        .json({ error: "ttl must be a positive number (seconds)" });
    }

    // Using set with EX option
    // await redisClient.json.set(key, String(value), { EX: seconds });
    //   const sessionID = "e6ed2206-8aaf-433b-82eb-8c7fada847de";
      const sessionID = crypto.randomUUID();
    await redisClient.json.set(`${key}:${sessionID}`, "$", {
      userId : value,
    });
    await redisClient.expire(`session:${sessionID}`, seconds);

    return res
      .status(201)
      .json({ message: `Stored ${key} → ${value} (ttl: ${seconds}s)` });
  } catch (err) {
    console.error("createWithExpiry error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /create/hash
 * Description: Store multiple fields under a hash key using HSET.
 * Redis command: HSET <hashKey> <field> <value> [<field2> <value2> ...]
 * Redis CLI: redis-cli HSET user:100 name "Alice" age "25"
 *
 * Expected body:
 * {
 *   "key": "user:100",
 *   "fields": { "name": "Alice", "age": "25" }
 * }
 */
export async function createHash(req: Request, res: Response) {
  try {
    const { key, fields } = req.body;
    if (!key || typeof fields !== "object" || fields === null) {
      return res
        .status(400)
        .json({ error: "Missing required fields: key and fields (object)" });
    }

    // hSet accepts an object in node-redis v4
    const result = await redisClient.hSet(key, fields);
    return res
      .status(201)
      .json({ message: `Hash ${key} updated`, addedOrUpdatedFields: result });
  } catch (err) {
    console.error("createHash error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /create/list-push
 * Description: Push one or more values to the head of a list using LPUSH.
 * Redis command: LPUSH <listKey> <value1> [value2 ...]
 * Redis CLI: redis-cli LPUSH tasks "task1" "task2"
 *
 * Expected body:
 * {
 *   "key": "tasks",
 *   "values": ["task1", "task2"]
 * }
 */
export async function createListPush(req: Request, res: Response) {
  try {
    const { key, values } = req.body;
    if (!key || !Array.isArray(values) || values.length === 0) {
      return res
        .status(400)
        .json({
          error: "Missing required fields: key and non-empty values array",
        });
    }

    // lPush returns the length of the list after push
    const newLength = await redisClient.lPush(key, values.map(String));
    return res
      .status(201)
      .json({
        message: `Pushed ${values.length} items to ${key}`,
        length: newLength,
      });
  } catch (err) {
    console.error("createListPush error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /create/set-add
 * Description: Add one or more members to a set using SADD.
 * Redis command: SADD <setKey> <member1> [member2 ...]
 * Redis CLI: redis-cli SADD tags red blue
 *
 * Expected body:
 * {
 *   "key": "tags",
 *   "members": ["red", "blue"]
 * }
 */
export async function createSetAdd(req: Request, res: Response) {
  try {
    const { key, members } = req.body;
    if (!key || !Array.isArray(members) || members.length === 0) {
      return res
        .status(400)
        .json({
          error: "Missing required fields: key and non-empty members array",
        });
    }

    // sAdd returns number of elements added
    const added = await redisClient.sAdd(key, members.map(String));
    return res
      .status(201)
      .json({ message: `Added ${added} members to set ${key}` });
  } catch (err) {
    console.error("createSetAdd error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /create/multi
 * Description: Create multiple keys in a single request using MSET.
 * Redis command: MSET <key1> <value1> <key2> <value2> ...
 * Redis CLI: redis-cli MSET k1 v1 k2 v2
 *
 * Expected body:
 * {
 *   "pairs": [
 *     { "key": "k1", "value": "v1" },
 *     { "key": "k2", "value": "v2" }
 *   ]
 * }
 */
export async function createMultipleKeys(req: Request, res: Response) {
  try {
    const { pairs } = req.body;
    if (!Array.isArray(pairs) || pairs.length === 0) {
      return res
        .status(400)
        .json({ error: "Missing required field: pairs (non-empty array)" });
    }

    // Build an object for mSet: { k1: v1, k2: v2 }
    const msetObj: Record<string, string> = {};
    for (const p of pairs) {
      if (!p || typeof p.key !== "string" || p.value === undefined) {
        return res
          .status(400)
          .json({ error: "Each pair must have key (string) and value" });
      }
      msetObj[p.key] = String(p.value);
    }

    await redisClient.mSet(msetObj);
    return res
      .status(201)
      .json({ message: `Created/updated ${Object.keys(msetObj).length} keys` });
  } catch (err) {
    console.error("createMultipleKeys error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /create/simple-json
 * Description: Store a JSON object as a string value using Redis SET.
 * Redis command: SET <key> '<json-string>'
 * Redis CLI: redis-cli SET user:100 '{"name":"Alice","age":25}'
 *
 * Body:
 * { "key": "user:100", "value": { "name": "Alice", "age": 25 } }
 */
export async function createSimpleJson(req: Request, res: Response) {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: "Missing required fields: key and value" });
    }

    const jsonString = JSON.stringify(value);
    await redisClient.set(key, jsonString);
    return res.status(201).json({ message: `Stored JSON at ${key}`, key, value });
  } catch (err) {
    console.error("createSimpleJson error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /create/with-expiry-json
 * Description: Store a JSON object with TTL using Redis SET with EX option.
 * Redis command: SET <key> '<json-string>' EX <seconds>
 * Redis CLI: redis-cli SET session:100 '{"token":"abc"}' EX 60
 *
 * Body:
 * { "key": "session:100", "value": { "token": "abc" }, "ttl": 60 }
 */
export async function createWithExpiryJson(req: Request, res: Response) {
  try {
    const { key, value, ttl } = req.body;
    if (!key || value === undefined || ttl === undefined) {
      return res.status(400).json({ error: "Missing required fields: key, value, ttl" });
    }

    const seconds = Number(ttl);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return res.status(400).json({ error: "ttl must be a positive number (seconds)" });
    }

    const jsonString = JSON.stringify(value);
    await redisClient.set(key, jsonString, { EX: seconds });
    return res.status(201).json({ message: `Stored JSON at ${key} with ttl ${seconds}s`, key, ttl: seconds });
  } catch (err) {
    console.error("createWithExpiryJson error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /create/hash-json
 * Description: Store a JSON object as a single field in a hash (field name 'json') using HSET.
 * Redis command: HSET <hashKey> json '<json-string>'
 * Redis CLI: redis-cli HSET user:100 json '{"name":"Alice","age":25}'
 *
 * Body:
 * { "key": "user:100", "value": { "name": "Alice", "age": 25 }, "field": "json" } // field optional
 *
 * Note: If you use RedisJSON module, prefer JSON.SET for native JSON support.
 */
export async function createHashAsJson(req: Request, res: Response) {
  try {
    const { key, value, field } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: "Missing required fields: key and value" });
    }

    const fieldName = typeof field === "string" && field.trim() ? field.trim() : "json";
    const jsonString = JSON.stringify(value);

    // hSet accepts an object; store under chosen field
    const result = await redisClient.hSet(key, { [fieldName]: jsonString });
    return res.status(201).json({ message: `Stored JSON in hash ${key} field ${fieldName}`, key, field: fieldName, addedOrUpdatedFields: result });
  } catch (err) {
    console.error("createHashAsJson error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /create/list-push-json
 * Description: Push one or more JSON objects (stringified) to a list using LPUSH.
 * Redis command: LPUSH <listKey> '<json1>' '<json2>' ...
 * Redis CLI: redis-cli LPUSH events '{"type":"login"}' '{"type":"logout"}'
 *
 * Body:
 * { "key": "events", "values": [ { "type": "login" }, { "type": "logout" } ] }
 */
export async function createListPushJson(req: Request, res: Response) {
  try {
    const { key, values } = req.body;
    if (!key || !Array.isArray(values) || values.length === 0) {
      return res.status(400).json({ error: "Missing required fields: key and non-empty values array" });
    }

    const stringified = values.map((v: unknown) => JSON.stringify(v));
    const newLength = await redisClient.lPush(key, stringified);
    return res.status(201).json({ message: `Pushed ${values.length} JSON items to ${key}`, key, length: newLength });
  } catch (err) {
    console.error("createListPushJson error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /create/set-add-json
 * Description: Add JSON objects (stringified) as members to a set using SADD.
 * Redis command: SADD <setKey> '<json1>' '<json2>' ...
 * Redis CLI: redis-cli SADD users '{"id":1,"name":"Alice"}' '{"id":2,"name":"Bob"}'
 *
 * Body:
 * { "key": "users", "members": [ { "id": 1, "name": "Alice" }, { "id": 2, "name": "Bob" } ] }
 */
export async function createSetAddJson(req: Request, res: Response) {
  try {
    const { key, members } = req.body;
    if (!key || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "Missing required fields: key and non-empty members array" });
    }

    const stringified = members.map((m: unknown) => JSON.stringify(m));
    const added = await redisClient.sAdd(key, stringified);
    return res.status(201).json({ message: `Added ${added} JSON members to set ${key}`, key, added });
  } catch (err) {
    console.error("createSetAddJson error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /create/multi-json
 * Description: Create multiple keys with JSON values using MSET (values stringified).
 * Redis command: MSET <key1> '<json1>' <key2> '<json2>' ...
 * Redis CLI: redis-cli MSET user:1 '{"name":"Alice"}' user:2 '{"name":"Bob"}'
 *
 * Body:
 * { "pairs": [ { "key": "user:1", "value": { "name": "Alice" } }, { "key": "user:2", "value": { "name": "Bob" } } ] }
 */
export async function createMultipleKeysJson(req: Request, res: Response) {
  try {
    const { pairs } = req.body;
    if (!Array.isArray(pairs) || pairs.length === 0) {
      return res.status(400).json({ error: "Missing required field: pairs (non-empty array)" });
    }

    const msetObj: Record<string, string> = {};
    for (const p of pairs) {
      if (!p || typeof p.key !== "string" || p.value === undefined) {
        return res.status(400).json({ error: "Each pair must have key (string) and value" });
      }
      msetObj[p.key] = JSON.stringify(p.value);
    }

    await redisClient.mSet(msetObj);
    return res.status(201).json({ message: `Created/updated ${Object.keys(msetObj).length} keys with JSON values` });
  } catch (err) {
    console.error("createMultipleKeysJson error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
