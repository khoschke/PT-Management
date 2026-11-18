# PT lead pipeline: stage definitions

The reference for how a lead moves through the PT portal: what each stage and
status means, who sets it, and what the portal does at each step. Created
17 Nov 2026 when the status funnel was settled (Batch 1, migration `0018`). No
earlier version of this document was found.

**Source of truth.** The one-line meanings trainers see in the portal live in
`STATUS_DEFINITIONS` in `src/lib/types.ts`. If a meaning changes, change it
there and here in the same PR. The statuses themselves are the `lead_status`
enum in the database. Changing one is a migration (see `0018`), never only a
code change.

## The funnel at a glance

| Stage | Sub-stage (portal status) | Means exactly | Set by | Closed? |
|---|---|---|---|---|
| 1. Lead in | **New** | Lead has come in, no trainer yet. | Portal | No |
| | **Allocated** | Assigned to a trainer, not contacted yet. | Portal, when the PT Manager allocates | No |
| 2. First contact | **Contacted** | The trainer has reached out (call, text or email), whether or not they replied. | Trainer | No |
| | **Unreachable** | The trainer tried and never got a reply. They stay in the member email flow. | Trainer | Yes |
| 3. Complimentary session | **Comp. Booked** | A date is locked in for the complimentary session. | Trainer | No |
| | **Attended** | The session happened, decision pending. | Trainer | No |
| 4. Decision | **Converted** | They have signed up to paid PT. | Trainer | Yes |
| | **Not interested** | They said no. | Trainer | Yes |

**There is no "no-show" status, on purpose.** Someone who books and doesn't
turn up is either rebooked (they stay Comp. Booked) or closed out (Not
interested or Unreachable). The no-show count comes from the status history: a
lead that reached Comp. Booked and never reached Attended.

"Closed" leads drop off the lead board's default view (a "Show closed" toggle
brings them back), never count as overdue, and are left out of the weekly email
(`CLOSED_LEAD_STATUSES`). Attended is deliberately not closed, because the
conversion conversation is still ahead.

## The rules that make the numbers mean something

1. **Tick through every step that happened, even when it happens at once.**
   Someone who signs up at the end of their session goes Attended, then
   Converted. Skipping Attended makes them look like a no-show who converted,
   and undercounts the show rate. This matters most for Not interested: only
   the Attended step tells "came and said no" apart from "never came".
2. **Comp. Booked and Attended are waiting rooms, not destinations.** The weekly
   email flags a lead sitting in either for more than 7 days
   (`COMP_BOOKED_CHECK_DAYS`, `ATTENDED_DECISION_DAYS`).
3. **Unreachable, not Not interested, when you simply couldn't reach them.**
   Unreachable leads stay in the GymMaster member email flow on purpose.
   Somebody who never picks up is exactly who the emails are for. Not
   interested is for a person who actually said no. See
   `docs/pt-nurture-flow-briefing-email.md`.
4. **Contacted means reaching out, not getting a reply.** That matches the
   48 hour rule, which is about the trainer making the attempt.

## What the portal does at each step

| When | What happens | Where |
|---|---|---|
| A lead is created | Status New. The 48 hour first contact clock starts (`first_contact_due_at`). The PT Manager gets a new-lead alert for form leads. | `0001`, `submit_form_lead` |
| A trainer is assigned | New becomes Allocated. `allocated_at` is stamped (and restamped on any reassignment). The trainer gets an allocation email. | `allocateLead`, `0019` trigger |
| Any status change past Allocated | `last_contacted_at` is stamped. The change is written to `status_history`. | `0019` and `0001` triggers |
| First move to Contacted, Comp. Booked, Attended or Converted | `first_contacted_at` is stamped once, which stops the 48 hour clock. | `0018` trigger |
| A trainer taps **Log contact** | `last_contacted_at` is stamped with no status change. An Allocated lead also moves to Contacted. | `logLeadContact` |
| Every morning, 7am Brisbane | The PT Manager's daily digest: new overnight, approaching 48 hours, breached. | `/api/cron/daily-digest` |
| Every Monday, 7am Brisbane | Each active trainer gets their own active leads, never-contacted first, with the 7 day flags. The PT Manager is CC'd. | `/api/cron/weekly-trainer-summary` |

