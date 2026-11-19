"use server";

// Bulk import of unverified leads from GymMaster's New Members report, so the
// weekly list goes straight into the portal instead of a Google Sheet (change
// list, Batch 2). Manager only.
//
// Two steps, so nothing is saved until the PT Manager has seen the list:
//   preview: parse, drop anyone already in the portal, suggest a trainer each.
//   import:  check again, save as unverified and allocated, email each trainer
//            once with their new leads.
//
// "Already in the portal" means any lead with the same phone (last nine
// digits) or email, whatever its status and including removed ones. That is
// what keeps out a member who already filled in the form, and a member who
// said STOP: once a lead is closed as Not interested they can't be imported
// back in.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { callerIsManager } from "@/lib/auth";
import { suggestTrainer, isAcceptingLeads, type TrainerWithLoad } from "@/lib/allocation";
import { sendTrainerUnverifiedBatchEmail } from "@/lib/email";
import { parseNewMembersReport, phoneKey } from "@/lib/gymmasterImport";
import { auPhoneSchema } from "@/lib/validation";
import { ACTIVE_LOAD_STATUSES, type Lead, type Trainer } from "@/lib/types";
import type { ImportItem, ImportResult, PreviewResult, PreviewRow } from "./state";

const MAX_ROWS = 200;

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function existingKeys(supabase: Supabase) {
  const { data } = await supabase.from("leads").select("phone, email");
  const phones = new Set<string>();
  const emails = new Set<string>();
  for (const l of data ?? []) {
    if (l.phone) phones.add(phoneKey(l.phone));
    if (l.email) emails.add(l.email.trim().toLowerCase());
  }
  return { phones, emails };
}

async function trainersWithLoad(supabase: Supabase): Promise<TrainerWithLoad[]> {
  const [{ data: trainers }, { data: leads }] = await Promise.all([
    supabase.from("trainers").select("*").eq("active", true).order("name").returns<Trainer[]>(),
    supabase.from("leads").select("allocated_trainer_id, status").is("deleted_at", null),
  ]);
  const load: Record<string, number> = {};
  for (const l of leads ?? []) {
    if (l.allocated_trainer_id && ACTIVE_LOAD_STATUSES.includes(l.status)) {
      load[l.allocated_trainer_id] = (load[l.allocated_trainer_id] ?? 0) + 1;
    }
  }
  return (trainers ?? []).map((t) => ({ ...t, currentLoad: load[t.id] ?? 0 }));
}

