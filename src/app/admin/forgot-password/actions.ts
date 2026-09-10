"use server";

// Sends a Supabase Auth password-recovery email. Runs on the session-scoped
// server client so the PKCE code verifier lands in this browser's cookies —
// the emailed link is then exchanged for a session in /admin/auth/callback.

import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import {
  AUTH_FLOW_COOKIE,
  AUTH_FLOW_COOKIE_MAX_AGE,
  authCookieOptions,
} from "@/lib/recovery-session";
import type { ForgotPasswordState } from "./state";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(320),
});

// Shown whether or not the address has an account, so the form can't be used
// to work out which staff emails are registered.
const GENERIC_SENT =
  "If that email has an account, we've sent it a reset link. It expires in an hour.";

export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = schema.safeParse({ email: formData.get("email")?.toString() ?? "" });
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    // Bare URL, no query string: Supabase matches this against the Redirect
    // URLs allowlist as a whole string and silently falls back to the Site URL
    // on a near miss. Where to land afterwards rides in the cookie below.
    redirectTo: `${siteUrl}/admin/auth/callback`,
  });

  // Supabase answers 200 for an address with no account and sends nothing, so
  // an error here is never "that email doesn't exist" — it's rate limiting or
  // the mail transport failing. Surface those honestly rather than claiming we
  // sent something we didn't: a reset screen that lies about sending an email
  // leaves a locked-out trainer waiting on a message that will never arrive.
  if (error) {
    console.error("resetPasswordForEmail failed", error);

    if (error.message.toLowerCase().includes("rate limit")) {
      return {
        status: "error",
        message: "Too many reset requests. Wait a minute and try again.",
      };
    }

    return {
      status: "error",
      message:
        "We couldn't send that reset email. Please try again shortly, or ask a manager to reset your password on the Staff screen.",
    };
  }

  (await cookies()).set(AUTH_FLOW_COOKIE, "recovery", {
    ...authCookieOptions,
    maxAge: AUTH_FLOW_COOKIE_MAX_AGE,
  });

  return { status: "sent", message: GENERIC_SENT };
}
