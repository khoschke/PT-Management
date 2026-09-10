"use server";

// Sets a new password at the end of the forgot-password flow. Deliberately
// does not ask for the current password — the whole point is that the user
// doesn't have it — so it is gated on the recovery marker cookie instead,
// which only /admin/auth/callback can set and only after verifying a code from
// a real recovery email.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { RECOVERY_COOKIE, authCookieOptions } from "@/lib/recovery-session";
import type { ResetPasswordState } from "./state";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters").max(200),
    confirm: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  });

const LINK_EXPIRED =
  "That reset link has expired or has already been used. Request a new one from the sign-in page.";

export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const cookieStore = await cookies();
  if (!cookieStore.get(RECOVERY_COOKIE)) {
    return { status: "error", message: LINK_EXPIRED };
  }

  const parsed = schema.safeParse({
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: LINK_EXPIRED };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return {
      status: "error",
      message: error.message || "Couldn't set that password. Please try again.",
    };
  }

  // Spend the marker as soon as it's been used, so a shared or reopened browser
  // can't come back to this screen on the same recovery.
  cookieStore.set(RECOVERY_COOKIE, "", { ...authCookieOptions, maxAge: 0 });

  redirect("/admin");
}
