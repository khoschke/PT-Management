# Handoff: Reconcile the live database (BLOCKER, do this before more schema work)

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

## What was discovered (12 Aug 2026 session)

Running PART A of the public-access hardening against the live Supabase failed
with `42P01: relation "trainer_documents" does not exist`. That table is created
by `0006_trainer_documents.sql`, which `PROJECT_STATUS.md` lists as **applied to
live — but it is not.** So the "migrations applied to live" list is not
trustworthy and the real live schema must be checked directly, not read off the doc.

## Impact

- **`/admin/compliance` and `/admin/documents` are broken on the live site** —
  the deployed code queries `trainer_documents`, which doesn't exist in the DB.
- The security hardening migration references `trainer_documents`, so it cannot
  fully run until `0006` is applied.
- The hardening migration is **mis-numbered `0005`** on branch
  `claude/security-merge-pending-parta`. Because it depends on `trainer_documents`
  (created by `0006`), it must be numbered **after** `0006`. `0005`-before-`0006`
  would fail on a fresh setup. Renumber it (the security branch's own note used
  `0007`, pushing GymMaster to `0008/0009`; or use `0009` to leave GymMaster's
  `0007/0008` untouched — either works, just after `0006`).

## To do, in order

1. **Verify the real live schema** in the Supabase SQL editor — don't trust the doc:
   ```sql
   select table_name from information_schema.tables where table_schema = 'public' order by 1;
   select column_name from information_schema.columns
     where table_name = 'trainers' and table_schema = 'public' order by 1;
   ```
   Confirm: `trainer_documents` (0006), `trainers.available_am`/`available_pm`
   (0004), `trainers.bio` (0003). Note which are actually present.
2. **Apply the genuinely-missing migrations to live, in number order.** At least
   `0006_trainer_documents.sql`. Check whether it also needs a Supabase **Storage
   bucket + policies** created (the compliance feature uploads files) — read the
   migration and the feature code before running.
3. **Fix the hardening migration number** on `claude/security-merge-pending-parta`
   (`0005` → after `0006`) and its references in `PROJECT_STATUS.md` and
   `handoff-security-hardening.md`.
4. **Then run the security PART A → deploy → PART B** per
   `handoff-security-hardening.md`, against a now-consistent DB.
5. **Make the status doc honest:** update the "applied to live" list to VERIFIED
   reality and add a standing note that it drifted once and must be kept truthful
   (ideally verified with the query above, not asserted).

## Safe shortcut if you only want the form hardening now

The three public-facing hardening blocks — trainer PII column grants,
`status_history` soft-delete guard, and the `submit_form_lead` RPC — do **not**
depend on `trainer_documents` and can be run independently (they only touch
`0001` objects). The `trainer_documents` policy block is the only part that needs
`0006`. But doing the full reconciliation first is cleaner and avoids more drift.

## Where the work is

- Design pass: merged and deployed (on production).
- Security hardening merge: branch `claude/security-merge-pending-parta`
  (forked from production, migration mis-numbered `0005`). Not on production.
