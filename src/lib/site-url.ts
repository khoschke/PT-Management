// Absolute base URL for links we email out (password recovery, email-change
// confirmation). Supabase needs an absolute `redirectTo`, and it must match an
// entry in the project's Authentication -> URL Configuration -> Redirect URLs
// allowlist or the redirect is dropped *silently*.
//
// NEXT_PUBLIC_SITE_URL wins so production always emails https://pt.fitazgym.com
// links rather than whatever deployment host happened to serve the request.
// Without it we fall back to the request's own host, which is what makes local
// development and preview deployments work with no extra setup.

import { headers } from "next/headers";

export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) return "http://localhost:3000";

  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${protocol}://${host}`;
}
