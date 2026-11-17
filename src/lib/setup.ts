import type { SupabaseClient } from "@supabase/supabase-js";
import { getExpiryBand, supersededDocumentIds } from "@/lib/documents";
import type {
  DocumentType,
  SetupChecklistItem,
  SetupItemState,
  Trainer,
  TrainerDocument,
  TrainerSetupChecklist,
  TrainerSetupChecklistItem,
} from "@/lib/types";

// The PT setup checklist: the admin and compliance steps that get a new
// trainer set up in the business.
//
// This is NOT the onboarding workbook. The workbook is the 10-part
// educational journey at /onboarding and lives under `onboarding_*`.
// Everything here is `setup_*`, in the schema and in the code, so the two
// cannot be confused.
//
// Manager-only in v1, enforced in RLS rather than by the absence of a screen.
// See 0017_setup_checklist.sql and the figure rule in CLAUDE.md before adding
// anything trainer-facing.

export const SETUP_STATE_LABEL: Record<SetupItemState, string> = {
  pending: "To do",
  done: "Done",
  not_applicable: "N/A",
};

// ---------------------------------------------------------------------------
// The rent ramp
// ---------------------------------------------------------------------------
// Computed from the start date, never stored. Week ranges and percentages
// only: there are deliberately no dollar amounts anywhere in this feature and
// no per-trainer rent figure in the database. A trainer's rent is a term of
// their PT contract, and CLAUDE.md says to point at the contract rather than
// restate it.
//
// The paper form's final row reads "13+ (100% — confirm with Karl)". It is
// rendered as "Full rent" instead, which is true, needs no confirmation, and
// states no figure.

export interface RentRampRow {
  label: string;
  /** Null when no start date has been set yet. */
  from: Date | null;
  to: Date | null;
  /** "0%" to "75%", or "Full rent" for the open-ended final row. */
  rent: string;
}

const RAMP: { startWeek: number; endWeek: number | null; rent: string }[] = [
  { startWeek: 1, endWeek: 3, rent: "0%" },
  { startWeek: 4, endWeek: 6, rent: "25%" },
  { startWeek: 7, endWeek: 9, rent: "50%" },
  { startWeek: 10, endWeek: 12, rent: "75%" },
  { startWeek: 13, endWeek: null, rent: "Full rent" },
];

