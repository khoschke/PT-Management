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
- **Resend** — the two notification emails. **LIVE** and sending from `noreply@mail.fitazgym.com` (confirmed 4 Aug 2026 by a real trainer allocation email landing in the inbox). Georgio added the DNS records. **DNS lives at CrazyDomains (Dreamscape), not Shopify** (confirmed 5 Aug 2026); fitazgym.com is connected to Shopify but not bought through it, so the zone is elsewhere. **One defect: the SPF record was sent with a copy-paste error** (`v=spf1 include: v=spf1 include:amazonses.com ~all`) and needs replacing with `v=spf1 include:amazonses.com ~all`. Mail is delivering on DKIM alignment meanwhile.
- **Vercel** — hosting + a daily-digest cron (`vercel.json`). Hobby (free) plan.
- **GitHub:** `khoschke/pt-management`. Active branch: `claude/fitaz-gym-pt-leads-76ffhv` (this is also Vercel's production branch — pushing to it auto-deploys).

## Environment variables (names only — values live in Vercel + local .env.local)

Set and working: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(a new-style `sb_publishable_…` key), `SUPABASE_SERVICE_ROLE_KEY` (a new-style
`sb_secret_…` key), `IP_HASH_SALT`, `PT_MANAGER_EMAIL`.

`RESEND_API_KEY` and `NOTIFICATIONS_FROM_EMAIL` are now set (email is sending).
`CRON_SECRET` still needs confirming.

## Database

Migrations in `supabase/migrations/`, all applied to the live Supabase project:
- `0001_init.sql` — trainers, leads, status_history, profiles, rate_limit_log, RLS, triggers.
- `0002_onboarding.sql` — onboarding_responses, onboarding_part_status, RLS.
- `0003_trainer_bio.sql` — free-text `bio` column on trainers.
- `0004_trainer_am_pm.sql` — independent AM/PM trainer availability.
- `0006_trainer_documents.sql` — PT compliance documents and expiry reminders.

**0005 is deliberately missing on production.** It is reserved for
`0005_public_access_hardening.sql`, still unmerged on
`claude/custom-domain-dns-setup-v45oc6`. `0007` and `0008` are reserved for
GymMaster. See the migration order below. Anything new starts at **0009**.

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
- **Not sending yet**, but the domain is no longer the blocker. What is left is
  tracked in `docs/handoff-email-1-go-live.md`: confirming what GymMaster gives
  us for unsubscribe, suppression and merge tags, and fixing the SPF typo.
  `pt.fitazgym.com` is confirmed resolving.
- **CMS-safe variants** in `docs/emails/cms-safe/` exist because GymMaster
  corrupts pasted HTML and the buttons lose their position. Generated by
  `docs/emails/make-cms-safe.py`, never edited by hand.

Brand assets live in `public/brand/`, documented in `docs/brand-assets.md`.
Use `fitaz-gym-logo.svg` by default; the `-email` variant exists only for email
headers.

**These are the primary marks.** The `claude/apple-design-pass-ymnm14` branch
carries an earlier trace of the same wordmark, made before these. It is
superseded. When that branch is merged, keep the `public/brand/` versions and
discard the older trace rather than letting the merge decide.

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

### Snapshot, 10 August 2026

| Branch / thread | Workstream | State |
|---|---|---|
| `claude/apple-design-pass-ymnm14` | Apple-grade design pass | **13 unmerged.** Public form, lead board, trainers, staff, login, plus the FITAZ GYM wordmark across app headers. Looks finished. Carries a superseded wordmark trace: keep the `public/brand/` marks. |
| `claude/custom-domain-dns-setup-v45oc6` | Custom domain + security hardening | **9 unmerged.** Real security work: CSV export auth, cron auth, RLS hardening, migration `0005_public_access_hardening.sql`. Should not sit unmerged. |
| `claude/gymmaster-phase-1-pull-7yuxuy` | GymMaster integration | **3 unmerged.** Phase 1 pull scaffolding plus migrations `0007` and `0008`. |
| `claude/pt-team-onboarding-rw5awg` | PT team update email | **3 unmerged.** Drafts of the team update email and the login details email, from `docs/handoff-pt-team-update-email.md`. |
| `claude/handoff-email-notifications-9m67a6` | Branded HTML notification emails | **1 unmerged.** Replaces the plain-text ops emails with branded HTML plus a dashboard link. Cheapest visible win now that sending is live. |
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
| 0005 | `public_access_hardening` | `custom-domain-dns-setup-v45oc6` |
| 0006 | `trainer_documents` | merged, on production |
| 0007, 0008 | `gymmaster_lead_source`, `gymmaster_sync` | `gymmaster-phase-1-pull-7yuxuy` |

Merge in that order and Supabase stays in step. GymMaster is deliberately last:
it is the largest and most likely to change again, so it absorbs any further
renumbering rather than forcing it on the others. None of these have been
applied to the live project yet.

## Outstanding / next up

- **GymMaster integration** — see `docs/handoff-gymmaster-integration.md`.
  **Phase 1 scaffolding already exists unmerged** on
  `claude/gymmaster-phase-1-pull-7yuxuy`.
- **Apple-grade design pass** — see `docs/handoff-apple-design-pass.md`.
  **Appears finished and unmerged** on `claude/apple-design-pass-ymnm14`. Review
  and merge rather than rebuild. It also carries an earlier trace of the FITAZ
  wordmark: that one is superseded, keep the `public/brand/` marks.
- **PT compliance documents with expiry reminders** — built and unmerged on
  `claude/pt-document-expiry-feature-ppsy30`. Was missing from this list
  entirely. Needs a review and a decision on whether it ships.
- **Branded HTML notification emails** — built and unmerged on
  `claude/handoff-email-notifications-9m67a6`. Replaces the plain-text trainer
  and digest emails. Now that sending is live this is the cheapest visible win
  available.
- **Security hardening** — CSV export auth, cron auth, RLS tightening, built and
  unmerged on `claude/custom-domain-dns-setup-v45oc6`. Should not sit unmerged.
- ~~**Email notifications**~~ — **DONE.** Live and sending from
  `noreply@mail.fitazgym.com`. Only the SPF typo above is outstanding.
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
- ~~**Custom web address**~~ — **DONE.** `pt.fitazgym.com` is live, DNS added in
  Shopify by Georgio. `docs/handoff-custom-domain.md` is now history, not a task.
- **Editable trainer pages** — give each PT a self-editable profile. **Scoped,
  not started.** Decided: **internal only** (not public — the public reach
  trainers via the gym website already), trainer edits their own row *and*
  manager keeps the roster override, **bio + specialties only** for now (no
  photo). Small build: reuses the existing `bio`/`specialties` columns, needs a
  per-trainer RLS `update` policy + a self-service screen in `/admin`. See
  `docs/handoff-trainer-portal.md`.

- **Email the PT team about everything built so far** — inspiration and
  momentum piece, invites them into the portal, attaches the nurture emails for
  feedback, and asks for preferred days and times for fortnightly development
  sessions from September. Fully briefed in
  `docs/handoff-pt-team-update-email.md`. Karl must create the five logins
  first.

### Newly added, not yet scoped

Reminders only. Each gets scoped and built in its own session.

- **Staff development pathway into the PT portal**, with an upgrade of a staff
  member to trainer status. Touches the onboarding workbook, the `manager` /
  `trainer` role in `profiles`, the `trainers` table and `/admin/staff`.
- **PT prospect interview system** in the PT Manager area. STAR method has been
  suggested; approach to be agreed when it is scoped.
- **Ezidebit connected to the PT Manager dashboard via an MCP, reading live.**
  Georgio's request, raised in the rents thread on 3 August 2026. Read only.
