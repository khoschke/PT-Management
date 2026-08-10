-- PT compliance documents: qualifications, CPR/First Aid, insurances and
-- free-text "other" items, uploaded per trainer and tracked to expiry.
--
-- Three tables:
--   document_types      - the list of document kinds, seeded with the standard
--                         set and extendable by the manager. Each type carries
--                         an expiry rule (none / optional / required).
--   trainer_documents   - one row per uploaded file, with its expiry date and
--                         verification status. The file blob itself lives in the
--                         private `trainer-documents` Storage bucket; this table
--                         only holds the metadata and the storage path.
--   document_reminders  - a log of which expiry reminders have gone out, so the
--                         daily cron never double-sends.
--
-- The Storage bucket and its access policies are created at the bottom. If your
-- Supabase project blocks writes to the storage schema from the SQL editor,
-- create the bucket by hand (Storage > New bucket, name `trainer-documents`,
-- Public OFF) and run just the storage.objects policies.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type document_expiry_rule as enum ('none', 'optional', 'required');
create type document_status as enum ('pending', 'verified', 'rejected');

-- ---------------------------------------------------------------------------
-- document_types
-- ---------------------------------------------------------------------------

create table document_types (
  id uuid primary key default gen_random_uuid(),
  -- Stable slug for the four built-in types, null for manager-added custom
  -- types. Used in code to key special behaviour (e.g. "other" needs a label).
  key text unique,
  label text not null,
  expiry_rule document_expiry_rule not null default 'optional',
  active boolean not null default true,
  sort_order int not null default 100,
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

comment on column document_types.key is
  'Slug for the built-in types (qualification, cpr_first_aid, insurance, other). Null for manager-added custom types.';
comment on column document_types.expiry_rule is
  'none: no expiry field shown. optional: expiry allowed but not required. required: expiry must be provided.';

insert into document_types (key, label, expiry_rule, sort_order, is_custom) values
  ('qualification', 'Qualification',   'none',     10, false),
  ('cpr_first_aid', 'CPR / First Aid', 'required', 20, false),
  ('insurance',     'Insurance',       'required', 30, false),
  ('other',         'Other',           'optional', 40, false);

-- ---------------------------------------------------------------------------
-- trainer_documents
-- ---------------------------------------------------------------------------

create table trainer_documents (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references trainers (id) on delete cascade,
  document_type_id uuid not null references document_types (id),
  -- Free-text name for an "Other" document (e.g. "Blue Card", "Working with
  -- Children"). Required when the type is the built-in "other", otherwise null.
  custom_label text,

  -- Storage: path within the `trainer-documents` bucket, plus the original
  -- file details for display and download.
  file_path text not null,
  file_name text not null,
  file_size bigint not null,
  mime_type text not null,

  -- Null when the type's expiry rule is "none", or "optional" and left blank.
  expiry_date date,

  status document_status not null default 'pending',
  rejection_reason text,
  verified_by uuid references auth.users (id),
  verified_at timestamptz,

  uploaded_by uuid references auth.users (id),
  uploaded_at timestamptz not null default now()
);

comment on column trainer_documents.custom_label is
  'Human name for an "Other" document. Required for the built-in "other" type, null otherwise.';
comment on column trainer_documents.status is
  'Trainer uploads land as pending for manager review. Manager uploads are verified on the spot.';

create index trainer_documents_trainer_idx on trainer_documents (trainer_id);
create index trainer_documents_expiry_idx on trainer_documents (expiry_date) where expiry_date is not null;
create index trainer_documents_status_idx on trainer_documents (status);

-- ---------------------------------------------------------------------------
-- document_reminders
-- ---------------------------------------------------------------------------

create table document_reminders (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references trainer_documents (id) on delete cascade,
  -- '60' | '30' | '7' days before expiry, or 'expired' for the daily lapse alert.
  milestone text not null check (milestone in ('60', '30', '7', 'expired')),
  sent_on date not null default current_date,
  created_at timestamptz not null default now()
);

-- Each pre-expiry milestone fires at most once per document, ever.
create unique index document_reminders_milestone_once
  on document_reminders (document_id, milestone)
  where milestone <> 'expired';

-- The expired alert fires at most once per document per day.
create unique index document_reminders_expired_daily
  on document_reminders (document_id, sent_on)
  where milestone = 'expired';

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table document_types enable row level security;
alter table trainer_documents enable row level security;
alter table document_reminders enable row level security;

-- document_types: any signed-in user can read the list (trainers need it to
-- pick a type when uploading); only the manager can change it.
create policy document_types_select on document_types
  for select to authenticated
  using (true);

create policy document_types_write_manager on document_types
  for all to authenticated
  using (is_manager())
  with check (is_manager());

-- trainer_documents: a trainer sees and manages only their own; the manager
-- sees and manages everyone's. Verification (an UPDATE that sets status) is
-- manager-only, so trainers can't approve their own documents: they insert and
-- delete, and replace by deleting and re-uploading.
create policy trainer_documents_select on trainer_documents
  for select to authenticated
  using (trainer_id = my_trainer_id() or is_manager());

create policy trainer_documents_insert on trainer_documents
  for insert to authenticated
  with check (
    is_manager()
    or (trainer_id = my_trainer_id() and uploaded_by = auth.uid())
  );

create policy trainer_documents_update_manager on trainer_documents
  for update to authenticated
  using (is_manager())
  with check (is_manager());

create policy trainer_documents_delete on trainer_documents
  for delete to authenticated
  using (trainer_id = my_trainer_id() or is_manager());

-- document_reminders: written only by the service-role cron (which bypasses
-- RLS). Managers may read the log; nobody else needs it.
create policy document_reminders_select_manager on document_reminders
  for select to authenticated
  using (is_manager());

-- ---------------------------------------------------------------------------
-- Storage bucket + policies
-- ---------------------------------------------------------------------------
-- Private bucket. Files are namespaced by trainer id as the first path segment
-- (`<trainer_id>/<uuid>_<filename>`), which the policies below key off so a
-- trainer can only reach their own folder. Downloads are served through
-- short-lived signed URLs from the app, never public links.

insert into storage.buckets (id, name, public)
values ('trainer-documents', 'trainer-documents', false)
on conflict (id) do nothing;

create policy "trainer documents select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'trainer-documents'
    and (is_manager() or (storage.foldername(name))[1] = my_trainer_id()::text)
  );

create policy "trainer documents insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'trainer-documents'
    and (is_manager() or (storage.foldername(name))[1] = my_trainer_id()::text)
  );

create policy "trainer documents delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'trainer-documents'
    and (is_manager() or (storage.foldername(name))[1] = my_trainer_id()::text)
  );
