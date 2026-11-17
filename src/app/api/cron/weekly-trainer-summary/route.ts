// Monday 7am Brisbane: each active trainer gets their own active leads, with
// the PT Manager CC'd. Triggered by Vercel Cron, see vercel.json (Sunday 21:00
// UTC, as Brisbane has no daylight saving). A no-op if RESEND_API_KEY or
// PT_MANAGER_EMAIL aren't set.
//
// "Active" is everything not closed: Converted, Not interested and Unreachable
// are left out (Karl, 17 Nov 2026). Inactive roster rows, which is what staff
// on the development pathway have, get nothing.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailEnabled, sendTrainerWeeklySummary, type WeeklySummaryLead } from "@/lib/email";
import { isAuthorisedCronRequest } from "@/lib/cron";
import { CLOSED_LEAD_STATUSES, type Lead, type Trainer } from "@/lib/types";

type LeadSlice = Pick<Lead, "id" | "name" | "status" | "allocated_trainer_id" | "allocated_at" | "last_contacted_at">;

export async function GET(request: Request) {
  if (!isAuthorisedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const managerEmail = process.env.PT_MANAGER_EMAIL;
  if (!emailEnabled || !managerEmail) {
    return NextResponse.json({ skipped: true, reason: "Email not configured" });
  }

  const supabase = createAdminClient();

  const { data: trainers, error: trainerError } = await supabase
    .from("trainers")
    .select("id, name, email")
    .eq("active", true)
    .not("email", "is", null)
    .returns<Pick<Trainer, "id" | "name" | "email">[]>();

  const { data: leads, error: leadError } = await supabase
    .from("leads")
    .select("id, name, status, allocated_trainer_id, allocated_at, last_contacted_at")
    .is("deleted_at", null)
    .not("allocated_trainer_id", "is", null)
    .not("status", "in", `(${CLOSED_LEAD_STATUSES.map((s) => `"${s}"`).join(",")})`)
    .returns<LeadSlice[]>();

  if (trainerError || leadError || !trainers || !leads) {
    return NextResponse.json({ error: "Could not load trainers or leads" }, { status: 500 });
  }

  // When each Attended lead got there, for the "decision pending" flag.
  const attendedIds = leads.filter((l) => l.status === "Attended").map((l) => l.id);
  const attendedAt = new Map<string, string>();
  if (attendedIds.length > 0) {
    const { data: history } = await supabase
      .from("status_history")
      .select("lead_id, changed_at")
      .eq("new_status", "Attended")
      .in("lead_id", attendedIds)
      .returns<{ lead_id: string; changed_at: string }[]>();
    for (const h of history ?? []) {
      const seen = attendedAt.get(h.lead_id);
      if (!seen || h.changed_at > seen) attendedAt.set(h.lead_id, h.changed_at);
    }
  }

  const results: { trainer: string; leads: number; sent: boolean }[] = [];

  for (const [i, trainer] of trainers.entries()) {
    // Resend's free tier allows two requests a second.
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, 600));

    const own: WeeklySummaryLead[] = leads
      .filter((l) => l.allocated_trainer_id === trainer.id)
      .map((l) => ({
        name: l.name,
        status: l.status,
        allocatedAt: l.allocated_at,
        lastContactedAt: l.last_contacted_at,
        attendedAt: attendedAt.get(l.id) ?? null,
      }));

    try {
      await sendTrainerWeeklySummary(trainer, managerEmail, own);
      results.push({ trainer: trainer.name, leads: own.length, sent: true });
    } catch (err) {
      // One trainer's failure shouldn't stop everyone else's.
      console.error(err);
      results.push({ trainer: trainer.name, leads: own.length, sent: false });
    }
  }

  return NextResponse.json({ results });
}
