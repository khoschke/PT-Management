-- Self-editable trainer profiles.
--
-- Today a trainer cannot change anything about how they are represented; the
-- manager edits the roster on their behalf. This lets a signed-in trainer edit
-- their OWN bio and specialties, and no one else's, enforced at the database
-- level rather than by hiding a form.
--
-- Three parts:
--   1. A trainer can always read their own row (even when deactivated), so the
--      self-service screen never renders an empty, confusing page.
--   2. A trainer can UPDATE the one `trainers` row matching their
--      profiles.trainer_id.
--   3. A trigger pins WHICH columns that update may touch. RLS is row-level
--      only, so policy (2) on its own would also let a trainer set their own
--      `active`, rename themselves, or repoint `email` — the address trainer
--      allocation notifications are sent to. The trigger is what makes this
--      "bio and specialties", not "their whole row".
--
-- The manager's existing `trainers_write_manager` policy is untouched: the
-- roster editor keeps editing everyone, every column.

-- ---------------------------------------------------------------------------
-- 1. A trainer can always see their own row
-- ---------------------------------------------------------------------------
-- `trainers_select_active` covers the normal case, but it is scoped to
-- active = true. Without this, deactivating a trainer who is still signed in
-- (they keep their leads) would make their own profile unreadable to them.

create policy trainers_select_self on trainers
  for select to authenticated
  using (id = my_trainer_id());

-- ---------------------------------------------------------------------------
-- 2. A trainer can update their own row
-- ---------------------------------------------------------------------------
-- Both USING and WITH CHECK are pinned to my_trainer_id(): the row they may
-- edit and the row they may leave behind are the same one, so an update
-- cannot walk a row over to another trainer's id.
--
-- my_trainer_id() is null for a manager-only profile, and `id = null` is never
-- true, so this policy grants nothing to anyone without a linked trainer row.

create policy trainers_update_self on trainers
  for update to authenticated
  using (id = my_trainer_id())
  with check (id = my_trainer_id());

-- ---------------------------------------------------------------------------
-- 3. Column guard: a self-update may only change bio and specialties
-- ---------------------------------------------------------------------------
-- Written as a whole-row jsonb diff with the two editable keys removed, rather
-- than as a list of `new.x is distinct from old.x` checks. That way a column
-- added to `trainers` in some later migration is protected by default instead
-- of silently becoming trainer-editable because nobody remembered to add it
-- here.

create function guard_trainer_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Managers edit the whole roster (trainers_write_manager). auth.uid() is
  -- null for the service-role client used by /admin/staff and the cron jobs;
  -- anon has no update path on this table at all, so a null uid here means a
  -- trusted server-side caller, not the public.
  if auth.uid() is null or is_manager() then
    return new;
  end if;

  if (to_jsonb(new) - 'bio' - 'specialties') is distinct from (to_jsonb(old) - 'bio' - 'specialties') then
    raise exception 'You can only change your own bio and specialties.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger trainers_guard_self_update
  before update on trainers
  for each row execute function guard_trainer_self_update();

comment on function guard_trainer_self_update() is
  'Restricts a trainer''s self-update (trainers_update_self) to the bio and specialties columns. Managers and server-side callers are unaffected.';

-- A trigger function has no business being a REST endpoint. PostgREST exposes
-- every function in `public` that the API roles can execute, and Supabase's
-- security linter flags it. Postgres checks EXECUTE when the trigger is
-- CREATEd, not each time it fires, so revoking here does not stop the guard
-- working (verified against live: the allowed edit still saves and the blocked
-- one still raises).
--
-- `public` has to be in the revoke list, not just the two API roles. Postgres
-- grants EXECUTE on every new function to PUBLIC by default, and anon inherits
-- it from there — revoking from anon and authenticated alone leaves
-- has_function_privilege('anon', ...) still true. The audit query in
-- supabase/reconcile/ caught exactly that on the first attempt.
revoke execute on function guard_trainer_self_update() from public, anon, authenticated;
