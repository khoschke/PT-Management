// Landing point for every link Supabase Auth emails out: the password-recovery
// link and the email-change confirmation link both come back here.
//
// Two shapes are handled. The default email templates use {{ .ConfirmationURL }},
// which sends the user via Supabase's /verify endpoint and arrives here with a
// PKCE `code` to exchange. Templates rewritten to use {{ .TokenHash }} arrive
// with `token_hash` + `type` instead, which verifies without a code verifier
// cookie and so survives being opened on a different device. Supporting both
// means the templates can be switched later without touching this route.

import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  RECOVERY_COOKIE,
  RECOVERY_COOKIE_MAX_AGE,
  recoveryCookieOptions,
} from "@/lib/recovery-session";

// `next` comes out of a URL we put in an email, but the email could be
// forwarded and the parameter edited, so it's checked against a fixed list
// rather than trusted as a redirect target.
const RESET_PASSWORD_PATH = "/admin/reset-password";
const ALLOWED_NEXT = new Set([RESET_PASSWORD_PATH, "/admin/account", "/admin"]);

function failure(request: NextRequest, reason: "expired" | "verify") {
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("authError", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;

  const requestedNext = params.get("next");
  const next = requestedNext && ALLOWED_NEXT.has(requestedNext) ? requestedNext : "/admin";

  // Supabase redirects here with an error in the query string when the link
  // itself was already dead before we got a chance to exchange anything.
  if (params.get("error")) {
    return failure(request, "expired");
  }

  const supabase = await createClient();
  let errorMessage: string | null = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    errorMessage = error?.message ?? null;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    errorMessage = error?.message ?? null;
  } else {
    return failure(request, "expired");
  }

  if (errorMessage) {
    console.error("auth callback failed", errorMessage);
    const lower = errorMessage.toLowerCase();
    const expired =
      lower.includes("expired") || lower.includes("invalid") || lower.includes("already");
    return failure(request, expired ? "expired" : "verify");
  }

  // Only a link that actually came from a recovery email unlocks the
  // set-a-new-password screen. For the token_hash shape Supabase tells us the
  // type outright; for the PKCE shape the signal is the `next` we put in the
  // redirectTo when we sent the recovery email, which an attacker can point at
  // this route but can't pair with a valid code they don't have.
  const isRecovery = tokenHash && type ? type === "recovery" : next === RESET_PASSWORD_PATH;
  const destination = isRecovery ? RESET_PASSWORD_PATH : next;

  const response = NextResponse.redirect(new URL(destination, request.url));

  if (isRecovery) {
    response.cookies.set(RECOVERY_COOKIE, "1", {
      ...recoveryCookieOptions,
      maxAge: RECOVERY_COOKIE_MAX_AGE,
    });
  }

  return response;
}
