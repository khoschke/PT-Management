"use client";

import { useState, useTransition } from "react";
import { setPartStatus } from "../actions";
import type { OnboardingPartStatus } from "@/lib/onboarding/progress";

const OPTIONS: { value: OnboardingPartStatus; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "complete", label: "Complete" },
];

export function PartStatusControl({
  partNumber,
  initialStatus,
}: {
  partNumber: number;
  initialStatus: OnboardingPartStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-medium" style={{ color: "var(--ob-text-secondary)" }}>
        Progress:
      </span>
      <div
        className="inline-flex rounded-full p-0.5 text-[13px] font-medium"
        style={{ background: "var(--ob-surface-raised)", border: "1px solid var(--ob-border)" }}
      >
        {OPTIONS.map((opt) => {
          const active = status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={isPending}
              onClick={() => {
                const previous = status;
                setStatus(opt.value);
                startTransition(async () => {
                  // A failed request (a dropped connection, a suspended tab)
                  // would otherwise reject uncaught and take the page down.
                  // Put the old status back so the control shows what is saved.
                  try {
                    const result = await setPartStatus(partNumber, opt.value);
                    if (!result.ok) setStatus(previous);
                  } catch {
                    setStatus(previous);
                  }
                });
              }}
              className="rounded-full px-3 py-1.5 transition-colors disabled:opacity-60"
              style={
                active
                  ? { background: "var(--ob-accent)", color: "#fff" }
                  : { color: "var(--ob-text-secondary)" }
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
