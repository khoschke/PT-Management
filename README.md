# Fitaz Gym: Complimentary PT Session leads

A lead intake and allocation system for Fitaz Gym's complimentary PT
consultation offer. New members fill in a short form, or the PT Manager
enters them by hand off a GymMaster sweep, and the PT Manager allocates
each lead to one of the five trainers within 48 hours.

Two ways in, one pipeline:

- **The form** (`/pt-session`), public, no login. A warm lead, opted in.
- **Add sweep lead**, inside the dashboard. A cold lead, entered by hand.

Everything lands in the same lead board, with the source visible on every
card, because it changes which script the trainer uses on the call.

## Stack, and why it suits a five trainer gym

- **Next.js (App Router) + TypeScript + Tailwind** on **Vercel**. A gym this
  size gets a handful of form submissions and dashboard sessions a day.
  Vercel's Hobby tier handles that without breaking a sweat, and the daily
  digest only needs to run once a day, which is exactly what Hobby cron
  jobs allow.
- **Supabase** for Postgres, auth and row level security. The free tier
  gives 500MB of database and 50,000 monthly active users, which is wildly
  more than a gym with five trainers, one manager and ~30 leads a month
  will ever touch. Row level security means the database itself enforces
  who can see what, not just the app code, which matters for the privacy
  requirements below.
- **Resend** for the two email notifications, entirely optional. Free tier
  covers 3,000 emails a month and 100 a day. This gym will send a few dozen
  a month at most.

None of that is a bad call at this scale. If Fitaz ever opens more
locations or the PT program grows to dozens of trainers, revisit Vercel's
plan (more cron frequency, more bandwidth) and Supabase's plan (more
database size, point in time recovery) at that point, not before.

## Setup

### 1. Create the Supabase project

1. Create a new project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the migrations in order:
   `supabase/migrations/0001_init.sql`, then
   `supabase/migrations/0002_onboarding.sql`, then
   `supabase/migrations/0003_trainer_bio.sql`, then
   `supabase/migrations/0006_trainer_documents.sql`. Optionally run
   `supabase/seed.sql` to add five placeholder trainers.
3. The documents feature stores files in a **private** Storage bucket called
   `trainer-documents`. The `0006` migration creates it and its access
   policies automatically. If your project blocks writes to the `storage`
   schema from the SQL editor, create it by hand instead: Storage > New
   bucket, name it `trainer-documents`, leave **Public** off, then re-run
   just the `storage.objects` policy statements at the bottom of `0006`.
