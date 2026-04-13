// routes/deleteRedis.route.ts
import { Router } from "express";
import {
  deleteSimple,
  deleteHashField,
  deleteListItem,
  deleteSetMember,
  deleteMultipleKeys,
  setExpire,
  persistKey,
  deleteSimpleJson,
  deleteHashFieldJson,
  deleteListItemJson,
  deleteSetMemberJson,
  deleteMultipleKeysJson,
} from "../controllers/deleteRedis.controller.js";


const router = Router();

/**
 * DELETE /delete/simple
 * Description: Delete one key using DEL.
 * Redis command: DEL <key>
 * curl example:
 * curl -X DELETE "http://localhost:3000/delete/simple?key=username"
 */
router.delete("/simple", deleteSimple);

/**
 * DELETE /delete/simple-json
 * Description: Delete a key that stores a JSON string (same as DEL).
 * Redis command: DEL <key>
 * curl example:
 * curl -X DELETE "http://localhost:3000/delete/simple-json?key=user:100"
 */
router.delete("/simple-json", deleteSimpleJson);

/**
 * DELETE /delete/hash-field
 * Description: Remove one or more fields from a hash using HDEL.
 * Redis command: HDEL <hashKey> <field1> [field2 ...]
 * curl example:
 * curl -X DELETE "http://localhost:3000/delete/hash-field" \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"user:100","fields":["age","email"]}'
 */
router.delete("/hash-field", deleteHashField);

/**
 * DELETE /delete/hash-field-json
 * Description: Remove one or more fields from a hash where fields may contain JSON strings using HDEL.
 * Redis command: HDEL <hashKey> <field1> [field2 ...]
 * curl example:
 * curl -X DELETE "http://localhost:3000/delete/hash-field-json" \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"user:100","fields":["profile","settings"]}'
 */
router.delete("/hash-field-json", deleteHashFieldJson);

/**
 * DELETE /delete/list-item
 * Description: Remove occurrences of a value from a list using LREM.
 * Redis command: LREM <listKey> <count> <value>
 * - count > 0 : remove first N occurrences from head to tail
 * - count < 0 : remove first N occurrences from tail to head
 * - count = 0 : remove all occurrences
 * curl example:
 * curl -X DELETE "http://localhost:3000/delete/list-item" \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"tasks","value":"task1","count":0}'
 */
router.delete("/list-item", deleteListItem);

/**
 * DELETE /delete/list-item-json
 * Description: Remove occurrences of a JSON value from a list using LREM (value should be stringified JSON).
 * Redis command: LREM <listKey> <count> '<json-string>'
 * curl example:
 * curl -X DELETE "http://localhost:3000/delete/list-item-json" \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"events","value":{"type":"login"},"count":0}'
 */
router.delete("/list-item-json", deleteListItemJson);

/**
 * DELETE /delete/set-member
 * Description: Remove one or more members from a set using SREM.
 * Redis command: SREM <setKey> <member1> [member2 ...]
 * curl example:
 * curl -X DELETE "http://localhost:3000/delete/set-member" \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"tags","members":["red","blue"]}'
 */
router.delete("/set-member", deleteSetMember);

/**
 * DELETE /delete/set-member-json
 * Description: Remove one or more JSON members (stringified) from a set using SREM.
 * Redis command: SREM <setKey> '<json1>' '<json2>' ...
 * curl example:
 * curl -X DELETE "http://localhost:3000/delete/set-member-json" \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"users","members":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]}'
 */
router.delete("/set-member-json", deleteSetMemberJson);

/**
 * DELETE /delete/multi
 * Description: Delete multiple keys in one call using DEL.
 * Redis command: DEL <key1> <key2> ...
 * curl example:
 * curl -X DELETE "http://localhost:3000/delete/multi" \
 *   -H "Content-Type: application/json" \
 *   -d '{"keys":["k1","k2","k3"]}'
 */
router.delete("/multi", deleteMultipleKeys);

/**
 * DELETE /delete/multi-json
 * Description: Delete multiple keys (which may store JSON values) using DEL.
 * Redis command: DEL <key1> <key2> ...
 * curl example:
 * curl -X DELETE "http://localhost:3000/delete/multi-json" \
 *   -H "Content-Type: application/json" \
 *   -d '{"keys":["user:1","user:2"]}'
 */
router.delete("/multi-json", deleteMultipleKeysJson);

/**
 * POST /delete/expire
 * Description: Set TTL (seconds) for a key using EXPIRE (useful to schedule deletion).
 * Redis command: EXPIRE <key> <seconds>
 * curl example:
 * curl -X POST "http://localhost:3000/delete/expire" \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"session","ttl":60}'
 */
router.post("/expire", setExpire);

/**
 * POST /delete/persist
 * Description: Remove TTL from a key (make it persistent) using PERSIST.
 * Redis command: PERSIST <key>
 * curl example:
 * curl -X POST "http://localhost:3000/delete/persist" \
 *   -H "Content-Type: application/json" \
 *   -d '{"key":"session"}'
 */
router.post("/persist", persistKey);

export default router;
