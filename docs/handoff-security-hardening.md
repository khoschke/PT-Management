# Handoff: Security Hardening (remaining items)

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

A security sweep was run in the custom-domain session (2026-08). Three isolated
fixes have already landed; the heavier items are captured here to pick up in a
fresh session. **Read the caveat below before trusting any finding.**

## ⚠️ Caveat: the original sweep reviewed a stale branch

The sweep was performed on the `claude/custom-domain-dns-setup-v45oc6` branch,
which had forked from production long before and was ~50 commits behind. Some
findings were already fixed in production (e.g. the trainer `availability` enum
was replaced by `available_am`/`available_pm` booleans — see
`handoff-availability-am-pm.md`; branded HTML emails already link the dashboard).

**So: re-validate every item below against *current* production before building.
Do not port code from the stale branch — re-apply fresh.** That branch is parked
and must not be merged (its real deliverable — pt.fitazgym.com + email — is
already live).

## Already done — do NOT redo (branch `claude/security-hardening-csv-ip-cron`, PR to production)

- **CSV formula injection** — `src/lib/csv.ts` now prefixes a quote on cells
  starting with `= + - @` so a member-typed lead field can't run as a formula in
  the manager's spreadsheet export.
- **IP salt** — `src/lib/ip.ts` now throws in production if `IP_HASH_SALT` is
  unset (keeps the dev fallback locally).
- **Cron auth** — `src/app/api/cron/daily-digest/route.ts` now fails closed when
  `CRON_SECRET` is unset and uses a constant-time compare.

## Status: items 1–4 built on `claude/security-hardening-validation-0ry4cz`

Every finding below was re-validated against production (`claude/fitaz-gym-pt-leads-76ffhv`,
merge 2c95593) before anything was written. **All four still applied** — none had
been quietly fixed since the stale sweep. The trainer `email` column was still
readable with the anon key, `status_history_select_trainer` still had no
`deleted_at` clause, `leads_insert_public_form` still gave anon a direct INSERT,
and the manager-only actions still relied on RLS alone.

Built, plus the fresh findings from the "also review" pass below:
`supabase/migrations/0009_public_access_hardening.sql`, `src/lib/cron.ts`,
`src/lib/auth.ts` (`callerIsManager`), and the actions/routes that use them.

### Deploy runbook — the ordering is not optional

`0009_public_access_hardening.sql` is split into PART A and PART B for this.

1. **Reconcile the live DB first.** `0006_trainer_documents.sql` is not on the
   live database, and PART A rewrites a policy on a table `0006` creates, so
   PART A cannot fully run until that is fixed. This is a hard prerequisite, not
   a nicety — it is what the first attempt died on.
2. **Run PART A** in the Supabase SQL editor. Safe against the currently
   deployed code: it only adds `submit_form_lead` and tightens grants/policies
   the public form doesn't depend on. The old insert path keeps working.
3. **Merge to `claude/fitaz-gym-pt-leads-76ffhv`** and let Vercel deploy. The
   form now calls the RPC.
4. **Run PART B.** This drops anon's direct INSERT on `leads` and revokes
   `check_form_rate_limit`. Running it before step 3 takes the live form down —
   the old code would have neither path.

After PART A, check the public form still submits. After PART B, check it again,
and confirm `…/rest/v1/trainers?select=email` with the anon key now 403s.

**`supabase/reconcile/README.md` is the executable version of this list** — same
ordering, with the audit query, the rollback SQL and the per-step verification
filled in. Follow that; this section is the summary.

## The four findings, as built

### 1. Trainer PII readable by the public anon key (Medium)
RLS is row-level, so the "anon can read active trainers" policy also exposes the
`trainers.email` column to anyone using the public Supabase key
(`…/rest/v1/trainers?select=email`). The public form only needs `id, name` (and
filters on `active`). Fix with **column privileges**, not a new policy:
```sql
revoke select on trainers from anon;
grant select (id, name, active) on trainers to anon;
```
Verify first: check the current public form query
(`src/app/pt-session/page.tsx`) and confirm it only reads `id, name`; widen the
grant only if a page genuinely needs more (prefer a dedicated view over the base
table). Managers/trainers use the `authenticated` role and are unaffected.

### 2. Public form rate-limit bypass (Low–Med)
The app enforces the 8-per-10-min limit before inserting, but `anon` also has a
direct `INSERT` policy on `leads`, so a script can POST straight to the REST API
and skip it. Fix: a `security definer` `submit_form_lead(...)` RPC that enforces
a per-IP **and** a global-window cap and inserts atomically (pinning
`lead_source`/`status`), then revoke anon's direct insert. **Re-wire
`src/app/pt-session/actions.ts` against its CURRENT version** (it changed since
the stale branch). Deploy ordering matters:
1. Run the migration section that *creates* the function first.
2. Deploy the code that calls it.
3. Only then run the section that *revokes* the anon insert (or the live form
   breaks in the gap).

### 3. status_history visible for a trainer's soft-deleted leads (Low)
`status_history_select_trainer` doesn't filter `deleted_at`, so a trainer can
read the history of their own soft-deleted leads (the parent lead is already
hidden). Add `and leads.deleted_at is null` to the policy's `exists (…)` clause.

