import type { SupabaseClient } from "@supabase/supabase-js";
import { onboardingParts, totalActivityCount } from "./content";

export type OnboardingPartStatus = "not_started" | "in_progress" | "complete";

export interface TrainerOnboardingState {
  /** `${partNumber}:${activityKey}` -> saved response text */
  responses: Record<string, string>;
  /** partNumber -> status */
  statuses: Record<number, OnboardingPartStatus>;
}

const EMPTY_STATE: TrainerOnboardingState = { responses: {}, statuses: {} };

export async function getTrainerOnboardingState(
  supabase: SupabaseClient,
  trainerId: string | null,
): Promise<TrainerOnboardingState> {
  if (!trainerId) return EMPTY_STATE;

  const [{ data: responseRows }, { data: statusRows }] = await Promise.all([
    supabase
      .from("onboarding_responses")
      .select("part_number, activity_key, response")
      .eq("trainer_id", trainerId),
    supabase
      .from("onboarding_part_status")
      .select("part_number, status")
      .eq("trainer_id", trainerId),
  ]);

  const responses: Record<string, string> = {};
  for (const row of responseRows ?? []) {
    responses[`${row.part_number}:${row.activity_key}`] = row.response;
  }

  const statuses: Record<number, OnboardingPartStatus> = {};
  for (const row of statusRows ?? []) {
    statuses[row.part_number] = row.status as OnboardingPartStatus;
  }

  return { responses, statuses };
}

/** A part with no explicit status is "in progress" once any activity has an answer, otherwise not started. */
export function effectivePartStatus(
  partNumber: number,
  state: TrainerOnboardingState,
): OnboardingPartStatus {
  const explicit = state.statuses[partNumber];
  if (explicit) return explicit;

  const part = onboardingParts.find((p) => p.number === partNumber);
  if (!part) return "not_started";

  const hasAnyAnswer = part.sections.some((s) =>
    (s.activities ?? []).some((a) => {
      const value = state.responses[`${partNumber}:${a.key}`];
      return value && value.trim().length > 0;
    }),
  );

  return hasAnyAnswer ? "in_progress" : "not_started";
}

export function partCompletionFraction(partNumber: number, state: TrainerOnboardingState): number {
  const part = onboardingParts.find((p) => p.number === partNumber);
  if (!part) return 0;
  const total = totalActivityCount(part);
  if (total === 0) return effectivePartStatus(partNumber, state) === "complete" ? 1 : 0;

  const answered = part.sections.reduce((sum, s) => {
    return (
      sum +
      (s.activities ?? []).filter((a) => {
        const value = state.responses[`${partNumber}:${a.key}`];
        return value && value.trim().length > 0;
      }).length
    );
  }, 0);

  return answered / total;
}
