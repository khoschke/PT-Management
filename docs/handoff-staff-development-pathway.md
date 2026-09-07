# Handoff: Staff Development Pathway + Portal Access

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

> **Scoping is DONE (7 September 2026).** The decisions below were settled with
> Karl in the scoping session. This is now a build brief. The one item still
> genuinely open is flagged under "Still open" and only blocks Phase 5.

## The idea

Give gym **staff** (front desk, group fitness, juniors, people who are not yet
PTs) a development profile inside the portal, starting with access to the PT
onboarding workbook at `/onboarding`, as a growth pathway toward becoming a
trainer. Plus the **staff to trainer upgrade** that turns a developed staff
member into a full PT with their own leads.

## Decisions made

1. **Staff are modelled as an inactive `trainers` row plus a new `staff` value
   on the `app_role` enum.** A staff member gets a `trainers` row with
   `active = false` and a `profiles` row with `role = 'staff'` pointing at it.
2. **Staff see the full 10-part workbook from day one.** No gating, no
   per-person unlock state.
3. **v1 is the workbook, manager progress visibility, the promotion action,
   staff document uploads, and development goals plus check-in notes.** The
   last of those is Phase 5 and is the only part that is droppable.
4. **The manager creates the login** with a starting password, exactly as
   `addTrainerLogin` does today. No invite email, so this build takes no
   dependency on Supabase auth email, which is still unconfirmed end to end.

## Why the inactive-trainer-row model wins

This was the central decision and it is worth recording why, because it looks
odd on first reading (a front desk person as a row in `trainers`) and someone
will be tempted to "fix" it later.

Everything staff need is already keyed on `trainer_id`, not on role:

- `onboarding_responses` and `onboarding_part_status` key on `trainer_id`, and
  their RLS is `trainer_id = my_trainer_id() or is_manager()`
  (`0002_onboarding.sql`). Staff progress saves with **no schema change**.
- `trainer_documents` and the three `storage.objects` policies key on
  `my_trainer_id()` (`0006_trainer_documents.sql`). Staff document uploads work
  with **no new RLS at all**.
- The `trainer_role_needs_trainer_id` check constraint on `profiles` reads
  `role = 'manager' or trainer_id is not null`. Staff carry a `trainer_id`, so
  it passes **unchanged**.
- `trainers_select_active` grants `anon` only `active = true` rows, so staff are
  invisible to the public form's trainer picker for free.
- **Promotion becomes two writes**: `profiles.role = 'trainer'` and
  `trainers.active = true`. Every workbook answer, part status and uploaded
  document carries over automatically, because it was never keyed on the role in
  the first place.

The alternative (keying staff progress on `profiles.id`) needs a second nullable
owner column on both onboarding tables, an xor constraint, a rewrite of every
progress query and every onboarding RLS policy, and a row migration at promotion
time. Roughly three times the build for a cleaner-looking table.

## Why it costs, and what must not be skipped

**Three RLS policies use `not is_manager()` as a stand-in for "is a trainer".**
That idiom is only correct while there are exactly two roles. Adding `staff`
silently makes it wrong:

| Policy | File | Problem once `staff` exists |
|---|---|---|
| `leads_select_trainer` | `0001_init.sql` | A staff member matches `not is_manager()`, and `my_trainer_id()` returns their real row id |
| `leads_update_trainer` | `0001_init.sql` | Same |
| `status_history_select_trainer` | `0009_public_access_hardening.sql` (rewritten there) | Same |

Nothing leaks on day one, because a lead is only ever allocated from the
dashboard's trainer list, which filters `active = true`, and staff rows are
inactive. That is a UI filter standing in for a database guarantee, which is
exactly the kind of thing this project has been burned by before. **Migration
0010 rewrites all three to check the role explicitly.**

Add a `my_role()` security-definer helper next to `is_manager()` and
`my_trainer_id()`, and use `my_role() = 'trainer'` in those three policies.

The onboarding and documents policies are **deliberately left alone**. Staff
matching `trainer_id = my_trainer_id()` there is the feature, not a bug.

## How a screen tells staff from trainers

`profiles.role` is the single source of truth. **Do not add an `is_staff` flag
to `trainers`**, because a flag and a role can drift, and this repo has already
lost days to a status field that disagreed with reality.

`active = false` alone is not enough to identify staff: a PT who has left is
also inactive. The distinguishing fact is that **staff always have a login**
(portal access is the entire point of the feature), whereas a trainers row may
exist with no profile at all, which is how the roster works today. So:

> A trainers row is a staff row if a `profiles` row points at it with
> `role = 'staff'`.

`profiles` has a foreign key to `trainers`, so PostgREST can embed it:
`trainers.select("*, profiles(role)")`. The screens that need this are all
manager-only or already use the service-role client, so the `profiles` RLS
(`id = auth.uid() or is_manager()`) does not get in the way.

Screens that list trainers and must now filter:

- `/admin/trainers` (`trainers/page.tsx`) selects all rows. **Exclude staff**,
  the roster is PTs.
- `/admin/staff` (`staff/page.tsx`) lists trainers for the `addTrainerLogin`
  dropdown. **Exclude staff**, they already have a login.
- `/admin/compliance` (`compliance/page.tsx`) selects all rows. **See "Still
  open" below.**
- `/admin` lead board already filters `active = true`. Safe, no change.
- `/pt-session` is protected by the anon RLS grant. Safe, no change.

## Build plan

