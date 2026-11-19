-- Post-chat reflections can be edited by the trainer who wrote them (Karl,
-- 18 Nov 2026). 0023 made them write-once; in testing that meant a typo, or a
-- skipped prompt the trainer later wanted to fill in, couldn't be fixed.
--
-- A trainer can update their own reflection while the lead is still allocated
-- to them. updated_at is stamped on every change. The PT Manager still reads
-- all and can delete; nobody else can edit.
--
-- Safe to re-run.

alter table post_chat_reflections add column if not exists updated_at timestamptz;

create or replace function stamp_reflection_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  -- These identify the reflection and stay as they were.
  new.lead_id = old.lead_id;
  new.trainer_id = old.trainer_id;
  new.created_by = old.created_by;
  new.created_at = old.created_at;
  return new;
end;
$$;

drop trigger if exists post_chat_reflections_stamp_updated on post_chat_reflections;
create trigger post_chat_reflections_stamp_updated
  before update on post_chat_reflections
  for each row execute function stamp_reflection_updated_at();

drop policy if exists post_chat_reflections_update_trainer on post_chat_reflections;
create policy post_chat_reflections_update_trainer on post_chat_reflections
  for update to authenticated
  using (
    my_role() = 'trainer' and trainer_id = my_trainer_id()
    and exists (select 1 from leads l where l.id = lead_id and l.deleted_at is null
                 and l.allocated_trainer_id = my_trainer_id())
  )
  with check (my_role() = 'trainer' and trainer_id = my_trainer_id());
