-- PT onboarding dashboard: per-trainer activity responses and part progress.
-- Content (the workbook text itself) lives in code (src/lib/onboarding), not
-- the database. These tables hold only what a trainer writes in, matching
-- the read-your-own-answers, managers-see-progress shape of the rest of the
-- app.

create table onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers (id) on delete cascade,
  part_number int not null,
  activity_key text not null,
  response text not null default '',
  updated_at timestamptz not null default now(),
  unique (trainer_id, part_number, activity_key)
);

create index onboarding_responses_trainer_idx on onboarding_responses (trainer_id, part_number);

comment on column onboarding_responses.activity_key is
  'Stable slug for one fill-in prompt within a part, matching the id in src/lib/onboarding/content.ts.';

create table onboarding_part_status (
  trainer_id uuid not null references trainers (id) on delete cascade,
  part_number int not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'complete')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (trainer_id, part_number)
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table onboarding_responses enable row level security;
alter table onboarding_part_status enable row level security;

-- A trainer reads and writes only their own answers. Managers can read
-- everyone's, to see how onboarding is progressing, but never write a
-- trainer's answers for them.
create policy onboarding_responses_select on onboarding_responses
  for select to authenticated
  using (trainer_id = my_trainer_id() or is_manager());

create policy onboarding_responses_write_own on onboarding_responses
  for all to authenticated
  using (trainer_id = my_trainer_id())
  with check (trainer_id = my_trainer_id());

create policy onboarding_part_status_select on onboarding_part_status
  for select to authenticated
  using (trainer_id = my_trainer_id() or is_manager());

create policy onboarding_part_status_write_own on onboarding_part_status
  for all to authenticated
  using (trainer_id = my_trainer_id())
  with check (trainer_id = my_trainer_id());
