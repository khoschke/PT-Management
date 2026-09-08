# Handoff: Staff Development Pathway + Portal Access

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

> **All five phases are BUILT (8 September 2026).** The decisions below were
> settled with Karl in the scoping session and the build followed them.
>
> **Nothing works on live until two migrations are applied by hand**, in order:
>
> 1. `0013_staff_role.sql` — run it whole.
> 2. `0014_development_goals.sql` — run it whole.
>
> An earlier version of this note said `0013` needed a two-part run. It does
> not; see the file's own header for why the enum rule does not apply to it.
>
> The `staff` value does not exist on the `app_role` enum until 0013 runs, so
> adding a staff member fails until then. The Add staff form detects
> that specific failure and names the migration rather than showing a generic
> error. Confirm with `supabase/reconcile/01_audit_live_schema.sql` afterwards,
> and believe its output rather than this note.

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
5. **Staff set their own goals and the manager cannot edit them.** Both write
   freely in a conversation beneath each goal. See Phase 5.
6. **Staff appear on the compliance screen.** They operate as PTs and need the
   same certs and insurances, so the manager's compliance overview covers them
   too. Their own view of their documents lives in the development section.
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
0013 rewrites all three to check the role explicitly.**

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
- `/admin/compliance` (`compliance/page.tsx`) selects all rows. **Keep staff
  in**, tagged so the manager can see at a glance which people are on the
  development pathway. Staff operate as PTs and carry the same certs,
  insurances and first aid, so leaving them off the compliance overview would
  put a hole in the one screen that answers "is everyone legally clear to train
  clients". The expiry cron already covers them: `document-expiry/route.ts`
  iterates `trainer_documents` and never filters on `trainers.active`, so staff
  reminders fire with no change.
- `/admin` lead board already filters `active = true`. Safe, no change.
- `/pt-session` is protected by the anon RLS grant. Safe, no change.

## Build plan

### Phase 1: migration `0013_staff_role.sql`

**BUILT.** `supabase/migrations/0013_staff_role.sql`. Not yet applied to live.
Runs in one part, not two: see its header.

**Runs whole, in one go.** The plan originally called for a two-part run by
analogy with `0009`, on the grounds that `alter type ... add value` cannot be
used in the same transaction that adds it. That rule is real but does not apply
here: nothing after the `alter type` references the new `'staff'` value, so the
file commits in a single transaction. Confirmed by executing it.

- `alter type app_role add value 'staff';`
- then:
  - `my_role()` security-definer helper returning `app_role`.
  - Drop and recreate `leads_select_trainer`, `leads_update_trainer` and
    `status_history_select_trainer` with `my_role() = 'trainer'` in place of
    `not is_manager()`. Keep every other condition byte for byte, including the
    `deleted_at is null` guard that `0009` added to the history policy.

No table changes. That is the whole migration.

Then run `supabase/reconcile/01_audit_live_schema.sql` and believe its output,
not the file listing.

### Phase 2: login, access control and the workbook

**BUILT.**

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

**BUILT.** `/admin/development` and `/admin/development/[trainerId]`.

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

**BUILT.** `promoteStaffToTrainer` in `staff/actions.ts`.

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

**BUILT.** `supabase/migrations/0014_development_goals.sql`, plus the goals
and conversation UI. Not yet applied to live.

Everything above ships without this. Put it in its own migration **`0014`** so
Phases 1 to 4 are not held hostage to it.

**The design principle, which drives the schema:** a goal belongs to the person
who set it. The manager guides and critiques, but **never edits the staff
member's goal text**. A coach who rewrites your goal has taken it off you. So
both parties write freely, but never into the same field: the goal is the staff
member's, the conversation underneath it is shared. That rule is enforced in
RLS, not just in the UI.

#### Schema

```sql
create type development_goal_status as enum ('active', 'achieved', 'parked');

create table development_goals (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers (id) on delete cascade,
  title text not null,
  detail text not null default '',
  status development_goal_status not null default 'active',
  target_date date,                      -- optional, deliberately
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  achieved_at timestamptz
);

-- One table serves both conversations. goal_id null means a check-in on the
-- person; goal_id set means a comment on that goal.
create table development_notes (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers (id) on delete cascade,
  goal_id uuid references development_goals (id) on delete cascade,
  body text not null,
  author_id uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);
```

Both key on `trainer_id`, like everything else, so they work for trainers as
well as staff at no extra cost.

#### RLS

