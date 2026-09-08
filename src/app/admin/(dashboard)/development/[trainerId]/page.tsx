import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getAuthorNames, getDevelopmentProfile, listStaff, workbookPercent } from "@/lib/staff";
import { promptsFor } from "@/lib/development";
import DevelopmentProfile from "../components/DevelopmentProfile";
import { onboardingParts, totalActivityCount } from "@/lib/onboarding/content";
import {
  getTrainerOnboardingState,
  effectivePartStatus,
  partCompletionFraction,
} from "@/lib/onboarding/progress";

export const dynamic = "force-dynamic";

const STATUS_LABEL = {
  complete: "Complete",
  in_progress: "In progress",
  not_started: "Not started",
} as const;

const STATUS_CLASS = {
  complete: "bg-green-50 text-green-700",
  in_progress: "bg-amber-50 text-amber-700",
  not_started: "bg-fill text-secondary-label",
} as const;

export default async function StaffDevelopmentDetailPage({
  params,
}: {
  params: Promise<{ trainerId: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.profile?.role !== "manager") redirect("/admin");

  const { trainerId } = await params;
  const supabase = await createClient();

  // Only people actually on the pathway are viewable here. A trainer's
  // workbook is not the manager's to read on this screen.
  const staff = await listStaff(supabase);
  const person = staff.find((p) => p.trainerId === trainerId);
  if (!person) notFound();

  const [state, percent, profile] = await Promise.all([
    getTrainerOnboardingState(supabase, trainerId),
    workbookPercent(supabase, trainerId),
    getDevelopmentProfile(supabase, trainerId),
  ]);

  // A manager can read every profile row, so the ordinary client is enough
  // here (unlike the staff member's own view, which needs the admin client).
  const authorNames = await getAuthorNames(
    supabase,
    profile.notes.map((n) => n.author_id),
  );

  return (
    <div>
      <Link href="/admin/development" className="text-sm font-semibold text-secondary-label hover:text-foreground">
        &larr; Development
      </Link>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="display-heading text-[28px] text-foreground">{person.name}</h1>
          {person.email && <p className="mt-1 text-[15px] text-secondary-label">{person.email}</p>}
        </div>
        <Link
          href={`/admin/compliance/${trainerId}`}
          className="press rounded-full bg-fill px-4 py-2 text-sm font-semibold text-foreground"
        >
          Their documents
        </Link>
      </div>

      <div className="mt-5 flex items-center gap-4 rounded-2xl border border-black/5 bg-surface p-4">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-fill">
          <div className="h-full rounded-full bg-foreground" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-sm font-semibold tabular-nums text-foreground">{percent}%</span>
      </div>

      <div className="mt-8">
        <DevelopmentProfile
          trainerId={trainerId}
          personName={person.name}
          goals={profile.goals}
          notes={profile.notes}
          prompts={promptsFor(profile.touchedParts)}
          authorNames={authorNames}
          viewer={{ userId: user.id, isManager: true, isOwner: false }}
        />
      </div>

      <h2 className="mt-10 text-lg font-semibold tracking-tight text-foreground">The workbook</h2>
      <p className="mt-1 text-[15px] text-secondary-label">
        What they have written, as they wrote it. This is read only: their answers are theirs to change.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {onboardingParts.map((part) => {
          const status = effectivePartStatus(part.number, state);
          const pct = Math.round(partCompletionFraction(part.number, state) * 100);
          const activities = part.sections.flatMap((section) => section.activities ?? []);
          const answered = activities.filter((a) => (state.responses[`${part.number}:${a.key}`] ?? "").trim());

          return (
            <section
              key={part.number}
              className="rounded-2xl border border-black/5 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold tracking-tight text-foreground">
                  Part {part.number}. {part.title}
                </h2>
                <div className="flex items-center gap-2">
                  {part.pending ? (
                    <span className="rounded-full bg-fill px-2 py-0.5 text-xs font-semibold text-secondary-label">
                      Pending source
                    </span>
                  ) : (
                    <>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[status]}`}>
                        {STATUS_LABEL[status]}
                      </span>
                      {totalActivityCount(part) > 0 && (
                        <span className="text-xs tabular-nums text-secondary-label">{pct}%</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {!part.pending && activities.length > 0 && (
                <p className="mt-1 text-sm text-secondary-label">
                  {answered.length} of {activities.length} answered
                </p>
              )}

              {answered.length > 0 && (
                <dl className="mt-4 flex flex-col gap-4">
                  {activities.map((activity) => {
                    const response = (state.responses[`${part.number}:${activity.key}`] ?? "").trim();
                    if (!response) return null;
                    return (
                      <div key={activity.key}>
                        <dt className="text-sm font-semibold text-foreground">{activity.prompt}</dt>
                        <dd className="mt-1 whitespace-pre-wrap rounded-xl bg-fill/60 px-3.5 py-2.5 text-[15px] leading-relaxed text-foreground">
                          {response}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
