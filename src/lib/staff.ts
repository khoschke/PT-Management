import type { SupabaseClient } from "@supabase/supabase-js";
import { onboardingParts, totalActivityCount } from "@/lib/onboarding/content";
import { getTrainerOnboardingState, partCompletionFraction } from "@/lib/onboarding/progress";
import type { DevelopmentGoal, DevelopmentNote } from "@/lib/types";

// Staff on the development pathway are `profiles` rows with role 'staff',
// each pointing at an inactive `trainers` row.
//
// `profiles.role` is the single source of truth for who counts as staff.
// There is deliberately NO flag on `trainers` saying so: a flag and a role can
// drift apart, and a screen reading the stale one would be quietly wrong.
// `active = false` on its own cannot answer the question either, because a PT
// who has left is inactive too.

export interface StaffPerson {
  /** auth user id, which is also the profiles primary key. */
  userId: string;
  /** The inactive trainers row they own. Everything they save keys on this. */
  trainerId: string;
  name: string;
  email: string | null;
}

interface StaffProfileRow {
  id: string;
  trainer_id: string | null;
  full_name: string | null;
}

// The trainer row ids belonging to staff, for screens that list the roster and
// need to tell staff apart from trainers.
export async function getStaffTrainerIds(supabase: SupabaseClient): Promise<Set<string>> {
  const { data } = await supabase.from("profiles").select("trainer_id").eq("role", "staff");
  return new Set(
    (data ?? [])
      .map((row: { trainer_id: string | null }) => row.trainer_id)
      .filter((id): id is string => Boolean(id)),
  );
}

export async function listStaff(supabase: SupabaseClient): Promise<StaffPerson[]> {
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, trainer_id, full_name")
    .eq("role", "staff")
    .returns<StaffProfileRow[]>();

  const withTrainer = (profiles ?? []).filter(
    (p): p is StaffProfileRow & { trainer_id: string } => Boolean(p.trainer_id),
  );
  if (withTrainer.length === 0) return [];

  const { data: trainers } = await supabase
    .from("trainers")
    .select("id, name, email")
    .in(
      "id",
      withTrainer.map((p) => p.trainer_id),
    )
    .returns<{ id: string; name: string; email: string | null }[]>();

  const trainerById = new Map((trainers ?? []).map((t) => [t.id, t]));

  return withTrainer
    .map((p) => {
      const trainer = trainerById.get(p.trainer_id);
      return {
        userId: p.id,
        trainerId: p.trainer_id,
        name: p.full_name ?? trainer?.name ?? "Unknown",
        email: trainer?.email ?? null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

// How far through the workbook someone is, as a whole-number percentage over
// every part that has real content. Parts still awaiting source material are
// excluded so a staff member is never shown as stuck below 100% on material
// that does not exist yet.
export async function workbookPercent(
  supabase: SupabaseClient,
  trainerId: string,
): Promise<number> {
  const state = await getTrainerOnboardingState(supabase, trainerId);
  const activeParts = onboardingParts.filter((p) => !p.pending);
  const total = activeParts.reduce((sum, p) => sum + totalActivityCount(p), 0);
  if (total === 0) return 0;

  const answered = activeParts.reduce(
    (sum, p) => sum + Math.round(partCompletionFraction(p.number, state) * totalActivityCount(p)),
    0,
  );
  return Math.round((answered / total) * 100);
}


// Everything the development profile screen renders for one person, whether
// they are looking at their own or the manager is looking at theirs.
export interface DevelopmentProfileData {
  goals: DevelopmentGoal[];
  /** Every note for this person, goal comments and check-ins alike. */
  notes: DevelopmentNote[];
  /** Workbook parts they have made any progress on, for the empty-state prompts. */
  touchedParts: Set<number>;
}

export async function getDevelopmentProfile(
  supabase: SupabaseClient,
  trainerId: string,
): Promise<DevelopmentProfileData> {
  const [{ data: goals }, { data: notes }, state] = await Promise.all([
    supabase
      .from("development_goals")
      .select("*")
      .eq("trainer_id", trainerId)
      .order("created_at", { ascending: true })
      .returns<DevelopmentGoal[]>(),
    supabase
      .from("development_notes")
      .select("*")
      .eq("trainer_id", trainerId)
      .order("created_at", { ascending: true })
      .returns<DevelopmentNote[]>(),
    getTrainerOnboardingState(supabase, trainerId),
  ]);

  const touchedParts = new Set<number>();
  for (const key of Object.keys(state.responses)) {
    const partNumber = Number(key.split(":")[0]);
    if (Number.isFinite(partNumber) && (state.responses[key] ?? "").trim()) {
      touchedParts.add(partNumber);
    }
  }
  for (const [partNumber, status] of Object.entries(state.statuses)) {
    if (status !== "not_started") touchedParts.add(Number(partNumber));
  }

  return { goals: goals ?? [], notes: notes ?? [], touchedParts };
}

// When each person was last written to by somebody other than themselves.
//
// This is the most useful number on the manager's list, and the reason it is
// computed at all. A development pathway does not fail because staff stop
// writing goals. It fails because nobody answers them. The column points the
// accountability at the manager rather than only at the staff member.
export async function lastManagerNoteByTrainer(
  supabase: SupabaseClient,
  trainerIds: string[],
  managerUserIds: Set<string>,
): Promise<Map<string, string>> {
  if (trainerIds.length === 0) return new Map();

  const { data } = await supabase
    .from("development_notes")
    .select("trainer_id, author_id, created_at")
    .in("trainer_id", trainerIds)
    .order("created_at", { ascending: false })
    .returns<Pick<DevelopmentNote, "trainer_id" | "author_id" | "created_at">[]>();

  const latest = new Map<string, string>();
  for (const note of data ?? []) {
    if (!managerUserIds.has(note.author_id)) continue;
    if (!latest.has(note.trainer_id)) latest.set(note.trainer_id, note.created_at);
  }
  return latest;
}


// Display names for note authors, keyed by auth user id.
//
// Pass the SERVICE-ROLE client when the viewer is staff. The `profiles` policy
// is `id = auth.uid() or is_manager()`, so a staff member cannot read their
// manager's profile row and every manager note would otherwise render as
// "Someone". Only the ids already present in their own conversation are looked
// up, and only full_name is read, so nothing else is exposed. A manager can
// pass the ordinary client, since they can read every profile anyway.
export async function getAuthorNames(
  client: SupabaseClient,
  userIds: string[],
): Promise<Record<string, string>> {
  const unique = [...new Set(userIds)];
  if (unique.length === 0) return {};

  const { data } = await client
    .from("profiles")
    .select("id, full_name")
    .in("id", unique)
    .returns<{ id: string; full_name: string | null }[]>();

  const names: Record<string, string> = {};
  for (const row of data ?? []) names[row.id] = row.full_name ?? "Someone";
  return names;
}

// The auth user ids of everyone with the manager role, for working out which
// notes count as a manager having responded.
export async function getManagerUserIds(client: SupabaseClient): Promise<Set<string>> {
  const { data } = await client
    .from("profiles")
    .select("id")
    .eq("role", "manager")
    .returns<{ id: string }[]>();
  return new Set((data ?? []).map((row) => row.id));
}
