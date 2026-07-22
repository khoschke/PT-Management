-- GymMaster integration, Phase 1 (the pull): dedupe key + sync bookkeeping.
-- Runs after 0004, which commits the new 'gymmaster_api' lead_source value.

-- ---------------------------------------------------------------------------
-- Dedupe: remember which GymMaster member each imported lead came from, so a
-- re-run of the pull never creates a second lead for the same member.
-- ---------------------------------------------------------------------------

alter table leads
  add column gymmaster_member_id text;

comment on column leads.gymmaster_member_id is
  'GymMaster''s member id for leads pulled from the GymMaster API. Null for form and hand-entered sweep leads. Unique so re-runs of the pull are idempotent.';

-- Partial unique index: many leads have no GymMaster id (null), and Postgres
-- lets duplicate nulls through a plain unique constraint, but being explicit
-- keeps the intent clear — at most one lead per GymMaster member.
create unique index leads_gymmaster_member_id_key
  on leads (gymmaster_member_id)
  where gymmaster_member_id is not null;

-- ---------------------------------------------------------------------------
-- Cold-lead goals exemption: API imports arrive without stated goals, exactly
-- like the manual GymMaster sweep. Widen the existing check so both cold
-- sources are exempt from the "form leads must state a goal" rule.
-- ---------------------------------------------------------------------------

alter table leads drop constraint goals_not_empty_for_form_leads;
alter table leads add constraint goals_not_empty_for_form_leads check (
  lead_source in ('gymmaster_sweep', 'gymmaster_api')
  or array_length(goals, 1) is not null
);

-- ---------------------------------------------------------------------------
-- Sync log: one row per pull run, so we know when the last successful pull
-- happened (the watermark drives the next run's "created since" window) and
-- can debug failures from live logs.
-- ---------------------------------------------------------------------------

create table gymmaster_sync_log (
  id bigserial primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  -- 'running' while in flight, then 'success' or 'error'.
  status text not null default 'running',
  members_seen int not null default 0,
  leads_created int not null default 0,
  -- created-at of the newest GymMaster member processed in a successful run.
  -- The next run pulls members created after this, so we never rescan the
  -- whole account. Null until the first success.
  watermark timestamptz,
  error text,
  constraint gymmaster_sync_log_status_check
    check (status in ('running', 'success', 'error'))
);

create index gymmaster_sync_log_success_idx
  on gymmaster_sync_log (finished_at desc)
  where status = 'success';

comment on table gymmaster_sync_log is
  'Audit trail for the GymMaster Phase 1 pull cron. The latest success row''s watermark is the "created since" cursor for the next run.';

-- The service-role cron reads and writes this table, bypassing RLS. Enable RLS
-- with no policies so it is never reachable from an anon or trainer client.
alter table gymmaster_sync_log enable row level security;