### Phase 1: migration `0010_staff_role.sql`, in two parts

**This migration runs in two parts, PART A then PART B, the same way `0009`
did.** `alter type ... add value` cannot be used in the same transaction that
adds it, and the Supabase SQL editor wraps a run in a transaction. Put the
warning at the top of the file the way `0009` does.

- **PART A**, run alone and committed: `alter type app_role add value 'staff';`
- **PART B**:
  - `my_role()` security-definer helper returning `app_role`.
  - Drop and recreate `leads_select_trainer`, `leads_update_trainer` and
    `status_history_select_trainer` with `my_role() = 'trainer'` in place of
    `not is_manager()`. Keep every other condition byte for byte, including the
    `deleted_at is null` guard that `0009` added to the history policy.

No table changes. That is the whole migration.

Then run `supabase/reconcile/01_audit_live_schema.sql` and believe its output,
not the file listing.

### Phase 2: login, access control and the workbook

- `addStaffLogin` in `src/app/admin/(dashboard)/staff/actions.ts`, modelled on
  `addTrainerLogin`. It creates the `trainers` row (`active: false`) and the
  auth user, then the `profiles` row with `role: 'staff'`. Manager-check first,
  service-role client, same as its siblings. Note `trainers.gender` is
  `not null` with no default, so the form has to ask for it.
- `AppRole` in `src/lib/types.ts` gains `"staff"`.
- Dashboard nav in `src/app/admin/(dashboard)/layout.tsx`: staff get **PT
  onboarding, My documents, My development, Account**. No lead board, no
  Trainers, no Compliance, no Staff.
- `/admin` (`(dashboard)/page.tsx`) redirects `role === 'staff'` to
  `/onboarding`. The nav hiding a link is not access control.
- `src/app/onboarding/page.tsx` currently gates the working experience on
  `role === "trainer"`. Widen it so staff get the same progress-saving view, not
  the manager's read-only one. Pull the check into a helper rather than
  repeating `role === "trainer" || role === "staff"` in two files.
- `requireTrainerId()` in `src/app/onboarding/actions.ts` rejects anything that
  is not `role === "trainer"`. Widen it to accept `staff` with a `trainer_id`.

### Phase 3: manager sees staff progress

- A **Development** section, listing staff with their overall workbook
  percentage and document status. Put it on `/admin/staff` if it fits cleanly,
  otherwise its own `/admin/development` screen.
- Reuse `getTrainerOnboardingState`, `effectivePartStatus` and
  `partCompletionFraction` from `src/lib/onboarding/progress.ts`. The manager
  already has select rights on every row through the existing policies, so this
  is a read and a render, no new RLS.
- Drill in to one staff member's answers, read-only. The manager view on
  `/onboarding` already establishes the pattern.

### Phase 4: promotion

- `promoteStaffToTrainer(userId)` in `staff/actions.ts`, next to `makeManager`,
  which is the pattern to copy. Manager check, then set `profiles.role` to
  `'trainer'` and `trainers.active` to `true`.
- Refuse if the target is not currently `staff`.
- Confirm in the UI before firing, and say plainly what happens: they keep
  everything they have written, and they start receiving leads.
- Deliberately **not** reversible in one click. Demoting is rarer and messier
  (what happens to their allocated leads?), so leave it to a manager
  deactivating the trainer and changing the role by hand.

### Phase 5: development goals and check-ins (droppable)

Everything above ships without this. Put it in its own migration **`0011`** so
Phases 1 to 4 are not held hostage to it.

- `development_goals`: `trainer_id`, `title`, `detail`, `target_date`,
  `status`, `created_by`, timestamps.
- `development_checkins`: `trainer_id`, `note`, `author`, `occurred_at`.
- Both key on `trainer_id`, same as everything else, so they work for trainers
  as well as staff at no extra cost.
- RLS shape depends on the open question below.

## Still open

1. **Who writes development goals?** Manager sets them and staff mark progress,
   staff set their own and the manager comments, or both can write freely. This
   decides the RLS on `development_goals` and is the only thing blocking Phase
   5. Worth a coaching answer rather than a technical one: a goal someone sets
   for themselves and a goal set for them behave very differently.
2. **Do staff appear on `/admin/compliance`?** They can upload documents, so
   their certs have to be visible somewhere. Either fold them into the
   compliance screen tagged as staff, or show documents only inside the
   Development section. Compliance currently means "is this PT legally clear to
   train clients", which is not what a front desk person's first aid
   certificate means, so keeping them separate is probably right.

## Constraints and house rules

- Migrations: `0010` is next free, `0011` after it. `0007`/`0008` stay reserved
  for GymMaster. A migration in the folder is **not** proof it ran on live. A
  human applies it in the Supabase SQL editor, and
  `supabase/reconcile/01_audit_live_schema.sql` is how you confirm.
- `"use server"` files export only async functions. Form-state objects go in a
  sibling `state.ts`.
- Australian English, no em dashes in user-facing copy.
- Run `npm run build`, `npx tsc --noEmit` and `npm run lint` before pushing.
- No outbound network from the build workspace, so nothing here can be tested
  against live. Build, deploy, verify on the deployment.

## Definition of done

A staff member gets a portal login, signs in, works through the full PT
onboarding workbook with progress that saves and persists, uploads their own
documents, sees no lead board and no roster, and the manager can see how far
they have got. When they are ready, one manager action promotes them to trainer
and every answer and document they have accumulated comes with them.
