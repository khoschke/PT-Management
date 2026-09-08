# Handoff: Editable Trainer Pages (the "trainer portal" idea)

> **BUILT, 7 September 2026 — this note is now a record, not a task.**
> Delivered on `claude/trainer-profiles-self-editable-jqnn96`: internal only,
> bio + specialties + AM/PM availability, no photo, no Shopify feed.
>
> - **Screen:** `/admin/profile`, "My profile" in the dashboard nav. Shown to
>   any login with a linked `trainer_id` — which is what the real data needed,
>   because Karl's login is `role = trainer`, not `manager`, and the three
>   `manager` logins have no trainer row of their own.
> - **Database:** migrations `0010_trainer_self_profile.sql` and
>   `0011_trainer_self_availability.sql`, **both applied to live and verified
>   7 Sep 2026.** Two policies (`trainers_select_self`, `trainers_update_self`)
>   plus a `guard_trainer_self_update` trigger.
> - **Scope grew twice, deliberately.** Karl tested the first cut on the Vercel
>   preview and asked for AM/PM availability to be editable (`0011`), then for
>   both-slots-off to become a real "my book is full, pause my leads" control
>   (`0012`). Name, email, gender and `active` remain manager-only.
> - **A correction worth keeping.** `0011` blocked both-off on the stated
>   grounds that it would drop a trainer out of allocation. That was wrong:
>   availability was never a filter, only a `+5` score in `suggestTrainer`, and
>   because ties break on lowest lead load an empty-booked trainer would have
>   won *more* often. `0012` lifts the block and makes the pause real —
>   `suggestTrainer` filters paused trainers out before rule 1, and the public
>   form's picker hides them so a member can't request someone whose book is
>   full. The manager can still allocate to a paused trainer by hand, and the
>   roster labels them "Paused, not taking new leads".
> - **The watch-out below was right, and a plain `update` policy was not
>   enough.** RLS is row-level, so the policy on its own would also have let a
>   trainer flip their own `active` or repoint their `email` — the address lead
>   allocation notifications go to. The trigger is what narrows the write to
>   bio and specialties. It compares the whole row as jsonb minus those two
>   keys, so a column added to `trainers` later is protected by default.
> - **Verified against live**, as a real signed-in trainer, in rolled-back
>   transactions: own edit saves; changing own name, email, `active` or `id` all
>   raise 42501; editing another trainer's row matches zero rows; the manager
>   still edits every column of everyone; the public form's trainer picker and
>   the service-role clients are unaffected.
> - **Confirmed working end to end** by Karl on the Vercel preview deployment,
>   7-8 Sep 2026: profile fields, specialties, availability, and the pause
>   hiding a trainer from the public form's picker. The build workspace has no
>   outbound network, so his passes on the preview are the browser
>   verification.
> - **Two safeguards on the pause**, because its consequence is invisible once
>   set. Both forms warn live, as the second chip comes off and before anything
>   is saved. And a paused trainer gets a standing banner on every page of the
>   authed app, with a one-click way back, for as long as they stay paused —
>   the likelier failure is not a mis-click but pausing in a flat-out week and
>   forgetting for a month, and only the standing reminder catches that. A
>   confirm() dialog was considered and rejected: this repo reserves those for
>   irreversible actions (permanent delete, revoking access), and a modal fires
>   only at the moment someone already intends to pause.
> - **One thing to know when testing:** the Vercel preview points at the LIVE
>   Supabase project. A lead submitted from the preview form is a real row on
>   the real board, and allocating it sends a real email to a real PT. The
>   allocation suggestion renders before you allocate, so the manager-side
>   pause can be checked without triggering anything.
>
> The rest of this note is kept as the original scoping, unchanged.

---

Read `docs/PROJECT_STATUS.md` first for the full lay of the land, then this.
The note keeps the original vision and the architecture correction for context,
then states the decisions, scope, and definition of done.

## The vision (captured faithfully)

