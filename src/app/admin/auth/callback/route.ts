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
  let verifiedUser: { new_email?: string } | null = null;

  // token_hash first, deliberately. It verifies against Supabase directly and
  // needs nothing from this browser, so it survives being opened on a phone,
  // in another browser, or after anything has disturbed the cookie jar. The
  // PKCE `code` path needs the code verifier this browser stored when the email
  // was sent, and is the fragile one — it is kept only so links already in
  // people's inboxes, and any flow still on the default templates, keep working.
  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    errorMessage = error?.message ?? null;
    verifiedUser = data?.user ?? null;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    errorMessage = error?.message ?? null;
  } else {
    return failure(request, "expired");
  }

  if (errorMessage) {
    console.error("auth callback failed", errorMessage);
    const lower = errorMessage.toLowerCase();

    // "code verifier should be non-empty" is supabase-js refusing locally,
    // before any network call, because this browser has no PKCE verifier —
    // a different device, or something cleared the cookie. It is emphatically
    // not an expired link, and telling the user it was sends them round the
    // loop requesting fresh emails that fail the same way.
    const missingVerifier = lower.includes("code verifier") || lower.includes("code_verifier");
    const expired =
      !missingVerifier &&
      (lower.includes("expired") || lower.includes("invalid") || lower.includes("already"));

    return failure(request, expired ? "expired" : "verify");
  }

  // Which flow was this? A token_hash link states its own type. A PKCE link
  // doesn't, so we fall back to the cookie set when the email went out — which
  // is on this browser already, since PKCE needs its code verifier here too.
  const flow = type ?? request.cookies.get(AUTH_FLOW_COOKIE)?.value;
  const isRecovery = flow === "recovery";

  // An email change is not necessarily finished just because this link
  // verified. With Supabase's "Secure email change" on — it is on for this
  // project, and it is the default — BOTH the old and the new address get a
  // link and both have to be clicked. The first confirmation records 1 of 2
  // and hands back **no session**.
  //
  // Left unhandled that was silently awful: the callback redirected to
  // /admin/account, the proxy found no session and bounced to sign-in, and
  // nothing anywhere said "one down, one to go". The user reasonably concluded
  // the link was broken and clicked it again, which really did fail.
  //
  // `new_email` still being set on the returned user is the authoritative
  // "there is another confirmation outstanding" signal.
  if (!isRecovery && verifiedUser?.new_email) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("authNotice", "email-change-half");
    const half = NextResponse.redirect(url);
    half.cookies.set(AUTH_FLOW_COOKIE, "", { ...authCookieOptions, maxAge: 0 });
    return half;
  }

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
