-- Public access hardening.
--
-- ---------------------------------------------------------------------------
-- Numbering: this file depends on 0006_trainer_documents.sql
-- ---------------------------------------------------------------------------
-- Block 3 below rewrites a policy on `trainer_documents`, which does not exist
-- until 0006 has run. It was originally written as `0005`, which would have
-- failed on a fresh setup by running before the table it edits was created.
-- It is numbered 0009 so it lands after 0006 and after the GymMaster pair
-- (0007/0008), which are already written on `claude/gymmaster-phase-1-pull-7yuxuy`
-- and did not need renumbering as a result. 0005 is now permanently unused.
--
-- Four changes, all about what the PUBLIC anon key can reach:
--   1. Trainer emails are no longer readable with the anon key (column grants).
--   2. A trainer can no longer read the status history of their own
--      soft-deleted leads.
--   3. A trainer can no longer self-verify a compliance document, or attach a
--      file that lives in another trainer's storage folder.
--   4. Public form submissions go through a security-definer RPC that enforces
--      the rate limit server side, instead of anon holding a direct INSERT on
--      `leads` that a script can POST straight past.
--
-- ---------------------------------------------------------------------------
-- RUN THIS FILE IN TWO PARTS. THE ORDER MATTERS.
-- ---------------------------------------------------------------------------
--
--   1. Run PART A (everything up to the PART B banner).
--   2. Deploy the application code that calls submit_form_lead().
--   3. Only then run PART B, which takes the direct INSERT away from anon.
--
-- Doing PART B first breaks the live public form for as long as the old code
-- is still deployed: it would have neither the direct insert nor the new RPC.
-- PART A is safe to run against the currently deployed code — it only ADDS the
-- function, and the old insert path keeps working until PART B removes it.

