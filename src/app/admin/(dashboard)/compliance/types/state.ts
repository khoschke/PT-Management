// Add/edit form state for document types. Separate from actions.ts because a
// "use server" file may only export async functions.

export interface DocumentTypeFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialDocumentTypeFormState: DocumentTypeFormState = { status: "idle" };
