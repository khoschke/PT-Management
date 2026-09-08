"use client";

import { useState } from "react";
import type { Trainer } from "@/lib/types";
import { focusRingWithin } from "./ui";

// AM/PM availability chips, shared by the manager's roster editor and a
// trainer's own profile screen so the two can't drift apart.
//
// The chips track their own state so the caller can warn about the pause
// BEFORE it's saved. Unticking both is a real setting ("not taking new
// leads"), not an error, but it's the one change here with a consequence you
// can't see afterwards — so it's worth saying out loud at the moment it's
// about to happen. `pauseWarning` is the caller's wording for that.
export default function AvailabilityPicker({
  defaults,
  pauseWarning,
}: {
  defaults?: Trainer;
  pauseWarning?: string;
}) {
  const [slots, setSlots] = useState({
    available_am: defaults ? defaults.available_am : true,
    available_pm: defaults ? defaults.available_pm : true,
  });

  const pausing = !slots.available_am && !slots.available_pm;

  return (
    <>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {(
          [
            { name: "available_am", label: "Morning" },
            { name: "available_pm", label: "Evening" },
          ] as const
        ).map((slot) => (
          <label
            key={slot.name}
            className={`press cursor-pointer rounded-full bg-fill px-3 py-1.5 text-xs font-medium text-foreground transition has-[:checked]:bg-foreground has-[:checked]:text-white ${focusRingWithin}`}
          >
            <input
              type="checkbox"
              name={slot.name}
              checked={slots[slot.name]}
              onChange={(e) => setSlots((prev) => ({ ...prev, [slot.name]: e.target.checked }))}
              className="sr-only"
            />
            {slot.label}
          </label>
        ))}
      </div>
      {pauseWarning && pausing && (
        <p className="mt-2 rounded-xl bg-fill px-3 py-2 text-xs font-medium text-foreground" role="status">
          {pauseWarning}
        </p>
      )}
    </>
  );
}
