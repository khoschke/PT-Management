// The 48 hour first contact clock. This is the one number the PT Manager
// cares about most, so it gets its own small module rather than being
// scattered through the dashboard components.

import { AWAITING_CONTACT_STATUSES, type LeadStatus } from "./types";

export type ClockBand = "green" | "amber" | "red" | "done";

export interface ContactClock {
  band: ClockBand;
  label: string;
  hoursRemaining: number;
}

const AMBER_THRESHOLD_HOURS = 12;

export function getContactClock(
  dueAt: string,
  firstContactedAt: string | null,
  status: LeadStatus,
  now: Date = new Date(),
): ContactClock {
  // The clock only runs while a lead is still awaiting first contact. A lead
  // that's been contacted, booked, or closed out is done, even if it jumped
  // straight to that state without the "Contacted" step stamping a timestamp.
  const stillAwaiting = AWAITING_CONTACT_STATUSES.includes(status);
  if (firstContactedAt || !stillAwaiting) {
    // Keep the explicit "Contacted" label only when we actually recorded first
    // contact; otherwise the pill has nothing useful to say and is hidden.
    return { band: "done", label: firstContactedAt ? "Contacted" : "", hoursRemaining: 0 };
  }

  const due = new Date(dueAt);
  const msRemaining = due.getTime() - now.getTime();
  const hoursRemaining = msRemaining / (1000 * 60 * 60);

  if (hoursRemaining <= 0) {
    const hoursOverdue = Math.abs(hoursRemaining);
    return {
      band: "red",
      label: `Overdue by ${formatHours(hoursOverdue)}`,
      hoursRemaining,
    };
  }

  if (hoursRemaining <= AMBER_THRESHOLD_HOURS) {
    return {
      band: "amber",
      label: `${formatHours(hoursRemaining)} left`,
      hoursRemaining,
    };
  }

  return {
    band: "green",
    label: `${formatHours(hoursRemaining)} left`,
    hoursRemaining,
  };
}

function formatHours(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  }
  if (hours < 24) {
    return `${Math.round(hours)} hr`;
  }
  const days = Math.floor(hours / 24);
  const remHours = Math.round(hours % 24);
  return remHours > 0 ? `${days}d ${remHours}hr` : `${days}d`;
}
