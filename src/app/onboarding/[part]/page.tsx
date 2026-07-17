import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPartByNumber, onboardingParts, TOTAL_PARTS } from "@/lib/onboarding/content";
import { getTrainerOnboardingState, effectivePartStatus } from "@/lib/onboarding/progress";
import { ActivityField } from "../components/ActivityField";
import { ManagerNote } from "../components/ManagerNote";
import { ManagerNotesPendingBanner } from "../components/ManagerNotesPendingBanner";
import { PartStatusControl } from "../components/PartStatusControl";
import { Prose } from "../components/Prose";
import { WorkedExample } from "../components/WorkedExample";

export function generateStaticParams() {
  return onboardingParts.map((p) => ({ part: String(p.number) }));
}

export default async function OnboardingPartPage({
  params,
}: {
  params: Promise<{ part: string }>;
}) {
  const { part: partParam } = await params;
  const partNumber = Number(partParam);
  const part = Number.isFinite(partNumber) ? getPartByNumber(partNumber) : undefined;
  if (!part) notFound();

  const user = await getCurrentUser();
  const isTrainer = user?.profile?.role === "trainer";
  const supabase = await createClient();
  const state = await getTrainerOnboardingState(supabase, user?.profile?.trainer_id ?? null);
  const status = effectivePartStatus(part.number, state);

  const prev = part.number > 1 ? getPartByNumber(part.number - 1) : undefined;
  const next = part.number < TOTAL_PARTS ? getPartByNumber(part.number + 1) : undefined;
  const hasAnyManagerNotes = part.sections.some((s) => s.managerNote || s.workedExample);

  return (
    <article className="flex flex-col gap-6">
      <header
        className="rounded-3xl p-8 sm:p-10"
        style={{ background: "var(--ob-surface)", boxShadow: "var(--ob-shadow)" }}
      >
        <p className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--ob-accent)" }}>
          Part {part.number} of {TOTAL_PARTS}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{part.title}</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed" style={{ color: "var(--ob-text-secondary)" }}>
          {part.intro}
        </p>

        {part.pending && (
          <div
            className="mt-5 rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
            style={{ background: "var(--ob-amber-soft)", color: "var(--ob-amber)" }}
          >
            This part is a placeholder pending the source document — see the note below.
          </div>
        )}

        {isTrainer && !part.pending && (
          <div className="mt-6">
            <PartStatusControl partNumber={part.number} initialStatus={status} />
          </div>
        )}

        <ManagerNotesPendingBanner hasAnyNotes={hasAnyManagerNotes} />
      </header>

      <div className="flex flex-col gap-4">
        {part.sections.map((section) => (
          <section
            key={section.heading}
            className="rounded-3xl p-7 sm:p-8"
            style={{ background: "var(--ob-surface)", boxShadow: "var(--ob-shadow)" }}
          >
            <h2 className="text-lg font-semibold tracking-tight">{section.heading}</h2>
            <div className="mt-3">
              <Prose body={section.body} />
            </div>

            {section.activities?.map((activity) => (
              <ActivityField
                key={activity.key}
                partNumber={part.number}
                activityKey={activity.key}
                prompt={activity.prompt}
                placeholder={activity.placeholder}
                multiline={activity.multiline}
                initialValue={state.responses[`${part.number}:${activity.key}`] ?? ""}
                readOnly={!isTrainer}
              />
            ))}

            {section.links && section.links.length > 0 && (
              <div className="mt-4 flex flex-col gap-1.5">
                {section.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target={link.url.startsWith("/") ? undefined : "_blank"}
                    rel={link.url.startsWith("/") ? undefined : "noopener noreferrer"}
                    className="text-[13px] font-medium underline-offset-2 hover:underline"
                    style={{ color: "var(--ob-accent)" }}
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            )}

            <WorkedExample example={section.workedExample} />
            <ManagerNote note={section.managerNote} />
          </section>
        ))}
      </div>

      <nav className="mt-2 flex items-center justify-between gap-4">
        {prev ? (
          <Link
            href={`/onboarding/${prev.number}`}
            className="flex flex-col rounded-2xl px-5 py-3 text-left transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--ob-surface)", boxShadow: "var(--ob-shadow)" }}
          >
            <span className="text-[11px] font-semibold" style={{ color: "var(--ob-text-secondary)" }}>
              ← Part {prev.number}
            </span>
            <span className="text-[14px] font-medium">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/onboarding/${next.number}`}
            className="flex flex-col rounded-2xl px-5 py-3 text-right transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--ob-surface)", boxShadow: "var(--ob-shadow)" }}
          >
            <span className="text-[11px] font-semibold" style={{ color: "var(--ob-text-secondary)" }}>
              Part {next.number} →
            </span>
            <span className="text-[14px] font-medium">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
