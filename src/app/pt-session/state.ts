// Form state for the public lead form. Kept out of actions.ts because a
// "use server" file may only export async functions, not plain values.

export interface LeadFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialLeadFormState: LeadFormState = { status: "idle" };
