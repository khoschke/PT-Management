-- Let a trainer set their own AM/PM availability.
--
-- Extends the self-service profile from 0010 (bio + specialties) with the two
-- availability booleans, so a PT who stops taking evenings can say so without
-- going through the PT Manager.
--
-- Only the guard changes. `trainers_select_self` and `trainers_update_self`
-- from 0010 already scope the read and the write to the trainer's own row;
-- this widens WHICH columns that write may touch, from two to four.
--
-- Availability is not quite like bio and specialties, and the guard says so:
-- a trainer with neither slot ticked drops out of lead allocation completely
-- (see suggestTrainer in src/lib/allocation.ts). The self-service form already
-- refuses to save that, mirroring the manager's roster form; the check below
-- is the same rule somewhere it can't be skipped by posting straight at the
-- REST API with the public key.

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

  if not (new.available_am or new.available_pm) then
    raise exception 'Choose at least one — mornings, evenings, or both.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

comment on function guard_trainer_self_update() is
  'Restricts a trainer''s self-update (trainers_update_self) to bio, specialties and AM/PM availability, and stops them leaving both availability slots off. Managers and server-side callers are unaffected.';
