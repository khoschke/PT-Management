// Salted hash of the submitting IP address, used only for rate limiting and
// abuse tracing. We never store the raw address.

import { createHash } from "crypto";

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "fitaz-dev-salt-change-me";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
