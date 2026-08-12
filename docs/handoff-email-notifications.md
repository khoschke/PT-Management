# Handoff: Email Notifications — ✅ LIVE

**Status: done.** Email notifications are configured and sending in production.
Both emails have been confirmed arriving (trainer allocation *and* the manager
daily digest). This note is now a **record of how it's wired**, not a to-do —
keep it for reference and for turning email on again in a fresh environment
(e.g. a new Vercel project or a rebuild). Read `docs/PROJECT_STATUS.md` first.

## What this is

The app has two notification emails, built in `src/lib/email.ts`:

1. **Trainer allocation email** — when the manager allocates a lead to a trainer,
   that trainer gets an email with the lead's details (`sendTrainerAllocationEmail`).
   **Confirmed live.**
2. **Manager daily digest** — a morning summary of overnight leads, ones
   approaching the 48-hour mark, and breached ones (`sendManagerDailyDigest`),
   fired by the Vercel cron in `vercel.json` → `src/app/api/cron/daily-digest/route.ts`.
   **Confirmed live.**

Both are still **no-ops if `RESEND_API_KEY` is unset** — `emailEnabled` goes
false and the send functions return early — so the dashboard keeps working
regardless. Email is a convenience layer, not a dependency. It was pure
configuration to turn on: **no code changes were required.**

## How it's configured (the env vars, now set in Vercel)

- `RESEND_API_KEY` — the Resend account's API key. **Set.**
- `NOTIFICATIONS_FROM_EMAIL` — the branded "from" address
  (`noreply@mail.fitazgym.com`) on the verified sending domain. **Set.**
  (Defaults to `Fitaz Gym <onboarding@resend.dev>` if ever unset — fine for
  testing, not for real volume.)
- `CRON_SECRET` — protects the daily-digest cron endpoint (read in
  `src/app/api/cron/daily-digest/route.ts`; the route returns 401 without a
  matching `Bearer` token). **Set** — the digest is authenticating and firing.
- `NEXT_PUBLIC_SITE_URL` (optional) — when set, the emails render a real
  "Open the dashboard" button instead of the plain sentence. See "Optional
  polish" below.

## The sending domain

Sending is from `noreply@mail.fitazgym.com`, on the `fitazgym.com` domain
verified in Resend via its DNS records (SPF, DKIM, return-path). This was the
**same DNS-access dependency as the custom web address** (`docs/handoff-custom-domain.md`) — `fitazgym.com` DNS is managed via
Shopify/registrar and needed Georgio to add the records. That access is now
sorted, so the branded domain is live.

## To re-enable in a fresh environment (reference)

If email ever needs setting up again from scratch (new Vercel project, etc.):

1. Create/confirm a Resend account (https://resend.com) and generate an API key.
2. Verify the `@fitazgym.com` sending domain in Resend (add the DNS records it
   gives you). Or, to prove the flow fast without DNS, leave the from-address as
   the `onboarding@resend.dev` testing sender first.
3. Set the env vars above in Vercel (Production, and Preview if you want to test
   there).
4. Redeploy — Vercel doesn't apply env changes to existing deployments.
5. Confirm `PT_MANAGER_EMAIL` points at where the daily digest should land.

## How to verify (used to confirm this is live)

- **Allocation email:** allocate a test lead to a trainer whose roster email is
  a real inbox you control; confirm the email arrives. ✅
- **Daily digest:** trigger the cron endpoint manually (with the `CRON_SECRET`)
  or wait for the scheduled run, and confirm the digest lands in `PT_MANAGER_EMAIL`. ✅
- Check Resend's dashboard logs for delivery/bounce status.

## Optional polish (code) — done

Both of the items that used to live here are now built in `src/lib/email.ts`:

- **Branded HTML templates.** Each email now sends as both HTML (monochrome, to
  match `/admin`) and plain text (fallback + deliverability). Lead-supplied
  fields are HTML-escaped. Tweak the copy or styling in that one file.
- **Real dashboard link.** Set `NEXT_PUBLIC_SITE_URL` (e.g.
  `https://pt-management-two.vercel.app`, or the custom domain once it's live)
  and both emails render an "Open the dashboard" button linking to `/admin`. If
  it's unset, they fall back to the plain sentence — so this is a nice-to-have,
  not a fourth blocker. Add it alongside the three env vars above if you want the
  links.

## Definition of done — ✅ met

Allocating a lead emails the trainer, the daily digest reaches the manager, both
send from the branded `noreply@mail.fitazgym.com` from-address, and the cron
endpoint rejects unauthenticated calls. All confirmed in production.
