"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { addGoal, addNote, deleteGoal, deleteNote, setGoalStatus, updateGoal } from "../actions";
import { initialGoalFormState } from "../state";
import { GOAL_STATUS_CLASS, GOAL_STATUS_LABEL, MAX_ACTIVE_GOALS, type GoalPrompt } from "@/lib/development";
import type { DevelopmentGoal, DevelopmentGoalStatus, DevelopmentNote } from "@/lib/types";
import { focusRing } from "../../components/ui";

const inputClass =
  "mt-1.5 w-full rounded-xl border-none bg-fill px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-foreground";

const dateFormat = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" });

// Timestamps are absolute, so the browser's zone is the right lens for them.
function formatTimestamp(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : dateFormat.format(d);
}

// A target_date is a plain calendar date with no time or zone. Passing
// "2026-10-01" to `new Date()` parses it as UTC midnight, which renders as the
// previous day anywhere west of Greenwich. Build it in local time instead so
// the date shown is always the date that was picked.
function formatCalendarDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return dateFormat.format(new Date(year, month - 1, day));
}

export interface Viewer {
  userId: string;
  /** The manager reads and responds. Only the owner writes goals. */
  isManager: boolean;
  /** True when the viewer owns this profile. */
  isOwner: boolean;
}

interface Props {
  trainerId: string;
  /** Who this profile belongs to, for second-person vs third-person copy. */
  personName: string;
  goals: DevelopmentGoal[];
  notes: DevelopmentNote[];
  prompts: GoalPrompt[];
  authorNames: Record<string, string>;
  viewer: Viewer;
}

