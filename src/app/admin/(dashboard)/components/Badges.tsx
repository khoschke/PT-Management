import type { LeadSource, LeadStatus } from "@/lib/types";

const badgeBase = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold";

export function SourceBadge({ source }: { source: LeadSource }) {
  const isForm = source === "form";
  return (
    <span
      className={`${badgeBase} ${isForm ? "bg-foreground text-white" : "bg-fill text-foreground"}`}
      title={isForm ? "Warm lead: filled in the form themselves" : "Cold lead: found on the GymMaster sweep"}
    >
      {isForm ? "Form (warm)" : "Sweep (cold)"}
    </span>
  );
}

// Each status keeps its established colour (the manager reads these at a
// glance), paired with a small dot so the state is still legible without
// relying on colour alone. Neutral states stay monochrome and dot-free.
const STATUS_STYLES: Record<LeadStatus, { badge: string; dot?: string }> = {
  New: { badge: "bg-fill text-secondary-label" },
  Allocated: { badge: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  Contacted: { badge: "bg-purple-100 text-purple-800", dot: "bg-purple-500" },
  Booked: { badge: "bg-green-100 text-green-800", dot: "bg-green-600" },
  Completed: { badge: "bg-foreground text-white" },
  "Not interested": { badge: "bg-fill text-secondary-label" },
  Unreachable: { badge: "bg-orange-100 text-orange-800", dot: "bg-orange-500" },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const { badge, dot } = STATUS_STYLES[status];
  return (
    <span className={`${badgeBase} ${badge}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />}
      {status}
    </span>
  );
}
