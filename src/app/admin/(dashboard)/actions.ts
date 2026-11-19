"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { callerIsManager } from "@/lib/auth";
import { sendTrainerAllocationEmail } from "@/lib/email";
import { ownLeadSchema, sweepLeadSchema } from "@/lib/validation";
import { MANUAL_LEAD_SOURCES, type LeadStatus, type ManualLeadSource } from "@/lib/types";
import type { ActionResult, AddSweepLeadState } from "./state";

// Allocation, deletion and manual lead entry are the manager's alone. RLS already
// refuses them for a trainer; the explicit check means a future policy change
// can't quietly open them up. updateLeadStatus and updateLeadNotes below stay
// on RLS on purpose — trainers use both on their own leads.

export async function allocateLead(leadId: string, trainerId: string): Promise<ActionResult> {
  if (!(await callerIsManager())) {
    return { ok: false, message: "Only managers can allocate leads." };
  }

  const supabase = await createClient();

  const { data: lead, error: fetchError } = await supabase
    .from("leads")
    .select("status")
    .eq("id", leadId)
    .single();

  if (fetchError || !lead) return { ok: false, message: "Lead not found." };

  const nextStatus: LeadStatus = lead.status === "New" ? "Allocated" : lead.status;

  const { error } = await supabase
    .from("leads")
    .update({ allocated_trainer_id: trainerId, status: nextStatus })
    .eq("id", leadId);

  if (error) return { ok: false, message: "Couldn't allocate that lead. Please try again." };

  const { data: fullLead } = await supabase.from("leads").select("*").eq("id", leadId).single();
  const { data: trainer } = await supabase.from("trainers").select("*").eq("id", trainerId).single();

  if (fullLead && trainer) {
    try {
      await sendTrainerAllocationEmail(trainer, fullLead);
    } catch (err) {
      console.error("Trainer allocation email failed", err);
    }
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);

  if (error) return { ok: false, message: dbMessage(error, "Couldn't update that status. Please try again.") };

  revalidatePath("/admin");
  return { ok: true };
}

// A follow-up that changes no status (a second call, a reminder text) still
// counts as contact, so the trainer's last contacted date stays honest. A lead
// still on Allocated moves to Contacted, because that is what Contacted means.
// Stays on RLS like updateLeadStatus: trainers log contact on their own leads.
export async function logLeadContact(leadId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: lead, error: fetchError } = await supabase
    .from("leads")
    .select("status")
    .eq("id", leadId)
    .single();

  if (fetchError || !lead) return { ok: false, message: "Lead not found." };

  const update: { last_contacted_at: string; status?: LeadStatus } = {
    last_contacted_at: new Date().toISOString(),
  };
  if (lead.status === "Allocated") update.status = "Contacted";

  const { error } = await supabase.from("leads").update(update).eq("id", leadId);

  if (error) return { ok: false, message: "Couldn't log that contact. Please try again." };

  revalidatePath("/admin");
  return { ok: true };
}

export async function updateLeadNotes(leadId: string, notes: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ notes }).eq("id", leadId);

  if (error) return { ok: false, message: "Couldn't save that note. Please try again." };

  revalidatePath("/admin");
  return { ok: true };
}

