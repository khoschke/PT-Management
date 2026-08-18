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

  const overnight = leads
    .filter((lead) => new Date(lead.created_at) >= oneDayAgo)
    .map((lead) => ({ name: lead.name, hoursRemaining: 0, source: lead.lead_source }));

  const uncontacted = leads.filter((lead) => !lead.first_contacted_at);

  const approachingBreach = uncontacted
    .map((lead) => ({
      name: lead.name,
      source: lead.lead_source,
      clock: getContactClock(lead.first_contact_due_at, lead.first_contacted_at, now),
    }))
    .filter((l) => l.clock.band === "amber")
    .map((l) => ({ name: l.name, source: l.source, hoursRemaining: l.clock.hoursRemaining }));

  const breached = uncontacted
    .map((lead) => ({
      name: lead.name,
      source: lead.lead_source,
      clock: getContactClock(lead.first_contact_due_at, lead.first_contacted_at, now),
    }))
    .filter((l) => l.clock.band === "red")
    .map((l) => ({ name: l.name, source: l.source, hoursRemaining: l.clock.hoursRemaining }));

  await sendManagerDailyDigest(process.env.PT_MANAGER_EMAIL, overnight, approachingBreach, breached);

  return NextResponse.json({
    sent: true,
    overnight: overnight.length,
    approachingBreach: approachingBreach.length,
    breached: breached.length,
  });
}