function SubmitButton({ label }: { label: string }) {
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

// A thread of notes plus a composer. Used under each goal and, with goalId
// null, as the check-in conversation for the person as a whole.
function Conversation({
  trainerId,
  goalId,
  notes,
  authorNames,
  viewer,
  placeholder,
  emptyLine,
}: {
  trainerId: string;
  goalId: string | null;
  notes: DevelopmentNote[];
  authorNames: Record<string, string>;
  viewer: Viewer;
  placeholder: string;
  emptyLine: string;
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function post() {
    const text = body.trim();
    if (!text) return;
    setError(null);
    startTransition(async () => {
      const result = await addNote(trainerId, goalId, text);
      if (result.ok) setBody("");
      else setError(result.message ?? "Couldn't post that.");
    });
  }

  function remove(noteId: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteNote(noteId);
      if (!result.ok) setError(result.message ?? "Couldn't remove that note.");
    });
  }

  return (
    <div className="mt-4 border-t border-black/5 pt-4">
      {notes.length === 0 ? (
        <p className="text-sm text-secondary-label">{emptyLine}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => {
            const mine = note.author_id === viewer.userId;
            return (
              <li key={note.id} className="rounded-xl bg-fill/60 px-3.5 py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {authorNames[note.author_id] ?? "Someone"}
                    {mine && <span className="font-normal text-secondary-label"> (you)</span>}
                  </span>
                  <span className="text-xs text-secondary-label">{formatTimestamp(note.created_at)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{note.body}</p>
                {mine && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => remove(note.id)}
                    className="mt-1.5 text-xs font-semibold text-secondary-label underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder={placeholder}
          className="w-full rounded-xl border-none bg-fill px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-foreground"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            disabled={isPending || !body.trim()}
            onClick={post}
            className={`press rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40 ${focusRing}`}
          >
            {isPending ? "Posting..." : "Post"}
          </button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  );
}

function GoalCard({
  goal,
  notes,
  authorNames,
  viewer,
  personName,
}: {
  goal: DevelopmentGoal;
  notes: DevelopmentNote[];
  authorNames: Record<string, string>;
  viewer: Viewer;
  personName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const [detail, setDetail] = useState(goal.detail);
  const [targetDate, setTargetDate] = useState(goal.target_date ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; message?: string }>, onSuccess?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.ok) onSuccess?.();
      else setError(result.message ?? "Something went wrong.");
    });
  }

  const otherStatuses = (["active", "achieved", "parked"] as DevelopmentGoalStatus[]).filter(
    (s) => s !== goal.status,
  );

  return (
    <li className="rounded-2xl border border-black/5 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]">
      {editing ? (
        <div>
          <label className="text-sm font-semibold text-foreground">Goal</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          <label className="mt-3 block text-sm font-semibold text-foreground">
            What it looks like, and why it matters
          </label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            className={inputClass}
          />
          <label className="mt-3 block text-sm font-semibold text-foreground">Target date (optional)</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className={inputClass}
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                run(
                  () => updateGoal(goal.id, { title, detail, targetDate: targetDate || null }),
                  () => setEditing(false),
                )
              }
              className={`press rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${focusRing}`}
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setTitle(goal.title);
                setDetail(goal.detail);
                setTargetDate(goal.target_date ?? "");
                setEditing(false);
                setError(null);
              }}
              className={`press rounded-full bg-fill px-4 py-2 text-sm font-semibold text-foreground ${focusRing}`}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold tracking-tight text-foreground">{goal.title}</h3>
              {goal.detail && (
                <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-secondary-label">
                  {goal.detail}
                </p>
              )}
              {goal.target_date && (
                <p className="mt-1.5 text-xs text-secondary-label">Aiming for {formatCalendarDate(goal.target_date)}</p>
              )}
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${GOAL_STATUS_CLASS[goal.status]}`}
            >
              {GOAL_STATUS_LABEL[goal.status]}
            </span>
          </div>

          {viewer.isOwner && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setEditing(true)}
                className={`press rounded-full bg-fill px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-50 ${focusRing}`}
              >
                Edit
              </button>
              {otherStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={isPending}
                  onClick={() => run(() => setGoalStatus(goal.id, status))}
                  className={`press rounded-full bg-fill px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-50 ${focusRing}`}
                >
                  {status === "active"
                    ? "Make active"
                    : status === "achieved"
                      ? "Mark achieved"
                      : "Park it"}
                </button>
              ))}
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  if (confirm(`Remove "${goal.title}"? The conversation on it goes too.`)) {
                    run(() => deleteGoal(goal.id));
                  }
                }}
                className={`press rounded-full bg-fill px-3 py-1.5 text-xs font-semibold text-secondary-label disabled:opacity-50 ${focusRing}`}
              >
                Remove
              </button>
            </div>
          )}
        </>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <Conversation
        trainerId={goal.trainer_id}
        goalId={goal.id}
        notes={notes}
        authorNames={authorNames}
        viewer={viewer}
        placeholder={viewer.isOwner ? "Add a thought, or reply" : `Ask ${personName} something about this goal`}
        emptyLine={
          viewer.isOwner
            ? "No conversation on this goal yet."
            : "Nothing said on this goal yet. A question usually works better than a correction."
        }
      />
    </li>
  );
}

function AddGoalForm({ prompts, atCap }: { prompts: GoalPrompt[]; atCap: boolean }) {
  const [state, formAction] = useActionState(addGoal, initialGoalFormState);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const errors = state.fieldErrors ?? {};

  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (state.status === "success") {
      setOpen(false);
      setTitle("");
    }
  }

  if (atCap) {
    return (
      <p className="rounded-2xl border border-dashed border-black/10 px-5 py-4 text-sm text-secondary-label">
        You have {MAX_ACTIVE_GOALS} goals on the go, which is plenty. Finish one or park it before adding another.
      </p>
    );
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`press self-start rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white ${focusRing}`}
        >
          Add a goal
        </button>
        {prompts.length > 0 && (
          <div className="rounded-2xl bg-fill/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-label">
              Not sure where to start
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {prompts.map((prompt) => (
                <li key={prompt.text}>
                  <button
                    type="button"
                    onClick={() => {
                      setTitle(prompt.text);
                      setOpen(true);
                    }}
                    className="text-left text-[15px] leading-relaxed text-foreground underline decoration-black/20 underline-offset-4 hover:decoration-black/50"
                  >
                    {prompt.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-black/5 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <h3 className="text-sm font-semibold text-foreground">New goal</h3>
      {state.status === "error" && state.message && (
        <div className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.message}</div>
      )}
      <div className="mt-3">
        <label className="text-sm font-semibold text-foreground">Goal</label>
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
      </div>
      <div className="mt-3">
        <label className="text-sm font-semibold text-foreground">
          What it looks like, and why it matters (optional)
        </label>
        <textarea name="detail" rows={3} className={inputClass} />
      </div>
      <div className="mt-3">
        <label className="text-sm font-semibold text-foreground">Target date (optional)</label>
        <input name="targetDate" type="date" className={inputClass} />
        <p className="mt-1 text-xs text-secondary-label">
          Leave it blank if a date would not help. Plenty of good goals do not have one.
        </p>
      </div>
      <div className="mt-3 flex gap-2">
        <SubmitButton label="Add goal" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={`press rounded-full bg-fill px-4 py-2 text-sm font-semibold text-foreground ${focusRing}`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function DevelopmentProfile({
  trainerId,
  personName,
  goals,
  notes,
  prompts,
  authorNames,
  viewer,
}: Props) {
  const notesByGoal = new Map<string, DevelopmentNote[]>();
  const checkIns: DevelopmentNote[] = [];
  for (const note of notes) {
    if (note.goal_id === null) {
      checkIns.push(note);
      continue;
    }
    const list = notesByGoal.get(note.goal_id) ?? [];
    list.push(note);
    notesByGoal.set(note.goal_id, list);
  }

  const activeGoals = goals.filter((g) => g.status === "active");
  const restingGoals = goals.filter((g) => g.status !== "active");

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Goals</h2>
        <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
          {viewer.isOwner
            ? "Yours to set and yours to change. Your manager can read them and talk them through with you, but cannot edit them."
            : `${personName} sets these themselves. You can talk them through underneath, and you cannot edit them, which is deliberate.`}
        </p>

        <ul className="mt-4 flex flex-col gap-4">
          {activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              notes={notesByGoal.get(goal.id) ?? []}
              authorNames={authorNames}
              viewer={viewer}
              personName={personName}
            />
          ))}
        </ul>

        {activeGoals.length === 0 && !viewer.isOwner && (
          <p className="mt-4 rounded-2xl border border-dashed border-black/10 px-5 py-6 text-sm text-secondary-label">
            No goals set yet. Worth raising at the next check-in below.
          </p>
        )}

        {viewer.isOwner && (
          <div className="mt-4">
            <AddGoalForm prompts={prompts} atCap={activeGoals.length >= MAX_ACTIVE_GOALS} />
          </div>
        )}

        {restingGoals.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary-label">
              Achieved and parked
            </h3>
            <ul className="mt-3 flex flex-col gap-4">
              {restingGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  notes={notesByGoal.get(goal.id) ?? []}
                  authorNames={authorNames}
                  viewer={viewer}
                  personName={personName}
                />
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Check-ins</h2>
        <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
          The running conversation about how things are going overall, rather than about one goal.
        </p>
        <div className="mt-4 rounded-2xl border border-black/5 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]">
          <Conversation
            trainerId={trainerId}
            goalId={null}
            notes={checkIns}
            authorNames={authorNames}
            viewer={viewer}
            placeholder={viewer.isOwner ? "How is it going?" : `Note from a check-in with ${personName}`}
            emptyLine="No check-ins yet."
          />
        </div>
      </section>
    </div>
  );
}
