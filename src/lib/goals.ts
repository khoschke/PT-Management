// Goal / specialty options shared between the public form (field 5, "what
// results do you want to achieve?") and trainer specialties, so the two can be
// matched for allocation. These mirror the Kinetic Hustl waiver form so a
// client sees the same wording on both touchpoints.

export type GoalCode =
  | "reduce_body_fat"
  | "weight_loss"
  | "increase_muscle_mass"
  | "increase_strength"
  | "improve_muscle_tone"
  | "reshape"
  | "cardio_endurance"
  | "sports_conditioning"
  | "stress_management"
  | "rehabilitation"
  | "other";

export const GOAL_OPTIONS: { code: GoalCode; label: string }[] = [
  { code: "reduce_body_fat", label: "Reduce body fat" },
  { code: "weight_loss", label: "Weight loss" },
  { code: "increase_muscle_mass", label: "Increase muscle mass" },
  { code: "increase_strength", label: "Increase strength" },
  { code: "improve_muscle_tone", label: "Improve muscle tone" },
  { code: "reshape", label: "Reshape" },
  { code: "cardio_endurance", label: "Improve cardiovascular endurance" },
  { code: "sports_conditioning", label: "Sports conditioning" },
  { code: "stress_management", label: "Stress management" },
  { code: "rehabilitation", label: "Rehabilitation" },
  { code: "other", label: "Other" },
];

export const GOAL_LABELS: Record<GoalCode, string> = GOAL_OPTIONS.reduce(
  (acc, { code, label }) => ({ ...acc, [code]: label }),
  {} as Record<GoalCode, string>,
);

export function goalLabel(code: string): string {
  return GOAL_LABELS[code as GoalCode] ?? code;
}
