# Fitaz Gym member email series

Member-facing lifecycle emails, separate from the two internal ops emails in
`src/lib/email.ts` (trainer allocation, manager daily digest). Those tell staff
what to do. These talk to members.

| # | Email | Sent | Angle | Status |
|---|-------|------|-------|--------|
| 1 | `01-welcome-nurture` | Day 1 | You already own a session | Built |
| 2 | `02-plan-not-motivation` | Day 10 | The plan runs out, not the motivation | Built |
| 3 | `03-last-call` | Day 30 | It closes in seven days | Built |

Three emails, one CTA between them: complete the `/pt-session` form. The
complimentary session **expires on day 37**, seven days after email 3 lands.

## Why three, and why these three

The count is not the point. **Each email needs its own reason to exist.** Three
variations of "did you see our last email" is spam; three different angles on
the same offer is a sequence. So:

- **Day 1** sells nothing. It tells a brand new member they already own
  something and explains how to claim it, while motivation and permission are
  both at their peak.
- **Day 10** does not mention the offer until the fourth sentence. By now the
  member has either been in a few times and is cycling the same three machines,
  or has already missed a few days. The email leads with that problem and
  arrives at the session as the fix, so it reads as useful rather than as a
  chase.
- **Day 30** is the deadline, and it is the shortest of the three on purpose.
  Deadline emails dilute when padded. It states the date, restates the offer
  once for anyone who never opened the first two, and gives a clean way out.

**Do not add a fourth.** Past three, on a young sending domain, you are training
members to ignore gym email and teaching filters to bin it.

## The expiry is what makes email 3 work

Without a real deadline, email 3 has nothing to say: "it is still available" is
not a reason to open anything, and an offer with no end has no urgency ever.

The window is deliberately short and late: **the session expires seven days
after email 3**, on day 37. A 60 day expiry announced on day 30 would be
forgotten by day 45. Seven days is close enough to act on.

**The deadline must be real.** If somebody replies on day 40 and gets the
session anyway, the mechanism is spent for every member they talk to. The one
sanctioned exception is in the copy itself: email 3 offers to hold it for anyone
who replies before the date, which converts the pressure into a conversation
rather than a lost lead.

It also has to be true from the start, which is why **email 2 states the expiry
as a plain fact** in its closing panel. A deadline that appears from nowhere on
day 30 reads as invented, and the sceptical members are exactly the ones you are
still trying to convert.

## How this runs alongside the PT contact list

The emails are automated in GymMaster off the member's own join date, so the
day 1, 10 and 30 timings are exact per member rather than batched. The PT
outreach runs alongside it, but **deliberately behind it**:

| Day | What happens |
|-----|--------------|
| 1 | Email 1 |
| 10 | Email 2 |
| ~11 | Anyone who has not responded goes to the PTs as an unverified lead |
| 30 | Email 3 |
| 37 | The session expires |

**Why the PTs come after email 2 rather than before email 1.** The emails do the
easy conversions on their own, and the people who convert that way arrive as
warm leads carrying their goals, their time preference and their trainer
preference, which is what makes the allocation deliberate instead of arbitrary.
The PTs then spend their calls only on people who actually need a call. Handing
the whole list over on day one means ringing people who would happily have
filled in a form, and it contradicts the email, which promises the member gets
matched to a trainer on purpose.

**Before handing the list over**, remove anyone who has already responded. That
is the members now on the lead board with `Source = form`.

## Who to leave out of emails 2 and 3

Anyone who has already dealt with it. The lead board is the source of truth, and
**Export CSV** on the board gives you both the status and the email address.

**Before email 2:** drop `Source = form`. They have responded.

**Before email 3:** drop `Source = form`, plus anyone whose status is **Booked**,
**Completed** or **Not interested**. By day 30 the PTs have worked the list, so
this is the send where it matters. "Not interested" especially: somebody who
told a trainer no on the phone and then gets "your session closes in seven days"
is how you earn a spam complaint.

**Keep "Unreachable" in.** A PT could not get them on the phone, which makes them
exactly who email is for. Probably the highest value segment in the sequence.

