// Daily 7am AEST digest to the PT Manager: new leads overnight, leads
// approaching the 48 hour breach, and leads already breached. Triggered by
// Vercel Cron, see vercel.json. A no-op if RESEND_API_KEY or PT_MANAGER_EMAIL
// aren't set, so the rest of the app is unaffected either way.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getContactClock } from "@/lib/countdown";
import { emailEnabled, sendManagerDailyDigest } from "@/lib/email";
import { isAuthorisedCronRequest } from "@/lib/cron";
import type { Lead } from "@/lib/types";

export async function GET(request: Request) {
  if (!isAuthorisedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!emailEnabled || !process.env.PT_MANAGER_EMAIL) {
    return NextResponse.json({ skipped: true, reason: "Email not configured" });
  }

  const supabase = createAdminClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .is("deleted_at", null)
    .returns<Lead[]>();

  if (error || !leads) {
    return NextResponse.json({ error: "Could not load leads" }, { status: 500 });
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const newLeads = leads.filter((lead) => new Date(lead.created_at) >= oneDayAgo);
  const overnight = newLeads.map((lead) => ({ name: lead.name, hoursRemaining: 0, source: lead.lead_source }));

  // Leads trainers added themselves overnight, counted per trainer (item 8).
  // found_via is only ever set by add_own_lead(), so it marks them whichever
  // source they saved as (own, or unverified from the unverified list).
  const ownByTrainer = new Map<string, number>();
  for (const lead of newLeads) {
    if (lead.found_via && lead.allocated_trainer_id) {
      ownByTrainer.set(lead.allocated_trainer_id, (ownByTrainer.get(lead.allocated_trainer_id) ?? 0) + 1);
    }
  }
  let ownLeadsAdded: { trainerName: string; count: number }[] = [];
  if (ownByTrainer.size > 0) {
    const { data: trainers } = await supabase
      .from("trainers")
      .select("id, name")
      .in("id", [...ownByTrainer.keys()])
      .returns<{ id: string; name: string }[]>();
    ownLeadsAdded = [...ownByTrainer.entries()].map(([id, count]) => ({
      trainerName: trainers?.find((t) => t.id === id)?.name.split(" ")[0] ?? "A trainer",
      count,
    }));
  }

  const uncontacted = leads.filter((lead) => !lead.first_contacted_at);

  const approachingBreach = uncontacted
    .map((lead) => ({
      name: lead.name,
      source: lead.lead_source,
      clock: getContactClock(lead.first_contact_due_at, lead.first_contacted_at, lead.status, now),
    }))
    .filter((l) => l.clock.band === "amber")
    .map((l) => ({ name: l.name, source: l.source, hoursRemaining: l.clock.hoursRemaining }));

  const breached = uncontacted
    .map((lead) => ({
      name: lead.name,
      source: lead.lead_source,
      clock: getContactClock(lead.first_contact_due_at, lead.first_contacted_at, lead.status, now),
    }))
    .filter((l) => l.clock.band === "red")
    .map((l) => ({ name: l.name, source: l.source, hoursRemaining: l.clock.hoursRemaining }));

  // Leads the 48-hour timer closed in the last day (item 11). The manager also
  // got an email at the time; this is the daily record.
  const timerCloses = leads
    .filter((l) => l.closed_reason === "no_response_to_no" && l.closed_at && new Date(l.closed_at) >= oneDayAgo)
    .map((l) => l.name);

  await sendManagerDailyDigest(
    process.env.PT_MANAGER_EMAIL,
    overnight,
    approachingBreach,
    breached,
    ownLeadsAdded,
    timerCloses,
  );

  return NextResponse.json({
    sent: true,
    overnight: overnight.length,
    approachingBreach: approachingBreach.length,
    breached: breached.length,
  });
}
