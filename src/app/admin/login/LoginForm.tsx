"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, initialLoginState } from "./actions";

const inputClass =
  "mt-2 w-full rounded-xl border-none bg-fill px-4 py-3.5 text-[17px] text-foreground outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-foreground";

export default function LoginForm() {
  const [state, formAction] = useActionState(login, initialLoginState);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/admin";

  return (
    <div className="rounded-3xl border border-black/5 bg-surface p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">PT leads dashboard</h1>
      <p className="mt-1 text-[15px] text-secondary-label">Sign in to continue.</p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        {state.status === "error" && state.message && (
          <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.message}</div>
        )}

        <div>
          <label htmlFor="email" className="block text-[15px] font-semibold text-foreground">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
        </div>

        <div>
          <label htmlFor="password" className="block text-[15px] font-semibold text-foreground">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="press mt-2 w-full rounded-full bg-foreground px-6 py-3.5 text-[17px] font-semibold text-white"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
