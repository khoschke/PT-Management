# GymMaster logo host email (to Danny)

A short internal email from Karl to Danny asking him to replace the three member
nurture templates inside GymMaster with ready-made copies, so the masthead logo
is served from `pt.fitazgym.com` rather than from Designmodo's CDN.

**Why it is written as an explanation rather than a request.** The emails look
fine today, so "please change this" on its own reads as fiddling. The email
spends most of its length on why an unchanged picture is a risk at all, in plain
terms, because the mechanism, an email referencing a remote image rather than
carrying it, is not obvious unless you have built one. Karl asked for it to be
explained to Danny the same way it was explained to him.

**It leads with the ready-made files**, Karl's call on 19 November 2026, because
pasting three attachments in is a smaller ask than finding and editing an
address by hand in three places. Editing in place is kept as the fallback for
anyone who would rather see the one-line change, and because it documents what
actually differs.

## Send details

**From:** Karl's own address
**To:** Daniel Catanzaro `daniel@fitazgym.com`

**Attach**, from `docs/emails/cms-safe/`:

- `01-welcome-nurture.html`
- `02-plan-not-motivation.html`
- `03-last-call.html`

**The CMS-safe copies, not the ones a directory up.** Those are what GymMaster
is given: no `<style>` block and no conditional comments, so there is nothing
left for its editor to strip. Sending the full templates would undo the reason
the CMS-safe variants exist.

**New thread, so it signs off with the Gmail signature block** and does not type
the name above it.

**Check before sending:** open
`https://pt.fitazgym.com/brand/fitaz-gym-logo-email.png` in a browser and
confirm the logo appears. It should, because `public/brand/` deployed in August,
but it could not be checked from the build workspace, which has no outbound
access to that host. **If it 404s, do not send**: the attachments would point at
a dead address, which is worse than the problem they fix.

**Subject:** A small fix needed in the PT nurture emails

---

## The email

Hi Danny,

Quick one for GymMaster. I have attached the three PT nurture templates with the
fix already made, so it should be a paste rather than a job. It will make more
sense if I explain why first, because on the face of it the emails look fine.

The three emails that go to new members on days 1, 10 and 30 all carry the FITAZ
GYM logo at the top. Here is the thing about email: the email does not actually
contain the picture. It contains a web address for it, and when a member opens
the email their phone goes off to that address and fetches the logo.

Right now that address is not ours. It points at a file sitting on Designmodo's
website, the company behind Postcards, which is the builder the onboarding email
was made in. That was my stopgap back in August. Our own copy of the logo was
not published on pt.fitazgym.com yet, GymMaster was rendering a broken image, and
Designmodo was already serving that exact file, so I pointed at theirs to get the
emails out the door.

Our own copy is published now, so the stopgap can go. Why it is worth bothering
with: we do not control that Designmodo address. If someone there tidies up, or
that Postcards project gets deleted or reorganised, the logo breaks in every one
of those emails at once, including the ones already sitting in members' inboxes
from months back. We would get no warning and there would be nothing we could do
from our end. It is a ten minute job now and an embarrassing one later.

So, the three attachments. Each one replaces the matching template in GymMaster,
same as when we first loaded them in:

- 01-welcome-nurture, the day 1 email
- 02-plan-not-motivation, the day 10 email
- 03-last-call, the day 30 email

Nothing else about them has changed. Same copy, same buttons, same merge tag for
the member's first name. If it is easier to make the change in place instead,
it is one address in each template:

From:
https://s1.designmodo.com/postcards/image-1742259265784-61d271ee.png

To:
https://pt.fitazgym.com/brand/fitaz-gym-logo-email.png

One thing to watch if you do go that way. Our logo file is not shaped the same
as the one on Designmodo, so the width and height on the image have to change
with it, from 240 by 60 to 230 by 34, or the logo comes out squashed. That is
already done in the attachments.

Worth opening that second address in a browser first either way. You should see
the logo on a white background. If you do, we are good.

Give me a yell if anything looks off once they are in, or if you would rather we
sat down for ten minutes and did it together.

Cheers,

---

## Notes on the draft

- **The dark mode white logo is not mentioned, and was deliberately dropped.**
  An earlier version offered it as an optional extra. It cannot be delivered:
  the CMS-safe templates carry no `<style>` block, so no dark mode rule of any
  kind reaches a GymMaster send, image swap or white plate alike. Offering it
  would have been promising something the format cannot do.
- **The box resize is the part most likely to bite**, which is why it is called
  out for the edit-in-place path rather than left in the attachments silently.
  The Designmodo file was padded, 2000x500 around a 1924x251 mark; ours is
  1600x236 with no padding, so the old 240x60 box squashes it to 71% height.
  Reasoning in `docs/emails/README.md` under "Where the images come from".
- **It does not mention the unsubscribe.** Karl's call, 18 November 2026: he
  wants to establish for himself whether GymMaster supplies one before it goes
  on Danny's plate. Keeping the two apart also keeps this a ten minute ask
  rather than a conversation about compliance.
- **Nothing in here is urgent**, and the email says as much by asking rather
  than setting a date. The risk is a dependency that might break, not one that
  is breaking.
