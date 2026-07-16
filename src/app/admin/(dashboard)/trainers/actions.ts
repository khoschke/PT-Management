"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { GOAL_OPTIONS } from "@/lib/goals";

const GOAL_CODES = GOAL_OPTIONS.map((g) => g.code) as [string, ...string[]];

const trainerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Enter a valid email address").max(320).optional().or(z.literal("")),
  gender: z.enum(["male", "female"]),
  availability: z.enum(["AM", "PM", "both"]),
  specialties: z.array(z.enum(GOAL_CODES)).optional().default([]),
});

export interface TrainerFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialTrainerFormState: TrainerFormState = { status: "idle" };

function parseTrainerForm(formData: FormData) {
  return trainerSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    gender: formData.get("gender")?.toString(),
    availability: formData.get("availability")?.toString(),
    specialties: formData.getAll("specialties").map((s) => s.toString()),
  });
}

export async function addTrainer(
  _prevState: TrainerFormState,
  formData: FormData,
): Promise<TrainerFormState> {
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
    availability: parsed.data.availability,
    specialties: parsed.data.specialties,
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
      availability: parsed.data.availability,
      specialties: parsed.data.specialties,
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
  const supabase = await createClient();
  const { error } = await supabase.from("trainers").update({ active }).eq("id", trainerId);
  if (error) return { ok: false };
  revalidatePath("/admin/trainers");
  revalidatePath("/admin");
  return { ok: true };
}