Each of the five PTs gets their **own page they can edit themselves** — a profile
that's actually theirs to keep current, rather than something the PT Manager
updates on their behalf. The picture in the owner's words: a trainer logs in,
opens their page, and edits it — photo, bio, specialties, whatever represents
them — and the change is live without going through Karl.

That's the whole idea, and it's a good one. Two things make it more than
cosmetic:

- **It's self-service.** Today a trainer can't change anything about how they're
  represented; a manager does it for them on the roster screen. The vision flips
  that: the trainer owns their own page.
- **It's a page, not just a form field.** The mental model is "my page," a thing
  with a shape and a look, not a row in an admin table.

## Reality check: "one mother MCP hosted through Shopify"

The vision came wrapped in an architecture framing — *"it's all one mother MCP,
hosted through Shopify"* — that's worth untangling before anyone builds against
it, because it doesn't match how this system is actually put together. None of
this changes whether the feature is a good idea; it changes *where* and *how*
it gets built.

- **It isn't an MCP.** MCP (Model Context Protocol) is a way for AI assistants to
  call tools. Nothing here is an MCP server, and this feature doesn't need one.
  What we have is an ordinary **Next.js web app** (App Router + TypeScript +
  Tailwind). "One mother MCP" is best read as "one single app that everything
  hangs off" — and *that* part is true: there is one app, and the trainer pages
  would live inside it.
- **It isn't hosted through Shopify.** The app runs on **Vercel**, with
  **Supabase** (Postgres + Auth + Row Level Security) behind it. Shopify hosts a
  *different* thing: the gym's marketing website at `fitazgym.com`. The only
  point of contact between the two is DNS — we're pointing `pt.fitazgym.com` at
  Vercel via a CNAME added in Shopify's domain settings (see
  `docs/handoff-custom-domain.md`). Shopify never runs our code, never sees our
  database, and never serves these pages.
- **Where the confusion comes from is understandable.** The custom-domain work
  means the app *will* answer at a `fitazgym.com` subdomain, and the gym already
  has trainer profiles on its Shopify site
  (`fitazgym.com/pages/personal-trainers`, which the public form currently just
  links out to — see `docs/handoff-trainer-profiles-link.md`). So there are two
  places today that show trainers, and they're on two different platforms. The
  editable pages, if built, would be **our app on Vercel**, not the Shopify page.

The one-sentence version to give the owner: *"It'll be one thing to log into, and
it'll live at a fitazgym.com address — but it's our own app on Vercel and
Supabase, separate from the Shopify website, not something running inside
Shopify."*

## Decisions (settled with Karl, 2026-08-04)

The open questions have been answered. This is now a scoped, buildable
workstream — the decisions below are the spec.

1. **Internal, not public.** The trainer portal is an **internal** tool — seen
   only inside the logged-in app by the trainer themselves and the manager. It is
   *not* a member-facing marketing page. The public already reach trainer info
   another way: the public expression-of-interest form links out to the gym's
   own website. So there is **no public view route, no vanity URLs, no
   `active=false`-hides-a-public-page question** — all of that is out of scope.
2. **Both edit.** A trainer edits their **own** profile (self-service), and the
   manager retains the ability to edit **everyone's** (the existing roster
   editor). Not either/or — both paths stay.
3. **Bio + specialties only, for now.** No photo in this pass. That deliberately
   dodges the one costly new capability (image upload/storage), so this becomes a
   small, contained build. Photo can come later as its own increment if wanted.
4. **Relationship to the Shopify page: lean toward "feed it," later.** The
   thinking is that the internal portal becomes the place trainers keep their
   bio/specialties current, and that data eventually **feeds** the gym's public
   Shopify `personal-trainers` page (rather than running as a second, drifting
   copy). Not decided firmly, and **not part of this build** — feeding Shopify is
   a separate integration (writing to Shopify) to scope on its own. For now, just
   don't design the internal portal in a way that would make a future feed
   awkward. Nothing else about this build depends on it.

## What exists today (so you build *with* it, not around it)

- **`trainers` table** already holds `name`, `email`, `gender`, `specialties[]`
  (goal codes that drive allocation), `availability`, `active`, and a free-text
  `bio` (added in `0003_trainer_bio.sql`). A lot of "profile" already lives here.
