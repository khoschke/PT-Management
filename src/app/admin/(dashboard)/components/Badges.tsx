import type { LeadSource, LeadStatus } from "@/lib/types";

const SOURCE_META: Record<LeadSource, { label: string; title: string; warm: boolean }> = {
  form: {
    label: "Form (warm)",
    title: "Warm lead: filled in the form themselves",
    warm: true,
  },
  gymmaster_sweep: {
    label: "Sweep (cold)",
    title: "Cold lead: entered by hand from the GymMaster sweep",
    warm: false,
  },
  gymmaster_api: {
    label: "GymMaster (cold)",
    title: "Cold lead: imported automatically from GymMaster",
    warm: false,
  },
};

export function SourceBadge({ source }: { source: LeadSource }) {
  const meta = SOURCE_META[source];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        meta.warm ? "bg-foreground text-white" : "bg-fill text-foreground"
      }`}
      title={meta.title}
    >
      {meta.label}
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
