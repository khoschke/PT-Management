"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { GOAL_OPTIONS } from "@/lib/goals";
import { submitLead, initialLeadFormState } from "../actions";

interface Trainer {
  id: string;
  name: string;
}

function dateBounds() {
  const today = new Date();
  const max = today.toISOString().split("T")[0];
  const min = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];
  return { min, max };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-neutral-900 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
    >
      {pending ? "Sending..." : "Get me booked in"}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-red-700">{message}</p>;
}

const labelClass = "block text-sm font-semibold text-neutral-900";
const inputClass =
  "mt-1.5 w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900";

export default function PTSessionForm({ trainers }: { trainers: Trainer[] }) {
  const [state, formAction] = useActionState(submitLead, initialLeadFormState);
  const [showOtherGoal, setShowOtherGoal] = useState(false);
  const { min, max } = dateBounds();
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-neutral-900">You&rsquo;re all set</h2>
        <p className="mt-3 text-base leading-relaxed text-neutral-700">
          Thanks, you&rsquo;re all set. One of our trainers will be in touch within a
          couple of days to lock in your complimentary session. Can&rsquo;t wait to
          get you started.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      {state.status === "error" && state.message && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </div>
      )}

      {/* 1. Name */}
      <div>
        <label htmlFor="name" className={labelClass}>
          Name <span className="text-neutral-400">(required)</span>
        </label>
        <input id="name" name="name" type="text" required autoComplete="name" className={inputClass} />
        <FieldError message={errors.name} />
      </div>

      {/* 2. Phone */}
      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone <span className="text-neutral-400">(required)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="04XX XXX XXX"
          className={inputClass}
        />
        <FieldError message={errors.phone} />
      </div>

      {/* 3. Email */}
      <div>
        <label htmlFor="email" className={labelClass}>
          Email <span className="text-neutral-400">(required)</span>
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
        <FieldError message={errors.email} />
      </div>

      {/* 4. Date of birth */}
      <div>
        <label htmlFor="date_of_birth" className={labelClass}>
          Date of birth <span className="text-neutral-400">(required)</span>
        </label>
        <input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          required
          min={min}
          max={max}
          className={inputClass}
        />
        <FieldError message={errors.date_of_birth} />
      </div>

      {/* 5. Goals */}
      <fieldset>
        <legend className={labelClass}>
          What are you looking to achieve? <span className="text-neutral-400">(required, choose at least one)</span>
        </legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {GOAL_OPTIONS.map((goal) => (
            <label
              key={goal.code}
              className="flex items-start gap-2.5 rounded-md border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-800 has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50"
            >
              <input
                type="checkbox"
                name="goals"
                value={goal.code}
                className="mt-0.5 h-4 w-4 shrink-0 accent-neutral-900"
                onChange={
                  goal.code === "other"
                    ? (e) => setShowOtherGoal(e.target.checked)
                    : undefined
                }
              />
              {goal.label}
            </label>
          ))}
        </div>
        {showOtherGoal && (
          <input
            type="text"
            name="goal_other"
            placeholder="Tell us more"
            maxLength={300}
            className={`${inputClass} mt-2`}
          />
        )}
        <FieldError message={errors.goals} />
      </fieldset>

      {/* 6. Current exercise */}
      <div>
        <label htmlFor="current_exercise" className={labelClass}>
          What exercise are you currently doing each week, if any?
        </label>
        <input id="current_exercise" name="current_exercise" type="text" className={inputClass} />
      </div>

      {/* 7. Trainer gender preference */}
      <fieldset>
        <legend className={labelClass}>Do you prefer a male or female trainer?</legend>
        <div className="mt-2 flex gap-2">
          {[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "no_preference", label: "No preference" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-neutral-300 px-3 py-2.5 text-sm text-neutral-800 has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50"
            >
              <input type="radio" name="gender_preference" value={opt.value} className="accent-neutral-900" />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* 8. Time preference */}
      <fieldset>
        <legend className={labelClass}>Do you prefer training in the morning or evening?</legend>
        <div className="mt-2 flex gap-2">
          {[
            { value: "AM", label: "Morning" },
            { value: "PM", label: "Evening" },
            { value: "either", label: "Either" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-neutral-300 px-3 py-2.5 text-sm text-neutral-800 has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50"
            >
              <input type="radio" name="time_preference" value={opt.value} className="accent-neutral-900" />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* 9. Preferred trainer */}
      <div>
        <label htmlFor="preferred_trainer_id" className={labelClass}>
          Is there a particular trainer you&rsquo;d like to see?
        </label>
        <select id="preferred_trainer_id" name="preferred_trainer_id" defaultValue="" className={inputClass}>
          <option value="">No preference</option>
          {trainers.map((trainer) => (
            <option key={trainer.id} value={trainer.id}>
              {trainer.name}
            </option>
          ))}
        </select>
      </div>

      {/* 10. Contact preference */}
      <div>
        <label htmlFor="contact_preference" className={labelClass}>
          Best way and time to reach you?
        </label>
        <input
          id="contact_preference"
          name="contact_preference"
          type="text"
          placeholder="e.g. text after 5pm"
          className={inputClass}
        />
      </div>

      <SubmitButton />
    </form>
  );
}
