"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LEAD_STATUSES, type Trainer } from "@/lib/types";
import { getContactClock } from "@/lib/countdown";
import { leadsToCsv, downloadCsv } from "@/lib/csv";
import LeadCard from "./LeadCard";
import LeadDetailPanel from "./LeadDetailPanel";
import AddSweepLeadModal from "./AddSweepLeadModal";
import type { LeadRow } from "../page";

interface Filters {
  status: string;
  source: string;
  allocatedTrainerId: string;
  overdueOnly: boolean;
}

const DEFAULT_FILTERS: Filters = {
  status: "",
  source: "",
  allocatedTrainerId: "",
  overdueOnly: false,
};

export default function LeadBoard({
  leads,
  activeTrainers,
  trainerLoads,
  isManager,
}: {
  leads: LeadRow[];
  activeTrainers: Trainer[];
  trainerLoads: Record<string, number>;
  isManager: boolean;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showAddSweepLead, setShowAddSweepLead] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filters.status && lead.status !== filters.status) return false;
      if (filters.source && lead.lead_source !== filters.source) return false;
      if (filters.allocatedTrainerId && lead.allocated_trainer_id !== filters.allocatedTrainerId) return false;
      if (filters.overdueOnly) {
        const clock = getContactClock(lead.first_contact_due_at, lead.first_contacted_at);
        if (clock.band !== "red") return false;
      }
      return true;
    });
  }, [leads, filters]);

  const selectedLead = selectedLeadId ? leads.find((l) => l.id === selectedLeadId) ?? null : null;

  const overdueCount = useMemo(
    () =>
      filteredLeads.filter(
        (lead) => getContactClock(lead.first_contact_due_at, lead.first_contacted_at).band === "red",
      ).length,
    [filteredLeads],
  );

  const hasFilters = Boolean(
    filters.status || filters.source || filters.allocatedTrainerId || filters.overdueOnly,
  );

  const selectClass =
    "appearance-none rounded-full bg-fill px-4 py-2 pr-8 text-sm font-medium text-foreground outline-none ring-1 ring-transparent transition hover:bg-fill/70 focus-visible:ring-2 focus-visible:ring-foreground bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236e6e73%22%3E%3Cpath%20d%3D%22M5.5%207.5l4.5%204.5%204.5-4.5%22%20stroke%3D%22%236e6e73%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.6rem_center] bg-[length:14px]";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display-heading text-[28px] text-foreground">
          {isManager ? "Lead board" : "Your leads"}
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => downloadCsv(`fitaz-pt-leads-${new Date().toISOString().split("T")[0]}.csv`, leadsToCsv(filteredLeads))}
            className="press rounded-full bg-fill px-4 py-2 text-sm font-semibold text-foreground outline-none transition hover:bg-fill/70 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Export CSV
          </button>
          {isManager && (
            <button
              type="button"
              onClick={() => setShowAddSweepLead(true)}
              className="press rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white outline-none transition focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Add sweep lead
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className={selectClass}
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filters.source}
          onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}
          className={selectClass}
        >
          <option value="">All sources</option>
          <option value="form">Form (warm)</option>
          <option value="gymmaster_sweep">Sweep (cold)</option>
        </select>

        {isManager && (
          <select
            value={filters.allocatedTrainerId}
            onChange={(e) => setFilters((f) => ({ ...f, allocatedTrainerId: e.target.value }))}
            className={selectClass}
          >
            <option value="">All trainers</option>
            {activeTrainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        <label className="press flex cursor-pointer items-center gap-1.5 rounded-full bg-fill px-4 py-2 text-sm font-medium text-foreground transition has-[:checked]:bg-foreground has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground">
          <input
            type="checkbox"
            checked={filters.overdueOnly}
            onChange={(e) => setFilters((f) => ({ ...f, overdueOnly: e.target.checked }))}
            className="sr-only"
          />
          Overdue only
        </label>

        {hasFilters && (
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="rounded-full px-3 py-2 text-sm font-medium text-secondary-label outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="mt-4 text-sm text-secondary-label">
        {filteredLeads.length} lead{filteredLeads.length === 1 ? "" : "s"}
        {overdueCount > 0 && (
          <span className="text-red-600"> &middot; {overdueCount} overdue</span>
        )}
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLeads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={() => setSelectedLeadId(lead.id)} />
        ))}
        {filteredLeads.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-dashed border-black/10 px-6 py-16 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-fill" aria-hidden>
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-secondary-label" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </span>
            <p className="text-sm font-medium text-foreground">
              {hasFilters ? "No leads match these filters" : "No leads yet"}
            </p>
            <p className="max-w-xs text-sm text-secondary-label">
              {hasFilters
                ? "Try clearing a filter to see more."
                : "New leads will appear here as members raise their hand or get added from a sweep."}
            </p>
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          activeTrainers={activeTrainers}
          trainerLoads={trainerLoads}
          isManager={isManager}
          onClose={() => setSelectedLeadId(null)}
        />
      )}

      {showAddSweepLead && (
        <AddSweepLeadModal
          trainers={activeTrainers}
          onClose={() => setShowAddSweepLead(false)}
          onSaved={() => {
            setShowAddSweepLead(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
