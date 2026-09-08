"use server";

// Staff and access management. These actions use the Supabase service-role
// client, which bypasses row level security, so every one of them must
// verify the caller is a manager before doing anything.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { callerIsManager, getCurrentUser } from "@/lib/auth";
import type { ActionResult } from "../state";
import type { StaffFormState } from "./state";

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

// Create a staff member on the development pathway. Unlike addTrainerLogin,
// which links a login to a roster trainer that already exists, this creates
// both halves at once: an INACTIVE `trainers` row and a `staff` profile
// pointing at it.
//
// The inactive trainers row is what makes the whole pathway cheap. It gives
// them a trainer_id, and onboarding progress, compliance documents and the
// storage bucket all key on trainer_id rather than on the role, so they work
// for staff with no schema change. `active: false` keeps them off the public
// form's trainer picker and out of the lead board's allocation list, so they
// cannot be given leads. See 0013_staff_role.sql.
//
// `gender` is required because trainers.gender is not null with no default.
const addStaffLoginSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Enter a valid email address").max(320),
  password: z.string().min(8, "Use at least 8 characters").max(200),
  gender: z.enum(["male", "female"], { message: "Choose one" }),
});

export async function addStaffLogin(
  _prev: StaffFormState,
  formData: FormData,
): Promise<StaffFormState> {
  if (!(await callerIsManager())) {
    return { status: "error", message: "Only managers can add staff." };
  }

  const parsed = addStaffLoginSchema.safeParse({
    fullName: formData.get("fullName")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    gender: formData.get("gender")?.toString(),
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

  // Refuse to overwrite an existing role. Without this, adding a staff login
  // with a manager's or trainer's email would silently demote them.
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (existingProfile) {
    return {
      status: "error",
      message: `That email already signs in as a ${existingProfile.role}. Remove their access first if you mean to change it.`,
    };
  }

  const { data: trainerRow, error: trainerError } = await admin
    .from("trainers")
    .insert({
      name: parsed.data.fullName,
      email: parsed.data.email,
      gender: parsed.data.gender,
      active: false,
    })
    .select("id")
    .single();
  if (trainerError || !trainerRow) {
    console.error("Add staff: trainers insert failed", trainerError);
    return { status: "error", message: "Couldn't set up that staff member. Please try again." };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userId,
    role: "staff",
    trainer_id: trainerRow.id,
    full_name: parsed.data.fullName,
  });
  if (profileError) {
    // Don't leave an orphan roster row behind if the profile didn't take.
    await admin.from("trainers").delete().eq("id", trainerRow.id);
    console.error("Add staff: profile insert failed", profileError);

    // The likeliest cause by far is that 0013_staff_role.sql has not been run
    // on the live database, so the `staff` value does not exist on the enum
    // yet. This project has shipped code ahead of a migration before and lost
    // days to a generic error message, so name the cause instead of hiding it.
    const missingEnumValue =
      profileError.code === "22P02" || /invalid input value for enum/i.test(profileError.message ?? "");
    return {
      status: "error",
      message: missingEnumValue
        ? "The database doesn't know about the staff role yet. Run migration 0013_staff_role.sql (both parts) in the Supabase SQL editor, then try again."
        : "Couldn't set up that staff member. Please try again.",
    };
  }

  revalidatePath("/admin/staff");
  revalidatePath("/admin/development");
  return { status: "success" };
}

// Promote a staff member to a full trainer. Two writes, because nothing they
// have built up was ever keyed on their role: every workbook answer and
// uploaded document keys on trainer_id, which does not change here. They keep
// all of it and start appearing in the allocation list.
//
// Deliberately one-way. Demoting raises questions this doesn't answer (what
// happens to leads already allocated to them), so reversing it is a manager
// deactivating the trainer and changing the role by hand.
export async function promoteStaffToTrainer(userId: string): Promise<ActionResult> {
  if (!(await callerIsManager())) {
    return { ok: false, message: "Only managers can promote staff." };
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("role, trainer_id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return { ok: false, message: "Couldn't find that person." };
  if (profile.role !== "staff") {
    return { ok: false, message: "Only a staff member can be promoted to trainer." };
  }
  if (!profile.trainer_id) {
    return { ok: false, message: "That staff member has no roster row to activate." };
  }

  const { error: trainerError } = await admin
    .from("trainers")
    .update({ active: true })
    .eq("id", profile.trainer_id);
  if (trainerError) {
    console.error("Promote staff: activating trainer failed", trainerError);
    return { ok: false, message: "Couldn't activate their roster entry." };
  }

  const { error: roleError } = await admin
    .from("profiles")
    .update({ role: "trainer" })
    .eq("id", userId);
  if (roleError) {
    // Put the roster row back, so a half-promoted person can't appear in the
    // allocation list while still holding a staff role.
    await admin.from("trainers").update({ active: false }).eq("id", profile.trainer_id);
    console.error("Promote staff: role update failed", roleError);
    return { ok: false, message: "Couldn't update their role." };
  }

  revalidatePath("/admin/staff");
  revalidatePath("/admin/development");
  revalidatePath("/admin/trainers");
  revalidatePath("/admin/compliance");
  return { ok: true };
}

// Manager-assisted email change. Updates a staff member's sign-in email with
// the service-role client and email_confirm: true, so the change takes effect
// immediately without the usual confirmation email — handy while email sending
// is still off. This changes the login (auth) email only, not a trainer's
// roster contact email (that's edited on the Trainers screen).
const changeEmailSchema = z.string().trim().email("Enter a valid email address").max(320);

export async function changeStaffEmail(userId: string, newEmail: string): Promise<ActionResult> {
  if (!(await callerIsManager())) {
    return { ok: false, message: "Only managers can change sign-in emails." };
  }

  const parsed = changeEmailSchema.safeParse(newEmail);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }

  const admin = createAdminClient();

  // Guard against colliding with another existing login's email, which would
  // otherwise surface as an opaque error.
  const existing = await findUserIdByEmail(admin, parsed.data);
  if (existing && existing !== userId) {
    return { ok: false, message: "Another login already uses that email." };
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    email: parsed.data,
    email_confirm: true,
  });
  if (error) return { ok: false, message: "Couldn't update that email. Please try again." };

  revalidatePath("/admin/staff");
  return { ok: true };
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
//
// For a staff member this leaves their inactive `trainers` row behind, with
// their workbook answers and documents still attached to it. That is
// deliberate: deleting it would cascade both away, and an inactive roster row
// with no login is exactly how a departed PT is already represented. It stops
// showing on /admin/development, which lists profiles rather than roster rows.
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
