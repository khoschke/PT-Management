# Build plan (v1): PT setup checklist, tracked per trainer

**Status: PROPOSED, awaiting Karl's sign-off (written 15 Sep 2026).**
Scoping lives in `docs/handoff-onboarding-checklist-tracking.md`. That note asks
the questions; this one answers them. Once Karl agrees, this becomes the build
brief and the open questions in the scoping note get struck through.

Read `CLAUDE.md` before touching any of this. The figure rule and the
commercial-terms rule both bite on this feature, and the migration discipline
is not optional.

## What was verified, rather than taken from the docs

Everything below was checked against disk and against the live database in this
session, because the docs have lagged the code before.

| Claim | Where the docs say it | What is actually true |
|---|---|---|
| Next free migration is `0016` | Scoping note, "Constraints" | **Correct.** Highest on disk is `0015`. I checked all 15 remote branches: nothing anywhere numbers `0016`. GymMaster still holds `0007`/`0008` on `claude/gymmaster-phase-1-pull-7yuxuy`; `0005` is retired. |
| `0013`, `0014`, `0015` are on live | PROJECT_STATUS Database table | **Correct**, re-confirmed by querying live: the `staff` enum value, `my_role()`, both development relations and the `contract` document type are all present. |
| No checklist tables exist yet | not stated anywhere | **Confirmed against live.** No relation in `public` matching `%checklist%`. Starting from nothing. |
| Workbook content is in `src/lib/onboarding/content.ts` | Scoping note, "This is NOT the existing workbook" | **Stale.** `content.ts` is now an index; the content is in `parts/part1.ts` to `part10.ts`, as `CLAUDE.md` says. Fixed in the scoping note as part of this pass. |
| The audit query runs 51 checks | PROJECT_STATUS Database table | **52.** Fixed. |

`./supabase/reconcile/local_migration_check.sh` runs clean on the current chain:
every migration applies in fresh-setup order and all 52 audit rows read PRESENT
except the two expected GymMaster ones. So the harness works and a new
migration can be proven before it goes anywhere near live.

## 1. How I would build it

### Naming, first, because it is the thing most likely to go wrong

"Onboarding" is already taken twice over: the workbook lives at `/onboarding`
and the nav calls it "PT onboarding". Adding a second "Onboarding" tab is
exactly the confusion the scoping note warns about, so this feature is called
**Setup** everywhere:

- Route `/admin/setup`, with `/admin/setup/[trainerId]` for one person.
- Nav label **Setup**, manager-only.
- Page heading "New trainer setup", with a subheading that says in one line
  that it is the business setup, not the workbook.
- Tables and types all use `setup_`, never `onboarding_`.

Overrule the label if you want ("PT setup" also works), but the two features
need different words.

### Data model: three tables, migration `0016_setup_checklist.sql`

Mirrors the shape the repo already uses for compliance documents (a template
table plus a per-trainer table), so nothing here is a new idea.

**`setup_checklist_items`** - the template, seeded with the 18 items from the
paper checklist.

```
id          uuid pk
key         text unique        -- stable slug, e.g. 'signed_contract'
label       text not null
hint        text not null default ''   -- the parenthetical from the paper doc
sort_order  int not null
active      boolean not null default true
created_at  timestamptz
```

`key` is stable and permanent, for the same reason `onboarding_responses.activity_key`
is: renaming or removing one orphans what the manager has already recorded.

**`trainer_setup_checklists`** - one row per trainer, the header.

```
trainer_id   uuid pk references trainers (id) on delete cascade
start_date   date
amendments   text not null default ''
completed_at timestamptz
created_at, updated_at
```

`start_date` deliberately does **not** go on `trainers`. That table is read by
`anon` for the public form's picker, its grants are column-level, and `0009`
and `0012` are both scar tissue from getting those grants wrong. A separate
manager-only table keeps every commercially sensitive field in this feature
behind one RLS boundary instead of two.

**`trainer_setup_checklist_items`** - the ticks.

```
trainer_id  uuid references trainers (id) on delete cascade
item_id     uuid references setup_checklist_items (id)
state       setup_item_state not null default 'pending'
note        text not null default ''
updated_by  uuid references auth.users (id)
updated_at  timestamptz not null default now()
primary key (trainer_id, item_id)
```

