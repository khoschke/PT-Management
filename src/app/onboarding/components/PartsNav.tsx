"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { OnboardingPartStatus } from "@/lib/onboarding/progress";

export interface PartNavItem {
  number: number;
  title: string;
  status: OnboardingPartStatus;
  fraction: number;
  pending?: boolean;
}

function StatusDot({ status, pending }: { status: OnboardingPartStatus; pending?: boolean }) {
  if (pending) {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
        style={{ background: "var(--ob-border)", color: "var(--ob-text-secondary)" }}
      >
        &hellip;
      </span>
    );
  }
  if (status === "complete") {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
        style={{ background: "var(--ob-success)" }}
      >
        ✓
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
        style={{ background: "var(--ob-amber-soft)", color: "var(--ob-amber)", border: "1.5px solid var(--ob-amber)" }}
      >
        &middot;
      </span>
    );
  }
  return (
    <span
      className="h-6 w-6 shrink-0 rounded-full"
      style={{ border: "1.5px solid var(--ob-border)" }}
    />
  );
}

export function PartsNav({ items }: { items: PartNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto pb-2 md:sticky md:top-24 md:h-fit md:w-64 md:flex-col md:gap-1 md:overflow-visible md:pb-0"
      aria-label="Onboarding parts"
    >
      <Link
        href="/onboarding"
        className="hidden rounded-xl px-3 py-2 text-sm font-semibold transition-colors md:block"
        style={{
          color: pathname === "/onboarding" ? "var(--ob-accent)" : "var(--ob-text-secondary)",
        }}
      >
        Overview
      </Link>
      {items.map((item) => {
        const href = `/onboarding/${item.number}`;
        const active = pathname === href;
        return (
          <Link
            key={item.number}
            href={href}
            className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors md:shrink"
            style={{
              background: active ? "var(--ob-surface)" : "transparent",
              boxShadow: active ? "var(--ob-shadow)" : "none",
              color: active ? "var(--ob-text)" : "var(--ob-text-secondary)",
              fontWeight: active ? 600 : 500,
            }}
          >
            <StatusDot status={item.status} pending={item.pending} />
            <span className="whitespace-nowrap md:whitespace-normal">
              <span className="mr-1.5 opacity-60">{item.number}.</span>
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
