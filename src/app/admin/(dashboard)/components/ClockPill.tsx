import { getContactClock } from "@/lib/countdown";

const BAND_CLASSES: Record<string, string> = {
  green: "bg-green-100 text-green-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  done: "bg-fill text-secondary-label",
};

export default function ClockPill({
  dueAt,
  firstContactedAt,
}: {
  dueAt: string;
  firstContactedAt: string | null;
}) {
  const clock = getContactClock(dueAt, firstContactedAt);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${BAND_CLASSES[clock.band]}`}
    >
      {clock.label}
    </span>
  );
}
