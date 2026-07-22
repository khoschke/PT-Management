import ClockPill from "./ClockPill";
import { SourceBadge, StatusBadge } from "./Badges";
import type { LeadRow } from "../page";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function LeadCard({
  lead,
  onClick,
}: {
  lead: LeadRow;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press flex w-full flex-col gap-3 rounded-2xl border border-black/5 bg-surface p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] outline-none transition hover:border-black/10 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_28px_rgba(0,0,0,0.09)] focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <span className="block truncate font-semibold tracking-tight text-foreground">{lead.name}</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <SourceBadge source={lead.lead_source} />
            <StatusBadge status={lead.status} />
          </div>
        </div>
        <div className="shrink-0">
          <ClockPill dueAt={lead.first_contact_due_at} firstContactedAt={lead.first_contacted_at} />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-black/5 pt-3 text-sm">
        {lead.allocated_trainer ? (
          <>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-white">
              {initials(lead.allocated_trainer.name)}
            </span>
            <span className="truncate text-secondary-label">{lead.allocated_trainer.name}</span>
          </>
        ) : (
          <>
            <span className="h-6 w-6 shrink-0 rounded-full border border-dashed border-black/20" aria-hidden />
            <span className="text-secondary-label/70">Not yet allocated</span>
          </>
        )}
      </div>
    </button>
  );
}
