# Staff development early-access email (template)

Goes to one person at a time, when they are given a portal login as **staff**
on the development pathway but the pathway has **not formally started**.

That gap is the whole reason this template exists and is separate from
`docs/pt-login-details-email.md`. Somebody who receives a login for a "PT
development pathway" will reasonably read it as the offer landing. It has not,
and the email has to say so without souring a genuinely good gesture.

**First sent 10 September 2026** to Henry, as early access to the workbook
while the pathway was still being finalised with the owners.

## Filling it in

| Placeholder | Where it comes from |
|---|---|
| `{FIRST NAME}` | theirs |
| `{EMAIL}` | the sign-in address on their account, from `/admin/staff` |
| `{PASSWORD}` | the temporary password set when the account was created |

**Never put a real password in this file.** Fill it in when you send, not here.

Send it separately to each person, never as a group and never with anyone cc'd.

**Subject:** Early access to the PT onboarding workbook

---

## The email

Hi {FIRST NAME},

Quick update, plus something to get you started.

We are still working through the details of the PT pathway with the owners, so
nothing is formal yet and I do not want to get ahead of that. What I can do in
the meantime is give you access to the PT onboarding workbook, so you can make
a start rather than just wait on us.

To be clear on what this is: it is the learning material, nothing more. It
covers what it actually takes to run a business as a personal trainer, from the
coaching side through to finding clients and the numbers behind it. It does not
set you up to train clients at the gym, and it is not the formal offer. That is
still being worked through and it comes separately.

Sign in at: https://pt.fitazgym.com/admin/login
Your email: {EMAIL}
Your password: {PASSWORD}

Change that password once you are in. Click Account and set your own, at least
eight characters.

You will land on a page called My development. The workbook is linked at the
top, ten parts, and it saves as you go so you can stop and pick it back up
whenever. No deadline and no expectation about pace. There is a goals section
on that page too. Leave it for now if you like, we will do something more
structured with it once things are settled.

Have a read and tell me what you make of it.

Karl

---

## Notes

- **The second paragraph is the one that matters.** It says three things
  plainly: nothing is formal, this is not clearance to train clients, and the
  offer comes separately. Do not trim it for brevity. The cost of it being
  missing is somebody telling their family they got the job.
- **The goals line is deliberately soft.** They will see a goals section on
  `/admin/development` and wonder what it is for. Until the pathway formally
  starts there is no check-in cadence behind it, and inviting someone into a
  coaching loop that is not running is worse than saying "leave it for now".
  When the pathway does start, that is a conversation, not an email.
- **They see the whole workbook**, including the parts on pricing and business
  terms. That is the point, and those parts read as examples rather than as gym
  policy (see the figure rule in `CLAUDE.md`). Worth knowing that the reader is
  more junior than the material was originally written for.
- **What they cannot do:** no lead board, no trainer roster, no compliance
  overview, and no Manager view in the workbook, so the coaching notes and
  worked examples stay hidden from them. They can upload their own compliance
  documents.
- **When the offer is made and they become a trainer**, promote them from
  `/admin/staff`. Everything they wrote in the workbook, every document and
  every goal carries across. Then send them
  `docs/pt-login-details-email.md`, which covers the lead board they can now
  see, on the same login.
