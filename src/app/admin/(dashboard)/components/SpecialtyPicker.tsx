import { TAG_GROUPS, optionsInGroup, type GoalCode } from "@/lib/goals";
import { focusRingWithin } from "./ui";

// The tag chips, in their three groups, shared by the manager's roster
// editor, a trainer's own profile screen and the two add-lead forms, so they
// can't drift apart. `name` is the form field the ticked codes post under.
//
// "Other" is deliberately left out. It's a bucket a member can tick on the
// public form when nothing else fits, not something a trainer specialises in.
export default function SpecialtyPicker({
  selected,
  name = "specialties",
}: {
  selected?: GoalCode[] | null;
  name?: string;
}) {
  return (
    <div className="mt-1.5 flex flex-col gap-2.5">
      {TAG_GROUPS.map(({ group, title }) => (
        <div key={group}>
          <p className="text-xs font-medium text-secondary-label">{title}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {optionsInGroup(group).map((goal) => (
              <label
                key={goal.code}
                className={`press cursor-pointer rounded-full bg-fill px-3 py-1.5 text-xs font-medium text-foreground transition has-[:checked]:bg-foreground has-[:checked]:text-white ${focusRingWithin}`}
              >
                <input
                  type="checkbox"
                  name={name}
                  value={goal.code}
                  defaultChecked={selected?.includes(goal.code)}
                  className="sr-only"
                />
                {goal.label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