4. Under Project Settings > API, copy the project URL, the `anon` public
   key and the `service_role` key.

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings > API. Keep this secret, never expose it to the browser |
| `IP_HASH_SALT` | Any long random string, e.g. `openssl rand -hex 32` |
| `RESEND_API_KEY` | [resend.com](https://resend.com), optional, leave blank to run without email |
| `NOTIFICATIONS_FROM_EMAIL` | The "from" address for notification emails, needs a domain verified in Resend, or use their shared `onboarding@resend.dev` sender for testing |
| `PT_MANAGER_EMAIL` | Where the 7am daily digest, document-review alerts and document-expiry reminders go |
| `CRON_SECRET` | Any long random string. Set the same value in Vercel's project settings, Vercel sends it automatically on cron requests |

### 3. Create the manager and trainer logins

There's no in-app sign-up screen, on purpose, five trainers and one
manager don't need one. In the Supabase dashboard:

1. Authentication > Users > Add user, for the PT Manager and each trainer.
   Set a password directly, no email confirmation needed for a staff tool
   like this.
2. In the SQL editor, link each auth user to a role:

   ```sql
   -- The PT Manager
   insert into profiles (id, role, full_name)
   values ('<user-id-from-auth-users>', 'manager', 'Manager Name');

   -- A trainer, linked to their row in the trainers table
   insert into profiles (id, role, trainer_id, full_name)
   values ('<user-id-from-auth-users>', 'trainer', '<trainer-id>', 'Trainer Name');
   ```

### 4. Run it locally

```bash
npm install
npm run dev
```

The form is at `/pt-session`, the dashboard is at `/admin`, and the PT
onboarding workbook is at `/onboarding` (behind the same login).

### 5. Deploy to Vercel

1. Push this repository to GitHub and import it in Vercel.
2. Add the same environment variables from step 2 in the Vercel project
   settings.
3. Deploy. `vercel.json` defines two daily cron jobs: the 7am AEST lead
   digest (`0 21 * * *` UTC) and the 8am AEST document-expiry check
   (`0 22 * * *` UTC). Brisbane doesn't observe daylight saving, so these
   offsets are fixed year round.
4. The Fitaz Gym wordmark lives at `public/logo-fitaz.svg`. It's a vector
   rebuild of the brand mark, so it stays crisp at any size. To use the
   official asset instead, drop it in and update the `Image` src on the
   public form and login pages.

## Running this day to day, for the PT Manager

**When a new member fills in the form**, they show up on the lead board at
`/admin` immediately, tagged **Form (warm)**. You've got 48 hours from when
they submitted to make first contact, shown as a countdown on their card:
green with time to spare, amber under 12 hours, red once it's overdue.

**When you sweep GymMaster for new members who didn't fill in the form**,
click **Add sweep lead** on the dashboard. Only name and phone are
required, so you can move fast through a list. These are tagged **Sweep
(cold)**, so whoever calls them knows not to assume the member has opted in
or knows what the call is about.

**To allocate a lead**, click into it. The dashboard suggests a trainer and
tells you why in one line, for example "Requested by name" or "Shares 2
goals (Build muscle, Get stronger); 3 active leads on their books." You can
take the suggestion or pick anyone else from the dropdown, it's always your
call.

**As you work a lead**, update its status: New → Allocated → Contacted →
Booked → Completed, or Not interested / Unreachable if that's how it goes.
Add notes as you go, especially anything the trainer needs to know before
they call.

**Every morning at 7am**, if email is turned on, you get a summary: new
leads overnight, anyone approaching the 48 hour mark, and anyone already
overdue. The dashboard always shows the same thing live, the email is just
a nudge.

**To get your data out**, use the Export CSV button on the dashboard. It
exports exactly the leads you're currently looking at, so filter first if
you only want, say, this week's sweep leads.

**If a trainer leaves**, deactivate them on the Trainers page rather than
deleting them. They disappear from the public form and the allocation
suggestion, but every lead they've already worked stays on record.

**If a member asks you to delete their details**, open their lead and use
Hard delete. This is permanent and can't be undone, unlike the ordinary
status changes, which are all soft and reversible.

## PT onboarding dashboard

`/onboarding` is the 10-part PT Onboarding Workbook as an interactive
dashboard, behind the same Supabase login as `/admin`. It's deliberately
styled apart from the plain black-and-white lead board: system font stack,
soft depth, and light/dark mode, closer to Apple's own product language,
since this is a personal companion a trainer lives in for 12 weeks rather
than a staff operations tool.

- **Trainers** work through each part's activities; answers autosave to
  `onboarding_responses` and are visible only to that trainer and to
  managers, enforced by row level security exactly like `leads`.
- **Managers** see the same 10 parts and can flip to **Manager view** (the
  toggle in the header) to reveal, alongside the trainer's material, two
  kinds of coaching content drawn from the PT Manager Cheat Sheet: yellow
  **Manager notes** (how to use each section in a 1:1) and green **Worked
  examples** (model answers in the voice of the example trainer, Taylor).
  The trainer material is identical in both views, so the two documents can
  never say different things — the manager lens only adds, never rewrites. A
  trainer can flip to Manager view too; nothing in it is sensitive.
- Content lives in code, not the database: `src/lib/onboarding/parts/*.ts`,
  one file per part, each section carrying its own `managerNote` and
  `workedExample`. Editing the workbook means editing those files, not a
  CMS. All 10 parts are populated from the full workbook and the full PT
  Manager Cheat Sheet (~90 manager notes and ~45 worked examples).

## Privacy

This system holds member contact details under the Australian Privacy
Principles, so:

- The form tells members plainly what happens to their details and who
  sees them.
- Trainers can only see leads allocated to them, enforced by the database
  itself (row level security), not just by hiding buttons in the UI.
- No third party analytics, no tracking pixels. The only place data leaves
  Supabase and Vercel is the two notification emails through Resend, which
  is inherent to sending email at all, and only ever sends what's needed
  for that one notification.
- Deleting a lead is soft by default (hidden, not gone). A manager can hard
  delete permanently for a member who specifically asks to be removed.

## Decisions I made

A few judgement calls, flagged here rather than left for you to discover:

- **Rate limiting is a Postgres function, not a paid service.** Adding
  Upstash Redis or similar is the usual way to rate limit on Vercel, but it
  means another account to set up for not much benefit at this scale. A
  `check_form_rate_limit` function counts submissions per hashed IP over a
  10 minute window (capped at 8) directly in Postgres. Good enough for
  stopping a script hammering the form, deliberately loose enough not to
  block a foyer full of members sharing a tablet.
- **Login is email and password, not a magic link.** Supabase's own
  transactional email (used for magic links) is heavily rate limited on
  the free tier, a few emails an hour, which would make signing in
  unreliable for six staff. Password login sidesteps that entirely. There's
  no self-service sign-up screen: accounts are created by whoever manages
  the Supabase project, see Setup step 3. That's an intentional trade-off
  for a five person team, not an oversight.
- **CSV export runs in the browser, not through a server endpoint.** The
  dashboard already has the full filtered lead list loaded (this gym
  generates maybe 30 leads a month, the whole history is a small dataset),
  so building it into a downloadable file client side avoided duplicating
  the filter logic on the server for no real benefit.
- **Gender preference is a soft hard filter.** The brief calls it a hard
  filter, and it is, right up until it would leave zero trainers to
  suggest from. With five trainers the gender split won't always allow a
  strict match, so if nobody active matches the stated preference, the
  suggestion falls back to the full trainer list rather than refusing to
  suggest anyone. The one line reason always says exactly what happened.
- **Status history shows timestamps and transitions, not who made each
  change by name.** The `status_history` table does record the acting
  user's ID, but showing their name in the panel needs a join Supabase's
  automatic API can't do in one query (no direct foreign key between
  `status_history` and `profiles`). Left as a known gap rather than adding
  a bespoke database function for it, since the timestamps alone already
  answer "where are leads sitting too long," which is the question this
  was for.
