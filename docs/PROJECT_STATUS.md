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

Migrations live in `supabase/migrations/`. Status column set from an audit run,
verified row by row against the live project — not asserted.

**Last verified in full: 9 September 2026.** Every row in this table was
checked against the live database by running
`supabase/reconcile/01_audit_live_schema.sql` through the Supabase MCP server's
`execute_sql`, which reaches the live project straight from a build session.
51 checks: 49 PRESENT, and the only two MISSING are `0007` and `0008`, the
GymMaster pair on an unmerged branch, which are expected to be absent.

That took one tool call. **Re-run it rather than trusting this table**, and
update the date above when you do. It is the cheapest possible insurance
against the thing that broke `/admin/compliance` for days in August: a table
that said "applied" about a migration nobody had run.

| Migration | What it adds | On live? |
|---|---|---|
| `0001_init.sql` | trainers, leads, status_history, profiles, rate_limit_log, RLS, triggers | Applied — verified |
| `0002_onboarding.sql` | onboarding_responses, onboarding_part_status, RLS | Applied — verified |
| `0003_trainer_bio.sql` | free-text `bio` column on trainers | Applied — verified |
| `0004_trainer_am_pm.sql` | independent AM/PM trainer availability | Applied — verified |
| `0006_trainer_documents.sql` | PT compliance documents, expiry reminders, `trainer-documents` Storage bucket | Applied 12 Aug 2026 — verified, incl. bucket + storage policies. Upload/view/delete exercised end to end on the live site. |
| `0007`, `0008` | GymMaster (`gymmaster_lead_source`, `gymmaster_sync`) | Not applied; unmerged branch |
| `0009_public_access_hardening.sql` | trainer-email column grants, status_history soft-delete guard, trainer_documents self-verify guard, `submit_form_lead` RPC | Applied 12 Aug 2026 — **both parts, verified** |
| `0010_trainer_self_profile.sql` | per-trainer self-edit of `bio`/`specialties`: `trainers_select_self` + `trainers_update_self` policies, `guard_trainer_self_update` column-guard trigger | Applied 7 Sep 2026 — verified, incl. the guard exercised both ways against live |
| `0011_trainer_self_availability.sql` | widens the self-edit guard to `available_am`/`available_pm` | Applied 7 Sep 2026 — verified both ways against live |
| `0012_trainer_pause_leads.sql` | lifts 0011's both-slots-off block so it means "not taking new leads"; grants anon read on the two availability columns so the public picker can hide paused PTs | Applied 8 Sep 2026 — verified against live, incl. anon still blocked from `email` |
| `0013_staff_role.sql` | `staff` on the `app_role` enum, the `my_role()` helper, and the three lead/history policies rewritten off `not is_manager()` | Applied 8 Sep 2026 — verified against live |
| `0014_development_goals.sql` | `development_goals` and `development_notes`, with no manager write policy on goals | Applied 8 Sep 2026 — verified against live, incl. the ownership rule |
| `0015_contract_document_type.sql` | "PT Contract" built-in compliance document type | Applied 8 Sep 2026 — verified against live (`contract` row present) |

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
have failed on a fresh setup. GymMaster keeps `0007/0008` untouched. `0010`, `0011`
and `0012` are the trainer self-profile work; `0013` and `0014` are the staff
development pathway, and `0015` is `contract_document_type`, merged via
PR #27. Anything new starts at **0016**.

`0009`'s two-part structure is spent — both parts are on live. It only ever
mattered because a running form was mid-flight between the old insert path and
the new RPC; a fresh project runs the file top to bottom in one go. The runbook
that executed it, `supabase/reconcile/README.md`, is now a record.

**What is not spent is the audit query.** `supabase/reconcile/01_audit_live_schema.sql`
is read-only and takes seconds. Run it before stating what is on the live
database — including before and after merging GymMaster's `0007`/`0008`, which
are the next migrations that will sit in `supabase/migrations/` looking applied
when they are not. **Nothing applies migrations automatically.**

