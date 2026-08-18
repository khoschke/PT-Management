// Salted hash of the submitting IP address, used only for rate limiting and
// abuse tracing. We never store the raw address.

import { createHash } from "crypto";

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT;

  // In production the salt must be set: without it the hash is predictable, so
  // an attacker could pre-compute hashes for known IPs and the rate-limit key
  // becomes guessable. Fail loudly rather than silently degrading. Local dev
  // keeps a fixed fallback so the form still works without extra setup.
  if (!salt) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("IP_HASH_SALT is not set");
    }
    return createHash("sha256").update(`fitaz-dev-salt-change-me:${ip}`).digest("hex");
  }

  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