- **The public form and dashboard ignore the visitor's system dark mode.**
  Deliberately always light, black text on white, to keep the "the gym
  paid for this" look consistent regardless of whoever's phone it's opened
  on.
- **Goals and specialties are a shared free text list in code
  (`src/lib/goals.ts`), not a database enum.** Adding a new goal option
  later is a one line change to that file, no migration required. Trade
  off: the database doesn't enforce the goal codes are valid, that's done
  in the application layer instead.
- **Trainer deletion isn't exposed anywhere**, only deactivation. Trainers
  are referenced by historical leads, hard deleting one would either break
  that history or need to be blocked by the database anyway, so it was
  left out entirely rather than built and then disabled.

## Project layout

```
src/
  app/
    pt-session/        the public form
    admin/
      login/            sign in
      (dashboard)/       lead board, trainer roster (all behind auth)
        documents/       a trainer's own compliance documents (self-service)
        compliance/      manager: all-trainer overview, per-trainer review,
                          [trainerId]/ and types/ (document-type config)
    onboarding/         PT onboarding workbook dashboard (behind auth)
      [part]/            one of the 10 parts
      components/        activity fields, manager-view toggle, parts nav
    api/cron/daily-digest/     7am AEST lead digest, called by Vercel Cron
    api/cron/document-expiry/  8am AEST document-expiry reminders
  lib/                  shared logic: validation, allocation engine, email,
                         the 48 hour clock, documents (expiry/status rules),
                         Supabase clients
    onboarding/         workbook content (parts/*.ts) and progress helpers
supabase/
  migrations/0001_init.sql            schema, RLS policies, triggers
  migrations/0002_onboarding.sql      onboarding responses and part progress
  migrations/0003_trainer_bio.sql     trainer free-text bio field
  migrations/0006_trainer_documents.sql  compliance documents, types,
                                       reminders, private Storage bucket
  seed.sql                    five placeholder trainers
```

## PT compliance documents

Each trainer has a **My documents** area to upload qualifications, CPR/First
Aid, insurances and free-text "other" items (a Blue Card, say). Files live in a
private Supabase Storage bucket, served only through short-lived signed links.

- **Per-type expiry rules.** Qualifications never expire, CPR/First Aid and
  insurances require an expiry date, "other" makes it optional. The manager can
  add, rename, hide or re-rule document types under Compliance > Manage
  document types. There's no limit on how many documents a trainer holds.
- **Manager review.** A trainer's upload lands as *Pending review* and emails
  the manager; the manager verifies or rejects it (with an optional reason).
  Documents the manager uploads are verified on the spot.
- **Expiry reminders.** The daily `document-expiry` cron emails both the trainer
  and the manager at 60, 30 and 7 days before an expiry, then daily once it has
  lapsed. Uploading a replacement with a later expiry, once the manager verifies
  it, stops the reminders.
  Every reminder is logged so a re-run never double-sends. Like the lead digest,
  it's a no-op when email isn't configured.
- **Compliance dashboard.** The manager's Compliance tab shows every trainer's
  status at a glance — expired, expiring soon, pending review or all current —
  and links through to each trainer's documents.