- `development_goals` select: `trainer_id = my_trainer_id() or is_manager()`.
- `development_goals` insert, update and delete: **`trainer_id = my_trainer_id()`
  only.** The manager is deliberately locked out of writing. If a manager wants
  a goal changed, they say so in the conversation and the staff member changes
  it. That is the feature, not a limitation.
- `development_notes` select: `trainer_id = my_trainer_id() or is_manager()`.
- `development_notes` insert: `author_id = auth.uid()` and
  (`trainer_id = my_trainer_id() or is_manager()`).
- `development_notes` update and delete: `author_id = auth.uid()` only. Neither
  party can edit or delete the other's words. It is a coaching record.

#### Presentation

One `/admin/development` screen, three zones top to bottom:

1. **Workbook progress**, a strip showing the overall percentage with a link
   into `/onboarding`.
2. **Goals**, each a card with its conversation underneath.
3. **Documents**, reusing the `/admin/documents` components.

The manager opens the same screen for a given staff member. Identical layout,
except goal text is read-only for them and the composer under each goal is not.

#### Three rules the build must not quietly drop

These come from the behaviour-change framework the gym coaches with, applied to
its own staff. They are design decisions, not decoration.

- **Cap active goals at three.** A staff member doing a full shift, the
  workbook, and their certs is already pushing a loaded sled. A goals feature
  that invites a list of twelve adds load and gets abandoned. Wanting a fourth
  means parking or finishing one first, which is the useful conversation
  anyway.
- **Never show a goal as overdue, and never colour one red.** The three states
  are Active, Achieved and Parked. Parked is legitimate and carries no penalty.
  A goal that goes red teaches people to stop setting goals. Restart where you
  are, not where you stopped.
- **Never open on an empty box.** A blank "add a goal" field asks someone to
  beat inertia with a blank page. Seed the empty state with two or three
  prompts drawn from the workbook parts they have already worked through.

**Target dates are optional on purpose.** A date helps some goals and quietly
harms others.

#### The part that actually makes this work

On the manager's development list, show **when each person was last checked in
on**. That single column is the highest-value thing in Phase 5, because a
development pathway does not fail when staff stop writing goals. It fails when
nobody responds to them. The accountability loop needs to point at the manager,
not only at the staff member.

## What was actually built

Files added:

- `supabase/migrations/0013_staff_role.sql` — the enum value, `my_role()`, and
  the three rewritten policies. **Two parts, not yet run on live.**
- `supabase/migrations/0014_development_goals.sql` — `development_goals` and
  `development_notes` with the ownership RLS. One part, not yet run on live.
- `src/lib/development.ts` — `MAX_ACTIVE_GOALS`, the status labels and classes,
  and the empty-state prompts.
- `src/app/admin/(dashboard)/development/actions.ts`, `state.ts` and
  `components/DevelopmentProfile.tsx`.
- `src/lib/staff.ts` — `getStaffTrainerIds`, `listStaff`, `workbookPercent`.
  This is where "who is staff" is answered, from `profiles.role` alone.
- `src/app/admin/(dashboard)/development/page.tsx` and `[trainerId]/page.tsx`.

Files changed:

- `src/lib/types.ts` — `AppRole` gains `"staff"`.
- `src/lib/auth.ts` — `worksThroughWorkbook()`, the app-side counterpart to the
  RLS fix. Use it instead of comparing to `"trainer"`.
- `src/app/onboarding/page.tsx`, `[part]/page.tsx`, `actions.ts` — staff get the
  progress-saving workbook. The `isTrainer` flag on both pages was renamed
  `savesProgress`, because a variable named for one role is exactly how staff
  got locked out in the first place.
- `src/app/admin/(dashboard)/layout.tsx` — nav per role, plus a Development link
  for managers.
- `src/app/admin/(dashboard)/page.tsx` — staff are redirected off the lead board.
- `staff/actions.ts` — `addStaffLogin`, `promoteStaffToTrainer`.
- `staff/page.tsx`, `staff/components/StaffManager.tsx` — the staff role, the
  add form and the promote button.
- `trainers/page.tsx` — staff filtered out of the PT roster.
- `compliance/page.tsx` — staff kept in, tagged "Development".

`/admin/development` serves two screens off one route: a manager gets the list
of everyone on the pathway, anyone else gets their own profile. **Trainers get
it too**, not only staff. A promoted staff member keeps every goal and note
they wrote, and would otherwise lose sight of all of it the day they were
promoted. That is why "My development" is in the nav for both roles.

The three rules from the design survived into the build and are worth not
undoing:

