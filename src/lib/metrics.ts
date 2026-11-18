// Lead funnel metrics, computed from the leads and their status history. Pure
// functions with no I/O so they can be reasoned about and checked on their own;
// the page feeds them rows it has already loaded.
//
// The reference for what each number means is docs/pipeline-stage-definitions.md
// ("The metrics this gives you"). The key idea: a rate is measured on whether a
// lead EVER reached a stage, read from status_history, not on its current
// status. A lead that went Contacted then Not interested still counts as having
// reached Contacted. The two closed exits, Not interested and Unreachable, are
// not stages on the line, so they add no progress.

import type { LeadSource, LeadStatus } from "./types";

// The linear progression. Not interested and Unreachable are deliberately absent:
// they are exits, not stages, so reaching one adds nothing to how far a lead got.
const STAGE_ORDER: LeadStatus[] = [
  "New",
  "Allocated",
  "Contacted",
  "Comp. Booked",
  "Attended",
  "Converted",
];
const STAGE_INDEX: Record<string, number> = Object.fromEntries(
  STAGE_ORDER.map((s, i) => [s, i]),
);

const CONTACTED = STAGE_INDEX["Contacted"];

// Off the line, but they mean first contact happened: someone can say no on the
// very first call (0022_follow_ups.sql). Without this, a lead that went
// Allocated to Said no was missing from "contacted" and the booking rate.
const IMPLIES_CONTACTED: Record<string, number> = {
  "Said no": CONTACTED,
  "Agreed to check-in": CONTACTED,
};
const stageOf = (status: string): number | undefined => STAGE_INDEX[status] ?? IMPLIES_CONTACTED[status];
const BOOKED = STAGE_INDEX["Comp. Booked"];
const ATTENDED = STAGE_INDEX["Attended"];
const CONVERTED = STAGE_INDEX["Converted"];

const DAY_MS = 24 * 60 * 60 * 1000;

// Only the fields the funnel needs, so the page can pass a narrowed query and
// tests can pass plain objects.
export interface FunnelLead {
  lead_source: LeadSource;
  status: LeadStatus;
  created_at: string;
  first_contact_due_at: string;
  first_contacted_at: string | null;
  status_history: { new_status: string; changed_at: string }[];
}

export interface StageCounts {
  total: number;
  contacted: number;
  booked: number;
  attended: number;
  converted: number;
}

export interface FunnelMetrics {
  overall: StageCounts;
  // Every source that actually appears, documented ones first in funnel order,
  // then any unexpected value (so the rows always sum to the overall total).
  bySource: { source: string; counts: StageCounts }[];
  // Of the leads where first contact was recorded, how many were inside the 48
  // hour window. `measured` is the denominator, so a small sample is visible.
  contactedWithin48h: { within: number; measured: number };
  // Days from a lead being created to it reaching Converted. Median, which a
  // single very old lead can't drag around the way a mean would.
  timeToConvert: { medianDays: number | null; count: number };
}

// The order the by-source breakdown reads in: warm form, then flagged, then
// cold unverified, then trainer-added own leads. Any value outside this list
// (there shouldn't be one) still appears, after these, so the rows always sum
// to the total.
const SOURCE_ORDER: LeadSource[] = ["form", "gymmaster_sweep", "unverified", "own"];

// The furthest linear stage a lead ever reached, as an index into STAGE_ORDER,
// or -1 if it never reached even New (it always has). Reads the current status
// and every status_history entry, and takes the highest.
function maxStage(lead: FunnelLead): number {
  let max = stageOf(lead.status) ?? -1;
  for (const h of lead.status_history) {
    const i = stageOf(h.new_status);
    if (i !== undefined && i > max) max = i;
  }
  return max;
}

function countStages(leads: FunnelLead[]): StageCounts {
  const counts: StageCounts = { total: leads.length, contacted: 0, booked: 0, attended: 0, converted: 0 };
  for (const lead of leads) {
    const stage = maxStage(lead);
    if (stage >= CONTACTED) counts.contacted += 1;
    if (stage >= BOOKED) counts.booked += 1;
    if (stage >= ATTENDED) counts.attended += 1;
    if (stage >= CONVERTED) counts.converted += 1;
  }
  return counts;
}

// The earliest time a lead reached Converted, from its history. Null if it never
// did (so a Converted lead with no matching history row is skipped rather than
// counted as instant).
function convertedAt(lead: FunnelLead): Date | null {
  let earliest: number | null = null;
  for (const h of lead.status_history) {
    if (h.new_status === "Converted") {
      const t = new Date(h.changed_at).getTime();
      if (earliest === null || t < earliest) earliest = t;
    }
  }
  return earliest === null ? null : new Date(earliest);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function computeFunnelMetrics(leads: FunnelLead[]): FunnelMetrics {
  const overall = countStages(leads);

  // Group by the source value actually present, so an unexpected one (anything
  // outside the known types) still shows rather than vanishing from the
  // breakdown while remaining in the total. Known sources lead, in funnel
  // order; anything else follows, alphabetically.
  const present = Array.from(new Set(leads.map((l) => l.lead_source as string)));
  const rank = (s: string) => {
    const i = SOURCE_ORDER.indexOf(s as LeadSource);
    return i === -1 ? SOURCE_ORDER.length : i;
  };
  present.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  const bySource = present.map((source) => ({
    source,
    counts: countStages(leads.filter((l) => l.lead_source === source)),
  }));

  let measured = 0;
  let within = 0;
  for (const lead of leads) {
    if (!lead.first_contacted_at) continue;
    measured += 1;
    if (new Date(lead.first_contacted_at).getTime() <= new Date(lead.first_contact_due_at).getTime()) {
      within += 1;
    }
  }

  const convertDays: number[] = [];
  for (const lead of leads) {
    const converted = convertedAt(lead);
    if (!converted) continue;
    convertDays.push((converted.getTime() - new Date(lead.created_at).getTime()) / DAY_MS);
  }

  return {
    overall,
    bySource,
    contactedWithin48h: { within, measured },
    timeToConvert: { medianDays: median(convertDays), count: convertDays.length },
  };
}

// A rate as a fraction, or null when the denominator is zero (so the page can
// show a dash rather than divide by nothing). Rates are always paired with
// their numerator and denominator on screen so a 1-of-1 isn't read as a trend.
export function rate(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : numerator / denominator;
}
