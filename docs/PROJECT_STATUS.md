# Fitaz Gym PT Leads — Project Status

The single source of truth for where this project is up to. Read this first in
any new session, then the workstream-specific handoff note for your task.

## What it is

A lead intake and allocation system for Fitaz Gym's complimentary PT session
offer. New members raise their hand (public form) or are entered off a
GymMaster sweep, and the PT Manager allocates each lead to a trainer within 48
hours. Built for a five-PT gym, ~30 leads/month.

## Live now

- **Public form:** https://pt-management-two.vercel.app/pt-session
- **Manager/trainer dashboard:** https://pt-management-two.vercel.app/admin
- **PT onboarding workbook:** https://pt-management-two.vercel.app/onboarding
- Everything is deployed and working end to end with real data.

## Stack & hosting

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind v4.
- **Supabase** — Postgres, Auth, Row Level Security. Project ref `fbzearypwpjcyrmdivsz`.
- **Resend** — the two notification emails. Built but currently **OFF** (no API key set), by choice, until the sending domain is sorted.
- **Vercel** — hosting + a daily-digest cron (`vercel.json`). Hobby (free) plan.
- **GitHub:** `khoschke/pt-management`. Active branch: `claude/fitaz-gym-pt-leads-76ffhv` (this is also Vercel's production branch — pushing to it auto-deploys).

## Environment variables (names only — values live in Vercel + local .env.local)

Set and working: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(a new-style `sb_publishable_…` key), `SUPABASE_SERVICE_ROLE_KEY` (a new-style
`sb_secret_…` key), `IP_HASH_SALT`, `PT_MANAGER_EMAIL`.

Not yet set (email is off): `RESEND_API_KEY`, `NOTIFICATIONS_FROM_EMAIL`,
`CRON_SECRET`.

## Database

Migrations in `supabase/migrations/`, all applied to the live Supabase project:
- `0001_init.sql` — trainers, leads, status_history, profiles, rate_limit_log, RLS, triggers.
- `0002_onboarding.sql` — onboarding_responses, onboarding_part_status, RLS.
- `0003_trainer_bio.sql` — free-text `bio` column on trainers.

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

## Outstanding / next up

- **GymMaster integration** — see `docs/handoff-gymmaster-integration.md`.
- **Apple-grade design pass** — see `docs/handoff-apple-design-pass.md`.
- **Email notifications** — code ready, turn on once the sending domain is set.
- **Custom web address** — decided: **pt.fitazgym.com**, DNS via Shopify. See
  `docs/handoff-custom-domain.md`.
