// Encrypts private/days.json (kept OUT of git — real content lives only
// on this machine until it's baked into content/dayN.enc) into one AES-GCM
// blob per day. Run with: node scripts/build-content.mjs
//
// File layout of each .enc: [ 12-byte IV ][ ciphertext + 16-byte auth tag ]
// That's the layout the browser's SubtleCrypto.decrypt() expects directly
// for AES-GCM, so app.js doesn't need to know anything about Node's
// separate getAuthTag() step — it just slices bytes 0-12 as the IV and
// hands everything after that straight to decrypt().

import { createCipheriv, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const KEY_HEX = readFileSync(path.join(root, "private/content-key.hex"), "utf8").trim();
const key = Buffer.from(KEY_HEX, "hex");
if (key.length !== 32) throw new Error("key must be 32 bytes (64 hex chars)");

const daysPath = path.join(root, "private/days.json");
if (!existsSync(daysPath)) {
  console.error("private/days.json not found — nothing to encrypt yet.");
  process.exit(1);
}
const days = JSON.parse(readFileSync(daysPath, "utf8"));

for (const [id, data] of Object.entries(days)) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const blob = Buffer.concat([iv, ciphertext, authTag]);
  const outPath = path.join(root, "content", `${id}.enc`);
  writeFileSync(outPath, blob);
  console.log(`wrote content/${id}.enc (${blob.length} bytes) from private/days.json → "${id}"`);
}
