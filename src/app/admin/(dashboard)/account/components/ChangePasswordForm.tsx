"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { changePassword } from "../actions";
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
      {pending ? "Saving..." : "Change password"}
    </button>
  );
}

export default function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePassword, initialAccountFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.fieldErrors ?? {};

  // Clear the fields after a successful change so the new password isn't left
  // sitting in the inputs.
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 max-w-md rounded-2xl border border-black/5 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <h2 className="text-sm font-semibold text-foreground">Change password</h2>
      <p className="mt-0.5 text-xs text-secondary-label">
        Sets a new password for your own login. At least 8 characters. You&rsquo;ll need
        your current password to confirm it&rsquo;s you.
      </p>

      {state.status === "success" && state.message && (
        <div className="mt-3 rounded-xl bg-green-50 px-3.5 py-2.5 text-sm text-green-700">{state.message}</div>
      )}
      {state.status === "error" && state.message && (
        <div className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.message}</div>
      )}

      <div className="mt-3">
        <label htmlFor="currentPassword" className="text-sm font-semibold text-foreground">
          Current password
        </label>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          required
          autoComplete="current-password"
          className={inputClass}
        />
        {errors.currentPassword && (
          <p className="mt-1 text-xs text-red-600">{errors.currentPassword}</p>
        )}
      </div>

      <div className="mt-3">
        <label htmlFor="password" className="text-sm font-semibold text-foreground">
          New password
        </label>
        <PasswordInput
          id="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
      </div>

      <div className="mt-3">
        <label htmlFor="confirm" className="text-sm font-semibold text-foreground">
          Confirm new password
        </label>
        <PasswordInput
          id="confirm"
          name="confirm"
          required
          autoComplete="new-password"
          className={inputClass}
        />
        {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>}
      </div>

      <div className="mt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