-- ===========================================================================
-- PART A — safe to run before the code deploy
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Trainer PII is not public
-- ---------------------------------------------------------------------------
-- RLS is row-level, so `trainers_select_active` (which anon needs, for the
-- public form's trainer picker) also hands out every column of those rows,
-- including `email`. Column privileges are the right tool: anon keeps exactly
-- the three columns the public form reads (`id, name` selected, `active`
-- filtered on) and loses the rest.
--
-- Managers and trainers sign in and use the `authenticated` role, which is
-- untouched here.

revoke select on trainers from anon;
grant select (id, name, active) on trainers to anon;

-- ---------------------------------------------------------------------------
-- 2. status_history follows the parent lead's soft delete
-- ---------------------------------------------------------------------------
-- `leads_select_trainer` hides soft-deleted leads from the trainer, but the
-- status_history policy never checked `deleted_at`, so the history of a
-- removed lead stayed readable. Match the parent policy.

drop policy status_history_select_trainer on status_history;

create policy status_history_select_trainer on status_history
  for select to authenticated
  using (
    not is_manager()
    and exists (
      select 1 from leads
      where leads.id = status_history.lead_id
        and leads.allocated_trainer_id = my_trainer_id()
        and leads.deleted_at is null
    )
  );

-- ---------------------------------------------------------------------------
-- 3. A trainer cannot approve their own compliance document
-- ---------------------------------------------------------------------------
-- The app inserts trainer uploads as 'pending' and leaves verification to the
-- manager, but the INSERT policy only constrained `trainer_id` and
-- `uploaded_by`. A trainer posting straight at /rest/v1/trainer_documents with
-- the public key could set status='verified' and sign off their own CPR
-- certificate. Pin the verification columns on the trainer branch of the
-- policy (the manager branch is unchanged: manager uploads are verified on the
-- spot, which is deliberate).
--
-- `file_path` is pinned to the trainer's own folder at the same time. Storage
-- policies already scope the bucket by folder, so this is defence in depth
-- against a metadata row that points somewhere it shouldn't.

drop policy trainer_documents_insert on trainer_documents;

create policy trainer_documents_insert on trainer_documents
  for insert to authenticated
  with check (
    is_manager()
    or (
      trainer_id = my_trainer_id()
      and uploaded_by = auth.uid()
      and status = 'pending'
      and verified_by is null
      and verified_at is null
      and rejection_reason is null
      and file_path like my_trainer_id()::text || '/%'
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Public form submissions go through one security-definer entry point
-- ---------------------------------------------------------------------------
-- The server action checks the rate limit before inserting, but anon also held
-- a direct INSERT policy on `leads`, so a script could skip the app entirely
-- and POST at /rest/v1/leads all day. This function is the only way anon gets
-- a row into `leads` once PART B has run.
--
-- It enforces two windows:
--   * per IP hash  — the same 8-in-10-minutes the app used, so a shared gym
--                    foyer device is still fine.
--   * global       — a ceiling across every IP in the same window, so rotating
--                    addresses can't turn the per-IP limit into "unlimited".
--                    At ~30 leads a month, 30 in ten minutes is far above any
--                    real burst and still stops a flood.
--
-- It also pins the fields anon must not choose: lead_source, status,
-- allocated_trainer_id, deleted_at, created_by, and the ip_hash (which is
-- computed server side from the request, never sent by the browser).

create or replace function submit_form_lead(
  p_ip_hash text,
  p_name text,
  p_phone text,
  p_email text,
  p_date_of_birth date,
  p_goals text[],
  p_goal_other text default null,
  p_current_exercise text default null,
  p_gender_preference text default null,
  p_time_preference text default null,
  p_preferred_trainer_id uuid default null,
  p_contact_preference text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip_count int;
  v_global_count int;
  v_trainer_id uuid;
  v_lead_id uuid;
  v_name text := btrim(coalesce(p_name, ''));
  v_phone text := btrim(coalesce(p_phone, ''));
  v_email text := btrim(coalesce(p_email, ''));
begin
  -- The ip_hash is produced by the app from the request headers. A caller that
  -- omits it doesn't get a free pass around the per-IP window.
  if p_ip_hash is null or btrim(p_ip_hash) = '' then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  -- Rate limit, both windows, before anything is written.
  select count(*) into v_ip_count
  from rate_limit_log
  where ip_hash = p_ip_hash
    and created_at > now() - interval '10 minutes';

  if v_ip_count >= 8 then
    return jsonb_build_object('ok', false, 'reason', 'rate_limited');
  end if;

  select count(*) into v_global_count
  from rate_limit_log
  where created_at > now() - interval '10 minutes';

  if v_global_count >= 30 then
    return jsonb_build_object('ok', false, 'reason', 'rate_limited');
  end if;

  -- Server-side shape checks. The app validates properly (see
  -- src/lib/validation.ts); these are the backstop for a caller that isn't the
  -- app, and they mirror the column limits rather than restating the taxonomy.
  if v_name = '' or length(v_name) > 200 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  if v_phone = '' or length(v_phone) > 40 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  if v_email = '' or length(v_email) > 320 or v_email not like '%_@_%.__%' then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  -- The leads check constraint already requires a goal on a form lead; fail it
  -- here with a clean message instead of a raw constraint violation.
  if p_goals is null or array_length(p_goals, 1) is null or array_length(p_goals, 1) > 20 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  if p_date_of_birth is null or p_date_of_birth > current_date then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  if length(coalesce(p_goal_other, '')) > 300
    or length(coalesce(p_current_exercise, '')) > 500
    or length(coalesce(p_contact_preference, '')) > 300
  then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  -- A requested trainer only counts if they're on the roster and active;
  -- anything else is quietly dropped rather than failing the submission.
  if p_preferred_trainer_id is not null then
    select id into v_trainer_id
    from trainers
    where id = p_preferred_trainer_id and active = true;
  end if;

  -- Log the attempt inside the same transaction as the insert, so a submission
  -- that ends up failing still counts against the window.
  insert into rate_limit_log (ip_hash) values (p_ip_hash);

  insert into leads (
    name,
    phone,
    email,
    date_of_birth,
    goals,
    goal_other,
    current_exercise,
    gender_preference,
    time_preference,
    preferred_trainer_id,
    contact_preference,
    lead_source,
    status,
    allocated_trainer_id,
    created_by,
    deleted_at,
    ip_hash
  ) values (
    v_name,
    v_phone,
    v_email,
    p_date_of_birth,
    p_goals,
    nullif(btrim(coalesce(p_goal_other, '')), ''),
    nullif(btrim(coalesce(p_current_exercise, '')), ''),
    -- Cast defensively: an unrecognised value becomes null rather than a 500.
    case when p_gender_preference in ('male', 'female', 'no_preference')
      then p_gender_preference::gender_preference end,
    case when p_time_preference in ('AM', 'PM', 'either')
      then p_time_preference::time_preference end,
    v_trainer_id,
    nullif(btrim(coalesce(p_contact_preference, '')), ''),
    'form',
    'New',
    null,
    null,
    null,
    p_ip_hash
  )
  returning id into v_lead_id;

  return jsonb_build_object('ok', true, 'lead_id', v_lead_id);
end;
$$;

comment on function submit_form_lead is
  'The only way the public form puts a row in leads. Security definer so the rate limit cannot be skipped by calling the REST API directly.';

-- Functions are executable by PUBLIC by default; be explicit about who may
-- call this one.
revoke all on function submit_form_lead(
  text, text, text, text, date, text[], text, text, text, text, uuid, text
) from public;

grant execute on function submit_form_lead(
  text, text, text, text, date, text[], text, text, text, text, uuid, text
) to anon, authenticated;

-- ===========================================================================
-- PART B — run ONLY after the code calling submit_form_lead() is deployed
-- ===========================================================================
-- Everything below removes the old, bypassable path. Running it while the
-- previous release is still live takes the public form down.

-- The direct insert anon used to hold. Dropping the policy is what actually
-- closes it; the revoke is belt and braces so a future policy can't
-- accidentally re-open the table to anon.
drop policy if exists leads_insert_public_form on leads;
revoke insert on leads from anon;

-- check_form_rate_limit is now dead weight, and worse than that: it writes a
-- rate_limit_log row on every call, so anon could hammer it to fill the window
-- and lock genuine members out of the form. submit_form_lead does the check and
-- the logging together, inside the insert transaction.
revoke execute on function check_form_rate_limit(text) from anon, authenticated;
