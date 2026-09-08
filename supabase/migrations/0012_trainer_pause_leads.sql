-- "Pause my leads": both availability slots off means not taking new leads.
--
-- 0011 refused to let a trainer untick both Morning and Evening, on the stated
-- grounds that it would drop them out of allocation. That reasoning was wrong.
-- Availability was never a gate: `suggestTrainer` scored it as +5 and nothing
-- more, the pool was every active trainer, and ties broke on lowest lead load —
-- so a trainer with both slots off would have kept receiving leads, and a light
-- book would have made them *more* likely to win a tie.
--
-- Karl asked for both-off to become a real control for a PT whose book is full.
-- That is now what it means, so the block is lifted here and the application
-- side makes it true:
--
--   * `suggestTrainer` (src/lib/allocation.ts) drops paused trainers from the
--     pool before any rule runs, so they are never suggested.
--   * The public form's trainer picker (src/app/pt-session/page.tsx) hides them,
--     so a member cannot request them by name while they are paused.
--   * The manager can still allocate to a paused trainer by hand — the pause is
--     a default, not a lock, and the roster labels them so it is visible.
--
-- The column restriction from 0010/0011 is unchanged: a trainer still edits
-- only bio, specialties and the two availability booleans.

create or replace function guard_trainer_self_update()
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

  -- Whole-row diff with the self-editable keys removed, so a column added to
  -- `trainers` in a later migration is protected by default rather than
  -- silently becoming trainer-editable.
  if (to_jsonb(new) - 'bio' - 'specialties' - 'available_am' - 'available_pm')
     is distinct from
     (to_jsonb(old) - 'bio' - 'specialties' - 'available_am' - 'available_pm') then
    raise exception 'You can only change your own bio, specialties and availability.'
      using errcode = '42501';
  end if;

  -- No both-slots-off check any more: that state is now meaningful.
  return new;
end;
$$;

comment on function guard_trainer_self_update() is
  'Restricts a trainer''s self-update (trainers_update_self) to bio, specialties and AM/PM availability. Both slots off is allowed and means "not taking new leads". Managers and server-side callers are unaffected.';

-- ---------------------------------------------------------------------------
-- The public form has to be able to see who is paused
-- ---------------------------------------------------------------------------
-- 0009 cut anon down to (id, name, active) so trainer emails stopped being
-- public. Postgres needs SELECT on a column to filter on it, so the public
-- form's picker cannot hide paused trainers without reading these two.
--
-- They are not PII: two booleans saying whether a trainer takes morning or
-- evening sessions. Email, gender, specialties, bio and created_at stay
-- unreadable to anon, which is what 0009 was actually protecting.

grant select (available_am, available_pm) on trainers to anon;
