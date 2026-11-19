# Spec: automated 2-2-2 follow-ups and the 48-hour clock on a no

Part 7 amendments, item 11. Written 18 Nov 2026 for Karl's sign-off. Nothing
here is built yet. It's designed on top of the live funnel (New, Allocated,
Contacted, Comp. Booked, Attended, Converted, Not interested, Unreachable) and
follows the decisions already made in items 10 and 11, including option A.

## Two new statuses, not four

| Status | Means | Set by |
|---|---|---|
| **Said no** | They said no, not for me, or not right now. The 48-hour clock to ask the permission question is running. | Trainer |
| **Agreed to check-in** | They said yes to "Mind if I check in down the track?". They're on the 2-2-2. | Trainer |

Item 11 also proposed "Declined" and "Ended: no response to a no within 48
hours". **Recommendation: don't add them as statuses.** Every way a lead ends
for good is already **Not interested** (a no, or an opt-out, never contacted
again about PT). The portal records *why* it ended alongside, as a reason:

| Reason | When |
|---|---|
| Replied STOP | They replied STOP |
| Declined | "Leave it there", or no answer to the permission question |
| Ended by trainer | The trainer pressed End communication |
| No response to a no in 48 hours | The timer closed it |

Same rules, fewer statuses, and the reason is what decides whether the PT
Manager can reopen it (only the timer reason can be reopened).

## How a lead moves

**Went quiet** (no reply to first contact). Starts by itself when a lead goes
to Contacted.
- Day 2 after first contact: 2-day nudge due.
- 2 weeks after the nudge: 2-week touch due.
- 2 months after that: 2-month reconnect due (fresh first contact, with the STOP line).

**Said no.** The trainer sets Said no, and the 48-hour clock starts. Within the
48 hours, the trainer records one of:
- **Asked, they said yes:** the lead goes to Agreed to check-in, with the 2-week
  touch due 2 weeks later, then the 2-month reconnect (option A: no 2-day nudge).
- **Asked, they said leave it:** the lead goes to Not interested (Declined).
- **Asked by text, waiting on an answer:** the clock stops. If no answer comes
  within **7 days**, the lead closes as Not interested (Declined).

If none of those is recorded within 48 hours, the portal closes the lead
automatically: Not interested, reason "No response to a no in 48 hours".

**Each touch:** when a follow-up is due, the lead shows "Follow-up due: 2-week
touch" with a **Done** button. Done logs the contact and schedules the next one.

**The sequence stops by itself** when the lead goes to Comp. Booked, Attended,
Converted, Not interested or Unreachable.

**The end point:** when the 2-month reconnect is marked Done and nothing
changes for **7 days**, the lead closes as Unreachable, so it stays in the
gym's emails.

## Buttons

- **End communication (trainer):** on any open lead. For when the prospect has
  ended it ("leave it there"). Sets Not interested, reason Ended by trainer, with
  the date. Not shown once the timer has closed a lead: the timer's close stands.
- **Reopen (PT Manager only):** only on a lead the timer closed. Needs a short
  reason, and the manager picks where it goes back to (Agreed to check-in, or
  Not interested if the trainer did ask and got a leave it). The portal logs who
  reopened it, when, and why. Leads that opted out themselves can never be
  reopened.

## What people see

- **Trainer board:** a "Due today" and "Overdue" pill on each lead with a
  follow-up due, and a countdown on Said no leads ("Respond to a no: 20 hours
  left"). A "Follow-ups due" filter.
- **Trainer email:** the Monday email gains a "Follow-ups due this week"
  section. Plus a short **daily email, sent only on days the trainer has
  something due** (a follow-up, or a no to respond to). No email on empty days.
- **PT Manager:** an email the moment the timer closes a lead (lead, trainer,
  when the no was logged, when the window closed). The same closes are listed
  in the daily digest.

## Under the hood (for the build)

- One migration: the two statuses, a `closed_reason` field, `said_no_at`,
  `permission_asked_at`, the follow-up step and next due date, and a reopen log.
- The 48-hour close runs in a scheduled job. Vercel's current plan only runs
  scheduled jobs once a day, so the board also treats an expired clock as
  closed the moment anyone opens it. Nobody sees a lead that should have closed.
- The workbook (item 10's "coming soon" lines, and item 12's lead-flow page) is
  written after the build, describing it as it actually works.

## Decisions for Karl

1. **Two new statuses, with a reason recorded for every close**, instead of
   four statuses. Recommended.
2. **Asked by text with no answer:** close as Declined after **7 days**.
   Recommended. Shorter feels pushy, and longer leaves leads hanging.
3. **After the 2-month reconnect:** close as Unreachable after **7 days** with
   no change. Recommended.
4. **Reopen:** the manager picks where the lead goes back to. Recommended.
5. **Trainer reminders:** a daily email only on days something is due, plus the
   Monday summary. Recommended. The alternative is the board and the Monday
   email only, which risks a missed 48-hour window.
