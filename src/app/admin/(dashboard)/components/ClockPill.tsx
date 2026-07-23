import { getContactClock } from "@/lib/countdown";

// The one number the manager cannot miss. Colour carries the urgency, and a
// matching dot reinforces the band so it reads without relying on colour.
const BAND_STYLES: Record<string, { badge: string; dot?: string }> = {
  green: { badge: "bg-green-100 text-green-800", dot: "bg-green-600" },
  amber: { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  red: { badge: "bg-red-100 text-red-700", dot: "bg-red-600" },
  done: { badge: "bg-fill text-secondary-label" },
};

export default function ClockPill({
  dueAt,
  firstContactedAt,
}: {
  dueAt: string;
  firstContactedAt: string | null;
}) {
  const clock = getContactClock(dueAt, firstContactedAt);
  const { badge, dot } = BAND_STYLES[clock.band];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />}
      {clock.label}
    </span>
  );
}
