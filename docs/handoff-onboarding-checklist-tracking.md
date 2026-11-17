# Handoff (Scoping): PT Onboarding Checklist — tracked per trainer

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

> **BUILT, 14 October 2026.** This note is now history. The feature ships as
> **`/admin/setup`**, migration `0017_setup_checklist.sql`, applied to live and
> verified. The decisions below were all answered in
> `docs/handoff-onboarding-checklist-build-plan.md` and then built; read that
> for the reasoning and the roads not taken, and `PROJECT_STATUS.md` for the
> summary. Where any of them disagree with the code, the code is right.
>
> Two things in this note were wrong by the time it was built, both worth
> knowing about:
>
> - **"Next free migration number is 0016"** was true when written and wrong a
>   month later: `0016_stamp_first_contacted.sql` merged in between, so the
>   build is `0017`. Work the number out from disk and from every remote branch
>   rather than from a note.
> - The decisions below were settled in the plan, not here. The "Decisions to
>   make" section is kept as the record of what was open, with each answer
>   marked.

> **This is a SCOPING note, not a build brief.** Karl supplied the paper checklist
> (below) and wants it turned into something tracked inside the portal that the
> **manager** and each **trainer** interact with. Settle the decisions in
> "Decisions to make" with Karl before building.

## What Karl asked for

> "Link the PT onboarding checklist to interact with the manager's profile and the
> respective trainer profiles."

In other words: take the operational new-trainer setup checklist that currently
lives on paper / in a Word doc, and make it a live per-trainer checklist in the
portal — the **manager** works through and ticks off each new trainer's setup
items, and each **trainer** can see their own checklist and its status. Source
document: `PT_Onboarding_Checklist_.docx` (supplied 3 Sep 2026).

## ⚠️ This is NOT the existing onboarding workbook

There are now two distinct "onboarding" things — keep them separate:

1. **The educational workbook** at `/onboarding` (already built and live) — the
   10-part, 12-week *learning* journey a trainer works through (content in
   `src/lib/onboarding/parts/part1.ts` to `part10.ts`, progress in
   `onboarding_responses` / `onboarding_part_status`). This is about developing
   the trainer. *(Corrected 15 Sep 2026: this said `content.ts`, which is now
   only an index over the part files.)*
2. **This operational setup checklist** (new) — the *admin/compliance* steps to
   get a new trainer set up in the business: contract, bond, uniform, systems
   access, profiles, certs, rent ramp. This is about onboarding them into the
   business, mostly manager-driven.

Do not fold this into the workbook's tables. It is a separate feature, probably a
new screen (e.g. per-trainer, surfaced from `/admin/trainers` or a new
`/admin/onboarding-checklist`), with its own table(s).

## The checklist content (verbatim from the supplied document)

Header fields: **Name**, **Start Date**.

Tick-box items (in order):
- Signed Contract (all parties)
- Details sent to Fitaz Accounts for Xero set-up (full name; mobile number; email
  address; home address; ABN)
- Bond Paid (2 weeks rent, GST incl.)
- Business Pack Paid ($550 GST incl.)
- Uniform Ordered
- Flyers Ordered
- WhatsApp
- Gym Master Set Up
- Google Drive Set Up
- Profile
- Profile Pics
- Received Certs
- Rent Set Up - Ezidebit
- Fitaz Gym Website PT Profile
- Coaches Board profile ordered
- Welcome Announcement on social media platforms
- Fitaz email signature (if applicable)
- Completed Onboarding Program

**Rent ramp schedule** (a table: Week / Date / Rent % of full amount = amount due
($) / Amendments). The percentages ramp up over the first 12 weeks:

| Weeks | Rent % of full amount |
|---|---|
| 1 to 3 | 0% |
| 4 to 6 | 25% |
| 7 to 9 | 50% |
| 10 to 12 | 75% |
| 13+ | (100% — full rent; confirm with Karl) |

