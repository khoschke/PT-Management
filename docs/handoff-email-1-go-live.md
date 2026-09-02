# Handoff: Get the Member Email Series Sending

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then
this, then `docs/emails/README.md` for the emails themselves.

## Status: LIVE, 1 September 2026

**The series is sending.** New members are getting email 1 on day 1, email 2 on
day 10 and email 3 on day 30, from GymMaster, timed off their own join date.

The last blocker was the unsubscribe, and **GymMaster handles it**. That closes
the open item in section 2 below and, with it, the send.

Two things follow from going live, and they are the live work now:

- **Tell the PTs**, which is the section at the bottom of this note. The email is
  drafted in `docs/pt-nurture-flow-briefing-email.md` and should go out now
  rather than after the first leads land.
- **Suppression before emails 2 and 3 is now a recurring job**, not a
  pre-launch check. The lead board is what drives it. See
  `docs/emails/README.md`, "Who to leave out of emails 2 and 3".

The rest of this note is kept as the record of how it got here, with the
outstanding items marked.

## What this is

All three member emails are **built and finished**: the day 1 welcome, the day 10
follow up and the day 30 deadline, each with an HTML and a plain text part.
Nothing in the templates is outstanding. Everything below is operational, and
none of it is a code change.

The open items are tracked here rather than in a chat thread so they can be
picked up cold. **If you are reviewing this and any item is still unticked,
raise it** rather than assuming it was handled elsewhere.

Three things were outstanding, and none of them were code:

1. The sending domain, **with Georgio**. Settled: GymMaster sends.
2. What GymMaster actually provides, **with Georgio and Danny**. Settled: the
   unsubscribe is GymMaster's and is in place.
3. Telling the PTs how leads reach them now, **with Karl**. **This is the one
   still open.** Draft in `docs/pt-nurture-flow-briefing-email.md`.

## Confirmed

- **`pt.fitazgym.com` resolves.** Confirmed by Karl, 5 August 2026. Every button
  in the email points at `https://pt.fitazgym.com/pt-session`, so this was the
  one thing that would have made the whole send pointless. It is fine.
- **The sending platform and the trigger are both GymMaster.** Decided by Karl,
  5 August 2026. The series is automated off the member's own join date, so the
  day 1, 10 and 30 timings are exact per member. This closes what used to be the
  two riskiest open items, and means no GymMaster *integration* work is needed in
  this repo: the sending happens entirely inside GymMaster.
- **The PTs get the unverified leads after email 2**, around day 11, rather than
  on day one. See `docs/emails/README.md` for why and for what to strip out of
  the list first.

## Open, with Georgio and Danny

Both of the items below are **theirs, not the PT Manager's**. Send them across
and chase them; do not try to answer them from this repo.

### 0. The SPF record. ✅ Fixed (11 August 2026).

The SPF value that first went into DNS on 4 August 2026 had a copy-paste error
(`v=spf1 include: v=spf1 include:amazonses.com ~all` — the prefix doubled and
the first `include:` empty, which made the record invalid). **This has since
been corrected.** The `send.mail` TXT record in the CrazyDomains (Dreamscape)
zone now reads, exactly:

```
v=spf1 include:amazonses.com ~all
```

and shows Active, alongside the Active `resend._domainkey.mail` DKIM record.
SPF and DKIM both pass — no action left here. (Kept as a record; nothing to do.)

### 1. Verified sending domain on `fitazgym.com`

The blocker for every email in this project, member facing and internal alike.
Resend needs SPF, DKIM and a return path added to `fitazgym.com` DNS, which is
managed through Shopify. Same DNS access as the custom web address, so sort the
access once and both jobs unblock. See `docs/handoff-email-notifications.md`.

**Done looks like:** the domain verifies in Resend, and SPF, DKIM and DMARC all
pass on a test send.

Do not send member facing volume from the `onboarding@resend.dev` testing
sender. It is fine for proving the flow internally and nothing else.

### 2. What GymMaster actually gives you

The platform is decided, but three things still have to be **checked inside
GymMaster** before a real send, because the emails assume them:

- ~~**There is currently no unsubscribe link.**~~ **Resolved, 1 September 2026:
  GymMaster handles the unsubscribe.** The club template stopped being used on
  19 August 2026, so the templates carry their own footer with the socials, the
  address and a permission line, and the placeholder unsubscribe was taken out
  the same day because a dead link is worse than none. The gap is now filled on
  the GymMaster side rather than in the markup, which is why the files in
  `docs/emails/` still carry no unsubscribe link and **should not have one added
  back**: a second one means two, pointing at different places. If these
  templates are ever sent from anywhere other than GymMaster, the unsubscribe and
  the `List-Unsubscribe` header have to come from that platform instead.
