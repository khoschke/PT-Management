"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { Trainer } from "@/lib/types";
import { addTrainer, updateTrainer, setTrainerActive, initialTrainerFormState } from "../actions";
import TrainerFields from "./TrainerFields";

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
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
    <li className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">{trainer.name}</span>
            {!trainer.active && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-500">
                Inactive
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-neutral-500">
            {trainer.email ?? "No email on file"} &middot; {trainer.gender} &middot; {trainer.availability}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-900"
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
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-900 disabled:opacity-50"
          >
            {trainer.active ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      </div>

      {editing && (
        <form action={formAction} className="mt-4 border-t border-neutral-200 pt-4">
          {state.status === "error" && state.message && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {state.message}
            </div>
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
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
      >
        Add trainer
      </button>
    );
  }

  return (
    <form action={formAction} className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-bold text-neutral-900">New trainer</h2>
      {state.status === "error" && state.message && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.message}
        </div>
      )}
      <div className="mt-3">
        <TrainerFields fieldErrors={state.fieldErrors} />
      </div>
      <div className="mt-3 flex gap-2">
        <SaveButton label="Add trainer" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-neutral-900"
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
