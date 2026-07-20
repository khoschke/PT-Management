"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LoginState } from "./state";

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const redirectTo = formData.get("redirectTo")?.toString() || "/admin";

  if (!email || !password) {
    return { status: "error", message: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { status: "error", message: "Email or password not recognised." };
  }

  redirect(redirectTo);
}
