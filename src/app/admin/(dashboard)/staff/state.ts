// Form state for the staff/access screen. Kept out of actions.ts because a
// "use server" file may only export async functions, not plain values.

export interface StaffFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialStaffFormState: StaffFormState = { status: "idle" };
