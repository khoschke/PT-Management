import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { computeFunnelMetrics, rate, type FunnelLead, type StageCounts } from "@/lib/metrics";
import {
  LEAD_SOURCE_LABELS,
  REFLECTION_CERTAINTY_LABELS,
  REFLECTION_STALL_LABELS,
  foundViaLabel,
  type FoundVia,
  type PostChatReflection,
} from "@/lib/types";

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

function RangeFilter({ range, trainerId }: { range: ResolvedRange; trainerId: string | null }) {
  const keep = trainerId ? `&trainer=${encodeURIComponent(trainerId)}` : "";
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
              href={`/admin/metrics?range=${p.key}${keep}`}
              className={`${chipBase} ${active ? "bg-foreground text-white" : "bg-fill text-foreground hover:bg-fill/70"}`}
            >
              {p.label}
            </Link>
          );
        })}
      </div>
      <span className="hidden h-4 w-px bg-black/10 sm:block" aria-hidden />
      <form method="get" action="/admin/metrics" className="flex flex-wrap items-center gap-2">
        {trainerId && <input type="hidden" name="trainer" value={trainerId} />}
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
  // The PT Manager sees everyone, with a trainer filter. A trainer sees only
  // their own numbers (Karl, 18 Nov 2026): RLS already limits their leads and
  // reflections to their own, so the same queries do the right thing. Staff
  // have no leads.
  const role = user?.profile?.role;
  if (role !== "manager" && role !== "trainer") {
    redirect(role === "staff" ? "/admin/development" : "/admin");
  }
  const isManager = role === "manager";

  const sp = await searchParams;
  const range = resolveRange(sp);

  const supabase = await createClient();

  // Manager only: which trainer to look at, if any. Ignored unless it's a real
  // trainer, so a stale link can't empty the page.
  const { data: trainerList } = isManager
    ? await supabase.from("trainers").select("id, name").eq("active", true).order("name").returns<{ id: string; name: string }[]>()
    : { data: [] as { id: string; name: string }[] };
  const requested = firstParam(sp.trainer);
  const trainerId = isManager && requested && (trainerList ?? []).some((t) => t.id === requested) ? requested : null;
  const trainerName = trainerId ? (trainerList ?? []).find((t) => t.id === trainerId)?.name ?? null : null;

  const { data: allLeads } = await supabase
    .from("leads")
    .select(
      "lead_source,status,created_at,first_contact_due_at,first_contacted_at,allocated_trainer_id,found_via,found_via_other,status_history(new_status,changed_at)",
    )
    .is("deleted_at", null)
    .returns<MetricsLead[]>();

  // Filter by when the lead came in, so the funnel is a creation cohort.
  const rows = (allLeads ?? []).filter((lead) => {
    if (trainerId && lead.allocated_trainer_id !== trainerId) return false;
    const created = new Date(lead.created_at).getTime();
    if (range.fromTs !== null && created < range.fromTs) return false;
    if (range.toTs !== null && created > range.toTs) return false;
    return true;
  });

  // Leads the trainer found themselves, by where (item 8): the Part 6
  // "track where your leads come from" advice, done for them.
  const foundGroups = new Map<string, MetricsLead[]>();
  for (const lead of rows) {
    const label = foundViaLabel({ found_via: lead.found_via, found_via_other: null });
    if (!label) continue;
    foundGroups.set(label, [...(foundGroups.get(label) ?? []), lead]);
  }
  const foundRows = [...foundGroups.entries()]
    .map(([label, leads]) => ({ label, counts: computeFunnelMetrics(leads).overall }))
    .sort((a, b) => b.counts.total - a.counts.total);

  const m = computeFunnelMetrics(rows);
  const o = m.overall;

  // Post-chat reflections in the same date range (by when they were saved),
  // per trainer, for coaching in the fortnightly sessions (item 18).
  const { data: reflectionRows } = await supabase
    .from("post_chat_reflections")
    .select("*, trainer:trainers(name)")
    .returns<(PostChatReflection & { trainer: { name: string } | null })[]>();
  const inRange = (reflectionRows ?? []).filter((r) => {
    if (trainerId && r.trainer_id !== trainerId) return false;
    const t = new Date(r.created_at).getTime();
    return (range.fromTs === null || t >= range.fromTs) && (range.toTs === null || t <= range.toTs);
  });
  const byTrainer = new Map<string, ReflectionSummary>();
  for (const r of inRange) {
    const name = r.trainer?.name ?? "Unknown";
    const s = byTrainer.get(name) ?? { name, saved: 0, skipped: 0, well: 0, mixed: 0, tough: 0, emotional: 0, logical: 0, selfBelief: 0, stalls: {} };
    if (r.skipped) {
      s.skipped++;
    } else {
      s.saved++;
      if (r.feel) s[r.feel]++;
      if (r.missing_certainty === "emotional") s.emotional++;
      if (r.missing_certainty === "logical") s.logical++;
      if (r.missing_certainty === "self_belief") s.selfBelief++;
      if (r.stalled_at && r.stalled_at !== "nowhere") s.stalls[r.stalled_at] = (s.stalls[r.stalled_at] ?? 0) + 1;
    }
    byTrainer.set(name, s);
  }
  const reflectionSummaries = [...byTrainer.values()].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <h1 className="display-heading text-[28px] text-foreground">{isManager ? "Lead funnel" : "My numbers"}</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
        {isManager
          ? "How leads move from first contact to signing up, by when the lead came in. Each rate counts whether a lead ever reached a stage, so a lead that was contacted and then said no still counts as contacted."
          : "Your own leads, from first contact to signing up, by when the lead came in. Only you and the PT Manager see these. The useful comparison is with your own last month, not with anyone else: small numbers swing a lot, so read the counts as well as the percentages."}
      </p>

      {isManager && (
        <form method="get" action="/admin/metrics" className="mt-5 flex flex-wrap items-center gap-2">
          {range.activePreset && <input type="hidden" name="range" value={range.activePreset} />}
          {!range.activePreset && range.from && <input type="hidden" name="from" value={range.from} />}
          {!range.activePreset && range.to && <input type="hidden" name="to" value={range.to} />}
          <label htmlFor="trainer" className="text-sm font-medium text-foreground">
            Trainer
          </label>
          <select
            id="trainer"
            name="trainer"
            defaultValue={trainerId ?? ""}
            className="rounded-full bg-fill px-3.5 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          >
            <option value="">Everyone</option>
            {(trainerList ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="press rounded-full bg-fill px-3.5 py-1.5 text-sm font-semibold text-foreground outline-none transition hover:bg-fill/70 focus-visible:ring-2 focus-visible:ring-foreground"
          >
            Show
          </button>
          {trainerName && (
            <span className="text-sm text-secondary-label">
              Showing {trainerName}&rsquo;s numbers, as they see them on their own Metrics tab.
            </span>
          )}
        </form>
      )}

      <RangeFilter range={range} trainerId={trainerId} />

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

          {foundRows.length > 0 && (
            <section className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="px-6 pt-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">
                  {isManager ? "Own leads, by where they were found" : "Leads you found, by where"}
                </h2>
                <p className="mt-1 text-sm text-secondary-label">
                  Leads added with Add my own lead. Feed the channels that turn into clients.
                </p>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px]">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-secondary-label">
                      <th className="px-3 py-2 font-semibold">Found via</th>
                      <th className="px-3 py-2 font-semibold">Leads</th>
                      <th className="px-3 py-2 font-semibold">Booked</th>
                      <th className="px-3 py-2 font-semibold">Converted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foundRows.map((f) => (
                      <tr key={f.label} className="border-t border-black/5">
                        <td className="px-3 py-2.5 text-sm font-medium text-foreground">{f.label}</td>
                        <td className="px-3 py-2.5 text-sm tabular-nums text-foreground">{f.counts.total}</td>
                        <td className="px-3 py-2.5 text-sm tabular-nums text-foreground">{f.counts.booked}</td>
                        <td className="px-3 py-2.5 text-sm tabular-nums text-foreground">{f.counts.converted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="h-5" />
            </section>
          )}

          {isManager ? (
            <ReflectionsSection summaries={reflectionSummaries} />
          ) : (
            <PersonalReflections summary={reflectionSummaries[0] ?? null} />
          )}

          <p className="mt-6 max-w-2xl text-xs leading-relaxed text-secondary-label">
            Leads are grouped by the date they came in. Counts read the full status history, not just a
            lead&rsquo;s current status. No-shows are booked leads that never reached Attended.
            {isManager && " The full reference is docs/pipeline-stage-definitions.md."}
          </p>
        </>
      )}
    </div>
  );
}

