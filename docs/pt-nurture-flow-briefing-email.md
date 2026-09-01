# PT nurture flow briefing email

The follow-up promised in `docs/pt-team-update-email.md`, which told the PTs the
member email series was built and that Karl would "walk you all through it
properly when it goes live". This is that briefing: what the three member emails
are, how leads reach the PTs now, and what the team has to do to keep it honest.

It also does one operational job the earlier email did not: **make every PT
confirm they can actually sign in to the portal**, because from here on that is
where their leads land and there is still no self-serve password reset.

Internal, from Karl's own address, not from the system. Same audience and same
voice as `docs/pt-team-update-email.md`.

## Send details

**From:** Karl's own address
**To:** Dylan Heycox `dylan@intntperformance.com`, Julie Manners
`julie@fit365.net.au`, Shahd Herbert `shahdherbert@gmail.com`, Michael Hammett
`michael@puremomentum.com.au`

**Attach:** rendered previews of the three member emails, if the PTs have not
kept the ones sent on 12 August 2026. Templates are `01-welcome-nurture`,
`02-plan-not-motivation` and `03-last-call` in `docs/emails/`.

**Fill in before sending:** the go-live date in the opening line, and the date
you want portal access confirmed by. Both are marked `{...}` in the draft.

**No passwords in this email.** It is a group send. Anyone who needs a reset
gets it individually, per `docs/pt-login-details-email.md`.

**Subject:** How PT leads reach you from now on

---

## The email

Hi Dylan, Julie, Shahd and Michael,

In August I said I would walk you through the new lead flow properly once it was
live. That is what this is. It goes live {DATE}, and it changes the shape of your
week, so it is worth five minutes.

The short version: every new member now gets three emails from the gym about
their complimentary PT session. Most of the people who actually want one will put
their hand up themselves before you ever pick up the phone. What reaches you will
be later, shorter and warmer. The 48 hour rule does not change.

**What the member gets**

Three emails, automatic, timed off their own join date, so it is exact per member
rather than a batch we send on a Monday.

- **Day 1.** They just joined. The email tells them the PT consultation and
  starter session already came with their membership, and that all we need to
  know is who to send. It is not a sales pitch and it says so.
- **Day 10.** Different angle entirely. Most first months fall apart because the
  plan runs out, not the motivation. It leads with that and arrives at the
  session as the fix.
- **Day 30.** The deadline. Short, states the date, gives them a clean way out.
- **Day 37.** The complimentary session expires.

All three point at the same form, pt.fitazgym.com/pt-session, where they tell us
their goals, when they like to train, whether they would rather train with a male
or female trainer, and whether there is a trainer they already want.

**How a lead reaches you now**

Two ways, and they feel different on the phone.

1. **They filled in the form.** These come through as they land, marked as form
   leads on the board, and I allocate them with their goals and preferences on
   the card. You get the email the moment one lands with you. This is a person
   who asked, so you are booking a time, not selling a session.
2. **They did not respond.** Around day 11, after the second email, the rest come
   across to you for a call. Before that happens I strip out everyone who has
   already responded, so you are not ringing people who filled in the form last
   week.

**Why you get them at day 11 and not day one.** The emails do the easy
conversions on their own. Handing you the whole list on day one means ringing
people who would happily have filled in a form, and it makes a liar of the email,
which promises the member gets matched to a trainer on purpose. Your list will be
shorter than it used to be. That is the point of it, not a side effect.

**The 48 hour first contact clock is unchanged** once a lead lands with you. That
part works exactly as it does today.

**The expiry is real, and it is useful to you**

The session expires on day 37, a week after the last email. That gives you a
straight reason to follow up that is not "just checking in".

It only works if it is true. If somebody rings on day 45 and gets the session
anyway, the deadline is spent for every member they talk to. So if a member gets
to you before their date, book them in. If they come to you after it, do not
promise it on the floor, send them to me and I will make the call. The last email
already offers to hold the session for anyone who replies before the date, so
most of these sort themselves out.

