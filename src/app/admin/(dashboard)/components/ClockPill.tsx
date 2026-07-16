import { getContactClock } from "@/lib/countdown";

const BAND_CLASSES: Record<string, string> = {
  green: "bg-green-50 text-green-800 border-green-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  red: "bg-red-50 text-red-800 border-red-200",
  done: "bg-neutral-100 text-neutral-500 border-neutral-200",
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
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${BAND_CLASSES[clock.band]}`}
    >
      {clock.label}
    </span>
  );
}
