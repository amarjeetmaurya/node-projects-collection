// routes/readRedis.route.ts
import { Router } from "express";
import {
  readSimple,
  readHash,
  readListRange,
  readSetMembers,
  readMultipleKeys,
  readExists,
  readTTL,
} from "../controllers/readRedis.controller.js";

const router = Router();

/**
 * GET /read/simple
 * Description: Retrieve a simple string value by key using GET.
 * Redis command: GET <key>
 * curl example:
 * curl "http://localhost:3000/read/simple?key=username"
 */
router.get("/simple", readSimple);

/**
 * GET /read/hash
 * Description: Retrieve all fields and values of a hash using HGETALL.
 * Redis command: HGETALL <hashKey>
 * curl example:
 * curl "http://localhost:3000/read/hash?key=user:100"
 */
router.get("/hash", readHash);

/**
 * GET /read/list-range
 * Description: Read a range of elements from a list using LRANGE.
 * Redis command: LRANGE <listKey> <start> <stop>
 * Query params: key, start (default 0), stop (default -1)
 * curl example:
 * curl "http://localhost:3000/read/list-range?key=tasks&start=0&stop=10"
 */
router.get("/list-range", readListRange);

/**
 * GET /read/set-members
 * Description: Get all members of a set using SMEMBERS.
 * Redis command: SMEMBERS <setKey>
 * curl example:
 * curl "http://localhost:3000/read/set-members?key=tags"
 */
router.get("/set-members", readSetMembers);

/**
 * GET /read/multi
 * Description: Get multiple keys in one call using MGET.
 * Redis command: MGET <key1> <key2> ...
 * Query params: keys (comma separated)
 * curl example:
 * curl "http://localhost:3000/read/multi?keys=k1,k2,k3"
 */
router.get("/multi", readMultipleKeys);

/**
 * GET /read/exists
 * Description: Check whether a key exists using EXISTS.
 * Redis command: EXISTS <key>
 * curl example:
 * curl "http://localhost:3000/read/exists?key=username"
 */
router.get("/exists", readExists);

/**
 * GET /read/ttl
 * Description: Get remaining TTL (seconds) for a key using TTL.
 * Redis command: TTL <key>
 * curl example:
 * curl "http://localhost:3000/read/ttl?key=session"
 */
router.get("/ttl", readTTL);

export default router;
