// Form state for the trainer's own profile screen. Kept out of actions.ts
// because a "use server" file may only export async functions, not plain values.

export interface ProfileFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialProfileFormState: ProfileFormState = { status: "idle" };
