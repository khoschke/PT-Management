"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { GOAL_OPTIONS } from "@/lib/goals";
import type { Trainer } from "@/lib/types";
import { addSweepLead, initialAddSweepLeadState } from "../actions";

const inputClass =
  "mt-1.5 w-full rounded-xl border-none bg-fill px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-foreground";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="press w-full rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save sweep lead"}
    </button>
  );
}

export default function AddSweepLeadModal({
  trainers,
  onClose,
  onSaved,
}: {
  trainers: Trainer[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [state, formAction] = useActionState(addSweepLead, initialAddSweepLeadState);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state.status, onSaved]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px] animate-[fadeIn_180ms_ease-out]"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-surface p-6 shadow-2xl animate-[scaleIn_200ms_cubic-bezier(0.2,0.8,0.2,1)] sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Add sweep lead</h2>
            <p className="mt-1 text-sm text-secondary-label">
              For a member found on the GymMaster sweep. Only name and phone are required, this is meant to be fast.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="press flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fill text-secondary-label"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form action={formAction} className="mt-5 flex flex-col gap-4">
          {state.status === "error" && state.message && (
            <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.message}</div>
          )}

          <div>
            <label className="text-sm font-semibold text-foreground">Name</label>
            <input name="name" type="text" required autoFocus className={inputClass} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground">Phone</label>
            <input name="phone" type="tel" required placeholder="04XX XXX XXX" className={inputClass} />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground">Email</label>
              <input name="email" type="email" className={inputClass} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Date of birth</label>
              <input
                name="date_of_birth"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground">Goals</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {GOAL_OPTIONS.filter((g) => g.code !== "other").map((goal) => (
                <label
                  key={goal.code}
                  className="press cursor-pointer rounded-full bg-fill px-3 py-1.5 text-xs font-medium text-foreground transition has-[:checked]:bg-foreground has-[:checked]:text-white"
                >
                  <input type="checkbox" name="goals" value={goal.code} className="sr-only" />
                  {goal.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground">Gender preference</label>
              <select name="gender_preference" defaultValue="" className={inputClass}>
                <option value="">Not known</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="no_preference">No preference</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Time preference</label>
              <select name="time_preference" defaultValue="" className={inputClass}>
                <option value="">Not known</option>
                <option value="AM">Morning</option>
                <option value="PM">Evening</option>
                <option value="either">Either</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground">Trainer requested</label>
            <select name="preferred_trainer_id" defaultValue="" className={inputClass}>
              <option value="">No preference</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground">Best way and time to reach them</label>
            <input name="contact_preference" type="text" className={inputClass} />
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
