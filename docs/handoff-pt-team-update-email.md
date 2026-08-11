# Handoff: Email the PT Team About What Has Been Built

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first,
then this.

## The brief, from Karl

> Draft an email to send to the PTs outlining EVERYTHING that has been created
> using Claude Code, from the PT Portal to the PT workbook and the nurture flow.
>
> My goal is to create some inspiration within the team, to show them that
> things are progressing even if they can't see anything. I'd like to invite
> them to check out the PT Portal.
>
> I'd also like to attach the nurture flow email to get the PTs' feedback. One,
> this will help them understand the process, and two, invite them to be a part
> of it.
>
> Lastly, I plan on starting a fortnightly personal development to make our way
> through the workbook together from September onwards, day and time to be
> confirmed. Perhaps I can ask them if they have any preferred times and days.
>
> This will be just the start of many things we're working on and can do to
> ensure us as the PT team thrive.

The tone matters more than the completeness here. This is a morale and momentum
email, not a status report. The PTs have not seen most of this work, so the
point is to make invisible progress visible and to pull them into it, not to
list features at them.

## What to produce

One email from Karl to the five PTs. Plain text or light HTML, sent from his
own address, not from the system. It is a personal note from their manager, and
it should read like one.

It needs to do four jobs, in roughly this order:

1. Show them what has been built and why it helps them.
2. Invite them into the PT Portal, with logins.
3. Attach the nurture emails and ask for feedback.
4. Ask for preferred days and times for fortnightly development sessions from
   September.

## The team

Dylan Heycox, Julie Manners, Shahd Herbert, Michael Hammett, and Karl himself
(also the PT Manager).

**Email addresses:** the trainers' addresses are stored in the app, visible at
`https://pt.fitazgym.com/admin/trainers`. Two are already known from Karl's own
correspondence:

- Dylan: `dylan@intntperformance.com`
- Michael: `michael@puremomentum.com.au`

Julie's and Shahd's need pulling from the trainers screen. **Do not guess them.**

## What has actually been built, for the inventory

Everything below is live unless marked otherwise. Written here so the new
session does not have to go and rediscover it.

### The PT Portal (the lead system)

- **Public complimentary session form** at `pt.fitazgym.com/pt-session`. Members
  submit their goals, preferred training times, whether they would rather train
  with a male or female trainer, and any trainer they want by name.
- **Lead board** at `pt.fitazgym.com/admin`. Every lead in one place with its
  status, source, and who it is allocated to.
- **A 48 hour first contact clock** on every lead, with the board showing what
  is approaching the deadline and what has breached it.
- **Allocation to a trainer**, with the lead's goals and preferences carried
  through, so matching is deliberate rather than whoever is free.
- **Role based access.** Managers see and allocate everything; trainers see only
  their own leads. Enforced at the database level, not just hidden in the
  interface.
- **CSV export** of the filtered board.
- **Automatic emails**, now live: a trainer gets an email the moment a lead is
  allocated to them, and the PT Manager gets a daily digest of what is new,
  what is approaching 48 hours, and what has breached.

### The PT onboarding workbook

- At `pt.fitazgym.com/onboarding`. Nine parts, with progress saved per trainer.
- This is what the fortnightly development sessions will work through.

### The new member nurture flow (built, not yet sending)

- Three emails to every new gym member: day 1, day 10, day 30, with the
  complimentary session expiring on day 37.
- All three point at the same form, so members arrive as warm leads carrying
  their goals and preferences.
- **What it changes for the PTs**, and this is the part they will care about:
  their lead list will arrive later, around day 11 rather than day one, it will
  be shorter because anyone who already responded is stripped out, and it will
  be warmer. Fewer cold calls, better information, same 48 hour rule once a
  lead lands.
- Currently waiting on GymMaster configuration before it can send.

### Brand and design

- The FITAZ GYM wordmark traced properly so it renders the same everywhere,
  with the marks in `public/brand/`.
- A custom web address, `pt.fitazgym.com`, replacing the old vercel.app link.

## Logins: what exists, and the trap

**Karl creates each login himself** at `pt.fitazgym.com/admin/staff`. He enters
the person's email and sets their initial password, minimum eight characters.
The account is created already confirmed, so **no verification email is sent**
and the PT can sign in straight away.

So Karl needs to have created the five logins **before** this email goes out,
and the email should tell each PT their own address and starting password.

Two things to get right:

- **Do not put a shared password in a group email.** Either send each PT their
  own password separately, or send the group email and follow up individually
  with credentials. The group email can say "your login is coming in a separate
  message".