**Email 3 is written to survive reaching the wrong person.** It never asserts
that the member has not claimed their session: it states the deadline as a fact
about the offer and puts the only conditional on the action, "if you have not
used yours yet". Its closing block then covers both cases out loud, someone who
already had their session and someone who never wanted one. So a suppression
miss is mildly redundant rather than plainly wrong.

That is a safety net, not a reason to skip the export. An email that reads as
though nobody checked still costs you, it just costs less.

Doing this properly is also what lets emails 2 and 3 be written straight. Without
it the copy would have to hedge every sentence with "in case you have not
already", which weakens it for the people who have *not* booked, who are the only
audience it is for. Both emails carry a single "already booked in? ignore this
one" line as a safety net, but that line is not a substitute for the export.

**Before email 3, also drop anyone who did not open 1 or 2.** Sending a third
email to people who have opened nothing is what gets a new sending domain
filtered. Three emails to 60% of the list beats three to 100% and landing the
whole gym in spam.

## Files

Each email has an HTML part and a plain text part. **Send both.** A multipart
message measurably improves inbox placement, and some members read in clients
that prefer text.

- `01-welcome-nurture.html` / `.txt`
- `02-plan-not-motivation.html` / `.txt`
- `03-last-call.html` / `.txt`

**These carry their own header and footer.** The club template is not being
used: it brought a stylesheet that fought the templates at every turn, and
without it everything renders as designed. The masthead is the official logo
served from `pt.fitazgym.com`, and the footer carries the socials, the address,
the permission line and the unsubscribe.

**Superseded paragraph, kept for context:** GymMaster's club template supplies the header
and footer, so the templates carry no wordmark, no address, no social icons and
no unsubscribe link. They open on the eyebrow line and close on Karl's sign off.
All three share the same dark mode rules and button code, lifted from email 1
rather than rewritten, so the series cannot drift.

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
to. There is no secondary ask and no newsletter sign up. The only other link is
the trainer page, and it sits below the closing call to action where it cannot
pull anyone out of the flow before they have had both chances to click. One
email, one action, asked twice.

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

**Email 1**, using the gym's own words from `/pt-session`:

> **{58:Member First Name}, your first session is on us**

Test against:

- *Your first PT session is already included* — entitlement framing, no name.
- *One thing to sort before your first workout* — curiosity plus urgency.
- *We just need to know one thing* — shortest, highest curiosity, weakest clarity.

**Email 2:**

> **Most people run out of plan, not motivation**

Test against *{58:Member First Name}, week two is the tricky one* and *The same three
machines*. Do not use anything that reads as a reminder about email 1. The whole
point of this one is that it opens on a different subject.

**Email 3:**

> **Your complimentary session closes in seven days**

Test against *Seven days left* and *Last call on your first session*. A named
date would be harder to defer than a relative one, but GymMaster cannot do the
date arithmetic, so "seven days" is what we have. It is always true, because
the email only ever fires on day 30.

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

The files carry **GymMaster's own merge syntax**, so they import as-is. There
is exactly one tag.

| Tag | Value | Notes |
|-----|-------|-------|
| `{58:Member First Name}` | Member's first name | Set a fallback of "there". A blank name renders "Welcome to Fitaz Gym, ." |

**There is no expiry date tag, deliberately.** The templates used to carry
`{{expiry_date}}`, a per-member date 37 days after joining. GymMaster cannot do
that arithmetic, so the copy states the deadline in relative terms instead:
"closes in seven days" in email 3, and "will not stay open forever" in email 2.

That costs the specificity of a named date, which would have been the stronger
deadline, and buys back something worth having: nothing to compute, nothing to
get wrong, and no risk of telling a member their session expired when it had
not. It stays true because email 3 only ever fires on day 30, exactly seven days
out. **If you change the send day, change the copy**, in the headline, the lead
paragraph and the sign off in email 3, and in the closing block of email 2.

**There is no unsubscribe link in the footer at all.** One was there, pointing
at a `{{unsubscribe_url}}` placeholder, and it was removed on 19 August 2026
because a visible link that goes nowhere is worse than none while testing.

