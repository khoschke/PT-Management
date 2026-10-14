// Form state for the setup checklist screens. Kept out of actions.ts because a
// "use server" file may only export async functions, not plain values.

export interface SetupHeaderFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialSetupHeaderFormState: SetupHeaderFormState = { status: "idle" };
