"use client";

import { useOnboardingView } from "./ViewProvider";

export function ManagerNote({ note }: { note?: string }) {
  const { view } = useOnboardingView();
  if (view !== "manager" || !note) return null;

  return (
    <div
      className="mt-4 flex gap-2.5 rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
      style={{
        background: "var(--ob-accent-soft)",
        border: "1px solid var(--ob-border)",
      }}
    >
      <span aria-hidden className="mt-0.5 shrink-0" style={{ color: "var(--ob-accent)" }}>
        ◆
      </span>
      <div>
        <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--ob-accent)" }}>
          For the PT Manager
        </div>
        <p style={{ color: "var(--ob-text)" }}>{note}</p>
      </div>
    </div>
  );
}
