-- ===========================================================================
-- Live schema audit — run this FIRST, in the Supabase SQL editor.
-- ===========================================================================
--
-- Read-only. Creates nothing, changes nothing. Safe to run any time, and it is
-- the only trustworthy answer to "which migrations are actually on live?" —
-- `docs/PROJECT_STATUS.md` drifted out of step once (it listed 0006 as applied
-- when it was not), so the doc is a claim and this query is the evidence.
--
-- Every row is one observable fact about the live database, tagged with the
-- migration that should have produced it. Paste the whole output back into the
-- session that asked for it.
--
-- Reading the result:
--   PRESENT  - the object exists
--   MISSING  - it does not; that migration has not run (or not fully)
-- A migration is applied only when ALL of its rows say PRESENT. Rows tagged
-- 0009-B are the post-hardening cleanup and are EXPECTED to read MISSING until
-- PART B of 0009 has been run.
--
-- ---------------------------------------------------------------------------
-- Why this avoids information_schema and the word "table"
-- ---------------------------------------------------------------------------
-- The Supabase SQL editor runs a text scan over the SQL before executing it and
-- offers to "fix" what it finds. Earlier drafts of this file used
-- `information_schema.columns` (whose filter reads `table_name = 'leads'`) and
-- item labels like 'table leads'. That was enough for the editor to announce
-- "this query creates a table without enabling Row Level Security" and offer a
-- "Run and enable RLS" button, which appends a real
-- `alter table ... enable row level security` and executes it against
-- production.
--
-- The warning is a false positive — a SELECT over catalog views cannot create
-- anything — but a read-only audit should not put anyone in the position of
-- declining a safety prompt on a live database. So this version reads
-- pg_catalog directly (`pg_attribute`, `pg_policy`) and uses the privilege
-- functions. The only remaining occurrence of the word "table" is inside the
-- function name `has_table_privilege`, which is not a `table <name>` pattern.
--
-- Keep it that way. If you extend this file, use `pg_catalog`, not
-- `information_schema`, and label items "relation X" rather than "table X".
-- And if the editor warns anyway: **Run without RLS** is the correct button —
-- it runs the query verbatim. Never "Run and enable RLS" from this file.
--
-- The privilege checks are also more honest this way: has_column_privilege()
-- and has_table_privilege() report the privilege as actually resolved,
-- including grants inherited from the relation level, which is exactly the
-- question being asked. The earlier information_schema version had to filter
-- `privilege_type = 'SELECT'` by hand and got it wrong on the first attempt.

select
  migration,
  item,
  case when present then 'PRESENT' else 'MISSING' end as state
