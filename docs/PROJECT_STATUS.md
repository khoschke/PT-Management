# Fitaz Gym PT Leads — Project Status

The single source of truth for where this project is up to. Read this first in
any new session, then the workstream-specific handoff note for your task.

## What it is

A lead intake and allocation system for Fitaz Gym's complimentary PT session
offer. New members raise their hand (public form) or are entered off a
GymMaster sweep, and the PT Manager allocates each lead to a trainer within 48
hours. Built for a five-PT gym, ~30 leads/month.

## Live now

- **Public form:** https://pt.fitazgym.com/pt-session
- **Manager/trainer dashboard:** https://pt.fitazgym.com/admin
- **PT onboarding workbook:** https://pt.fitazgym.com/onboarding
- The `pt-management-two.vercel.app` addresses still work and are what Vercel
  deploys to, but `pt.fitazgym.com` is live and is the address to use and share.
- Everything is deployed and working end to end with real data.

## Stack & hosting

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind v4.
- **Supabase** — Postgres, Auth, Row Level Security. Project ref `fbzearypwpjcyrmdivsz`.
- **Resend** — the two notification emails. **LIVE** and sending from `noreply@mail.fitazgym.com` (confirmed 4 Aug 2026 by a real trainer allocation email landing in the inbox). Georgio added the DNS records. **DNS lives at CrazyDomains (Dreamscape), not Shopify** (confirmed 5 Aug 2026); fitazgym.com is connected to Shopify but not bought through it, so the zone is elsewhere. The SPF record had a copy-paste error early on but **has since been corrected** (confirmed 11 Aug 2026 in the CrazyDomains DNS panel): `send.mail.fitazgym.com` now reads `v=spf1 include:amazonses.com ~all` and is Active, alongside the Active `resend._domainkey` DKIM record. SPF and DKIM both pass.
- **Vercel** — hosting + a daily-digest cron (`vercel.json`). Hobby (free) plan.
- **GitHub:** `khoschke/pt-management`. Active branch: `claude/fitaz-gym-pt-leads-76ffhv` (this is also Vercel's production branch — pushing to it auto-deploys).

## Environment variables (names only — values live in Vercel + local .env.local)

Set and working: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(a new-style `sb_publishable_…` key), `SUPABASE_SERVICE_ROLE_KEY` (a new-style
`sb_secret_…` key), `IP_HASH_SALT`, `PT_MANAGER_EMAIL`.

`RESEND_API_KEY`, `NOTIFICATIONS_FROM_EMAIL`, and `CRON_SECRET` are all set —
email is fully live. Both the trainer allocation email and the manager daily
digest (Vercel cron) are confirmed sending from the branded
`noreply@mail.fitazgym.com` sender. See `docs/handoff-email-notifications.md`.

## Database

> **This list drifted once. Do not trust it — verify it.**
> On 12 Aug 2026 this section claimed `0006_trainer_documents.sql` was applied
> to live. It was not, and `/admin/compliance` and `/admin/documents` were
> broken in production as a result. The list is a claim; the evidence is
> `supabase/reconcile/01_audit_live_schema.sql`, a read-only query that reports
> PRESENT/MISSING for every migration's objects. **Run it before you assert
> anything about the live schema, and update the status column below from what
> it returns — not from what you expect it to say.**

Migrations live in `supabase/migrations/`. Status column set from an audit run on
**12 Aug 2026**, verified row by row against the live project — not asserted:

| Migration | What it adds | On live? |
|---|---|---|
| `0001_init.sql` | trainers, leads, status_history, profiles, rate_limit_log, RLS, triggers | Applied — verified |
| `0002_onboarding.sql` | onboarding_responses, onboarding_part_status, RLS | Applied — verified |
| `0003_trainer_bio.sql` | free-text `bio` column on trainers | Applied — verified |
| `0004_trainer_am_pm.sql` | independent AM/PM trainer availability | Applied — verified |
| `0006_trainer_documents.sql` | PT compliance documents, expiry reminders, `trainer-documents` Storage bucket | Applied 12 Aug 2026 — verified, incl. bucket + storage policies. Upload/view/delete exercised end to end on the live site. |
| `0007`, `0008` | GymMaster (`gymmaster_lead_source`, `gymmaster_sync`) | Not applied; unmerged branch |
| `0009_public_access_hardening.sql` | trainer-email column grants, status_history soft-delete guard, trainer_documents self-verify guard, `submit_form_lead` RPC | Applied 12 Aug 2026 — **both parts, verified** |

**The drift is closed and the hardening is deployed.** `0006` had never been
applied despite this doc claiming it was, which left `/admin/compliance` and
`/admin/documents` erroring in production. Both work again, with an upload,
view and delete exercised end to end. `0009` then went in either side of the
code deploy, and two real leads were submitted through the live public form —
one before PART B removed anon's direct insert, one after.

Confirmed from outside with the public key on 12 Aug 2026:
`…/rest/v1/trainers?select=email` returns `42501 permission denied`, while
`…/rest/v1/trainers?select=id,name` still lists the five PTs — the public
form's trainer picker, which had to keep working.

`check_form_rate_limit` still exists but is no longer executable by `anon` or
`authenticated`, and nothing calls it. `submit_form_lead` does the rate limiting
and the insert in one transaction. Leave it or drop it in a later migration; it
is inert either way.

`0005` is permanently unused. It was held for the hardening migration, which has
since been renumbered to `0009` because it rewrites a policy on
`trainer_documents` and therefore has to run *after* `0006` — as `0005` it would
have failed on a fresh setup. GymMaster keeps `0007/0008` untouched. Anything new
starts at **0010**.

**`0009` must be applied in two parts around the code deploy**, per the banner at
the top of the file: PART A before the new code is live, PART B after. The code
in `src/app/pt-session/actions.ts` already calls `submit_form_lead`, so PART A
has to be in place before that deploy or the public form breaks.

The full runbook — audit, apply `0006`, PART A, deploy, PART B, verify — is
`supabase/reconcile/README.md`. **None of it can be run from a Claude build
workspace** (no outbound network to Supabase), which is how the drift happened
in the first place. Someone has to run it in the Supabase SQL editor.

Roles live in `profiles` (`manager` / `trainer`). Managers see/allocate all
leads; trainers see only their own. RLS enforces this at the database level.
Manage logins in-app at `/admin/staff` (manager only), which uses the
service-role client.

## The five real PTs (from their corflutes)

Dylan Heycox, Julie Manners, Shahd Herbert, Karl Hoschke (also the PT Manager),
Michael Hammett. Specialties captured via the shared goal tags + free-text bio.

## Goal / specialty taxonomy

`src/lib/goals.ts` holds ONE shared list used by both the public form ("what
results do you want to achieve?") and trainer specialties — this is what powers
allocation matching. It mirrors the Kinetic Hustl waiver form plus "Increase
strength". Change it in that one file and it flows to both sides.

## Design system

- `/admin` and `/pt-session` are deliberately **monochrome black-and-white**
  (brand), Apple-inspired, light-mode only. Tokens in `src/app/globals.css`.
- `/onboarding` is a separate visual layer (`.onboarding-scope`) with its own
  light/dark theme — intentionally distinct from the ops tool.

## Hard-won gotchas (don't relearn these)

- **"use server" files may only export async functions.** Form-state objects
  and their types live in sibling `state.ts` files, never in `actions.ts`.
  Exporting a plain object from a "use server" file 500s on Vercel.
- **Generated columns that add an interval to a `timestamptz` aren't immutable**
  and Postgres rejects them. Use a column default instead (see `first_contact_due_at`).
- **Vercel auto-deploy can silently stall.** If a push doesn't appear in
  Deployments, push again (an empty commit works) to re-trigger.
- **This build workspace has no outbound network** to Supabase, Google,
  GymMaster, etc. You cannot test those live from here — build, deploy, and
  verify on the live site (which is not network-restricted).
- **A migration in `supabase/migrations/` is not proof it ran on live.** Nothing
  applies migrations automatically; a human pastes them into the Supabase SQL
  editor, and that step has been silently skipped before (`0006`, which broke two
  production screens for days while this doc said it was applied). Run
  `supabase/reconcile/01_audit_live_schema.sql` and believe the output, not the
  file listing and not the table above it.
- **Supabase's new API key format** (`sb_publishable_…`, `sb_secret_…`) works
  with the installed `@supabase/*` versions; they map to the anon and
  service-role roles respectively.

## Working practices in this repo

- Develop on branch `claude/fitaz-gym-pt-leads-76ffhv` (or a dedicated branch
  per workstream, merged back via PR — that's how the onboarding dashboard came in).
- Commit messages end with the Co-Authored-By / Claude-Session trailers.
- Run `npm run build` + `npx tsc --noEmit` + `npm run lint` before pushing.
- Verify changes in a real browser with screenshots where it matters
  (thoroughness is preferred over speed here).

## Member email series

Separate from the two internal ops emails in `src/lib/email.ts`. Member-facing
lifecycle emails live in `docs/emails/`, with the strategy, merge tags and
send checklist in `docs/emails/README.md`.

- **Three emails, built and finished.** Day 1 `01-welcome-nurture`, day 10
  `02-plan-not-motivation`, day 30 `03-last-call`, each with an HTML and a plain
  text part. They go to Fitness Passport and standard members alike, and share
  one goal: turn an unverified member into a warm lead by getting them to
  complete `/pt-session`. The complimentary session expires on day 37.
- **Sending and triggering happen in GymMaster**, automated off the member's own
  join date. No integration work is needed in this repo for that.
- **The PTs get the unverified leads after email 2**, around day 11, with anyone
  who already responded stripped out. The emails take the easy conversions and
  the PTs spend their calls on people who need one.
- **LIVE since 1 September 2026.** All three are sending from GymMaster, timed
  off each member's own join date. The unsubscribe was the last blocker and
  **GymMaster handles it**, which is why the templates in `docs/emails/` still
  carry none and must not have one added back. Merge tags are settled: the
  templates carry GymMaster's own `{58:Member First Name}` syntax, and
  `{{expiry_date}}` is gone because GymMaster cannot do the date arithmetic, so
  the deadline is worded relatively instead. Details in
  `docs/handoff-email-1-go-live.md`.
- **Two things follow from being live.** Suppression before emails 2 and 3 is now
  a recurring job off the lead board, not a launch check, and it only works if
  the PTs keep lead status current. And the PTs have to be told how leads reach
  them now, which is drafted and not yet sent, see below.
- **CMS-safe variants** in `docs/emails/cms-safe/` exist because GymMaster
  corrupts pasted HTML and the buttons lose their position. Generated by
  `docs/emails/make-cms-safe.py`, never edited by hand.

Brand assets live in `public/brand/`, documented in `docs/brand-assets.md`.
**Use `fitaz-gym-logo-official.png`**, extracted from the artwork Karl supplied
on 18 August 2026. Everything else there is an earlier trace and measurably
wrong, most visibly in the gap between the wordmark and the GYM chip. The
traces are kept only because they are vector and the official is not.

**These are the primary marks in use**, and the earlier trace on
`claude/apple-design-pass-ymnm14` is superseded by them: when that branch merges,
keep the `public/brand/` versions.

**All of them are traces, though, not the real logo.** Karl supplied the official
artwork on 18 August 2026 and it differs, most visibly in the GYM chip, which is
square cornered rather than rounded, and in the letterforms, which are a
geometric sans rather than the Arial-metric face we traced. The originals still
need to land in `public/brand/source/`, and the marks should be re-traced from
vector rather than corrected by eye. See `docs/brand-assets.md`.

## Where each workstream lives (branch map)

Every workstream has its own branch, which is also the session that built it.
Some carry finished work that is not on production yet, so check before starting
anything: the thing may already be built.

### Check this yourself, do not trust the table

**The table below is a snapshot and it goes stale every time anything merges.**
Do not report a branch as unmerged on the strength of it. Run this first:

```sh
git fetch origin
PROD=origin/claude/fitaz-gym-pt-leads-76ffhv
for b in $(git ls-remote --heads origin | sed 's|.*refs/heads/||' | grep -v fitaz-gym-pt-leads | sort); do
  n=$(git rev-list --count $PROD..origin/$b)
  printf "%-46s %s\n" "$b" "$([ "$n" = 0 ] && echo merged || echo "$n unmerged")"
done
```

Zero means everything on that branch is already on production, whatever the
table says. If what you find disagrees with the table, **the command is right**:
fix the table in the same session rather than leaving it to mislead the next one.

### Snapshot, 12 August 2026 (verified with the command above, after the deploy)

Three branches marked "safe to delete" below were still on the remote when this
was written — the session that finished the work could push commits but not
delete refs. Delete them from the GitHub branches page when convenient; their
rows can then come out of this table.

| Branch / thread | Workstream | State |
|---|---|---|
| `claude/reconcile-database-security-deploy-01sf2h` | Live-DB reconciliation + security deploy | **Merged and deployed, 12 Aug 2026.** Carried the security hardening merge, the migration renumbered `0005` → `0009`, the `supabase/reconcile/` audit + runbook, and this doc's corrected migration table. Safe to delete. |
| `claude/security-merge-pending-parta` | Security hardening merge | **Merged** (via the reconcile branch). Its migration number was wrong — corrected there. Safe to delete. |
| `claude/apple-design-pass-ymnm14` | Apple-grade design pass | **Merged.** Public form, lead board, trainers, staff, login, plus the FITAZ GYM wordmark across app headers. The superseded wordmark trace was discarded in favour of the `public/brand/` marks, as planned. |
| `claude/docs-reconcile-live-state` | Branch-map reconciliation | **Merged.** Docs only. |
| `claude/custom-domain-dns-setup-v45oc6` | Custom domain + security hardening | **PARKED — do NOT merge.** 9 unmerged, but its deliverable (pt.fitazgym.com + email) is already live via the dashboards, and it forked ~50 commits back, so a merge would conflict and regress newer work. The CSV/cron/IP-salt fixes were re-done fresh and merged (PR #18); the DB security was re-done fresh as migration `0009`. Ignore or delete this branch. |
| `claude/security-hardening-csv-ip-cron` | Security hardening (CSV/IP/cron) | **Merged** (PR #18). CSV formula-injection guard, IP-salt production guard, cron fail-closed + constant-time auth. Also added `docs/handoff-security-hardening.md` for the remaining items. |
| `claude/security-hardening-validation-0ry4cz` | Security hardening (DB / RLS) | **Merged** (via the reconcile branch). Safe to delete. |
| `claude/gymmaster-phase-1-pull-7yuxuy` | GymMaster integration | **3 unmerged.** Phase 1 pull scaffolding plus migrations `0007` and `0008`, which keep those numbers. |
| `claude/pt-team-onboarding-rw5awg` | PT team update email | **Merged.** The team update email and the login details email, from `docs/handoff-pt-team-update-email.md`. Both were sent on 12 August 2026; the files are kept as the record of what went out and as the template for the next trainer who joins. |
| `claude/handoff-email-notifications-9m67a6` | Branded HTML notification emails | **Merged** (PR #4). Replaced the plain-text ops emails with branded HTML plus a dashboard link. |
| `claude/self-service-password-change-3ydtqu` | Forgot-password | **1 unmerged**, a handoff note only. No implementation; still needs Supabase Custom SMTP. |
| `claude/gym-nurture-email-design-uw9nvu` | Member email series | **Merged** (PR #13 and #14). Emails 1 to 3, CMS-safe variants, brand assets, this doc. |
| `claude/pt-document-expiry-feature-ppsy30` | PT compliance documents with expiry reminders | **Merged** (PR #8). |
| `claude/availability-am-pm-model-yj1dby` | Trainer AM/PM availability | Merged. |
| `claude/trainer-portal-handoff-doc-o0on8j` | Editable trainer pages | Merged (scoping note only, build not started). |
| `claude/pt-onboarding-dashboard-9wwl17` | PT onboarding workbook | Merged and live. |
| `claude/handoff-trainer-profiles-link-buudia` | Trainer profile links | Merged. |
| `claude/project-pause-prevention-083n5y` | Supabase keep-alive cron | Merged and live. |

### Migration order, already sorted

Three unmerged branches each added their own `0004_`, which would have
collided on merge. They have been renumbered, and `0004` was never free
anyway because `0004_trainer_am_pm.sql` merged with the availability work.

| Number | Migration | Branch |
|---|---|---|
| 0004 | `trainer_am_pm` | merged, on production |
| 0005 | — | permanently unused (see below) |
| 0006 | `trainer_documents` | merged to production, **not yet on the live DB** |
| 0007, 0008 | `gymmaster_lead_source`, `gymmaster_sync` | `gymmaster-phase-1-pull-7yuxuy` (already numbered correctly, no renumber needed) |
| 0009 | `public_access_hardening` | merged into code; **apply in two parts, PART A → deploy → PART B** |

Merge in that order and Supabase stays in step. GymMaster is deliberately in the
middle rather than last: its numbers were already written and pushed, and moving
the hardening migration was free by comparison.

**Why the hardening migration is `0009` and not `0005`.** It rewrites the
`trainer_documents_insert` policy, and that table is created by `0006`. Numbered
`0005` it would run before the table existed and fail on any fresh setup — which
is precisely how the live-DB drift surfaced. It has to sit after `0006`, and
`0009` was the first free slot that left GymMaster's `0007/0008` alone. `0005` is
now retired rather than reserved: don't fill it.

`0009_public_access_hardening.sql` **runs in two parts around the code deploy**
(PART A → deploy → PART B). The file says so at the top; the runbook is
`supabase/reconcile/README.md`.

## Outstanding / next up

- **GymMaster integration** — see `docs/handoff-gymmaster-integration.md`.
  **Phase 1 scaffolding already exists unmerged** on
  `claude/gymmaster-phase-1-pull-7yuxuy`.
- ~~**Apple-grade design pass**~~ — **DONE.** Merged and deployed from
  `claude/apple-design-pass-ymnm14`. The superseded wordmark trace it carried was
  discarded in favour of the `public/brand/` marks.
- ~~**PT compliance documents with expiry reminders**~~ — **DONE and working.**
  Code merged (PR #8) and deployed; migration `0006` applied to live 12 Aug 2026,
  which is what finally made `/admin/compliance` and `/admin/documents` usable.
  Upload, view and delete confirmed against the live Storage bucket. The feature
  had been shipped-but-broken since it merged, purely because the migration was
  never run.
- ~~**Branded HTML notification emails**~~ — **DONE.** Merged (PR #4) on
  `claude/handoff-email-notifications-9m67a6`. The plain-text trainer and digest
  emails are now branded HTML with a dashboard link, live in production.
- ~~**Reconcile the live database**~~ — **DONE, 12 Aug 2026.** `0006` had never
  been applied to live despite this doc saying so; it is now, verified, and
  `/admin/compliance` and `/admin/documents` work again. The audit query that
  found it lives in `supabase/reconcile/` and should be re-run whenever anyone
  needs to state what is on live.
- ~~**Security hardening**~~ — **DONE, 12 Aug 2026.** CSV injection, IP salt and
  digest-cron auth landed earlier (PR #18). The DB half —
  `0009_public_access_hardening.sql`: anon column grants on trainers, the
  `status_history` soft-delete guard, the `trainer_documents` self-verify guard,
  the `submit_form_lead` RPC — is applied, both parts, and verified against live.
  Explicit manager checks and the shared cron auth helper (`src/lib/cron.ts`)
  deployed with it. Findings and rationale in
  `docs/handoff-security-hardening.md`. The old `custom-domain-dns-setup-v45oc6`
  branch stays **parked — do not merge it**; these fixes were re-done fresh.
- ~~**Email notifications**~~ — **DONE.** Live and sending from
  `noreply@mail.fitazgym.com`. SPF and DKIM both pass (the earlier SPF typo has
  been corrected).
- ~~**Get the member nurture series sending**~~ — **DONE, 1 September 2026.**
  Sending from GymMaster on days 1, 10 and 30 off each member's join date, with
  the unsubscribe handled by GymMaster. `docs/handoff-email-1-go-live.md` is now
  a record rather than a task, apart from its last item: telling the PTs.
- **Change-email on the Account screen** — the `/admin/account` screen currently
  does self-service password only. Add a "change my email" field there too
  (`supabase.auth.updateUser({ email })`), so users can update their own login
  details. **No longer blocked:** email is live, so the Supabase confirmation
  link will now deliver. Needs Supabase Custom SMTP pointed at Resend.
  (Note: managers can already change *anyone's* sign-in email immediately from
  the Staff screen — that path uses the admin client and needs no confirmation
  email. This item is specifically the self-service version.)
- **Forgot-password on the login page** — a self-serve "Forgot password?" reset
  link for locked-out staff/trainers. **No longer blocked by the domain:** the
  sending domain is verified. Still needs Supabase Custom SMTP configured against
  Resend before the recovery link will deliver. See
  `docs/handoff-forgot-password.md`. Build and ship it in one go once auth email
  works, don't merge a dead reset link before then.
- **Availability as AM + PM (not "both")** — change trainer availability to
  independent AM/PM selection. See `docs/handoff-availability-am-pm.md`.
- ~~**Custom web address**~~ — **DONE.** `pt.fitazgym.com` is live over HTTPS. DNS
  records live at **CrazyDomains (Dreamscape), not Shopify** — fitazgym.com is
  connected to Shopify but its DNS zone is at CrazyDomains, which is where all
  records were added. `docs/handoff-custom-domain.md` is now history, not a task.
- **Editable trainer pages** — give each PT a self-editable profile. **Scoped,
  not started.** Decided: **internal only** (not public — the public reach
  trainers via the gym website already), trainer edits their own row *and*
  manager keeps the roster override, **bio + specialties only** for now (no
  photo). Small build: reuses the existing `bio`/`specialties` columns, needs a
  per-trainer RLS `update` policy + a self-service screen in `/admin`. See
  `docs/handoff-trainer-portal.md`.

- ~~**Email the PT team about everything built so far**~~ — **DONE.** Sent
  12 August 2026, along with the four individual login emails. The record is
  `docs/pt-team-update-email.md` and `docs/pt-login-details-email.md`, kept as
  the template for the next trainer who joins.
- **Brief the PTs on the live nurture flow** — the follow-up that email
  promised, now that the series is sending. Explains the three member emails and
  the day 37 expiry, how leads reach a PT now and why the unverified ones arrive
  around day 11, asks the team to keep lead status current because suppression
  depends on it, and makes each PT confirm they can sign in to the portal.
  **Drafted in `docs/pt-nurture-flow-briefing-email.md`, not yet sent.** Worth
  sending before the first leads under the new flow reach their boards, which is
  roughly a fortnight from go-live.

### Newly added, not yet scoped

Reminders only. Each gets scoped and built in its own session.

- **Staff development pathway into the PT portal**, with an upgrade of a staff
  member to trainer status. Touches the onboarding workbook, the `manager` /
  `trainer` role in `profiles`, the `trainers` table and `/admin/staff`.
- **PT prospect interview system** in the PT Manager area. STAR method has been
  suggested; approach to be agreed when it is scoped.
- **Ezidebit connected to the PT Manager dashboard via an MCP, reading live.**
  Georgio's request, raised in the rents thread on 3 August 2026. Read only.
