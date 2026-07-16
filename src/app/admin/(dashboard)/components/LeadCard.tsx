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
      className="flex w-full flex-col gap-2.5 rounded-lg border border-neutral-200 bg-white p-4 text-left transition hover:border-neutral-400 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-neutral-900">{lead.name}</span>
        <ClockPill dueAt={lead.first_contact_due_at} firstContactedAt={lead.first_contacted_at} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <SourceBadge source={lead.lead_source} />
        <StatusBadge status={lead.status} />
      </div>

      <div className="text-sm text-neutral-600">
        {lead.allocated_trainer ? (
          <span>Allocated to {lead.allocated_trainer.name}</span>
        ) : (
          <span className="text-neutral-400">Not yet allocated</span>
        )}
      </div>
    </button>
  );
}