function normalisedPhone(raw: string): string | null {
  const parsed = auPhoneSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function previewUnverifiedImport(csvText: string): Promise<PreviewResult> {
  if (!(await callerIsManager())) return { ok: false, message: "Only managers can import leads." };

  const parsed = parseNewMembersReport(csvText);
  if ("error" in parsed) return { ok: false, message: parsed.error };
  if (parsed.rows.length > MAX_ROWS) {
    return { ok: false, message: `That's ${parsed.rows.length} rows. Import ${MAX_ROWS} or fewer at a time.` };
  }

  const supabase = await createClient();
  const [{ phones, emails }, trainers] = await Promise.all([existingKeys(supabase), trainersWithLoad(supabase)]);

  const seen = new Set<string>();
  const rows: PreviewRow[] = parsed.rows.map((r) => {
    const phone = normalisedPhone(r.phone);
    const email = r.email.toLowerCase();
    const base = { ...r, phone: phone ?? r.phone, suggestedTrainerId: null };

    if (!phone || !r.name) return { ...base, status: "no_phone" };
    if (phones.has(phoneKey(phone)) || (email && emails.has(email))) return { ...base, status: "in_portal" };
    if (seen.has(phoneKey(phone))) return { ...base, status: "repeated_in_file" };
    seen.add(phoneKey(phone));

    // No goals or preferences on a cold lead, so this comes down to who is
    // taking leads and has the lightest load. Count each suggestion as it is
    // made, so ten new members spread across the team instead of all landing
    // on whoever was lightest at the start.
    const suggestion = suggestTrainer(
      { preferred_trainer_id: null, gender_preference: null, time_preference: null, goals: [] },
      trainers,
    );
    if (suggestion) suggestion.trainer.currentLoad += 1;
    return { ...base, status: "ready", suggestedTrainerId: suggestion?.trainer.id ?? null };
  });

  return {
    ok: true,
    rows,
    trainers: trainers.map((t) => ({ id: t.id, name: t.name, paused: !isAcceptingLeads(t) })),
  };
}

function joinedNote(item: ImportItem): string {
  const parts = ["From the GymMaster New Members report."];
  const date = item.joined ? new Date(`${item.joined}T00:00:00`) : null;
  if (date && !Number.isNaN(date.getTime())) {
    parts.push(`Joined ${date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}.`);
  }
  if (item.membership) parts.push(`Membership: ${item.membership}.`);
  return parts.join(" ");
}

export async function importUnverifiedLeads(items: ImportItem[]): Promise<ImportResult> {
  if (!(await callerIsManager())) return { ok: false, message: "Only managers can import leads." };
  if (items.length === 0) return { ok: false, message: "Nothing to import." };
  if (items.length > MAX_ROWS) return { ok: false, message: `Import ${MAX_ROWS} or fewer at a time.` };

  const supabase = await createClient();
  const [{ phones, emails }, trainers] = await Promise.all([existingKeys(supabase), trainersWithLoad(supabase)]);
  const trainerById = new Map(trainers.map((t) => [t.id, t]));

  // Check again: someone may have filled in the form, or been added by hand,
  // between the preview and the click.
  const skipped: string[] = [];
  const toInsert = [];
  const seen = new Set<string>();
  for (const item of items) {
    const phone = normalisedPhone(item.phone);
    const email = item.email.trim().toLowerCase();
    if (!phone || !item.name.trim() || !trainerById.has(item.trainerId)) {
      skipped.push(item.name || item.phone);
      continue;
    }
    if (phones.has(phoneKey(phone)) || (email && emails.has(email)) || seen.has(phoneKey(phone))) {
      skipped.push(item.name);
      continue;
    }
    seen.add(phoneKey(phone));
    toInsert.push({
      name: item.name.trim().slice(0, 200),
      phone,
      email: email || null,
      goals: [],
      lead_source: "unverified" as const,
      status: "Allocated" as const,
      allocated_trainer_id: item.trainerId,
      notes: joinedNote(item),
    });
  }

  if (toInsert.length === 0) {
    return { ok: false, message: "Everyone on that list is already in the portal, so nothing was added." };
  }

  const { data: inserted, error } = await supabase.from("leads").insert(toInsert).select("*").returns<Lead[]>();
  if (error || !inserted) return { ok: false, message: "Couldn't save those leads. Nothing was added. Please try again." };

  const byTrainer = new Map<string, Lead[]>();
  for (const lead of inserted) {
    if (!lead.allocated_trainer_id) continue;
    byTrainer.set(lead.allocated_trainer_id, [...(byTrainer.get(lead.allocated_trainer_id) ?? []), lead]);
  }

  // One email per trainer, sent one after another: Resend's rate limit is
  // per second, and a burst of five would trip it.
  const perTrainer: { name: string; count: number }[] = [];
  for (const [trainerId, leads] of byTrainer) {
    const trainer = trainerById.get(trainerId)!;
    perTrainer.push({ name: trainer.name, count: leads.length });
    try {
      await sendTrainerUnverifiedBatchEmail(trainer, leads);
    } catch (err) {
      console.error("Unverified batch email failed", err);
    }
    await new Promise((r) => setTimeout(r, 600));
  }

  revalidatePath("/admin");
  return { ok: true, added: inserted.length, skipped, perTrainer };
}
