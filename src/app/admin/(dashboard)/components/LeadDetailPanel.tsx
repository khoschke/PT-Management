"use client";

import { useEffect, useState, useTransition } from "react";
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

const selectClass =
  "w-full rounded-xl border-none bg-fill px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-foreground";

// Shared focus ring for the drawer's action buttons, offset against the white
// panel so keyboard focus is always legible.
const btnFocus =
  "outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

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

  // Close on Escape, and stop the board behind the panel from scrolling while
  // it is open. Small details that make a drawer feel native.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

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
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[2px] animate-[fadeIn_180ms_ease-out]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${lead.name} lead details`}
        className="flex h-full w-full max-w-lg translate-x-0 flex-col overflow-y-auto rounded-l-3xl bg-surface shadow-2xl animate-[slideIn_220ms_cubic-bezier(0.2,0.8,0.2,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass-header sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-black/5 px-6 py-5">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-tight text-foreground">{lead.name}</h2>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <SourceBadge source={lead.lead_source} />
              <StatusBadge status={lead.status} />
              <ClockPill dueAt={lead.first_contact_due_at} firstContactedAt={lead.first_contacted_at} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="press flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fill text-secondary-label outline-none transition hover:bg-fill/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-7 px-6 py-6">
          {error && <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}

          {/* Submitted details */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">Submitted details</h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
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

            <div className="mt-4">
              <span className="text-xs font-semibold text-secondary-label">Goals</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {lead.goals.length === 0 && <span className="text-sm text-secondary-label/70">Not provided</span>}
                {lead.goals.map((g) => (
                  <span key={g} className="rounded-full bg-fill px-2.5 py-1 text-xs text-foreground">
                    {goalLabel(g)}
                  </span>
                ))}
              </div>
              {lead.goal_other && <p className="mt-1.5 text-sm text-foreground">&ldquo;{lead.goal_other}&rdquo;</p>}
            </div>

            {lead.current_exercise && (
              <div className="mt-4">
                <span className="text-xs font-semibold text-secondary-label">Current exercise</span>
                <p className="mt-1 text-sm text-foreground">{lead.current_exercise}</p>
              </div>
            )}

            {lead.contact_preference && (
              <div className="mt-4 rounded-2xl bg-fill px-4 py-3">
                <span className="text-xs font-semibold text-secondary-label">Best way to reach them</span>
                <p className="mt-1 text-sm font-medium text-foreground">&ldquo;{lead.contact_preference}&rdquo;</p>
              </div>
            )}

            <p className="mt-4 text-xs text-secondary-label/70">Submitted {formatDateTime(lead.created_at)}</p>
          </section>

          {/* Allocation */}
          {isManager && (
            <section className="border-t border-black/5 pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">Allocation</h3>

              {lead.allocated_trainer && (
                <p className="mt-2 text-sm text-foreground">
                  Currently allocated to <strong>{lead.allocated_trainer.name}</strong>.
                </p>
              )}

              {suggestion && (
                <div className="mt-2 rounded-2xl bg-fill px-4 py-3.5">
                  <p className="text-sm text-foreground">
                    Suggested: <strong>{suggestion.trainer.name}</strong>
                  </p>
                  <p className="mt-0.5 text-xs text-secondary-label">{suggestion.reason}</p>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => runAction(() => allocateLead(lead.id, suggestion.trainer.id))}
                    className={`press mt-3 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 ${btnFocus}`}
                  >
                    Allocate to {suggestion.trainer.name}
                  </button>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <select
                  value={overrideTrainerId}
                  onChange={(e) => setOverrideTrainerId(e.target.value)}
                  className={`flex-1 ${selectClass}`}
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
                  className={`press rounded-full bg-fill px-4 py-2.5 text-sm font-semibold text-foreground disabled:opacity-40 ${btnFocus}`}
                >
                  Allocate
                </button>
              </div>
            </section>
          )}

          {/* Status */}
          <section className="border-t border-black/5 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">Status</h3>
            <select
              defaultValue={lead.status}
              disabled={isPending}
              onChange={(e) => runAction(() => updateLeadStatus(lead.id, e.target.value as LeadStatus))}
              className={`mt-2.5 ${selectClass}`}
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </section>

          {/* Notes */}
          <section className="border-t border-black/5 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-2.5 w-full rounded-xl border-none bg-fill px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-foreground"
              placeholder="Call notes, booking details, anything the next person needs to know."
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => runAction(() => updateLeadNotes(lead.id, notes))}
              className={`press mt-2.5 rounded-full bg-fill px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-50 ${btnFocus}`}
            >
              Save note
            </button>
          </section>

          {/* Status history */}
          {lead.status_history.length > 0 && (
            <section className="border-t border-black/5 pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">Status history</h3>
              <ul className="mt-2.5 flex flex-col gap-2 text-sm text-foreground">
                {[...lead.status_history]
                  .sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime())
                  .map((entry, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span>
                        {entry.old_status ? `${entry.old_status} → ${entry.new_status}` : `Created as ${entry.new_status}`}
                      </span>
                      <span className="text-xs text-secondary-label/70">{formatDateTime(entry.changed_at)}</span>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          {/* Removal */}
          {isManager && (
            <section className="border-t border-black/5 pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">Remove lead</h3>
              <p className="mt-1.5 text-xs text-secondary-label">
                Soft delete hides the lead from the board but keeps the record. Only use hard delete when a member
                has specifically asked to be removed.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => runAction(() => softDeleteLead(lead.id))}
                  className={`press rounded-full bg-fill px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-50 ${btnFocus}`}
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
                  className={`press rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 disabled:opacity-50 ${btnFocus}`}
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
      <dt className="text-xs text-secondary-label">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
