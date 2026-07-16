import type { LeadSource, LeadStatus } from "@/lib/types";

export function SourceBadge({ source }: { source: LeadSource }) {
  const isForm = source === "form";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isForm ? "bg-foreground text-white" : "bg-fill text-foreground"
      }`}
      title={isForm ? "Warm lead: filled in the form themselves" : "Cold lead: found on the GymMaster sweep"}
    >
      {isForm ? "Form (warm)" : "Sweep (cold)"}
    </span>
  );
}

const STATUS_CLASSES: Record<LeadStatus, string> = {
  New: "bg-fill text-secondary-label",
  Allocated: "bg-blue-100 text-blue-800",
  Contacted: "bg-purple-100 text-purple-800",
  Booked: "bg-green-100 text-green-800",
  Completed: "bg-foreground text-white",
  "Not interested": "bg-fill text-secondary-label",
  Unreachable: "bg-orange-100 text-orange-800",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}>
      {status}
    </span>
  );
}