A missing row means `pending`, the same way a missing `onboarding_part_status`
row means `not_started`. Rows are written on first tick.

**Three states, not a boolean:** `pending` / `done` / `not_applicable`. The
source document has "Fitaz email signature (if applicable)" written into it, so
a boolean means that trainer's checklist can never reach 100%, which kills the
completion signal before it is built. N/A is not a nice-to-have here, it is in
the source material.

The enum is a brand new type, so creating and using it in one transaction is
fine. `0013`'s two-part warning is about adding a value to an *existing* enum;
`0014` proves the fresh-type case commits in one go.

Every statement idempotent, as `0014` is: `if not exists` on the tables and
indexes, `exception when duplicate_object` on the enum, seed inserts as
`on conflict (key) do nothing`, policies dropped before created. The reason is
the one `0014`'s header gives: a migration you cannot safely re-run turns
"did this apply?" into a guess, and this project has already lost days to that
guess.

### RLS: manager-only, and asserted in the audit rather than assumed

All three tables: `for all to authenticated using (is_manager()) with check (is_manager())`.
No `my_trainer_id()` policy anywhere. No anon grants.

Here is the part that matters, and it is the direct answer to your note about
the guard rule biting if a trainer view is ever added. **The audit query gets an
inverted assertion**, in the style of `0014`'s "manager cannot write
development_goals":

> no policy on any of the three setup tables may mention `my_trainer_id`

PRESENT means trainers are correctly locked out at the database level. So the
protection against a trainer seeing the bond, the Business Pack and the rent
ramp is not "we did not build that screen". It is a policy plus a standing
check that fails loudly the day somebody tries. That is the lesson of `0013`,
where a UI filter was standing in for a database guarantee and nobody had
noticed.

New assertions to add to `supabase/reconcile/01_audit_live_schema.sql`:

- `enum setup_item_state`
- `relation setup_checklist_items` / `trainer_setup_checklists` / `trainer_setup_checklist_items`
- RLS enabled on all three
- all 18 seed items present
- **trainers cannot read any setup table** (the inverted one above)

### Seed labels: the figures come out

The paper checklist reads "Bond Paid (2 weeks rent, GST incl.)" and "Business
Pack Paid ($550 GST incl.)". I would seed those as **"Bond paid"** and
**"Business Pack paid"**, with no figures at all.

You know what the Business Pack costs. Putting `$550` into a database row buys
nothing and creates the one genuine hazard in this feature: a standard
commercial term sitting in a table that a future trainer-facing view would
render by default. The amounts live in the contract, which is where
`CLAUDE.md` says to point. Same for the bond.

This is a small call and easy to overrule if you want the figure as a memory
aid. But it is free to leave out, and it means the guard rule barely bites at
all later.

### The rent ramp: computed, never stored, no dollar amounts

Not modelled as rows. The header carries `start_date`, and the screen renders
the ramp from it:

| Weeks | Dates | Rent |
|---|---|---|
| 1 to 3 | computed from start_date | 0% |
| 4 to 6 | " | 25% |
| 7 to 9 | " | 50% |
| 10 to 12 | " | 75% |
| 13 onward | from that date | Full rent |

Percentages and dates only. **No amounts, ever**, which also disposes of the
scoping note's question about whether amounts are typed in or computed from a
full-rent figure on the trainer. Storing a per-trainer rent figure would put
each trainer's commercial terms in this app, and that belongs in Xero and the
contract. The `amendments` free-text field on the header covers the paper
form's Amendments column.

This also answers the "confirm week 13 percentage" question without needing
you: the row reads "Full rent" rather than a number.

### Derived items: live evidence beside the tick, never an automatic tick

Three items overlap features that already exist:

| Item | What the portal already knows |
|---|---|
| Signed Contract | a `contract`-type document in `trainer_documents` (migration `0015`) |
| Received Certs | qualification / CPR / insurance documents and their verification state |
| Completed Onboarding Program | `workbookPercent()` in `src/lib/staff.ts`, already written |

