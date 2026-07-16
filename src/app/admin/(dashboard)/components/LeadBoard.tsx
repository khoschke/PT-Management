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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">
          {isManager ? "Lead board" : "Your leads"}
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => downloadCsv(`fitaz-pt-leads-${new Date().toISOString().split("T")[0]}.csv`, leadsToCsv(filteredLeads))}
            className="rounded-md border border-neutral-300 px-3.5 py-2 text-sm font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
          >
            Export CSV
          </button>
          {isManager && (
            <button
              type="button"
              onClick={() => setShowAddSweepLead(true)}
              className="rounded-md bg-neutral-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
            >
              Add sweep lead
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
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
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">All sources</option>
          <option value="form">Form (warm)</option>
          <option value="gymmaster_sweep">Sweep (cold)</option>
        </select>

        {isManager && (
          <select
            value={filters.allocatedTrainerId}
            onChange={(e) => setFilters((f) => ({ ...f, allocatedTrainerId: e.target.value }))}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">All trainers</option>
            {activeTrainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        <label className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={filters.overdueOnly}
            onChange={(e) => setFilters((f) => ({ ...f, overdueOnly: e.target.checked }))}
            className="accent-neutral-900"
          />
          Overdue only
        </label>

        {(filters.status || filters.source || filters.allocatedTrainerId || filters.overdueOnly) && (
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="text-sm text-neutral-500 underline hover:text-neutral-900"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="mt-3 text-sm text-neutral-500">
        {filteredLeads.length} lead{filteredLeads.length === 1 ? "" : "s"}
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLeads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={() => setSelectedLeadId(lead.id)} />
        ))}
        {filteredLeads.length === 0 && (
          <p className="col-span-full rounded-lg border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500">
            No leads match these filters.
          </p>
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
