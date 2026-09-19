# Supabase: migrations, schema, RLS

Live project ref: `fbzearypwpjcyrmdivsz`.

## The rule that generated this file

On 12 August 2026 a hardening migration failed on live with
`42P01: relation "trainer_documents" does not exist`. That table comes from
`0006_trainer_documents.sql`, which `PROJECT_STATUS.md` listed as applied to
live. It was not. `/admin/compliance` and `/admin/documents` had been broken in
production since the compliance feature shipped, and nobody had reported it.

**A migration sitting in `supabase/migrations/` is not evidence that it ran.**
Nothing applies them automatically. They are pasted into the SQL editor by hand,
or applied through the MCP, one at a time, by a person who may have been
interrupted.

## Before asserting anything about the live schema

Run `supabase/reconcile/01_audit_live_schema.sql`. It is read-only and reports
PRESENT/MISSING for every migration's objects. One tool call through the
Supabase MCP's `execute_sql`.

Then update the table in `docs/PROJECT_STATUS.md` **from what the query
returned**, not from what you expected it to say. Roll the "last verified in
full" date at the top of that section when you do.

Expected steady state: everything PRESENT except `0007` and `0008`, the
GymMaster pair on an unmerged branch, which are correctly absent.

If the SQL editor warns *"this query creates a table without enabling Row Level
Security"*, choose **Run without RLS**. It is a text-scan false positive on a
read-only catalog query. "Run and enable RLS" appends a real `alter table` and
executes it against production.

## Before proposing a migration

```
./supabase/reconcile/local_migration_check.sh
```

Builds a throwaway Postgres, applies the whole chain in fresh-setup order, and
audits the result. No network, no credentials. This is what proves an ordering
change is safe before anything is pasted into a live SQL editor — it reproduces
the exact `42P01` above when the hardening migration is numbered `0005`.

Add an assertion for your migration to
`supabase/reconcile/01_audit_live_schema.sql` so it gets checked like the rest.

Numbering: `0005` is permanently retired, and `0007`/`0008` are reserved by the
unmerged GymMaster branch. Numbering has been corrected twice already; check
before you pick one.

## Postgres is available locally

`psql` and `initdb` live at `/usr/lib/postgresql/16/bin`. No network needed.
`initdb` a throwaway cluster in `/tmp`, stub the Supabase objects the migrations
assume (`auth.users`, `auth.uid()`, the `anon` / `authenticated` / `service_role`
roles, `storage.buckets`, `storage.objects`, `storage.foldername()`), then apply
`supabase/migrations/*.sql` in order. `local_supabase_stub.sql` already has the
stubs.

**Run it as the `postgres` OS user.** `initdb` refuses to run as root, which is
the single thing that makes this look impossible at first glance.

## Testing RLS as a real user

Not just a syntax check. Inside a transaction you can become a real signed-in
user and read back what they would actually see:

```sql
begin;
  select set_config('request.jwt.claims', '{"sub":"<a real profiles.id>"}', true);
  set local role authenticated;
  -- now query as that user
rollback;
```

Always inside `begin; … rollback;`. This is what caught the `PUBLIC`-grant bug
in `0010`'s revoke.

Roles live in `profiles` (`manager` / `trainer`). Managers see and allocate all
leads; trainers see only their own. RLS enforces it at the database level, so
testing it at the database level is the honest test.

## Migrations that land around a deploy

The ordering constraint that drove the whole August reconciliation: deployed
code calls `submit_form_lead()`, which PART A creates, so **PART A had to
precede the deploy**. PART B removes anon's direct insert, which the *old* code
still needed, so **PART B had to follow it**. Get either backwards and the
public form goes down.

The general shape, and the reason it works:

1. Audit. Apply only what is genuinely MISSING, in number order.
2. Re-audit. Exercise the live site for the thing no SQL query can prove — the
   August run uploaded, viewed and deleted a real document.
3. Apply the additive half of the migration. Deploy. **Submit a real test
   record through the live site while the old path is still there as a net.**
4. Apply the destructive half. Test again *within the minute*, because that is
   the moment the net is gone.
5. Re-audit, confirm, delete the test records, update the status doc.

`supabase/reconcile/README.md` is the worked version of this with rollback SQL.

## Storage buckets

`0006` creates the private `trainer-documents` bucket and its three
`storage.objects` policies itself. Some projects block writes to the `storage`
schema from the SQL editor; if that happens, create the bucket by hand (Public
**OFF**) and run `02_storage_bucket_fallback.sql`, which is idempotent.

## Half-applied migrations

If the audit shows a migration partly present — enums PRESENT, tables MISSING —
do not paste the file whole. It will stop at the first `create type` that
already exists. Delete the statements for the objects the audit reported PRESENT
and run the rest.
