// The 2-2-2 follow-ups and the 48-hour clock on a no, as the board and the
// emails read them. The rules themselves live in the database
// (0022_follow_ups.sql); this only describes the state a lead is in.

import type { Lead } from "./types";

export const FOLLOW_UP_LABELS: Record<number, string> = {
  1: "2-day nudge",
  2: "2-week touch",
  3: "2-month reconnect",
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type FollowUpFields = Pick<
  Lead,
  "status" | "follow_up_step" | "next_follow_up_at" | "said_no_at" | "permission_asked_at"
>;

export interface FollowUpState {
  kind: "follow_up" | "no_clock" | "awaiting_answer";
  /** Short text for a pill: "2-week touch due today", "Respond to a no: 20h left". */
  label: string;
  /** Today, overdue, or later. Drives the pill colour and the "due" filter. */
  urgency: "overdue" | "today" | "soon" | "later";
  dueAt: Date;
}

function startOfDay(d: Date): number {
  const brisbane = new Date(d.toLocaleString("en-US", { timeZone: "Australia/Brisbane" }));
  brisbane.setHours(0, 0, 0, 0);
  return brisbane.getTime();
}

function dayUrgency(due: Date, now: Date): FollowUpState["urgency"] {
  const diff = startOfDay(due) - startOfDay(now);
  if (due.getTime() <= now.getTime() && diff < 0) return "overdue";
  if (diff <= 0) return "today";
  if (diff <= 6 * DAY) return "soon";
  return "later";
}

export function formatShortDay(d: Date): string {
  return d.toLocaleDateString("en-AU", { timeZone: "Australia/Brisbane", weekday: "short", day: "numeric", month: "short" });
}

export function getFollowUpState(lead: FollowUpFields, now: Date = new Date()): FollowUpState | null {
  if (lead.status === "Said no" && lead.said_no_at) {
    if (!lead.permission_asked_at) {
      const due = new Date(new Date(lead.said_no_at).getTime() + 48 * HOUR);
      const hours = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / HOUR));
      return {
        kind: "no_clock",
        label: `Respond to a no: ${hours}h left`,
        urgency: hours <= 12 ? "overdue" : "today",
        dueAt: due,
      };
    }
    const due = new Date(new Date(lead.permission_asked_at).getTime() + 7 * DAY);
    return { kind: "awaiting_answer", label: `Waiting on an answer, closes ${formatShortDay(due)}`, urgency: "later", dueAt: due };
  }

  if (
    (lead.status === "Contacted" || lead.status === "Agreed to check-in") &&
    lead.next_follow_up_at &&
    lead.follow_up_step &&
    FOLLOW_UP_LABELS[lead.follow_up_step]
  ) {
    const due = new Date(lead.next_follow_up_at);
    const urgency = dayUrgency(due, now);
    const name = FOLLOW_UP_LABELS[lead.follow_up_step];
    const label =
      urgency === "overdue"
        ? `${name} overdue`
        : urgency === "today"
          ? `${name} due today`
          : `${name} due ${formatShortDay(due)}`;
    return { kind: "follow_up", label, urgency, dueAt: due };
  }

  return null;
}

/** Something the trainer needs to act on today: a follow-up due or overdue, or a no to respond to. */
export function needsActionToday(lead: FollowUpFields, now: Date = new Date()): boolean {
  const state = getFollowUpState(lead, now);
  if (!state) return false;
  return state.kind === "no_clock" || state.urgency === "overdue" || state.urgency === "today";
}