**A session with the Supabase MCP connected can now do this itself** (new,
7 Sep 2026 — this is how `0010` was applied and verified). The MCP reaches the
live project over its own channel, so `apply_migration` and `execute_sql` work
even though the workspace still has no outbound network to Supabase (the
`curl`-fails-to-supabase.co gotcha below is unchanged and still true of the app
itself). That means a build session can apply a migration, run the audit query,
and test RLS as a real signed-in user without waiting on a human at the SQL
editor. **Test RLS inside `begin; … rollback;`** — set
`request.jwt.claims` to a real `profiles.id` and `set local role authenticated`
to become that user, then roll the whole thing back. That is what caught the
`PUBLIC`-grant bug in `0010`'s revoke. If the MCP is not connected, a human at
the SQL editor is still the mechanism.

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

- **Trainer availability was never a filter on allocation, until 0012.** Until
  then `suggestTrainer` scored AM/PM as `+5` and nothing more: the pool was every
  active trainer and ties broke on lowest lead load, so a trainer with no
  availability ticked still received leads — and an empty book made them *more*
  likely to win a tie. Both slots off now means "not taking new leads" and is
  filtered before any rule runs. Don't reason about availability from the field
  name; read `src/lib/allocation.ts`.

- **"use server" files may only export async functions.** Form-state objects
  and their types live in sibling `state.ts` files, never in `actions.ts`.
  Exporting a plain object from a "use server" file 500s on Vercel.
- **Generated columns that add an interval to a `timestamptz` aren't immutable**
  and Postgres rejects them. Use a column default instead (see `first_contact_due_at`).
- **Vercel auto-deploy can silently stall.** If a push doesn't appear in
  Deployments, push again (an empty commit works) to re-trigger.
- **This build workspace has no outbound network** to Supabase, Google,
  GymMaster, etc. You cannot reach *those services* from here — build, deploy,
  and verify on the live site (which is not network-restricted). **This does
  not mean nothing can be tested**: see the Postgres entry below, which covers
  migrations and RLS without any network at all. **That includes
  the Vercel preview URL**: curling a preview deployment from a build session
  fails with `CONNECT tunnel failed, response 403` at the proxy, so a green
  Vercel status is proof the app *built and deployed*, never proof a page
  renders or a query works. Somebody has to open it in a browser. Confirmed
  8 Sep 2026 while watching PR #28.
- **Postgres 16 IS available in the build workspace, so migrations CAN be
  tested here.** `psql` and `initdb` are installed at
  `/usr/lib/postgresql/16/bin`. No network is needed: `initdb` a throwaway
  cluster in `/tmp`, stub the handful of Supabase objects the migrations assume
  (`auth.users`, `auth.uid()`, the `anon` / `authenticated` / `service_role`
  roles, `storage.buckets`, `storage.objects`, `storage.foldername()`), then
  apply `supabase/migrations/*.sql` in order. **Run it as the `postgres` OS
  user** — `initdb` refuses to run as root, which is the one thing that makes
  this look impossible at first.
  This is worth doing for every migration, and it is not just a syntax check:
  you can `set role authenticated`, `set_config('request.jwt.claim.sub', …)`
  and exercise the RLS policies as a real signed-in user. Doing exactly that on
  8 Sep 2026 caught a wrong two-part instruction in `0010`, proved the
  `not is_manager()` hole was genuinely exploitable, and confirmed the
  development-goals ownership rule refuses a manager's UPDATE. **Reasoning
  about a policy is not the same as running it.**
- **The Supabase MCP server reaches the LIVE project from here.** `execute_sql`
  against project `fbzearypwpjcyrmdivsz` answers "is this actually on live?"
  in one call, with no deploy and no asking anyone to paste output. Used on
  8 Sep 2026 to confirm `0013`, `0014` and `0015`, and to establish that
  `auth.users` has never sent a recovery email. The Resend and GitHub MCP
  servers reach their live services the same way. **Check with these before
  concluding something cannot be verified from a build session** — the
  no-outbound-network note above is about `curl`, not about the MCP tools.
