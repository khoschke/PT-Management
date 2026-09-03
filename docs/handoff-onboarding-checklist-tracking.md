# Handoff (Scoping): PT Onboarding Checklist — tracked per trainer

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

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
   `src/lib/onboarding/content.ts`, progress in `onboarding_responses` /
   `onboarding_part_status`). This is about developing the trainer.
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

## Decisions to make (answer these before building)

1. **Who ticks each item?** Most are manager/admin actions (bond, business pack,
   Xero details, Ezidebit). A few could be trainer-facing (upload certs, confirm
   profile pics). Decide, per item, whether it is **manager-only**, **trainer can
   tick**, or **auto-derived** from another feature. Simplest v1: manager ticks
   everything; trainer has read-only visibility.
2. **What does the trainer see?** Read-only view of their own checklist and
   progress, or can they action some items? (Ties to RLS.)
3. **Is the item list fixed or editable?** A fixed seeded list is simplest.
   Editable-by-manager (add/remove/reorder) is more work — decide if v1 needs it.
   (The compliance `document_types` table is a precedent for an editable list.)
4. **Rent ramp — how much to model?** Options: (a) just store it as reference/notes
   per trainer; (b) model week/date/percentage/amount rows with an editable
   "amendments" column. Confirm the week-13+ percentage (100%?) and whether amounts
   are entered manually or computed from a full-rent figure on the trainer.
5. **Where does it live in the UI?** A tab on each trainer's detail view, a column
   on `/admin/trainers`, or a dedicated `/admin/onboarding-checklist` screen with a
   per-trainer picker. Recommend surfacing from the trainer record.
6. **Completion signal.** Should a fully-ticked checklist flip something visible
   (a badge on the roster, a date stamp)? Nice-to-have; decide if v1.

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

## Constraints / house rules

- Next free migration number is **0010** (0007/0008 reserved for GymMaster). A
  migration in the folder is NOT proof it ran on live — a human applies it in the
  Supabase SQL editor, and `PROJECT_STATUS.md`'s audit query confirms.
- New role/policy work must respect existing RLS (`is_manager()` / `my_trainer_id()`).
- `"use server"` files export only async functions; form-state in sibling `state.ts`.
- Australian English, no em dashes in user-facing copy.
- Run `npm run build` + `npx tsc --noEmit` + `npm run lint` before pushing.
- Can't be tested against live from the build workspace (no Supabase network) —
  verify on a deployment.

## Definition of done (v1, once scope is agreed)

For a given trainer, the manager can work through the setup checklist in the portal
with each tick recorded (who/when), the trainer can see their own checklist status,
and the checklist is clearly separate from the educational onboarding workbook.
