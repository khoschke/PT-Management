import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getStaffTrainerIds } from "@/lib/staff";
import {
  getSetupChecklistItems,
  getSetupHeadersByTrainer,
  getSetupStatesByTrainer,
  setupProgress,
  stalledLabel,
} from "@/lib/setup";
import type { Trainer } from "@/lib/types";
import Avatar from "../components/Avatar";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function SetupPage() {
  const user = await getCurrentUser();
  // Manager-only, refused here rather than relying on the nav link being
  // hidden. Hiding a link is presentation, not access control.
  if (user?.profile?.role !== "manager") redirect("/admin");

  const supabase = await createClient();

  const [{ data: allTrainers }, staffTrainerIds, items] = await Promise.all([
    supabase
      .from("trainers")
      .select("*")
      .order("active", { ascending: false })
      .order("name")
      .returns<Trainer[]>(),
    getStaffTrainerIds(supabase),
    getSetupChecklistItems(supabase),
  ]);

  // Staff on the development pathway are excluded, the same way /admin/trainers
  // excludes them.
  //
  // The checklist begins the day they are promoted. Almost none of the 18
  // items is true of a staff member: they do not sign a PT contract, pay a
  // bond or a Business Pack, set up rent, or get a website PT profile. A
  // checklist created on their first day would show sixteen correctly
  // unticked items for months, which teaches a manager to ignore the screen.
  //
  // Nothing is lost by waiting. The two items that ARE true of them, certs and
  // the workbook, are the two that read live state rather than being ticked,
  // and that state keys on trainer_id, which does not change at promotion. So
  // a promoted staff member's checklist appears already reflecting their real
  // position. Same property 0013 was designed around.
  const trainers = (allTrainers ?? []).filter((t) => !staffTrainerIds.has(t.id));
  const trainerIds = trainers.map((t) => t.id);

  const [headers, statesByTrainer] = await Promise.all([
    getSetupHeadersByTrainer(supabase, trainerIds),
    getSetupStatesByTrainer(supabase, trainerIds),
  ]);

  const rows = trainers.map((trainer) => {
    const states = statesByTrainer.get(trainer.id) ?? new Map();
    const header = headers.get(trainer.id) ?? null;
    const progress = setupProgress(items, states);
    return {
      trainer,
      header,
      progress,
      stalled: stalledLabel(header?.start_date ?? null, progress),
    };
  });

  const active = rows.filter((r) => r.trainer.active);
  const inactive = rows.filter((r) => !r.trainer.active);

  return (
    <div>
      <h1 className="display-heading text-[28px] text-foreground">New trainer setup</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
        The admin side of getting a trainer going: contract, accounts, systems access, profiles, certs and rent. This
        is not the <Link href="/onboarding" className="font-semibold text-foreground underline">onboarding
        workbook</Link>, which is the 12-week learning journey they work through themselves.
      </p>

      {active.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {active.map((row) => (
            <SetupRow key={row.trainer.id} row={row} />
          ))}
        </ul>
      )}

      {active.length === 0 && (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No active trainers on the roster</p>
          <p className="max-w-sm text-sm text-secondary-label">
            A setup checklist appears here when someone joins the roster. Staff working towards becoming a PT live on{" "}
            <Link href="/admin/development" className="font-semibold text-foreground underline">
              Development
            </Link>{" "}
            until they are promoted.
          </p>
        </div>
      )}

      {inactive.length > 0 && (
        <>
          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-secondary-label">
            No longer active
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-secondary-label">
            Deactivating a trainer never touches their setup record. It is kept exactly as it was and stays editable.
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {inactive.map((row) => (
              <SetupRow key={row.trainer.id} row={row} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

interface Row {
  trainer: Trainer;
  header: { start_date: string | null; completed_at: string | null } | null;
  progress: { done: number; notApplicable: number; total: number; settled: number; complete: boolean };
  stalled: string | null;
}

function SetupRow({ row }: { row: Row }) {
  const { trainer, header, progress, stalled } = row;
  const percent = progress.total === 0 ? 0 : Math.round((progress.settled / progress.total) * 100);

  return (
    <li>
      <Link
        href={`/admin/setup/${trainer.id}`}
        className="press block rounded-2xl border border-black/5 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] transition hover:bg-fill/40"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={trainer.name} size="md" muted={!trainer.active} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold tracking-tight text-foreground">{trainer.name}</span>
                {progress.complete && (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Setup complete
                  </span>
                )}
                {!trainer.active && (
                  <span className="rounded-full bg-fill px-2 py-0.5 text-xs font-semibold text-secondary-label">
                    Inactive
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-secondary-label">
                {header?.start_date
                  ? `Started ${dateFormat.format(new Date(`${header.start_date}T00:00:00`))}`
                  : "No start date set"}
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {progress.settled} of {progress.total}
            {progress.notApplicable > 0 && (
              <span className="ml-1 font-normal text-secondary-label">
                ({progress.notApplicable} N/A)
              </span>
            )}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="h-1.5 min-w-32 flex-1 overflow-hidden rounded-full bg-fill">
            <div
              className={`h-full rounded-full ${progress.complete ? "bg-green-600" : "bg-foreground"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          {/* How long it has been sitting, not just how far through it is. A
              setup checklist fails by stalling at 14 of 18, not by never
              being started. */}
          {stalled && <span className="text-[12px] font-medium text-secondary-label">{stalled}</span>}
        </div>
      </Link>
    </li>
  );
}
