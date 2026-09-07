"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { login } from "./actions";
import { initialLoginState } from "./state";

// Set by /admin/auth/callback when an emailed link couldn't be turned into a
// session. Mapped to fixed copy here so nothing from the URL is rendered.
const AUTH_ERRORS: Record<string, string> = {
  expired:
    "That link has expired or has already been used. Request a new one below.",
  verify:
    "We couldn't verify that link. Open it in the same browser you requested it from, or request a new one below.",
};

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
      {pending ? "Signing in" : "Sign in"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(login, initialLoginState);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/admin";
  const authError = AUTH_ERRORS[searchParams.get("authError") ?? ""];

  return (
    <div className="rounded-3xl border border-black/5 bg-surface p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
      <h1 className="display-heading text-2xl text-foreground">Sign in</h1>
      <p className="mt-1 text-[15px] text-secondary-label">Staff and trainer access</p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        {authError && state.status !== "error" && (
          <div className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">{authError}</div>
        )}

        {state.status === "error" && state.message && (
          <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.message}</div>
        )}

        <div>
          <label htmlFor="email" className="block text-[15px] font-semibold text-foreground">
            Email
          </label>
          <input id="email" name="email" type="email" required autoFocus autoComplete="email" className={inputClass} />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="block text-[15px] font-semibold text-foreground">
              Password
            </label>
            <Link
              href="/admin/forgot-password"
              className="text-[13px] font-semibold text-secondary-label underline hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
