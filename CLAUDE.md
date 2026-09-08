# Working in this repo

Read `docs/PROJECT_STATUS.md` for where the project is up to. This file is the
short list of things that are easy to get wrong here.

## Never publish commercial terms into trainer-facing content

**This is the rule that matters most in this repo. It has already been broken
once.**

Never publish commercial terms, prices, rates, fees or contract clauses into
trainer-facing content. Trainers are self-employed and set their own pricing.
Anything presented as an option, price or model is an example of what has
worked for other trainers, not a requirement and not Fitaz Gym policy. Where
something genuinely is a requirement (insurance, certifications, the PT
contract), say so and point at the contract rather than restating its terms.

That covers rent, bond, the Business Pack, rent ramps, loyalty reductions,
minimum terms, notice periods and restraint of trade clauses, and it covers
session rates and package pricing.

### Why the rule exists

The first build of the onboarding workbook (July 2026) added a Part 9 section
called "Your Fitaz Gym commercial terms, at a glance", which summarised the
master PT contract for every trainer: weekly rent, the bond, the Business
Pack, the onboarding rent ramp, loyalty rent reductions, the 12-month minimum
term, the 90-day notice period, and a 6-month non-compete inside 5km of the
gym. None of that appears in the source workbook, which deliberately keeps
contract figures in the contract. It was removed in September 2026.

It happened because the session had the contract in reach and nothing told it
not to use it. The rule is written down here so that does not repeat.

### What "point at the contract" looks like in practice

- Link to `/admin/documents`, which serves each trainer only their own files
  under RLS, including their signed agreement. Never link the master contract
  template.
- A worked example may use a real number as an input (Taylor's revenue
  walkthrough uses $275 gym rent alongside a $1,500 income target), because
  that reads as one trainer's arithmetic, not as a rate card. Framing is the
  whole difference.

## The onboarding workbook content

Trainer-facing workbook content lives in `src/lib/onboarding/parts/part1.ts`
through `part10.ts`, typed by `src/lib/onboarding/types.ts`.

- It is **hand-authored**, not generated from the source `.docx` files in
  Karl's "00 Final Workbook" Drive folder. Do not try to regenerate it. Changes
  arrive as a written spec and are applied by hand.
- Every activity has a stable `key`, persisted as
  `onboarding_responses.activity_key`. Renaming or removing one orphans answers
  trainers have already saved.
- One content source feeds two views. `managerNote` and `workedExample` render
  only in Manager view; everything else is trainer-facing. If a change must
  reach trainers, it goes in `body`.

## Database migrations

`supabase/migrations/` is applied by hand in the Supabase SQL editor, so
numbering and order matter. `0005` is permanently unused, and `0007`/`0008`
are reserved by an unmerged GymMaster branch.

Before proposing a migration, run it:

```
./supabase/reconcile/local_migration_check.sh
```

It builds a throwaway Postgres, runs the whole chain in fresh-setup order, and
audits the result. Add an assertion for your migration to
`supabase/reconcile/01_audit_live_schema.sql` so it is checked like the rest.

## Checks before you push

```
npx tsc --noEmit
npx eslint src
npm run build
```
