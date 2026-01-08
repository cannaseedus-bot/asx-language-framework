import { createHash } from "node:crypto";

export function sha256Hex(bytes) {
  const hash = createHash("sha256");
  hash.update(Buffer.from(bytes));
  return hash.digest("hex");
}
