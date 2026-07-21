"use client";

import { useOnboardingView } from "./ViewProvider";

// The blue "Worked example" boxes from the PT Manager Cheat Sheet: a model
// answer (usually in the voice of the example trainer, Taylor) to hold up to
// a PT who's stuck. Manager view only.
export function WorkedExample({ example }: { example?: string }) {
  const { view } = useOnboardingView();
  if (view !== "manager" || !example) return null;

  return (
    <div
      className="mt-3 flex gap-2.5 rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
      style={{ background: "var(--ob-success-soft)", border: "1px solid var(--ob-border)" }}
    >
      <span aria-hidden className="mt-0.5 shrink-0" style={{ color: "var(--ob-success)" }}>
        ✎
      </span>
      <div>
        <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--ob-success)" }}>
          Worked example
        </div>
        <p style={{ color: "var(--ob-text)", whiteSpace: "pre-line" }}>{example}</p>
      </div>
    </div>
  );
}