My recommendation: **all three stay manual ticks, each with a live evidence
line and a deep link underneath.** So "Received Certs" renders as a tick box,
and under it "3 documents on file, 1 awaiting review" linking to
`/admin/compliance/[trainerId]`. "Completed Onboarding Program" renders "72% of
the workbook" linking to that trainer's workbook progress.

Why not auto-tick. An automatic tick creates a second source of truth for
"is this done", and the two disagree the first time you have a cert in your
hand that has not been uploaded yet, or a contract signed on paper. You would
then be looking at a checklist that says no when the answer is yes, and you
could not correct it. The ticks are a record of what the manager knows;
the evidence line is what the system knows. Showing both and letting you
reconcile them is more honest than having the system guess.

One rule for all 18 items is also much easier to explain and to build than
three special cases.

If you would rather have the automation, the cheapest upgrade later is a
suggested state: an amber dot saying "looks done, tick to confirm", which keeps
the human in the loop. That is a follow-on, not v1.

### How the manager uses it

`/admin/setup` lists trainers, worst-first in the sense that matters: who is
still mid-setup. Each row shows name, start date, "9 of 18 done", and how long
it has been sitting.

That last number is deliberate and it is the one lesson worth carrying over
from the development screen, where the most useful column turned out to be
"you last wrote to them 6 weeks ago". A setup checklist does not fail because
nobody creates it. It fails because it gets to 14 of 18 and then sits there for
two months with the Coaches Board profile never ordered. So the list says
"started 6 weeks ago, 9 of 18" rather than just a progress bar.

`/admin/setup/[trainerId]` is the form: start date, the 18 items as big tap
targets with a three-way state and a note field each, the computed rent ramp,
and the amendments box. Big tap targets because you will be ticking these on a
phone walking around the gym, not at a desk.

Ticks save through a server action on change, each one recording who and when,
shown inline as "Karl, 12 Sep". `"use server"` files export only async
functions; form state goes in a sibling `state.ts`, per house rules.

When the last item goes to done or N/A, `completed_at` is stamped and the row
gets a "Setup complete" badge. Un-tick something and it clears. No badge on the
roster in v1: that widens the surface for no clear gain, and you can go and
look.

### What happens to a trainer who leaves or is archived

Follow `trainers.active`, which already means exactly this, and do not invent
anything. Concretely:

- **Nothing is deleted or hidden.** The checklist rows key on `trainer_id`, the
  same as `trainer_documents` and `development_goals`, and deactivating does
  not touch them. "Deactivating hides a trainer from the public form without
  touching their history" applies here unchanged.
- The `/admin/setup` list orders `active` first and puts inactive people under
  a **"No longer active"** heading, the way `/admin/trainers` orders and
  `/admin/compliance` includes them. Still openable, still editable, because a
  manager tidying up a record after somebody leaves is legitimate.
- Reactivating restores it unchanged. There is deliberately **no**
  `archived` flag of its own on the checklist. Two flags that can drift apart
  is the exact failure `src/lib/staff.ts` already calls out for staff.
- `on delete cascade` on `trainer_id` matches every other per-trainer table. In
  practice a trainer row is never actually deleted: `removeStaffAccess` goes out
  of its way to leave it, so history survives.

### Does a staff member on the development pathway get a checklist?

**No. It begins the day they are promoted to trainer.** Here is the reasoning,
and the reason it costs nothing.

Read the 18 items and ask which are true of a front-desk staff member working
towards their cert: contract, bond, Business Pack, rent, Ezidebit, website PT
profile, Coaches Board, welcome announcement. None of them. A staff member is
an employee; a PT here is self-employed and rents space. Giving them a
checklist on day one means a screen showing 16 correctly-unticked items that
will stay unticked for months, which trains you to ignore the screen. That is
how a tracking tool dies.

The two items that *are* true of them, certs and the workbook, are precisely
the two that read live state rather than being ticked. And that state keys on
`trainer_id`, which does not change at promotion. So a promoted staff member's
checklist appears on promotion day **already showing their real cert and
workbook position**, because none of it was ever keyed on the role. Nothing is
lost by not having the checklist earlier. That is the same property `0013` was
designed around and it pays off again here.

