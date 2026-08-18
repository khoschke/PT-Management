# Reconciling the live database — CLOSED, 12 August 2026

**This is history, not a task.** Kept because the failure it describes is worth
not repeating. Read `docs/PROJECT_STATUS.md` for current state.

**Outcome:** `0006` applied to live, then `0009` PART A → deploy → PART B, every
step verified by audit query and by exercising the live site. `/admin/compliance`
and `/admin/documents` work again. Trainer email is off the public internet
(`42501` on `…/rest/v1/trainers?select=email` with the publishable key), while
the form's trainer picker still reads `id, name`. Two real leads went through the
public form, one either side of PART B.

**The lesson, in one line:** a migration sitting in `supabase/migrations/` is not
evidence it ran. Nothing applies them automatically. Run
`supabase/reconcile/01_audit_live_schema.sql` before claiming anything about the
live schema.

## What was discovered (12 Aug 2026 session)

Running PART A of the public-access hardening against the live Supabase failed
with `42P01: relation "trainer_documents" does not exist`. That table is created
by `0006_trainer_documents.sql`, which `PROJECT_STATUS.md` listed as **applied to
live — but it is not.** So the "migrations applied to live" list was not
trustworthy, and the real live schema has to be checked directly rather than read
off the doc.

## Impact at the time (all since resolved)

- **`/admin/compliance` and `/admin/documents` were broken on the live site** —
  the deployed code queried `trainer_documents`, which didn't exist in the DB.
  Nobody had reported it, which says something about how much those screens were
  being used, but it had been true since the compliance feature shipped.
- The security hardening migration references `trainer_documents`, so it could
  not fully run until `0006` was applied.

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

## How it was executed, 12 August 2026

Each step was verified before the next one started, which is the only reason the
ordering hazards never bit:

1. Audited the live schema. `0001`–`0004` all present; `0006` uniformly absent —
   not half-applied, which meant it could go in as one clean paste.
2. Applied `0006` whole, storage block included. Re-audited: all nine rows
   present, bucket and all three storage policies included. Confirmed by
   uploading, viewing and deleting a real document on the live site — the one
   thing no SQL query can prove.
3. Ran PART A. Checked the public form's trainer picker still populated in an
   incognito window, since PART A narrows the exact grant it depends on.
4. Merged to `claude/fitaz-gym-pt-leads-76ffhv` (fast-forward, no conflicts) and
   let Vercel deploy. Submitted a real lead through the live form and confirmed
   it reached `/admin` — proving `submit_form_lead()` worked end to end **while
   the old insert path was still there as a net**.
5. Ran PART B, then immediately submitted a second lead. This is the moment the
   net is gone, so the test happens within the minute, not the next morning.
6. Re-audited (everything present but GymMaster's `0007`/`0008`), confirmed
   `…/rest/v1/trainers?select=email` returns `42501` to the publishable key while
   `?select=id,name` still lists the five PTs, and deleted the test leads.

**The ordering constraint that drove all of it:** the deployed code calls
`submit_form_lead()`, which PART A creates, so PART A had to precede the deploy.
PART B removes anon's direct insert, which the *old* code still needed, so it had
to follow the deploy. Get either backwards and the public form goes down.

## Note on the storage bucket

`0006` creates the private `trainer-documents` bucket and its three
`storage.objects` policies itself, at the bottom of the file — no separate manual
step in the normal case. Some Supabase projects block writes to the `storage`
schema from the SQL editor; if that happens, make the bucket by hand (Public OFF)
and run `supabase/reconcile/02_storage_bucket_fallback.sql`, which is idempotent.

## Note on the branches

`claude/security-merge-pending-parta` and
`claude/security-hardening-validation-0ry4cz` are both fully contained in what
was deployed. They can be deleted. `claude/custom-domain-dns-setup-v45oc6`
remains parked — its DB security findings were re-done fresh as `0009` rather
than merged.
