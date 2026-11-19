// The tag taxonomy shared between the public form and trainer specialties, so
// the two can be matched for allocation. One list, three groups:
//
//   goal: what the member wants to achieve. These mirror the Kinetic Hustl
//         waiver form, so a client sees the same wording on both touchpoints.
//   who:  who the member is.
//   how:  how they want to be coached.
//
// Leads store every tag they ticked in `leads.goals` and trainers in
// `trainers.specialties` (both plain text arrays, no database enum), and
// allocation scores the overlap across all three groups.
//
// Test for any new tag: would we match a member differently based on it? If
// not, it belongs in the trainer's bio, not here (change list, Batch 3).

export type TagGroup = "goal" | "who" | "how";

export type GoalCode =
  // Goals
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
  | "other"
  // Who they work with
  | "beginners"
  | "older_adults"
  | "womens_health"
  | "pre_post_natal"
  | "menopause"
  | "teens_youth"
  | "runners_endurance"
  | "physique_comp_prep"
  // How they work
  | "online_coaching"
  | "nutrition_coaching";

export type GoalOption = {
  code: GoalCode;
  group: TagGroup;
  /** The trainer-side name, used on the roster, lead panel, emails and CSV. */
  label: string;
  /** How the public form words it, when that differs from `label`. */
  memberLabel?: string;
};

export const GOAL_OPTIONS: GoalOption[] = [
  { code: "reduce_body_fat", group: "goal", label: "Reduce body fat" },
  { code: "weight_loss", group: "goal", label: "Weight loss" },
  { code: "increase_muscle_mass", group: "goal", label: "Increase muscle mass" },
  { code: "increase_strength", group: "goal", label: "Increase strength" },
  { code: "improve_muscle_tone", group: "goal", label: "Improve muscle tone" },
  { code: "reshape", group: "goal", label: "Reshape" },
  { code: "cardio_endurance", group: "goal", label: "Improve cardiovascular endurance" },
  { code: "sports_conditioning", group: "goal", label: "Sports conditioning" },
  { code: "stress_management", group: "goal", label: "Stress management" },
  { code: "rehabilitation", group: "goal", label: "Rehabilitation" },
  { code: "other", group: "goal", label: "Other" },

  { code: "beginners", group: "who", label: "Beginners and returning to exercise", memberLabel: "I'm new to exercise, or getting back into it" },
  { code: "older_adults", group: "who", label: "Older adults", memberLabel: "Staying strong and active as I get older" },
  { code: "womens_health", group: "who", label: "Women's health", memberLabel: "Women's health" },
  { code: "pre_post_natal", group: "who", label: "Pre and post natal", memberLabel: "Pregnancy, or after having a baby" },
  { code: "menopause", group: "who", label: "Peri-menopause and menopause", memberLabel: "Peri-menopause or menopause" },
  { code: "teens_youth", group: "who", label: "Teens and youth", memberLabel: "I'm under 18" },
  { code: "runners_endurance", group: "who", label: "Runners and endurance athletes", memberLabel: "Running or endurance events" },
  { code: "physique_comp_prep", group: "who", label: "Physique and competition prep", memberLabel: "Physique or competition prep" },

  { code: "online_coaching", group: "how", label: "Online coaching", memberLabel: "Online coaching, with a program I follow on my own" },
  { code: "nutrition_coaching", group: "how", label: "Nutrition coaching", memberLabel: "Help with my nutrition" },
];

export const TAG_GROUPS: { group: TagGroup; title: string }[] = [
  { group: "goal", title: "Goals" },
  { group: "who", title: "Who they work with" },
  { group: "how", title: "How they work" },
];

export function optionsInGroup(group: TagGroup, { includeOther = false } = {}): GoalOption[] {
  return GOAL_OPTIONS.filter((g) => g.group === group && (includeOther || g.code !== "other"));
}

export const GOAL_LABELS: Record<GoalCode, string> = GOAL_OPTIONS.reduce(
  (acc, { code, label }) => ({ ...acc, [code]: label }),
  {} as Record<GoalCode, string>,
);

export function goalLabel(code: string): string {
  return GOAL_LABELS[code as GoalCode] ?? code;
}

export function isGoalTag(code: string): boolean {
  return GOAL_OPTIONS.some((g) => g.code === code && g.group === "goal");
}
