-- Development goals and the coaching conversation around them.
--
-- ---------------------------------------------------------------------------
-- Numbering: depends on 0013_staff_role.sql
-- ---------------------------------------------------------------------------
-- Nothing here references the `staff` role directly, but the feature is only
-- reachable by staff and their manager, and both tables key on `trainer_id`
-- the same way the onboarding and document tables do. Keying on trainer_id
-- rather than on the role means these carry across a promotion untouched: a
-- staff member who becomes a trainer keeps every goal and every note.
--
-- ---------------------------------------------------------------------------
-- The design rule this schema enforces
-- ---------------------------------------------------------------------------
-- A goal belongs to the person who set it. Staff write their own goals and are
-- the only ones who can change them. The manager guides and critiques in a
-- conversation underneath, and CANNOT edit the goal text. That is deliberate:
-- a coach who rewrites your goal has taken it off you.
--
-- The RLS below is what actually enforces it. There is no manager write policy
-- on development_goals. If a manager wants a goal changed they say so in the
-- conversation and the staff member changes it.
--
-- The notes are a coaching record, so neither side can edit or delete the
-- other's words either.
--
-- ---------------------------------------------------------------------------
-- Safe to run twice.
-- ---------------------------------------------------------------------------
-- Every statement below is idempotent: the enum creation swallows
-- duplicate_object, the tables and indexes use `if not exists`, and each
-- policy is dropped before it is created. Re-running the whole file on a
-- database that already has it is a no-op rather than an error.
--
-- This is not decoration. The first version errored with
-- `type "development_goal_status" already exists` on a second run, which tells
-- you nothing about whether the FIRST run finished — the failing statement is
-- the first one in the file either way. A migration you cannot safely re-run
-- turns "did this apply?" into a guess, and this project has already lost days
-- to exactly that guess with 0006. Run
-- `supabase/reconcile/01_audit_live_schema.sql` to answer it properly.
--
-- Safe to run in one go; unlike 0013 there is no enum value being added and
-- used in the same transaction.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
-- Deliberately three states with no "overdue" and no failure state. A goal
-- that goes red teaches people to stop setting goals. Parked is a legitimate
-- place for a goal to sit, and carries no penalty.

do $$ begin
  create type development_goal_status as enum ('active', 'achieved', 'parked');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- development_goals
-- ---------------------------------------------------------------------------

create table if not exists development_goals (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers (id) on delete cascade,
  title text not null,
  detail text not null default '',
  status development_goal_status not null default 'active',
  -- Optional on purpose. A date helps some goals and quietly harms others.
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  achieved_at timestamptz,

  -- Lets development_notes carry a composite foreign key, so a comment can
  -- never be filed against a goal belonging to somebody else.
  unique (id, trainer_id)
);

create index if not exists development_goals_trainer_idx on development_goals (trainer_id, status);

comment on table development_goals is
  'Self-authored development goals. Only the owner may write; the manager reads and responds in development_notes.';
comment on column development_goals.target_date is
  'Optional. Absence of a date is a normal state, not an incomplete goal.';

-- ---------------------------------------------------------------------------
-- development_notes
-- ---------------------------------------------------------------------------
-- One table serves both conversations:
--   goal_id null  -> a check-in on the person as a whole
--   goal_id set   -> a comment on that one goal
--
-- Keeping them together means "when was this person last checked in on" is a
-- single query over one table, which is the number the manager's list is built
-- around.

create table if not exists development_notes (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers (id) on delete cascade,
  goal_id uuid,
  body text not null,
  author_id uuid not null references auth.users (id),
  created_at timestamptz not null default now(),

  -- A goal comment must belong to the same person as the goal it is on.
  constraint development_notes_goal_fk
    foreign key (goal_id, trainer_id)
    references development_goals (id, trainer_id)
    on delete cascade
);

create index if not exists development_notes_trainer_idx on development_notes (trainer_id, created_at desc);
create index if not exists development_notes_goal_idx on development_notes (goal_id, created_at);

comment on column development_notes.goal_id is
  'Null for a check-in on the person; set for a comment on that goal. The composite FK ties a goal comment to the goal owner.';

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table development_goals enable row level security;
alter table development_notes enable row level security;

-- Goals: the owner reads and writes. The manager reads only.
--
-- There is deliberately NO manager write policy here. Do not add one without
-- deciding to change the coaching model: the ownership of a goal is the point
-- of the feature, and RLS is where it is guaranteed rather than in the UI.

drop policy if exists development_goals_select on development_goals;
create policy development_goals_select on development_goals
  for select to authenticated
  using (trainer_id = my_trainer_id() or is_manager());

drop policy if exists development_goals_write_own on development_goals;
create policy development_goals_write_own on development_goals
  for all to authenticated
  using (trainer_id = my_trainer_id())
  with check (trainer_id = my_trainer_id());

-- Notes: both sides read the whole thread and both sides may post.
-- `author_id = auth.uid()` means nobody can post in someone else's name.

drop policy if exists development_notes_select on development_notes;
create policy development_notes_select on development_notes
  for select to authenticated
  using (trainer_id = my_trainer_id() or is_manager());

drop policy if exists development_notes_insert on development_notes;
create policy development_notes_insert on development_notes
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and (trainer_id = my_trainer_id() or is_manager())
  );

-- Editing and deleting are limited to your own words, in both directions. A
-- manager cannot quietly remove a staff member's reply, and a staff member
-- cannot remove the critique they were given.

drop policy if exists development_notes_update_own on development_notes;
create policy development_notes_update_own on development_notes
  for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists development_notes_delete_own on development_notes;
create policy development_notes_delete_own on development_notes
  for delete to authenticated
  using (author_id = auth.uid());
