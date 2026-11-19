"use client";

import SpecialtyPicker from "./SpecialtyPicker";
import { LEAD_SOURCE_LABELS, MANUAL_LEAD_SOURCES, type Trainer } from "@/lib/types";
import { addSweepLead } from "../actions";
import { blank, useLeadForm } from "./useLeadForm";

const inputClass =
  "mt-1.5 w-full rounded-xl border-none bg-fill px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-foreground";

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="press w-full rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save lead"}
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
  const { formRef, onSubmit, errors, message, isPending } = useLeadForm(addSweepLead, onSaved, (fd) => {
    const e: Record<string, string> = {};
    if (!fd.get("lead_source")) e.lead_source = "Choose flagged or unverified";
    if (blank(fd, "name")) e.name = "Add their name";
    if (blank(fd, "phone")) e.phone = "Add their phone number";
    return e;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px] animate-[fadeIn_180ms_ease-out]"
    >
      {/* No click-outside close on purpose: a stray click or an autofill popup
          shouldn't throw away a half-typed lead. The X is the only way out. */}
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-surface p-6 shadow-2xl animate-[scaleIn_200ms_cubic-bezier(0.2,0.8,0.2,1)] sm:p-7"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Add lead</h2>
            <p className="mt-1 text-sm text-secondary-label">
              Choose the lead type, then add their details. Only name and phone are required, this is meant to be fast.
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

        <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-5 flex flex-col gap-4">
          {message && (
            <div data-form-message role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {message}
            </div>
          )}

          <fieldset data-field="lead_source">
            <legend className="text-sm font-semibold text-foreground">Lead type</legend>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
              {MANUAL_LEAD_SOURCES.map((source) => (
                <label
                  key={source}
                  className="press cursor-pointer rounded-2xl bg-fill px-3.5 py-3 ring-1 ring-transparent transition has-[:checked]:ring-2 has-[:checked]:ring-foreground"
                >
                  <input type="radio" name="lead_source" value={source} className="sr-only" />
                  <span className="block text-sm font-semibold text-foreground">{LEAD_SOURCE_LABELS[source].label}</span>
                  <span className="mt-0.5 block text-xs text-secondary-label">{LEAD_SOURCE_LABELS[source].hint}</span>
                </label>
              ))}
            </div>
            {errors.lead_source && <p className="mt-1 text-xs text-red-600">{errors.lead_source}</p>}
          </fieldset>

          <div data-field="name">
            <label className="text-sm font-semibold text-foreground">Name</label>
            <input name="name" type="text" className={inputClass} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div data-field="phone">
            <label className="text-sm font-semibold text-foreground">Phone</label>
            <input name="phone" type="tel" placeholder="04XX XXX XXX" className={inputClass} />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div data-field="email">
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
            <label className="text-sm font-semibold text-foreground">Tags</label>
            <SpecialtyPicker name="goals" />
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

          <SubmitButton pending={isPending} />
        </form>
      </div>
    </div>
  );
}
