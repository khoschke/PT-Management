// Form state for the development screens. Kept out of actions.ts because a
// "use server" file may only export async functions, not plain values.

export interface GoalFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialGoalFormState: GoalFormState = { status: "idle" };