### 4. Explicit manager-role checks (Info / defence-in-depth)
The manager-only dashboard + trainer actions rely solely on RLS. Add explicit
`role === 'manager'` guards to the manager-only actions (allocate, soft/hard
delete, add sweep lead, trainer create/edit/active) so a future RLS change can't
silently open them. Leave status/note updates to RLS (trainers use them on their
own leads). **Re-apply against current `actions.ts` files** — they changed for
the AM/PM availability work.

## Migration numbering — settled at `0009`

This work is **`0009_public_access_hardening.sql`**.

It was briefly numbered `0005`, the slot `PROJECT_STATUS.md` had reserved, on the
reasoning that the four blocks were independent of each other. They are not
independent of `0006`: block 3 rewrites the `trainer_documents_insert` policy, and
`trainer_documents` is created by `0006`. As `0005` it runs *before* the table
exists and fails on any fresh setup. That is not hypothetical — it is how the
live-DB drift was discovered, when PART A died on
`42P01: relation "trainer_documents" does not exist`.

So it sits after `0006`, at `0009`. **`0005` is retired, not reserved** — don't
fill it. **No collision with GymMaster:** it keeps its existing
`0007_gymmaster_lead_source.sql` / `0008_gymmaster_sync.sql`, unchanged. Anything
new starts at `0010`.

## How to actually apply it

Do not run this file on its own. It is step 3 and step 5 of the reconciliation
runbook, **`supabase/reconcile/README.md`**, which audits the live schema first,
applies the missing `0006`, then goes PART A → deploy → PART B. PART B removes
anon's direct insert on `leads`, so running it before the code that calls
`submit_form_lead()` is deployed takes the public form down.

## Also review (new code the original sweep never saw) — DONE

Reviewed against production. Findings and what was done:

- **Branded HTML emails (`src/lib/email.ts`) — clean.** Every lead-supplied
  interpolation in both HTML bodies goes through `esc()`: name, phone, email,
  goals, contact preference, due date, and the digest's lead names. `esc()`
  doesn't escape `'`, which is correct here — nothing lands in a single-quoted
  attribute; the one attribute interpolation is `href="${esc(DASHBOARD_URL)}"`,
  and that's env config, not user input. The document emails are text-only.
- **Trainer documents — one real finding, fixed in 0009.** The
  `trainer_documents_insert` policy constrained `trainer_id` and `uploaded_by`
  but not `status`, so a trainer posting straight at the REST API with the
  public key could insert their own document as `status='verified'` and sign off
  their own CPR certificate. The policy now pins `status`/`verified_by`/
  `verified_at`/`rejection_reason` on the trainer branch, and pins `file_path`
  to the trainer's own storage folder. `verifyDocument`/`rejectDocument` also
  gained explicit manager checks.
- **Keep-alive cron — real finding, fixed.** The digest was hardened in the last
  pass, but `keepalive` and `document-expiry` were left on the old
  `authHeader !== \`Bearer ${process.env.CRON_SECRET}\`` compare. Both fail
  **open** when `CRON_SECRET` is unset (a literal `Bearer undefined` header gets
  in) and both leak the secret to a timing attack. All three now share
  `isAuthorisedCronRequest` in `src/lib/cron.ts`.
- **Password change — real finding, fixed.** `supabase.auth.updateUser({password})`
  doesn't ask for the old password, so anyone reaching an unlocked signed-in
  browser could take the account over. The form now requires the current
  password and verifies it on a throwaway client (`persistSession: false`, so a
  failed attempt can't clobber the real session cookies).
- **Manager-assisted email change (`staff/actions.ts`) — clean.** Every action
  there already checks `callerIsManager()` before touching the service-role
  client, collision-checks the new address, and blocks self-revocation. Now
  imports the shared helper instead of a local copy.
- **GymMaster phase 1 (unmerged branch) — two findings, NOT fixed here.** Left
  for that branch so this one stays reviewable:
  1. `src/app/api/cron/gymmaster-sync/route.ts` has the same fail-open cron
     auth. It should use `isAuthorisedCronRequest` from `src/lib/cron.ts`.
  2. `src/lib/gymmaster/client.ts` puts the API key in the query string
     (`url.searchParams.set("api_key", apiKey)`), which lands in proxy and
     access logs. Move it to a header once the real auth scheme is confirmed —
     it's already flagged `TODO(gymmaster-docs)`.
- **Member nurture email series — clean.** Static HTML in `docs/emails/`, no
  interpolation of anything this app holds; merge tags are resolved by
  GymMaster, not here.

## Process notes

- Verify against current production: branch off `claude/fitaz-gym-pt-leads-76ffhv`.
- `npm run build` + `tsc --noEmit` + `lint` clean before every push.
- Deploy = merge to `claude/fitaz-gym-pt-leads-76ffhv` (auto-deploys on Vercel).
- The built-in `security-review` skill diffs against a base branch; point it at
  production or do the review manually over `src/` + `supabase/migrations/`.
