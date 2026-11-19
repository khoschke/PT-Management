"use client";

import { useState } from "react";

// The one way a lead is closed as Not interested: from the status dropdown,
// End communication, or "They said leave it there". It spells out what happens
// before the trainer commits, because the close can't be undone by them
// (Karl, 18 Nov 2026).

export type CloseReason = "ended_by_trainer" | "replied_stop" | "declined";

const CHOICES: { value: Exclude<CloseReason, "declined">; label: string }[] = [
  { value: "ended_by_trainer", label: "They said no, or asked me to leave it there" },
  { value: "replied_stop", label: "They replied STOP" },
];

export default function ConfirmCloseDialog({
  leadName,
  preset,
  isPending,
  onConfirm,
  onCancel,
}: {
  leadName: string;
  /** "declined" comes from the permission question and offers no choice. */
  preset: CloseReason | null;
  isPending: boolean;
  onConfirm: (reason: CloseReason) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState<CloseReason | null>(preset);
  const fixed = preset === "declined";

  return (
    // Stops clicks reaching the lead panel's backdrop, which would close the panel.
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4 animate-[fadeIn_150ms_ease-out]"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="close-lead-title"
        className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl animate-[scaleIn_180ms_cubic-bezier(0.2,0.8,0.2,1)]"
      >
        <h2 id="close-lead-title" className="text-lg font-semibold tracking-tight text-foreground">
          Close {leadName} as Not interested?
        </h2>
        <p className="mt-2 text-sm text-secondary-label">If you confirm:</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-foreground">
          <li>The lead closes and comes off your active board.</li>
          <li>Their follow-ups stop, and they won&apos;t get any more of the gym&apos;s PT emails.</li>
          <li>Nobody contacts them about PT again.</li>
          <li>A note is added to the lead saying communication ended, and why.</li>
          <li>You can&apos;t undo it. If it&apos;s a mistake, contact the PT Manager.</li>
        </ul>

        {fixed ? (
          <p className="mt-4 rounded-xl bg-fill px-3.5 py-2.5 text-sm text-foreground">
            Reason: they said leave it there when you asked the permission question.
          </p>
        ) : (
          <fieldset className="mt-4">
            <legend className="text-sm font-semibold text-foreground">Why is it ending?</legend>
            <div className="mt-2 flex flex-col gap-2">
              {CHOICES.map((c) => (
                <label
                  key={c.value}
                  className="press flex cursor-pointer items-center gap-2.5 rounded-xl bg-fill px-3.5 py-2.5 text-sm text-foreground ring-1 ring-transparent has-[:checked]:ring-2 has-[:checked]:ring-foreground"
                >
                  <input
                    type="radio"
                    name="close-reason"
                    value={c.value}
                    checked={reason === c.value}
                    onChange={() => setReason(c.value)}
                    className="accent-foreground"
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="press rounded-full bg-fill px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => reason && onConfirm(reason)}
            disabled={isPending || !reason}
            className="press rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Yes, close the lead
          </button>
        </div>
      </div>
    </div>
  );
}
