"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { initialAddSweepLeadState, type AddSweepLeadState } from "../state";

// Shared behaviour for the two "add a lead" forms (the manager's Add lead and
// a trainer's Add my own lead), from Karl's test on 18 Nov 2026:
//
// - The browser's own "Please fill in this field" bubbles are switched off
//   (noValidate). On a long, scrolled form they pointed at the wrong field,
//   and they can't point at the styled pill buttons at all. Missing fields get
//   a red message under them instead, and the form scrolls to the first one.
// - The form is submitted by hand rather than through `<form action>`, because
//   React resets a form after an action runs. A duplicate or a typo then wiped
//   everything the trainer had typed.

type LeadAction = (prev: AddSweepLeadState, formData: FormData) => Promise<AddSweepLeadState>;

export function useLeadForm(
  action: LeadAction,
  onSaved: () => void,
  validate: (formData: FormData) => Record<string, string>,
) {
  const [state, dispatch, isPending] = useActionState(action, initialAddSweepLeadState);
  const [localErrors, setLocalErrors] = useState<Record<string, string> | null>(null);
  const [attempt, setAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const errors = localErrors ?? state.fieldErrors ?? {};
  const message = localErrors
    ? "Please fill in the highlighted fields."
    : state.status === "error"
      ? state.message
      : undefined;

  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state.status, onSaved]);

  // After a failed attempt (caught here or by the server), bring the first
  // problem into view and put the cursor there.
  useEffect(() => {
    if (attempt === 0 && state.status !== "error") return;
    const form = formRef.current;
    if (!form) return;
    const firstKey = Object.keys(localErrors ?? state.fieldErrors ?? {})[0];
    const target =
      (firstKey && form.querySelector<HTMLElement>(`[data-field="${firstKey}"]`)) ||
      form.querySelector<HTMLElement>("[data-form-message]");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.querySelector<HTMLElement>("input, select, textarea")?.focus({ preventScroll: true });
  }, [attempt, state, localErrors]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const found = validate(formData);
    setAttempt((n) => n + 1);
    if (Object.keys(found).length > 0) {
      setLocalErrors(found);
      return;
    }
    setLocalErrors(null);
    startTransition(() => dispatch(formData));
  }

  return { formRef, onSubmit, errors, message, isPending };
}

/** True when a text field in the form is empty or only spaces. */
export function blank(formData: FormData, name: string): boolean {
  return !(formData.get(name)?.toString().trim() ?? "");
}
