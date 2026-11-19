-- Automated 2-2-2 follow-ups and the 48-hour clock on a no (Part 7 amendments,
-- item 11). Spec: docs/spec-item-11-follow-ups.md, all five decisions approved
-- by Karl on 18 Nov 2026.
--
-- 1. Two statuses: 'Said no' (the 48-hour clock to ask the permission question
--    is running) and 'Agreed to check-in' (on the 2-2-2).
-- 2. Every way a lead ends for good stays 'Not interested' (or 'Unreachable'),
--    with the reason recorded in closed_reason.
-- 3. The follow-up schedule lives on the lead: follow_up_step and
--    next_follow_up_at, kept by the trigger below and complete_follow_up().
--      step 1  2-day nudge due        (went quiet; set when first contacted)
--      step 2  2-week touch due       (after the nudge, or after agreeing to a check-in)
--      step 3  2-month reconnect due
--      step 4  reconnect sent; the lead closes as Unreachable after 7 days
-- 4. close_expired_leads() does every automatic close. It runs from the daily
--    cron and whenever the lead board loads, so a lead never shows open past
--    its deadline even though Vercel's plan only runs crons once a day.
--      - Said no, permission question not logged, 48 hours passed
--          -> Not interested, no_response_to_no (the only reopenable close)
--      - Said no, asked by text, no answer in 7 days -> Not interested, declined
--      - Reconnect sent, nothing changed in 7 days  -> Unreachable, no_reply
-- 5. reopen_timer_close(): the PT Manager reopens a timer close, with a reason,
--    logged in lead_reopens. Opt-outs (replied STOP, declined, ended by
--    trainer) can never be reopened.
--
-- The rules are enforced in the database, not just the app: a trainer can't
-- undo a timer close, can't set the timer's reason themselves, and nobody can
-- reopen a lead that opted out.
--
-- `add value` is allowed inside a transaction on Postgres 12+, but the new
-- values can't be used by anything that runs before it commits. Nothing below
-- runs them: plpgsql bodies are only parsed when called.
--
-- Safe to re-run.

alter type lead_status add value if not exists 'Said no' after 'Attended';
alter type lead_status add value if not exists 'Agreed to check-in' after 'Said no';

do $$
begin
  create type lead_closed_reason as enum (
    'replied_stop', 'declined', 'ended_by_trainer', 'no_response_to_no', 'no_reply'
  );
exception when duplicate_object then null;
end
$$;

alter table leads add column if not exists closed_reason lead_closed_reason;
alter table leads add column if not exists closed_at timestamptz;
alter table leads add column if not exists said_no_at timestamptz;
alter table leads add column if not exists permission_asked_at timestamptz;
alter table leads add column if not exists follow_up_step smallint;
alter table leads add column if not exists next_follow_up_at timestamptz;

comment on column leads.closed_reason is 'Why a lead ended for good. Only no_response_to_no can be reopened (by the PT Manager).';
comment on column leads.said_no_at is 'When the lead went to Said no. The permission question is due within 48 hours.';
comment on column leads.permission_asked_at is 'When the trainer logged asking the permission question. Stops the 48-hour clock.';
comment on column leads.follow_up_step is '2-2-2 step due: 1 nudge, 2 two-week, 3 two-month, 4 reconnect sent (closes after 7 days).';

create index if not exists leads_next_follow_up_idx on leads (next_follow_up_at)
  where next_follow_up_at is not null and deleted_at is null;

create table if not exists lead_reopens (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  reopened_by uuid references auth.users (id),
  reopened_at timestamptz not null default now(),
  reason text not null,
  new_status lead_status not null
);

alter table lead_reopens enable row level security;

drop policy if exists lead_reopens_select_manager on lead_reopens;
create policy lead_reopens_select_manager on lead_reopens
  for select to authenticated using (is_manager());

-- First contact: Said no and Agreed to check-in also mean the trainer reached
-- them (someone can say no on the very first call). Otherwise 0018's body.
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

    if new.status in ('Contacted', 'Comp. Booked', 'Attended', 'Converted', 'Said no', 'Agreed to check-in')
       and new.first_contacted_at is null then
      new.first_contacted_at = now();
    end if;
  end if;

  return new;
end;
$$;

