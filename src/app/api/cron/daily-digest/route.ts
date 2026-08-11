// Daily 7am AEST digest to the PT Manager: new leads overnight, leads
// approaching the 48 hour breach, and leads already breached. Triggered by
// Vercel Cron, see vercel.json. A no-op if RESEND_API_KEY or PT_MANAGER_EMAIL
// aren't set, so the rest of the app is unaffected either way.

import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getContactClock } from "@/lib/countdown";
import { emailEnabled, sendManagerDailyDigest } from "@/lib/email";
import type { Lead } from "@/lib/types";

// This route runs with the service-role client (bypasses RLS), so it must be
// callable only by Vercel Cron carrying the shared secret. Fail closed if
// CRON_SECRET isn't set, rather than comparing against "Bearer undefined" and
// letting a literal `Bearer undefined` header through. Constant-time compare so
// the secret can't be recovered by timing.
function isAuthorised(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !authHeader) return false;
  const provided = Buffer.from(authHeader);
  const expected = Buffer.from(`Bearer ${secret}`);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function GET(request: Request) {
  if (!isAuthorised(request.headers.get("authorization"))) {
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
