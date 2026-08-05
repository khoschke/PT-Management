# Fitaz Gym member email series

Member-facing lifecycle emails, separate from the two internal ops emails in
`src/lib/email.ts` (trainer allocation, manager daily digest). Those tell staff
what to do. These talk to members.

| # | Email | Trigger | Single goal | Status |
|---|-------|---------|-------------|--------|
| 1 | Welcome nurture | 24 hours after joining the gym | Complete the `/pt-session` form | Built |
| 2 | ... | | | Not started |

## Files

- `01-welcome-nurture.html` — production HTML, ready to send.
- `01-welcome-nurture.txt` — the plain text alternative. Send both parts. A
  multipart message measurably improves inbox placement, and some members read
  in clients that prefer text.

---

# Email 1: the 24 hour welcome nurture

## The job it does

A member who just joined is an **unverified lead**. The gym has their details
but they have not opted in to the PT offer, so nobody can legitimately work
them. The moment they submit `/pt-session` they land on the board as
`lead_source = "form"`, which `src/lib/email.ts` already describes to the
trainer as *"filled in the form themselves, so this is a warm lead"*, and the
48 hour first-contact clock starts.

So this email has exactly one job: **get the click that produces a form
submission.** Everything in it either drives that click or removes a reason not
to. There is no secondary ask and no newsletter sign up. The only other links
are the trainer page and the two social icons, and those sit in the footer
below the closing call to action, where they cannot pull anyone out of the
flow before they have had both chances to click. One email, one action, asked
twice.

## Why 24 hours is the right moment

Day one is peak motivation and peak permission. They have just spent money on
a decision they feel good about, and they have not yet had the first week where
life gets in the way. Waiting until day three or day seven means competing with
buyer's remorse instead of riding the honeymoon.

## The strategic moves in the copy

**Reframe from offer to entitlement.** The email never sells a PT session. It
tells them they already own one. *"Your PT consultation and starter session
came with your membership"* and *"The session is already yours. This just tells
us who to send."* Claiming something you own is a far lower bar than accepting
something you are being offered, and it sidesteps the reflex that any free
fitness thing is a hook.

**Name the objection before they do.** The reason complimentary PT sessions go
unclaimed is almost never price. It is the fear of a hard sell and the fear of
looking unfit in front of a professional. The panel headed *"It is not a sales
pitch"* says both out loud and gives explicit permission to take the session
and never book another. Counterintuitively, removing the pressure is what makes
people take it.

**Unbroken scent trail.** The button says **"Get me booked in"**, which is
word for word the submit button on `/pt-session`. Click and landing page speak
the same language, so the page feels like the continuation of the email rather
than a new thing to evaluate.

**Pre-commit before the click.** The goal pills are the real options from
`src/lib/goals.ts`, shown before they click. Choosing mentally in the inbox
means the form is already half answered when it loads, and the page reads as
familiar rather than as a wall of fields.

**Reduce uncertainty, not just friction.** The three-step block makes the whole
process visible up front: what they fill in, that a human reads it, and that
somebody rings them inside 48 hours at the time of day they nominated. Every
step is a promise the system in this repo actually keeps.

**Five real names.** Dylan, Julie, Shahd, Karl and Michael, plus a link to the
trainer page on the main site. Real names carry more trust per byte than any
stock photo, and they cost nothing when images are blocked.

**A reply invitation.** *"Hit reply and tell us what is holding you back."*
Replies are the single strongest warm signal a member can send short of the
form itself, they give the gym the objection in the member's own words, and
they build sending reputation on the domain as a side effect.

## One email, both audiences

It goes to Fitness Passport and standard members together, so it is written to
be true for both, with one clearly marked block that answers the only question
a Passport member has that a standard member does not: *does this actually
apply to me, or is it just for full price members?* Left unanswered, that doubt
silently kills the click. Answering it costs standard members three lines they
can skip.

If you later want true variants, that block is the only thing that changes.
Replace it with your ESP's conditional, for example:

