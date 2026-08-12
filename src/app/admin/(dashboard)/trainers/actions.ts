"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { callerIsManager } from "@/lib/auth";
import { GOAL_OPTIONS } from "@/lib/goals";
import type { TrainerFormState } from "./state";

// The whole roster screen is manager-only. RLS enforces that too (the
// trainers write policy is is_manager()), but each action says so itself so a
// policy change can't silently hand the roster to a trainer.

const GOAL_CODES = GOAL_OPTIONS.map((g) => g.code) as [string, ...string[]];

const trainerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200),
    email: z.string().trim().email("Enter a valid email address").max(320).optional().or(z.literal("")),
    gender: z.enum(["male", "female"]),
    available_am: z.boolean(),
    available_pm: z.boolean(),
    specialties: z.array(z.enum(GOAL_CODES)).optional().default([]),
    bio: z.string().trim().max(1000).optional().or(z.literal("")),
  })
  .refine((data) => data.available_am || data.available_pm, {
    message: "Choose at least one — AM, PM, or both.",
    path: ["availability"],
  });

function parseTrainerForm(formData: FormData) {
  return trainerSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    gender: formData.get("gender")?.toString(),
    available_am: formData.get("available_am") != null,
    available_pm: formData.get("available_pm") != null,
    specialties: formData.getAll("specialties").map((s) => s.toString()),
    bio: formData.get("bio")?.toString() ?? "",
  });
}

export async function addTrainer(
  _prevState: TrainerFormState,
  formData: FormData,
): Promise<TrainerFormState> {
  if (!(await callerIsManager())) {
    return { status: "error", message: "Only managers can add trainers." };
  }

  const parsed = parseTrainerForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("trainers").insert({
    name: parsed.data.name,
    email: parsed.data.email || null,
    gender: parsed.data.gender,
    available_am: parsed.data.available_am,
    available_pm: parsed.data.available_pm,
    specialties: parsed.data.specialties,
    bio: parsed.data.bio || null,
    active: true,
  });

  if (error) {
    console.error("Add trainer failed", error);
    return { status: "error", message: "Something went wrong saving that trainer." };
  }

  revalidatePath("/admin/trainers");
  return { status: "success" };
}

export async function updateTrainer(
  trainerId: string,
  _prevState: TrainerFormState,
  formData: FormData,
): Promise<TrainerFormState> {
  if (!(await callerIsManager())) {
    return { status: "error", message: "Only managers can edit trainers." };
  }

  const parsed = parseTrainerForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("trainers")
    .update({
      name: parsed.data.name,
      email: parsed.data.email || null,
      gender: parsed.data.gender,
      available_am: parsed.data.available_am,
      available_pm: parsed.data.available_pm,
      specialties: parsed.data.specialties,
      bio: parsed.data.bio || null,
    })
    .eq("id", trainerId);

  if (error) {
    console.error("Update trainer failed", error);
    return { status: "error", message: "Something went wrong saving that trainer." };
  }

  revalidatePath("/admin/trainers");
  return { status: "success" };
}

export async function setTrainerActive(trainerId: string, active: boolean) {
  if (!(await callerIsManager())) return { ok: false };

  const supabase = await createClient();
  const { error } = await supabase.from("trainers").update({ active }).eq("id", trainerId);
  if (error) return { ok: false };
  revalidatePath("/admin/trainers");
  revalidatePath("/admin");
  return { ok: true };
}
