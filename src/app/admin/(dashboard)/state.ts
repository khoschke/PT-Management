// Shared state and result types for the dashboard server actions. Kept out of
// actions.ts because a "use server" file may only export async functions, not
// plain values (interfaces are fine, but the initial-state object is not).

export interface ActionResult {
  ok: boolean;
  message?: string;
}

export interface AddSweepLeadState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialAddSweepLeadState: AddSweepLeadState = { status: "idle" };
