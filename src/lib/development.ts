import type { DevelopmentGoalStatus } from "@/lib/types";

// How many goals someone may have running at once.
//
// This is a coaching guardrail, not a permission, which is why it lives here
// and in the server action rather than in a database trigger. Someone on a
// full shift, working the onboarding workbook and chasing their certs is
// already carrying plenty. A list of twelve goals is not ambition, it is
// resistance: it gets abandoned, and then so does the habit of setting goals
// at all. Wanting a fourth means finishing or parking one first, which is the
// more useful conversation anyway.
export const MAX_ACTIVE_GOALS = 3;

export const GOAL_STATUS_LABEL: Record<DevelopmentGoalStatus, string> = {
  active: "Active",
  achieved: "Achieved",
  parked: "Parked",
};

// No red anywhere, and no "overdue". A goal that goes red teaches people to
// stop setting goals. Parked is a legitimate resting place and reads as one.
export const GOAL_STATUS_CLASS: Record<DevelopmentGoalStatus, string> = {
  active: "bg-fill text-foreground ring-1 ring-inset ring-black/10",
  achieved: "bg-green-50 text-green-700",
  parked: "bg-fill text-secondary-label",
};

export interface GoalPrompt {
  /** Workbook part this came out of, or null for the general ones. */
  part: number | null;
  text: string;
}

// Seeds for the empty state. An "add a goal" button over a blank page asks
// someone to overcome inertia with a blank page, which is the hardest version
// of the task. These give them something to react to instead.
//
// Ordered so the general three can carry the screen on their own before
// anybody has touched the workbook.
export const GOAL_PROMPTS: GoalPrompt[] = [
  { part: null, text: "What is one thing you want to be noticeably better at in three months?" },
  { part: null, text: "What part of becoming a PT feels furthest away right now?" },
  { part: null, text: "What is the smallest next step you could take this week?" },
  { part: 2, text: "Which coaching skill do you most want to develop, and how would you practise it?" },
  { part: 3, text: "What did Know Yourself surface that you want to work on?" },
  { part: 5, text: "Where does your communication break down, and what would better look like?" },
  { part: 6, text: "What do you want to be able to run confidently in a client consultation?" },
  { part: 7, text: "How will you find your first clients, and what needs to be true first?" },
  { part: 9, text: "What would make a client want to stay with you for a year?" },
];

// Prompts tied to parts the person has actually worked through, so the empty
// state reflects where they are rather than where the workbook ends. Falls
// back to the general ones, which is the right answer on day one.
export function promptsFor(touchedParts: Set<number>, limit = 3): GoalPrompt[] {
  const fromTheirWork = GOAL_PROMPTS.filter((p) => p.part !== null && touchedParts.has(p.part));
  const general = GOAL_PROMPTS.filter((p) => p.part === null);
  return [...fromTheirWork, ...general].slice(0, limit);
}