export async function softDeleteLead(leadId: string): Promise<ActionResult> {
  if (!(await callerIsManager())) {
    return { ok: false, message: "Only managers can remove leads." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", leadId);

  if (error) return { ok: false, message: "Couldn't remove that lead. Please try again." };

  revalidatePath("/admin");
  return { ok: true };
}

export async function hardDeleteLead(leadId: string): Promise<ActionResult> {
  if (!(await callerIsManager())) {
    return { ok: false, message: "Only managers can permanently delete leads." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", leadId);

  if (error) return { ok: false, message: "Couldn't permanently delete that lead." };

  revalidatePath("/admin");
  return { ok: true };
}

// Re-sorts a hand-added lead between Flagged and Unverified. Form leads are left
// alone: that source records that the member asked for PT themselves, and it is
// the only one the public form can create.
export async function updateLeadSource(leadId: string, source: string): Promise<ActionResult> {
  if (!(await callerIsManager())) {
    return { ok: false, message: "Only managers can change a lead's type." };
  }
  if (!(MANUAL_LEAD_SOURCES as readonly string[]).includes(source)) {
    return { ok: false, message: "Choose flagged or unverified." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ lead_source: source as ManualLeadSource })
    .eq("id", leadId)
    .in("lead_source", [...MANUAL_LEAD_SOURCES]);

  if (error) return { ok: false, message: "Couldn't change the lead type. Please try again." };

  revalidatePath("/admin");
  return { ok: true };
}

export async function addSweepLead(
  _prevState: AddSweepLeadState,
  formData: FormData,
): Promise<AddSweepLeadState> {
  if (!(await callerIsManager())) {
    return { status: "error", message: "Only managers can add leads." };
  }

  const raw = {
    name: formData.get("name")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    email: formData.get("email")?.toString() || undefined,
    date_of_birth: formData.get("date_of_birth")?.toString() || undefined,
    goals: formData.getAll("goals").map((g) => g.toString()),
    lead_source: formData.get("lead_source")?.toString() ?? "",
    goal_other: formData.get("goal_other")?.toString() || undefined,
    current_exercise: formData.get("current_exercise")?.toString() || undefined,
    gender_preference: formData.get("gender_preference")?.toString() || undefined,
    time_preference: formData.get("time_preference")?.toString() || undefined,
    preferred_trainer_id: formData.get("preferred_trainer_id")?.toString() || undefined,
    contact_preference: formData.get("contact_preference")?.toString() || undefined,
  };

  const parsed = sweepLeadSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    date_of_birth: parsed.data.date_of_birth || null,
    goals: parsed.data.goals ?? [],
    goal_other: parsed.data.goal_other || null,
    current_exercise: parsed.data.current_exercise || null,
    gender_preference: parsed.data.gender_preference || null,
    time_preference: parsed.data.time_preference || null,
    preferred_trainer_id: parsed.data.preferred_trainer_id || null,
    contact_preference: parsed.data.contact_preference || null,
    lead_source: parsed.data.lead_source,
    status: "New",
  });

  if (error) {
    console.error("Manual lead insert failed", error);
    return { status: "error", message: "Something went wrong saving that lead. Please try again." };
  }

  revalidatePath("/admin");
  return { status: "success" };
}

// A trainer adds a lead they found themselves (Part 7 amendments, item 8).
// Everything goes through add_own_lead() in the database, which allocates the
// lead to the caller and refuses a phone number already in the portal without
// saying who has it. No allocation email: the trainer added it.
export async function addOwnLead(
  _prevState: AddSweepLeadState,
  formData: FormData,
): Promise<AddSweepLeadState> {
  const parsed = ownLeadSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    email: formData.get("email")?.toString() || undefined,
    goals: formData.getAll("goals").map((g) => g.toString()),
    found_via: formData.get("found_via")?.toString() ?? "",
    found_via_other: formData.get("found_via_other")?.toString() || undefined,
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
  const { data, error } = await supabase.rpc("add_own_lead", {
    p_name: parsed.data.name,
    p_phone: parsed.data.phone,
    p_email: parsed.data.email || null,
    p_goals: parsed.data.goals ?? [],
    p_found_via: parsed.data.found_via,
    p_found_via_other: parsed.data.found_via_other || null,
  });

  if (error) {
    console.error("add_own_lead failed", error);
    return { status: "error", message: "Something went wrong saving that lead. Please try again." };
  }

  const result = data as { ok: boolean; reason?: string } | null;
  if (!result?.ok) {
    if (result?.reason === "duplicate") {
      return {
        status: "error",
        message: "This member's already in the portal. Check with the PT Manager.",
        fieldErrors: { phone: "Already in the portal" },
      };
    }
    if (result?.reason === "not_trainer") {
      return { status: "error", message: "Only trainers can add their own leads." };
    }
    return { status: "error", message: "Please check the details and try again." };
  }

  revalidatePath("/admin");
  return { status: "success" };
}

// ---------------------------------------------------------------------------
// 2-2-2 follow-ups and the 48-hour clock on a no (Part 7 amendments, item 11).
// The database enforces the rules (0022_follow_ups.sql): a timer close can't be
// undone by a trainer, and a lead that opted out can't be reopened. These
// actions pass its messages straight through.
// ---------------------------------------------------------------------------

function dbMessage(error: { message?: string } | null, fallback: string): string {
  const msg = error?.message ?? "";
  return /48-hour timer|opted out|PT Manager can reopen/.test(msg) ? msg : fallback;
}

/** The due 2-2-2 touch has been sent: log it and schedule the next one. */
export async function completeFollowUp(leadId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("complete_follow_up", { p_lead_id: leadId });
  if (error) return { ok: false, message: "Couldn't log that follow-up. Please try again." };
  if (!(data as { ok: boolean } | null)?.ok) return { ok: false, message: "There's no follow-up due on this lead." };
  revalidatePath("/admin");
  return { ok: true };
}

/** Starts the 2-2-2 for a lead that was contacted before follow-ups existed. */
export async function startFollowUps(leadId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ follow_up_step: 1, next_follow_up_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() })
    .eq("id", leadId)
    .eq("status", "Contacted")
    .is("follow_up_step", null);
  if (error) return { ok: false, message: "Couldn't start the follow-ups. Please try again." };
  revalidatePath("/admin");
  return { ok: true };
}

/** What happened with the permission question on a Said no lead. "Leave it"
 *  goes through closeLeadNotInterested, so it gets the same confirm and note. */
export async function recordPermissionAnswer(leadId: string, answer: "yes" | "asked_by_text"): Promise<ActionResult> {
  const supabase = await createClient();
  const update =
    answer === "yes"
      ? { status: "Agreed to check-in" as LeadStatus }
      : { permission_asked_at: new Date().toISOString() };
  const { error } = await supabase.from("leads").update(update).eq("id", leadId).eq("status", "Said no");
  if (error) return { ok: false, message: dbMessage(error, "Couldn't save that. Please try again.") };
  revalidatePath("/admin");
  return { ok: true };
}

