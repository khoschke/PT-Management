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
-- Why this is written as `union all` and not a CTE
-- ---------------------------------------------------------------------------
-- The obvious form of this query is `with checks(migration, item, present) as
-- (values ...)`. Don't. The Supabase SQL editor's safety linter reads that
-- `checks(col, col, col)` header as a CREATE TABLE and warns that the query
-- "creates a table without enabling Row Level Security", naming whichever table
-- it saw mentioned. The warning is a false positive, but the remedy it offers
-- is not harmless: accepting it appends a real `alter table ... enable row
-- level security` to the SQL and runs it against the live database.
--
-- A read-only audit must not put anyone in the position of declining a safety
-- prompt on production, so the column-list syntax is avoided entirely. Keep it
-- that way.

select
  migration,
  item,
  case when present then 'PRESENT' else 'MISSING' end as state
from (

  -- 0001_init --------------------------------------------------------------
  select '0001' as migration, 'table trainers' as item,
    to_regclass('public.trainers') is not null as present
  union all select '0001', 'table leads',
    to_regclass('public.leads') is not null
  union all select '0001', 'table status_history',
    to_regclass('public.status_history') is not null
  union all select '0001', 'table profiles',
    to_regclass('public.profiles') is not null
  union all select '0001', 'table rate_limit_log',
    to_regclass('public.rate_limit_log') is not null
  union all select '0001', 'function is_manager()',
    to_regprocedure('public.is_manager()') is not null
  union all select '0001', 'function my_trainer_id()',
    to_regprocedure('public.my_trainer_id()') is not null
  union all select '0001', 'function check_form_rate_limit(text)',
    to_regprocedure('public.check_form_rate_limit(text)') is not null

  -- 0002_onboarding --------------------------------------------------------
  union all select '0002', 'table onboarding_responses',
    to_regclass('public.onboarding_responses') is not null
  union all select '0002', 'table onboarding_part_status',
    to_regclass('public.onboarding_part_status') is not null

  -- 0003_trainer_bio -------------------------------------------------------
  union all select '0003', 'column trainers.bio',
    exists (select 1 from information_schema.columns
            where table_schema = 'public' and table_name = 'trainers'
              and column_name = 'bio')

  -- 0004_trainer_am_pm -----------------------------------------------------
  union all select '0004', 'column trainers.available_am',
    exists (select 1 from information_schema.columns
            where table_schema = 'public' and table_name = 'trainers'
              and column_name = 'available_am')
  union all select '0004', 'column trainers.available_pm',
    exists (select 1 from information_schema.columns
            where table_schema = 'public' and table_name = 'trainers'
              and column_name = 'available_pm')
  -- 0004 also DROPS the old enum column. This row is inverted on purpose:
  -- PRESENT here means "the old column is gone", i.e. 0004 finished.
  union all select '0004', 'old column trainers.availability dropped',
    not exists (select 1 from information_schema.columns
                where table_schema = 'public' and table_name = 'trainers'
                  and column_name = 'availability')

  -- 0006_trainer_documents -------------------------------------------------
  -- Listed as applied in PROJECT_STATUS on 12 Aug 2026 but it was NOT.
  -- The enums are checked separately from the tables so a half-applied
  -- migration is visible rather than guessed at.
  union all select '0006', 'enum document_expiry_rule',
    to_regtype('public.document_expiry_rule') is not null
  union all select '0006', 'enum document_status',
    to_regtype('public.document_status') is not null
  union all select '0006', 'table document_types',
    to_regclass('public.document_types') is not null
  union all select '0006', 'table trainer_documents',
    to_regclass('public.trainer_documents') is not null
  union all select '0006', 'table document_reminders',
    to_regclass('public.document_reminders') is not null
  union all select '0006', 'storage bucket trainer-documents',
    exists (select 1 from storage.buckets where id = 'trainer-documents')
  union all select '0006', 'storage policy "trainer documents select"',
    exists (select 1 from pg_policies where schemaname = 'storage'
            and tablename = 'objects' and policyname = 'trainer documents select')
  union all select '0006', 'storage policy "trainer documents insert"',
    exists (select 1 from pg_policies where schemaname = 'storage'
            and tablename = 'objects' and policyname = 'trainer documents insert')
  union all select '0006', 'storage policy "trainer documents delete"',
    exists (select 1 from pg_policies where schemaname = 'storage'
            and tablename = 'objects' and policyname = 'trainer documents delete')

  -- 0007 / 0008 GymMaster (unmerged branch — expected MISSING) -------------
  union all select '0007', 'lead_source value gymmaster_api',
    exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
            where t.typname = 'lead_source' and e.enumlabel = 'gymmaster_api')
  union all select '0008', 'column leads.gymmaster_member_id',
    exists (select 1 from information_schema.columns
            where table_schema = 'public' and table_name = 'leads'
              and column_name = 'gymmaster_member_id')

  -- 0009_public_access_hardening, PART A -----------------------------------
  -- Inverted: PRESENT means anon can NO LONGER read trainers.email.
  --
  -- `privilege_type = 'SELECT'` is load-bearing. Supabase's default grants
  -- give anon INSERT/UPDATE/DELETE on public tables as well (RLS is what
  -- actually stops the writes — there is no write policy for anon on
  -- trainers), and block 1 of 0009 only revokes SELECT. Without this filter
  -- the check matches anon's leftover INSERT privilege on `email` and reports
  -- a failure on a database that is correctly hardened.
  union all select '0009-A', 'anon cannot select trainers.email',
    not exists (select 1 from information_schema.column_privileges
                where grantee = 'anon' and table_schema = 'public'
                  and table_name = 'trainers' and column_name = 'email'
                  and privilege_type = 'SELECT')
  union all select '0009-A', 'anon can still select trainers.name',
    exists (select 1 from information_schema.column_privileges
            where grantee = 'anon' and table_schema = 'public'
              and table_name = 'trainers' and column_name = 'name'
              and privilege_type = 'SELECT')
  union all select '0009-A', 'status_history_select_trainer filters deleted_at',
    exists (select 1 from pg_policies
            where schemaname = 'public' and tablename = 'status_history'
              and policyname = 'status_history_select_trainer'
              and qual like '%deleted_at%')
  union all select '0009-A', 'trainer_documents_insert pins status/verified_by',
    exists (select 1 from pg_policies
            where schemaname = 'public' and tablename = 'trainer_documents'
              and policyname = 'trainer_documents_insert'
              and with_check like '%verified_by%')
  union all select '0009-A', 'function submit_form_lead(...)',
    to_regprocedure('public.submit_form_lead(text,text,text,text,date,text[],text,text,text,text,uuid,text)') is not null

  -- 0009_public_access_hardening, PART B -----------------------------------
  -- Both inverted, and both EXPECTED to read MISSING until the app code
  -- calling submit_form_lead() is deployed and PART B has been run.
  union all select '0009-B', 'policy leads_insert_public_form removed',
    not exists (select 1 from pg_policies
                where schemaname = 'public' and tablename = 'leads'
                  and policyname = 'leads_insert_public_form')
  union all select '0009-B', 'anon cannot insert into leads',
    not exists (select 1 from information_schema.role_table_grants
                where grantee = 'anon' and table_schema = 'public'
                  and table_name = 'leads' and privilege_type = 'INSERT')

) checks
order by migration, item;
