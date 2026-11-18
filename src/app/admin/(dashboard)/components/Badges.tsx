import { LEAD_SOURCE_LABELS, STATUS_DEFINITIONS, type LeadSource, type LeadStatus } from "@/lib/types";

const badgeBase = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold";

export function SourceBadge({ source }: { source: LeadSource }) {
  const { label, hint } = LEAD_SOURCE_LABELS[source];
  const style =
    source === "form"
      ? "bg-foreground text-white"
      : source === "unverified"
        ? "bg-fill text-secondary-label ring-1 ring-inset ring-black/10"
        : source === "own"
          ? "bg-surface text-foreground ring-1 ring-inset ring-foreground/40"
          : "bg-fill text-foreground";
  return (
    <span className={`${badgeBase} ${style}`} title={hint}>
      {label}
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
  "Comp. Booked": { badge: "bg-green-100 text-green-800", dot: "bg-green-600" },
  Attended: { badge: "bg-teal-100 text-teal-800", dot: "bg-teal-600" },
  Converted: { badge: "bg-foreground text-white" },
  "Not interested": { badge: "bg-fill text-secondary-label" },
  Unreachable: { badge: "bg-orange-100 text-orange-800", dot: "bg-orange-500" },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  // The fallback covers the minutes between a deploy and its status migration,
  // when the database can still hand back a name this map no longer has.
  const { badge, dot } = STATUS_STYLES[status] ?? STATUS_STYLES.New;
  return (
    <span className={`${badgeBase} ${badge}`} title={STATUS_DEFINITIONS[status]}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />}
      {status}
    </span>
  );
}
