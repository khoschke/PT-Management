// Daily check for compliance documents approaching or past their expiry date.
// Sends reminders to both the trainer and the PT Manager at 60, 30 and 7 days
// out, then a daily alert once a document has lapsed, until a replacement with a
// later expiry is uploaded. Triggered by Vercel Cron (see vercel.json).
//
// A no-op if email isn't configured, so the rest of the app is unaffected.
// Idempotent: every reminder sent is logged in document_reminders, so running
// the cron more than once a day never double-sends.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  daysUntilExpiry,
  reminderDecision,
  supersededDocumentIds,
  type ReminderMilestone,
} from "@/lib/documents";
import { emailEnabled, sendDocumentExpiryReminder } from "@/lib/email";
import { isAuthorisedCronRequest } from "@/lib/cron";
import type { TrainerDocument } from "@/lib/types";

type ReminderDocument = TrainerDocument & {
  trainer: { name: string; email: string | null } | null;
  document_type: { label: string } | null;
};

export async function GET(request: Request) {
  if (!isAuthorisedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const managerEmail = process.env.PT_MANAGER_EMAIL;
  if (!emailEnabled || !managerEmail) {
    return NextResponse.json({ skipped: true, reason: "Email not configured" });
  }

  const supabase = createAdminClient();

  // Only non-rejected documents that carry an expiry date can trigger reminders.
  const { data: documents, error } = await supabase
    .from("trainer_documents")
    .select("*, trainer:trainers(name, email), document_type:document_types(label)")
    .not("expiry_date", "is", null)
    .neq("status", "rejected")
    .returns<ReminderDocument[]>();

  if (error || !documents) {
    return NextResponse.json({ error: "Could not load documents" }, { status: 500 });
  }

  const { data: reminders } = await supabase
    .from("document_reminders")
    .select("document_id, milestone, sent_on");

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // What has already been reminded: pre-expiry milestones ever, expired today.
  const sentMilestones = new Map<string, Set<string>>();
  const expiredSentToday = new Set<string>();
  for (const r of reminders ?? []) {
    if (r.milestone === "expired") {
      if (r.sent_on === todayStr) expiredSentToday.add(r.document_id);
    } else {
      const set = sentMilestones.get(r.document_id) ?? new Set<string>();
      set.add(r.milestone);
      sentMilestones.set(r.document_id, set);
    }
  }

  // Supersession is per trainer: a renewed document silences the old one.
  const byTrainer = new Map<string, ReminderDocument[]>();
  for (const doc of documents) {
    const list = byTrainer.get(doc.trainer_id) ?? [];
    list.push(doc);
    byTrainer.set(doc.trainer_id, list);
  }
  const superseded = new Set<string>();
  for (const docs of byTrainer.values()) {
    for (const id of supersededDocumentIds(docs)) superseded.add(id);
  }

  let sent = 0;
  const rowsToLog: { document_id: string; milestone: ReminderMilestone; sent_on: string }[] = [];

  for (const doc of documents) {
    if (superseded.has(doc.id) || !doc.expiry_date) continue;

    const days = daysUntilExpiry(doc.expiry_date, now);
    const decision = reminderDecision(
      days,
      sentMilestones.get(doc.id) ?? new Set<string>(),
      expiredSentToday.has(doc.id),
    );
    if (!decision.send) continue;

    const typeLabel = doc.document_type?.label ?? "Document";
    const label = doc.custom_label ? `${typeLabel} — ${doc.custom_label}` : typeLabel;

    await sendDocumentExpiryReminder([doc.trainer?.email, managerEmail], {
      trainerName: doc.trainer?.name ?? "A trainer",
      documentLabel: label,
      expiryDate: doc.expiry_date,
      expired: decision.send === "expired",
      daysRemaining: Math.max(days, 0),
    });
    sent += 1;

    for (const milestone of decision.record) {
      rowsToLog.push({ document_id: doc.id, milestone, sent_on: todayStr });
    }
  }

  // Log what went out so tomorrow's run doesn't repeat it. The read-based
  // decision above already skips anything sent, so on a same-day re-run this
  // list is empty; the unique indexes are a final backstop against races.
  if (rowsToLog.length > 0) {
    const { error: logError } = await supabase.from("document_reminders").insert(rowsToLog);
    if (logError) console.error("Could not log document reminders", logError);
  }

  return NextResponse.json({ sent, checked: documents.length });
}
