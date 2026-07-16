// Goal options shared between the public form (field 5) and trainer
// specialties, so the two can be matched for allocation.

export type GoalCode =
  | "lose_fat"
  | "build_muscle"
  | "get_stronger"
  | "general_fitness"
  | "consistent_routine"
  | "reduce_stress"
  | "sport_event"
  | "move_better"
  | "other";

export const GOAL_OPTIONS: { code: GoalCode; label: string }[] = [
  { code: "lose_fat", label: "Lose body fat" },
  { code: "build_muscle", label: "Build muscle or tone up" },
  { code: "get_stronger", label: "Get stronger" },
  { code: "general_fitness", label: "Improve general fitness and energy" },
  { code: "consistent_routine", label: "Build a consistent routine" },
  { code: "reduce_stress", label: "Reduce stress and feel better mentally" },
  { code: "sport_event", label: "Train for a sport or event" },
  { code: "move_better", label: "Move better or reduce pain" },
  { code: "other", label: "Other" },
];

export const GOAL_LABELS: Record<GoalCode, string> = GOAL_OPTIONS.reduce(
  (acc, { code, label }) => ({ ...acc, [code]: label }),
  {} as Record<GoalCode, string>,
);

export function goalLabel(code: string): string {
  return GOAL_LABELS[code as GoalCode] ?? code;
}