**The one thing I need from you, every week**

Keep your leads' status up to date on the board. Booked, Completed, Not
interested, Unreachable.

That is not admin for the sake of it. The board is what I use to decide who gets
the day 10 and day 30 emails. If you have spoken to someone and they told you no,
and then they get an email saying their session closes in seven days, we look
like nobody is talking to each other, and that is how a gym ends up in the spam
folder for everyone.

One thing worth knowing: **mark someone Unreachable rather than Not interested if
you simply could not get them on the phone.** They stay in the email flow on
purpose. Somebody who never picks up is exactly who the emails are for, and that
group converts better than you would think.

**Please check you can get into the portal this week**

This is the bit I need back from you, and it will take two minutes.

Sign in at pt.fitazgym.com/admin/login using the details I sent you on 12 August.
Once you are in you will see your own leads, each with the member's goals and
preferred times and where they are against the 48 hour clock. The workbook at
pt.fitazgym.com/onboarding uses the same login.

- If you have not signed in yet, or you cannot remember the password, message me
  and I will reset it in a minute. There is still no forgot password link on
  there, so I am the reset button. No drama and no need to feel daft about it.
- If you have not already, click Account once you are in and set a password of
  your own.
- Check your junk folder for anything from noreply@mail.fitazgym.com and mark it
  as not junk. That is the address your lead notifications come from, and it is
  the one way to miss a lead without knowing you have missed it.

**Reply and tell me you are in by {DATE}.** Once this starts running, leads land
on the board and in your inbox rather than coming to you through me, so I need to
know everyone can actually see their own.

**Where this goes next**

This is the plumbing rather than the exciting part. With it running we get a real
picture of how many new members want PT, which of them convert and how quickly,
and that is what PT specific promotions get built on. That is the next piece of
work.

Anything in here that does not match what you see on the floor, tell me. You are
the ones who actually talk to these people.

Karl

---

## Notes on the draft

- **Two placeholders have to be filled in**: the go-live date in the opening
  line, and the confirm-by date for portal access. Do not send it with either
  still in braces.
- **Do not send it before the flow can actually send.** The outstanding items
  are GymMaster's, not Karl's: the unsubscribe token and `List-Unsubscribe`
  header, a suppression list that is honoured, and which domain GymMaster sends
  from. All tracked in `docs/handoff-email-1-go-live.md`. This email announces a
  live date, so it is the wrong thing to send while that is open. If it goes out
  ahead of go-live, change the opening line to a fortnight rather than a date.
- **The status discipline ask is the operationally important part**, more than
  the explanation of the emails. Suppression before emails 2 and 3 is driven off
  the lead board, so if the PTs do not keep status current the member emails go
  to people who have already said no. That reasoning is in
  `docs/emails/README.md` under "Who to leave out of emails 2 and 3".
- **"Unreachable stays in" is deliberate and counterintuitive**, which is why it
  gets its own paragraph rather than a clause. A PT who assumes Unreachable means
  "drop them" will mark those people Not interested and quietly remove the
  highest value segment in the sequence from the flow.
- **The portal check is the reason this email exists as an email** rather than a
  conversation. It creates a dated reply from each PT confirming access, which is
  what tells Karl the flow can be trusted to reach them. Worth chasing anyone who
  does not reply, since silence here looks identical to "I am fine" right up
  until a lead is missed.
- **No forgot-password still.** `docs/handoff-forgot-password.md` is blocked on
  Supabase Custom SMTP, so Karl is the reset path. Inviting four people to sign
  in at once will produce a couple of these. Expect them.
- **The day 37 expiry is stated as a fact, with no member-specific date**, the
  same way the member emails word it. GymMaster cannot do the join date plus 37
  arithmetic, so nobody should be quoting an exact expiry date to a member.
- **Still better as a conversation as well as an email.** `docs/handoff-email-1-go-live.md`
  says the real briefing is better done in person. This email is the record and
  the access check, not a replacement for five minutes at the front desk.
