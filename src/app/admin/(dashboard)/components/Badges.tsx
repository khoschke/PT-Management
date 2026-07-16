import type { LeadSource, LeadStatus } from "@/lib/types";

export function SourceBadge({ source }: { source: LeadSource }) {
  const isForm = source === "form";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        isForm ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white text-neutral-700"
      }`}
      title={isForm ? "Warm lead: filled in the form themselves" : "Cold lead: found on the GymMaster sweep"}
    >
      {isForm ? "Form (warm)" : "Sweep (cold)"}
    </span>
  );
}

const STATUS_CLASSES: Record<LeadStatus, string> = {
  New: "bg-neutral-100 text-neutral-700 border-neutral-200",
  Allocated: "bg-blue-50 text-blue-800 border-blue-200",
  Contacted: "bg-purple-50 text-purple-800 border-purple-200",
  Booked: "bg-green-50 text-green-800 border-green-200",
  Completed: "bg-neutral-800 text-white border-neutral-800",
  "Not interested": "bg-neutral-100 text-neutral-500 border-neutral-200",
  Unreachable: "bg-orange-50 text-orange-800 border-orange-200",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}
    >
      {status}
    </span>
  );
}
