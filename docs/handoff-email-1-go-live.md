# Handoff: Get the Member Email Series Sending

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then
this, then `docs/emails/README.md` for the emails themselves.

## What this is

All three member emails are **built and finished**: the day 1 welcome, the day 10
follow up and the day 30 deadline, each with an HTML and a plain text part.
Nothing in the templates is outstanding. Everything below is operational, and
none of it is a code change.

The open items are tracked here rather than in a chat thread so they can be
picked up cold. **If you are reviewing this and any item is still unticked,
raise it** rather than assuming it was handled elsewhere.

Three things are outstanding, and none of them are code:

1. The sending domain, **with Georgio**.
2. What GymMaster actually provides, **with Georgio and Danny**.
3. Telling the PTs how leads reach them now, **with Karl**, once the flow is
   live.

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

### 0. The SPF record is malformed. Fix this first.

The sending domain is verified and mail is going out, but the SPF value that
went into DNS on 4 August 2026 has a copy-paste error in it:

```
v=spf1 include: v=spf1 include:amazonses.com ~all
```

The prefix appears twice and the first `include:` has no value, which makes the
record invalid. **The correct value, exactly:**

```
v=spf1 include:amazonses.com ~all
```

**Where it goes:** the DNS zone is at **CrazyDomains (Dreamscape Networks)**,
not Shopify. `fitazgym.com` is a third-party domain *connected* to Shopify
rather than bought through it, so the zone lives elsewhere. Edit the **TXT**
record named **`send.mail`** in the CrazyDomains control panel, under DNS
management, and replace the value.

Mail is currently delivering on DKIM alignment, which is why nothing looks
broken. SPF is not passing, and that costs inbox placement as volume grows.
Fix it before the member emails start going out.

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

- **Unsubscribe and a `List-Unsubscribe` header.** Non-negotiable for a member
  facing send. Both templates have an `{{unsubscribe_url}}` placeholder waiting
  for whatever GymMaster's equivalent is called.
- **A suppression list that is honoured.** So an unsubscribe on email 1 actually
  stops emails 2 and 3.
- **Which domain it sends from.** If GymMaster sends from its own infrastructure,
  the `fitazgym.com` DNS work below may not be needed for these three emails at
  all, though it is still needed for the internal ops emails through Resend. If
  GymMaster sends as `@fitazgym.com`, it will want its own SPF and DKIM records,
  which is the same DNS access either way. **Find out which before promising a
  date.**

Also worth an early look: **merge tags**. GymMaster will not use `{{tag}}` syntax.
`{{first_name}}` will map to something obvious. `{{expiry_date}}` is the one to
check, because it needs date arithmetic (join date plus 37 days) that not every
gym CRM can do. If it cannot, say so and the copy can drop to "closes in seven
days", which is always true given the email fires on day 30 anyway, and costs
only the specificity of a named date.

## Then, before the first send

Work through the checklist at the end of `docs/emails/README.md`. The two that
get skipped:

- **`Reply-To` must reach a monitored inbox.** The copy says "it comes through
  to a real person at the gym, not a no reply inbox". If that is not true, the
  email is lying to members in writing.
- **The footer icons** load from `pt.fitazgym.com/email/`. That merged on
  5 August 2026, so they should be live, but confirm on a real send rather than
  in a preview. If they 404, the Vercel deploy stalled; push again to retrigger.
- **Suppression before each send of emails 2 and 3.** See
  `docs/emails/README.md`. Both are written so that reaching the wrong person is
  awkward rather than wrong, but suppression is still the thing that keeps them
  sharp.

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

## Definition of done

A member who joins the gym gets email 1 the next day, email 2 on day 10 and, if
they still have not claimed it, email 3 on day 30, from an address that passes
authentication, with working buttons, a working unsubscribe, and replies landing
somewhere a human reads them. The PTs get the unverified leads after email 2,
with the members who already responded stripped out, **and they have been told
that is how it now works**.