## Lead types

The terms the workbook uses for where a lead comes from (Part 7 amendments,
15 Nov 2026):

- **Warm (form):** the person enquired about PT themselves through
  pt.fitazgym.com/pt-session. Source `form` in the portal.
- **Flagged** (called "sweep" until 18 Nov 2026): added to the portal by the PT Manager after a conversation on the
  floor, an email or a heads-up from the front of house team. Someone has shown
  interest or been flagged for a reason, so not cold. Source `gymmaster_sweep`
  in the portal (the name predates the term, and is kept so existing rows and
  the GymMaster branch line up).
- **Unverified:** new members who haven't asked about PT. They go through the
  GymMaster nurture emails and reach a trainer around day 10 to 17, after two
  of the three emails. These are the only leads "cold" should describe. Source
  `unverified` in the portal (migration `0020`). The PT Manager picks Flagged or
  Unverified when adding a lead by hand, and can re-sort a hand-added lead from
  the lead panel's "Lead type" control. Set it before allocating: the trainer's
  allocation email says which type it is.

- **Own lead:** found and added by a trainer themselves with **Add my own lead**
  (migration `0021`). Source `own`, with `found_via` saying where: gym floor,
  referral, social media or other. A trainer who picks someone up from the
  unverified list saves as `unverified`, with `found_via` = unverified list.
  Allocated straight to that trainer as Allocated, so the 48 hour clock runs.
  A phone number already in the portal is refused, without saying who has it.

Every type flows through the same stages and statuses above.

## The metrics this gives you

All of these come from `status_history`, with no extra statuses needed:

- **Contacted within 48 hours:** `first_contacted_at` against
  `first_contact_due_at`.
- **Booking rate:** of leads contacted, how many reached Comp. Booked.
- **Show rate:** of leads booked, how many reached Attended. This is the number
  the funnel cleanup was built to expose.
- **Conversion rate:** of leads who attended, how many reached Converted.
- **Time to convert:** days from lead created to Converted.
- **By source:** any of the above, split by lead type.

None of these are on a dashboard yet. A small one is the obvious next step.

## Open: possible future sub-stages (not built)

These are proposals, not part of the funnel. Each would be a migration plus an
update to this document.

- **From the Part 7 rewrite (Karl's decision, pending):** amendments items 10
  and 11 propose "Said no", "Agreed to check-in", "Declined", and an "Ended"
  close after a 48 hour window on a no. They would sit between Attended or
  Contacted and the closed exits. See "Batch 1" under Outstanding in
  `docs/PROJECT_STATUS.md`.
- **"Not now":** said not right now rather than no, which today gets lumped
  into Not interested. This overlaps with "Agreed to check-in" above, so decide
  them together.
- **Fields rather than statuses:** a reason on Not interested (price, time,
  chose elsewhere), and what a Converted lead signed up to.
- **Settled (Karl, 17 Nov 2026):** the 48 hour first contact clock applies to
  every lead type, unverified included, as the portal already does. The
  48 hour window to send the permission question after a no also applies to
  every type (Part 7 amendments item 7).

## Change log

- **18 Nov 2026:** Own leads (`0021`). Trainers add leads they found
  themselves; the PT Manager's daily digest counts them per trainer.

- **18 Nov 2026:** "Sweep" renamed **Flagged** in the portal and the workbook
  (Karl). The word came from the original "GymMaster sweep", when the PT
  Manager typed in new members by hand, which is what `unverified` now covers.
  The database value stays `gymmaster_sweep`; only `LEAD_SOURCE_LABELS` changed.

- **17 Nov 2026:** Third lead source, `unverified` (`0020`). Leads added by hand
  before this are all `gymmaster_sweep`, so the PT Manager re-sorts any that
  were really unverified. Labels and hover text live in `LEAD_SOURCE_LABELS`
  in `src/lib/types.ts`.

- **17 Nov 2026:** Created with the settled funnel. Booked was renamed Comp.
  Booked, Completed renamed Attended (the counts suggested most trainers used it
  for "came to the session"), and Converted added (`0018`). Contact dates and the weekly email
  were added (`0019`, PR #47). "Interested", a status from the old lead
  spreadsheet, was never in the portal.
