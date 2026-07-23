# Handoff: Turn On Email Notifications

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

## What this is

The app already has two notification emails **fully built** in `src/lib/email.ts`:

1. **Trainer allocation email** — when the manager allocates a lead to a trainer,
   that trainer gets an email with the lead's details (`sendTrainerAllocationEmail`).
2. **Manager daily digest** — a morning summary of overnight leads, ones
   approaching the 48-hour mark, and breached ones (`sendManagerDailyDigest`),
   fired by the Vercel cron in `vercel.json` → `src/app/api/cron/daily-digest/route.ts`.

Both are **no-ops today**: if `RESEND_API_KEY` isn't set, `emailEnabled` is false
and the send functions return early. The dashboard works exactly the same with
email off — email is a convenience layer, not a dependency. Turning it on is
**pure configuration, no code changes required** (unless you want to customise
the copy or the from-address).

## What's blocking it (all operational, not code)

Three environment variables are unset in Vercel:

- `RESEND_API_KEY` — the Resend account's API key.
- `NOTIFICATIONS_FROM_EMAIL` — the "from" address (defaults to
  `Fitaz Gym <onboarding@resend.dev>` if unset, which works for testing but
  isn't branded).
- `CRON_SECRET` — protects the daily-digest cron endpoint from being triggered
  by anyone. Check `src/app/api/cron/daily-digest/route.ts` for how it's read,
  and set the matching value in Vercel.

## Steps

1. **Create/confirm a Resend account** (https://resend.com) and generate an API key.
2. **Verify a sending domain in Resend.** To send from `@fitazgym.com` (recommended,
   for deliverability and branding), Resend gives you DNS records (SPF, DKIM, and a
   return-path) to add to `fitazgym.com`'s DNS.
   - **This is the same DNS-access dependency as the custom web address**
     (`docs/handoff-custom-domain.md`): `fitazgym.com` DNS is managed via Shopify
     (or possibly the registrar), and Karl needs Georgio to add the records or
     grant access. Sort DNS access once and you can do both the branded URL and
     email at the same time.
   - **Fast start without DNS:** you can leave the from-address as the Resend
     `onboarding@resend.dev` testing sender to prove the flow end-to-end first,
     then swap `NOTIFICATIONS_FROM_EMAIL` to `@fitazgym.com` once the domain
     verifies. Test-domain email is fine for internal testing but not for real
     member-facing volume.
3. **Set the three env vars in Vercel** (Project → Settings → Environment
   Variables), for Production (and Preview if you want to test there).
4. **Redeploy** so the new env vars take effect (Vercel doesn't apply env changes
   to existing deployments).
5. **Confirm `PT_MANAGER_EMAIL`** is set to where the daily digest should go
   (it's already set per PROJECT_STATUS, just double-check the address).

## How to verify

- **Allocation email:** allocate a test lead to a trainer whose roster email is
  a real inbox you control; confirm the email arrives.
- **Daily digest:** trigger the cron endpoint manually (with the `CRON_SECRET`)
  or wait for the scheduled run, and confirm the digest lands in `PT_MANAGER_EMAIL`.
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

## Definition of done

Allocating a lead emails the trainer, the daily digest reaches the manager, both
send from the intended from-address, and the cron endpoint rejects unauthenticated
calls.