const CLOSE_NOTE_REASONS = {
  ended_by_trainer: "they said no, or asked to be left alone",
  replied_stop: "they replied STOP",
  declined: "they said leave it there when asked about a check-in",
} as const;

/** Every close as Not interested (status dropdown, End communication, "They
 *  said leave it there"), confirmed in a dialog first. Records the reason and
 *  adds a dated note to the top of the lead's notes. */
export async function closeLeadNotInterested(
  leadId: string,
  reason: keyof typeof CLOSE_NOTE_REASONS,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("notes, status").eq("id", leadId).single();
  if (!lead) return { ok: false, message: "Couldn't find that lead." };

  const date = new Date().toLocaleDateString("en-AU", { timeZone: "Australia/Brisbane", day: "numeric", month: "short", year: "numeric" });
  const note = `Communication ended ${date}: ${CLOSE_NOTE_REASONS[reason]}. Contact the PT Manager if this is a mistake.`;
  const notes = lead.notes ? `${note}\n\n${lead.notes}` : note;

  const update: Record<string, unknown> = { status: "Not interested", closed_reason: reason, notes };
  if (reason === "declined") update.permission_asked_at = new Date().toISOString();

  const { error } = await supabase.from("leads").update(update).eq("id", leadId);
  if (error) return { ok: false, message: dbMessage(error, "Couldn't close that lead. Please try again.") };
  revalidatePath("/admin");
  return { ok: true };
}

/** PT Manager only: reopen a lead the 48-hour timer closed. */
export async function reopenTimerClose(
  leadId: string,
  newStatus: "Agreed to check-in" | "Not interested",
  reason: string,
): Promise<ActionResult> {
  if (!(await callerIsManager())) {
    return { ok: false, message: "Only the PT Manager can reopen a lead." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reopen_timer_close", {
    p_lead_id: leadId,
    p_new_status: newStatus,
    p_reason: reason,
  });
  if (error) return { ok: false, message: "Couldn't reopen that lead. Please try again." };
  const result = data as { ok: boolean; reason?: string } | null;
  if (!result?.ok) {
    return {
      ok: false,
      message: result?.reason === "reason_required" ? "Add a short reason for reopening." : "That lead can't be reopened.",
    };
  }
  revalidatePath("/admin");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Post-chat reflections (0023, 0024). Optional, one per lead, editable by its trainer.
// ---------------------------------------------------------------------------

const FEELS = ["well", "mixed", "tough"] as const;
const STALLS = ["nowhere", "engage", "frame", "summarise", "plan", "recommend", "price", "frequency", "other"] as const;
const CERTAINTIES = ["none", "emotional", "logical", "self_belief"] as const;

export async function savePostChatReflection(
  leadId: string,
  input: { feel: string; stalledAt: string | null; missingCertainty: string | null; nextTime: string },
): Promise<ActionResult> {
  if (!(FEELS as readonly string[]).includes(input.feel)) return { ok: false, message: "Pick how it went." };
  if (input.stalledAt && !(STALLS as readonly string[]).includes(input.stalledAt)) return { ok: false, message: "Pick where it stalled." };
  if (input.missingCertainty && !(CERTAINTIES as readonly string[]).includes(input.missingCertainty)) {
    return { ok: false, message: "Pick which certainty was missing." };
  }
  const nextTime = input.nextTime.trim().slice(0, 2000) || null;

  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("allocated_trainer_id").eq("id", leadId).single();
  if (!lead?.allocated_trainer_id) return { ok: false, message: "This lead isn't allocated to a trainer." };

  const answers = {
    skipped: false,
    feel: input.feel,
    stalled_at: input.stalledAt,
    missing_certainty: input.missingCertainty,
    next_time: nextTime,
  };
  // One per lead: edit it if it's there (including a skipped one), else add it.
  const { data: existing } = await supabase.from("post_chat_reflections").select("id").eq("lead_id", leadId).maybeSingle();
  const { error } = existing
    ? await supabase.from("post_chat_reflections").update(answers).eq("id", existing.id)
    : await supabase.from("post_chat_reflections").insert({ lead_id: leadId, trainer_id: lead.allocated_trainer_id, ...answers });
  if (error) return { ok: false, message: "Couldn't save your reflection. Please try again." };
  revalidatePath("/admin");
  return { ok: true };
}

export async function skipPostChatReflection(leadId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("allocated_trainer_id").eq("id", leadId).single();
  if (!lead?.allocated_trainer_id) return { ok: false, message: "This lead isn't allocated to a trainer." };
  const { error } = await supabase
    .from("post_chat_reflections")
    .insert({ lead_id: leadId, trainer_id: lead.allocated_trainer_id, skipped: true });
  if (error && error.code !== "23505") return { ok: false, message: "Couldn't skip it. Please try again." };
  revalidatePath("/admin");
  return { ok: true };
}
