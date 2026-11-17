-- Lead status funnel cleanup: Batch 1 items [1] and [2], decided by Karl on
-- 17 Nov 2026. See "Batch 1" under Outstanding in docs/PROJECT_STATUS.md.
--
-- Before: New, Allocated, Contacted, Booked, Completed, Not interested, Unreachable
-- After:  New, Allocated, Contacted, Comp. Booked, Attended, Converted,
--         Not interested, Unreachable
--
-- What changes:
--   - 'Booked' is renamed 'Comp. Booked'.
--   - 'Completed' is renamed 'Attended'. Completed was ambiguous (session
--     happened, or signed up?), and the counts point to most trainers using it
--     for the session. Each trainer then moves any of theirs that actually
--     signed up to Converted; the database cannot tell which meaning was used.
--   - 'Converted' is added, after Attended: signed up to paid PT.
--
-- Item [2], "remove Interested and move those leads to Contacted", needs no
-- data change. "Interested" was a status in the old lead spreadsheet, never in
-- the portal, so no row holds it. The counts this prints show nothing moved.
--
-- Renaming an enum value rewrites no rows: every lead and every status_history
-- row keeps its value and simply reads under the new name. Nothing is lost,
-- which is also what makes this reversible (see the end of the file).
--
-- The status trigger is rewritten in the same migration, and must be. Its body
-- names statuses as text ('Booked', 'Completed'), which Postgres only checks
-- when the trigger runs, so leaving it alone would make every status change
-- fail with "invalid input value for enum" the moment the renames landed.
--
-- Safe to re-run: the renames only happen if the old names still exist, and
-- the new value is added "if not exists".
--
-- Nothing in this file uses the new 'Converted' value as data. The Supabase SQL
-- editor runs a paste as one transaction, and Postgres refuses to use an enum
-- value in the same transaction that added it.

-- Counts before, per status, so the move can be sanity checked.
do $$
declare
  r record;
begin
  raise notice '0018 before (non-deleted leads):';
  for r in
    select status::text as s, count(*) as n
      from leads where deleted_at is null
     group by status order by status
  loop
    raise notice '  % = %', r.s, r.n;
  end loop;
end
$$;

do $$
begin
  if exists (select 1 from pg_enum
              where enumtypid = 'lead_status'::regtype and enumlabel = 'Booked') then
    alter type lead_status rename value 'Booked' to 'Comp. Booked';
  end if;
  if exists (select 1 from pg_enum
              where enumtypid = 'lead_status'::regtype and enumlabel = 'Completed') then
    alter type lead_status rename value 'Completed' to 'Attended';
  end if;
end
$$;

alter type lead_status add value if not exists 'Converted' after 'Attended';

-- 0016's trigger, with the renamed statuses and Converted added to the ones
-- that imply first contact was made. Unreachable and Not interested stay out,
-- for 0016's reasons.
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
    if new.status in ('Contacted', 'Comp. Booked', 'Attended', 'Converted')
       and new.first_contacted_at is null then
      new.first_contacted_at = now();
    end if;
  end if;

  return new;
end;
$$;

-- Counts after. Every number should match the line above it under its new
-- name: Booked -> Comp. Booked, Completed -> Attended. Converted starts at 0
-- and is not listed until a lead holds it.
do $$
declare
  r record;
begin
  raise notice '0018 after (non-deleted leads):';
  for r in
    select status::text as s, count(*) as n
      from leads where deleted_at is null
     group by status order by status
  loop
    raise notice '  % = %', r.s, r.n;
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- To reverse
-- ---------------------------------------------------------------------------
-- Postgres cannot drop a value from an enum, so Converted stays on the type,
-- unused. First move any Converted leads back by hand (to 'Attended', before
-- the renames below), then run:
--
--   alter type lead_status rename value 'Comp. Booked' to 'Booked';
--   alter type lead_status rename value 'Attended' to 'Completed';
--
-- and re-run 0016_stamp_first_contacted.sql's create function statement to
-- restore the old trigger body. Deploy the matching app code at the same time.
