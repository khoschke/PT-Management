"use client";

import { useState, useTransition } from "react";
import type { SetupChecklistItem, SetupItemState, TrainerSetupChecklistItem } from "@/lib/types";
import type { SetupEvidence } from "@/lib/setup";
import { setSetupItemNote, setSetupItemState } from "../actions";
import { focusRing, focusRingWithin } from "../../components/ui";

const STATES: { value: SetupItemState; label: string }[] = [
  { value: "pending", label: "To do" },
  { value: "done", label: "Done" },
  { value: "not_applicable", label: "N/A" },
];

const dateFormat = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" });

interface Props {
  trainerId: string;
  item: SetupChecklistItem;
  row: TrainerSetupChecklistItem | null;
  /** Live state from a feature that already exists, for the three derived items. */
  evidence: SetupEvidence | null;
  updatedByName: string | null;
}

export default function SetupItemRow({ trainerId, item, row, evidence, updatedByName }: Props) {
  const state: SetupItemState = row?.state ?? "pending";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [noteOpen, setNoteOpen] = useState(Boolean(row?.note));
  const [note, setNote] = useState(row?.note ?? "");
  const [noteSaved, setNoteSaved] = useState(true);

  function choose(next: SetupItemState) {
    if (next === state) return;
    setError(null);
    startTransition(async () => {
      const result = await setSetupItemState(trainerId, item.id, next);
      if (!result.ok) setError(result.message ?? "Couldn't save that.");
    });
  }

  function saveNote() {
    if (note === (row?.note ?? "")) return;
    setError(null);
    startTransition(async () => {
      const result = await setSetupItemNote(trainerId, item.id, note);
      if (result.ok) setNoteSaved(true);
      else setError(result.message ?? "Couldn't save that note.");
    });
  }

  const settled = state === "done" || state === "not_applicable";

  return (
    <li
      className={`rounded-2xl border p-4 transition ${
        settled ? "border-black/5 bg-fill/30" : "border-black/5 bg-surface"
      } ${isPending ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`font-semibold tracking-tight ${
              state === "not_applicable" ? "text-secondary-label" : "text-foreground"
            }`}
          >
            {item.label}
          </p>
          {item.hint && <p className="mt-0.5 text-sm text-secondary-label">{item.hint}</p>}

          {/* What the portal already knows, beside the tick rather than
              instead of it. These never tick themselves: see lib/setup.ts. */}
          {evidence && (
            <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
              <span className={evidence.empty ? "text-amber-700" : "text-secondary-label"}>
                {evidence.text}
              </span>
              <a href={evidence.href} className={`font-semibold text-foreground underline ${focusRing}`}>
                {evidence.linkLabel}
              </a>
            </p>
          )}

          {row?.updated_at && settled && (
            <p className="mt-1.5 text-[12px] text-secondary-label">
              {updatedByName ?? "Someone"} &middot; {dateFormat.format(new Date(row.updated_at))}
            </p>
          )}
        </div>

        {/* Three states, big enough to hit on a phone: this gets ticked
            walking around the gym, not at a desk. */}
        <div className="flex shrink-0 gap-1 rounded-full bg-fill p-1">
          {STATES.map((option) => {
            const active = option.value === state;
            return (
              <label
                key={option.value}
                className={`press cursor-pointer rounded-full px-3 py-2 text-sm font-semibold transition ${focusRingWithin} ${
                  active
                    ? option.value === "done"
                      ? "bg-foreground text-white"
                      : "bg-surface text-foreground shadow-sm"
                    : "text-secondary-label hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name={`state-${item.id}`}
                  className="sr-only"
                  checked={active}
                  onChange={() => choose(option.value)}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-3">
        {noteOpen ? (
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex-1">
              <span className="sr-only">Note for {item.label}</span>
              <textarea
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setNoteSaved(false);
                }}
                onBlur={saveNote}
                rows={2}
                placeholder="Waiting on ABN, ordered 3 Sep, anything worth remembering"
                className={`w-full rounded-xl border border-black/10 bg-surface px-3 py-2 text-sm text-foreground ${focusRing}`}
              />
            </label>
            {!noteSaved && (
              <button
                type="button"
                onClick={saveNote}
                className={`press rounded-full bg-foreground px-3 py-2 text-sm font-semibold text-white ${focusRing}`}
              >
                Save note
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className={`rounded-full text-sm font-semibold text-secondary-label underline hover:text-foreground ${focusRing}`}
          >
            Add a note
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm font-medium text-red-700">{error}</p>}
    </li>
  );
}
