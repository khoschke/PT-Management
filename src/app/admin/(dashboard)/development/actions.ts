"use server";

// Development goals and the conversation around them.
//
// The ownership rule: a goal belongs to whoever set it. Every write here runs
// as the signed-in user, so RLS is the real gate. `development_goals` has no
// manager write policy at all, which means a manager calling these actions is
// refused by the database, not merely by the UI. These checks exist so the
// refusal is a clear message instead of an opaque permission error.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { MAX_ACTIVE_GOALS } from "@/lib/development";
import type { DevelopmentGoalStatus } from "@/lib/types";
import type { ActionResult } from "../state";
import type { GoalFormState } from "./state";

// The trainer_id of the signed-in person, if they own a development profile.
// Managers get null here: they read and respond, they do not set goals.
async function ownTrainerId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user?.profile || user.profile.role === "manager") return null;
  return user.profile.trainer_id;
}

const goalSchema = z.object({
  title: z.string().trim().min(1, "Give the goal a name").max(200),
  detail: z.string().trim().max(2000).optional().or(z.literal("")),
  targetDate: z.string().trim().optional().or(z.literal("")),
});

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString();
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function addGoal(_prev: GoalFormState, formData: FormData): Promise<GoalFormState> {
  const trainerId = await ownTrainerId();
  if (!trainerId) {
    return { status: "error", message: "Only the person a development profile belongs to can set its goals." };
  }

  const parsed = goalSchema.safeParse({
    title: formData.get("title")?.toString() ?? "",
    detail: formData.get("detail")?.toString() ?? "",
    targetDate: formData.get("targetDate")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const supabase = await createClient();

  // The cap is a coaching guardrail rather than a permission, so it lives here
  // and not in a database trigger. See MAX_ACTIVE_GOALS.
  const { count } = await supabase
    .from("development_goals")
    .select("id", { count: "exact", head: true })
    .eq("trainer_id", trainerId)
    .eq("status", "active");

  if ((count ?? 0) >= MAX_ACTIVE_GOALS) {
    return {
      status: "error",
      message: `You already have ${MAX_ACTIVE_GOALS} goals on the go. Finish one or park it before adding another.`,
    };
  }

  const { error } = await supabase.from("development_goals").insert({
    trainer_id: trainerId,
    title: parsed.data.title,
    detail: parsed.data.detail || "",
    target_date: parsed.data.targetDate || null,
  });
  if (error) {
    console.error("addGoal failed", error);
    return { status: "error", message: "Couldn't save that goal. Try again in a moment." };
  }

  revalidatePath("/admin/development");
  revalidatePath(`/admin/development/${trainerId}`);
  return { status: "success" };
}

export async function updateGoal(
  goalId: string,
  values: { title: string; detail: string; targetDate: string | null },
): Promise<ActionResult> {
  const trainerId = await ownTrainerId();
  if (!trainerId) {
    return { ok: false, message: "Only the person a goal belongs to can change it." };
  }

  const parsed = goalSchema.safeParse({
    title: values.title,
    detail: values.detail,
    targetDate: values.targetDate ?? "",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check that goal." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("development_goals")
    .update({
      title: parsed.data.title,
      detail: parsed.data.detail || "",
      target_date: parsed.data.targetDate || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .eq("trainer_id", trainerId);

  if (error) {
    console.error("updateGoal failed", error);
    return { ok: false, message: "Couldn't save that change." };
  }

  revalidatePath("/admin/development");
  revalidatePath(`/admin/development/${trainerId}`);
  return { ok: true };
}

export async function setGoalStatus(
  goalId: string,
  status: DevelopmentGoalStatus,
): Promise<ActionResult> {
  const trainerId = await ownTrainerId();
  if (!trainerId) {
    return { ok: false, message: "Only the person a goal belongs to can change it." };
  }

  const supabase = await createClient();

  // Re-activating a parked or achieved goal counts against the cap again,
  // otherwise the limit is trivially sidestepped by parking and un-parking.
  if (status === "active") {
    const { count } = await supabase
      .from("development_goals")
      .select("id", { count: "exact", head: true })
      .eq("trainer_id", trainerId)
      .eq("status", "active")
      .neq("id", goalId);

    if ((count ?? 0) >= MAX_ACTIVE_GOALS) {
      return {
        ok: false,
        message: `You already have ${MAX_ACTIVE_GOALS} goals on the go. Finish or park one first.`,
      };
    }
  }

  const { error } = await supabase
    .from("development_goals")
    .update({
      status,
      achieved_at: status === "achieved" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .eq("trainer_id", trainerId);

  if (error) {
    console.error("setGoalStatus failed", error);
    return { ok: false, message: "Couldn't update that goal." };
  }

  revalidatePath("/admin/development");
  revalidatePath(`/admin/development/${trainerId}`);
  return { ok: true };
}

export async function deleteGoal(goalId: string): Promise<ActionResult> {
  const trainerId = await ownTrainerId();
  if (!trainerId) {
    return { ok: false, message: "Only the person a goal belongs to can remove it." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("development_goals")
    .delete()
    .eq("id", goalId)
    .eq("trainer_id", trainerId);

  if (error) {
    console.error("deleteGoal failed", error);
    return { ok: false, message: "Couldn't remove that goal." };
  }

  revalidatePath("/admin/development");
  revalidatePath(`/admin/development/${trainerId}`);
  return { ok: true };
}

// A note is either a comment on one goal (goalId set) or a check-in on the
// person as a whole (goalId null). Both sides post; nobody can post as
// somebody else, because the insert policy pins author_id to auth.uid().
const noteSchema = z.string().trim().min(1, "Write something first").max(4000);

export async function addNote(
  trainerId: string,
  goalId: string | null,
  body: string,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user?.profile) return { ok: false, message: "You need to be signed in." };

  const isManager = user.profile.role === "manager";
  const isOwner = user.profile.trainer_id === trainerId;
  if (!isManager && !isOwner) {
    return { ok: false, message: "You can only write in your own development conversation." };
  }

  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Write something first." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("development_notes").insert({
    trainer_id: trainerId,
    goal_id: goalId,
    body: parsed.data,
    author_id: user.id,
  });

  if (error) {
    console.error("addNote failed", error);
    return { ok: false, message: "Couldn't post that just now. Try again in a moment." };
  }

  revalidatePath("/admin/development");
  revalidatePath(`/admin/development/${trainerId}`);
  return { ok: true };
}

// You may remove your own note and nobody else's. RLS enforces that; this is
// the readable version of the same rule.
export async function deleteNote(noteId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user?.profile) return { ok: false, message: "You need to be signed in." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("development_notes")
    .delete()
    .eq("id", noteId)
    .eq("author_id", user.id);

  if (error) {
    console.error("deleteNote failed", error);
    return { ok: false, message: "Couldn't remove that note." };
  }

  revalidatePath("/admin/development");
  return { ok: true };
}
