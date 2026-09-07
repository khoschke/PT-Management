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
-- RUN THIS FILE IN TWO PARTS. THE ORDER MATTERS.
-- ---------------------------------------------------------------------------
--
--   1. Run PART A on its own and let it commit.
--   2. Then run PART B.
--
-- Postgres will not let a newly added enum value be USED in the same
-- transaction that ADDS it, and the Supabase SQL editor wraps a run in one.
-- Running the whole file at once fails on PART B with "unsafe use of new value
-- of enum type". Splitting the run is the entire reason for the two parts;
-- unlike 0009 there is no deploy step in between, so run them back to back.

-- ===========================================================================
-- PART A — run this alone, then run PART B
-- ===========================================================================

alter type app_role add value if not exists 'staff';

-- ===========================================================================
-- PART B — run after PART A has committed
-- ===========================================================================

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