- **The header logo is on a borrowed host.** It points at Designmodo's CDN,
  because our own copy at `pt.fitazgym.com/brand/` only exists on the email
  branch and 404d in GymMaster. Designmodo already serves that file to members
  through the Postcards onboarding email, so it works today. **Point it back
  once the branch is deployed**, and restore the reversed logo for dark mode
  with it. The two social icons predate all this and already resolve.
- **A suppression list that is honoured.** So an unsubscribe on email 1 actually
  stops emails 2 and 3.
- **Which domain it sends from.** If GymMaster sends from its own infrastructure,
  the `fitazgym.com` DNS work below may not be needed for these three emails at
  all, though it is still needed for the internal ops emails through Resend. If
  GymMaster sends as `@fitazgym.com`, it will want its own SPF and DKIM records,
  which is the same DNS access either way. **Find out which before promising a
  date.**

**Merge tags are settled.** Karl and Danny worked through this in GymMaster on
18 August 2026. The templates now carry GymMaster's own syntax,
`{58:Member First Name}`, so they import without find and replace.

GymMaster **cannot** do the date arithmetic the old `{{expiry_date}}` tag needed
(join date plus 37 days), so that tag is gone from all three templates. Email 3
says "closes in seven days" and email 2 says "will not stay open forever". Both
stay true because email 3 only ever fires on day 30. **If the send day moves,
the copy has to move with it.**

## Then, before the first send

Work through the checklist at the end of `docs/emails/README.md`. The two that
get skipped:

- **`Reply-To` must reach a monitored inbox.** The copy says "it comes through
  to a real person at the gym, not a no reply inbox". If that is not true, the
  email is lying to members in writing.
- **The templates carry their own header and footer again.** The masthead is
  the official logo served from `pt.fitazgym.com/brand/`, and the footer holds
  the socials, the address, the permission line and the unsubscribe. Check the
  images actually load from that host, and that the unsubscribe placeholder has
  been replaced with a real token.
- **Suppression before each send of emails 2 and 3.** See
  `docs/emails/README.md`. Both are written so that reaching the wrong person is
  awkward rather than wrong, but suppression is still the thing that keeps them
  sharp. **Now that the series is live this is an ongoing job**, and it depends
  on the PTs keeping lead status current, which is why the briefing email asks
  them for it directly.

## Once it is live: tell the PTs

**Do not skip this, and do not let it happen by accident.** The way leads reach
the PTs is changing, and they will notice before anyone explains it. Send them a
note covering:

- **There is now a three email nurture flow** going to every new member, on days
  1, 10 and 30, pointing them at the `/pt-session` form.
- **Leads will arrive later, and warmer.** The PTs get the unverified leads
  after email 2, around day 11, not on day one. That is deliberate: the members
  who respond to the emails come through as warm leads carrying their goals,
  their preferred training time and any trainer they asked for, so allocation is
  deliberate rather than arbitrary.
- **Their list will be shorter, and that is the point.** Anyone who already
  responded is stripped out before handover, so the calls they do make are to
  people who actually need one.
- **The complimentary session now expires on day 37.** They should know the
  deadline exists, because members will mention it, and because it gives them a
  legitimate reason to follow up.
- **The 48 hour first contact rule is unchanged** once a lead lands on their
  board.

Worth doing as a short conversation rather than only an email, since it changes
the shape of their week.

**The email itself is drafted**, in `docs/pt-nurture-flow-briefing-email.md`. It
covers all of the above, adds the status discipline the suppression step depends
on, and makes each PT confirm they can sign in to the portal, since that is where
their leads now land. **The flow is live, so this is the open item**: send it
before the first leads reach their boards, not after.

## Definition of done

A member who joins the gym gets email 1 the next day, email 2 on day 10 and, if
they still have not claimed it, email 3 on day 30, from an address that passes
authentication, with working buttons, a working unsubscribe, and replies landing
somewhere a human reads them. The PTs get the unverified leads after email 2,
with the members who already responded stripped out, **and they have been told
that is how it now works**.

**Met on the sending half as of 1 September 2026.** The one part still open is
the last clause: the PTs have not been told yet. Send
`docs/pt-nurture-flow-briefing-email.md` and this note is finished.
