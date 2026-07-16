import ClockPill from "./ClockPill";
import { SourceBadge, StatusBadge } from "./Badges";
import type { LeadRow } from "../page";

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
      className="press flex w-full flex-col gap-3 rounded-2xl border border-black/5 bg-surface p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] transition hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold tracking-tight text-foreground">{lead.name}</span>
        <ClockPill dueAt={lead.first_contact_due_at} firstContactedAt={lead.first_contacted_at} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <SourceBadge source={lead.lead_source} />
        <StatusBadge status={lead.status} />
      </div>

      <div className="text-sm text-secondary-label">
        {lead.allocated_trainer ? (
          <span>Allocated to {lead.allocated_trainer.name}</span>
        ) : (
          <span className="text-secondary-label/60">Not yet allocated</span>
        )}
      </div>
    </button>
  );
}