Mechanically: the list filters the same way `/admin/trainers` does, using
`getStaffTrainerIds()` to exclude people on the pathway. The schema ties to
nothing role-shaped, so if you later decide staff should have one it is a
filter change, not a migration.

Two small things that follow:

- `promoteStaffToTrainer` gains `revalidatePath("/admin/setup")` so the newly
  promoted person shows up straight away.
- I would also have promotion seed the header row with `start_date = today`,
  editable afterwards. Promotion day is genuinely the day they start as a PT,
  and it makes the rent ramp render immediately instead of waiting for someone
  to type a date. Trivial to back out if you disagree.

The empty state on `/admin/setup` points at `/admin/development` for people not
yet promoted, so the relationship between the two screens is stated on screen
rather than being folklore.

## 2. What I considered and rejected

**A trainer-facing read view.** Settled and out, and I am not re-opening it.
Noting only that the build takes one deliberate step to make that harder rather
than easier, which is the inverted audit assertion above.

**A manager-editable item list, with an add/remove/reorder screen** like
`/admin/compliance/types`. Rejected for v1. That precedent exists because
document types genuinely vary per gym and per trainer. These 18 items come from
a paper document you control and that changes maybe once a year, and the
editing screen is real work. `active` and `sort_order` are in the schema so a
later migration or a later screen can change the list without a rewrite, and
per-trainer N/A already handles the "does not apply to this person" case that
would otherwise drive people to delete items.

**Storing the rent ramp as rows** with amounts, as the scoping note suggests.
Rejected: it stores each trainer's commercial terms in the portal for no
operational gain, and the whole table is derivable from one date.

**Putting `start_date` on `trainers`.** Rejected, per the grants argument above.

**A boolean `done` column.** Rejected: the source document contains
"(if applicable)".

**Folding this into `/admin/development/[trainerId]`.** Rejected. Development is
the coaching conversation and is partly staff-owned; this is manager-only
business admin. Same person, different question, and mixing them puts
commercial items on a screen whose whole design assumes the subject can see it.

**Auto-ticking the three derived items.** Rejected, reasoning above.

**A "who can tick" flag on the template table**, as the scoping note suggests.
Dead weight in a manager-only v1. It is one column in a later migration if the
answer ever changes.

**A completion badge on the trainer roster.** Deferred, not rejected. Cheap to
add once you have used the screen and know whether you want it.

## 3. What has aged badly in the scoping note

Fixed in this pass, because both would mislead the next session:

- **`docs/PROJECT_STATUS.md` still describes the feature as one "the manager
  ticks off and the trainer can see".** That is the pre-8-September scope. You
  flagged it; corrected.
- **The scoping note contradicts itself.** Its "Decisions already settled"
  section says no trainer view, and then its own "Definition of done" at the
  bottom still requires "the trainer can see their own checklist status". Same
  fault, same fix, and worth catching because the DoD is the bit somebody reads
  last and builds to.
- **It points at `src/lib/onboarding/content.ts` for workbook content.** Stale;
  it is `parts/part1.ts` to `part10.ts` now.
- **It says to run `npm run lint`.** The script exists but `CLAUDE.md` specifies
  `npx eslint src`, which is what I will run.

Aged, but only advisory, so left alone and answered in the plan instead:
`trainer_checklist_progress` as a table name, the "who can tick" flag, the
rent-ramp modelling options, and the suggestion that the derived items should
reflect state automatically.

Also fixed while in here, because `PROJECT_STATUS.md` explicitly instructs that
a stale branch map gets corrected in the same session that finds it:

- `claude/pt-onboarding-workbook-updates-xmrtqs` is listed as **4 unmerged**. It
  merged as PR #30 and the branch is gone from the remote.
- `claude/forgot-password-change-email-gl4lca` is listed as **1 unmerged**; it
  is 3.
- The audit query's check count is 52, not 51.

## 4. What I need from you

**Nothing is blocking.** I have made a call on every open question and each one
is reversible. If you say "go" as-is, I build it.

Worth a look before I start, in descending order of how much rework a late
change would cost:

