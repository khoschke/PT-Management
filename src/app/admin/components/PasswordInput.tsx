"use client";

import { useId, useState } from "react";

// A password field with a show/hide toggle, so staff and trainers can reveal
// what they're typing to check it, then hide it again. Spreads through the
// usual input props (name, required, minLength, autoComplete, ...) so it drops
// in wherever a plain password input was. The className styles the input itself;
// the toggle is positioned inside it, and the input reserves room on the right
// so text never runs under the button.
type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  className?: string;
};

export default function PasswordInput({ className = "", style, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const reactId = useId();
  const controlledId = props.id ?? reactId;

  return (
    <div className="relative">
      <input
        {...props}
        id={controlledId}
        type={visible ? "text" : "password"}
        className={className}
        style={{ paddingRight: "2.75rem", ...style }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={controlledId}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        className="press absolute inset-y-0 right-0 flex items-center pr-3.5 pl-2 text-secondary-label outline-none transition hover:text-foreground focus-visible:text-foreground"
      >
        {visible ? (
          // eye-off
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61" />
            <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
            <path d="M2 2l20 20" />
          </svg>
        ) : (
          // eye
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
