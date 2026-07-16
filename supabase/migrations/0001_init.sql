-- Fitaz Gym complimentary PT session lead system
-- Initial schema: trainers, leads, status history, profiles, rate limiting.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type trainer_gender as enum ('male', 'female');
create type trainer_availability as enum ('AM', 'PM', 'both');
create type lead_source as enum ('form', 'gymmaster_sweep');
create type lead_status as enum (
  'New',
  'Allocated',
  'Contacted',
  'Booked',
  'Completed',
  'Not interested',
  'Unreachable'
);
create type gender_preference as enum ('male', 'female', 'no_preference');
create type time_preference as enum ('AM', 'PM', 'either');
create type app_role as enum ('manager', 'trainer');

-- ---------------------------------------------------------------------------
-- trainers
-- ---------------------------------------------------------------------------

create table trainers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  gender trainer_gender not null,
  specialties text[] not null default '{}',
  availability trainer_availability not null default 'both',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on column trainers.specialties is 'Goal codes, matching the options offered in lead.goals.';
comment on column trainers.active is 'Deactivating hides a trainer from the public form without touching their history.';

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------

create table leads (
  id uuid primary key default gen_random_uuid(),

  -- form fields. Only name and phone are required: sweep leads entered by
  -- hand from GymMaster often start with just those two.
  name text not null,
  phone text not null,
  email text,
  date_of_birth date,
  goals text[] not null default '{}',
  goal_other text,
  current_exercise text,
  gender_preference gender_preference,
  time_preference time_preference,
  preferred_trainer_id uuid references trainers (id),
  contact_preference text,

  -- pipeline fields
  lead_source lead_source not null default 'form',
  allocated_trainer_id uuid references trainers (id),
  status lead_status not null default 'New',
  notes text,

  -- timing
  created_at timestamptz not null default now(),
  first_contact_due_at timestamptz generated always as (created_at + interval '48 hours') stored,
  first_contacted_at timestamptz,

  -- housekeeping
  created_by uuid references auth.users (id),
  ip_hash text,
  deleted_at timestamptz,

  constraint goals_not_empty_for_form_leads check (
    lead_source = 'gymmaster_sweep' or array_length(goals, 1) is not null
  )
);

comment on column leads.contact_preference is 'Field 10: best way and time to reach them, quoted plainly for the PT.';
comment on column leads.ip_hash is 'Salted hash of the submitting IP, kept for abuse tracing only. Never the raw address.';
comment on column leads.deleted_at is 'Soft delete. A manager can hard delete separately for a removal request.';

create index leads_status_idx on leads (status) where deleted_at is null;
create index leads_allocated_trainer_idx on leads (allocated_trainer_id) where deleted_at is null;
create index leads_source_idx on leads (lead_source);
create index leads_first_contact_due_idx on leads (first_contact_due_at) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- status_history
-- ---------------------------------------------------------------------------

create table status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  old_status lead_status,
  new_status lead_status not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users (id)
);

create index status_history_lead_idx on status_history (lead_id, changed_at);

-- ---------------------------------------------------------------------------
-- profiles (auth role mapping)
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role app_role not null,
  trainer_id uuid references trainers (id),
  full_name text,
  created_at timestamptz not null default now(),
  constraint trainer_role_needs_trainer_id check (
    role = 'manager' or trainer_id is not null
  )
);

-- ---------------------------------------------------------------------------
-- rate_limit_log (public form submission throttling)
-- ---------------------------------------------------------------------------

create table rate_limit_log (
  id bigserial primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_log_ip_idx on rate_limit_log (ip_hash, created_at);

-- ---------------------------------------------------------------------------
-- Helper functions (security definer, used inside RLS policies)
-- ---------------------------------------------------------------------------

create function is_manager()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'manager'
  );
$$;

create function my_trainer_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select trainer_id from profiles where id = auth.uid();
$$;

-- Rate limit check and log, callable by the public form. Returns true if the
-- submission is allowed. Window and limit chosen to stop a script hammering
-- the form while leaving genuine multi-submission (shared foyer devices) alone.
create function check_form_rate_limit(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
begin
  select count(*) into recent_count
  from rate_limit_log
  where ip_hash = p_ip_hash
    and created_at > now() - interval '10 minutes';

  if recent_count >= 8 then
    return false;
  end if;

  insert into rate_limit_log (ip_hash) values (p_ip_hash);
  return true;
end;
$$;

grant execute on function check_form_rate_limit(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Status history trigger
-- ---------------------------------------------------------------------------

create function record_status_history()
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

    if new.status = 'Contacted' and new.first_contacted_at is null then
      new.first_contacted_at = now();
    end if;
  end if;

  return new;
end;
$$;

create trigger leads_status_history_insert
  after insert on leads
  for each row execute function record_status_history();

create trigger leads_status_history_update
  before update on leads
  for each row execute function record_status_history();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table trainers enable row level security;
alter table leads enable row level security;
alter table status_history enable row level security;
alter table profiles enable row level security;
alter table rate_limit_log enable row level security;

-- trainers: public and signed-in users see active trainers, managers see all
create policy trainers_select_active on trainers
  for select to anon, authenticated
  using (active = true);

create policy trainers_select_all_manager on trainers
  for select to authenticated
  using (is_manager());

create policy trainers_write_manager on trainers
  for all to authenticated
  using (is_manager())
  with check (is_manager());

-- leads: public can insert a form lead, managers can do anything,
-- trainers can see and update only the leads allocated to them
create policy leads_insert_public_form on leads
  for insert to anon
  with check (
    lead_source = 'form'
    and allocated_trainer_id is null
    and status = 'New'
    and deleted_at is null
  );

create policy leads_insert_manager on leads
  for insert to authenticated
  with check (is_manager());

create policy leads_select_manager on leads
  for select to authenticated
  using (is_manager());

create policy leads_select_trainer on leads
  for select to authenticated
  using (
    not is_manager()
    and allocated_trainer_id = my_trainer_id()
    and deleted_at is null
  );

create policy leads_update_manager on leads
  for update to authenticated
  using (is_manager())
  with check (is_manager());

create policy leads_update_trainer on leads
  for update to authenticated
  using (
    not is_manager()
    and allocated_trainer_id = my_trainer_id()
    and deleted_at is null
  )
  with check (
    not is_manager()
    and allocated_trainer_id = my_trainer_id()
    and deleted_at is null
  );

create policy leads_delete_manager on leads
  for delete to authenticated
  using (is_manager());

-- status_history: read only, scoped the same way as the parent lead
create policy status_history_select_manager on status_history
  for select to authenticated
  using (is_manager());

create policy status_history_select_trainer on status_history
  for select to authenticated
  using (
    not is_manager()
    and exists (
      select 1 from leads
      where leads.id = status_history.lead_id
        and leads.allocated_trainer_id = my_trainer_id()
    )
  );

-- profiles: everyone can read their own profile, managers can read all
create policy profiles_select_own on profiles
  for select to authenticated
  using (id = auth.uid() or is_manager());

create policy profiles_write_manager on profiles
  for all to authenticated
  using (is_manager())
  with check (is_manager());

-- rate_limit_log: no direct client access, only via the security definer
-- function above
