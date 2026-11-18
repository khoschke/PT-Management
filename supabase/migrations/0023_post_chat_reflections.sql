-- Post-chat reflections (Part 7 amendments, item 18; Karl, 18 Nov 2026).
--
-- After a sales chat (a lead moving on from Attended), the trainer gets an
-- optional prompt in the lead panel: how it went, where it stalled, which
-- certainty was missing, and one line on what they'd do differently, typed or
-- spoken. Saved against the lead. The trainer sees their own; the PT Manager
-- sees everyone's, on the lead and as patterns on /admin/metrics, for coaching
-- in the fortnightly development sessions.
--
-- One row per lead. Skipping the prompt saves a row with skipped = true, so it
-- isn't asked again. Only text is stored, never audio: speech is turned into
-- text on the trainer's phone, and these chats include health and money
-- details.
--
-- Trainers can add a reflection only to a lead allocated to them, and can't
-- edit or delete one afterwards. The PT Manager can read all and delete.
--
-- Safe to re-run.

create table if not exists post_chat_reflections (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references leads (id) on delete cascade,
  trainer_id uuid references trainers (id),
  created_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  skipped boolean not null default false,
  feel text check (feel in ('well', 'mixed', 'tough')),
  stalled_at text check (stalled_at in ('nowhere', 'engage', 'frame', 'summarise', 'plan', 'recommend', 'price', 'frequency', 'other')),
  missing_certainty text check (missing_certainty in ('none', 'emotional', 'logical', 'self_belief')),
  next_time text check (length(next_time) <= 2000),
  constraint answered_unless_skipped check (skipped or feel is not null)
);

create index if not exists post_chat_reflections_trainer_idx on post_chat_reflections (trainer_id, created_at);

alter table post_chat_reflections enable row level security;

drop policy if exists post_chat_reflections_select_manager on post_chat_reflections;
create policy post_chat_reflections_select_manager on post_chat_reflections
  for select to authenticated using (is_manager());

drop policy if exists post_chat_reflections_select_trainer on post_chat_reflections;
create policy post_chat_reflections_select_trainer on post_chat_reflections
  for select to authenticated using (my_role() = 'trainer' and trainer_id = my_trainer_id());

drop policy if exists post_chat_reflections_insert on post_chat_reflections;
create policy post_chat_reflections_insert on post_chat_reflections
  for insert to authenticated with check (
    created_by = auth.uid()
    and exists (
      select 1 from leads l
       where l.id = lead_id and l.deleted_at is null
         and l.allocated_trainer_id = post_chat_reflections.trainer_id
         and (is_manager() or (my_role() = 'trainer' and l.allocated_trainer_id = my_trainer_id()))
    )
  );

drop policy if exists post_chat_reflections_delete_manager on post_chat_reflections;
create policy post_chat_reflections_delete_manager on post_chat_reflections
  for delete to authenticated using (is_manager());

revoke all on post_chat_reflections from anon;
