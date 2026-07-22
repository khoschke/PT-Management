# Handoff: GymMaster Integration

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first for
the full lay of the land, then this.

## The goal

Replace the manual "sweep" (a PT Manager typing new members in by hand) with an
automatic connection to GymMaster, the gym's membership software.

- **Phase 1 — Pull (read):** on a schedule, fetch new member sign-ups from
  GymMaster and auto-create leads in this system (so they appear on the board
  with no manual entry).
- **Phase 2 — Write-back (write):** later, update the member's record/profile
  back in GymMaster from this system, so the two stay in sync. (The owner's
  "Ember file" note = the member's profile/details in GymMaster.) Build this
  second, with careful safeguards so we never corrupt member data.

## What you need before building (being gathered from the owners)

1. **GymMaster API access** — an API key/credentials. GymMaster's API typically
   must be enabled on the account. (An email requesting this has been sent to the owners.)
2. **GymMaster API documentation** — the exact endpoints, auth scheme, base URL.
3. **Which report/list = "new members needing a PT session"** — confirm the
   source of truth in GymMaster.

Do not hardcode any of these — the API key is an env var
(`GYMMASTER_API_KEY` or similar), set in Vercel.

## Suggested approach (Phase 1)

- Add a scheduled route (Vercel Cron, like the existing daily digest) that calls
  GymMaster, finds members created since the last run, and inserts leads.
- **Dedupe** so re-runs don't create duplicate leads — store the GymMaster
  member id on the lead (new column, e.g. `gymmaster_member_id`, unique) and
  skip ones already imported.
- Decide the `lead_source` for these: reuse `gymmaster_sweep`, or add a new
  enum value like `gymmaster_api` so auto-imported vs hand-entered are
  distinguishable on the board. (Adding an enum value is a small migration.)
- Map GymMaster fields → leads columns (name, phone, email, DOB if available).
  These arrive as COLD leads (member hasn't opted in), so treat script/tone
  accordingly, same as the current sweep.
- Add a small sync-log table or timestamp so you know the last successful pull.

## Constraints & gotchas

- **You cannot call GymMaster from the build workspace** (no outbound network
  here). Build the code, deploy to Vercel, and test the real API there. Write
  the integration defensively and log clearly so live debugging is easy.
- Respect GymMaster rate limits; page through results.
- Keep the manual "Add sweep lead" button working as a fallback.

## Definition of done (Phase 1)

A new sign-up in GymMaster shows up as a lead on the board automatically within
the sync interval, with no duplicates, correctly tagged as a GymMaster import,
and the manual entry path still works.

## Phase 1 build status (scaffolding in, API shape pending)

Everything that doesn't depend on GymMaster's exact API is built and passing
build/tsc/lint on branch `claude/gymmaster-phase-1-pull-7yuxuy`:

- **Migrations** `0004_gymmaster_lead_source.sql` (adds the `gymmaster_api`
  `lead_source` value — isolated because a new enum value can't be used in the
  same transaction that adds it) and `0005_gymmaster_sync.sql` (unique
  `leads.gymmaster_member_id` for dedupe, widened cold-lead goals check,
  `gymmaster_sync_log` table). **Not yet applied to the live Supabase project.**
- **Cron** `/api/cron/gymmaster-sync` (in `vercel.json`, daily `0 20 * * *`,
  an hour before the digest). CRON_SECRET-guarded, a clean no-op until the API
  is configured. Pulls members since the last successful `watermark`, dedupes
  on `gymmaster_member_id`, inserts cold `gymmaster_api` leads, logs every run.
  Note: Vercel **Hobby caps crons at once/day** — more frequent needs Pro.
- **Client seam** `src/lib/gymmaster/client.ts` + `mapMember.ts` — all wire
  format and field mapping live here. The board, badge, CSV, board filter and
  allocation email already understand the new source.
- **Env** `GYMMASTER_API_BASE_URL`, `GYMMASTER_API_KEY`, optional
  `GYMMASTER_BOOTSTRAP_DAYS` (see `.env.local.example`).

**Remaining when the owners send the API docs** — all confined to the client
seam, marked `TODO(gymmaster-docs)`: confirm the base URL / endpoint path, auth
placement (header vs query/body), the "created since" filter param, the
pagination shape, and the real member field names (the mapper currently reads
across likely spellings defensively). Then apply the two migrations to Supabase,
set the env vars in Vercel, and verify a live run writes a `gymmaster_sync_log`
success row and a deduped lead on the board.
