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

## Remaining items (re-validate, then implement)

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

## Migration numbering

`PROJECT_STATUS.md` reserves **`0005_public_access_hardening.sql`** for exactly
this work (0005 is skipped on production on purpose, held for it); `0007`/`0008`
are reserved for GymMaster. So bundle items 1–3 above into **`0005_public_access_hardening.sql`**,
not 0007. Mind the create-before-revoke ordering for item 2 (the RPC). Confirm
`0005` is still free on production before writing it.

## Also review (new code the original sweep never saw)

Production gained a lot since the fork. Give these a security pass for *new*
findings, don't assume they're clean:
- Branded HTML emails (`src/lib/email.ts`) — lead values are HTML-escaped via
  `esc()`; confirm every interpolation is covered.
- Trainer documents feature + `0006_trainer_documents` migration (RLS, uploads).
- Self-service password change + manager-assisted email change.
- Keep-alive cron (another route to auth-check like the digest).
- GymMaster phase 1 pull + the member nurture email series.

## Process notes

- Verify against current production: branch off `claude/fitaz-gym-pt-leads-76ffhv`.
- `npm run build` + `tsc --noEmit` + `lint` clean before every push.
- Deploy = merge to `claude/fitaz-gym-pt-leads-76ffhv` (auto-deploys on Vercel).
- The built-in `security-review` skill diffs against a base branch; point it at
  production or do the review manually over `src/` + `supabase/migrations/`.
