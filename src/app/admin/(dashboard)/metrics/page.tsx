import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { computeFunnelMetrics, rate, type FunnelLead, type StageCounts } from "@/lib/metrics";
import { LEAD_SOURCE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

// Documented sources get their friendly label; anything unexpected (a value
// outside the three known types) falls back to its raw value rather than
// crashing on a missing label.
function sourceLabel(source: string): string {
  return (LEAD_SOURCE_LABELS as Record<string, { label: string }>)[source]?.label ?? source;
}

function pct(value: number | null): string {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}

// A headline number with its own denominator underneath, so a 1-of-1 reads as
// "1 of 1" and not as a 100% trend.
function Tile({
  label,
  value,
  sub,
  hint,
}: {
  label: string;
  value: string;
  sub?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-label">{label}</p>
      <p className="mt-2 text-[32px] font-semibold leading-none tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      {sub && <p className="mt-1.5 text-sm text-secondary-label tabular-nums">{sub}</p>}
      {hint && <p className="mt-2 text-xs leading-relaxed text-secondary-label">{hint}</p>}
    </div>
  );
}

// One rung of the funnel: a monochrome bar sized by how many of all the leads
// reached this stage, with the count and share labelled directly so the bar is
// never the only carrier of the number.
function FunnelBar({ label, count, total }: { label: string; count: number; total: number }) {
  const share = total > 0 ? count / total : 0;
  // A non-zero count always shows a sliver, so one lead at a deep stage is still
  // visible rather than rounding to nothing.
  const width = count > 0 ? Math.max(share * 100, 3) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-secondary-label">
          {count}
          <span className="text-secondary-label/70"> · {pct(total > 0 ? share : null)} of all leads</span>
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-fill">
        <div className="h-full rounded-full bg-foreground" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function SourceRow({ label, counts }: { label: string; counts: StageCounts }) {
  const cell = "px-3 py-2.5 text-sm tabular-nums text-foreground";
  return (
    <tr className="border-t border-black/5">
      <td className="px-3 py-2.5 text-sm font-medium text-foreground">{label}</td>
      <td className={cell}>{counts.total}</td>
      <td className={cell}>{counts.contacted}</td>
      <td className={cell}>{counts.booked}</td>
      <td className={cell}>{counts.attended}</td>
      <td className={cell}>{counts.converted}</td>
    </tr>
  );
}

export default async function MetricsPage() {
  const user = await getCurrentUser();
  // Manager-only. The nav hides this link for everyone else; this is the check
  // that enforces it if a trainer types the address.
  if (user?.profile?.role !== "manager") {
    redirect("/admin");
  }

  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select(
      "lead_source,status,created_at,first_contact_due_at,first_contacted_at,status_history(new_status,changed_at)",
    )
    .is("deleted_at", null)
    .returns<FunnelLead[]>();

  const rows = leads ?? [];
  const m = computeFunnelMetrics(rows);
  const o = m.overall;

  return (
    <div>
      <h1 className="display-heading text-[28px] text-foreground">Lead funnel</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
        How leads move from first contact to signing up, across all {o.total} lead
        {o.total === 1 ? "" : "s"} on record. Each rate counts whether a lead ever reached a stage, so
        a lead that was contacted and then said no still counts as contacted.
      </p>

      {o.total === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-black/10 px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">No leads yet</p>
          <p className="max-w-xs text-sm text-secondary-label">
            Funnel numbers appear here once leads start coming in and moving through the stages.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Tile
              label="Contacted in 48h"
              value={pct(rate(m.contactedWithin48h.within, m.contactedWithin48h.measured))}
              sub={`${m.contactedWithin48h.within} of ${m.contactedWithin48h.measured} contacted`}
              hint="First contact made inside the 48 hour window."
            />
            <Tile
              label="Booking rate"
              value={pct(rate(o.booked, o.contacted))}
              sub={`${o.booked} of ${o.contacted} contacted`}
              hint="Of leads contacted, how many booked a complimentary session."
            />
            <Tile
              label="Show rate"
              value={pct(rate(o.attended, o.booked))}
              sub={`${o.attended} of ${o.booked} booked`}
              hint="Of leads booked, how many turned up to the session."
            />
            <Tile
              label="Conversion rate"
              value={pct(rate(o.converted, o.attended))}
              sub={`${o.converted} of ${o.attended} attended`}
              hint="Of leads who attended, how many signed up to paid PT."
            />
            <Tile
              label="Time to convert"
              value={m.timeToConvert.medianDays === null ? "—" : `${Math.round(m.timeToConvert.medianDays)}d`}
              sub={
                m.timeToConvert.count === 0
                  ? "No conversions yet"
                  : `median of ${m.timeToConvert.count} conversion${m.timeToConvert.count === 1 ? "" : "s"}`
              }
              hint="Days from a lead coming in to signing up."
            />
          </div>

          <section className="mt-8 rounded-2xl border border-black/5 bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">
              The funnel
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              <FunnelBar label="Leads" count={o.total} total={o.total} />
              <FunnelBar label="Contacted" count={o.contacted} total={o.total} />
              <FunnelBar label="Comp. Booked" count={o.booked} total={o.total} />
              <FunnelBar label="Attended" count={o.attended} total={o.total} />
              <FunnelBar label="Converted" count={o.converted} total={o.total} />
            </div>
          </section>

          {m.bySource.length > 1 && (
            <section className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="px-6 pt-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">
                  By lead type
                </h2>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[480px]">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-secondary-label">
                      <th className="px-3 py-2 font-semibold">Type</th>
                      <th className="px-3 py-2 font-semibold">Leads</th>
                      <th className="px-3 py-2 font-semibold">Contacted</th>
                      <th className="px-3 py-2 font-semibold">Booked</th>
                      <th className="px-3 py-2 font-semibold">Attended</th>
                      <th className="px-3 py-2 font-semibold">Converted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.bySource.map((s) => (
                      <SourceRow key={s.source} label={sourceLabel(s.source)} counts={s.counts} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="h-5" />
            </section>
          )}

          <p className="mt-6 max-w-2xl text-xs leading-relaxed text-secondary-label">
            Counts read the full status history, not just a lead&rsquo;s current status. No-shows are
            booked leads that never reached Attended. Stage meanings are in the status dropdown on the
            lead board; the full reference is docs/pipeline-stage-definitions.md.
          </p>
        </>
      )}
    </div>
  );
}
