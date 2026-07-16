"use client";

import { useOnboardingView } from "./ViewProvider";

export function ViewToggle() {
  const { view, setView } = useOnboardingView();

  return (
    <div
      className="inline-flex rounded-full p-0.5 text-[13px] font-medium"
      style={{ background: "var(--ob-surface-raised)", border: "1px solid var(--ob-border)" }}
      role="tablist"
      aria-label="View as"
    >
      {(["pt", "manager"] as const).map((option) => {
        const active = view === option;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setView(option)}
            className="rounded-full px-3.5 py-1.5 transition-colors"
            style={
              active
                ? { background: "var(--ob-accent)", color: "#fff" }
                : { color: "var(--ob-text-secondary)" }
            }
          >
            {option === "pt" ? "PT view" : "Manager view"}
          </button>
        );
      })}
    </div>
  );
}