Plus a free-text **Notes** / **Amendments** area.

## How it connects to things already in the system

Several checklist items overlap existing or backlogged features — decide whether
this checklist *links to* them or just records a tick:
- **"Received Certs"** → the compliance documents feature already exists
  (`trainer_documents`, migration `0006`, `/admin/compliance` + `/admin/documents`).
  This item could deep-link there or reflect its state, rather than being a bare
  checkbox.
- **"Completed Onboarding Program"** → the educational workbook above. Could
  reflect that trainer's workbook completion % automatically.
- **"Rent Set Up - Ezidebit"** and the rent ramp → relate to the backlogged
  **Ezidebit read-only MCP** item in `PROJECT_STATUS.md`. Keep this manual for now;
  don't block on Ezidebit.
- **"Gym Master Set Up"** → relates to the GymMaster integration workstream, but
  here it's just a manual tick.
- **"Fitaz Gym Website PT Profile" / "Profile" / "Profile Pics"** → relate to the
  editable trainer pages backlog (`docs/handoff-trainer-portal.md`).

## Decisions already settled (Karl, 8 Sep 2026)

These came up during the workbook update pass and are answered. Do not re-open
them without asking.

- **v1 is manager-only.** The checklist is a tool for the PT Manager, in its own
  tab, to make sure each trainer has been properly onboarded. What it needs to
  become is an editable, tick-off form.
- **No trainer-facing view in v1.** This is a deliberate narrowing of the
  original scope below, not a correction of it. The original ask (and decision 2)
  scoped a read-only view for each trainer. Karl's position: a trainer view might
  make sense later, but nobody has asked for it, so it is out of scope now.
  Decide it properly in this thread rather than letting it arrive by default.
- **The checklist is not workbook content and never links from it.** A link to
  the checklist document was briefly added to Part 3 of the onboarding workbook
  during the September pass and removed again. There is nothing in it for a
  trainer to action. See the warning section above.

## Decisions to make (answer these before building)

1. **Who ticks each item?** Most are manager/admin actions (bond, business pack,
   Xero details, Ezidebit). A few could be trainer-facing (upload certs, confirm
   profile pics). Decide, per item, whether it is **manager-only**, **trainer can
   tick**, or **auto-derived** from another feature. Simplest v1: manager ticks
   everything; trainer has read-only visibility.
   **Settled:** manager ticks everything in v1.
2. **What does the trainer see?** Read-only view of their own checklist and
   progress, or can they action some items? (Ties to RLS.)
   **Settled:** nothing in v1. See "Decisions already settled" above.
3. **Is the item list fixed or editable?** A fixed seeded list is simplest.
   Editable-by-manager (add/remove/reorder) is more work — decide if v1 needs it.
   (The compliance `document_types` table is a precedent for an editable list.)
   **Settled: fixed, seeded in the migration.** `active` and `sort_order` are in
   the schema so a later migration or screen can change the list, and a
   per-item `not_applicable` state handles "does not apply to this person",
   which is what would otherwise drive someone to delete an item. No CRUD
   screen in v1.
4. **Rent ramp — how much to model?** Options: (a) just store it as reference/notes
   per trainer; (b) model week/date/percentage/amount rows with an editable
   "amendments" column. Confirm the week-13+ percentage (100%?) and whether amounts
   are entered manually or computed from a full-rent figure on the trainer.
   **Settled: neither. Computed, not stored, and no amounts at all.** The header
   holds `start_date` and a free-text `amendments`; the screen renders week
   ranges, dates and percentages from that date. There is no rent amount and no
   per-trainer rent figure anywhere in the schema, because that is a term of
   their contract. This also disposes of the week-13 question: the last row
   reads "Full rent" rather than a number, which is true and needs no
   confirmation.
