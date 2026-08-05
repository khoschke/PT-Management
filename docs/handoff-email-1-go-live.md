# Handoff: Get Email 1 Sending

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then
this, then `docs/emails/README.md` for the email itself.

## What this is

The 24 hour welcome nurture (`docs/emails/01-welcome-nurture.html`) is **built
and finished**. Nothing in the template is outstanding. Everything below is
operational, and none of it is a code change.

The open items are tracked here rather than in a chat thread so they can be
picked up cold. **If you are reviewing this and any item is still unticked,
raise it** rather than assuming it was handled elsewhere.

## Confirmed

- **`pt.fitazgym.com` resolves.** Confirmed by Karl, 5 August 2026. Every button
  in the email points at `https://pt.fitazgym.com/pt-session`, so this was the
  one thing that would have made the whole send pointless. It is fine.

## Open, with Georgio

### 1. Verified sending domain on `fitazgym.com`

The blocker for every email in this project, member facing and internal alike.
Resend needs SPF, DKIM and a return path added to `fitazgym.com` DNS, which is
managed through Shopify. Same DNS access as the custom web address, so sort the
access once and both jobs unblock. See `docs/handoff-email-notifications.md`.

**Done looks like:** the domain verifies in Resend, and SPF, DKIM and DMARC all
pass on a test send.

Do not send member facing volume from the `onboarding@resend.dev` testing
sender. It is fine for proving the flow internally and nothing else.

### 2. Sending platform: Resend or an ESP

Resend is already wired into `src/lib/email.ts`, but that is for the two
**internal ops** emails. This one goes to members, which needs three things the
raw Resend API does not provide:

- an unsubscribe link and a `List-Unsubscribe` header,
- a suppression list that is actually honoured on later sends,
- a scheduled delay rather than a send triggered by an app event.

An ESP gives all three out of the box. **Recommendation: use an ESP for the
member series** and leave Resend doing the internal ops emails it already does.
Splitting them is not duplication, they are genuinely different jobs.

**Done looks like:** a platform chosen, the HTML and text parts both imported,
and `{{first_name}}` mapped with a fallback of "there" so a blank name does not
render "Welcome to Fitaz Gym, ."

### 3. Where the 24 hour trigger comes from

**This is the item most likely to stall, and it has no default.** Nothing in
this repo knows when somebody joined the gym, so nothing can currently fire this
email automatically. Two routes:

- **GymMaster integration** (`docs/handoff-gymmaster-integration.md`). Gives a
  real signup feed and a true 24 hour trigger. More work, correct outcome.
- **Manual weekly batch** to everyone who joined that week. Ships immediately,
  but loses the 24 hour timing, which is most of why the email works: day one is
  peak motivation, and by day six the member has already had the week where life
  got in the way.

**Done looks like:** a decision recorded here, and if it is the manual route, a
named person and a day of the week.

## Then, before the first send

Work through the checklist at the end of `docs/emails/README.md`. The two that
get skipped:

- **`Reply-To` must reach a monitored inbox.** The copy says "it comes through
  to a real person at the gym, not a no reply inbox". If that is not true, the
  email is lying to members in writing.
- **The footer icons** load from `pt.fitazgym.com/email/`, which only exists
  once the email branch is merged and Vercel has deployed. Check them on a real
  send, not just in a preview.

## Definition of done

A member who joins the gym gets this email 24 hours later, from a verified
`@fitazgym.com` address, with working buttons, a working unsubscribe, and
replies landing somewhere a human reads them.