type MetricsLead = FunnelLead & {
  allocated_trainer_id: string | null;
  found_via: FoundVia | null;
  found_via_other: string | null;
};

interface ReflectionSummary {
  name: string;
  saved: number;
  skipped: number;
  well: number;
  mixed: number;
  tough: number;
  emotional: number;
  logical: number;
  selfBelief: number;
  stalls: Record<string, number>;
}

// Patterns from the trainers' post-chat reflections. The point is coaching:
// "self-belief was missing in four of Julie's last six" is a conversation to
// have, not a score. Individual reflections are on each lead's panel.
function ReflectionsSection({ summaries }: { summaries: ReflectionSummary[] }) {
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="px-6 pt-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">Post-chat reflections</h2>
        <p className="mt-1 text-sm text-secondary-label">
          What trainers noticed after their sales chats, by when the reflection was saved. Open a lead to read its
          reflection in full.
        </p>
      </div>
      {summaries.length === 0 ? (
        <p className="px-6 pb-5 pt-3 text-sm text-secondary-label/80">No reflections in this period yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-secondary-label">
                <th className="px-3 py-2 font-semibold">Trainer</th>
                <th className="px-3 py-2 font-semibold">Saved</th>
                <th className="px-3 py-2 font-semibold">Well / mixed / didn&rsquo;t land</th>
                <th className="px-3 py-2 font-semibold">Missing: emotional</th>
                <th className="px-3 py-2 font-semibold">Logical</th>
                <th className="px-3 py-2 font-semibold">Self-belief</th>
                <th className="px-3 py-2 font-semibold">Most common stall</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((s) => {
                const top = Object.entries(s.stalls).sort((a, b) => b[1] - a[1])[0];
                return (
                  <tr key={s.name} className="border-t border-black/5">
                    <td className="px-3 py-2.5 font-medium text-foreground">{s.name}</td>
                    <td className="px-3 py-2.5 text-foreground">
                      {s.saved}
                      {s.skipped > 0 && <span className="text-secondary-label"> ({s.skipped} skipped)</span>}
                    </td>
                    <td className="px-3 py-2.5 text-foreground">
                      {s.well} / {s.mixed} / {s.tough}
                    </td>
                    <td className="px-3 py-2.5 text-foreground">{s.emotional}</td>
                    <td className="px-3 py-2.5 text-foreground">{s.logical}</td>
                    <td className="px-3 py-2.5 text-foreground">{s.selfBelief}</td>
                    <td className="px-3 py-2.5 text-foreground">
                      {top ? `${REFLECTION_STALL_LABELS[top[0] as keyof typeof REFLECTION_STALL_LABELS]} (${top[1]})` : "None"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="h-5" />
    </section>
  );
}

// A trainer's own reflection patterns, in words rather than a table: the line
// most worth reading on this page for their own growth.
function PersonalReflections({ summary }: { summary: ReflectionSummary | null }) {
  const lines: string[] = [];
  if (summary && summary.saved > 0) {
    const certainties: [string, number][] = [
      [REFLECTION_CERTAINTY_LABELS.emotional, summary.emotional],
      [REFLECTION_CERTAINTY_LABELS.logical, summary.logical],
      [REFLECTION_CERTAINTY_LABELS.self_belief, summary.selfBelief],
    ];
    const topCert = certainties.sort((a, b) => b[1] - a[1])[0];
    if (topCert[1] > 0) {
      lines.push(`${topCert[0]} was the missing certainty in ${topCert[1]} of your ${summary.saved} reflection${summary.saved === 1 ? "" : "s"}.`);
    }
    const topStall = Object.entries(summary.stalls).sort((a, b) => b[1] - a[1])[0];
    if (topStall) {
      lines.push(
        `Chats stalled most often at ${REFLECTION_STALL_LABELS[topStall[0] as keyof typeof REFLECTION_STALL_LABELS].toLowerCase()} (${topStall[1]} of ${summary.saved}).`,
      );
    }
    lines.push(`How they went: ${summary.well} went well, ${summary.mixed} mixed, ${summary.tough} didn't land.`);
  }
  return (
    <section className="mt-6 rounded-2xl border border-black/5 bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">Your post-chat reflections</h2>
      {lines.length === 0 ? (
        <p className="mt-2 text-sm text-secondary-label">
          Nothing to show yet. After each sales chat, the quick reflection on the lead builds this up.
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm text-foreground">
          {lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
