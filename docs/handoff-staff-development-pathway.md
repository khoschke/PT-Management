# Handoff (Scoping): Staff Development Profiles + Portal Access

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

> **This is a SCOPING note, not a build brief.** The idea is real but the feature
> set is not decided yet. The first job of the new session is to work through the
> decisions below *with Karl* and turn them into a concrete build plan. Do not
> start building until the "Decisions to make" section is answered.

## The idea

Give gym **staff** (front desk, group fitness, juniors — people who are not yet
PTs) a development profile inside the portal, starting with **access to the PT
onboarding workbook** at `/onboarding`, as a growth/aspiration pathway toward
becoming a trainer. This is the first half of the "staff development pathway into
the PT portal" item already listed in `docs/PROJECT_STATUS.md` under "Newly added,
not yet scoped".

It connects to a second, related idea Karl has raised: **a staff → trainer upgrade
path** (promote a developed staff member into a full trainer with their own leads).
Scope the profile first; the upgrade is the natural follow-on.

## What already exists (build on this, don't reinvent)

- **Roles live in `profiles`** with an `app_role` enum of exactly two values:
  `manager` and `trainer` (`supabase/migrations/0001_init.sql`). There is **no
  `staff` role today** — adding one is the central schema decision here.
- **Onboarding is keyed on `profile.trainer_id`.** `src/app/onboarding/page.tsx`
  calls `getTrainerOnboardingState(supabase, user?.profile?.trainer_id ?? null)`
  and only shows the working (progress-saving) experience when
  `role === "trainer"`. A manager sees a read-only "at a glance" view. So a `staff`
  role would need a deliberate decision about how its onboarding progress is
  stored, since staff have no `trainers` row and therefore no `trainer_id`.
- **Onboarding content** is in `src/lib/onboarding/content.ts`; progress logic in
  `src/lib/onboarding/progress.ts`; DB tables `onboarding_responses` /
  `onboarding_part_status` (migration `0002_onboarding.sql`) — check how these key
  their rows (by trainer_id?) before deciding how staff progress is recorded.
- **Login creation** is at `/admin/staff` (manager only, service-role client) in
  `src/app/admin/(dashboard)/staff/actions.ts`: `addManager`, `addTrainerLogin`,
  `makeManager`, `changeStaffEmail`, `removeStaffAccess`. A staff pathway likely
  adds an `addStaffLogin` and, later, a `promoteStaffToTrainer` action here.
- **RLS** is role-driven throughout via `is_manager()` / `my_trainer_id()`. Any new
  role needs its policies thought through so staff see only what they should
  (probably: their own onboarding progress and nothing on the lead board).

## Decisions to make (answer these before building)

1. **How is a "staff" role modelled?** Options:
   - (a) Add `'staff'` to the `app_role` enum (cleanest, but touches RLS and the
     `trainer_role_needs_trainer_id` check constraint, and enum changes are a
     migration).
   - (b) Keep two roles and represent staff some other way (a flag/table). Usually
     worse; note why if chosen.
2. **What can staff see?** Minimum is the onboarding workbook. Explicitly: can they
   see the lead board? (Almost certainly **no**.) Trainers list? Their own profile?
   Decide the nav items and the RLS for each.
3. **How is staff onboarding progress stored** given no `trainer_id`? (e.g. key
   progress on `profile.id` / auth user id for staff, or introduce a nullable
   `staff` participant id.) This drives the schema change in `0002`'s tables.
4. **What else beyond onboarding?** Karl flagged he wants to "map out what other
   features I may or may not want." Candidates to discuss: a personal development
   plan / goals, document uploads (reuse the `trainer_documents` compliance
   pattern from `0006`?), progress visible to the manager, check-in scheduling,
   certifications tracking. Pick a v1 scope deliberately; park the rest.
5. **The upgrade path (staff → trainer).** When a staff member is promoted: create
   their `trainers` row, flip the role, carry over (or reset) onboarding progress,
   and start them receiving leads. Decide whether this is in v1 or a follow-on.
   Note: an existing `makeManager` action already shows the promote pattern.

## Suggested shape of a v1 (starting point for the conversation, not a decision)

- Add a `staff` role; staff get a login via a new `/admin/staff` action.
- Staff nav = onboarding workbook + their own account only; no lead board.
- Staff onboarding progress keyed on their auth user id.
- Manager can see each staff member's onboarding progress.
- Promotion to trainer is a **follow-on** note, not v1.

Confirm or change all of that with Karl, then write the real build plan.

## Constraints / house rules

- Migrations: next free number is **0010** (0007/0008 are reserved for GymMaster;
  see `PROJECT_STATUS.md`). A migration in the folder is **not** proof it ran on
  live — a human applies it in the Supabase SQL editor, and `PROJECT_STATUS.md`'s
  audit query is how you confirm.
- `"use server"` files export only async functions; form-state objects in sibling
  `state.ts`.
- Australian English, no em dashes in user-facing copy.
- Run `npm run build` + `npx tsc --noEmit` + `npm run lint` before pushing.
- Can't be tested against live from the build workspace (no Supabase network) —
  verify on a deployment.

## Definition of done (v1, once scope is agreed)

A gym staff member gets a portal login, signs in, works through the PT onboarding
workbook with progress that saves and persists, sees only what staff should see,
and the manager can view their progress — with a documented, agreed plan for the
staff → trainer upgrade as the next step.
