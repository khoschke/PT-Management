// Trainer add/edit form state. Kept out of actions.ts because a "use server"
// file may only export async functions, not plain values.

export interface TrainerFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialTrainerFormState: TrainerFormState = { status: "idle" };
