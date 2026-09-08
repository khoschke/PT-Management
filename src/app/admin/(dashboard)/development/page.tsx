import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";
import {
  getAuthorNames,
  getDevelopmentProfile,
  getManagerUserIds,
  lastManagerNoteByTrainer,
  listStaff,
  workbookPercent,
} from "@/lib/staff";
import { promptsFor } from "@/lib/development";
import { getExpiryBand, supersededDocumentIds } from "@/lib/documents";
import type { TrainerDocument } from "@/lib/types";
import DevelopmentProfile from "./components/DevelopmentProfile";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" });

function weeksSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (7 * 24 * 60 * 60 * 1000));
}

export default async function DevelopmentPage() {
  const user = await getCurrentUser();
  if (!user?.profile) redirect("/admin/login");

  // Anyone who owns a development profile sees their own here. That includes
  // trainers, because a promoted staff member keeps every goal and note they
  // wrote and would otherwise lose sight of them the day they are promoted.
  if (user.profile.role !== "manager") {
    if (!user.profile.trainer_id) redirect("/admin");
    return <OwnDevelopment trainerId={user.profile.trainer_id} userId={user.id} />;
  }

  return <ManagerDevelopmentList />;
}

async function OwnDevelopment({ trainerId, userId }: { trainerId: string; userId: string }) {
  const supabase = await createClient();
  const [{ goals, notes, touchedParts }, percent] = await Promise.all([
    getDevelopmentProfile(supabase, trainerId),
    workbookPercent(supabase, trainerId),
  ]);

  // Service-role client on purpose: a non-manager cannot read a manager's
  // profile row, so their notes would otherwise show as "Someone".
  const authorNames = await getAuthorNames(
    createAdminClient(),
    notes.map((n) => n.author_id),
  );

  return (
    <div>
      <h1 className="display-heading text-[28px] text-foreground">My development</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
        Where you are heading, and the conversation about getting there.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-black/5 bg-surface p-4">
        <div className="h-2.5 min-w-40 flex-1 overflow-hidden rounded-full bg-fill">
          <div className="h-full rounded-full bg-foreground" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-sm font-semibold tabular-nums text-foreground">{percent}%</span>
        <Link href="/onboarding" className="text-sm font-semibold text-foreground underline">
          The workbook
        </Link>
        <Link href="/admin/documents" className="text-sm font-semibold text-foreground underline">
          My documents
        </Link>
      </div>

      <div className="mt-8">
        <DevelopmentProfile
          trainerId={trainerId}
          personName="you"
          goals={goals}
          notes={notes}
          prompts={promptsFor(touchedParts)}
          authorNames={authorNames}
          viewer={{ userId, isManager: false, isOwner: true }}
        />
      </div>
    </div>
  );
}

interface Row {
  userId: string;
  trainerId: string;
  name: string;
  email: string | null;
  percent: number;
  documents: number;
  needsAttention: boolean;
  activeGoals: number;
  lastCheckIn: string | null;
}

async function ManagerDevelopmentList() {
  const supabase = await createClient();
  const now = new Date();

  const staff = await listStaff(supabase);
  const trainerIds = staff.map((person) => person.trainerId);

  const [percentages, documents, goalRows, managerUserIds] = await Promise.all([
    Promise.all(staff.map((person) => workbookPercent(supabase, person.trainerId))),
    trainerIds.length === 0
      ? Promise.resolve([] as TrainerDocument[])
      : supabase
          .from("trainer_documents")
          .select("*")
          .in("trainer_id", trainerIds)
          .returns<TrainerDocument[]>()
          .then(({ data }) => data ?? []),
    trainerIds.length === 0
      ? Promise.resolve([] as { trainer_id: string }[])
      : supabase
          .from("development_goals")
          .select("trainer_id")
          .eq("status", "active")
          .in("trainer_id", trainerIds)
          .returns<{ trainer_id: string }[]>()
          .then(({ data }) => data ?? []),
    getManagerUserIds(supabase),
  ]);

  const lastCheckIns = await lastManagerNoteByTrainer(supabase, trainerIds, managerUserIds);

  const docsByTrainer = new Map<string, TrainerDocument[]>();
  for (const doc of documents) {
    const list = docsByTrainer.get(doc.trainer_id) ?? [];
    list.push(doc);
    docsByTrainer.set(doc.trainer_id, list);
  }

  const goalCounts = new Map<string, number>();
  for (const row of goalRows) {
    goalCounts.set(row.trainer_id, (goalCounts.get(row.trainer_id) ?? 0) + 1);
  }

  const rows: Row[] = staff.map((person, i) => {
    const docs = docsByTrainer.get(person.trainerId) ?? [];
    const superseded = supersededDocumentIds(docs);
    const needsAttention = docs.some((doc) => {
      if (doc.status === "rejected") return true;
      if (superseded.has(doc.id)) return false;
      return getExpiryBand(doc.expiry_date, now) === "expired";
    });
    return {
      userId: person.userId,
      trainerId: person.trainerId,
      name: person.name,
      email: person.email,
      percent: percentages[i],
      documents: docs.length,
      needsAttention,
      activeGoals: goalCounts.get(person.trainerId) ?? 0,
      lastCheckIn: lastCheckIns.get(person.trainerId) ?? null,
    };
  });

  return (
    <div>
      <h1 className="display-heading text-[28px] text-foreground">Development</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
        Gym staff working towards becoming a PT. They set their own goals and you talk them through, which is why you
        cannot edit them. Promote someone to trainer from the Staff screen when they are ready, and everything they
        have written comes with them.
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.userId}>
            <Link
              href={`/admin/development/${row.trainerId}`}
              className="press block rounded-2xl border border-black/5 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] transition hover:bg-fill/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-semibold tracking-tight text-foreground">{row.name}</span>
                  {row.email && <p className="mt-0.5 text-sm text-secondary-label">{row.email}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {row.needsAttention && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                      Documents need attention
                    </span>
                  )}
                  <span className="text-sm text-secondary-label">
                    {row.activeGoals} active goal{row.activeGoals === 1 ? "" : "s"}
                  </span>
                  <span className="text-sm text-secondary-label">
                    {row.documents} document{row.documents === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="h-1.5 min-w-32 flex-1 overflow-hidden rounded-full bg-fill">
                  <div className="h-full rounded-full bg-foreground" style={{ width: `${row.percent}%` }} />
                </div>
                <span className="text-[12px] font-medium tabular-nums text-secondary-label">
                  {row.percent}% of the workbook
                </span>
                {/* The number that matters most on this screen. A development
                    pathway fails when nobody responds, not when nobody writes. */}
                <span className="text-[12px] font-medium text-secondary-label">
                  {row.lastCheckIn
                    ? `You last wrote ${dateFormat.format(new Date(row.lastCheckIn))}${
                        weeksSince(row.lastCheckIn) >= 4 ? `, ${weeksSince(row.lastCheckIn)} weeks ago` : ""
                      }`
                    : "You have not written to them yet"}
                </span>
              </div>
            </Link>
          </li>
        ))}

        {rows.length === 0 && (
          <li className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">Nobody on the pathway yet</p>
            <p className="max-w-sm text-sm text-secondary-label">
              Add a staff member on the Staff screen to give them the onboarding workbook.
            </p>
          </li>
        )}
      </ul>
    </div>
  );
}
