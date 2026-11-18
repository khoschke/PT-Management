import { getFollowUpState } from "@/lib/followUps";
import type { Lead } from "@/lib/types";

// The 2-2-2 touch that's due, or the 48-hour countdown on a no. Shown on the
// card and in the panel header. Nothing renders when nothing is pending.
const URGENCY_STYLES = {
  overdue: { badge: "bg-red-100 text-red-700", dot: "bg-red-600" },
  today: { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  soon: { badge: "bg-indigo-50 text-indigo-800", dot: "bg-indigo-500" },
  later: { badge: "bg-fill text-secondary-label", dot: undefined },
} as const;

export default function FollowUpPill({
  lead,
}: {
  lead: Pick<Lead, "status" | "follow_up_step" | "next_follow_up_at" | "said_no_at" | "permission_asked_at">;
}) {
  const state = getFollowUpState(lead);
  if (!state) return null;
  const { badge, dot } = URGENCY_STYLES[state.urgency];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />}
      {state.label}
    </span>
  );
}
