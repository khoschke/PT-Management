import { GOAL_OPTIONS } from "@/lib/goals";
import type { Trainer } from "@/lib/types";
import { focusRingWithin } from "../../components/ui";

const inputClass =
  "mt-1.5 w-full rounded-xl border-none bg-fill px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-foreground";

export default function TrainerFields({
  defaults,
  fieldErrors,
}: {
  defaults?: Trainer;
  fieldErrors?: Record<string, string>;
}) {
  const errors = fieldErrors ?? {};

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-foreground">Name</label>
          <input name="name" type="text" required defaultValue={defaults?.name} className={inputClass} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground">Email</label>
          <input name="email" type="email" defaultValue={defaults?.email ?? ""} className={inputClass} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-foreground">Gender</label>
          <select name="gender" defaultValue={defaults?.gender ?? "male"} className={inputClass}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground">Availability</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {(
              [
                { name: "available_am", label: "Morning", checked: defaults ? defaults.available_am : true },
                { name: "available_pm", label: "Evening", checked: defaults ? defaults.available_pm : true },
              ] as const
            ).map((slot) => (
              <label
                key={slot.name}
                className={`press cursor-pointer rounded-full bg-fill px-3 py-1.5 text-xs font-medium text-foreground transition has-[:checked]:bg-foreground has-[:checked]:text-white ${focusRingWithin}`}
              >
                <input type="checkbox" name={slot.name} defaultChecked={slot.checked} className="sr-only" />
                {slot.label}
              </label>
            ))}
          </div>
          {errors.availability && <p className="mt-1 text-xs text-red-600">{errors.availability}</p>}
        </div>
      </div>

      <div className="mt-3">
        <label className="text-sm font-semibold text-foreground">Specialties</label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {GOAL_OPTIONS.filter((g) => g.code !== "other").map((goal) => (
            <label
              key={goal.code}
              className={`press cursor-pointer rounded-full bg-fill px-3 py-1.5 text-xs font-medium text-foreground transition has-[:checked]:bg-foreground has-[:checked]:text-white ${focusRingWithin}`}
            >
              <input
                type="checkbox"
                name="specialties"
                value={goal.code}
                defaultChecked={defaults?.specialties?.includes(goal.code)}
                className="sr-only"
              />
              {goal.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <label className="text-sm font-semibold text-foreground">More about this trainer</label>
        <p className="mt-0.5 text-xs text-secondary-label">
          Free text for anything the tags above don&rsquo;t cover, e.g. boxing, kettlebells, pre/post-natal, rehab,
          certifications, coaching style.
        </p>
        <textarea
          name="bio"
          rows={3}
          defaultValue={defaults?.bio ?? ""}
          maxLength={1000}
          className={`${inputClass} resize-y`}
        />
      </div>
    </>
  );
}
