// Sign-in form state. Kept out of actions.ts because a "use server" file may
// only export async functions, not plain values.

export interface LoginState {
  status: "idle" | "error";
  message?: string;
}

export const initialLoginState: LoginState = { status: "idle" };
