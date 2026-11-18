// Daily 7am Brisbane: run the automatic closes, then send each trainer a short
// email only if they have something due today (a 2-2-2 touch, or a no to
// respond to within 48 hours). Part 7 amendments, item 11. Triggered by Vercel
// Cron, see vercel.json. Quiet days send nothing.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorisedCronRequest } from "@/lib/cron";
import { closeExpiredLeads } from "@/lib/closeExpired";
import { emailEnabled, sendTrainerFollowUpReminder } from "@/lib/email";
import { getFollowUpState, needsActionToday } from "@/lib/followUps";
import type { Lead, Trainer } from "@/lib/types";

type LeadSlice = Pick<
  Lead,
  "name" | "status" | "allocated_trainer_id" | "follow_up_step" | "next_follow_up_at" | "said_no_at" | "permission_asked_at"
>;

export async function GET(request: Request) {
  if (!isAuthorisedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const closed = await closeExpiredLeads(supabase);

  if (!emailEnabled) {
    return NextResponse.json({ closed, skipped: true, reason: "Email not configured" });
  }

  const { data: trainers } = await supabase
    .from("trainers")
    .select("id, name, email")
    .eq("active", true)
    .not("email", "is", null)
    .returns<Pick<Trainer, "id" | "name" | "email">[]>();

  const { data: leads } = await supabase
    .from("leads")
    .select("name, status, allocated_trainer_id, follow_up_step, next_follow_up_at, said_no_at, permission_asked_at")
    .is("deleted_at", null)
    .in("status", ["Contacted", "Agreed to check-in", "Said no"])
    .returns<LeadSlice[]>();

  const now = new Date();
  const results: { trainer: string; due: number }[] = [];

  for (const trainer of trainers ?? []) {
    const items = (leads ?? [])
      .filter((l) => l.allocated_trainer_id === trainer.id && needsActionToday(l, now))
      .map((l) => ({ leadName: l.name, label: getFollowUpState(l, now)?.label ?? "" }));
    if (items.length === 0) continue;

    // Resend's free tier allows two requests a second.
    if (results.length > 0) await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      await sendTrainerFollowUpReminder(trainer, items);
      results.push({ trainer: trainer.name, due: items.length });
    } catch (err) {
      console.error(err);
    }
  }

  return NextResponse.json({ closed, results });
}
