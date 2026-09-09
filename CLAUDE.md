# Working in this repo

Read `docs/PROJECT_STATUS.md` for where the project is up to. This file is the
short list of things that are easy to get wrong here.

## The figure rule

**This is the rule that matters most in this repo. It has already been broken
once.**

Trainers here are self-employed and set their own pricing. Anything presented
as an option, price or model is an example of what has worked for other
trainers, not a requirement and not Fitaz Gym policy. Where something genuinely
is a requirement (insurance, certifications, the PT contract), say so and point
at the contract rather than restating its terms.

The settled rule, from ADDENDUM 3 of the Portal Update Spec. This wording
supersedes anything narrower elsewhere:

> A figure is safe when the reader can tell **whose number it is**. Any one of
> these is enough:
>
> 1. **Framed in words as an example.** "One example of what some trainers here
>    use is a split rate: $80 per 45-minute session..."
> 2. **Inside a worked example attributed to a named persona.** Taylor's revenue
>    walkthrough, her price rise.
> 3. **Inside a script with an attributed speaker.** Taylor saying it to a
>    client.
>
> It fails when a figure sits in body prose with none of these, because then it
> reads as *the* rate rather than *a* rate.
>
> Separately, and with no exceptions: **a list of standard commercial terms**
> (rent, bond, business pack, fees, minimum term, notice period, restraints)
> never appears in trainer-facing content, however it is framed. Point at the
> contract instead.

### Scope of the figure rule

From ADDENDUM 4 of the spec, verbatim:

> The figure rule governs figures that state **what a PT should charge their
> clients, or what Fitaz Gym charges the PT**. Those are the only numbers this
> workbook has no business setting, because the trainer is self-employed.
>
> Outside the rule:
>
> - statutory thresholds and caps (GST registration, concessional super cap)
> - suggested levels of insurance cover
> - third-party costs the trainer does not set (card processing fees)
> - magnitudes of change rather than prices (a $5-10 annual rate increase)
>
> Being outside the rule does NOT mean stating them bare. Each carries two
> obligations:
>
> **1. Say whose figure it is.** Insurance cover levels are a SUGGESTION, not a
> Fitaz Gym requirement, and must say so in plain words. Holding liability
> insurance IS a condition of training at the gym; what level of cover a
> trainer takes out is their decision and their insurer's advice. Never write
> "minimum cover $10M" as though the gym set it.
>
> **2. Date it and hand the check back to the reader.** Any figure that changes
> over time (tax, super, thresholds, statutory caps, market fees) carries a
> note in this shape:
>
> > These figures are current as at [month year]. Rates and thresholds change,
> > often each financial year. Check the current figure with the ATO or your
> > accountant before you rely on it. This workbook is general information, not
> > financial, tax or legal advice.
>
> A wrong number stated plainly is worse than a right number framed badly.
>
> The principle behind both: this workbook is a tool for trainers to use, not a
> document that can be used against Fitaz Gym later. Where it gives general
> information it says so. Where it gives a figure that will age it dates it and
> points at the authority. It never lets a suggestion read as a rule.

A scheduled task runs on **1 July each year** to check every ageing figure,
roll the "current as at" dates forward, and check for regulatory changes
affecting self-employed PTs. If you change an ageing figure outside that pass,
roll its date too.

### How to check it

Sweep for the **figure**, not for the sentence you already know about: `$80`,
`$20 a week`, `$275`. Four instances of the same fault were missed in the first
pass because it was swept by phrasing. Every hit then needs one of the three
framings above, or it comes out.

Sweep the ageing figures the same way, and separately, because they fail
differently: they go stale rather than reading as a rule. Currently `$75,000`
(GST), `$32,500` (super cap), `25-30%` and `5-10%` (tax and super set-asides),
`$10M` and `$5M` (cover levels), `1.7-2.9%` (card fees). Each needs a currency
note near it, in the same section a trainer would read it in.

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
- The no-exceptions half of the rule is about a *list of standard terms*, not
  about every number. An individual figure is governed by the three framings
  above: Taylor's revenue walkthrough uses $275 gym rent alongside a $1,500
  income target, and passes, because it reads as one trainer's arithmetic.

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
