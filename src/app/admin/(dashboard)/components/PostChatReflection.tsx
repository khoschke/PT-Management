"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
// isn't asked again. The last question can be spoken instead of typed, using
// the phone's own speech recognition; only the text is saved, never audio.

type RunAction = (fn: () => Promise<{ ok: boolean; message?: string }>) => void;

// The browser's speech recognition, which TypeScript's DOM types don't cover.
interface SpeechResultEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type RecognitionCtor = new () => Recognition;

const noopSubscribe = () => () => {};

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

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
  const [listening, setListening] = useState(false);
  // False on the server, the real answer in the browser, so the first render
  // matches and the Speak button appears once hydrated.
  const speechSupported = useSyncExternalStore(
    noopSubscribe,
    () => !!getRecognition(),
    () => false,
  );
  const recRef = useRef<Recognition | null>(null);

  useEffect(() => () => recRef.current?.stop(), []);

  // Saved: show it (the trainer sees their own, the PT Manager sees everyone's).
  if (reflection) {
    if (reflection.skipped) {
      return null;
    }
    return (
      <section className="border-t border-black/5 pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">Post-chat reflection</h3>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Item label="How it went" value={reflection.feel ? REFLECTION_FEEL_LABELS[reflection.feel] : "Not recorded"} />
          <Item label="Where it stalled" value={reflection.stalled_at ? REFLECTION_STALL_LABELS[reflection.stalled_at] : "Not recorded"} />
          <Item
            label="Missing certainty"
            value={reflection.missing_certainty ? REFLECTION_CERTAINTY_LABELS[reflection.missing_certainty] : "Not recorded"}
          />
          <Item
            label="Saved"
            value={new Date(reflection.created_at).toLocaleDateString("en-AU", { timeZone: "Australia/Brisbane", day: "numeric", month: "short" })}
          />
        </dl>
        {reflection.next_time && (
          <div className="mt-3 rounded-2xl bg-fill px-4 py-3">
            <span className="text-xs font-semibold text-secondary-label">Next time</span>
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{reflection.next_time}</p>
          </div>
        )}
      </section>
    );
  }

  if (!canAnswer) return null;

  function toggleSpeech() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Ctor = getRecognition();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-AU";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let added = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) added += e.results[i][0].transcript;
      }
      if (added.trim()) setNextTime((t) => (t ? `${t.trimEnd()} ${added.trim()}` : added.trim()));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  return (
    <section className="rounded-2xl bg-indigo-50 px-4 py-4 ring-1 ring-indigo-100">
      <h3 className="text-sm font-semibold text-foreground">Quick reflection on the chat with {leadName}?</h3>
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
          {speechSupported && (
            <button
              type="button"
              onClick={toggleSpeech}
              aria-pressed={listening}
              className={`press flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                listening ? "bg-red-600 text-white" : "bg-surface text-foreground ring-1 ring-black/10"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
              </svg>
              {listening ? "Stop" : "Speak"}
            </button>
          )}
        </div>
        <textarea
          value={nextTime}
          onChange={(e) => setNextTime(e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder={speechSupported ? "Type, or tap Speak and talk it through." : "Type it, or use your keyboard's microphone to talk it through."}
          className="mt-1.5 w-full rounded-xl border-none bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-foreground"
        />
        {listening && <p className="mt-1 text-xs text-red-700">Listening. Tap Stop when you&apos;re done.</p>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending || !feel}
          onClick={() => {
            recRef.current?.stop();
            runAction(() =>
              savePostChatReflection(leadId, { feel: feel as string, stalledAt: stall, missingCertainty: certainty, nextTime }),
            );
          }}
          className="press rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
        >
          Save reflection
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => runAction(() => skipPostChatReflection(leadId))}
          className="press rounded-full bg-surface px-4 py-2 text-xs font-semibold text-foreground ring-1 ring-black/10 disabled:opacity-50"
        >
          Skip
        </button>
      </div>
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