1. **The five calls.** Staff get no checklist until promotion; the seed labels
   drop the dollar figures; the rent ramp is computed with no amounts; the three
   derived items show evidence but stay manual; the feature is called "Setup".
   All five are in the plan with reasoning. Any of them can go the other way.
2. **The item list, from the source.** I have transcribed 18 items from the
   scoping note, which is itself a transcription of `PT_Onboarding_Checklist_.docx`.
   The docs in this repo lag reality often enough that I would rather seed from
   the original. Drop the file in, or confirm the list in the scoping note is
   current. If I hear nothing I will seed from the scoping note.
3. **One content question:** "Profile" and "Fitaz Gym Website PT Profile" are
   two separate items on the paper list. I have assumed "Profile" means their
   GymMaster profile and the other means the public site. If "Profile" means
   something else, say so, otherwise I will word the hints to that assumption.

No new access needed. Supabase MCP reaches the live project from here, so I can
apply `0016`, run the audit against live and test the RLS as a real signed-in
user inside `begin; ... rollback;` without waiting on anyone at the SQL editor.

## 5. In v1, and deliberately not

**In:**

- Migration `0016`, applied and verified against live, with its audit
  assertions added.
- `/admin/setup` list: active trainers, "9 of 18", start date, how long it has
  been sitting; inactive under their own heading; staff excluded with a pointer
  to Development.
- `/admin/setup/[trainerId]`: editable start date, 18 items with three states
  and a note each, who ticked and when, computed rent ramp, amendments box.
- Live evidence lines and deep links on the three derived items.
- `completed_at` stamped and a "Setup complete" badge.
- Nav entry, manager-only, with every screen refusing non-managers itself
  rather than relying on a hidden link.
- `promoteStaffToTrainer` revalidating `/admin/setup` and seeding the start
  date.
- The PROJECT_STATUS and scoping-note corrections above.
- `npx tsc --noEmit`, `npx eslint src`, `npm run build` all clean before push.

**Deliberately not:**

- Any trainer-facing view.
- A manager-editable item list with its own CRUD screen.
- Rent amounts, anywhere, in any form.
- Automatic ticking of derived items.
- Ezidebit or GymMaster integration. Both stay manual ticks.
- A completion badge on the roster.
- Email or digest nudges for a stalled checklist.
- A print or PDF export.

## 6. Things you have not asked for that you are probably going to want

Carried here rather than raised as separate questions.

- **A nudge when a checklist stalls.** The thing that actually makes this get
  used is not the form, it is something telling you that Jess has been at 14 of
  18 since July. v1 gets the honest version for free: the list says how long it
  has been sitting. The real version is a line in the existing daily digest
  cron, and it is maybe an hour's work once you have used the screen for a
  month and know what the threshold should be. I would not guess the threshold
  now.
- **Start date is useful beyond this screen.** Once it exists you will want it
  on the roster and probably in the trainer's own profile view. It is in a
  manager-only table on purpose, so surfacing it later is a deliberate decision
  rather than an accident, which is the right way round.
- **A print view.** The paper checklist gets printed and signed off. If that
  ritual matters, a print stylesheet on the detail page is cheap. Say so and I
  will add it; I have left it out rather than guess.
- **The Xero item hides five fields.** "Details sent to Fitaz Accounts for Xero
  set-up" carries full name, mobile, email, home address and ABN. In v1 that is
  one tick with the five fields as a hint underneath, and the note field for
  "waiting on ABN". If you find yourself writing "waiting on ABN" every time,
  that item wants sub-items, and that is a follow-on.
- **This is a phone screen.** You will tick these walking around the gym, so the
  rows are big tap targets and the ticks save on change rather than behind a
  Save button. Worth saying out loud because it is a design constraint, not a
  detail.
- **Two things I noticed in passing and have not touched**, because you asked
  for a plan rather than code: `src/lib/types.ts` dates the development types to
  `0011_development_goals.sql` when it is `0014`, and
  `claude/staff-development-pathway-scope-ac664k` is fully merged and still on
  the remote, marked "safe to delete" in the status doc. I will fold both into
  the build commit unless you would rather I left them.
