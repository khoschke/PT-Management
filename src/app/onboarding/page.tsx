import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { onboardingParts, totalActivityCount } from "@/lib/onboarding/content";
import {
  getTrainerOnboardingState,
  effectivePartStatus,
  partCompletionFraction,
} from "@/lib/onboarding/progress";

export default async function OnboardingOverviewPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const state = await getTrainerOnboardingState(supabase, user?.profile?.trainer_id ?? null);
  const isTrainer = user?.profile?.role === "trainer";

  const activeParts = onboardingParts.filter((p) => !p.pending);
  const totalActivities = activeParts.reduce((sum, p) => sum + totalActivityCount(p), 0);
  const answeredActivities = activeParts.reduce(
    (sum, p) => sum + Math.round(partCompletionFraction(p.number, state) * totalActivityCount(p)),
    0,
  );
  const overallPct = totalActivities > 0 ? Math.round((answeredActivities / totalActivities) * 100) : 0;

  return (
    <div className="flex flex-col gap-8">
      <section
        className="rounded-3xl p-8 sm:p-10"
        style={{ background: "var(--ob-surface)", boxShadow: "var(--ob-shadow)" }}
      >
        <p className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--ob-accent)" }}>
          Fitaz Gym · Personal Trainer Onboarding
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {isTrainer ? "Your 12-week onboarding journey" : "PT onboarding, at a glance"}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed" style={{ color: "var(--ob-text-secondary)" }}>
          Ten parts, from the role itself through to building and running your business. Work through
          them at your own pace — the activities save automatically as you go, and your four one-hour
          sessions with the PT Manager are yours to book whenever they&rsquo;re most useful.
        </p>

        {isTrainer && (
          <div className="mt-7 flex items-center gap-4">
            <div
              className="h-2.5 flex-1 overflow-hidden rounded-full"
              style={{ background: "var(--ob-border)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${overallPct}%`, background: "var(--ob-accent)" }}
              />
            </div>
            <span className="text-sm font-semibold tabular-nums">{overallPct}%</span>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {onboardingParts.map((part) => {
          const status = effectivePartStatus(part.number, state);
          const pct = Math.round(partCompletionFraction(part.number, state) * 100);
          return (
            <Link
              key={part.number}
              href={`/onboarding/${part.number}`}
              className="group flex flex-col justify-between rounded-2xl p-6 transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--ob-surface)", boxShadow: "var(--ob-shadow)" }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: "var(--ob-text-secondary)" }}
                  >
                    Part {part.number}
                  </span>
                  {part.pending ? (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ background: "var(--ob-border)", color: "var(--ob-text-secondary)" }}
                    >
                      Pending source
                    </span>
                  ) : status === "complete" ? (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ background: "var(--ob-success-soft)", color: "var(--ob-success)" }}
                    >
                      Complete
                    </span>
                  ) : status === "in_progress" ? (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ background: "var(--ob-amber-soft)", color: "var(--ob-amber)" }}
                    >
                      In progress
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold" style={{ color: "var(--ob-text-secondary)" }}>
                      Not started
                    </span>
                  )}
                </div>
                <h2 className="mt-1.5 text-lg font-semibold tracking-tight">{part.title}</h2>
                <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed" style={{ color: "var(--ob-text-secondary)" }}>
                  {part.intro}
                </p>
              </div>

              {isTrainer && !part.pending && totalActivityCount(part) > 0 && (
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--ob-border)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: "var(--ob-accent)" }}
                    />
                  </div>
                  <span className="text-[12px] font-medium tabular-nums" style={{ color: "var(--ob-text-secondary)" }}>
                    {pct}%
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </section>
    </div>
  );
}
