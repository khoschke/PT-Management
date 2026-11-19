"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

// Without this, any error in the workbook falls through to Next's bare "This
// page couldn't load" screen. Here the header and part list stay put and
// "Try again" re-fetches the page from the server rather than only
// re-rendering what already failed.
export default function OnboardingError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  return (
    <div
      className="rounded-3xl p-8 text-center sm:p-10"
      style={{ background: "var(--ob-surface)", boxShadow: "var(--ob-shadow)" }}
    >
      <h1 className="text-xl font-bold tracking-tight">This part didn&rsquo;t load</h1>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed" style={{ color: "var(--ob-text-secondary)" }}>
        Usually that&rsquo;s a dropped connection. Your saved answers are safe.
      </p>
      <button
        type="button"
        onClick={() =>
          startTransition(() => {
            router.refresh();
            reset();
          })
        }
        className="mt-6 rounded-full px-5 py-2.5 text-[14px] font-semibold text-white"
        style={{ background: "var(--ob-accent)" }}
      >
        Try again
      </button>
    </div>
  );
}
