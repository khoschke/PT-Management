# Handoff: Change Trainer Availability from AM/PM/Both to AM + PM

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

## The goal

Today a trainer's availability is a **single choice**: Morning (`AM`), Evening
(`PM`), or Both (`both`) — a Postgres enum `trainer_availability` defined in
`supabase/migrations/0001_init.sql` as `enum ('AM', 'PM', 'both')`.

Karl wants availability expressed as **AM and PM as independent options** rather
than a single "Both" bucket — i.e. a trainer can be available AM, PM, or both, by
selecting the slots that apply instead of picking a combined "both" value.

## Decide the approach first (this is the key call for the new thread)

**Option 1 — UI only, keep the DB as-is (lowest risk).**
Keep the enum `('AM','PM','both')`. Change only the Trainers form
(`TrainerFields.tsx`) from a single `<select>` to **two checkboxes (AM, PM)**.
On save, derive the stored value: both checked → `'both'`, one checked → that
value, none → validation error. Allocation logic and existing data are untouched.
- Pro: no migration, no data backfill, allocation code unchanged.
- Con: the data model still has the `'both'` concept under the hood.

**Option 2 — Model AM and PM as two booleans (cleaner data model).**
Replace the single enum column with `available_am boolean` and
`available_pm boolean` (or a `text[]`/set). This makes "AM and PM as independent
options" literal in the database.
- Pro: matches the mental model exactly; extensible later (e.g. specific hours).
- Con: a real migration + data backfill + touch every reader of `availability`.

**Recommendation:** if the motivation is purely the *UI* ("let me tick AM and/or
PM"), Option 1 delivers it with almost no risk. Only go to Option 2 if you
specifically want the stored data model to drop `'both'`. Confirm with Karl which
he means before building.

## Everywhere `availability` is used (ripple map)

Search: `grep -rn "availability" src/ supabase/`

- `supabase/migrations/0001_init.sql` — the enum + column default (`'both'`).
- `src/lib/types.ts` — the `Trainer` type's `availability` field.
- `src/app/admin/(dashboard)/trainers/components/TrainerFields.tsx` — the form
  control to change (select → checkboxes).
- `src/app/admin/(dashboard)/trainers/components/TrainerRoster.tsx` — how it's
  displayed in the roster.
- `src/app/admin/(dashboard)/trainers/actions.ts` — server-side validation/parse
  of the submitted value.
- `src/lib/allocation.ts` — **matching logic**: line ~58 does
  `trainer.availability === "both" || trainer.availability === lead.time_preference`.
  This is the important one to keep correct — the allocation suggestion uses
  availability to score trainers against the lead's `time_preference`.
- `supabase/seed.sql` and `supabase/seed_real_trainers.sql` — seed values.
- `src/lib/onboarding/parts/part2.ts`, `part4.ts` — check whether these reference
  trainer availability (they surfaced in the grep) and update if so.

## If you choose Option 2 (migration path)

1. New migration in `supabase/migrations/` (next number after `0003`) that adds
   the new columns, backfills from the old enum (`'both'` → both true; `'AM'` →
   am true, pm false; `'PM'` → pm true, am false), then drops the old column.
   Apply it in the Supabase SQL editor (can't run from the build workspace).
2. Update `types.ts`, the form, the roster display, the action validation, and
   the allocation logic to read the two booleans.
3. Update both seed files.
4. Rebuild allocation matching: "available in the lead's requested slot" becomes
   `lead.time_preference === 'AM' ? trainer.available_am : trainer.available_pm`
   (and either slot counts when the lead has no preference / `'either'`).

## Gotchas

- Whichever option, **keep allocation matching working** — that's the feature
  availability actually feeds. Re-verify a lead with an AM preference still
  suggests an AM-available trainer.
- Enum changes in Postgres are awkward to reverse; prefer adding new columns and
  dropping the old one over mutating the enum in place.
- Run `npm run build` + `npx tsc --noEmit` + `npm run lint`, then verify on a
  deployment (Supabase isn't reachable from the build workspace).

## Definition of done

A manager can set a trainer as AM, PM, or both via the chosen UI; existing
trainers keep their current availability; the roster shows it correctly; and
allocation still matches trainers to a lead's time preference.