```
{% if membership_type == "fitness_passport" %} ...Passport block... {% endif %}
```

Do not split the whole email. The rest of the argument is identical for both,
and two templates means two things to keep in sync.

## Subject lines

Primary, using the gym's own words from `/pt-session`:

> **{{first_name}}, your first session is on us**

Test against:

- *Your first PT session is already included* — entitlement framing, no name.
- *One thing to sort before your first workout* — curiosity plus urgency.
- *We just need to know one thing* — shortest, highest curiosity, weakest clarity.

Send from a person, not a department: `Karl at Fitaz Gym`. Set `Reply-To` to a
monitored inbox, because the email explicitly invites replies.

**Preheader** (already in the file, edit it there):
*Two minutes to claim it. Tell us your goals and we will match you with the
right trainer.* It adds information rather than repeating the subject, which is
what the preheader slot is for.

## House rules for this series

Two conventions that apply to every email here, not just this one:

**The brand is always "Fitaz Gym", never "Fitaz" on its own.** That includes
mid-sentence copy, the sign off and the footer. The only exceptions are the
wordmark itself, where FITAZ and the GYM chip are separate design elements,
and the social profile addresses, which are fixed by the platforms.

**Every link opens in a new tab.** All seven anchors carry
`target="_blank"`, and both Outlook VML buttons carry it too, so the
behaviour is the same in Outlook as everywhere else. In a webmail client the
member keeps their inbox open behind the tab, which matters here: someone who
loses the email to navigate away is a member who cannot get back to the button
if they abandon the form halfway.

They also carry `rel="noopener"`, which stops the opened page from reaching
back into the referring window. Deliberately **not** `noreferrer`: that would
strip the referrer header and make email traffic show up in analytics as
direct, which quietly breaks attribution for the campaign.

## Merge tags

The file uses `{{tag}}` placeholders. Rename to your platform's syntax on
import.

| Tag | Value | Notes |
|-----|-------|-------|
| `{{first_name}}` | Member's first name | Set a fallback of "there". A blank name renders "Welcome to Fitaz Gym, ." |
| `{{unsubscribe_url}}` | ESP unsubscribe link | Required. Also set the `List-Unsubscribe` header. |
| `{{preferences_url}}` | Preference centre | Point at the unsubscribe link if there is no preference centre yet. |

## The call to action link

Both buttons point at the live custom domain, hardcoded rather than merged in:

```
https://pt.fitazgym.com/pt-session
```

It appears **four times** in the HTML, because each button is written twice: a
VML `roundrect` for Outlook and a styled anchor for everything else. It appears
twice more in the text part. Change it in all six places or the two clients
will disagree about where the button goes.

If you add campaign tracking, put the same query string on every one of those
six, otherwise the hero button and the closing button report as separate
campaigns and the real click through rate looks about half what it is. For
example:

```
https://pt.fitazgym.com/pt-session?utm_source=email&utm_medium=lifecycle&utm_campaign=welcome-24h
```

Sanity check before any send: `grep -c 'pt.fitazgym.com/pt-session'` should
return 4 for the HTML and 2 for the text part.

## Header and footer

Both match the rest of the Fitaz Gym series in Postcards, so this email sits
alongside the New Member Flow emails rather than looking like a one off.

**Header.** Centred FITAZ GYM wordmark with a hairline rule beneath it. The
wordmark is live text, not an image: light letter-spaced FITAZ next to a solid
GYM chip, mirroring `public/logo-fitaz.svg`. In dark mode the chip inverts to
white with dark type, the same flip the logo already implies.

**Footer.** A solid `#1d1d1f` block with rounded bottom corners, carrying the
Facebook and Instagram icons, the gym address, the permission line and the
unsubscribe links, all centred in white.

Two deliberate choices in there:

- **The footer block does not change colour in dark mode.** The icons are
  flattened onto `#1d1d1f`, so if the block shifted you would see two lighter
  tiles floating around the glyphs. Against the near black dark canvas the
  block still separates cleanly, so there is nothing to gain by moving it.
