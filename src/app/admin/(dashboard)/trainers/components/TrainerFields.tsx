import { GOAL_OPTIONS } from "@/lib/goals";
import type { Trainer } from "@/lib/types";

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
          <label className="text-sm font-semibold text-neutral-900">Name</label>
          <input
            name="name"
            type="text"
            required
            defaultValue={defaults?.name}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold text-neutral-900">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={defaults?.email ?? ""}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-neutral-900">Gender</label>
          <select
            name="gender"
            defaultValue={defaults?.gender ?? "male"}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-neutral-900">Availability</label>
          <select
            name="availability"
            defaultValue={defaults?.availability ?? "both"}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="AM">Morning</option>
            <option value="PM">Evening</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label className="text-sm font-semibold text-neutral-900">Specialties</label>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          {GOAL_OPTIONS.filter((g) => g.code !== "other").map((goal) => (
            <label key={goal.code} className="flex items-center gap-1.5 text-xs text-neutral-700">
              <input
                type="checkbox"
                name="specialties"
                value={goal.code}
                defaultChecked={defaults?.specialties?.includes(goal.code)}
                className="accent-neutral-900"
              />
              {goal.label}
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
