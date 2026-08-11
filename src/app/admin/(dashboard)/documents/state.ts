// Upload form state, shared by the trainer self-service page and the manager's
// per-trainer view. Kept out of actions.ts because a "use server" file may only
// export async functions.

export interface DocumentFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialDocumentFormState: DocumentFormState = { status: "idle" };
