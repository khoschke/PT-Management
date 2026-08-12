// Shared initials avatar used across the lead board, trainer roster and staff
// list so a person reads the same way everywhere in the ops tool.

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Avatar({
  name,
  size = "sm",
  muted = false,
}: {
  name: string;
  size?: "sm" | "md";
  muted?: boolean;
}) {
  const dims = size === "md" ? "h-9 w-9 text-xs" : "h-6 w-6 text-[10px]";
  const tone = muted ? "bg-fill text-secondary-label" : "bg-foreground text-white";
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${dims} ${tone}`}
    >
      {initials(name)}
    </span>
  );
}
