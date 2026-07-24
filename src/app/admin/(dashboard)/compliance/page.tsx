import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getExpiryBand, supersededDocumentIds } from "@/lib/documents";
import type { Trainer, TrainerDocument } from "@/lib/types";

export const dynamic = "force-dynamic";

interface TrainerSummary {
  trainer: Pick<Trainer, "id" | "name" | "active">;
  total: number;
  pending: number;
  rejected: number;
  expired: number;
  soon: number;
}

type Headline = { label: string; className: string };

// Worst-first: anything lapsed or rejected needs action, then reviews, then
// upcoming renewals, otherwise everything is current.
function headlineFor(s: TrainerSummary): Headline {
  if (s.expired > 0 || s.rejected > 0) return { label: "Action needed", className: "bg-red-50 text-red-700" };
  if (s.pending > 0) return { label: "Pending review", className: "bg-blue-50 text-blue-700" };
  if (s.soon > 0) return { label: "Renewal due soon", className: "bg-amber-50 text-amber-700" };
  if (s.total > 0) return { label: "All current", className: "bg-green-50 text-green-700" };
  return { label: "No documents", className: "bg-fill text-secondary-label" };
}

export default async function CompliancePage() {
  const user = await getCurrentUser();
  if (user?.profile?.role !== "manager") redirect("/admin");

  const supabase = await createClient();
  const now = new Date();

  const [{ data: trainers }, { data: documents }] = await Promise.all([
    supabase
      .from("trainers")
      .select("id, name, active")
      .order("active", { ascending: false })
      .order("name")
      .returns<Pick<Trainer, "id" | "name" | "active">[]>(),
    supabase.from("trainer_documents").select("*").returns<TrainerDocument[]>(),
  ]);

  const byTrainer = new Map<string, TrainerDocument[]>();
  for (const doc of documents ?? []) {
    const list = byTrainer.get(doc.trainer_id) ?? [];
    list.push(doc);
    byTrainer.set(doc.trainer_id, list);
  }

  const summaries: TrainerSummary[] = (trainers ?? []).map((trainer) => {
    const docs = byTrainer.get(trainer.id) ?? [];
    // A renewed document supersedes the old one; don't count the old as expired.
    const superseded = supersededDocumentIds(docs);
    let pending = 0;
    let rejected = 0;
    let expired = 0;
    let soon = 0;
    for (const doc of docs) {
      if (doc.status === "pending") pending += 1;
      if (doc.status === "rejected") rejected += 1;
      if (doc.status === "rejected" || superseded.has(doc.id)) continue;
      const band = getExpiryBand(doc.expiry_date, now);
      if (band === "expired") expired += 1;
      else if (band === "soon") soon += 1;
    }
    return { trainer, total: docs.length, pending, rejected, expired, soon };
  });

  const attention = summaries.filter((s) => s.expired > 0 || s.rejected > 0 || s.pending > 0 || s.soon > 0).length;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Compliance</h1>
          <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
            Every trainer&rsquo;s documents at a glance. {attention === 0 ? "Everyone is current." : `${attention} trainer${attention === 1 ? "" : "s"} need attention.`}
          </p>
        </div>
        <Link
          href="/admin/compliance/types"
          className="press rounded-full bg-fill px-4 py-2 text-sm font-semibold text-foreground"
        >
          Manage document types
        </Link>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {summaries.map((s) => {
          const headline = headlineFor(s);
          return (
            <li key={s.trainer.id}>
              <Link
                href={`/admin/compliance/${s.trainer.id}`}
                className="press block rounded-2xl border border-black/5 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] transition hover:bg-fill/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tracking-tight text-foreground">{s.trainer.name}</span>
                    {!s.trainer.active && (
                      <span className="rounded-full bg-fill px-2 py-0.5 text-xs font-semibold text-secondary-label">
                        Inactive
                      </span>
                    )}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${headline.className}`}>
                    {headline.label}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-secondary-label">
                  <span>{s.total} document{s.total === 1 ? "" : "s"}</span>
                  {s.expired > 0 && <span className="text-red-600">{s.expired} expired</span>}
                  {s.soon > 0 && <span className="text-amber-700">{s.soon} expiring soon</span>}
                  {s.pending > 0 && <span className="text-blue-700">{s.pending} pending review</span>}
                  {s.rejected > 0 && <span className="text-red-600">{s.rejected} rejected</span>}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
