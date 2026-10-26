import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getAuthorNames, getStaffTrainerIds, workbookPercent } from "@/lib/staff";
import {
  certsEvidence,
  contractEvidence,
  getContractTypeId,
  getSetupChecklistItems,
  getTrainerSetup,
  profileEvidence,
  rentRamp,
  setupProgress,
  workbookEvidence,
} from "@/lib/setup";
import type { SetupEvidence } from "@/lib/setup";
import type { Trainer, TrainerDocument } from "@/lib/types";
import SetupHeaderForm from "../components/SetupHeaderForm";
import SetupItemRow from "../components/SetupItemRow";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" });

export default async function TrainerSetupPage({
  params,
}: {
  params: Promise<{ trainerId: string }>;
}) {
  const user = await getCurrentUser();
  // Manager-only, refused here as well as in RLS and in every action. This
  // screen shows the bond, the Business Pack and the rent ramp. See the figure
  // rule in CLAUDE.md.
  if (user?.profile?.role !== "manager") redirect("/admin");

  const { trainerId } = await params;
  const supabase = await createClient();

  const [{ data: trainer }, staffTrainerIds] = await Promise.all([
    supabase.from("trainers").select("*").eq("id", trainerId).maybeSingle<Trainer>(),
    getStaffTrainerIds(supabase),
  ]);

  if (!trainer) notFound();
  // Staff have no setup checklist until they are promoted, so this URL is not
  // a back door into one. See the comment on the list page.
  if (staffTrainerIds.has(trainer.id)) notFound();

  const [items, setup, documents, contractTypeId, percent] = await Promise.all([
    getSetupChecklistItems(supabase),
    getTrainerSetup(supabase, trainerId),
    supabase
      .from("trainer_documents")
      .select("*")
      .eq("trainer_id", trainerId)
      .returns<TrainerDocument[]>()
      .then(({ data }) => data ?? []),
    getContractTypeId(supabase),
    workbookPercent(supabase, trainerId),
  ]);

  const progress = setupProgress(items, setup.states);

  // Who ticked what. A manager can read every profile row, so the ordinary
  // client is enough here.
  const names = await getAuthorNames(
    supabase,
    [...setup.states.values()].map((row) => row.updated_by).filter((id): id is string => Boolean(id)),
  );

  // The three items that overlap features already built. Evidence beside the
  // tick; the tick stays the manager's. See lib/setup.ts for why.
  const evidenceFor = (key: string): SetupEvidence | null => {
    if (key === "signed_contract") return contractEvidence(documents, contractTypeId, trainerId);
    // Profile is their bio and specialty tags, the source for both the Coaches
    // Board corflute and the website profile further down the list.
    if (key === "profile") return profileEvidence(trainer);
    if (key === "received_certs") return certsEvidence(documents, trainerId);
    if (key === "onboarding_program") return workbookEvidence(percent, trainerId);
    return null;
  };

  const ramp = rentRamp(setup.header?.start_date ?? null);

  return (
    <div>
      <Link href="/admin/setup" className="text-sm font-semibold text-secondary-label underline">
        All setup checklists
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="display-heading text-[28px] text-foreground">{trainer.name}</h1>
        {progress.complete && (
          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
            Setup complete
            {setup.header?.completed_at &&
              ` ${dateFormat.format(new Date(setup.header.completed_at))}`}
          </span>
        )}
        {!trainer.active && (
          <span className="rounded-full bg-fill px-2.5 py-1 text-xs font-semibold text-secondary-label">
            Inactive
          </span>
        )}
      </div>

      <p className="mt-1 text-[15px] text-secondary-label">
        {progress.settled} of {progress.total} settled
        {progress.notApplicable > 0 && `, ${progress.notApplicable} not applicable`}.
      </p>

      <div className="mt-6">
        <SetupHeaderForm trainerId={trainerId} header={setup.header} />
      </div>

      <ul className="mt-6 flex flex-col gap-2">
        {items.map((item) => (
          <SetupItemRow
            key={item.id}
            trainerId={trainerId}
            item={item}
            row={setup.states.get(item.id) ?? null}
            evidence={evidenceFor(item.key)}
            updatedByName={
              setup.states.get(item.id)?.updated_by
                ? names[setup.states.get(item.id)!.updated_by!] ?? null
                : null
            }
          />
        ))}
      </ul>

      {/* The rent ramp, computed from the start date above.
          Week ranges and percentages only. There are deliberately no dollar
          amounts here and no per-trainer rent figure in the database: the
          amount is a term of their PT contract, and CLAUDE.md says to point at
          the contract rather than restate it. */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary-label">
          Rent ramp
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-secondary-label">
          Worked out from the start date above. The amounts are in their PT contract, not here. Anything that varies
          for this person goes in Amendments.
        </p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-black/5 bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 text-secondary-label">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Weeks</th>
                <th className="px-4 py-2.5 font-semibold">Dates</th>
                <th className="px-4 py-2.5 font-semibold">Rent</th>
              </tr>
            </thead>
            <tbody>
              {ramp.map((band) => (
                <tr key={band.label} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-2.5 text-foreground">{band.label}</td>
                  <td className="px-4 py-2.5 text-secondary-label">
                    {band.from
                      ? band.to
                        ? `${dateFormat.format(band.from)} to ${dateFormat.format(band.to)}`
                        : `From ${dateFormat.format(band.from)}`
                      : "Set a start date"}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-foreground">{band.rent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
