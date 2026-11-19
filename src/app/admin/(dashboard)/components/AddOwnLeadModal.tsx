"use client";

import { useState } from "react";
import SpecialtyPicker from "./SpecialtyPicker";
import { FOUND_VIA_OPTIONS } from "@/lib/types";
import { addOwnLead } from "../actions";
import { blank, useLeadForm } from "./useLeadForm";

// A trainer adds a lead they found themselves (Part 7 amendments, item 8). The
// lead is allocated straight to them; the database refuses a phone number
// that's already in the portal.

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

export default function AddOwnLeadModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [foundVia, setFoundVia] = useState("");
  const { formRef, onSubmit, errors, message, isPending } = useLeadForm(addOwnLead, onSaved, (fd) => {
    const e: Record<string, string> = {};
    if (!fd.get("found_via")) e.found_via = "Choose where you found them";
    else if (fd.get("found_via") === "other" && blank(fd, "found_via_other")) e.found_via_other = "Say where you found them";
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
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Add my own lead</h2>
            <p className="mt-1 text-sm text-secondary-label">
              Someone you found yourself. They&apos;re allocated straight to you, and the 48-hour clock starts now.
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

          <div data-field="found_via">
            <label className="text-sm font-semibold text-foreground">Where did you find them?</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {FOUND_VIA_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="press cursor-pointer rounded-full bg-fill px-3 py-1.5 text-xs font-medium text-foreground transition has-[:checked]:bg-foreground has-[:checked]:text-white"
                >
                  <input
                    type="radio"
                    name="found_via"
                    value={option.value}
                    onChange={() => setFoundVia(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {errors.found_via && <p className="mt-1 text-xs text-red-600">{errors.found_via}</p>}
            {foundVia === "other" && (
              <div data-field="found_via_other">
                <input
                  name="found_via_other"
                  type="text"
                  maxLength={200}
                  placeholder="Where, in a few words"
                  className={inputClass}
                />
                {errors.found_via_other && <p className="mt-1 text-xs text-red-600">{errors.found_via_other}</p>}
              </div>
            )}
          </div>

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

          <div data-field="email">
            <label className="text-sm font-semibold text-foreground">
              Email <span className="font-normal text-secondary-label">(optional)</span>
            </label>
            <input name="email" type="email" className={inputClass} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground">
              Tags <span className="font-normal text-secondary-label">(optional)</span>
            </label>
            <SpecialtyPicker name="goals" />
          </div>

          <SubmitButton pending={isPending} />
        </form>
      </div>
    </div>
  );
}