-- The follow-up rules. Runs before every update of a lead.
create or replace function apply_follow_up_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_system boolean := coalesce(current_setting('app.lead_system_change', true), '') = 'on';
begin
  -- Only the automatic close may set the timer's reason.
  if new.closed_reason = 'no_response_to_no'
     and old.closed_reason is distinct from 'no_response_to_no'
     and not v_system then
    raise exception 'Only the 48-hour timer can close a lead for no response to a no.';
  end if;

  -- A timer close stands until the PT Manager reopens it (reopen_timer_close).
  if old.closed_reason = 'no_response_to_no' and not v_system
     and (new.status is distinct from old.status or new.closed_reason is distinct from old.closed_reason) then
    raise exception 'This lead was closed by the 48-hour timer. Only the PT Manager can reopen it.';
  end if;

  -- A lead that opted out is never reopened, by anyone.
  if old.closed_reason in ('replied_stop', 'declined', 'ended_by_trainer')
     and new.status is distinct from old.status
     and new.status not in ('Not interested', 'Unreachable', 'Converted') then
    raise exception 'This lead opted out of contact about PT and can''t be reopened.';
  end if;

  if new.status is distinct from old.status then
    if new.status = 'Said no' then
      new.said_no_at = now();
      new.permission_asked_at = null;
      new.follow_up_step = null;
      new.next_follow_up_at = null;
    elsif new.status = 'Agreed to check-in' then
      -- Option A: the permission question was the first touch, so the next
      -- one is the 2-week touch. No 2-day nudge after "not right now".
      new.permission_asked_at = coalesce(new.permission_asked_at, now());
      new.follow_up_step = 2;
      new.next_follow_up_at = now() + interval '14 days';
    elsif new.status = 'Contacted' and old.status in ('New', 'Allocated') then
      -- First contact. If they don't reply, the 2-day nudge is due.
      new.follow_up_step = 1;
      new.next_follow_up_at = now() + interval '2 days';
    elsif new.status in ('Comp. Booked', 'Attended', 'Converted', 'Not interested', 'Unreachable') then
      new.follow_up_step = null;
      new.next_follow_up_at = null;
    end if;

    if new.status in ('Not interested', 'Unreachable') then
      new.closed_at = coalesce(new.closed_at, now());
    else
      new.closed_at = null;
      new.closed_reason = null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists leads_apply_follow_up_rules on leads;
create trigger leads_apply_follow_up_rules
  before update on leads
  for each row execute function apply_follow_up_rules();

-- A trainer marks the due follow-up as sent. Runs as the caller, so RLS keeps
-- a trainer to their own leads.
create or replace function complete_follow_up(p_lead_id uuid)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_step smallint;
begin
  select follow_up_step into v_step from leads
   where id = p_lead_id and deleted_at is null
     and status in ('Contacted', 'Agreed to check-in');

  if v_step is null or v_step not in (1, 2, 3) then
    return jsonb_build_object('ok', false, 'reason', 'nothing_due');
  end if;

  update leads set
    follow_up_step = v_step + 1,
    next_follow_up_at = now() + case v_step
      when 1 then interval '14 days'
      when 2 then interval '2 months'
      else interval '7 days'
    end,
    last_contacted_at = now()
  where id = p_lead_id;

  return jsonb_build_object('ok', true, 'step', v_step + 1);
end;
$$;

revoke all on function complete_follow_up(uuid) from public, anon;
grant execute on function complete_follow_up(uuid) to authenticated;

-- Every automatic close. Idempotent: safe to call on every board load. Returns
-- the leads the 48-hour timer closed in this call, so the caller can email the
-- PT Manager about them.
create or replace function close_expired_leads()
returns table (lead_id uuid, lead_name text, trainer_id uuid, said_no_at timestamptz, closed_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.lead_system_change', 'on', true);

  update leads l set status = 'Not interested', closed_reason = 'declined', closed_at = now()
   where l.deleted_at is null and l.status = 'Said no'
     and l.permission_asked_at is not null
     and l.permission_asked_at + interval '7 days' <= now();

  update leads l set status = 'Unreachable', closed_reason = 'no_reply', closed_at = now()
   where l.deleted_at is null and l.status in ('Contacted', 'Agreed to check-in')
     and l.follow_up_step = 4 and l.next_follow_up_at <= now();

  return query
  update leads l set status = 'Not interested', closed_reason = 'no_response_to_no', closed_at = now()
   where l.deleted_at is null and l.status = 'Said no'
     and l.permission_asked_at is null
     and l.said_no_at + interval '48 hours' <= now()
  returning l.id, l.name, l.allocated_trainer_id, l.said_no_at, l.closed_at;

  perform set_config('app.lead_system_change', 'off', true);
end;
$$;

revoke all on function close_expired_leads() from public, anon;
grant execute on function close_expired_leads() to authenticated;

-- The PT Manager reopens a lead the timer closed: the trainer did respond in
-- time but didn't update the portal, or it was an accident.
create or replace function reopen_timer_close(p_lead_id uuid, p_new_status lead_status, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_manager() then
    return jsonb_build_object('ok', false, 'reason', 'not_manager');
  end if;
  if length(trim(coalesce(p_reason, ''))) = 0 or length(p_reason) > 500 then
    return jsonb_build_object('ok', false, 'reason', 'reason_required');
  end if;
  if p_new_status not in ('Agreed to check-in', 'Not interested') then
    return jsonb_build_object('ok', false, 'reason', 'invalid_status');
  end if;
  if not exists (select 1 from leads where id = p_lead_id and deleted_at is null
                  and closed_reason = 'no_response_to_no') then
    return jsonb_build_object('ok', false, 'reason', 'not_timer_close');
  end if;

  perform set_config('app.lead_system_change', 'on', true);

  if p_new_status = 'Not interested' then
    -- The trainer did ask and got a "leave it": the close stands, with the
    -- right reason.
    update leads set closed_reason = 'declined' where id = p_lead_id;
  else
    update leads set status = p_new_status where id = p_lead_id;
  end if;

  perform set_config('app.lead_system_change', 'off', true);

  insert into lead_reopens (lead_id, reopened_by, reason, new_status)
  values (p_lead_id, auth.uid(), trim(p_reason), p_new_status);

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function reopen_timer_close(uuid, lead_status, text) from public, anon;
grant execute on function reopen_timer_close(uuid, lead_status, text) to authenticated;
