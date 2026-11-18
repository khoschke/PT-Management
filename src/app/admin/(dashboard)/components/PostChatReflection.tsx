"use client";

import { useEffect, useRef, useState } from "react";
import {
  REFLECTION_CERTAINTY_LABELS,
  REFLECTION_FEEL_LABELS,
  REFLECTION_STALL_LABELS,
  type PostChatReflection as Reflection,
  type ReflectionCertainty,
  type ReflectionFeel,
  type ReflectionStall,
} from "@/lib/types";
import { savePostChatReflection, skipPostChatReflection } from "../actions";

// The post-chat reflection (Part 7 amendments, item 18; Karl, 18 Nov 2026).
// Offered in the lead panel as soon as a lead moves on from Attended, so it's
// asked while the chat is fresh. Optional: Skip saves a skipped row and it
// isn't asked again, though the trainer can add one later or edit a saved one.
// To talk instead of type, trainers use their keyboard's microphone: it's far
// more accurate than the browser's own speech recognition, which was tried and
// dropped (Karl, 18 Nov 2026). Only text is ever saved.

type RunAction = (fn: () => Promise<{ ok: boolean; message?: string }>) => void;


const pill =
  "press cursor-pointer rounded-full bg-fill px-3 py-1.5 text-xs font-medium text-foreground transition has-[:checked]:bg-foreground has-[:checked]:text-white";

function Choice<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: Record<T, string>;
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {(Object.keys(options) as T[]).map((key) => (
        <label key={key} className={pill}>
          <input type="radio" name={name} value={key} checked={value === key} onChange={() => onChange(key)} className="sr-only" />
          {options[key]}
        </label>
      ))}
    </div>
  );
}

/** Has this lead just come out of a sales chat? (It moved on from Attended.) */
export function hadSalesChat(history: { old_status: string | null }[]): boolean {
  return history.some((h) => h.old_status === "Attended");
}

