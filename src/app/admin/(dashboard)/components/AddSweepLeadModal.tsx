"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { GOAL_OPTIONS } from "@/lib/goals";
import type { Trainer } from "@/lib/types";
import { addSweepLead, initialAddSweepLeadState } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Add sweep lead</h2>
            <p className="mt-1 text-sm text-neutral-500">
              For a member found on the GymMaster sweep. Only name and phone are required, this is meant to be fast.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-900">
            Close
          </button>
        </div>

        <form action={formAction} className="mt-5 flex flex-col gap-4">
          {state.status === "error" && state.message && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {state.message}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-neutral-900">Name</label>
            <input
              name="name"
              type="text"
              required
              autoFocus
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-900">Phone</label>
            <input
              name="phone"
              type="tel"
              required
              placeholder="04XX XXX XXX"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-neutral-900">Email</label>
              <input name="email" type="email" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
              {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-900">Date of birth</label>
              <input
                name="date_of_birth"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-900">Goals</label>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {GOAL_OPTIONS.filter((g) => g.code !== "other").map((goal) => (
                <label key={goal.code} className="flex items-center gap-1.5 text-xs text-neutral-700">
                  <input type="checkbox" name="goals" value={goal.code} className="accent-neutral-900" />
                  {goal.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-neutral-900">Gender preference</label>
              <select
                name="gender_preference"
                defaultValue=""
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="">Not known</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="no_preference">No preference</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-900">Time preference</label>
              <select
                name="time_preference"
                defaultValue=""
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="">Not known</option>
                <option value="AM">Morning</option>
                <option value="PM">Evening</option>
                <option value="either">Either</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-900">Trainer requested</label>
            <select
              name="preferred_trainer_id"
              defaultValue=""
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">No preference</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-900">Best way and time to reach them</label>
            <input
              name="contact_preference"
              type="text"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
