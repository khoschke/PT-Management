-- ===========================================================================
-- Storage fallback for 0006_trainer_documents.sql — run ONLY if needed.
-- ===========================================================================
--
-- `0006_trainer_documents.sql` already creates the `trainer-documents` bucket
-- and its three `storage.objects` policies at the bottom of the file. Use this
-- script only when that tail did not take, which happens in two ways:
--
--   * the project blocks writes to the `storage` schema from the SQL editor,
--     so 0006's storage block errored while the tables above it succeeded; or
--   * someone had already made the bucket by hand (Storage > New bucket,
--     name `trainer-documents`, Public OFF), so `create policy` hit a
--     duplicate and stopped.
--
-- Unlike 0006's tail, this script is idempotent: run it as many times as you
-- like. It never touches the uploaded files themselves, only the bucket row
-- and the access policies.
--
-- It depends on `is_manager()` and `my_trainer_id()` from 0001, and it is
-- pointless without 0006's `trainer_documents` table, so apply 0006 first.

-- Private bucket. Downloads are served through short-lived signed URLs from
-- the app; there are never public links to these files.
insert into storage.buckets (id, name, public)
values ('trainer-documents', 'trainer-documents', false)
on conflict (id) do nothing;

-- Belt and braces: if the bucket was created by hand, whoever made it may have
-- left it public. These files are CPR certificates and insurance documents.
update storage.buckets set public = false
where id = 'trainer-documents' and public is distinct from false;

-- Files are namespaced by trainer id as the first path segment
-- (`<trainer_id>/<uuid>_<filename>`), which is what the policies key off, so a
-- trainer can only reach their own folder and the manager can reach all of them.
-- Dropped first so a re-run replaces rather than collides.

drop policy if exists "trainer documents select" on storage.objects;
create policy "trainer documents select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'trainer-documents'
    and (is_manager() or (storage.foldername(name))[1] = my_trainer_id()::text)
  );

drop policy if exists "trainer documents insert" on storage.objects;
create policy "trainer documents insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'trainer-documents'
    and (is_manager() or (storage.foldername(name))[1] = my_trainer_id()::text)
  );

drop policy if exists "trainer documents delete" on storage.objects;
create policy "trainer documents delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'trainer-documents'
    and (is_manager() or (storage.foldername(name))[1] = my_trainer_id()::text)
  );
