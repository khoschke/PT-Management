// Form state for the forgot-password screen. Kept out of actions.ts because a
// "use server" file may only export async functions, not plain values.

export interface ForgotPasswordState {
  status: "idle" | "sent" | "error";
  message?: string;
}

export const initialForgotPasswordState: ForgotPasswordState = { status: "idle" };
