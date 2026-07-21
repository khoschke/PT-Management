"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { addManager, addTrainerLogin, makeManager, removeStaffAccess } from "../actions";
import { initialStaffFormState } from "../state";
import type { StaffMember } from "../page";

const inputClass =
  "mt-1.5 w-full rounded-xl border-none bg-fill px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-foreground";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="press rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

function RoleBadge({ role }: { role: "manager" | "trainer" }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
        role === "manager" ? "bg-foreground text-white" : "bg-fill text-secondary-label"
      }`}
    >
      {role}
    </span>
  );
}

function StaffRow({ member, isSelf }: { member: StaffMember; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.message ?? "Something went wrong.");
    });
  }

  return (
    <li className="rounded-2xl border border-black/5 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-foreground">
              {member.fullName ?? member.email ?? "Unknown"}
            </span>
            <RoleBadge role={member.role} />
            {isSelf && <span className="text-xs text-secondary-label">(you)</span>}
          </div>
          <p className="mt-0.5 text-sm text-secondary-label">
            {member.email ?? "No email"}
            {member.trainerName && <> &middot; roster: {member.trainerName}</>}
          </p>
        </div>
        <div className="flex gap-2">
          {member.role === "trainer" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => makeManager(member.id))}
              className="press rounded-full bg-fill px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-50"
            >
              Make manager
            </button>
          )}
          <button
            type="button"
            disabled={isPending || isSelf}
            title={isSelf ? "You can't remove your own access" : undefined}
            onClick={() => {
              if (confirm(`Remove access for ${member.fullName ?? member.email}?`)) {
                run(() => removeStaffAccess(member.id));
              }
            }}
            className="press rounded-full bg-fill px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-40"
          >
            Remove access
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </li>
  );
}

function AddManagerForm() {
  const [state, formAction] = useActionState(addManager, initialStaffFormState);
  const [open, setOpen] = useState(false);
  const errors = state.fieldErrors ?? {};

  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (state.status === "success" && open) setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press self-start rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white"
      >
        Add manager
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-black/5 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <h2 className="text-sm font-semibold text-foreground">New manager</h2>
      <p className="mt-0.5 text-xs text-secondary-label">
        Full access: sees and allocates every lead, and can manage staff. Good for the gym owners.
      </p>
      {state.status === "error" && state.message && (
        <div className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.message}</div>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-foreground">Name</label>
          <input name="fullName" type="text" required className={inputClass} />
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground">Email</label>
          <input name="email" type="email" required className={inputClass} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
      </div>
      <div className="mt-3">
        <label className="text-sm font-semibold text-foreground">Temporary password</label>
        <input name="password" type="text" required minLength={8} className={inputClass} />
        <p className="mt-1 text-xs text-secondary-label">
          At least 8 characters. Share it with them, they can use it to sign in. (Only used for a brand-new login.)
        </p>
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
      </div>
      <div className="mt-3 flex gap-2">
        <SubmitButton label="Add manager" />
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

function AddTrainerLoginForm({ trainers }: { trainers: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState(addTrainerLogin, initialStaffFormState);
  const [open, setOpen] = useState(false);
  const errors = state.fieldErrors ?? {};

  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (state.status === "success" && open) setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press self-start rounded-full bg-fill px-4 py-2 text-sm font-semibold text-foreground"
      >
        Add trainer login
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-black/5 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <h2 className="text-sm font-semibold text-foreground">New trainer login</h2>
      <p className="mt-0.5 text-xs text-secondary-label">
        Lets a trainer sign in to see and update only their own allocated leads. Pick which roster trainer this login
        belongs to.
      </p>
      {state.status === "error" && state.message && (
        <div className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.message}</div>
      )}
      <div className="mt-3">
        <label className="text-sm font-semibold text-foreground">Trainer</label>
        <select name="trainerId" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Choose a trainer
          </option>
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {errors.trainerId && <p className="mt-1 text-xs text-red-600">{errors.trainerId}</p>}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-foreground">Email</label>
          <input name="email" type="email" required className={inputClass} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground">Temporary password</label>
          <input name="password" type="text" required minLength={8} className={inputClass} />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <SubmitButton label="Add trainer login" />
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

export default function StaffManager({
  staff,
  trainersWithoutLogin,
  currentUserId,
}: {
  staff: StaffMember[];
  trainersWithoutLogin: { id: string; name: string }[];
  currentUserId: string;
}) {
  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <AddManagerForm />
        {trainersWithoutLogin.length > 0 && <AddTrainerLoginForm trainers={trainersWithoutLogin} />}
      </div>

      {trainersWithoutLogin.length === 0 && (
        <p className="text-xs text-secondary-label">
          Every active roster trainer already has a login. Add a trainer on the Trainers page first to give them one.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {staff.map((member) => (
          <StaffRow key={member.id} member={member} isSelf={member.id === currentUserId} />
        ))}
        {staff.length === 0 && (
          <li className="rounded-2xl border border-dashed border-black/10 py-10 text-center text-sm text-secondary-label">
            No staff yet.
          </li>
        )}
      </ul>
    </div>
  );
}
