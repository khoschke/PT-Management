// Form state for the account / change-password screen. Kept out of actions.ts
// because a "use server" file may only export async functions, not plain values.

export interface AccountFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialAccountFormState: AccountFormState = { status: "idle" };