- The cap of three active goals lives in `MAX_ACTIVE_GOALS` and is enforced in
  the server action, including on re-activating a parked goal, so parking and
  un-parking cannot be used to sidestep it. It is a coaching guardrail, not a
  permission, which is why it is not a database trigger.
- There is no red and no "overdue" anywhere. Active, Achieved, Parked.
- The empty state offers prompts, drawn from the workbook parts the person has
  actually worked through, falling back to three general ones.

The manager's list shows **when they last wrote to each person**, which is the
number the screen was built around.

## What has actually been executed

`npm run build`, `npx tsc --noEmit` and `npm run lint` all clean.

**The schema and every RLS policy were run, not reasoned about.** Postgres 16
is installed in the build workspace (see the gotcha in `PROJECT_STATUS.md`), so
the whole chain `0001` to `0014` was applied to a throwaway local cluster and
the policies exercised as real signed-in users via `set role authenticated` and
`request.jwt.claim.sub`. Confirmed there:

| What | Result |
|---|---|
| Full chain `0001`-`0014` from scratch, each file one transaction | applies clean |
| `0013` run whole rather than in two parts | succeeds (the two-part instruction was wrong) |
| Staff member with a lead allocated to their trainer row | sees **0 leads** |
| Same, with the policy reverted to `not is_manager()` | **sees the lead** — the hole was real |
| Trainer sees their own leads | 1, the right one |
| Staff saves a workbook answer and a part status | both save |
| Staff uploads a document | saves, lands as `pending` |
| Staff uploads into someone else's folder | refused by RLS |
| Manager reads staff answers and documents | both visible |
| Staff sets their own goal | saves |
| Manager `UPDATE` on that goal | **0 rows changed** |
| Manager posts a note | saves |
| Note filed against another person's goal | refused by the composite FK |
| Promotion: flip `role` and `active` | goals, notes and answers all survive; leads become visible |
| Audit query | runs, 42 rows |
| Audit's `manager cannot write development_goals` row | flips to MISSING when a manager write policy is added, back on removal |

That last row matters: it means the assertion is a real check rather than one
that always passes.

**Still not verified: the app itself against a real Supabase project.** The
build workspace cannot reach one, and cannot reach the Vercel preview either
(the proxy returns 403), so a green Vercel status proves the app built and
deployed and nothing more. The server actions in particular are unexercised,
including the three-goal cap, which lives in `addGoal` rather than in the
database. Walk it through in a browser once the migrations are applied.

## Coaching notes are gated for staff

Manager view reveals two things the workbook otherwise hides: the coaching
notes (`managerNote`) and the worked examples (`workedExample`). Managers use
them to run a 1:1, and **trainers keep the access they have always had**.
**Staff do not get either.** They are meant to work the questions, and a model
answer one click away is a different exercise.

Two halves, and only one of them matters:

- `canSeeCoachingNotes()` in `src/lib/auth.ts` hides the PT/Manager toggle in
  `onboarding/layout.tsx`. This is the visible half and, on its own, is
  cosmetic.
- **`onboarding/[part]/page.tsx` withholds the text itself.** `ManagerNote` and
  `WorkedExample` take their content as props, so anything passed to them
  reaches the browser in the RSC payload whether the component renders it or
  not. Hiding the toggle alone would leave the notes one devtools poke away.
  The page now passes `undefined` for both when the viewer is staff.

Verified against the build output: `src/lib/onboarding/content.ts` compiles
into the server bundle only. The two client components that touch the
onboarding lib (`PartsNav`, `PartStatusControl`) use `import type`, which is
erased, so the workbook never lands in a client chunk. That means the
server-side withholding is the whole gate rather than one layer of it.

`canSeeCoachingNotes()` is written as an allow list (`manager` or `trainer`)
rather than a deny list (`!== "staff"`). A role added later sees nothing until
somebody decides it should, which is the safe direction to fail in and the
opposite of the `not is_manager()` mistake this codebase already made once.

## Still open

Nothing blocking. One thing to watch:

- Staff carry full PT compliance (certs, insurance, first aid) because they
  operate as PTs, but they do **not** get the lead board. That is deliberate:
  restricted system access is the point, and taking allocated leads is what
  promotion is for. If that stops being true in practice, revisit it as a
  decision rather than letting a workaround grow.

## Constraints and house rules

- Migrations: this work took `0013` and `0014`. `0007`/`0008` stay reserved
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
they have got. They set their own development goals, the manager
guides and critiques them in a conversation without ever editing them, and
their compliance sits alongside every other PT's. When they are ready, one
manager action promotes them to trainer and every answer, document, goal and
conversation they have accumulated comes with them.
