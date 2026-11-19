# GymMaster logo host email (to Danny)

A short internal email from Karl to Danny asking him to swap one web address in
each of the three member nurture templates inside GymMaster, so the masthead
logo is served from `pt.fitazgym.com` rather than from Designmodo's CDN.

**Why it is written as an explanation rather than a request.** The emails look
fine today, so "please change this" on its own reads as fiddling. The email
spends most of its length on why an unchanged picture is a risk at all, in plain
terms, because the mechanism (an email referencing a remote image rather than
carrying it) is not obvious unless you have built one. Karl asked for it to be
explained to Danny the same way it was explained to him.

## Send details

**From:** Karl's own address
**To:** Daniel Catanzaro `daniel@fitazgym.com`

**New thread, so it signs off with the Gmail signature block** and does not type
the name above it.

**Check before sending:** open
`https://pt.fitazgym.com/brand/fitaz-gym-logo-email.png` in a browser and
confirm the logo appears. It should, because `public/brand/` deployed in August,
but it could not be checked from the build workspace, which has no outbound
access to that host. **If it 404s, do not send the email**: the address in it
would be wrong, and that is worse than the problem it fixes.

**Subject:** A small fix needed in the PT nurture emails

---

## The email

Hi Danny,

Quick one for GymMaster. It will make more sense if I explain why first, because
on the face of it the emails look fine.

The three PT nurture emails that go to new members on days 1, 10 and 30 all
carry the FITAZ GYM logo at the top. Here is the thing about email: the email
does not actually contain the picture. It contains a web address for it, and
when a member opens the email their phone goes off to that address and fetches
the logo.

Right now that address is not ours. It points at a file sitting on Designmodo's
website, the company behind Postcards, which is the builder the onboarding email
was made in. That was my stopgap back in August. Our own copy of the logo was
not published on pt.fitazgym.com yet, GymMaster was rendering a broken image,
and Designmodo was already serving that exact file, so I pointed at theirs to
get the emails out the door.

Our own copy is published now, so the stopgap can go. Why it is worth bothering
with: we do not control that Designmodo address. If someone there tidies up, or
that Postcards project gets deleted or reorganised, the logo breaks in every one
of those emails at once, including the ones already sitting in members' inboxes
from months back. We would get no warning and there would be nothing we could do
from our end. It is a ten minute job now and an embarrassing one later.

What needs doing, in each of the three templates, is one address swapped.

From:
https://s1.designmodo.com/postcards/image-1742259265784-61d271ee.png

To:
https://pt.fitazgym.com/brand/fitaz-gym-logo-email.png

Worth opening that second address in a browser first. You should see the logo on
a white background. If you do, it is good to go.

The one catch is that it has to happen inside GymMaster. The copies we keep on
our side are only what we hand GymMaster to import, so changing them there does
nothing to what actually sends.

Are you happy to do that, or is it easier if we sit down for ten minutes and go
through it together? I can also send you the three templates with the change
already made, if pasting them in is less fiddly than editing them in place.

One optional extra while you are in there. In dark mode these emails flip to a
dark background, and because the logo is black we put a white panel behind it so
it stays visible. We now have a proper white version of the logo that would look
better than the panel. Not important, so only worth it if it is easy.

Cheers,

---

## Notes on the draft

- **The dark mode line is deliberately last and marked optional.** It is a
  second change in the same place, so leaving it out entirely means a second
  trip into the templates later. Framed as a nice-to-have so it cannot derail
  the swap that matters. The file is
  `public/brand/fitaz-gym-logo-email-white.png`, which is not quoted in the
  email on purpose: if Danny wants it, it comes with the ready-made templates.
- **The offer of pre-edited templates is real.** `docs/emails/cms-safe/` is what
  GymMaster is given, and a copy with the address already swapped is a trivial
  thing to produce. Do that rather than describing it if Danny takes the option.
- **It does not mention the unsubscribe.** Karl's call, 18 November 2026: he
  wants to establish for himself whether GymMaster supplies one before it goes
  on Danny's plate. Keeping the two apart also keeps this email a ten minute ask
  rather than a conversation about compliance.
- **Nothing in here is urgent**, and the email says as much by asking rather
  than setting a date. The risk is a dependency that might break, not one that
  is breaking.
