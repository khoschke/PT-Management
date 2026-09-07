import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { listStaff, workbookPercent } from "@/lib/staff";
import { getExpiryBand, supersededDocumentIds } from "@/lib/documents";
import type { TrainerDocument } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Row {
  userId: string;
  trainerId: string;
  name: string;
  email: string | null;
  percent: number;
  documents: number;
  needsAttention: boolean;
}

export default async function DevelopmentPage() {
  const user = await getCurrentUser();
  if (user?.profile?.role !== "manager") redirect("/admin");

  const supabase = await createClient();
  const now = new Date();

  const staff = await listStaff(supabase);
  const trainerIds = staff.map((person) => person.trainerId);

  const [percentages, documents] = await Promise.all([
    Promise.all(staff.map((person) => workbookPercent(supabase, person.trainerId))),
    trainerIds.length === 0
      ? Promise.resolve([] as TrainerDocument[])
      : supabase
          .from("trainer_documents")
          .select("*")
          .in("trainer_id", trainerIds)
          .returns<TrainerDocument[]>()
          .then(({ data }) => data ?? []),
  ]);

  const docsByTrainer = new Map<string, TrainerDocument[]>();
  for (const doc of documents) {
    const list = docsByTrainer.get(doc.trainer_id) ?? [];
    list.push(doc);
    docsByTrainer.set(doc.trainer_id, list);
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
    };
  });

  return (
    <div>
      <h1 className="display-heading text-[28px] text-foreground">Development</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
        Gym staff working towards becoming a PT. They have the onboarding workbook and their own compliance documents,
        and no access to leads. Promote someone to trainer from the Staff screen when they are ready, and everything
        they have written comes with them.
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
                <div className="flex items-center gap-3">
                  {row.needsAttention && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                      Documents need attention
                    </span>
                  )}
                  <span className="text-sm text-secondary-label">
                    {row.documents} document{row.documents === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-fill">
                  <div className="h-full rounded-full bg-foreground" style={{ width: `${row.percent}%` }} />
                </div>
                <span className="text-[12px] font-medium tabular-nums text-secondary-label">
                  {row.percent}% of the workbook
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