function addWeeks(start: Date, weeks: number): Date {
  const d = new Date(start);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

export function rentRamp(startDate: string | null): RentRampRow[] {
  // Parsed as a local date rather than through `new Date(iso)`, which reads a
  // bare "YYYY-MM-DD" as UTC midnight and lands the previous day in Brisbane.
  const start = startDate ? parseDateOnly(startDate) : null;

  return RAMP.map((band) => ({
    label: band.endWeek ? `Weeks ${band.startWeek} to ${band.endWeek}` : `Week ${band.startWeek} onward`,
    from: start ? addWeeks(start, band.startWeek - 1) : null,
    to: start && band.endWeek ? addWeeks(start, band.endWeek) : null,
    rent: band.rent,
  }));
}

export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------
// Not applicable counts as settled, not as outstanding. An item the manager
// has ruled out is a decision, and a checklist that can never reach complete
// because of one is a checklist people stop opening.

export interface SetupProgress {
  done: number;
  notApplicable: number;
  /** Active template items. The denominator. */
  total: number;
  /** done + notApplicable, which is what "settled" means here. */
  settled: number;
  complete: boolean;
}

export function setupProgress(
  items: SetupChecklistItem[],
  states: Map<string, TrainerSetupChecklistItem>,
): SetupProgress {
  let done = 0;
  let notApplicable = 0;
  for (const item of items) {
    const state = states.get(item.id)?.state ?? "pending";
    if (state === "done") done += 1;
    else if (state === "not_applicable") notApplicable += 1;
  }
  const total = items.length;
  const settled = done + notApplicable;
  return { done, notApplicable, total, settled, complete: total > 0 && settled === total };
}

// ---------------------------------------------------------------------------
// Evidence lines for the three items that overlap features already built
// ---------------------------------------------------------------------------
// These three items show what the portal already knows beside the tick, and
// never tick themselves.
//
// The reason is worth keeping written down, because auto-ticking looks like an
// obvious win. An automatic tick creates a second source of truth for "is this
// done", and the two disagree the first time there is a cert in a drawer that
// has not been uploaded or a contract signed on paper. The manager would then
// be looking at a checklist saying no when the answer is yes, with no way to
// correct it. The tick is what the manager knows; the evidence line is what
// the system knows. Showing both and letting a human reconcile them is more
// honest than guessing.
//
// If that ever changes, the cheap version is a suggested state ("looks done,
// tick to confirm"), not a silent tick.

export const DERIVED_ITEM_KEYS = ["signed_contract", "profile", "received_certs", "onboarding_program"] as const;

export interface SetupEvidence {
  text: string;
  href: string;
  linkLabel: string;
  /** True when the portal can see nothing at all, so the line reads as a gap. */
  empty: boolean;
}

export function contractEvidence(
  docs: TrainerDocument[],
  contractTypeId: string | null,
  trainerId: string,
): SetupEvidence {
  const href = `/admin/compliance/${trainerId}`;
  const linkLabel = "Documents";
  if (!contractTypeId) {
    return { text: "No PT Contract document type on this database", href, linkLabel, empty: true };
  }
  const contracts = docs.filter((d) => d.document_type_id === contractTypeId);
  if (contracts.length === 0) {
    return { text: "No contract uploaded", href, linkLabel, empty: true };
  }
  const verified = contracts.filter((d) => d.status === "verified").length;
  return {
    text: verified > 0 ? "Contract on file, verified" : "Contract on file, awaiting review",
    href,
    linkLabel,
    empty: false,
  };
}

// "Profile" is their bio and specialty tags, not a GymMaster profile. It is the
// source content that feeds two separate outputs further down the list: the
// Coaches Board corflute on the gym wall, and their profile on the gym website.
// The five original PTs' rows were themselves built from their corflutes, so
// this is the same material going the other way.
//
// The portal holds it on the trainers row and the trainer edits it themselves
// at /admin/profile, so this is the one derived item where the subject, not the
// manager, does the work. All the more reason the manager still ticks it: the
// tick means "I have read it and it is good enough to print", which no amount
// of text in a column can tell you.
export function profileEvidence(
  trainer: Pick<Trainer, "bio" | "specialties">,
): SetupEvidence {
  const href = "/admin/trainers";
  const linkLabel = "Roster";
  const hasBio = Boolean(trainer.bio?.trim());
  const tags = trainer.specialties?.length ?? 0;

  if (!hasBio && tags === 0) {
    return { text: "No bio or specialty tags yet", href, linkLabel, empty: true };
  }
  if (!hasBio) {
    return { text: `${tags} specialty tag${tags === 1 ? "" : "s"}, no bio`, href, linkLabel, empty: true };
  }
  if (tags === 0) {
    return { text: "Bio written, no specialty tags", href, linkLabel, empty: true };
  }
  return {
    text: `Bio and ${tags} specialty tag${tags === 1 ? "" : "s"}`,
    href,
    linkLabel,
    empty: false,
  };
}

export function certsEvidence(
  docs: TrainerDocument[],
  trainerId: string,
  now: Date = new Date(),
): SetupEvidence {
  const href = `/admin/compliance/${trainerId}`;
  const linkLabel = "Documents";
  if (docs.length === 0) {
    return { text: "No documents on file", href, linkLabel, empty: true };
  }

  // A renewed document supersedes the old one, so don't count the old one as
  // lapsed. Same rule the compliance screen uses.
  const superseded = supersededDocumentIds(docs);
  const live = docs.filter((d) => !superseded.has(d.id));
  const pending = live.filter((d) => d.status === "pending").length;
  const expired = live.filter((d) => getExpiryBand(d.expiry_date, now) === "expired").length;

  const parts = [`${docs.length} document${docs.length === 1 ? "" : "s"} on file`];
  if (pending > 0) parts.push(`${pending} awaiting review`);
  if (expired > 0) parts.push(`${expired} expired`);
  return { text: parts.join(", "), href, linkLabel, empty: false };
}

export function workbookEvidence(percent: number, trainerId: string): SetupEvidence {
  return {
    text: percent === 0 ? "Workbook not started" : `${percent}% of the workbook`,
    href: `/admin/development/${trainerId}`,
    linkLabel: "Progress",
    empty: percent === 0,
  };
}

// Workbook percentage comes from `workbookPercent` in lib/staff.ts, which the
// development screens already use. Deliberately not reimplemented here: two
// copies of that calculation would eventually disagree about how far through
// somebody is, on two screens a manager reads in the same sitting.

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

export async function getSetupChecklistItems(
  supabase: SupabaseClient,
): Promise<SetupChecklistItem[]> {
  const { data } = await supabase
    .from("setup_checklist_items")
    .select("*")
    .eq("active", true)
    .order("sort_order")
    .returns<SetupChecklistItem[]>();
  return data ?? [];
}

export interface TrainerSetupData {
  header: TrainerSetupChecklist | null;
  /** Keyed by item_id. A missing entry means pending. */
  states: Map<string, TrainerSetupChecklistItem>;
}

export async function getTrainerSetup(
  supabase: SupabaseClient,
  trainerId: string,
): Promise<TrainerSetupData> {
  const [{ data: header }, { data: rows }] = await Promise.all([
    supabase
      .from("trainer_setup_checklists")
      .select("*")
      .eq("trainer_id", trainerId)
      .maybeSingle<TrainerSetupChecklist>(),
    supabase
      .from("trainer_setup_checklist_items")
      .select("*")
      .eq("trainer_id", trainerId)
      .returns<TrainerSetupChecklistItem[]>(),
  ]);

  return {
    header: header ?? null,
    states: new Map((rows ?? []).map((row) => [row.item_id, row])),
  };
}

// Every trainer's item states in one query, for the list screen. One round
// trip rather than one per trainer, which matters on a roster that will grow.
export async function getSetupStatesByTrainer(
  supabase: SupabaseClient,
  trainerIds: string[],
): Promise<Map<string, Map<string, TrainerSetupChecklistItem>>> {
  const byTrainer = new Map<string, Map<string, TrainerSetupChecklistItem>>();
  if (trainerIds.length === 0) return byTrainer;

  const { data } = await supabase
    .from("trainer_setup_checklist_items")
    .select("*")
    .in("trainer_id", trainerIds)
    .returns<TrainerSetupChecklistItem[]>();

  for (const row of data ?? []) {
    const inner = byTrainer.get(row.trainer_id) ?? new Map<string, TrainerSetupChecklistItem>();
    inner.set(row.item_id, row);
    byTrainer.set(row.trainer_id, inner);
  }
  return byTrainer;
}

export async function getSetupHeadersByTrainer(
  supabase: SupabaseClient,
  trainerIds: string[],
): Promise<Map<string, TrainerSetupChecklist>> {
  if (trainerIds.length === 0) return new Map();
  const { data } = await supabase
    .from("trainer_setup_checklists")
    .select("*")
    .in("trainer_id", trainerIds)
    .returns<TrainerSetupChecklist[]>();
  return new Map((data ?? []).map((row) => [row.trainer_id, row]));
}

export async function getContractTypeId(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase
    .from("document_types")
    .select("id")
    .eq("key", "contract")
    .maybeSingle<Pick<DocumentType, "id">>();
  return data?.id ?? null;
}

// ---------------------------------------------------------------------------
// How long it has been sitting
// ---------------------------------------------------------------------------
// The number this screen is built around, and the one lesson worth carrying
// over from the development screen, where the most useful column turned out to
// be "you last wrote to them 6 weeks ago".
//
// A setup checklist does not fail because nobody creates it. It fails because
// it gets to 14 of 18 and then sits for two months with the Coaches Board
// profile never ordered. So the list says how long, not just how far.
export function weeksSince(iso: string, now: Date = new Date()): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / (7 * 24 * 60 * 60 * 1000));
}

export function stalledLabel(
  startDate: string | null,
  progress: SetupProgress,
  now: Date = new Date(),
): string | null {
  if (progress.complete) return null;
  if (!startDate) return "No start date set";
  const weeks = weeksSince(startDate, now);
  if (weeks < 1) return "Started this week";
  if (weeks === 1) return "Started 1 week ago";
  return `Started ${weeks} weeks ago`;
}
