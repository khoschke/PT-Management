import type { Trainer } from "@/lib/types";
import { focusRingWithin } from "./ui";

// AM/PM availability chips, shared by the manager's roster editor and a
// trainer's own profile screen so the two can't drift apart.
//
// A new trainer on the manager's add form defaults to both slots ticked.
export default function AvailabilityPicker({ defaults }: { defaults?: Trainer }) {
  const slots = [
    { name: "available_am", label: "Morning", checked: defaults ? defaults.available_am : true },
    { name: "available_pm", label: "Evening", checked: defaults ? defaults.available_pm : true },
  ];

  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {slots.map((slot) => (
        <label
          key={slot.name}
          className={`press cursor-pointer rounded-full bg-fill px-3 py-1.5 text-xs font-medium text-foreground transition has-[:checked]:bg-foreground has-[:checked]:text-white ${focusRingWithin}`}
        >
          <input type="checkbox" name={slot.name} defaultChecked={slot.checked} className="sr-only" />
          {slot.label}
        </label>
      ))}
    </div>
  );
}
