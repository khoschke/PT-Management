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
