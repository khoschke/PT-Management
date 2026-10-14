"use server";

// PT setup checklist actions.
//
// Every one of these is manager-only. RLS enforces it too (0017 gives all
// three tables an is_manager() policy and nothing else), but each action says
// so itself so a policy change cannot silently hand the checklist to a
// trainer. The checklist carries commercial terms, so that belt and braces is
// the point rather than ceremony. See the figure rule in CLAUDE.md.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { callerIsManager, getCurrentUser } from "@/lib/auth";
import { getSetupChecklistItems } from "@/lib/setup";
import type { SetupItemState } from "@/lib/types";
import type { ActionResult } from "../state";
import type { SetupHeaderFormState } from "./state";

const ITEM_STATES = ["pending", "done", "not_applicable"] as const;

// Recompute the completion stamp from the rows as they now stand.
//
// Done in the action rather than in a database trigger so the rule sits next
// to the code that renders it, and so "complete" means exactly what the screen
// shows: every ACTIVE template item settled. A trigger would have to re-derive
// which items are active on every write, and would quietly disagree with the
// screen the day an item is retired.
//
// Not applicable counts as settled. An item the manager has ruled out is a
// decision, not an omission.
async function restampCompletion(trainerId: string): Promise<void> {
  const supabase = await createClient();

  const items = await getSetupChecklistItems(supabase);
  const { data: rows } = await supabase
    .from("trainer_setup_checklist_items")
    .select("item_id, state")
    .eq("trainer_id", trainerId)
    .returns<{ item_id: string; state: SetupItemState }[]>();

  const states = new Map((rows ?? []).map((r) => [r.item_id, r.state]));
  const complete =
    items.length > 0 &&
    items.every((item) => {
      const state = states.get(item.id) ?? "pending";
      return state === "done" || state === "not_applicable";
    });

  const { data: header } = await supabase
    .from("trainer_setup_checklists")
    .select("completed_at")
    .eq("trainer_id", trainerId)
    .maybeSingle<{ completed_at: string | null }>();

  const alreadyStamped = header?.completed_at != null;
  if (complete === alreadyStamped) return;

  await supabase
    .from("trainer_setup_checklists")
    .update({
      completed_at: complete ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("trainer_id", trainerId);
}

// Make sure the header row exists before anything is written against it. The
// checklist is created lazily, on first use, rather than for every trainer on
// the roster the day this ships.
async function ensureHeader(trainerId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("trainer_setup_checklists")
    .upsert({ trainer_id: trainerId }, { onConflict: "trainer_id", ignoreDuplicates: true });
}

const setItemSchema = z.object({
  trainerId: z.string().uuid(),
  itemId: z.string().uuid(),
  state: z.enum(ITEM_STATES),
});

export async function setSetupItemState(
  trainerId: string,
  itemId: string,
  state: SetupItemState,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (user?.profile?.role !== "manager") {
    return { ok: false, message: "Only managers can tick off setup items." };
  }

  const parsed = setItemSchema.safeParse({ trainerId, itemId, state });
  if (!parsed.success) return { ok: false, message: "That tick didn't make sense." };

  await ensureHeader(parsed.data.trainerId);

  const supabase = await createClient();
  const { error } = await supabase.from("trainer_setup_checklist_items").upsert(
    {
      trainer_id: parsed.data.trainerId,
      item_id: parsed.data.itemId,
      state: parsed.data.state,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "trainer_id,item_id" },
  );

  if (error) {
    console.error("Set setup item state failed", error);
    return { ok: false, message: "Couldn't save that. Please try again." };
  }

  await restampCompletion(parsed.data.trainerId);

  revalidatePath("/admin/setup");
  revalidatePath(`/admin/setup/${parsed.data.trainerId}`);
  return { ok: true };
}

const noteSchema = z.object({
  trainerId: z.string().uuid(),
  itemId: z.string().uuid(),
  note: z.string().trim().max(2000, "Keep the note under 2000 characters"),
});

export async function setSetupItemNote(
  trainerId: string,
  itemId: string,
  note: string,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (user?.profile?.role !== "manager") {
    return { ok: false, message: "Only managers can edit setup notes." };
  }

  const parsed = noteSchema.safeParse({ trainerId, itemId, note });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Couldn't save that note." };
  }

  await ensureHeader(parsed.data.trainerId);

  const supabase = await createClient();
  // Upsert rather than update: a note can be the first thing written against
  // an item ("waiting on ABN" before it is ticked), and the row may not exist.
  const { error } = await supabase.from("trainer_setup_checklist_items").upsert(
    {
      trainer_id: parsed.data.trainerId,
      item_id: parsed.data.itemId,
      note: parsed.data.note,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "trainer_id,item_id" },
  );

  if (error) {
    console.error("Set setup item note failed", error);
    return { ok: false, message: "Couldn't save that note. Please try again." };
  }

  revalidatePath(`/admin/setup/${parsed.data.trainerId}`);
  return { ok: true };
}

// The header: start date and amendments.
//
// start_date is what the rent ramp is computed from. There is no rent amount
// anywhere in this form, and deliberately no per-trainer rent figure in the
// schema: that is a term of their contract. See CLAUDE.md.
const headerSchema = z.object({
  // Empty clears it, which is a legitimate state: a checklist can be opened
  // before anybody knows the start date.
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a real date")
    .optional()
    .or(z.literal("")),
  amendments: z.string().trim().max(5000, "Keep amendments under 5000 characters"),
});

export async function saveSetupHeader(
  trainerId: string,
  _prev: SetupHeaderFormState,
  formData: FormData,
): Promise<SetupHeaderFormState> {
  if (!(await callerIsManager())) {
    return { status: "error", message: "Only managers can edit a setup checklist." };
  }

  const parsed = headerSchema.safeParse({
    startDate: formData.get("startDate")?.toString() ?? "",
    amendments: formData.get("amendments")?.toString() ?? "",
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
  const { error } = await supabase.from("trainer_setup_checklists").upsert(
    {
      trainer_id: trainerId,
      start_date: parsed.data.startDate || null,
      amendments: parsed.data.amendments,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "trainer_id" },
  );

  if (error) {
    console.error("Save setup header failed", error);
    return { status: "error", message: "Something went wrong saving that." };
  }

  revalidatePath("/admin/setup");
  revalidatePath(`/admin/setup/${trainerId}`);
  return { status: "success" };
}