- **The compliance text lives inside the black block**, not on the canvas
  below it, so the block stays the last thing in the email exactly as it is in
  the other Fitaz Gym emails. `#a1a1a6` on `#1d1d1f` is about 6.5:1, comfortably
  past AA.

### The social icons

`public/email/icon-facebook.png` and `public/email/icon-instagram.png`, served
by the Next.js app from the same domain as the CTA:

```
https://pt.fitazgym.com/email/icon-facebook.png
https://pt.fitazgym.com/email/icon-instagram.png
```

96px assets displayed at 24px, so they stay sharp on retina. They are **opaque,
drawn on the footer colour rather than on transparency**, because Outlook
composites PNG alpha badly and would ring them with grey. That does mean the
footer colour and the icon background have to stay in step: if you ever change
`#1d1d1f` in the footer, regenerate the icons to match.

Both carry `alt` text, so with images blocked the footer degrades to two
readable "Facebook" and "Instagram" links rather than to empty boxes.

They point at the live profiles, hardcoded rather than merged in:

```
https://www.facebook.com/FitazfkGym/
https://www.instagram.com/fitazfk_gym/
```

The Instagram address is stored without the `?hl=en` that Instagram appends in
the browser. That parameter only forces the interface language for the person
clicking, so leaving it on would pin every member to English regardless of
their own setting, and it is not part of the profile address.

## Build notes

Things in the file that are deliberate, so nobody "tidies" them away:

- **The only images are the two social icons.** Everything else, including the
  wordmark, is live text. A meaningful share of first sends from a new domain
  render with images blocked, and this email loses nothing but the two glyphs.
  It also keeps the message small, which helps Gmail clipping.
- **Deliberate dark mode, not inherited.** The brand is black on white, which
  is exactly what Gmail and Apple Mail invert worst: the black pill button
  turns invisible against an auto-darkened card. The `@media (prefers-color-scheme: dark)`
  and `[data-ogsc]` blocks flip it on purpose instead, to a near black canvas
  with white type and a white pill. Still monochrome, still on brand.
- **Bulletproof buttons.** Both CTAs are VML `roundrect` for Outlook and a
  padded anchor everywhere else, so they render as a filled pill in every
  client rather than a bare blue link.
- **Outlook fallback for the goal pills.** `display:inline-block` pills are
  wrapped in a downlevel-revealed conditional, with a plain interpunct
  separated line served to Outlook, which does not handle inline-block padding
  reliably.
- **600px, single column, 24px side padding under 600px.** Buttons go full
  width on mobile so the tap target clears 44px.
- **Palette matched to `src/app/globals.css`**, so the email and the landing
  page are visibly the same product: `#f5f5f7` canvas, `#ffffff` surface,
  `#1d1d1f` foreground, `#6e6e73` secondary, `#e8e8ed` fill.
- **Australian English, and no em dashes anywhere,** per the house style in
  `docs/handoff-apple-design-pass.md`.

## Sending it

Two routes, depending on how much of this the gym wants to own.

**Via the existing Resend setup.** `src/lib/email.ts` already has a Resend
client, and Resend takes `html` and `text` directly. This email is a real
member-facing send though, so it needs three things the internal ops emails do
not: an unsubscribe link and `List-Unsubscribe` header, a suppression list, and
a trigger 24 hours after signup rather than on an app event. There is no signup
timestamp feed in this repo yet, so the trigger has to come from GymMaster (see
`docs/handoff-gymmaster-integration.md`) or from a manual weekly send.

**Via an ESP or Postcards export.** Paste the HTML into the campaign, map the
merge tags, and let the platform handle unsubscribe, suppression and the 24
hour delay. This is the lower risk option while the sending domain is still
being sorted.

Either way it is blocked on the same dependency as everything else email in
this project: a verified sending domain on `fitazgym.com`. See
`docs/handoff-email-notifications.md`. Do not send member-facing volume from
the `onboarding@resend.dev` test sender.

