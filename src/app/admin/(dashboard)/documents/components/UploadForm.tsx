"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { DocumentType } from "@/lib/types";
import { ALLOWED_EXTENSIONS, OTHER_TYPE_KEY, expiryRuleHint } from "@/lib/documents";
import { uploadDocument } from "../actions";
import { initialDocumentFormState } from "../state";

const inputClass =
  "mt-1.5 w-full rounded-xl border-none bg-fill px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-foreground";

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="press rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
    >
      {pending ? "Uploading..." : "Upload document"}
    </button>
  );
}

export default function UploadForm({
  trainerId,
  documentTypes,
}: {
  trainerId: string;
  documentTypes: DocumentType[];
}) {
  const [state, formAction] = useActionState(uploadDocument, initialDocumentFormState);
  const [open, setOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState(documentTypes[0]?.id ?? "");

  // Reset and close the moment an upload succeeds.
  const [lastHandledState, setLastHandledState] = useState(state);
  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state.status === "success" && open) {
      setOpen(false);
      setSelectedTypeId(documentTypes[0]?.id ?? "");
    }
  }

  const selectedType = documentTypes.find((t) => t.id === selectedTypeId);
  const isOther = selectedType?.key === OTHER_TYPE_KEY;
  const showExpiry = selectedType && selectedType.expiry_rule !== "none";
  const expiryRequired = selectedType?.expiry_rule === "required";
  const errors = state.fieldErrors ?? {};

  if (documentTypes.length === 0) {
    return (
      <p className="text-sm text-secondary-label">
        No document types are set up yet. Ask the PT manager to add some first.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press self-start rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white"
      >
        Upload a document
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-black/5 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <h2 className="text-sm font-semibold text-foreground">Upload a document</h2>
      {state.status === "error" && state.message && (
        <div className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.message}</div>
      )}

      <input type="hidden" name="trainerId" value={trainerId} />

      <div className="mt-3">
        <label className="text-sm font-semibold text-foreground">Document type</label>
        <select
          name="documentTypeId"
          value={selectedTypeId}
          onChange={(e) => setSelectedTypeId(e.target.value)}
          className={inputClass}
        >
          {documentTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
        {selectedType && <p className="mt-1 text-xs text-secondary-label">{expiryRuleHint(selectedType.expiry_rule)}</p>}
      </div>

      {isOther && (
        <div className="mt-3">
          <label className="text-sm font-semibold text-foreground">Document name</label>
          <input
            name="customLabel"
            type="text"
            maxLength={120}
            placeholder="e.g. Blue Card, Working with Children"
            className={inputClass}
          />
          {errors.customLabel && <p className="mt-1 text-xs text-red-600">{errors.customLabel}</p>}
        </div>
      )}

      {showExpiry && (
        <div className="mt-3">
          <label className="text-sm font-semibold text-foreground">
            Expiry date {expiryRequired ? "" : <span className="font-normal text-secondary-label">(optional)</span>}
          </label>
          <input name="expiryDate" type="date" required={expiryRequired} className={inputClass} />
          {errors.expiryDate && <p className="mt-1 text-xs text-red-600">{errors.expiryDate}</p>}
        </div>
      )}

      <div className="mt-3">
        <label className="text-sm font-semibold text-foreground">File</label>
        <input
          name="file"
          type="file"
          required
          accept={ALLOWED_EXTENSIONS.join(",")}
          className="mt-1.5 block w-full text-sm text-secondary-label file:mr-3 file:rounded-full file:border-0 file:bg-fill file:px-4 file:py-2 file:text-sm file:font-semibold file:text-foreground"
        />
        <p className="mt-1 text-xs text-secondary-label">PDF, JPG or PNG, up to 10 MB.</p>
        {errors.file && <p className="mt-1 text-xs text-red-600">{errors.file}</p>}
      </div>

      <div className="mt-4 flex gap-2">
        <UploadButton />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="press rounded-full bg-fill px-4 py-2 text-sm font-semibold text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
