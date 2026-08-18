"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { GOAL_OPTIONS } from "@/lib/goals";
import { submitLead } from "../actions";
import { initialLeadFormState } from "../state";

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
      className="press flex w-full items-center justify-center gap-2.5 rounded-full bg-foreground px-6 py-4 text-[17px] font-semibold tracking-[-0.01em] text-white outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && (
        <span
          aria-hidden
          className="spinner h-[18px] w-[18px] rounded-full border-2 border-white/30 border-t-white"
        />
      )}
      {pending ? "Sending your details" : "Get me booked in"}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-sm text-red-600" role="alert">
      {message}
    </p>
  );
}

const labelClass = "flex items-baseline gap-2 text-[15px] font-semibold tracking-[-0.01em] text-foreground";
const inputClass =
  "mt-2 w-full rounded-xl border-none bg-fill px-4 py-3.5 text-[17px] text-foreground placeholder:text-secondary-label/70 outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-foreground";

// Quiet marker so the required core (name, phone, email, DOB) reads clearly
// against the fields a member can safely skip.
function Optional() {
  return <span className="text-[13px] font-normal tracking-normal text-secondary-label">Optional</span>;
}

// One grouped card in the run of the form, iOS-settings style: a quiet section
// eyebrow above a white card of related fields. Turns a flat wall of inputs
// into a legible rhythm.
function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 px-1">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-secondary-label">
          {title}
        </h2>
        {hint && <p className="mt-1 text-[13px] leading-snug text-secondary-label">{hint}</p>}
      </div>
      <div className="flex flex-col gap-5 rounded-2xl border border-black/5 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.05)] sm:p-6">
        {children}
      </div>
    </section>
  );
}

// Keyboard focus has to be visible even though the real input is sr-only, so
// the whole pill takes a focus ring when its control is focused via keyboard.
const selectableFocus =
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground";

function SegmentedControl({
  name,
  options,
  onOptionChange,
}: {
  name: string;
  options: { value: string; label: string }[];
  onOptionChange?: (value: string) => void;
}) {
  return (
    <div className="mt-2 flex gap-1 rounded-xl bg-fill p-1">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`press flex flex-1 cursor-pointer items-center justify-center rounded-lg px-3 py-2.5 text-center text-sm font-medium text-foreground transition has-[:checked]:bg-foreground has-[:checked]:text-white has-[:checked]:shadow-sm ${selectableFocus}`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            className="sr-only"
            onChange={onOptionChange ? () => onOptionChange(opt.value) : undefined}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

export default function PTSessionForm({ trainers }: { trainers: Trainer[] }) {
  const [state, formAction] = useActionState(submitLead, initialLeadFormState);
  const [showOtherGoal, setShowOtherGoal] = useState(false);
  const { min, max } = dateBounds();
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="animate-scale-in rounded-3xl border border-black/5 bg-surface p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-foreground">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8"
            fill="none"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path className="animate-check" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-6 text-[26px] font-semibold tracking-tight text-foreground">
          You&rsquo;re all set
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-[17px] leading-relaxed text-secondary-label">
          One of our trainers will be in touch within a couple of days to lock in your
          complimentary session. Can&rsquo;t wait to get you started.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-7 sm:gap-8">
      {state.status === "error" && state.message && (
        <div
          className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-700"
          role="alert"
        >
          {state.message}
        </div>
      )}

      <Section title="About you">
        {/* 1. Name */}
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input id="name" name="name" type="text" required autoComplete="name" className={inputClass} />
          <FieldError message={errors.name} />
        </div>

        {/* 2. Phone */}
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
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
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
          <FieldError message={errors.email} />
        </div>

        {/* 4. Date of birth */}
        <div>
          <label htmlFor="date_of_birth" className={labelClass}>
            Date of birth
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
      </Section>

      <Section title="Your goals">
        {/* 5. Goals */}
        <fieldset>
          <legend className={labelClass}>What are you looking to achieve?</legend>
          <p className="mt-1 text-sm text-secondary-label">Choose at least one</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((goal) => (
              <label
                key={goal.code}
                className={`press cursor-pointer rounded-full bg-fill px-4 py-2.5 text-sm font-medium text-foreground transition has-[:checked]:bg-foreground has-[:checked]:text-white ${selectableFocus}`}
              >
                <input
                  type="checkbox"
                  name="goals"
                  value={goal.code}
                  className="sr-only"
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
              className={`${inputClass} animate-fade-in`}
            />
          )}
          <FieldError message={errors.goals} />
        </fieldset>

        {/* 6. Current exercise */}
        <div>
          <label htmlFor="current_exercise" className={labelClass}>
            What exercise are you currently doing each week?
            <Optional />
          </label>
          <input id="current_exercise" name="current_exercise" type="text" className={inputClass} />
        </div>
      </Section>

      <Section title="Preferences" hint="All optional. These just help us match you with the right trainer.">
        {/* 7. Trainer gender preference */}
        <fieldset>
          <legend className={labelClass}>Do you prefer a male or female trainer?</legend>
          <SegmentedControl
            name="gender_preference"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "no_preference", label: "No preference" },
            ]}
          />
        </fieldset>

        {/* 8. Time preference */}
        <fieldset>
          <legend className={labelClass}>Do you prefer training in the morning or evening?</legend>
          <SegmentedControl
            name="time_preference"
            options={[
              { value: "AM", label: "Morning" },
              { value: "PM", label: "Evening" },
              { value: "either", label: "Either" },
            ]}
          />
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
      </Section>

      <div className="flex flex-col gap-3">
        <SubmitButton />
        <p className="text-center text-[13px] text-secondary-label">
          We usually reply within 48 hours. No spam, ever.
        </p>
      </div>
    </form>
  );
}
