-- Two dates on every lead, for the weekly trainer summary email (Batch 1 item
-- [3]), decided by Karl on 17 Nov 2026.
--
--   allocated_at       when the lead was assigned to its current trainer
--   last_contacted_at  the last time the trainer reached out
--
-- Until now neither was stored. created_at is when the lead entered the system,
-- not when a trainer got it, and first_contacted_at is stamped once and never
-- moves.
--
-- From here on, a trigger keeps both current:
--   - allocated_at is stamped whenever allocated_trainer_id changes to a
--     trainer, so a reassigned lead shows the date its current trainer got it.
--   - last_contacted_at is stamped whenever the status changes to anything past
--     Allocated. Changing status is contact, or the record of it. The "Log
--     contact" button sets it directly too, for a follow-up call that changes
--     no status.
--
-- Existing leads are backfilled from status_history (Karl's option A):
--   - allocated_at: the lead's "Allocated" history row. A lead that was moved
--     off New before it was allocated has no such row (one live lead on
--     17 Nov 2026), so it falls back to its first status change after New, the
--     earliest moment anyone handled it, then to created_at.
--   - last_contacted_at: the latest change to a status past Allocated. A lead
--     with none stays null, which the email shows as "Not yet contacted"
--     rather than inventing a date.
--
-- Safe to re-run: the columns are added "if not exists", the trigger is
-- replaced, and the backfill only fills nulls.

alter table leads add column if not exists allocated_at timestamptz;
alter table leads add column if not exists last_contacted_at timestamptz;

create or replace function stamp_lead_contact_dates()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.allocated_trainer_id is not null and new.allocated_at is null then
      new.allocated_at = now();
    end if;
  else
    if new.allocated_trainer_id is not null
       and new.allocated_trainer_id is distinct from old.allocated_trainer_id then
      new.allocated_at = now();
    end if;

    if new.status is distinct from old.status
       and new.status not in ('New', 'Allocated') then
      new.last_contacted_at = now();
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists leads_stamp_contact_dates on leads;

create trigger leads_stamp_contact_dates
  before insert or update on leads
  for each row execute function stamp_lead_contact_dates();

-- Backfill. Plain updates of these two columns change no status, so the
-- history trigger records nothing and this trigger leaves the values alone.
update leads l
set allocated_at = coalesce(
  (select min(sh.changed_at) from status_history sh
    where sh.lead_id = l.id and sh.new_status = 'Allocated'),
  (select min(sh.changed_at) from status_history sh
    where sh.lead_id = l.id and sh.old_status is not null),
  l.created_at
)
where l.allocated_trainer_id is not null
  and l.allocated_at is null;

update leads l
set last_contacted_at = (
  select max(sh.changed_at) from status_history sh
   where sh.lead_id = l.id
     and sh.new_status not in ('New', 'Allocated')
)
where l.last_contacted_at is null;

-- How many got a date, so the backfill can be sanity checked.
do $$
begin
  raise notice '0019: % allocated leads, % with allocated_at; % leads with last_contacted_at',
    (select count(*) from leads where allocated_trainer_id is not null and deleted_at is null),
    (select count(*) from leads where allocated_at is not null and deleted_at is null),
    (select count(*) from leads where last_contacted_at is not null and deleted_at is null);
end
$$;
