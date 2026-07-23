"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { Trainer } from "@/lib/types";
import { addTrainer, updateTrainer, setTrainerActive } from "../actions";
import { initialTrainerFormState } from "../state";
import TrainerFields from "./TrainerFields";
import Avatar from "../../components/Avatar";
import { focusRing } from "../../components/ui";

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`press rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${focusRing}`}
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

function TrainerRow({ trainer }: { trainer: Trainer }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const boundUpdate = updateTrainer.bind(null, trainer.id);
  const [state, formAction] = useActionState(boundUpdate, initialTrainerFormState);

  // Close the edit form the moment a save succeeds. Adjusting state while
  // rendering, guarded by a change check, rather than in an effect: this is
  // a direct reaction to the new state value, not a side effect.
  const [lastHandledState, setLastHandledState] = useState(state);
  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state.status === "success" && editing) setEditing(false);
  }

  return (
    <li className="rounded-2xl border border-black/5 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={trainer.name} size="md" muted={!trainer.active} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-foreground">{trainer.name}</span>
              {!trainer.active && (
                <span className="rounded-full bg-fill px-2 py-0.5 text-xs font-semibold text-secondary-label">
                  Inactive
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-secondary-label">
              {trainer.email ?? "No email on file"} &middot; {trainer.gender} &middot; {trainer.availability}
            </p>
            {trainer.bio && (
              <p className="mt-1.5 max-w-md text-sm text-foreground">{trainer.bio}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={`press rounded-full bg-fill px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-fill/70 ${focusRing}`}
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await setTrainerActive(trainer.id, !trainer.active);
              })
            }
            className={`press rounded-full bg-fill px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-fill/70 disabled:opacity-50 ${focusRing}`}
          >
            {trainer.active ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      </div>

      {editing && (
        <form action={formAction} className="mt-4 border-t border-black/5 pt-4">
          {state.status === "error" && state.message && (
            <div className="mb-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.message}</div>
          )}
          <TrainerFields defaults={trainer} fieldErrors={state.fieldErrors} />
          <div className="mt-3">
            <SaveButton label="Save changes" />
          </div>
        </form>
      )}
    </li>
  );
}

function AddTrainerForm() {
  const [state, formAction] = useActionState(addTrainer, initialTrainerFormState);
  const [open, setOpen] = useState(false);

  const [lastHandledState, setLastHandledState] = useState(state);
  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state.status === "success" && open) setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`press self-start rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white ${focusRing}`}
      >
        Add trainer
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-black/5 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <h2 className="text-sm font-semibold text-foreground">New trainer</h2>
      {state.status === "error" && state.message && (
        <div className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.message}</div>
      )}
      <div className="mt-3">
        <TrainerFields fieldErrors={state.fieldErrors} />
      </div>
      <div className="mt-3 flex gap-2">
        <SaveButton label="Add trainer" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={`press rounded-full bg-fill px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-fill/70 ${focusRing}`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function TrainerRoster({ trainers }: { trainers: Trainer[] }) {
  return (
    <div className="mt-6 flex flex-col gap-4">
      <AddTrainerForm />
      <ul className="flex flex-col gap-3">
        {trainers.map((trainer) => (
          <TrainerRow key={trainer.id} trainer={trainer} />
        ))}
      </ul>
    </div>
  );
}