5. **Where does it live in the UI?** A tab on each trainer's detail view, a column
   on `/admin/trainers`, or a dedicated `/admin/onboarding-checklist` screen with a
   per-trainer picker. Recommend surfacing from the trainer record.
   **Settled: its own manager-only tab at `/admin/setup`, with
   `/admin/setup/[trainerId]` per person.** Not `/admin/onboarding-checklist`:
   "onboarding" is already the workbook, twice over, and a second tab using
   that word is the confusion the warning at the top of this note is about.
6. **Completion signal.** Should a fully-ticked checklist flip something visible
   (a badge on the roster, a date stamp)? Nice-to-have; decide if v1.
   **Settled: a date stamp and a badge on the setup screens only.**
   `trainer_setup_checklists.completed_at` is stamped when every active item is
   done or N/A and cleared if one goes back, set by the server action rather
   than a trigger so the rule sits beside the code that renders it. No badge on
   the roster in v1.

   The list screen also shows **how long a checklist has been sitting**, which
   is the number the screen is really built around. A setup checklist does not
   fail by never being started; it fails by stalling at 14 of 18 for two
   months. Same lesson as the development screen's "you last wrote 6 weeks
   ago" column.

## Suggested shape of a v1 (a starting point, not a decision)

- A seeded `onboarding_checklist_items` template table (label + sort order +
  optional "who can tick" flag), and a `trainer_checklist_progress` table keyed on
  `(trainer_id, item_id)` recording done/at/by — mirroring the existing
  `onboarding_part_status` pattern.
- Manager ticks items on a per-trainer checklist view; each item stores who ticked
  it and when.
- Trainer gets a read-only view of their own checklist.
- Rent ramp stored as reference for v1 (per-trainer notes/amendments field), with
  the modelled table as a follow-on.
- "Received Certs" and "Completed Onboarding Program" link to / reflect the
  existing compliance and workbook features rather than being bare checkboxes.

Confirm or change all of that with Karl, then write the real build plan.

**What was actually built differs from that sketch in four ways**, all argued
in the build plan: the tables are `setup_*` rather than `onboarding_*`/
`trainer_checklist_progress`; there is no "who can tick" flag, which is dead
weight in a manager-only v1; item state is a three-value enum rather than
done/not-done; and the three overlapping items show live evidence beside the
tick but never tick themselves.

## Constraints / house rules

- Next free migration number is **0016** (0007/0008 reserved for GymMaster,
  0010 to 0014 taken by the trainer self-profile and staff pathway work, 0015
  by the PT Contract document type). A migration in the folder is NOT
  proof it ran on live — a human applies it in the Supabase SQL editor, and
  `PROJECT_STATUS.md`'s audit query confirms. Check it first with
  `./supabase/reconcile/local_migration_check.sh`.
- This checklist holds commercial terms (bond, Business Pack, rent ramp). That
  is fine while it is manager-only. If a trainer-facing view is ever added, read
  the "Never publish commercial terms into trainer-facing content" rule in
  `CLAUDE.md` first: a trainer's own figures are theirs to see, but the gym's
  standard terms are not workbook or portal material.
- New role/policy work must respect existing RLS (`is_manager()` / `my_trainer_id()`).
- `"use server"` files export only async functions; form-state in sibling `state.ts`.
- Australian English, no em dashes in user-facing copy.
- Run `npx tsc --noEmit` + `npx eslint src` + `npm run build` before pushing, per `CLAUDE.md`.
- Can't be tested against live from the build workspace (no Supabase network) —
  verify on a deployment.

## Definition of done (v1)

For a given trainer, the manager can work through the setup checklist in the portal
with each tick recorded (who/when), and the checklist is clearly separate from the
educational onboarding workbook.

**Corrected 15 Sep 2026.** This previously required that "the trainer can see
their own checklist status", contradicting the "Decisions already settled"
section above in this same file. v1 is manager-only and has no trainer-facing
view. The definition of done is the part somebody reads last and builds to, so
a stale one here is worse than a stale one anywhere else in the note.
