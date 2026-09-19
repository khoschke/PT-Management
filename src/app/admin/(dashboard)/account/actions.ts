"use server";

// Self-service password change. This uses the session-scoped server client
// (NOT the admin/service-role client), so it can only ever change the password
// of the user who is currently signed in — never anyone else's.

import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import {
  AUTH_FLOW_COOKIE,
  AUTH_FLOW_COOKIE_MAX_AGE,
  authCookieOptions,
} from "@/lib/recovery-session";
import type { AccountFormState } from "./state";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    password: z.string().min(8, "Use at least 8 characters").max(200),
    confirm: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  })
  .refine((data) => data.password !== data.currentPassword, {
    path: ["password"],
    message: "Choose a password you haven't used here before",
  });

// Re-checks the current password before we let the new one through.
//
// supabase.auth.updateUser({ password }) on its own doesn't ask for the old
// one, so anyone who reaches an unlocked, signed-in browser could set their own
// password and keep the account. Verifying happens on a throwaway client with
// persistSession off: signInWithPassword must not touch the cookies the real
// session lives in, or a failed attempt would sign the user out.
async function currentPasswordIsCorrect(email: string, password: string): Promise<boolean> {
  const check = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { error } = await check.auth.signInWithPassword({ email, password });
  return !error;
}

export async function changePassword(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    confirm: formData.get("confirm")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const supabase = await createClient();

  // Guard: there must be a signed-in user. updateUser would fail anyway, but
  // this gives a clearer message than a raw auth error.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "You're not signed in. Please sign in again." };
  }
  if (!user.email) {
    return { status: "error", message: "This login has no email address, so we can't verify it." };
  }

  if (!(await currentPasswordIsCorrect(user.email, parsed.data.currentPassword))) {
    return {
      status: "error",
      message: "That current password isn't right.",
      fieldErrors: { currentPassword: "That current password isn't right." },
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { status: "error", message: error.message || "Couldn't change your password. Please try again." };
  }

  return { status: "success", message: "Password changed. Use it next time you sign in." };
}

const changeEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(320),
  currentPassword: z.string().min(1, "Enter your current password"),
});

// Self-service sign-in email change. Like the password change above this runs
// on the session-scoped client, so it can only ever change the caller's own
// email, and it asks for the current password for the same reason: whoever
// controls the sign-in address controls the account, so an unlocked browser
// shouldn't be enough to move it.
//
// Nothing changes in Supabase until the link we email is clicked. With "Secure
// email change" switched on (the default) Supabase emails BOTH the old and the
// new address and needs both confirmed, which is why the copy talks about a
// link rather than promising the change has already happened.
export async function changeEmail(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const parsed = changeEmailSchema.safeParse({
    email: formData.get("email")?.toString() ?? "",
    currentPassword: formData.get("currentPassword")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const newEmail = parsed.data.email.toLowerCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "You're not signed in. Please sign in again." };
  }
  if (!user.email) {
    return { status: "error", message: "This login has no email address, so we can't verify it." };
  }
  if (user.email.toLowerCase() === newEmail) {
    return {
      status: "error",
      message: "That's already your sign-in email.",
      fieldErrors: { email: "That's already your sign-in email." },
    };
  }

  if (!(await currentPasswordIsCorrect(user.email, parsed.data.currentPassword))) {
    return {
      status: "error",
      message: "That current password isn't right.",
      fieldErrors: { currentPassword: "That current password isn't right." },
    };
  }

  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    // Bare URL — see the note in the forgot-password action. A query string
    // here fails the Redirect URLs allowlist match, silently.
    { emailRedirectTo: `${siteUrl}/admin/auth/callback` },
  );

  if (error) {
    console.error("updateUser({ email }) failed", error);
    const lower = error.message.toLowerCase();

    if (lower.includes("already") || lower.includes("registered") || lower.includes("in use")) {
      return {
        status: "error",
        message: "Another login already uses that email address.",
        fieldErrors: { email: "Another login already uses that email address." },
      };
    }
    if (lower.includes("rate limit")) {
      return { status: "error", message: "Too many requests. Wait a minute and try again." };
    }

    return {
      status: "error",
      message:
        "We couldn't send the confirmation email. Please try again shortly, or ask a manager to change it for you on the Staff screen.",
    };
  }

  (await cookies()).set(AUTH_FLOW_COOKIE, "email_change", {
    ...authCookieOptions,
    maxAge: AUTH_FLOW_COOKIE_MAX_AGE,
  });

  return {
    status: "success",
    message: `Confirmation links sent to ${newEmail} and to ${user.email}. Both have to be clicked — your sign-in email changes only once they are. Keep using ${user.email} until then.`,
  };
}
