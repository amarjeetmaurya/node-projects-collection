// controllers/deleteRedis.controller.ts
import type { Request, Response } from "express";
import redisClient from "../config/redis.js";

/**
 * DELETE /delete/simple
 * Description: Delete one key using DEL.
 * Redis command: DEL <key>
 * Redis CLI: redis-cli DEL username
 * Query param: ?key=<key>
 */
export async function deleteSimple(req: Request, res: Response) {
  try {
    const key = String(req.query.key ?? "");
    if (!key) {
      return res.status(400).json({ error: "Missing required query parameter: key" });
    }

    const deleted = await redisClient.del(key);
    return res.status(200).json({ key, deleted, message: deleted ? "Key deleted" : "Key not found" });
  } catch (err) {
    console.error("deleteSimple error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * DELETE /delete/hash-field
 * Description: Remove one or more fields from a hash using HDEL.
 * Redis command: HDEL <hashKey> <field1> [field2 ...]
 * Redis CLI: redis-cli HDEL user:100 age email
 * Body:
 * {
 *   "key": "user:100",
 *   "fields": ["age", "email"]
 * }
 */
export async function deleteHashField(req: Request, res: Response) {
  try {
    const { key, fields } = req.body;
    if (!key || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ error: "Missing required fields: key and non-empty fields array" });
    }

    const removed = await redisClient.hDel(key, fields.map(String));
    return res.status(200).json({ key, removed, message: removed ? "Fields removed" : "No fields removed / key not found" });
  } catch (err) {
    console.error("deleteHashField error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * DELETE /delete/list-item
 * Description: Remove occurrences of a value from a list using LREM.
 * Redis command: LREM <listKey> <count> <value>
 * Redis CLI: redis-cli LREM tasks 0 "task1"
 * Body:
 * {
 *   "key": "tasks",
 *   "value": "task1",
 *   "count": 0
 * }
 *
 * count semantics:
 *  >0 : remove first N occurrences from head to tail
 *  <0 : remove first N occurrences from tail to head
 *   0 : remove all occurrences
 */
export async function deleteListItem(req: Request, res: Response) {
  try {
    const { key, value, count } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: "Missing required fields: key and value" });
    }

    const cnt = Number.isFinite(Number(count)) ? parseInt(String(count), 10) : 0;
    const removed = await redisClient.lRem(key, cnt, String(value));
    return res.status(200).json({ key, value, count: cnt, removed, message: removed ? "Items removed" : "No matching items removed" });
  } catch (err) {
    console.error("deleteListItem error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * DELETE /delete/set-member
 * Description: Remove one or more members from a set using SREM.
 * Redis command: SREM <setKey> <member1> [member2 ...]
 * Redis CLI: redis-cli SREM tags red blue
 * Body:
 * {
 *   "key": "tags",
 *   "members": ["red", "blue"]
 * }
 */
export async function deleteSetMember(req: Request, res: Response) {
  try {
    const { key, members } = req.body;
    if (!key || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "Missing required fields: key and non-empty members array" });
    }

    const removed = await redisClient.sRem(key, members.map(String));
    return res.status(200).json({ key, removed, message: removed ? "Members removed" : "No members removed / key not found" });
  } catch (err) {
    console.error("deleteSetMember error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * DELETE /delete/multi
 * Description: Delete multiple keys in one call using DEL.
 * Redis command: DEL <key1> <key2> ...
 * Redis CLI: redis-cli DEL k1 k2 k3
 * Body:
 * {
 *   "keys": ["k1", "k2", "k3"]
 * }
 */
export async function deleteMultipleKeys(req: Request, res: Response) {
  try {
    const { keys } = req.body;
    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ error: "Missing required field: keys (non-empty array)" });
    }

    const cleaned = keys.map(String).filter(Boolean);
    if (cleaned.length === 0) {
      return res.status(400).json({ error: "No valid keys provided" });
    }

    const deleted = await redisClient.del(cleaned);
    return res.status(200).json({ requested: cleaned.length, deleted, message: `${deleted} keys deleted` });
  } catch (err) {
    console.error("deleteMultipleKeys error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /delete/expire
 * Description: Set TTL (seconds) for a key using EXPIRE (schedule deletion).
 * Redis command: EXPIRE <key> <seconds>
 * Redis CLI: redis-cli EXPIRE session 60
 * Body:
 * {
 *   "key": "session",
 *   "ttl": 60
 * }
 */
export async function setExpire(req: Request, res: Response) {
  try {
    const { key, ttl } = req.body;
    if (!key || ttl === undefined) {
      return res.status(400).json({ error: "Missing required fields: key and ttl" });
    }

    const seconds = Number(ttl);
    if (!Number.isFinite(seconds) || seconds < 0) {
      return res.status(400).json({ error: "ttl must be a non-negative number (seconds)" });
    }

    const result = await redisClient.expire(key, seconds);
    // result: 1 if TTL set, 0 if key does not exist or TTL not set
    return res.status(200).json({ key, ttl: seconds, success: result === 1, message: result === 1 ? "TTL set" : "Key not found or TTL not set" });
  } catch (err) {
    console.error("setExpire error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /delete/persist
 * Description: Remove TTL from a key (make it persistent) using PERSIST.
 * Redis command: PERSIST <key>
 * Redis CLI: redis-cli PERSIST session
 * Body:
 * {
 *   "key": "session"
 * }
 */
export async function persistKey(req: Request, res: Response) {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ error: "Missing required field: key" });
    }

    const result = await redisClient.persist(key);
    // result: 1 if TTL removed, 0 if key does not exist or key had no TTL
    return res.status(200).json({ key, success: result === 1, message: result === 1 ? "TTL removed, key is persistent" : "Key not found or had no TTL" });
  } catch (err) {
    console.error("persistKey error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * DELETE /delete/simple-json
 * Description: Delete a key that stores a JSON string (same as DEL).
 * Redis command: DEL <key>
 * Redis CLI: redis-cli DEL user:100
 * Query param: ?key=<key>
 */
export async function deleteSimpleJson(req: Request, res: Response) {
  try {
    const key = String(req.query.key ?? "");
    if (!key) {
      return res.status(400).json({ error: "Missing required query parameter: key" });
    }

    const deleted = await redisClient.del(key);
    return res.status(200).json({
      key,
      deleted,
      message: deleted ? "JSON key deleted" : "Key not found",
    });
  } catch (err) {
    console.error("deleteSimpleJson error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * DELETE /delete/hash-field-json
 * Description: Remove one or more fields from a hash where fields contain JSON strings using HDEL.
 * Redis command: HDEL <hashKey> <field1> [field2 ...]
 * Redis CLI: redis-cli HDEL user:100 profile settings
 *
 * Body:
 * {
 *   "key": "user:100",
 *   "fields": ["profile", "settings"]
 * }
 *
 * Note: This removes fields by name. If you need to remove fields by matching JSON value,
 * fetch the field(s) first and compare parsed JSON, then call HDEL for matching fields.
 */
export async function deleteHashFieldJson(req: Request, res: Response) {
  try {
    const { key, fields } = req.body;
    if (!key || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ error: "Missing required fields: key and non-empty fields array" });
    }

    const removed = await redisClient.hDel(key, fields.map(String));
    return res.status(200).json({
      key,
      requestedFields: fields,
      removed,
      message: removed ? "Hash fields removed" : "No fields removed / key not found",
    });
  } catch (err) {
    console.error("deleteHashFieldJson error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * DELETE /delete/list-item-json
 * Description: Remove occurrences of a JSON value from a list using LREM.
 * Redis command: LREM <listKey> <count> <value>
 * Redis CLI: redis-cli LREM events 0 '{"type":"login"}'
 *
 * Body:
 * {
 *   "key": "events",
 *   "value": { "type": "login" },
 *   "count": 0
 * }
 *
 * count semantics:
 *  >0 : remove first N occurrences from head to tail
 *  <0 : remove first N occurrences from tail to head
 *   0 : remove all occurrences
 */
export async function deleteListItemJson(req: Request, res: Response) {
  try {
    const { key, value, count } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: "Missing required fields: key and value" });
    }

    const cnt = Number.isFinite(Number(count)) ? parseInt(String(count), 10) : 0;
    const stringified = typeof value === "string" ? value : JSON.stringify(value);

    const removed = await redisClient.lRem(key, cnt, stringified);
    return res.status(200).json({
      key,
      value: typeof value === "string" ? value : JSON.parse(JSON.stringify(value)),
      count: cnt,
      removed,
      message: removed ? "JSON items removed from list" : "No matching JSON items removed",
    });
  } catch (err) {
    console.error("deleteListItemJson error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * DELETE /delete/set-member-json
 * Description: Remove one or more JSON members (stringified) from a set using SREM.
 * Redis command: SREM <setKey> '<json1>' '<json2>' ...
 * Redis CLI: redis-cli SREM users '{"id":1,"name":"Alice"}'
 *
 * Body:
 * {
 *   "key": "users",
 *   "members": [ { "id": 1, "name": "Alice" }, { "id": 2, "name": "Bob" } ]
 * }
 */
export async function deleteSetMemberJson(req: Request, res: Response) {
  try {
    const { key, members } = req.body;
    if (!key || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "Missing required fields: key and non-empty members array" });
    }

    const stringified = members.map((m: unknown) => (typeof m === "string" ? m : JSON.stringify(m)));
    const removed = await redisClient.sRem(key, stringified);
    return res.status(200).json({
      key,
      requestedMembersCount: members.length,
      removed,
      message: removed ? "JSON members removed from set" : "No members removed / key not found",
    });
  } catch (err) {
    console.error("deleteSetMemberJson error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * DELETE /delete/multi-json
 * Description: Delete multiple keys (which may store JSON values) using DEL.
 * Redis command: DEL <key1> <key2> ...
 * Redis CLI: redis-cli DEL user:1 user:2
 *
 * Body:
 * {
 *   "keys": ["user:1", "user:2"]
 * }
 */
export async function deleteMultipleKeysJson(req: Request, res: Response) {
  try {
    const { keys } = req.body;
    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ error: "Missing required field: keys (non-empty array)" });
    }

    const cleaned = keys.map(String).filter(Boolean);
    if (cleaned.length === 0) {
      return res.status(400).json({ error: "No valid keys provided" });
    }

    const deleted = await redisClient.del(cleaned);
    return res.status(200).json({
      requested: cleaned.length,
      deleted,
      message: `${deleted} keys deleted`,
    });
  } catch (err) {
    console.error("deleteMultipleKeysJson error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
