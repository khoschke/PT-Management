# GymMaster questions email (to Danny)

Two questions for GymMaster that nobody at this end can answer, both found while
checking the member nurture emails on 19 November 2026. One is a compliance
problem that is live right now; the other is a setup question that affects every
gym email Danny builds, not just these three.

**This replaces `docs/gymmaster-logo-host-email.md`**, which asked Danny to swap
the masthead logo. That is no longer an ask: Karl is pasting the corrected
templates in himself. The logo email was drafted and never sent.

## Send details

**From:** Karl's own address
**To:** Daniel Catanzaro `daniel@fitazgym.com`

**New thread, so it signs off with the Gmail signature block** and does not type
the name above it.

**Subject:** Two things to ask GymMaster

## Why it is written the way it is

**The unsubscribe is explained before it is asked about.** "Does GymMaster have
an unsubscribe tag" is a question Danny can answer with a shrug; "our member
emails have no way to unsubscribe and that is a legal requirement" is a question
he will take to GymMaster today. The explanation is the part that gets it done.

**The two questions are kept in one email on purpose.** They are one
conversation with GymMaster support, and the sending address matters to Danny
for his own reasons, which makes the email worth his time rather than just
Karl's.

**It does not ask Danny to do anything in the templates.** Karl is doing that
himself. The email says so, so Danny does not go looking.

---

## The email

Hi Danny,

Two things I need GymMaster to answer, and one of them is more serious than it
looks. Both came out of checking the three PT nurture emails this week.

**1. There is no way for a member to unsubscribe from the nurture emails.**

I sent all three to myself and went through them properly. There is no
unsubscribe link at the bottom, and there is also no hidden unsubscribe
instruction in the email, which is the thing Gmail reads to put its own
Unsubscribe button next to the sender name. So a member who wants off that list
has nothing to click except Report spam.

Two reasons that matters. Under the Spam Act, a commercial email has to carry a
working unsubscribe, and ours have been going to every new member since
September without one. And practically, every Report spam click teaches Gmail to
treat our email as junk, which eventually lands all of it in the spam folder,
including the emails that actually matter.

What I need from GymMaster:

- Is there a merge tag or setting that puts an unsubscribe link in a bulk email,
  and does clicking it actually stop that member getting the rest of the
  sequence?
- Does GymMaster set the List-Unsubscribe header on bulk sends? That is the
  hidden one. It is not something we can add to a template at our end, it has to
  come from them.

If the answer to the first is no, I will put a temporary link in that emails the
gym instead, and we action those by hand. Not ideal, but better than nothing
while we sort it properly.

**2. Can GymMaster send from one of our own addresses?**

Right now the nurture emails arrive from no-reply@gymmasteronline.com. Replies
do reach us, I have checked, because the reply address is set to
team@fitazgym.com. But the address a member sees is not ours, which is a bit odd
on a gym email, and one of the emails literally says "it comes through to a real
person at the gym, not a no reply inbox" while showing a no-reply address.

So: can GymMaster send as something like team@fitazgym.com? I imagine it would
need some DNS records set up on our side, which is fine. Worth knowing for every
other gym email you set up through GymMaster, not just these three.

No action needed on the templates themselves. I am updating those today with a
couple of copy fixes and our own logo, so leave those with me.

Cheers,

---

## Notes on the draft

- **The Spam Act line is deliberately one sentence and not lawyerly.** It is
  there because it turns a nice-to-have into a must, which is what gets the
  question asked today rather than next month. Neither of us is giving legal
  advice and the email does not pretend to.
- **The explanation of the hidden header avoids the words "List-Unsubscribe"
  until the question itself**, where Danny needs the exact term to pass on. The
  first mention describes what it does instead, since the name explains nothing
  to someone who has not met it.
- **It names the fallback** so Danny knows the consequence of a slow answer,
  which is a gentler form of urgency than a deadline. The fallback is the
  `mailto:` option in `docs/emails/README.md`, and it only works if somebody
  actions what arrives.
- **The no-reply contradiction is quoted from the email itself.** It is the
  concrete detail that makes the second question feel real rather than
  aesthetic.
