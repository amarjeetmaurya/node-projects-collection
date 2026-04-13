// routes/createRedis.route.ts
import { Router } from "express";
import {
  createSimpleWay,
  createWithExpiry,
  createHash,
  createListPush,
  createSetAdd,
  createMultipleKeys,
  // JSON variants
  createSimpleJson,
  createWithExpiryJson,
  createHashAsJson,
  createListPushJson,
  createSetAddJson,
  createMultipleKeysJson,
} from "../controllers/createRedis.controller.js";

const router = Router();

/**
 * POST /create/simple
 * Description: Store a simple string key → value using Redis SET.
 * Redis command: SET <key> <value>
 * Redis CLI: redis-cli SET username alice
 * curl example:
 * curl -X POST http://localhost:3000/create/simple \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"username","value":"alice"}'
 */
router.post("/simple", createSimpleWay);

/**
 * POST /create/simple-json
 * Description: Store a JSON object as a string value using Redis SET.
 * Redis command: SET <key> '<json-string>'
 * Redis CLI: redis-cli SET user:100 '{"name":"Alice","age":25}'
 * curl example:
 * curl -X POST http://localhost:3000/create/simple-json \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"user:100","value":{"name":"Alice","age":25}}'
 */
router.post("/simple-json", createSimpleJson);

/**
 * POST /create/with-expiry
 * Description: Store a key with TTL (seconds) using SET with EX option.
 * Redis command: SET <key> <value> EX <seconds>
 * Redis CLI: redis-cli SETEX session 60 abc123
 * curl example:
 * curl -X POST http://localhost:3000/create/with-expiry \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"session","value":"abc123","ttl":60}'
 */
router.post("/with-expiry", createWithExpiry);

/**
 * POST /create/with-expiry-json
 * Description: Store a JSON object with TTL using Redis SET and EX option.
 * Redis command: SET <key> '<json-string>' EX <seconds>
 * Redis CLI: redis-cli SET session:100 '{"token":"abc"}' EX 60
 * curl example:
 * curl -X POST http://localhost:3000/create/with-expiry-json \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"session:100","value":{"token":"abc"},"ttl":60}'
 */
router.post("/with-expiry-json", createWithExpiryJson);

/**
 * POST /create/hash
 * Description: Store multiple fields under a hash key using HSET.
 * Redis command: HSET <hashKey> <field> <value> [<field2> <value2> ...]
 * Redis CLI: redis-cli HSET user:100 name "Alice" age "25"
 * curl example:
 * curl -X POST http://localhost:3000/create/hash \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"user:100","fields":{"name":"Alice","age":"25"}}'
 */
router.post("/hash", createHash);

/**
 * POST /create/hash-json
 * Description: Store a JSON object as a single field in a hash (field name 'json') using HSET.
 * Redis command: HSET <hashKey> json '<json-string>'
 * Redis CLI: redis-cli HSET user:100 json '{"name":"Alice","age":25}'
 * curl example:
 * curl -X POST http://localhost:3000/create/hash-json \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"user:100","value":{"name":"Alice","age":25}}'
 *
 * Note: If you use RedisJSON module, prefer JSON.SET for native JSON support.
 */
router.post("/hash-json", createHashAsJson);

/**
 * POST /create/list-push
 * Description: Push one or more values to the head of a list using LPUSH.
 * Redis command: LPUSH <listKey> <value1> [value2 ...]
 * Redis CLI: redis-cli LPUSH tasks "task1" "task2"
 * curl example:
 * curl -X POST http://localhost:3000/create/list-push \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"tasks","values":["task1","task2"]}'
 */
router.post("/list-push", createListPush);

/**
 * POST /create/list-push-json
 * Description: Push one or more JSON objects (stringified) to a list using LPUSH.
 * Redis command: LPUSH <listKey> '<json1>' '<json2>' ...
 * Redis CLI: redis-cli LPUSH events '{"type":"login"}' '{"type":"logout"}'
 * curl example:
 * curl -X POST http://localhost:3000/create/list-push-json \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"events","values":[{"type":"login"},{"type":"logout"}]}'
 */
router.post("/list-push-json", createListPushJson);

/**
 * POST /create/set-add
 * Description: Add one or more members to a set using SADD.
 * Redis command: SADD <setKey> <member1> [member2 ...]
 * Redis CLI: redis-cli SADD tags red blue
 * curl example:
 * curl -X POST http://localhost:3000/create/set-add \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"tags","members":["red","blue"]}'
 */
router.post("/set-add", createSetAdd);

/**
 * POST /create/set-add-json
 * Description: Add JSON objects (stringified) as members to a set using SADD.
 * Redis command: SADD <setKey> '<json1>' '<json2>' ...
 * Redis CLI: redis-cli SADD users '{"id":1,"name":"Alice"}' '{"id":2,"name":"Bob"}'
 * curl example:
 * curl -X POST http://localhost:3000/create/set-add-json \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"users","members":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]}'
 */
router.post("/set-add-json", createSetAddJson);

/**
 * POST /create/multi
 * Description: Create multiple keys in a single request using MSET.
 * Redis command: MSET <key1> <value1> <key2> <value2> ...
 * Redis CLI: redis-cli MSET k1 v1 k2 v2
 * curl example:
 * curl -X POST http://localhost:3000/create/multi \
 *   -H "Content-Type: application/json" \
 *   -d '{"pairs":[{"key":"k1","value":"v1"},{"key":"k2","value":"v2"}]}'
 */
router.post("/multi", createMultipleKeys);

/**
 * POST /create/multi-json
 * Description: Create multiple keys with JSON values using MSET (values stringified).
 * Redis command: MSET <key1> '<json1>' <key2> '<json2>' ...
 * Redis CLI: redis-cli MSET user:1 '{"name":"Alice"}' user:2 '{"name":"Bob"}'
 * curl example:
 * curl -X POST http://localhost:3000/create/multi-json \
 *   -H "Content-Type: application/json" \
 *   -d '{"pairs":[{"key":"user:1","value":{"name":"Alice"}},{"key":"user:2","value":{"name":"Bob"}}]}'
 */
router.post("/multi-json", createMultipleKeysJson);

export default router;
