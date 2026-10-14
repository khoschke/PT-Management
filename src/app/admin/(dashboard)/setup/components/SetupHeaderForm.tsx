"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { TrainerSetupChecklist } from "@/lib/types";
import { saveSetupHeader } from "../actions";
import { initialSetupHeaderFormState } from "../state";
import { focusRing } from "../../components/ui";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`press rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${focusRing}`}
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

export default function SetupHeaderForm({
  trainerId,
  header,
}: {
  trainerId: string;
  header: TrainerSetupChecklist | null;
}) {
  const bound = saveSetupHeader.bind(null, trainerId);
  const [state, formAction] = useActionState(bound, initialSetupHeaderFormState);

  return (
    <form action={formAction} className="rounded-2xl border border-black/5 bg-surface p-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-foreground">Start date</span>
          <input
            type="date"
            name="startDate"
            defaultValue={header?.start_date ?? ""}
            className={`rounded-xl border border-black/10 bg-surface px-3 py-2 text-sm text-foreground ${focusRing}`}
          />
          {state.fieldErrors?.startDate && (
            <span className="text-sm font-medium text-red-700">{state.fieldErrors.startDate}</span>
          )}
        </label>
        <div className="flex-1" />
        <SaveButton />
      </div>

      <label className="mt-4 flex flex-col gap-1">
        <span className="text-sm font-semibold text-foreground">Amendments</span>
        <span className="text-sm text-secondary-label">
          Anything that varies for this person, the way the paper form&rsquo;s Amendments column does.
        </span>
        <textarea
          name="amendments"
          defaultValue={header?.amendments ?? ""}
          rows={3}
          className={`mt-1 w-full rounded-xl border border-black/10 bg-surface px-3 py-2 text-sm text-foreground ${focusRing}`}
        />
        {state.fieldErrors?.amendments && (
          <span className="text-sm font-medium text-red-700">{state.fieldErrors.amendments}</span>
        )}
      </label>

      {state.status === "error" && state.message && (
        <p className="mt-2 text-sm font-medium text-red-700">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="mt-2 text-sm font-medium text-green-700">Saved.</p>
      )}
    </form>
  );
}
