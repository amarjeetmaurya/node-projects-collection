// controllers/readRedis.controller.ts
import type { Request, Response } from "express";
import redisClient from "../config/redis.js";

/**
 * GET /read/simple
 * Description: Retrieve a simple string value by key using GET.
 * Redis command: GET <key>
 * Redis CLI: redis-cli GET username
 * Query param: ?key=<key>
 */
export async function readSimple(req: Request, res: Response) {
  try {
    const key = String(req.query.key ?? "");
    if (!key) {
      return res.status(400).json({ error: "Missing required query parameter: key" });
    }

    const value = await redisClient.get(key);
    if (value === null) {
      return res.status(404).json({ found: false, key });
    }

    return res.status(200).json({ found: true, key, value });
  } catch (err) {
    console.error("readSimple error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * GET /read/hash
 * Description: Retrieve all fields and values of a hash using HGETALL.
 * Redis command: HGETALL <hashKey>
 * Redis CLI: redis-cli HGETALL user:100
 * Query param: ?key=<hashKey>
 */
export async function readHash(req: Request, res: Response) {
  try {
    const key = String(req.query.key ?? "");
    if (!key) {
      return res.status(400).json({ error: "Missing required query parameter: key" });
    }

    const result = await redisClient.hGetAll(key);
    // hGetAll returns {} when key does not exist
    if (!result || Object.keys(result).length === 0) {
      // Could be empty hash or not found; return 404 to indicate not found
      return res.status(404).json({ found: false, key });
    }

    return res.status(200).json({ found: true, key, fields: result });
  } catch (err) {
    console.error("readHash error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * GET /read/list-range
 * Description: Read a range of elements from a list using LRANGE.
 * Redis command: LRANGE <listKey> <start> <stop>
 * Redis CLI: redis-cli LRANGE tasks 0 10
 * Query params: key, start (default 0), stop (default -1)
 */
export async function readListRange(req: Request, res: Response) {
  try {
    const key = String(req.query.key ?? "");
    if (!key) {
      return res.status(400).json({ error: "Missing required query parameter: key" });
    }

    const start = Number.isFinite(Number(req.query.start)) ? parseInt(String(req.query.start), 10) : 0;
    const stop = Number.isFinite(Number(req.query.stop)) ? parseInt(String(req.query.stop), 10) : -1;

    const items = await redisClient.lRange(key, start, stop);
    return res.status(200).json({ key, start, stop, items });
  } catch (err) {
    console.error("readListRange error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * GET /read/set-members
 * Description: Get all members of a set using SMEMBERS.
 * Redis command: SMEMBERS <setKey>
 * Redis CLI: redis-cli SMEMBERS tags
 * Query param: ?key=<setKey>
 */
export async function readSetMembers(req: Request, res: Response) {
  try {
    const key = String(req.query.key ?? "");
    if (!key) {
      return res.status(400).json({ error: "Missing required query parameter: key" });
    }

    const members = await redisClient.sMembers(key);
    return res.status(200).json({ key, members });
  } catch (err) {
    console.error("readSetMembers error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * GET /read/multi
 * Description: Get multiple keys in one call using MGET.
 * Redis command: MGET <key1> <key2> ...
 * Redis CLI: redis-cli MGET k1 k2 k3
 * Query param: ?keys=k1,k2,k3
 */
export async function readMultipleKeys(req: Request, res: Response) {
  try {
    const keysParam = String(req.query.keys ?? "");
    if (!keysParam) {
      return res.status(400).json({ error: "Missing required query parameter: keys (comma separated)" });
    }

    const keys = keysParam.split(",").map((k) => k.trim()).filter(Boolean);
    if (keys.length === 0) {
      return res.status(400).json({ error: "No valid keys provided" });
    }

    const values = await redisClient.mGet(keys);
    // mGet returns array of values or nulls in same order
    const result = keys.map((k, i) => ({ key: k, value: values[i] ?? null }));
    return res.status(200).json({ results: result });
  } catch (err) {
    console.error("readMultipleKeys error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * GET /read/exists
 * Description: Check whether a key exists using EXISTS.
 * Redis command: EXISTS <key>
 * Redis CLI: redis-cli EXISTS username
 * Query param: ?key=<key>
 */
export async function readExists(req: Request, res: Response) {
  try {
    const key = String(req.query.key ?? "");
    if (!key) {
      return res.status(400).json({ error: "Missing required query parameter: key" });
    }

    const existsCount = await redisClient.exists(key);
    // existsCount is 1 if exists, 0 if not
    return res.status(200).json({ key, exists: existsCount > 0 });
  } catch (err) {
    console.error("readExists error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * GET /read/ttl
 * Description: Get remaining TTL (seconds) for a key using TTL.
 * Redis command: TTL <key>
 * Redis CLI: redis-cli TTL session
 * Query param: ?key=<key>
 */
export async function readTTL(req: Request, res: Response) {
  try {
    const key = String(req.query.key ?? "");
    if (!key) {
      return res.status(400).json({ error: "Missing required query parameter: key" });
    }

    const ttl = await redisClient.ttl(key);
    // TTL returns:
    // -2 if the key does not exist
    // -1 if the key exists but has no associated expire
    // >=0 remaining seconds otherwise
    return res.status(200).json({ key, ttl });
  } catch (err) {
    console.error("readTTL error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
