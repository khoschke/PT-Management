// Shared auth for the Vercel Cron routes.
//
// Every cron route runs with the service-role client, which bypasses row level
// security, so the shared secret is the only thing standing between a public
// URL and the whole database. Two rules, applied the same way everywhere:
//
//   * Fail closed when CRON_SECRET isn't set. Comparing against the string
//     "Bearer undefined" would otherwise let anyone through by sending exactly
//     that header.
//   * Constant-time compare, so the secret can't be recovered a byte at a time
//     from response timing.

import { timingSafeEqual } from "crypto";

export function isAuthorisedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || !authHeader) return false;

  const provided = Buffer.from(authHeader);
  const expected = Buffer.from(`Bearer ${secret}`);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
