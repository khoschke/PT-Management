"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { changeEmail } from "../actions";
import { initialAccountFormState } from "../state";
import PasswordInput from "@/app/admin/components/PasswordInput";

const inputClass =
  "mt-1.5 w-full rounded-xl border-none bg-fill px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-foreground";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="press self-start rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
    >
      {pending ? "Sending..." : "Send confirmation link"}
    </button>
  );
}

export default function ChangeEmailForm({ pendingEmail }: { pendingEmail: string | null }) {
  const [state, formAction] = useActionState(changeEmail, initialAccountFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 max-w-md rounded-2xl border border-black/5 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <h2 className="text-sm font-semibold text-foreground">Change sign-in email</h2>
      <p className="mt-0.5 text-xs text-secondary-label">
        We&rsquo;ll email a confirmation link to the new address <strong>and to your
        current one</strong>. For security both have to be clicked. Nothing changes
        until then, so keep signing in with your current email in the meantime.
      </p>

      {pendingEmail && state.status !== "success" && (
        <div className="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
          Waiting on confirmation for <strong>{pendingEmail}</strong>. Check{" "}
          <strong>both</strong> inboxes &mdash; that one and your current address &mdash;
          and click both links. Clicking only one leaves the change half-done and
          signs you out without finishing it. Sending a new one below replaces both links.
        </div>
      )}

      {state.status === "success" && state.message && (
        <div className="mt-3 rounded-xl bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
          {state.message}
        </div>
      )}
      {state.status === "error" && state.message && (
        <div className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <div className="mt-3">
        <label htmlFor="newEmail" className="text-sm font-semibold text-foreground">
          New email
        </label>
        <input
          id="newEmail"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      <div className="mt-3">
        <label htmlFor="emailCurrentPassword" className="text-sm font-semibold text-foreground">
          Current password
        </label>
        <PasswordInput
          id="emailCurrentPassword"
          name="currentPassword"
          required
          autoComplete="current-password"
          className={inputClass}
        />
        {errors.currentPassword && (
          <p className="mt-1 text-xs text-red-600">{errors.currentPassword}</p>
        )}
      </div>

      <div className="mt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