export default function PostChatReflection({
  leadId,
  leadName,
  reflection,
  canAnswer,
  isPending,
  runAction,
}: {
  leadId: string;
  leadName: string;
  reflection: Reflection | null;
  /** The allocated trainer, or the PT Manager on their own leads. */
  canAnswer: boolean;
  isPending: boolean;
  runAction: RunAction;
}) {
  const [feel, setFeel] = useState<ReflectionFeel | null>(null);
  const [stall, setStall] = useState<ReflectionStall | null>(null);
  const [certainty, setCertainty] = useState<ReflectionCertainty | null>(null);
  const [nextTime, setNextTime] = useState("");
  const [editing, setEditing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const showForm = canAnswer && (!reflection || editing);

  // The card sits at the top of the panel, often above where the trainer has
  // scrolled to change the status (Karl, 18 Nov 2026), so bring it into view
  // when the form appears and again when it's saved.
  useEffect(() => {
    if (showForm || justSaved) {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm, justSaved]);

  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 6000);
    return () => clearTimeout(t);
  }, [justSaved]);

  function startEditing() {
    setFeel(reflection?.feel ?? null);
    setStall(reflection?.stalled_at ?? null);
    setCertainty(reflection?.missing_certainty ?? null);
    setNextTime(reflection?.next_time ?? "");
    setJustSaved(false);
    setEditing(true);
  }

  // Saved: show it (the trainer sees their own, the PT Manager sees everyone's).
  if (reflection && !showForm) {
    if (reflection.skipped) {
      if (!canAnswer) return null;
      return (
        <section ref={sectionRef} className="rounded-2xl bg-fill px-4 py-3 text-sm text-secondary-label">
          You skipped the reflection on this chat.{" "}
          <button type="button" onClick={startEditing} className="font-semibold text-foreground underline underline-offset-2">
            Add one
          </button>
        </section>
      );
    }
    return (
      <section ref={sectionRef} className="rounded-2xl bg-fill px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">Post-chat reflection</h3>
          {canAnswer && (
            <button
              type="button"
              onClick={startEditing}
              className="press rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-black/10"
            >
              Edit
            </button>
          )}
        </div>
        {justSaved && (
          <p role="status" className="mt-2 flex items-center gap-1.5 rounded-xl bg-green-100 px-3 py-2 text-sm font-semibold text-green-800">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <path d="M5 12l5 5L19 7" />
            </svg>
            Reflection saved
          </p>
        )}
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Item label="How it went" value={reflection.feel ? REFLECTION_FEEL_LABELS[reflection.feel] : "Not recorded"} />
          <Item label="Where it stalled" value={reflection.stalled_at ? REFLECTION_STALL_LABELS[reflection.stalled_at] : "Not recorded"} />
          <Item
            label="Missing certainty"
            value={reflection.missing_certainty ? REFLECTION_CERTAINTY_LABELS[reflection.missing_certainty] : "Not recorded"}
          />
          <Item
            label={reflection.updated_at ? "Last edited" : "Saved"}
            value={new Date(reflection.updated_at ?? reflection.created_at).toLocaleDateString("en-AU", {
              timeZone: "Australia/Brisbane",
              day: "numeric",
              month: "short",
            })}
          />
        </dl>
        {reflection.next_time && (
          <div className="mt-3 rounded-2xl bg-surface px-4 py-3">
            <span className="text-xs font-semibold text-secondary-label">Next time</span>
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{reflection.next_time}</p>
          </div>
        )}
      </section>
    );
  }

  if (!showForm) return null;

  return (
    <section ref={sectionRef} className="rounded-2xl bg-indigo-50 px-4 py-4 ring-1 ring-indigo-100">
      <h3 className="text-sm font-semibold text-foreground">
        {editing ? "Edit your reflection" : `Quick reflection on the chat with ${leadName}?`}
      </h3>
      <p className="mt-0.5 text-xs text-secondary-label">
        Thirty seconds while it&apos;s fresh. Optional, and only you and the PT Manager see it.
      </p>

      <div className="mt-3">
        <span className="text-xs font-semibold text-foreground">How did it go?</span>
        <Choice name={`feel-${leadId}`} options={REFLECTION_FEEL_LABELS} value={feel} onChange={setFeel} />
      </div>
      <div className="mt-3">
        <span className="text-xs font-semibold text-foreground">Where did it stall, if it did?</span>
        <Choice name={`stall-${leadId}`} options={REFLECTION_STALL_LABELS} value={stall} onChange={setStall} />
      </div>
      <div className="mt-3">
        <span className="text-xs font-semibold text-foreground">Which certainty was missing?</span>
        <Choice name={`cert-${leadId}`} options={REFLECTION_CERTAINTY_LABELS} value={certainty} onChange={setCertainty} />
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-foreground">What would you do differently next time?</span>
        </div>
        <textarea
          value={nextTime}
          onChange={(e) => setNextTime(e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="Type it, or tap the microphone on your keyboard and talk it through."
          className="mt-1.5 w-full rounded-xl border-none bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-foreground"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending || !feel}
          onClick={() => {
            runAction(async () => {
              const result = await savePostChatReflection(leadId, {
                feel: feel as string,
                stalledAt: stall,
                missingCertainty: certainty,
                nextTime,
              });
              if (result.ok) {
                setEditing(false);
                setJustSaved(true);
              }
              return result;
            });
          }}
          className="press rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
        >
          {isPending ? "Saving..." : "Save reflection"}
        </button>
        {editing ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setEditing(false)}
            className="press rounded-full bg-surface px-4 py-2 text-xs font-semibold text-foreground ring-1 ring-black/10 disabled:opacity-50"
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => runAction(() => skipPostChatReflection(leadId))}
            className="press rounded-full bg-surface px-4 py-2 text-xs font-semibold text-foreground ring-1 ring-black/10 disabled:opacity-50"
          >
            Skip
          </button>
        )}
      </div>
      {!feel && <p className="mt-2 text-xs text-secondary-label">Pick how it went to save.</p>}
    </section>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-secondary-label">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}
