import type { SupabaseClient } from "@supabase/supabase-js";
import { onboardingParts, totalActivityCount } from "@/lib/onboarding/content";
import { getTrainerOnboardingState, partCompletionFraction } from "@/lib/onboarding/progress";

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