**It has to come back before a member facing send.** The club template is not
being used, so nothing else supplies one, and an unsubscribe is not optional on
marketing mail to members. What is needed is GymMaster's own unsubscribe token,
in `{58:...}` style, which nobody has found yet. Put it back in the footer of
all three templates once it is known.

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
return **4 in each HTML and 2 in each text part**, for all three emails. Each
email asks twice, and each HTML button is written twice (VML plus anchor), so
the numbers are the same across the series.

## No header or footer, on purpose

**The templates carry both again**, as of 19 August 2026, because the club
template is not being used. What follows describes the arrangement while it
was, and is kept because the reasoning still applies if anyone turns it back on.

GymMaster's club template already supplies a
header and footer to every email it sends, so anything of ours would have
duplicated it: two wordmarks, two addresses, two unsubscribe links.

So these files open straight on the eyebrow line and close on the sign off.
Removed from all three: the FITAZ GYM wordmark and the rule under it, and the
whole dark footer block with its social icons, gym address, permission line and
unsubscribe links.

**Verify these are in GymMaster's footer before sending anything.** They were
ours and are now not:

- **An unsubscribe link, and a `List-Unsubscribe` header.** Not optional on a
  member facing send. If the club template does not carry one, it has to go back
  into the templates before a single email goes out.
- **The gym's postal address.** Required for anti-spam compliance.
- **A permission line** saying why the member is receiving it.

`public/email/icon-facebook.png` and `icon-instagram.png` are no longer
referenced by any template. They are left in place rather than deleted, since
they are small and may be wanted if these ever have to stand alone again. The
full-chrome versions are in git history if that day comes.

## Build notes

Things in the file that are deliberate, so nobody "tidies" them away:

- **No images at all.** Everything is live text, so the email renders
  identically whether or not images are blocked, which is how a good share of
  first sends land. It also keeps the message small, which helps Gmail clipping.
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
| Header and footer | **Ours.** Logo masthead, and a footer with socials, address, permission line and unsubscribe. |

Set the template background to `#f5f5f7`, content width 600px, and the global
font stack to `'Helvetica Neue', Helvetica, Arial, sans-serif`. Turn dark mode
on and set the dark palette to canvas `#000000`, surface `#161618`, fill
`#232326`, text `#f5f5f7`, secondary `#a1a1a6`, and an inverted button of
`#f5f5f7` with `#1d1d1f` text.

## Why alignment breaks inside GymMaster, and the rule that prevents it

GymMaster pastes our HTML inside its club template, and that template brings
its own stylesheet. **Any CSS rule it carries beats `align=` and `valign=`**,
because presentational attributes map to the very bottom of the cascade. So a
club template with nothing more exotic than

```css
td { text-align: left; vertical-align: middle; line-height: 1.6; }
p  { text-align: left; }
```

is enough to push every digit to the bottom left of its numbered disc, drop the
discs to the middle of their row instead of level with the heading, and shove
the line under the first button hard left. That is exactly what Karl
photographed on 18 August 2026, and it was reproduced here by wrapping the
template in those four rules.

Inline `style` beats an ordinary rule, so the first fix was:

> Anything whose position matters states it **inline as well as** in the
> attribute. Keep `align="center"` and `valign="top"` for the old Outlook
> renderers that only understand attributes, and add `text-align:center` and
> `vertical-align:top` to the `style` for everything else.

That is still worth doing, and it is **not enough**. On 19 August 2026 GymMaster
rendered three paragraphs hard left that each carried an inline
`text-align:center`. Only `!important` in a host stylesheet can do that, so the
club template has something on the order of `p { text-align: left !important }`.

**The rule that actually holds: centred text must not be a `<p>`.**

A rule targeting `p` cannot reach a `<td>`. So `make-cms-safe.py` rewrites every
centred paragraph into a shrink-to-fit table, centred with `align="center"` and
`margin:auto`, with the typography moved onto the cell and the paragraph's
margin becoming the cell's padding. That gives three independent mechanisms:

