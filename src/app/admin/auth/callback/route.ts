// Landing point for every link Supabase Auth emails out: the password-recovery
// link and the email-change confirmation link both come back here.
//
// The URL carries no query string of ours, deliberately. Supabase matches
// `redirectTo` against the Redirect URLs allowlist as a whole string, and a
// near miss is silent — it discards the redirect and falls back to the Site URL
// rather than erroring — so anything we'd want to pass travels in a cookie set
// when the email was sent. See src/lib/recovery-session.ts.
//
// Two link shapes are handled. The default email templates use
// {{ .ConfirmationURL }}, which sends the user via Supabase's /verify endpoint
// and arrives here with a PKCE `code` to exchange. Templates rewritten to use
// {{ .TokenHash }} arrive with `token_hash` + `type` instead, which verifies
// without a code-verifier cookie and so survives being opened on a different
// device. Supporting both means the templates can be switched later without
// touching this route.

import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  AUTH_FLOW_COOKIE,
  RECOVERY_COOKIE,
  RECOVERY_COOKIE_MAX_AGE,
  authCookieOptions,
} from "@/lib/recovery-session";

const RESET_PASSWORD_PATH = "/admin/reset-password";
const ACCOUNT_PATH = "/admin/account";

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

  // Supabase redirects here with an error in the query string when the link
  // was already dead before we got a chance to exchange anything.
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

  // Which flow was this? A token_hash link states its own type. A PKCE link
  // doesn't, so we fall back to the cookie set when the email went out — which
  // is on this browser already, since PKCE needs its code verifier here too.
  const flow = type ?? request.cookies.get(AUTH_FLOW_COOKIE)?.value;
  const isRecovery = flow === "recovery";

  const response = NextResponse.redirect(
    new URL(isRecovery ? RESET_PASSWORD_PATH : ACCOUNT_PATH, request.url),
  );

  response.cookies.set(AUTH_FLOW_COOKIE, "", { ...authCookieOptions, maxAge: 0 });

  // Only a link that actually came from a recovery email unlocks the
  // set-a-new-password screen. The trust anchor is the verified code above: a
  // signed-in user can set the flow cookie by asking for their own reset email,
  // but they still can't produce a code they haven't received.
  if (isRecovery) {
    response.cookies.set(RECOVERY_COOKIE, "1", {
      ...authCookieOptions,
      maxAge: RECOVERY_COOKIE_MAX_AGE,
    });
  }

  return response;
}
