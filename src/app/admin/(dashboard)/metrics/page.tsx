import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { computeFunnelMetrics, rate, type FunnelLead, type StageCounts } from "@/lib/metrics";
import { LEAD_SOURCE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
// Brisbane is AEST all year (no daylight saving), so a fixed +10:00 offset is
// exact. Custom date inputs are read as Brisbane calendar days with it.
const BRISBANE_OFFSET = "+10:00";

// Quick ranges. `days` is a lookback from now; null is all time.
const RANGE_PRESETS = [
  { key: "all", label: "All time", days: null as number | null },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "12m", label: "12 months", days: 365 },
] as const;

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isDate(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00${BRISBANE_OFFSET}`));
}

function niceDate(value: string): string {
  return new Date(`${value}T00:00:00${BRISBANE_OFFSET}`).toLocaleDateString("en-AU", {
    timeZone: "Australia/Brisbane",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface ResolvedRange {
  fromTs: number | null;
  toTs: number | null;
  label: string; // for the subtitle, e.g. "the last 30 days"
  activePreset: string | null; // which chip to highlight, null for a custom range
  from: string; // echoed back into the date inputs
  to: string;
}

// A lead is in range by when it CAME IN (created_at), so the funnel reads as a
// cohort: of the leads from this period, how far did they get. A custom from/to
// overrides the preset; invalid dates fall back to the preset.
function resolveRange(sp: SearchParams): ResolvedRange {
  const from = firstParam(sp.from);
  const to = firstParam(sp.to);

  if (isDate(from) || isDate(to)) {
    const fromTs = isDate(from) ? new Date(`${from}T00:00:00${BRISBANE_OFFSET}`).getTime() : null;
    const toTs = isDate(to) ? new Date(`${to}T23:59:59.999${BRISBANE_OFFSET}`).getTime() : null;
    const label = `${isDate(from) ? niceDate(from) : "the start"} to ${isDate(to) ? niceDate(to) : "now"}`;
    return { fromTs, toTs, label, activePreset: null, from: isDate(from) ? from : "", to: isDate(to) ? to : "" };
  }

  const key = firstParam(sp.range) ?? "all";
  const preset = RANGE_PRESETS.find((p) => p.key === key) ?? RANGE_PRESETS[0];
  if (preset.days === null) {
    return { fromTs: null, toTs: null, label: "all time", activePreset: "all", from: "", to: "" };
  }
  return {
    fromTs: Date.now() - preset.days * DAY_MS,
    toTs: null,
    label: `the last ${preset.label.toLowerCase()}`,
    activePreset: preset.key,
    from: "",
    to: "",
  };
}

// Documented sources get their friendly label; anything unexpected (a value
// outside the known types) falls back to its raw value rather than crashing on
// a missing label.
function sourceLabel(source: string): string {
  return (LEAD_SOURCE_LABELS as Record<string, { label: string }>)[source]?.label ?? source;
}

function pct(value: number | null): string {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}

// A headline number with its own denominator underneath, so a 1-of-1 reads as
// "1 of 1" and not as a 100% trend.
function Tile({ label, value, sub, hint }: { label: string; value: string; sub?: string; hint?: string }) {
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

function RangeFilter({ range }: { range: ResolvedRange }) {
  const chipBase =
    "press rounded-full px-3.5 py-1.5 text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-foreground";
  const inputClass =
    "rounded-xl border-none bg-fill px-3 py-1.5 text-sm text-foreground outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-foreground";
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {RANGE_PRESETS.map((p) => {
          const active = range.activePreset === p.key;
          return (
            <Link
              key={p.key}
              href={`/admin/metrics?range=${p.key}`}
              className={`${chipBase} ${active ? "bg-foreground text-white" : "bg-fill text-foreground hover:bg-fill/70"}`}
            >
              {p.label}
            </Link>
          );
        })}
      </div>
      <span className="hidden h-4 w-px bg-black/10 sm:block" aria-hidden />
      <form method="get" action="/admin/metrics" className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="from">
          From date
        </label>
        <input id="from" type="date" name="from" defaultValue={range.from} className={inputClass} />
        <span className="text-sm text-secondary-label">to</span>
        <label className="sr-only" htmlFor="to">
          To date
        </label>
        <input id="to" type="date" name="to" defaultValue={range.to} className={inputClass} />
        <button
          type="submit"
          className="press rounded-full bg-fill px-3.5 py-1.5 text-sm font-semibold text-foreground outline-none transition hover:bg-fill/70 focus-visible:ring-2 focus-visible:ring-foreground"
        >
          Apply
        </button>
      </form>
    </div>
  );
}

export default async function MetricsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await getCurrentUser();
  // Manager-only. The nav hides this link for everyone else; this is the check
  // that enforces it if a trainer types the address.
  if (user?.profile?.role !== "manager") {
    redirect("/admin");
  }

  const range = resolveRange(await searchParams);

  const supabase = await createClient();
  const { data: allLeads } = await supabase
    .from("leads")
    .select(
      "lead_source,status,created_at,first_contact_due_at,first_contacted_at,status_history(new_status,changed_at)",
    )
    .is("deleted_at", null)
    .returns<FunnelLead[]>();

  // Filter by when the lead came in, so the funnel is a creation cohort.
  const rows = (allLeads ?? []).filter((lead) => {
    const created = new Date(lead.created_at).getTime();
    if (range.fromTs !== null && created < range.fromTs) return false;
    if (range.toTs !== null && created > range.toTs) return false;
    return true;
  });

  const m = computeFunnelMetrics(rows);
  const o = m.overall;

  return (
    <div>
      <h1 className="display-heading text-[28px] text-foreground">Lead funnel</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
        How leads move from first contact to signing up, by when the lead came in. Each rate counts
        whether a lead ever reached a stage, so a lead that was contacted and then said no still counts
        as contacted.
      </p>

      <RangeFilter range={range} />

      <p className="mt-4 text-sm text-secondary-label">
        {o.total} lead{o.total === 1 ? "" : "s"} <span className="text-secondary-label/70">· {range.label}</span>
      </p>

      {o.total === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-black/10 px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">No leads in this period</p>
          <p className="max-w-xs text-sm text-secondary-label">
            {range.activePreset === "all"
              ? "Funnel numbers appear here once leads start coming in."
              : "No leads came in during this range. Try a wider one above."}
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
            <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">The funnel</h2>
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
                <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">By lead type</h2>
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
            Leads are grouped by the date they came in. Counts read the full status history, not just a
            lead&rsquo;s current status. No-shows are booked leads that never reached Attended. The full
            reference is docs/pipeline-stage-definitions.md.
          </p>
        </>
      )}
    </div>
  );
}
