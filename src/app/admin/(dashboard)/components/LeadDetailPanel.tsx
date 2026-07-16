"use client";

import { useState, useTransition } from "react";
import { goalLabel } from "@/lib/goals";
import { suggestTrainer, type TrainerWithLoad } from "@/lib/allocation";
import { LEAD_STATUSES, type LeadStatus, type Trainer } from "@/lib/types";
import { SourceBadge, StatusBadge } from "./Badges";
import ClockPill from "./ClockPill";
import { allocateLead, updateLeadStatus, updateLeadNotes, softDeleteLead, hardDeleteLead } from "../actions";
import type { LeadRow } from "../page";

function formatDate(value: string | null) {
  if (!value) return "Not provided";
  return new Date(value).toLocaleDateString("en-AU", { timeZone: "Australia/Brisbane" });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-AU", { timeZone: "Australia/Brisbane" });
}

const PREFERENCE_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  no_preference: "No preference",
  AM: "Morning",
  PM: "Evening",
  either: "Either",
};

export default function LeadDetailPanel({
  lead,
  activeTrainers,
  trainerLoads,
  isManager,
  onClose,
}: {
  lead: LeadRow;
  activeTrainers: Trainer[];
  trainerLoads: Record<string, number>;
  isManager: boolean;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [overrideTrainerId, setOverrideTrainerId] = useState(lead.allocated_trainer_id ?? "");
  const [error, setError] = useState<string | null>(null);

  const trainersWithLoad: TrainerWithLoad[] = activeTrainers.map((t) => ({
    ...t,
    currentLoad: trainerLoads[t.id] ?? 0,
  }));

  const suggestion = lead.allocated_trainer_id
    ? null
    : suggestTrainer(
        {
          preferred_trainer_id: lead.preferred_trainer_id,
          gender_preference: lead.gender_preference,
          time_preference: lead.time_preference,
          goals: lead.goals,
        },
        trainersWithLoad,
      );

  function runAction(fn: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.message ?? "Something went wrong.");
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{lead.name}</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <SourceBadge source={lead.lead_source} />
              <StatusBadge status={lead.status} />
              <ClockPill dueAt={lead.first_contact_due_at} firstContactedAt={lead.first_contacted_at} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-100"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <div className="flex flex-col gap-6 px-6 py-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
          )}

          {/* Submitted details */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Submitted details</h3>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Detail label="Phone" value={lead.phone} />
              <Detail label="Email" value={lead.email ?? "Not provided"} />
              <Detail label="Date of birth" value={formatDate(lead.date_of_birth)} />
              <Detail
                label="Gender preference"
                value={lead.gender_preference ? PREFERENCE_LABELS[lead.gender_preference] : "No preference stated"}
              />
              <Detail
                label="Time preference"
                value={lead.time_preference ? PREFERENCE_LABELS[lead.time_preference] : "No preference stated"}
              />
              <Detail label="Trainer requested" value={lead.preferred_trainer?.name ?? "No preference stated"} />
            </dl>

            <div className="mt-3">
              <span className="text-xs font-semibold text-neutral-500">Goals</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {lead.goals.length === 0 && <span className="text-sm text-neutral-400">Not provided</span>}
                {lead.goals.map((g) => (
                  <span key={g} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">
                    {goalLabel(g)}
                  </span>
                ))}
              </div>
              {lead.goal_other && <p className="mt-1.5 text-sm text-neutral-700">&ldquo;{lead.goal_other}&rdquo;</p>}
            </div>

            {lead.current_exercise && (
              <div className="mt-3">
                <span className="text-xs font-semibold text-neutral-500">Current exercise</span>
                <p className="mt-1 text-sm text-neutral-700">{lead.current_exercise}</p>
              </div>
            )}

            {lead.contact_preference && (
              <div className="mt-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                <span className="text-xs font-semibold text-neutral-500">Best way to reach them</span>
                <p className="mt-1 text-sm font-medium text-neutral-900">&ldquo;{lead.contact_preference}&rdquo;</p>
              </div>
            )}

            <p className="mt-3 text-xs text-neutral-400">Submitted {formatDateTime(lead.created_at)}</p>
          </section>

          {/* Allocation */}
          {isManager && (
            <section className="border-t border-neutral-200 pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Allocation</h3>

              {lead.allocated_trainer && (
                <p className="mt-2 text-sm text-neutral-700">
                  Currently allocated to <strong>{lead.allocated_trainer.name}</strong>.
                </p>
              )}

              {suggestion && (
                <div className="mt-2 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2.5">
                  <p className="text-sm text-neutral-900">
                    Suggested: <strong>{suggestion.trainer.name}</strong>
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-600">{suggestion.reason}</p>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => runAction(() => allocateLead(lead.id, suggestion.trainer.id))}
                    className="mt-2 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
                  >
                    Allocate to {suggestion.trainer.name}
                  </button>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <select
                  value={overrideTrainerId}
                  onChange={(e) => setOverrideTrainerId(e.target.value)}
                  className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
                >
                  <option value="">Choose a trainer</option>
                  {activeTrainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({trainerLoads[t.id] ?? 0} active)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={isPending || !overrideTrainerId}
                  onClick={() => runAction(() => allocateLead(lead.id, overrideTrainerId))}
                  className="rounded-md border border-neutral-900 px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-50"
                >
                  Allocate
                </button>
              </div>
            </section>
          )}

          {/* Status */}
          <section className="border-t border-neutral-200 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</h3>
            <select
              defaultValue={lead.status}
              disabled={isPending}
              onChange={(e) => runAction(() => updateLeadStatus(lead.id, e.target.value as LeadStatus))}
              className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </section>

          {/* Notes */}
          <section className="border-t border-neutral-200 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              placeholder="Call notes, booking details, anything the next person needs to know."
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => runAction(() => updateLeadNotes(lead.id, notes))}
              className="mt-2 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-50"
            >
              Save note
            </button>
          </section>

          {/* Status history */}
          {lead.status_history.length > 0 && (
            <section className="border-t border-neutral-200 pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status history</h3>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-neutral-700">
                {[...lead.status_history]
                  .sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime())
                  .map((entry, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span>
                        {entry.old_status ? `${entry.old_status} → ${entry.new_status}` : `Created as ${entry.new_status}`}
                      </span>
                      <span className="text-xs text-neutral-400">{formatDateTime(entry.changed_at)}</span>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          {/* Removal */}
          {isManager && (
            <section className="border-t border-neutral-200 pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Remove lead</h3>
              <p className="mt-1 text-xs text-neutral-500">
                Soft delete hides the lead from the board but keeps the record. Only use hard delete when a member
                has specifically asked to be removed.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => runAction(() => softDeleteLead(lead.id))}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-900 disabled:opacity-50"
                >
                  Soft delete
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (confirm(`Permanently delete ${lead.name}'s record? This can't be undone.`)) {
                      runAction(() => hardDeleteLead(lead.id));
                    }
                  }}
                  className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:border-red-600 disabled:opacity-50"
                >
                  Hard delete
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  );
}
