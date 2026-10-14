-- The PT setup checklist: the operational steps that get a new trainer set up
-- in the business, tracked per trainer.
--
-- ---------------------------------------------------------------------------
-- Numbering: 0017, not 0016
-- ---------------------------------------------------------------------------
-- The build plan for this feature was written on 15 Sep 2026 and said 0016,
-- which was correct that day. `0016_stamp_first_contacted.sql` then merged and
-- went to live while the plan sat awaiting sign-off, so this is 0017. Checked
-- against every remote branch and against the live database rather than
-- against the folder: 0005 stays retired, 0007/0008 stay reserved by the
-- unmerged GymMaster pair, and nothing anywhere numbers 0017.
--
-- This depends on 0001_init.sql for is_manager() and the trainers table, and
-- on nothing else.
--
-- ---------------------------------------------------------------------------
-- This is NOT the onboarding workbook
-- ---------------------------------------------------------------------------
-- The workbook at /onboarding is the 10-part educational journey a trainer
-- works through (0002_onboarding.sql). This is the admin and compliance side:
-- contract, bond, uniform, systems access, profiles, certs, rent. Everything
-- here is named `setup_` rather than `onboarding_` precisely so the two can
-- never be confused in a query, a policy or a grep.
--
-- ---------------------------------------------------------------------------
-- Manager-only, and that is enforced here rather than by a missing screen
-- ---------------------------------------------------------------------------
-- v1 has no trainer-facing view (Karl, 8 Sep 2026). That is a deliberate
-- narrowing of the original scope, not a correction of it.
--
-- The checklist unavoidably touches commercial terms: the bond, the Business
-- Pack and the rent ramp. Read the figure rule in CLAUDE.md. The protection
-- against those reaching a trainer is NOT "nobody built that page". It is:
--
--   1. Every policy below is is_manager(). There is deliberately no
--      `trainer_id = my_trainer_id()` policy on any of these three tables,
--      unlike every other per-trainer table in this schema.
--   2. anon is revoked explicitly, even though RLS already denies it. 0009
--      exists because a column grant nobody had thought about was the actual
--      hole, so the grant is stated rather than assumed.
--   3. `supabase/reconcile/01_audit_live_schema.sql` asserts the NEGATIVE: no
--      policy on any setup table may mention my_trainer_id. That check reads
--      PRESENT while trainers are locked out and fails loudly the day somebody
--      adds a trainer view. Same shape as 0014's "manager cannot write
--      development_goals".
--
-- 0013 is the reason this is written down. There, a UI filter was standing in
-- for a database guarantee and nobody had noticed for weeks.
--
-- Seed labels carry NO dollar figures. The paper checklist reads "Bond Paid
-- (2 weeks rent, GST incl.)" and "Business Pack Paid ($550 GST incl.)"; the
-- amounts live in the PT contract, which is where CLAUDE.md says to point. A
-- manager knows what the Business Pack costs, so storing the figure buys
-- nothing and puts a standard commercial term in a row that a future
-- trainer-facing view would render by default.
--
-- There are no rent amounts anywhere in this schema, and no per-trainer rent
-- figure. The ramp is computed in the app from start_date as week ranges and
-- percentages only. See src/lib/setup.ts.
--
-- ---------------------------------------------------------------------------
-- Safe to run twice
-- ---------------------------------------------------------------------------
-- Every statement is idempotent: the enum swallows duplicate_object, tables
-- and indexes use `if not exists`, the seed is `on conflict (key) do nothing`,
-- and each policy is dropped before it is created. A run that died halfway
-- can simply be run again.
--
-- That is not decoration. 0014's header spells out why: a migration you cannot
-- safely re-run turns "did this apply?" into a guess, and this project lost
-- days to exactly that guess with 0006.
--
-- Safe to run in ONE go. 0013's two-part warning does not apply: that rule is
-- about using a value newly ADDED to an existing enum in the same transaction.
-- setup_item_state is a brand new type, which 0014 already proved commits in a
-- single transaction with development_goal_status.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
-- Three states, not a boolean. The source document has "Fitaz email signature
-- (if applicable)" written into it, so without a not-applicable state that
-- trainer's checklist can never reach complete, which kills the completion
-- signal before it is built. N/A is in the source material, not a flourish.

do $$ begin
  create type setup_item_state as enum ('pending', 'done', 'not_applicable');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- setup_checklist_items — the template
-- ---------------------------------------------------------------------------

