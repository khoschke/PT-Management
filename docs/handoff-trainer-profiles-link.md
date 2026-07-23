# Handoff: Link the PT Session Form to the Gym's Trainer Profiles

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

## The idea

On the public "Your Complimentary PT Session" form (`/pt-session`), give people a
way to see who the trainers are before/while they fill it in. Two options were
considered:

- **(A) Build a trainer-profile roster inside this app** — a new page rendering
  the roster from the `trainers` table (name, specialties, bio).
- **(B) Link out to the gym's existing trainer page** —
  https://fitazgym.com/pages/personal-trainers

**Decision: go with (B).** The gym site already has polished PT profiles, so
linking avoids duplicating and maintaining that content in two places.

## Requirements

- Add a link on the `/pt-session` page pointing to
  `https://fitazgym.com/pages/personal-trainers`.
- **It must open in a new tab** (`target="_blank"` with `rel="noopener noreferrer"`)
  so it does **not** navigate people away from the form they're partway through.
- Wording: something inviting like "Meet our trainers" / "See our personal
  trainers". Keep it consistent with the monochrome, Apple-inspired `/pt-session`
  styling (tokens in `src/app/globals.css`; look at the existing form markup in
  `src/app/pt-session/` for classes to mirror).
- Placement: sensible spots are near the top intro copy ("...book your
  complimentary session") or just above the submit button. Pick whichever reads
  best; a small text link is enough, it doesn't need to be a big button.

## Files

- `src/app/pt-session/page.tsx` and its components under
  `src/app/pt-session/components/` — this is where the public form lives.

## Watch-outs

- `/pt-session` is deliberately monochrome, light-mode only — match it, don't
  introduce colour.
- Don't hardcode this as an internal `next/link` route — it's an external URL, so
  a plain `<a>` with the new-tab attributes is correct.
- Confirm the exact gym URL is current before shipping (the page slug could change
  on the Shopify site).

## Definition of done

On the live `/pt-session` form, a clearly-worded link opens the gym's
personal-trainers page in a new browser tab, and the form's own state/scroll
position is untouched when they click it.
