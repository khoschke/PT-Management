"use server";

// Staff and access management. These actions use the Supabase service-role
// client, which bypasses row level security, so every one of them must
// verify the caller is a manager before doing anything.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";
import type { ActionResult } from "../state";
import type { StaffFormState } from "./state";

async function callerIsManager(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.profile?.role === "manager";
}

async function findUserIdByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<string | null> {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const match = data?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return match?.id ?? null;
}

// Finds an existing login by email or creates a new one, then returns its id.
async function findOrCreateUser(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  password: string,
): Promise<{ userId?: string; error?: string }> {
  const existing = await findUserIdByEmail(admin, email);
  if (existing) return { userId: existing };

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    return { error: error?.message ?? "Couldn't create that login." };
  }
  return { userId: data.user.id };
}

const addManagerSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Enter a valid email address").max(320),
  password: z.string().min(8, "Use at least 8 characters").max(200),
});

export async function addManager(
  _prev: StaffFormState,
  formData: FormData,
): Promise<StaffFormState> {
  if (!(await callerIsManager())) {
    return { status: "error", message: "Only managers can add staff." };
  }

  const parsed = addManagerSchema.safeParse({
    fullName: formData.get("fullName")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const admin = createAdminClient();
  const { userId, error } = await findOrCreateUser(admin, parsed.data.email, parsed.data.password);
  if (!userId) return { status: "error", message: error };

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: userId, role: "manager", trainer_id: null, full_name: parsed.data.fullName });
  if (profileError) {
    return { status: "error", message: "Couldn't set up that manager. Please try again." };
  }

  revalidatePath("/admin/staff");
  return { status: "success" };
}

const addTrainerLoginSchema = z.object({
  trainerId: z.string().uuid("Choose a trainer"),
  email: z.string().trim().email("Enter a valid email address").max(320),
  password: z.string().min(8, "Use at least 8 characters").max(200),
});

export async function addTrainerLogin(
  _prev: StaffFormState,
  formData: FormData,
): Promise<StaffFormState> {
  if (!(await callerIsManager())) {
    return { status: "error", message: "Only managers can add staff." };
  }

  const parsed = addTrainerLoginSchema.safeParse({
    trainerId: formData.get("trainerId")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const admin = createAdminClient();

  const { data: trainer } = await admin
    .from("trainers")
    .select("name")
    .eq("id", parsed.data.trainerId)
    .single();

  const { userId, error } = await findOrCreateUser(admin, parsed.data.email, parsed.data.password);
  if (!userId) return { status: "error", message: error };

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    role: "trainer",
    trainer_id: parsed.data.trainerId,
    full_name: trainer?.name ?? null,
  });
  if (profileError) {
    return { status: "error", message: "Couldn't set up that trainer login. Please try again." };
  }

  revalidatePath("/admin/staff");
  return { status: "success" };
}

// Promote an existing trainer login to manager. Keeps their trainer link, so
// they stay on the roster and can still receive their own leads.
export async function makeManager(userId: string): Promise<ActionResult> {
  if (!(await callerIsManager())) {
    return { ok: false, message: "Only managers can change roles." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ role: "manager" }).eq("id", userId);
  if (error) return { ok: false, message: "Couldn't update that role." };

  revalidatePath("/admin/staff");
  return { ok: true };
}

// Revoke a person's access by removing their profile. The underlying login and
// any history they created (allocations, notes) are left intact; they simply
// lose their manager/trainer role. A manager can't revoke their own access.
export async function removeStaffAccess(userId: string): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (me?.profile?.role !== "manager") {
    return { ok: false, message: "Only managers can remove access." };
  }
  if (me.id === userId) {
    return { ok: false, message: "You can't remove your own access." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").delete().eq("id", userId);
  if (error) return { ok: false, message: "Couldn't remove that access." };

  revalidatePath("/admin/staff");
  return { ok: true };
}
