"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, initialLoginState } from "./actions";

export default function LoginForm() {
  const [state, formAction] = useActionState(login, initialLoginState);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/admin";

  return (
    <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8">
      <h1 className="text-xl font-bold text-neutral-900">Fitaz Gym PT leads</h1>
      <p className="mt-1 text-sm text-neutral-600">Sign in to the dashboard.</p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        {state.status === "error" && state.message && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {state.message}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-neutral-900">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1.5 w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-base focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-neutral-900">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1.5 w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-base focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-md bg-neutral-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-neutral-700"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
