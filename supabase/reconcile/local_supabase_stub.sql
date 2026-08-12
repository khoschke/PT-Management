-- Minimal stand-ins for the Supabase-managed objects our migrations reference,
-- so the migration chain can be run against a throwaway local Postgres.
--
-- Used by `local_migration_check.sh`. This is a DEV TOOL — it is never run
-- against the live project, which already has all of this for real.
--
-- It is deliberately just enough to make the migrations parse and execute:
-- the auth/storage schemas, the three Supabase roles, and the handful of
-- functions the policies call. It does not reproduce Supabase's auth logic.

-- Roles are cluster-wide rather than per-database, so guard them.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
end $$;

create schema auth;
create schema storage;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text
);

create function auth.uid() returns uuid
language sql stable as $$
  select current_setting('request.jwt.claim.sub', true)::uuid
$$;

create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text not null,
  owner uuid
);
alter table storage.objects enable row level security;

create function storage.foldername(name text) returns text[]
language sql immutable as $$ select string_to_array(name, '/') $$;

grant usage on schema public, auth, storage to anon, authenticated, service_role;

-- Supabase grants table privileges to anon/authenticated by default; our
-- migrations assume that baseline exists (0009's whole first block is about
-- narrowing it). Reproduce it for tables created after this point.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