- **Trainers are manager-managed only.** The roster editor is at
  `src/app/admin/(dashboard)/trainers/` and is gated to `role === "manager"`
  (`page.tsx` redirects trainers away). Logins are managed at `/admin/staff`,
  also manager-only.
- **A trainer who logs in** lands on `/admin` seeing only their own allocated
  leads (enforced by RLS, not just UI), plus the `/onboarding` workbook. **There
  is no trainer-editable surface today** — that's exactly the gap this fills.
- **The public form links out** to the gym's Shopify trainer page rather than
  rendering trainers itself — a deliberate past decision to avoid maintaining
  profiles in two places (`docs/handoff-trainer-profiles-link.md`). If we now
  build editable pages in-app, revisit that decision: option (A) above could make
  the link point *into* our app instead of out to Shopify, which finally kills
  the two-places problem.

## Scope

With the decisions above, this is a small, contained build — no photos, no public
routes.

- **Let a trainer edit their own row.** New self-service surface (e.g.
  `/admin/profile` or a "My page" tab in the authed app) where a logged-in
  trainer edits *their own* `bio` and `specialties`. The heavy lifting is an RLS
  policy letting a trainer `update` the `trainers` row where
  `id = their profile.trainer_id` — mirroring how `leads` already scopes
  per-trainer. Managers keep the existing roster editor for everyone (that path
  already exists and stays).
- **Editable fields: `bio` + `specialties` only.** *(Superseded 7 Sep 2026:
  AM/PM availability was added at Karl's request after he tested the first cut.
  See the note at the top.)* Both columns already exist on
  the `trainers` table — no schema change for the fields themselves, just the new
  RLS `update` policy and the self-service UI. No photo, no new columns this pass.
- **No public view route.** Internal only — the profile is rendered inside the
  logged-in app for the trainer and manager, nothing served to the public.
- **Later, separately:** a photo field (needs Supabase Storage) and/or feeding
  the Shopify public page — each its own scoped increment, not this build.

## Watch-outs

- **RLS is the whole ballgame for self-service.** A trainer must be able to edit
  their own row and *no one else's*. Get the `update` policy right at the
  database level (scoped to `profile.trainer_id`), the way `leads` already is —
  don't rely on hiding the form.
- **Photos are out of scope this pass** — deliberately, because no image
  upload/storage exists yet (it'd mean Supabase Storage, an upload flow, size/type
  limits). If it comes back later, budget for it as its own increment; don't let
  it creep into this build.
- **Match the `/admin` design system.** This lives inside the authed app, so it's
  the monochrome, light-mode `/admin` look (tokens in `src/app/globals.css`), not
  the themed `/onboarding` layer and not a new third style. Mirror the existing
  roster/account form markup.
- **`specialties` drives allocation.** It's not just display copy — editing it
  changes who gets suggested for which lead. Fine for a trainer to edit, but say
  so in the UI so they understand a change here affects lead matching.
- **No outbound network in this build workspace.** Same as everywhere in this
  repo: build, deploy to Vercel, verify on the live site.

## Still open (not blockers — decide while building)

The big questions are settled; these are small ones the builder can resolve
sensibly without another round with Karl:

- **Where the self-service surface lives** — a dedicated "My profile / My page"
  tab, or folded into the existing `/admin/account` screen (which already does
  self-service password). Either is fine; pick what reads cleanest.
- **Exact `specialties` editing UX** — same tag picker the manager roster uses,
  reused for the trainer's own row. Reuse, don't reinvent.

## Definition of done

A logged-in **trainer** can edit their own `bio` and `specialties` from a
self-service screen inside `/admin`; the change is enforced per-trainer by an RLS
`update` policy (a trainer can update only the `trainers` row matching their
`profile.trainer_id`, and no other); the edit shows up wherever trainer info is
used (roster, allocation matching); and the **manager** can still edit everyone
via the existing roster editor. Internal only — nothing new is served to the
public. Photo and any Shopify feed are explicitly *not* part of this and come
later as separate increments.