create table if not exists setup_checklist_items (
  id uuid primary key default gen_random_uuid(),
  -- Stable slug. Permanent, for the same reason
  -- onboarding_responses.activity_key is: renaming or removing one orphans
  -- what a manager has already recorded against it.
  key text not null unique,
  label text not null,
  -- The parenthetical detail from the paper checklist, rendered as a hint
  -- under the label. Never a dollar figure.
  hint text not null default '',
  sort_order int not null default 100,
  -- Retiring an item hides it from new checklists without orphaning the ticks
  -- already recorded against it. Mirrors document_types.active.
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table setup_checklist_items is
  'Template for the per-trainer PT setup checklist. Manager-only. Seeded by migration; `active` retires an item without orphaning recorded ticks.';
comment on column setup_checklist_items.hint is
  'Detail shown under the label. Never put a rent, bond or Business Pack figure here: those live in the PT contract. See the figure rule in CLAUDE.md.';

-- The 18 items, verbatim from PT_Onboarding_Checklist_.docx via
-- docs/handoff-onboarding-checklist-tracking.md, with the dollar figures
-- removed per the note above.

insert into setup_checklist_items (key, label, hint, sort_order) values
  ('signed_contract',      'Signed contract',                            'All parties signed. File the signed copy under PT Contract in their documents.', 10),
  ('xero_details_sent',    'Details sent to Fitaz Accounts for Xero',    'Full name, mobile number, email address, home address, ABN.',                   20),
  ('bond_paid',            'Bond paid',                                  'The amount and terms are in their PT contract.',                                30),
  ('business_pack_paid',   'Business Pack paid',                         'The amount is in their PT contract.',                                           40),
  ('uniform_ordered',      'Uniform ordered',                            '',                                                                              50),
  ('flyers_ordered',       'Flyers ordered',                             '',                                                                              60),
  ('whatsapp',             'WhatsApp',                                   'Added to the team group.',                                                       70),
  ('gym_master',           'GymMaster set up',                           '',                                                                              80),
  ('google_drive',         'Google Drive set up',                        '',                                                                              90),
  ('profile',              'Profile',                                    'Their GymMaster profile filled in.',                                           100),
  ('profile_pics',         'Profile pics',                               '',                                                                             110),
  ('received_certs',       'Received certs',                             'Qualifications, CPR and first aid, insurances.',                                120),
  ('rent_ezidebit',        'Rent set up in Ezidebit',                    '',                                                                             130),
  ('website_pt_profile',   'Fitaz Gym website PT profile',               '',                                                                             140),
  ('coaches_board',        'Coaches Board profile ordered',              '',                                                                             150),
  ('welcome_announcement', 'Welcome announcement on social media',       '',                                                                             160),
  ('email_signature',      'Fitaz email signature',                      'If applicable. Mark it not applicable if they are not getting one.',           170),
  ('onboarding_program',   'Completed onboarding program',               'The 10-part workbook at /onboarding.',                                         180)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- trainer_setup_checklists — the header, one row per trainer
-- ---------------------------------------------------------------------------
-- start_date deliberately does NOT go on `trainers`. That table is read by
-- anon for the public form's trainer picker, its grants are column-level, and
-- 0009 and 0012 are both scar tissue from getting those grants wrong. Keeping
-- it here puts every field in this feature behind one manager-only boundary
-- instead of two.

create table if not exists trainer_setup_checklists (
  trainer_id uuid primary key references trainers (id) on delete cascade,
  -- The day they started as a PT. Seeded on promotion from staff; editable.
  start_date date,
  -- The paper form's Amendments column: anything that varies for this person.
  amendments text not null default '',
  -- Stamped when every active item is done or not applicable, cleared if one
  -- goes back to pending. Set by the server action, not by a trigger, so the
  -- rule lives next to the code that renders it.
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table trainer_setup_checklists is
  'Per-trainer header for the PT setup checklist: start date, amendments, completion stamp. Manager-only.';
comment on column trainer_setup_checklists.start_date is
  'Drives the rent ramp the setup screen renders. The ramp is week ranges and percentages computed from this date; no amounts are stored anywhere.';

-- ---------------------------------------------------------------------------
-- trainer_setup_checklist_items — the ticks
-- ---------------------------------------------------------------------------
-- A missing row means pending, the same way a missing onboarding_part_status
-- row means not_started. Rows are written on first tick.

create table if not exists trainer_setup_checklist_items (
  trainer_id uuid not null references trainers (id) on delete cascade,
  item_id uuid not null references setup_checklist_items (id) on delete cascade,
  state setup_item_state not null default 'pending',
  -- Per-item note: "waiting on ABN", "ordered 3 Sep".
  note text not null default '',
  updated_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  primary key (trainer_id, item_id)
);

create index if not exists trainer_setup_items_trainer_idx
  on trainer_setup_checklist_items (trainer_id);

comment on table trainer_setup_checklist_items is
  'One row per trainer per ticked setup item. Absence of a row means pending. Records who ticked it and when.';

-- ---------------------------------------------------------------------------
-- Row level security: manager only, on all three
-- ---------------------------------------------------------------------------
-- Read the block at the top of this file before adding a policy here. There is
-- deliberately no my_trainer_id() policy on any of these tables, and the audit
-- query asserts that there is not.

alter table setup_checklist_items enable row level security;
alter table trainer_setup_checklists enable row level security;
alter table trainer_setup_checklist_items enable row level security;

drop policy if exists setup_checklist_items_manager on setup_checklist_items;
create policy setup_checklist_items_manager on setup_checklist_items
  for all to authenticated
  using (is_manager())
  with check (is_manager());

drop policy if exists trainer_setup_checklists_manager on trainer_setup_checklists;
create policy trainer_setup_checklists_manager on trainer_setup_checklists
  for all to authenticated
  using (is_manager())
  with check (is_manager());

drop policy if exists trainer_setup_items_manager on trainer_setup_checklist_items;
create policy trainer_setup_items_manager on trainer_setup_checklist_items
  for all to authenticated
  using (is_manager())
  with check (is_manager());

-- Explicit, even though RLS with no anon policy already denies everything.
-- 0009 exists because the hole was a grant nobody had thought about, so state
-- it rather than rely on the default privileges a future Supabase change could
-- move underneath us.

revoke all on setup_checklist_items from anon;
revoke all on trainer_setup_checklists from anon;
revoke all on trainer_setup_checklist_items from anon;