**Credentials never go in this repo.** API keys for Postcards, Resend or any
ESP belong in Vercel environment variables, the same as
`RESEND_API_KEY`. If a key has been pasted into a chat or a doc, rotate it.

## Rebuilding this in Postcards

Postcards was not reachable from the build environment, so this was authored as
hand written HTML rather than exported from the project at
`designmodo.com/postcards/app/project/acc01e58`. To recreate it there block by
block:

| Postcards block | Settings |
|---|---|
| Header / logo | Text block, not an image, centred. `FITAZ` at 30px, weight 300, letter spacing 6px, `#1d1d1f`. `GYM` at 13px, weight 700, letter spacing 1.5px, white on a `#1d1d1f` chip, 4px radius. 36px top padding, then a 1px `#e0e0e5` separator 22px below. |
| Hero | Eyebrow "INCLUDED WITH YOUR MEMBERSHIP", 12px, weight 700, letter spacing 1.6px, `#6e6e73`. Heading 44px desktop and 34px mobile, weight 600, letter spacing -1.2px, line height 48px. Body 18px on 29px, `#6e6e73`. |
| Button | Full width on mobile. Background `#1d1d1f`, white text, 17px weight 600, padding 19px by 40px, radius 999px. Caption underneath at 14px `#6e6e73`. |
| Divider | 1px, `#e0e0e5`, full content width. |
| Three steps | List block, 28px circular number badge in `#1d1d1f` with white numerals, title 17px weight 600, body 16px on 25px `#6e6e73`, 24px between items. |
| Callout | White card, 16px radius, 28px padding, on the `#f5f5f7` canvas. |
| Goal pills | Tag or badge block, `#e8e8ed` fill, `#1d1d1f` text, 14px weight 500, padding 11px by 16px, radius 999px, 8px gap. |
| Passport note | Quote block, 3px left rule in `#1d1d1f`, 18px left padding. |
| Closing panel | White card, 20px radius, centred, heading 24px weight 600, then the same button. |
| Footer | Solid `#1d1d1f` block, full container width, 24px radius on the bottom two corners only, 38px top and 34px bottom padding. Centred: 24px social icons with 22px between them, address at 16px white, then permission line and unsubscribe at 13px on 21px `#a1a1a6`. |

Set the template background to `#f5f5f7`, content width 600px, and the global
font stack to `'Helvetica Neue', Helvetica, Arial, sans-serif`. Turn dark mode
on and set the dark palette to canvas `#000000`, surface `#161618`, fill
`#232326`, text `#f5f5f7`, secondary `#a1a1a6`, and an inverted button of
`#f5f5f7` with `#1d1d1f` text.

## Before the first send

- [ ] Render test across Gmail web, Gmail app, Apple Mail, Outlook desktop and
      Outlook.com, in both light and dark mode.
- [ ] Confirm the two footer icons load from `pt.fitazgym.com/email/`, and that
      they sit flush on the black block with no grey ring around them.
- [ ] Check with images blocked. Only the two social icons should change, and
      they should fall back to readable "Facebook" and "Instagram" text.
- [ ] Confirm the total HTML is under 102KB so Gmail does not clip the closing
      CTA.
- [ ] Send a live seed test to a real inbox and click both buttons.
- [ ] Confirm `{{first_name}}` has a fallback and test a record with no name.
- [ ] Confirm the unsubscribe link works and writes to the suppression list.
- [ ] Confirm `Reply-To` reaches a monitored inbox, because the copy invites replies.
- [ ] Confirm SPF, DKIM and DMARC pass on `fitazgym.com`.

## What to measure

Click through to `/pt-session` is the vanity number. The number that matters is
**form submissions attributed to this send**, because that is the unverified to
warm conversion the email exists to produce. Watch it against the leads the gym
gets with no email at all, and watch reply volume separately, since replies are
warm leads that never touch the form.
