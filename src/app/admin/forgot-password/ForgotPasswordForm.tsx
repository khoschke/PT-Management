"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordReset } from "./actions";
import { initialForgotPasswordState } from "./state";

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
      {pending ? "Sending" : "Send reset link"}
    </button>
  );
}

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initialForgotPasswordState);

  return (
    <div className="rounded-3xl border border-black/5 bg-surface p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
      <h1 className="display-heading text-2xl text-foreground">Reset your password</h1>
      <p className="mt-1 text-[15px] text-secondary-label">
        Enter the email you sign in with and we&rsquo;ll send you a link to set a new password.
      </p>

      {state.status === "sent" ? (
        <>
          <div className="mt-6 rounded-xl bg-green-50 px-3.5 py-3 text-sm text-green-700">
            {state.message}
          </div>
          <p className="mt-4 text-[15px] text-secondary-label">
            Open the link on this device, in this browser. If you request another
            email, only the newest link will work &mdash; the earlier ones stop
            working straight away.
          </p>
          <p className="mt-3 text-[15px] text-secondary-label">
            Didn&rsquo;t get it? Check your junk folder, or ask a manager to reset your
            password from the Staff screen.
          </p>
          <Link
            href="/admin/login"
            className="mt-6 inline-block text-[15px] font-semibold text-foreground underline"
          >
            Back to sign in
          </Link>
        </>
      ) : (
        <form action={formAction} className="mt-6 flex flex-col gap-4">
          {state.status === "error" && state.message && (
            <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {state.message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-[15px] font-semibold text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              className={inputClass}
            />
          </div>

          <SubmitButton />

          <Link
            href="/admin/login"
            className="mt-1 text-center text-[15px] font-semibold text-foreground underline"
          >
            Back to sign in
          </Link>
        </form>
      )}
    </div>
  );
}
