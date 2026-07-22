// Builds a CSV export of the currently filtered lead board. Runs entirely
// client side since the board already has the full filtered dataset loaded,
// so there's no need for a separate export endpoint.

import { goalLabel } from "./goals";
import { LEAD_SOURCE_LABELS } from "./types";
import type { LeadRow } from "@/app/admin/(dashboard)/page";

const COLUMNS = [
  "Name",
  "Phone",
  "Email",
  "Date of birth",
  "Goals",
  "Goal, other",
  "Current exercise",
  "Gender preference",
  "Time preference",
  "Trainer requested",
  "Contact preference",
  "Source",
  "Allocated trainer",
  "Status",
  "Notes",
  "Created at",
  "First contact due",
  "First contacted at",
] as const;

function escapeCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function leadsToCsv(leads: LeadRow[]): string {
  const rows = leads.map((lead) => [
    lead.name,
    lead.phone,
    lead.email ?? "",
    lead.date_of_birth ?? "",
    lead.goals.map(goalLabel).join("; "),
    lead.goal_other ?? "",
    lead.current_exercise ?? "",
    lead.gender_preference ?? "",
    lead.time_preference ?? "",
    lead.preferred_trainer?.name ?? "",
    lead.contact_preference ?? "",
    LEAD_SOURCE_LABELS[lead.lead_source],
    lead.allocated_trainer?.name ?? "",
    lead.status,
    lead.notes ?? "",
    lead.created_at,
    lead.first_contact_due_at,
    lead.first_contacted_at ?? "",
  ]);

  const lines = [COLUMNS.join(","), ...rows.map((row) => row.map((cell) => escapeCell(String(cell))).join(","))];
  return lines.join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
