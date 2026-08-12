"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { callerIsManager } from "@/lib/auth";
import { sendTrainerAllocationEmail } from "@/lib/email";
import { sweepLeadSchema } from "@/lib/validation";
import type { LeadStatus } from "@/lib/types";
import type { ActionResult, AddSweepLeadState } from "./state";

// Allocation, deletion and sweep entry are the manager's alone. RLS already
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

  if (error) return { ok: false, message: "Couldn't update that status. Please try again." };

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

export async function addSweepLead(
  _prevState: AddSweepLeadState,
  formData: FormData,
): Promise<AddSweepLeadState> {
  if (!(await callerIsManager())) {
    return { status: "error", message: "Only managers can add sweep leads." };
  }

  const raw = {
    name: formData.get("name")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    email: formData.get("email")?.toString() || undefined,
    date_of_birth: formData.get("date_of_birth")?.toString() || undefined,
    goals: formData.getAll("goals").map((g) => g.toString()),
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
    lead_source: "gymmaster_sweep",
    status: "New",
  });

  if (error) {
    console.error("Sweep lead insert failed", error);
    return { status: "error", message: "Something went wrong saving that lead. Please try again." };
  }

  revalidatePath("/admin");
  return { status: "success" };
}
