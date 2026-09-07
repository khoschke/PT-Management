// Form state for the set-a-new-password screen. Kept out of actions.ts because
// a "use server" file may only export async functions, not plain values.

export interface ResetPasswordState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialResetPasswordState: ResetPasswordState = { status: "idle" };
