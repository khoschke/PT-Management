# PT team update email

An internal email from Karl to the four PTs, telling them what has been built,
inviting them into the portal, asking for feedback on the member nurture emails,
and collecting preferred days and times for the fortnightly development sessions
from September.

This is separate from `docs/emails/`, which holds member-facing lifecycle emails.
This one is a personal note from a manager and should be sent from Karl's own
address, not from the system.

**Sent 12 August 2026**, along with the four individual login emails in
`docs/pt-login-details-email.md`. Kept here as the record of what went out and
as the starting point for the next one.

## Send details

**From:** Karl's own address
**To:** Dylan Heycox `dylan@intntperformance.com`, Julie Manners
`julie@fit365.net.au`, Shahd Herbert `shahdherbert@gmail.com`, Michael Hammett
`michael@puremomentum.com.au`

**Attach:** the three member emails so the PTs can see what a new member gets.
Rendered previews (PDF or image) are better here than the HTML files. The
templates are `01-welcome-nurture`, `02-plan-not-motivation` and `03-last-call`
in `docs/emails/`.

**Do not put any passwords in this email.** It is a group send. Each PT's login
details go out individually using the template in
`docs/pt-login-details-email.md`, which is what the copy below promises.

**Subject:** What we have been building for the PT team

---

## The email

Hi Dylan, Julie, Shahd and Michael,

A fair bit has been built for the PT team over the last few months and none of
you have seen any of it, because it has all happened in the background. So here
it is properly, along with a few things I would like back from you.

The short version: how PT leads reach you is being rebuilt. It should mean fewer
cold calls, better information when you do call, and a lot less chasing.

**What is live now**

The PT Portal, at pt.fitazgym.com. This is where every complimentary session
lead now lives.

- Members can put their hand up themselves at pt.fitazgym.com/pt-session. They
  tell us their goals, when they like to train, whether they would rather train
  with a male or female trainer, and whether there is a trainer they already
  want.
- Every lead sits on one board with its status, where it came from and who it is
  allocated to. You see your own leads. I see the lot.
- Every lead carries a 48 hour first contact clock, and the board shows me what
  is getting close and what has gone past.
- When I allocate a lead to you, their goals and preferences come with it, so
  people get matched to a trainer on purpose rather than on who happens to be
  free.
- You get an email the moment a lead lands with you, and I get a daily summary
  of what is new and what is running out of time. No more finding out days later.

The PT workbook, at pt.fitazgym.com/onboarding. Ten parts, from Welcome and
Orientation through Know Yourself, Finding Clients, Making Sales and Keeping
Clients, out to Running the Business and Growing as a Coach. It saves your
progress as you go, so you can chip away at it. More on this below.

**What is built and about to start**

Three emails that go to every new member: day one, day ten and day thirty. All
three point at the same form, so anyone who is interested arrives having already
told us their goals and their preferred times.

What that changes for you is the part worth reading twice. Your leads will come
through a bit later, around day eleven instead of day one. There will be fewer
of them, because anyone who has already responded is taken out. And the ones you
get will be warmer, with their goals already on the card. Same 48 hour rule once
a lead lands with you.

The emails themselves are finished and we are working through the setup on the
sending side, so this should be running in the next few weeks. I will walk you
all through it properly when it goes live.

**Three things I would like back from you**

1. Have a look around the portal. Your login is already set up and I will send
   your details to you individually. There is no self-serve password reset on
   there yet, so if you get stuck just message me and I will reset it for you.
   It will happen to somebody, so do not sit there locked out feeling daft.

2. Read the three member emails I have attached and tell me what does not ring
   true. You are the ones who actually talk to these people, so you will catch
   things I will not. In particular:
   - Does anything in them promise something we cannot deliver on the floor?
   - Is there an objection you hear from members that we have not answered?
   - The day ten email says most first months fall apart because the plan runs
     out, not the motivation. Does that match what you see?

3. Tell me what days and times suit you. From September I want to run a
   fortnightly personal development session where we work through the workbook
   together. This is development, not a review of anybody, and I reckon it will
   be the most useful hour in the fortnight. I was thinking something like
   Tuesday mornings before it gets busy, or Thursday early afternoon, but tell
   me what actually works around your clients and I will build it around that.

**Where this is heading**

This is the start of it rather than the finish. Once the lead flow is bedded in
I want to get onto PT specific promotions, and there is more behind that. The
whole point of all of it is to make it easier for you to fill your books and
keep the clients you win, so if there is something that would make your week
easier, tell me and it goes on the list.

Have a look and let me know what you think.

Karl

---

## Notes on the draft

- **Ten parts, not nine.** The workbook has ten parts in
  `src/lib/onboarding/content.ts`. Earlier notes said nine.
- **The technical blockers are deliberately not listed.** The email carries one
  honest line that the setup is in progress. A list of what is stuck would
  undercut the momentum this email exists to create. At the time of sending, the
  SPF record had been corrected and what remained was GymMaster configuration,
  tracked in `docs/handoff-email-1-go-live.md`.
- **The real lead flow briefing comes later.** This email foreshadows the change
  to how leads arrive. The proper conversation is better had in person once it is
  actually live.
- **The follow-up to plan for** is the replies. Three asks went out: portal
  feedback, reactions to the three member emails, and preferred days and times.
  The days and times are the one with a deadline on them, since the fortnightly
  sessions start in September.
