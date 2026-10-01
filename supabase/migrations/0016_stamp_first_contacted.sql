-- Stamp first_contacted_at when a lead reaches any status that implies first
-- contact has been made, not only the exact "Contacted" step.
--
-- Why: the 48 hour clock and the CSV export's "First contacted at" column both
-- read leads.first_contacted_at, which the status trigger only set when a lead
-- was moved to 'Contacted'. A lead advanced straight to 'Booked' or 'Completed'
-- (you cannot book or complete someone you never contacted) kept a null
-- timestamp, so the CSV column came out blank and the clock misread it as still
-- awaiting contact. The board's clock was since fixed to read the status too,
-- but the stored timestamp was still missing for reporting.
--
-- 'Unreachable' is deliberately excluded: by definition no contact was made, so
-- a null first_contacted_at there is correct, not a gap. 'Not interested' is
-- left out too, so the stamp only lands where contact certainly happened.

create or replace function record_status_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into status_history (lead_id, old_status, new_status, changed_by)
    values (new.id, null, new.status, auth.uid());
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into status_history (lead_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());

    -- Any of these means first contact has been made. Stamp it once.
    if new.status in ('Contacted', 'Booked', 'Completed')
       and new.first_contacted_at is null then
      new.first_contacted_at = now();
    end if;
  end if;

  return new;
end;
$$;

-- Backfill leads that already reached a contacted status without a timestamp,
-- using the earliest status_history entry into one of those statuses as the
-- best estimate of when first contact happened, and falling back to created_at
-- if a lead has no such history row. This UPDATE does not change status, so the
-- trigger above records no new history row and does not overwrite the value set
-- here.
update leads l
set first_contacted_at = coalesce(
  (select min(sh.changed_at)
     from status_history sh
    where sh.lead_id = l.id
      and sh.new_status in ('Contacted', 'Booked', 'Completed')),
  l.created_at
)
where l.first_contacted_at is null
  and l.status in ('Contacted', 'Booked', 'Completed');
