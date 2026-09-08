-- Staff development pathway: a third role.
--
-- ---------------------------------------------------------------------------
-- What this adds
-- ---------------------------------------------------------------------------
-- A `staff` value on the `app_role` enum, for gym staff (front desk, group
-- fitness, juniors) working toward becoming a PT. A staff member gets a
-- `trainers` row with `active = false` and a `profiles` row with
-- `role = 'staff'` pointing at it.
--
-- Giving staff a `trainer_id` is deliberate, and it is why this migration
-- creates no tables:
--
--   * `onboarding_responses` / `onboarding_part_status` (0002) key on
--     `trainer_id` and their RLS reads `trainer_id = my_trainer_id()`, so
--     staff workbook progress saves with no schema change.
--   * `trainer_documents` and the three `storage.objects` policies (0006) key
--     on `my_trainer_id()`, so staff document uploads need no new policies.
--   * The `trainer_role_needs_trainer_id` constraint on `profiles` reads
--     `role = 'manager' or trainer_id is not null`. Staff carry a trainer_id,
--     so it passes unchanged.
--   * `trainers_select_active` grants anon only `active = true` rows, so staff
--     never appear in the public form's trainer picker.
--   * Promotion to trainer is two writes (`profiles.role`, `trainers.active`)
--     and every saved answer and uploaded document comes along, because none
--     of it was ever keyed on the role.
--
-- What it therefore has to fix is the one assumption a third role breaks.
--
-- ---------------------------------------------------------------------------
-- The `not is_manager()` problem
-- ---------------------------------------------------------------------------
-- Three policies use `not is_manager()` to mean "is a trainer". That is only
-- true while there are exactly two roles. Once `staff` exists, a staff member
-- satisfies `not is_manager()`, and `my_trainer_id()` returns their real row
-- id, so the policies would let them read and update any lead allocated to
-- that row.
--
-- Nothing leaks the day this runs, because leads are only ever allocated from
-- the dashboard's trainer list, which filters `active = true`, and staff rows
-- are inactive. That is a UI filter standing in for a database guarantee,
-- which is exactly the kind of gap this project has been bitten by before. So
-- the three policies are rewritten against an explicit role check.
--
-- The onboarding and documents policies are deliberately NOT touched. Staff
-- matching `trainer_id = my_trainer_id()` there is the feature.
--
-- ---------------------------------------------------------------------------
-- Run this file in one go.
-- ---------------------------------------------------------------------------
--
-- An earlier draft of this header told you to run it in two parts, on the
-- grounds that Postgres will not let a newly added enum value be USED in the
-- same transaction that ADDS it. That rule is real, but it does not apply
-- here, and the instruction was wrong.
--
-- The rule bites only when the NEW value is referenced. Nothing below
-- references 'staff'. The policies compare against 'trainer', which already
-- existed, and the my_role() function names the TYPE rather than any value.
-- So the whole file commits happily in a single transaction.
--
-- Verified by executing it: applied against a local Postgres 16 with the full
-- migration chain, as one transaction, and it succeeds. The same harness does
-- raise "unsafe use of new value" for a transaction that adds a value and then
-- selects it, so the check was capable of catching a genuine violation.
--
-- **If you extend this file, do not reference 'staff' below.** Doing so
-- reintroduces the two-part requirement for real. Put anything that needs the
-- new value in a later migration instead.

alter type app_role add value if not exists 'staff';

-- ---------------------------------------------------------------------------
-- 1. An explicit role lookup, to replace `not is_manager()`
-- ---------------------------------------------------------------------------
-- Sits alongside is_manager() and my_trainer_id() from 0001_init.sql and
-- follows the same shape: security definer, so it can read `profiles` without
-- recursing through that table's own RLS.
--
-- Returns null for a signed-in user with no profile row, which makes every
-- comparison below null, which denies. That is the wanted behaviour.

create or replace function my_role()
returns app_role
language sql
security definer
set search_path = public
stable
as $$
  select role from profiles where id = auth.uid();
$$;

comment on function my_role() is
  'The signed-in user''s role, for policies that need to distinguish trainer from staff. Prefer this over `not is_manager()`, which silently treats every non-manager as a trainer.';

-- ---------------------------------------------------------------------------
-- 2. leads: only an actual trainer reads or updates their allocated leads
-- ---------------------------------------------------------------------------
-- Every other condition is carried over byte for byte from 0001_init.sql.

drop policy leads_select_trainer on leads;

create policy leads_select_trainer on leads
  for select to authenticated
  using (
    my_role() = 'trainer'
    and allocated_trainer_id = my_trainer_id()
    and deleted_at is null
  );

drop policy leads_update_trainer on leads;

create policy leads_update_trainer on leads
  for update to authenticated
  using (
    my_role() = 'trainer'
    and allocated_trainer_id = my_trainer_id()
    and deleted_at is null
  )
  with check (
    my_role() = 'trainer'
    and allocated_trainer_id = my_trainer_id()
    and deleted_at is null
  );

-- ---------------------------------------------------------------------------
-- 3. status_history: same, keeping 0009's soft-delete guard
-- ---------------------------------------------------------------------------
-- This policy was last rewritten by 0009_public_access_hardening.sql, which
-- added the `leads.deleted_at is null` check. Keep it.

drop policy status_history_select_trainer on status_history;

create policy status_history_select_trainer on status_history
  for select to authenticated
  using (
    my_role() = 'trainer'
    and exists (
      select 1 from leads
      where leads.id = status_history.lead_id
        and leads.allocated_trainer_id = my_trainer_id()
        and leads.deleted_at is null
    )
  );
