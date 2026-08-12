# Handoff: Reconcile the live database (BLOCKER, do this before more schema work)

Read `docs/PROJECT_STATUS.md` first, then this.

**Status: the repo-side work is done. The live-database work is not, and cannot
be done from a Claude session** — build workspaces have no outbound network to
Supabase. Someone has to sit at the Supabase SQL editor and work through
[`supabase/reconcile/README.md`](../supabase/reconcile/README.md).

## What was discovered (12 Aug 2026 session)

Running PART A of the public-access hardening against the live Supabase failed
with `42P01: relation "trainer_documents" does not exist`. That table is created
by `0006_trainer_documents.sql`, which `PROJECT_STATUS.md` listed as **applied to
live — but it is not.** So the "migrations applied to live" list was not
trustworthy, and the real live schema has to be checked directly rather than read
off the doc.

## Impact

- **`/admin/compliance` and `/admin/documents` are broken on the live site** —
  the deployed code queries `trainer_documents`, which doesn't exist in the DB.
  This is still true until step 2 of the runbook is done.
- The security hardening migration references `trainer_documents`, so it cannot
  fully run until `0006` is applied.

## Done in the repo (branch `claude/reconcile-database-security-deploy-01sf2h`)

1. **Merged the security hardening work** from
   `claude/security-merge-pending-parta` (which in turn carried
   `claude/security-hardening-validation-0ry4cz`). Clean merge, no conflicts.
2. **Renumbered the hardening migration `0005` → `0009`.** It rewrites a policy
   on `trainer_documents`, so it has to run after `0006`; as `0005` it would fail
   on any fresh setup. `0009` was chosen over `0007` so GymMaster's already-written
   `0007`/`0008` did not need renumbering. `0005` is now retired, not reserved.
   The rationale is recorded in the migration's own header so it can't be
   "tidied up" back to 0005 later.
3. **Fixed every stale number** in `PROJECT_STATUS.md` and
   `handoff-security-hardening.md` (both had `0005`; the latter also had leftover
   `0007` references from an earlier renumber).
4. **Wrote `supabase/reconcile/`** — the audit query, an idempotent storage
   fallback for `0006`, and the step-by-step runbook with rollback SQL.
5. **Made the status doc honest.** The Database section is now a table with an
   explicit "On live?" column, headed by a warning that the list is a claim and
   the audit query is the evidence. Added a matching entry to the "hard-won
   gotchas" list, since that is where a future session will actually look.

## Left to do — needs a human at the Supabase SQL editor

Work through [`supabase/reconcile/README.md`](../supabase/reconcile/README.md).
In short:

1. Run `01_audit_live_schema.sql` and keep the output.
2. Apply whatever it reports missing, in number order — expected to be `0006`.
   Confirm `/admin/compliance` and `/admin/documents` come back to life.
3. Run PART A of `0009_public_access_hardening.sql` (lines 1–282).
4. Merge `claude/reconcile-database-security-deploy-01sf2h` into
   `claude/fitaz-gym-pt-leads-76ffhv` to deploy, then submit a real test lead
   through the live form while the old insert path is still there as a net.
5. Run PART B (line 283 to the end).
6. Re-run the audit, submit one more test lead, confirm
   `…/rest/v1/trainers?select=email` is closed to the anon key, delete the test
   leads, and set the "On live?" column in `PROJECT_STATUS.md` from the audit
   output.

**Do not merge the branch before step 3.** The deployed code calls
`submit_form_lead()`, which PART A creates. Deploying first breaks the public
form.

## Note on the storage bucket

`0006` creates the private `trainer-documents` bucket and its three
`storage.objects` policies itself, at the bottom of the file — no separate manual
step in the normal case. Some Supabase projects block writes to the `storage`
schema from the SQL editor; if that happens, make the bucket by hand (Public OFF)
and run `supabase/reconcile/02_storage_bucket_fallback.sql`, which is idempotent.

## Safe shortcut if you only want the form hardening now

Three of the four hardening blocks — trainer PII column grants, the
`status_history` soft-delete guard, and the `submit_form_lead` RPC — do **not**
depend on `trainer_documents` and only touch `0001` objects. Block 3 (the
`trainer_documents_insert` policy) is the only part that needs `0006`. So the
public-facing hardening can go ahead of the reconciliation if there is a reason to
rush it. There isn't an obvious one, and doing the reconciliation first is cleaner
— it also un-breaks two production screens.
