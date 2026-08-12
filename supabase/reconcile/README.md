# Live database reconciliation + security deploy runbook

Work through this top to bottom in the Supabase SQL editor for project
`fbzearypwpjcyrmdivsz`. Nothing here can be run from a Claude build workspace —
that environment has no outbound network to Supabase, which is exactly how the
schema drifted out of step with `docs/PROJECT_STATUS.md` in the first place.

**Why this exists.** On 12 Aug 2026 PART A of the hardening migration failed on
live with `42P01: relation "trainer_documents" does not exist`. That table comes
from `0006_trainer_documents.sql`, which `PROJECT_STATUS.md` listed as applied.
It was not. So the doc's "applied to live" list is a claim, and
`01_audit_live_schema.sql` is the evidence. Trust the query.

Two consequences that are still live until you finish this runbook:

- `/admin/compliance` and `/admin/documents` are **broken in production** — the
  deployed code queries a table that isn't there.
- The hardening migration can't fully run, because one of its four blocks
  rewrites a policy on `trainer_documents`.

## What's in here

| File | What it's for |
|---|---|
| `01_audit_live_schema.sql` | Read-only. Reports PRESENT/MISSING for every migration's objects. The evidence behind the table in `PROJECT_STATUS.md`. |
| `02_storage_bucket_fallback.sql` | Idempotent bucket + policies for `0006`, for when the SQL editor won't write to the `storage` schema. |
| `local_migration_check.sh` | Dev tool. Runs the whole migration chain against a throwaway local Postgres and audits the result — no network, no credentials. |
| `local_supabase_stub.sql` | The auth/storage/roles stubs the script needs. Never run against live. |

`local_migration_check.sh` is what proves an ordering change is safe *before*
anything is pasted into the live SQL editor. Run against this branch it applies
`0001 → 0002 → 0003 → 0004 → 0006 → 0009` clean and audits all PRESENT; with the
hardening migration back at `0005` it dies on
`42P01: relation "trainer_documents" does not exist` — the same error the live
attempt hit. That reproduction is why the file is numbered `0009`.

---

## Step 1 — Audit what is actually there

Run [`01_audit_live_schema.sql`](01_audit_live_schema.sql). Read-only, changes
nothing.

Expected on a correctly-migrated-but-not-yet-hardened database:

| Rows | Expected |
|---|---|
| `0001`–`0004` | all `PRESENT` |
| `0006` | all `PRESENT` **after** step 2 — likely all `MISSING` right now |
| `0007`, `0008` | `MISSING` (GymMaster is an unmerged branch — correct) |
| `0009-A`, `0009-B` | `MISSING` right now |

Keep the output. Steps 2 and 4 both end by re-running this same query, and the
final run is what makes `PROJECT_STATUS.md` honest.

## Step 2 — Apply the genuinely missing migrations

Only whatever step 1 reported `MISSING`, in number order. In practice that means
`0006`.

1. Paste [`../migrations/0006_trainer_documents.sql`](../migrations/0006_trainer_documents.sql)
   in whole and run it.
2. **If step 1 showed 0006 half-applied** — e.g. the enums `PRESENT` but the
   tables `MISSING` — do not paste it whole; it will stop at the first
   `create type` that already exists. Delete the statements for the objects the
   audit reported `PRESENT` and run the rest.
3. **If the storage block at the bottom errors** (some projects refuse writes to
   the `storage` schema from the SQL editor), create the bucket by hand —
   Storage > New bucket, name `trainer-documents`, **Public OFF** — then run
   [`02_storage_bucket_fallback.sql`](02_storage_bucket_fallback.sql), which is
   idempotent and safe to re-run.

Re-run `01_audit_live_schema.sql`. Every `0006` row must read `PRESENT` before
you go on. Then load `/admin/compliance` and `/admin/documents` on the live
site — both should stop erroring, and a test upload should land in the bucket.

## Step 3 — Hardening PART A

Open [`../migrations/0009_public_access_hardening.sql`](../migrations/0009_public_access_hardening.sql).
Run **only lines 1–282**, ending just before the `PART B` banner.

PART A is additive and safe against the code that is deployed right now: it
tightens column grants and two policies, and it *creates* `submit_form_lead()`
without yet removing the old insert path. The live form keeps working.

Re-run the audit. All five `0009-A` rows should now read `PRESENT`. The
`0009-B` rows should still read `MISSING` — that is the point.

## Step 4 — Deploy the code

Merge `claude/reconcile-database-security-deploy-01sf2h` into
`claude/fitaz-gym-pt-leads-76ffhv`, which auto-deploys on Vercel.

Wait for the deployment to go green before step 5, and confirm it actually
deployed — Vercel auto-deploy can silently stall, and an empty commit re-triggers
it. Then **submit a real test lead through <https://pt.fitazgym.com/pt-session>**.
This is the step that proves `submit_form_lead()` works end to end while the old
insert path is still available as a safety net. Do not skip it: step 5 removes
that net.

## Step 5 — Hardening PART B

Only once step 4's test lead has landed. Run **lines 283 to the end** of
`0009_public_access_hardening.sql` — the `PART B` banner down.

This drops anon's direct `INSERT` on `leads` and revokes the now-redundant
`check_form_rate_limit`. Running it before the deploy takes the public form
down: the old code would have neither the direct insert nor the new RPC.

## Step 6 — Verify and record

1. Re-run `01_audit_live_schema.sql`. Everything except the `0007`/`0008`
   GymMaster rows should read `PRESENT`.
2. Submit one more test lead through the live form — it now has no path other
   than the RPC.
3. Check trainer PII is closed, using the **public anon key**:
   `…/rest/v1/trainers?select=email` must fail, and
   `…/rest/v1/trainers?select=id,name` must still work (the form's trainer
   picker depends on it).
4. Delete the test leads from `/admin`.
5. Update the applied-to-live table in `docs/PROJECT_STATUS.md` from the audit
   output — from what the query returned, not from what you expect it to say.

## If something goes wrong

- **PART A fails partway.** Each block is independent; fix the failing block and
  re-run from there. `create or replace function` and the `drop policy` /
  `create policy` pairs are all safe to re-run.
- **The public form breaks after PART B.** Fastest rollback is to restore the
  old path, then diagnose off the live site:
  ```sql
  grant insert on leads to anon;
  create policy leads_insert_public_form on leads
    for insert to anon
    with check (
      lead_source = 'form'
      and allocated_trainer_id is null
      and status = 'New'
      and deleted_at is null
    );
  ```
  Re-run PART B once the cause is found.
- **Column grants look wrong.** `revoke select on trainers from anon;` followed
  by `grant select (id, name, active) on trainers to anon;` is idempotent — just
  run block 1 of PART A again.
