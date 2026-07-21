"use client";

import { useRef, useState, useTransition } from "react";
import { saveResponse } from "../actions";

export function ActivityField({
  partNumber,
  activityKey,
  prompt,
  placeholder,
  multiline,
  initialValue,
  readOnly,
}: {
  partNumber: number;
  activityKey: string;
  prompt: string;
  placeholder?: string;
  multiline?: boolean;
  initialValue: string;
  readOnly?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();
  const dirtyRef = useRef(false);

  function handleBlur() {
    if (!dirtyRef.current) return;
    dirtyRef.current = false;
    setStatus("saving");
    startTransition(async () => {
      const result = await saveResponse(partNumber, activityKey, value);
      setStatus(result.ok ? "saved" : "error");
      if (result.ok) {
        setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 1800);
      }
    });
  }

  const fieldStyle: React.CSSProperties = {
    background: "var(--ob-bg)",
    border: "1px solid var(--ob-border)",
    color: "var(--ob-text)",
  };

  if (readOnly) {
    return (
      <div className="mt-3">
        <p className="text-[14px] font-medium leading-relaxed">{prompt}</p>
        <div
          className="mt-2 rounded-xl px-3.5 py-2.5 text-[14px] italic"
          style={{ ...fieldStyle, color: "var(--ob-text-secondary)" }}
        >
          Sign in as this trainer to answer &mdash; each PT&rsquo;s answers are theirs alone.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <label className="text-[14px] font-medium leading-relaxed" htmlFor={`${partNumber}-${activityKey}`}>
        {prompt}
      </label>
      <div className="relative mt-2">
        {multiline ? (
          <textarea
            id={`${partNumber}-${activityKey}`}
            value={value}
            placeholder={placeholder ?? "Write your answer here…"}
            rows={3}
            onChange={(e) => {
              setValue(e.target.value);
              dirtyRef.current = true;
            }}
            onBlur={handleBlur}
            className="w-full resize-y rounded-xl px-3.5 py-2.5 text-[14px] leading-relaxed outline-none transition-shadow focus:shadow-[0_0_0_3px_var(--ob-accent-soft)]"
            style={fieldStyle}
          />
        ) : (
          <input
            id={`${partNumber}-${activityKey}`}
            value={value}
            placeholder={placeholder ?? "Your answer"}
            onChange={(e) => {
              setValue(e.target.value);
              dirtyRef.current = true;
            }}
            onBlur={handleBlur}
            className="w-full rounded-xl px-3.5 py-2.5 text-[14px] outline-none transition-shadow focus:shadow-[0_0_0_3px_var(--ob-accent-soft)]"
            style={fieldStyle}
          />
        )}
        <div className="mt-1 h-4 text-right text-[11px]" style={{ color: "var(--ob-text-secondary)" }}>
          {status === "saving" || isPending
            ? "Saving…"
            : status === "saved"
              ? "Saved"
              : status === "error"
                ? "Couldn't save — try again"
                : ""}
        </div>
      </div>
    </div>
  );
}