- **There is no forgot-password flow yet.** It is built as a handoff note only,
  see `docs/handoff-forgot-password.md`, and it still needs Supabase Custom SMTP
  configured. Until then, **a PT who forgets their password has no self-serve
  way back in and Karl has to reset it from the Staff screen.** Inviting five
  people to log in at once will generate some of these. Worth Karl expecting it,
  and worth saying "if you get stuck, message me and I'll reset it" in the email
  so nobody sits locked out feeling silly.

## The nurture emails, for the attachment

The three built emails live in `docs/emails/`:

- `01-welcome-nurture.html` / `.txt`
- `02-plan-not-motivation.html` / `.txt`
- `03-last-call.html` / `.txt`

There are rendered previews of all three, and a packaged bundle was previously
assembled with previews, templates and notes. Either attach the previews (easiest
for the PTs to actually look at) or the full bundle. **Previews are the better
choice for this audience** — the PTs want to see what the member receives, not
read HTML.

`docs/emails/README.md` has the reasoning behind each email if the new session
needs to explain the strategy.

## Asking for feedback well

"Any feedback?" gets nothing. Give them something specific to react to, for
example:

- Does anything in these emails promise something we cannot deliver on the floor?
- Is there an objection you hear from members that we have not answered?
- The day 10 email says most first months fall apart because the plan runs out
  rather than the motivation. Does that match what you see?

The PTs are the ones who actually talk to these members. That is the real reason
to ask, and the email should say so rather than asking to be polite.

## The fortnightly development sessions

- Working through the onboarding workbook together, fortnightly, **from
  September**. Day and time to be confirmed.
- Ask for preferred days and times. Keep it easy to answer: a couple of concrete
  options plus "or tell me what suits" will get more replies than an open
  question.
- Worth noting in the email that this is ongoing development, not remedial
  training, so nobody reads an invitation as a performance conversation.

## What still has to happen before this moves forward

Karl asked for this to be included. Split into what belongs in the email and
what is internal, because the PTs do not need the whole list.

### Karl must do these before the email goes out

- **Create the five logins** at `/admin/staff`. The email is an invitation to
  sign in, so the accounts have to exist first.
- **Decide how credentials travel.** Group email for the news, individual
  messages for the passwords.
- **Pull Julie's and Shahd's email addresses** from `/admin/trainers`.

### Blocking the nurture flow from actually sending

Neither is Karl's to fix, both are tracked in
`docs/handoff-email-1-go-live.md`:

- **The SPF record is malformed** and needs correcting in the CrazyDomains DNS
  zone. With Georgio. Mail delivers on DKIM meanwhile, so nothing looks broken.
- **GymMaster needs confirming**: whether it has a raw HTML or source import
  rather than a rich text paste, whether it provides unsubscribe and a
  `List-Unsubscribe` header, whether its suppression list is honoured, and
  whether it can do the date arithmetic the day 37 expiry needs. With Danny,
  ahead of a working session with Karl.

**For the email:** worth one honest line that the flow is built and waiting on
configuration, with a rough sense of timing. Do not list the technical items.
The PTs do not need them, and a list of blockers undercuts the momentum this
email is trying to build.

### Queued behind that

- **Brief the PTs properly on the new lead flow** once it is live: leads arrive
  around day 11 rather than day one, shorter and warmer. This email can foreshadow
  it, but the real conversation should happen when it goes live, and is better
  done in person than by email.
- **Forgot-password** needs Supabase Custom SMTP configured before it can ship.
  Until then Karl resets passwords by hand.
- **Several finished workstreams are sitting unmerged**, including the design
  pass and some security hardening. See the branch map in
  `docs/PROJECT_STATUS.md`. Not relevant to the PTs, but it is the honest answer
  to "what is next".
- **PT specific promotions**, which is what Karl wants to move onto once this is
  bedded in. Worth a closing line in the email as the direction of travel.

### What the email should ask the PTs to do

Keep it to three things, or it will not get done:

1. Log in and have a look around the portal.
2. Read the three nurture emails and reply with anything that does not ring true.
3. Send back preferred days and times for the September sessions.

## Tone notes

- Karl's voice, warm and direct. Australian English, no em dashes.
- **Lead with what is in it for them**, not with what was built. Better leads:
  fewer cold calls, warmer leads, less chasing, a clearer picture of their own
  leads.
- Name the honest bit: they have not seen any of this because it has been built
  in the background. Saying that plainly is more inspiring than pretending it
  has been visible all along.
- Close on the direction of travel. This is the start of a longer piece of work
  on making the PT team thrive, and more is coming, including PT specific
  promotions once this is bedded in.

## Definition of done

A drafted email that a PT could read in two minutes and come away knowing what
has been built, how to get into the portal, what the nurture flow will change
about their leads, and what Karl wants back from them: feedback on the emails,
and their preferred days and times for September.
