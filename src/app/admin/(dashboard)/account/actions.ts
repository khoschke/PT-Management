"use server";

// Self-service password change. This uses the session-scoped server client
// (NOT the admin/service-role client), so it can only ever change the password
// of the user who is currently signed in — never anyone else's.

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { AccountFormState } from "./state";

const changePasswordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters").max(200),
    confirm: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  });

export async function changePassword(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const parsed = changePasswordSchema.safeParse({
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

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { status: "error", message: error.message || "Couldn't change your password. Please try again." };
  }

  return { status: "success", message: "Password changed. Use it next time you sign in." };
}