1. `align="center"` on the table, an attribute,
2. `margin-left:auto; margin-right:auto` inline on the table,
3. `text-align:center` inline on the cell.

The first two position the table by **margin**, not by text alignment, so no
`text-align` rule at any weight can move them. The block survives losing any two
of the three.

`host-template-test.py` renders a template inside those hostile rules so this
shows up here rather than in a member's inbox:

```
python3 host-template-test.py cms-safe/01-welcome-nurture.html out.png
```

Check the numbered discs and the line under the first button. If they hold
under that, they will hold in the club template.

One thing the cascade cannot save: **a table is block level**, so a parent
cell's `text-align` will never centre it. Button tables need `align="center"`
on the table itself. `make-cms-safe.py` sets that by walking `<td>` depth to
find the genuinely enclosing cell.

That same property is what makes the table trick above work. Being immune to
`text-align` is a problem when you want a table centred and a feature when a
host stylesheet is forcing everything left.

## Where the images come from, and which host is temporary

| URL | Live? |
|---|---|
| `s1.designmodo.com/postcards/image-1742259265784-61d271ee.png` | **Yes.** The masthead logo, temporarily |
| `pt.fitazgym.com/email/icon-facebook.png` | **Yes.** Already on the deployed branch |
| `pt.fitazgym.com/email/icon-instagram.png` | **Yes.** Already on the deployed branch |

**The logo is on Designmodo's CDN on purpose, and it is temporary.** It was
pointed at `pt.fitazgym.com/brand/fitaz-gym-logo-official.png` first, which is
where it belongs, and that 404s: the file exists only on the email branch, so
GymMaster rendered a broken image and the alt text. Designmodo is already
serving that exact file to members through the Postcards onboarding email, so it
resolves today and needs nothing deployed.

**Swap it back once the email branch ships.** Depending on a Designmodo project
for an email GymMaster sends is a thread nobody will remember is there: if the
Postcards project is deleted or reorganised, the logo breaks in every send.

Two things follow from the CDN file being the padded one:

- **The box is 240x60, not 230x30.** That canvas is 2000x500 holding a 1924x251
  mark, so it is half empty. Sizing the box at 240x60 lands the mark itself at
  30px tall. The padding is transparent, so the extra height does not show.
- **Dark mode gets a white plate rather than a reversed logo.** There is no
  reversed copy on that CDN, and a black mark on the near black canvas we
  deliberately switch to would vanish. `public/email/fitaz-gym-logo-white.png`
  is ready for when the swap comes back.

## Before the first send

- [ ] Render test across Gmail web, Gmail app, Apple Mail, Outlook desktop and
      Outlook.com, in both light and dark mode.
- [ ] **Put the unsubscribe link back**, using GymMaster's real token. It was
      removed while testing and the footer currently has none at all.
- [ ] **Point the logo back at `pt.fitazgym.com` once this branch is deployed**,
      and restore the reversed logo for dark mode with it. See the table above.
- [ ] **Confirm a `List-Unsubscribe` header is set.** That is a header, not
      markup, so it cannot come from the template. GymMaster has to add it.
- [ ] Confirm the logo and the two social icons load from `pt.fitazgym.com`,
      and that the email still reads correctly with images blocked. All three
      carry alt text, so it should.
- [ ] Check with images blocked. Nothing should change, since there are none.
- [ ] Confirm the total HTML is under 102KB so Gmail does not clip the closing
      CTA.
- [ ] Send a live seed test to a real inbox and click both buttons.
- [ ] Confirm `{58:Member First Name}` has a fallback and test a record with no name.
- [ ] Confirm the unsubscribe link works and writes to the suppression list.
- [ ] Confirm `Reply-To` reaches a monitored inbox, because the copy invites replies.
- [ ] Confirm SPF, DKIM and DMARC pass on `fitazgym.com`.

## What to measure

Click through to `/pt-session` is the vanity number. The number that matters is
**form submissions attributed to this send**, because that is the unverified to
warm conversion the email exists to produce. Watch it against the leads the gym
gets with no email at all, and watch reply volume separately, since replies are
warm leads that never touch the form.