- **A migration in `supabase/migrations/` is not proof it ran on live.** Nothing
  applies migrations automatically; a human pastes them into the Supabase SQL
  editor, and that step has been silently skipped before (`0006`, which broke two
  production screens for days while this doc said it was applied). Run
  `supabase/reconcile/01_audit_live_schema.sql` and believe the output, not the
  file listing and not the table above it.
- **Supabase's new API key format** (`sb_publishable_…`, `sb_secret_…`) works
  with the installed `@supabase/*` versions; they map to the anon and
  service-role roles respectively.

## Small shipped touches

- **Password show/hide toggle.** Every password field (login, the Account
  change-password form, and the Staff add-manager / add-trainer-login temp-password
  fields) uses a shared `PasswordInput`
  (`src/app/admin/components/PasswordInput.tsx`) with an eye toggle, so staff and
  trainers can reveal what they're typing and hide it again. The Staff temp-password
  fields, which used to be plain visible text, now default to hidden and reveal on
  the toggle.

## Working practices in this repo

- Develop on branch `claude/fitaz-gym-pt-leads-76ffhv` (or a dedicated branch
  per workstream, merged back via PR — that's how the onboarding dashboard came in).
- Commit messages end with the Co-Authored-By / Claude-Session trailers.
- Run `npm run build` + `npx tsc --noEmit` + `npm run lint` before pushing.
- Verify changes in a real browser with screenshots where it matters
  (thoroughness is preferred over speed here).
- **Branches merged via PR delete themselves.** "Automatically delete head
  branches" was turned on 2 Sep 2026, so the branch map should stay honest by
  itself from here. Two things it does *not* cover: a branch merged directly
  rather than through a PR, and any branch abandoned without merging — those
  still have to be deleted by hand, and their rows removed from the map.
- **A Claude session cannot delete a remote branch.** Every attempt in this repo
  has been refused by GitHub with a 403, and the GitHub MCP server has no
  delete-branch tool. Don't burn time retrying it; hand the branch name to Karl,
  or let the auto-delete above handle it.

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
**Use `fitaz-gym-logo.svg`**, a faithful vector traced from the official artwork
Karl supplied on 18 August 2026. It has the sharp-apex A, the rounded GYM chip,
and the correct wordmark-to-chip gap, and it renders under 1% off the official
raster. The app now points at it. `fitaz-gym-logo-official.png` is kept as the
raster master it was traced from.

**This is the primary mark in use.** The earlier Liberation Sans trace that once
carried the `fitaz-gym-logo.svg` filename is gone, replaced by the faithful
vector. That merged with `claude/apple-design-pass-ymnm14`, which has since been
deleted — there is no longer a competing trace anywhere, so nothing needs
guarding on a future merge.

**The re-trace is now done.** The old note here asked for the mark to be
re-traced from vector rather than corrected by eye, because the Liberation Sans
traces differed from the real logo in the GYM chip (rounded, not square) and the
letterforms (a geometric sans, not an Arial-metric face). That work is complete;
see the faithful-vector section in `docs/brand-assets.md`.

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

### Snapshot, 8 September 2026 (verified with the command above)

The three branches the August reconciliation left behind
(`reconcile-database-security-deploy-01sf2h`, `security-merge-pending-parta`,
`security-hardening-validation-0ry4cz`) have been deleted, along with
`apple-design-pass-ymnm14` and `pt-email-nurture-flow-t2e5e7`. Their rows are
removed: a merged branch that no longer exists is noise here, and its record is
the commit history.

| Branch / thread | Workstream | State |
|---|---|---|
| `claude/docs-reconcile-live-state` | Branch-map reconciliation | **Merged.** Docs only. |
| `claude/security-hardening-csv-ip-cron` | Security hardening (CSV/IP/cron) | **Merged** (PR #18). CSV formula-injection guard, IP-salt production guard, cron fail-closed + constant-time auth. Also added `docs/handoff-security-hardening.md` for the remaining items. |
| `claude/forgot-password-change-email-gl4lca` | Self-service forgot-password + change-email | **1 unmerged, and it is the actual build**, roughly 990 added lines: `/admin/reset-password`, `src/lib/recovery-session.ts`, `src/lib/site-url.ts`, proxy changes. Not the handoff-note-only branch below. |
| `claude/pt-onboarding-workbook-updates-xmrtqs` | PT onboarding workbook content | **4 unmerged, pushed after PR #27 merged.** Restores detail that Parts 2, 3, 4, 7 and 9 had condensed away, and extends the coaching-notes gate to withhold `managerNote`/`workedExample` from trainers as well as staff. |
| `claude/gymmaster-phase-1-pull-7yuxuy` | GymMaster integration | **3 unmerged.** Phase 1 pull scaffolding plus migrations `0007` and `0008`, which keep those numbers. |
| `claude/pt-team-onboarding-rw5awg` | PT team update email | **Merged.** The team update email and the login details email, from `docs/handoff-pt-team-update-email.md`. Both were sent on 12 August 2026; the files are kept as the record of what went out and as the template for the next trainer who joins. |
| `claude/handoff-email-notifications-9m67a6` | Branded HTML notification emails | **Merged** (PR #4). Replaced the plain-text ops emails with branded HTML plus a dashboard link. |
| `claude/staff-development-pathway-scope-ac664k` | Staff development pathway | **Merged, 0 unmerged.** Still on the remote because the follow-ups went in as direct merges rather than PRs, so auto-delete never fired. Safe to delete. |
| `claude/self-service-password-change-3ydtqu` | Forgot-password | **1 unmerged**, a handoff note only. No implementation; still needs Supabase Custom SMTP. |
| `claude/gym-nurture-email-design-uw9nvu` | Member email series | **Merged** (PR #13 and #14, plus the August logo and template work). Emails 1 to 3, CMS-safe variants, brand assets, this doc. |
| `claude/pt-document-expiry-feature-ppsy30` | PT compliance documents with expiry reminders | **Merged** (PR #8). |
| `claude/availability-am-pm-model-yj1dby` | Trainer AM/PM availability | Merged. |
| `claude/trainer-portal-handoff-doc-o0on8j` | Editable trainer pages (scoping) | Merged. Scoping note only; the build is the branch below. |
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
| 0006 | `trainer_documents` | merged; **applied to live 12 Aug 2026, verified** |
| 0007, 0008 | `gymmaster_lead_source`, `gymmaster_sync` | `gymmaster-phase-1-pull-7yuxuy` (already numbered correctly, no renumber needed) |
| 0009 | `public_access_hardening` | merged; **applied to live 12 Aug 2026, both parts, verified** |
| 0010 | `trainer_self_profile` | applied to live 7 Sep 2026, verified |
| 0011 | `trainer_self_availability` | applied to live 7 Sep 2026, verified |
| 0012 | `trainer_pause_leads` | applied to live 8 Sep 2026, verified |
| 0013 | `staff_role` | staff pathway (PR #28). **Applied to live 8 Sep 2026.** Run it whole; safe to re-run |
| 0014 | `development_goals` | development goals (PR #28). **Applied to live 8 Sep 2026 — verified** (enum, both relations, RLS on both, all 6 policies, composite FK). Safe to re-run |
| 0015 | `contract_document_type` | "PT Contract" document type (PR #27). **Applied to live — verified 8 Sep 2026** (the `contract` row is in `document_types`). Safe to re-run |

Merge in that order and Supabase stays in step. GymMaster is deliberately in the
middle rather than last: its numbers were already written and pushed, and moving
the hardening migration was free by comparison.

**Why the hardening migration is `0009` and not `0005`.** It rewrites the
`trainer_documents_insert` policy, and that table is created by `0006`. Numbered
`0005` it would run before the table existed and fail on any fresh setup — which
is precisely how the live-DB drift surfaced. It has to sit after `0006`, and
`0009` was the first free slot that left GymMaster's `0007/0008` alone. `0005` is
now retired rather than reserved: don't fill it.

`0009_public_access_hardening.sql` ran in two parts around the code deploy
(PART A → deploy → PART B). Both are on live; the runbook that executed it,
`supabase/reconcile/README.md`, is now a record rather than a task.

**`0013` and `0014` went on to live on 8 September 2026.** Both run whole, in
one go each, and both are now safe to run twice: `0014` is idempotent
throughout and `0013`'s policy drops are guarded with `if exists`. That was
added after applying `0014` raised `type "development_goal_status" already
exists`, which is a useless error precisely because the failing statement is
the first in the file whether the previous run finished or died immediately
after it. The database turned out to be fine; the migration was the problem.

An earlier note here claimed `0013` needed a two-part run because Postgres will
not let a new enum value be used in the transaction that adds it. That rule is
real but does not apply: nothing in `0013` references `'staff'` after adding
it, so the file commits in a single transaction. Confirmed by executing the
whole migration chain against a local Postgres 16.

## Outstanding / next up

- ~~**Staff development pathway**~~ — **DONE, 8 Sep 2026.** Merged (PR #28),
  migrations `0013` and `0014` applied to live, and walked through end to end
  on the live site. Gym staff working towards
  becoming a PT get a login, the full onboarding workbook with saving progress,
  their own compliance documents, self-authored development goals with a
  coaching conversation, and no leads. The manager sees their progress and can
  promote them to trainer in one action.
  - **Walked through on the live site 8 Sep 2026 and confirmed working.** That
    was the last outstanding step: the RLS had been exercised locally and on
    live, but the server actions had never run. They have now.
  - The walkthrough found two things, both fixed the same day:
    - **A redirect loop that trapped staff in the workbook.** `/admin` sent
      them to `/onboarding`, whose "Back to dashboard" link points at `/admin`,
      which sent them back. The workbook is a separate visual layer with none
      of the dashboard nav, so it dropped them out of the shell holding their
      links. Staff now land on `/admin/development`, inside the shell. **If you
      ever redirect a role somewhere, check the destination carries the nav
      that role needs to get anywhere else.**
    - **"My profile" removed for staff.** The screen drives the public form's
      picker and lead matching, and an inactive roster row is in neither, so
      nothing set there took effect. They get one on promotion.
  - A staff member is a `profiles` row with the new `staff` role pointing at an
    **inactive `trainers` row**. Onboarding progress, documents and Storage all
    key on `my_trainer_id()` rather than on the role, so they work for staff
    with no schema change, and promotion is two writes that carry everything
    across.
  - `0013` also fixed a real latent problem: `leads_select_trainer`,
    `leads_update_trainer` and `status_history_select_trainer` used
    `not is_manager()` to mean "is a trainer", which a third role silently
    breaks. All three now check `my_role() = 'trainer'`.
  - Full detail, including the two decisions Karl made and why, in
    `docs/handoff-staff-development-pathway.md`.
- **Tell the PT team about the trainer portal and the pause.** The feature is
  live and none of them know it exists — a control nobody knows about is a
  control nobody uses. **Karl is deliberately holding this until Friday
  11 September 2026** so any further updates from this week go out in one email
  rather than three. Cover: they can now edit their own bio, specialties and
  AM/PM availability at `/admin/profile`; specialties drive who gets suggested
  for a lead, so tag what they are genuinely best at rather than everything they
  can do; unticking both availability slots pauses them (no new lead
  suggestions, hidden from the public booking form, existing leads untouched);
  and that pausing when full is expected and welcome, whereas letting a lead go
  cold is not. `docs/pt-team-update-email.md` is the template from the last
  round.

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
- **Self-service auth (forgot-password + change-email)** — **BUILT AND
  UNMERGED** on `claude/forgot-password-change-email-gl4lca`, about 990 added
  lines. Read that branch before starting anything here: the thing already
  exists. The row further up for `claude/self-service-password-change-3ydtqu`
  is a different branch carrying only a handoff note, and confusing the two
  would mean rebuilding work that is already done.
  Brief is `docs/handoff-auth-self-service.md`. **Unblocked:** Supabase
  Custom SMTP (pointed at Resend) was set up ~2 Sep 2026, which was the last
  dependency. One caveat carried into the handoff: that a Supabase *auth* email
  actually delivers has not been confirmed end to end yet, so the build session
  must send a real test first and not merge a dead link.
  - **Forgot-password** — a self-serve "Forgot password?" reset link on
    `/admin/login` for locked-out staff/trainers. (Older standalone note
    `docs/handoff-forgot-password.md` is now superseded by the combined doc.)
  - **Change-email** — a "change my email" field on `/admin/account`
    (`supabase.auth.updateUser({ email })`) so users update their own sign-in
    email. (Managers can already change *anyone's* sign-in email immediately from
    the Staff screen via the admin client, no confirmation email needed — this
    item is specifically the self-service version.)
- **Availability as AM + PM (not "both")** — change trainer availability to
  independent AM/PM selection. See `docs/handoff-availability-am-pm.md`.
- ~~**Custom web address**~~ — **DONE.** `pt.fitazgym.com` is live over HTTPS. DNS
  records live at **CrazyDomains (Dreamscape), not Shopify** — fitazgym.com is
  connected to Shopify but its DNS zone is at CrazyDomains, which is where all
  records were added. `docs/handoff-custom-domain.md` is now history, not a task.
- ~~**Editable trainer pages**~~ — **DONE and live, merged 8 Sep 2026** (PR #26),
  from `claude/trainer-profiles-self-editable-jqnn96`. A trainer edits their own
  bio, specialties **and AM/PM availability** at `/admin/profile` ("My profile"
  in the nav); the manager's roster editor is untouched and still edits
  everyone. Migrations `0010`-`0012` are **applied to live and verified** — a
  trainer can change only their own row, and only those four columns. Internal
  only, no photo, no Shopify feed, otherwise as scoped. Scope grew twice at
  Karl's request after he tested on the Vercel preview: AM/PM availability
  (`0011`), then **both slots off as a "my book is full" pause** (`0012`) which
  drops them from allocation suggestions and hides them from the public booking
  form, with the manager still able to allocate by hand. Two safeguards on that
  pause: both forms warn live before saving, and a paused trainer carries a
  standing banner on every page until they undo it.
  `docs/handoff-trainer-portal.md` is now a record.

- ~~**Email the PT team about everything built so far**~~ — **DONE.** Sent
  12 August 2026, along with the four individual login emails. The record is
  `docs/pt-team-update-email.md` and `docs/pt-login-details-email.md`, kept as
  the template for the next trainer who joins.
- ~~**Brief the PTs on the live nurture flow**~~ — **DONE, sent 2 Sep 2026**,
  ahead of the first leads under the new flow reaching their boards.
  `docs/pt-nurture-flow-briefing-email.md` is kept as the record of what went
  out. It explains the three member emails and the day 37 expiry, how leads
  reach a PT now and why the unverified ones arrive around day 11, asks the team
  to keep lead status current because suppression depends on it, and makes each
  PT confirm they can sign in to the portal.
  **The standing job it creates:** suppression before emails 2 and 3 is now
  recurring work off the lead board, and it only works if the PTs keep lead
  status current. Watch whether that actually happens.

### Newly added, not yet scoped

Reminders only. Each gets scoped and built in its own session.

- **PT onboarding checklist, tracked per trainer** — turn the paper operational
  setup checklist (contract, bond, uniform, systems access, profiles, certs, rent
  ramp) into a live per-trainer checklist the manager ticks off and the trainer can
  see. **Now scoped** in `docs/handoff-onboarding-checklist-tracking.md` (decisions
  first, and note it is separate from the educational `/onboarding` workbook). Open
  it in its own thread.
- **PT prospect interview system** in the PT Manager area. STAR method has been
  suggested; approach to be agreed when it is scoped.
- **Ezidebit connected to the PT Manager dashboard via an MCP, reading live.**
  Georgio's request, raised in the rents thread on 3 August 2026. Read only.
