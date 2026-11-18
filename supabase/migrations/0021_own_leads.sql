-- Trainers add their own leads (Part 7 amendments, item 8; design agreed by
-- Karl, 18 Nov 2026).
--
-- Until now a trainer could only see leads the PT Manager allocated to them.
-- Leads they found themselves (the floor, referrals, social) sat outside the
-- portal, so the workbook's tracking advice didn't hold. From here:
--
--   1. A fourth lead source, `own`, shown as "Own lead".
--   2. `found_via`: where the trainer found them. "Unverified lead list" saves
--      as lead_source `unverified`; every other option saves as `own`. That
--      keeps gym-provided and trainer-generated leads apart in the numbers.
--   3. `add_own_lead()`: the only way a trainer creates a lead. It allocates
--      the lead to the caller as Allocated (so the usual 48 hour clock runs),
--      and refuses a phone number already in the portal, so two trainers
--      never chase the same person and nobody re-contacts someone who has
--      opted out. The refusal doesn't say which trainer has them.
--
-- Why a function and not an insert policy: the duplicate check has to look at
-- every lead, and trainers can only read their own under RLS. A security
-- definer function can check all of them without widening what a trainer can
-- read, the same pattern as submit_form_lead() in 0009.
--
-- Phones are compared on their last nine digits, so 0412 345 678 and
-- +61 412 345 678 match. Deleted leads are ignored; closed ones are not, on
-- purpose: someone who said no or replied STOP must not come back in through a
-- trainer's own list.
--
-- `add value` is allowed inside a transaction on Postgres 12+, but the new
-- value can't be used by anything that runs before the transaction commits.
-- Nothing below runs it: the function body is only parsed when it is called.
--
-- Safe to re-run.

alter type lead_source add value if not exists 'own';

do $$
begin
  create type lead_found_via as enum (
    'gym_floor', 'referral', 'social_media', 'unverified_list', 'other'
  );
exception when duplicate_object then null;
end
$$;

alter table leads add column if not exists found_via lead_found_via;
alter table leads add column if not exists found_via_other text;

comment on column leads.found_via is
  'Set only on leads a trainer added themselves (add_own_lead): where they found them.';
comment on column leads.found_via_other is
  'The trainer''s own words when found_via is ''other''.';

create or replace function add_own_lead(
  p_name text,
  p_phone text,
  p_email text,
  p_goals text[],
  p_found_via lead_found_via,
  p_found_via_other text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trainer_id uuid;
  v_name text := trim(coalesce(p_name, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[\s().-]', '', 'g');
  v_digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_email text := nullif(trim(coalesce(p_email, '')), '');
  v_other text := nullif(trim(coalesce(p_found_via_other, '')), '');
  v_lead_id uuid;
begin
  -- Only an actual, active trainer. Staff carry a trainer_id too (an inactive
  -- trainers row), so the role check matters, not just my_trainer_id().
  if my_role() is distinct from 'trainer' then
    return jsonb_build_object('ok', false, 'reason', 'not_trainer');
  end if;

  select t.id into v_trainer_id
  from trainers t
  where t.id = my_trainer_id() and t.active;

  if v_trainer_id is null then
    return jsonb_build_object('ok', false, 'reason', 'not_trainer');
  end if;

  if v_name = '' or length(v_name) > 200
     or length(v_digits) < 9 or length(v_phone) > 20
     or length(coalesce(v_email, '')) > 320
     or p_found_via is null
     or (p_found_via = 'other' and v_other is null)
     or length(coalesce(v_other, '')) > 200
     or coalesce(array_length(p_goals, 1), 0) > 20
  then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  if exists (
    select 1 from leads l
    where l.deleted_at is null
      and right(regexp_replace(l.phone, '\D', '', 'g'), 9) = right(v_digits, 9)
  ) then
    return jsonb_build_object('ok', false, 'reason', 'duplicate');
  end if;

  insert into leads (
    name, phone, email, goals,
    lead_source, allocated_trainer_id, status,
    found_via, found_via_other, created_by
  ) values (
    v_name, v_phone, v_email, coalesce(p_goals, '{}'),
    case when p_found_via = 'unverified_list' then 'unverified' else 'own' end::lead_source,
    v_trainer_id, 'Allocated',
    p_found_via, case when p_found_via = 'other' then v_other end, auth.uid()
  )
  returning id into v_lead_id;

  return jsonb_build_object('ok', true, 'id', v_lead_id);
end;
$$;

revoke all on function add_own_lead(text, text, text, text[], lead_found_via, text) from public, anon;
grant execute on function add_own_lead(text, text, text, text[], lead_found_via, text) to authenticated;
