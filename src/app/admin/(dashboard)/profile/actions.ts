"use server";

// A trainer editing their own profile. Three things keep this to the caller's
// own row and to the fields they own:
//
//   1. The trainer id comes from the signed-in user's profile, never from the
//      form, so there is no id for a caller to tamper with.
//   2. `trainers_update_self` (migration 0010) scopes the UPDATE to the row
//      matching my_trainer_id() at the database level.
//   3. The `trainers_guard_self_update` trigger rejects a non-manager update
//      that touches anything but bio, specialties and AM/PM availability.
//
// The manager's roster editor (trainers/actions.ts) is untouched and still
// edits everyone, every field.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { GOAL_OPTIONS } from "@/lib/goals";
import type { ProfileFormState } from "./state";

const GOAL_CODES = GOAL_OPTIONS.map((g) => g.code) as [string, ...string[]];

const myProfileSchema = z
  .object({
    specialties: z.array(z.enum(GOAL_CODES)).max(GOAL_OPTIONS.length).optional().default([]),
    bio: z.string().trim().max(1000, "Keep this under 1000 characters").optional().or(z.literal("")),
    available_am: z.boolean(),
    available_pm: z.boolean(),
  });

// Both slots off is deliberately allowed: it's how a trainer says "my book is
// full, don't send me new leads". suggestTrainer drops them from the pool and
// the public form hides them, so it does what it says. The manager can still
// allocate to them by hand.

export async function updateMyProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  const trainerId = user?.profile?.trainer_id;

  if (!trainerId) {
    return {
      status: "error",
      message: "Your login isn't linked to a trainer profile yet. Ask the PT Manager to link it on the Staff screen.",
    };
  }

  const parsed = myProfileSchema.safeParse({
    specialties: formData.getAll("specialties").map((s) => s.toString()),
    bio: formData.get("bio")?.toString() ?? "",
    available_am: formData.get("available_am") != null,
    available_pm: formData.get("available_pm") != null,
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
  // Selecting the row back is what makes "Saved" honest. An update that RLS
  // matches to no row is not an error, it just changes nothing — so without
  // this a trainer whose row had gone would be told their profile saved.
  const { data: saved, error } = await supabase
    .from("trainers")
    .update({
      specialties: parsed.data.specialties,
      bio: parsed.data.bio || null,
      available_am: parsed.data.available_am,
      available_pm: parsed.data.available_pm,
    })
    .eq("id", trainerId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Update own trainer profile failed", error);
    return { status: "error", message: "Something went wrong saving your profile. Please try again." };
  }

  if (!saved) {
    return {
      status: "error",
      message: "We couldn't find your trainer profile to save. Ask the PT Manager to check your login on the Staff screen.",
    };
  }

  revalidatePath("/admin/profile");
  // The roster and the lead board both read specialties and availability, so
  // refresh them too.
  revalidatePath("/admin/trainers");
  revalidatePath("/admin");

  return { status: "success", message: "Saved. Your profile is up to date." };
}
