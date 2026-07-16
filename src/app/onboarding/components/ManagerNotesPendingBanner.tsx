"use client";

import { useOnboardingView } from "./ViewProvider";

export function ManagerNotesPendingBanner({ hasAnyNotes }: { hasAnyNotes: boolean }) {
  const { view } = useOnboardingView();
  if (view !== "manager" || hasAnyNotes) return null;

  return (
    <div
      className="mt-5 rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
      style={{ background: "var(--ob-amber-soft)", color: "var(--ob-amber)" }}
    >
      Coaching notes for this part are pending the PT Manager Cheat Sheet, which hasn&rsquo;t been
      written yet &mdash; only the trainer&rsquo;s material below exists so far.
    </div>
  );
}