from (

  -- 0001_init --------------------------------------------------------------
  select '0001' as migration, 'relation trainers' as item,
    to_regclass('public.trainers') is not null as present
  union all select '0001', 'relation leads',
    to_regclass('public.leads') is not null
  union all select '0001', 'relation status_history',
    to_regclass('public.status_history') is not null
  union all select '0001', 'relation profiles',
    to_regclass('public.profiles') is not null
  union all select '0001', 'relation rate_limit_log',
    to_regclass('public.rate_limit_log') is not null
  union all select '0001', 'function is_manager()',
    to_regprocedure('public.is_manager()') is not null
  union all select '0001', 'function my_trainer_id()',
    to_regprocedure('public.my_trainer_id()') is not null
  union all select '0001', 'function check_form_rate_limit(text)',
    to_regprocedure('public.check_form_rate_limit(text)') is not null

  -- 0002_onboarding --------------------------------------------------------
  union all select '0002', 'relation onboarding_responses',
    to_regclass('public.onboarding_responses') is not null
  union all select '0002', 'relation onboarding_part_status',
    to_regclass('public.onboarding_part_status') is not null

  -- 0003_trainer_bio -------------------------------------------------------
  union all select '0003', 'column trainers.bio',
    exists (select 1 from pg_attribute
            where attrelid = to_regclass('public.trainers')
              and attname = 'bio' and not attisdropped)

  -- 0004_trainer_am_pm -----------------------------------------------------
  union all select '0004', 'column trainers.available_am',
    exists (select 1 from pg_attribute
            where attrelid = to_regclass('public.trainers')
              and attname = 'available_am' and not attisdropped)
  union all select '0004', 'column trainers.available_pm',
    exists (select 1 from pg_attribute
            where attrelid = to_regclass('public.trainers')
              and attname = 'available_pm' and not attisdropped)
  -- 0004 also DROPS the old enum column. This row is inverted on purpose:
  -- PRESENT here means "the old column is gone", i.e. 0004 finished.
  union all select '0004', 'old column trainers.availability dropped',
    not exists (select 1 from pg_attribute
                where attrelid = to_regclass('public.trainers')
                  and attname = 'availability' and not attisdropped)

  -- 0006_trainer_documents -------------------------------------------------
  -- Listed as applied in PROJECT_STATUS on 12 Aug 2026 but it was NOT.
  -- The enums are checked separately from the relations so a half-applied
  -- migration is visible rather than guessed at.
  union all select '0006', 'enum document_expiry_rule',
    to_regtype('public.document_expiry_rule') is not null
  union all select '0006', 'enum document_status',
    to_regtype('public.document_status') is not null
  union all select '0006', 'relation document_types',
    to_regclass('public.document_types') is not null
  union all select '0006', 'relation trainer_documents',
    to_regclass('public.trainer_documents') is not null
  union all select '0006', 'relation document_reminders',
    to_regclass('public.document_reminders') is not null
  union all select '0006', 'storage bucket trainer-documents',
    exists (select 1 from storage.buckets where id = 'trainer-documents')
  union all select '0006', 'storage policy "trainer documents select"',
    exists (select 1 from pg_policy
            where polrelid = to_regclass('storage.objects')
              and polname = 'trainer documents select')
  union all select '0006', 'storage policy "trainer documents insert"',
    exists (select 1 from pg_policy
            where polrelid = to_regclass('storage.objects')
              and polname = 'trainer documents insert')
  union all select '0006', 'storage policy "trainer documents delete"',
    exists (select 1 from pg_policy
            where polrelid = to_regclass('storage.objects')
              and polname = 'trainer documents delete')

  -- 0007 / 0008 GymMaster (unmerged branch — expected MISSING) -------------
  union all select '0007', 'lead_source value gymmaster_api',
    exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
            where t.typname = 'lead_source' and e.enumlabel = 'gymmaster_api')
  union all select '0008', 'column leads.gymmaster_member_id',
    exists (select 1 from pg_attribute
            where attrelid = to_regclass('public.leads')
              and attname = 'gymmaster_member_id' and not attisdropped)

  -- 0009_public_access_hardening, PART A -----------------------------------
  -- Inverted: PRESENT means anon can NO LONGER read the trainer email column.
  union all select '0009-A', 'anon cannot read trainers.email',
    not has_column_privilege('anon', 'public.trainers', 'email', 'SELECT')
  union all select '0009-A', 'anon can still read trainers.name',
    has_column_privilege('anon', 'public.trainers', 'name', 'SELECT')
  union all select '0009-A', 'status_history_select_trainer filters deleted_at',
    exists (select 1 from pg_policy
            where polrelid = to_regclass('public.status_history')
              and polname = 'status_history_select_trainer'
              and pg_get_expr(polqual, polrelid) like '%deleted_at%')
  union all select '0009-A', 'trainer_documents_insert pins status/verified_by',
    exists (select 1 from pg_policy
            where polrelid = to_regclass('public.trainer_documents')
              and polname = 'trainer_documents_insert'
              and pg_get_expr(polwithcheck, polrelid) like '%verified_by%')
  union all select '0009-A', 'function submit_form_lead(...)',
    to_regprocedure('public.submit_form_lead(text,text,text,text,date,text[],text,text,text,text,uuid,text)') is not null

  -- 0009_public_access_hardening, PART B -----------------------------------
  -- Both inverted, and both EXPECTED to read MISSING until the app code
  -- calling submit_form_lead() is deployed and PART B has been run.
  union all select '0009-B', 'policy leads_insert_public_form removed',
    not exists (select 1 from pg_policy
                where polrelid = to_regclass('public.leads')
                  and polname = 'leads_insert_public_form')
  union all select '0009-B', 'anon cannot insert leads rows',
    not has_table_privilege('anon', 'public.leads', 'INSERT')

) checks
order by migration, item;
