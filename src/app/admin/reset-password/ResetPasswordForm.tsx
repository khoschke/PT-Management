"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { resetPassword } from "./actions";
import { initialResetPasswordState } from "./state";

const inputClass =
  "mt-2 w-full rounded-xl border-none bg-fill px-4 py-3.5 text-[17px] text-foreground outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-foreground";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="press mt-2 flex w-full items-center justify-center gap-2.5 rounded-full bg-foreground px-6 py-3.5 text-[17px] font-semibold text-white outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && (
        <span
          aria-hidden
          className="spinner h-[18px] w-[18px] rounded-full border-2 border-white/30 border-t-white"
        />
      )}
      {pending ? "Saving" : "Set new password"}
    </button>
  );
}

export default function ResetPasswordForm({ email }: { email: string | null }) {
  const [state, formAction] = useActionState(resetPassword, initialResetPasswordState);
  const errors = state.fieldErrors ?? {};

  return (
    <div className="rounded-3xl border border-black/5 bg-surface p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
      <h1 className="display-heading text-2xl text-foreground">Set a new password</h1>
      <p className="mt-1 text-[15px] text-secondary-label">
        {email ? `For ${email}. ` : ""}At least 8 characters. You&rsquo;ll be signed in once it&rsquo;s saved.
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        {state.status === "error" && state.message && (
          <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {state.message}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-[15px] font-semibold text-foreground">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoFocus
            autoComplete="new-password"
            className={inputClass}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirm" className="block text-[15px] font-semibold text-foreground">
            Confirm new password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            className={inputClass}
          />
          {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>}
        </div>

        <SubmitButton />

        <Link
          href="/admin/login"
          className="mt-1 text-center text-[15px] font-semibold text-foreground underline"
        >
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
