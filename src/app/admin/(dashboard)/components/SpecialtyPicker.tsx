import { GOAL_OPTIONS, type GoalCode } from "@/lib/goals";
import { focusRingWithin } from "./ui";

// The specialty tag chips, shared by the manager's roster editor and a
// trainer's own profile screen so the two can't drift apart.
//
// "Other" is deliberately left out. It's a bucket a member can tick on the
// public form when nothing else fits, not something a trainer specialises in.
export default function SpecialtyPicker({ selected }: { selected?: GoalCode[] | null }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {GOAL_OPTIONS.filter((goal) => goal.code !== "other").map((goal) => (
        <label
          key={goal.code}
          className={`press cursor-pointer rounded-full bg-fill px-3 py-1.5 text-xs font-medium text-foreground transition has-[:checked]:bg-foreground has-[:checked]:text-white ${focusRingWithin}`}
        >
          <input
            type="checkbox"
            name="specialties"
            value={goal.code}
            defaultChecked={selected?.includes(goal.code)}
            className="sr-only"
          />
          {goal.label}
        </label>
      ))}
    </div>
  );
}
