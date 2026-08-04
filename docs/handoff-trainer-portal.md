# Handoff: Editable Trainer Pages (the "trainer portal" idea)

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first for the
full lay of the land, then this. **Nothing here is built yet** — this note
captures the vision, corrects one architecture misunderstanding, sketches likely
scope, and lists the questions to settle *before* any code is written.

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

## The question that decides everything: public or internal?

**This is the fork in the road, and it needs an answer before scoping.** "A page
each trainer can edit" splits into two very different builds depending on who the
page is *for*:

- **(A) Public marketing pages** — a member or prospect can view a trainer's page
  (think: the thing that could eventually replace or feed the Shopify
  `personal-trainers` page). Trainers edit; the public reads.
- **(B) Internal profile** — the page is only ever seen inside the logged-in
  tool (by the trainer themselves and the manager), a richer version of the
  roster/bio we already have. Nobody outside staff sees it.

These are not small variations on one feature — they change the data model, the
security model, the URLs, and the review burden. Do not start building until
this is settled. See "Open questions" for the rest.

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

## Likely scope (once public-vs-internal is answered)

Sketch, not a spec — firm it up after the open questions close.

- **Let a trainer edit their own row.** New self-service surface (e.g.
  `/admin/profile` or a "My page" tab) where a logged-in trainer edits *their
  own* fields. The heavy lifting is an RLS policy letting a trainer
  `update` the `trainers` row where `id = their profile.trainer_id` — mirroring
  how `leads` already scopes per-trainer. Managers keep the existing roster
  editor for everyone.
- **Decide the editable field set.** `bio` and `specialties` are the obvious
  ones. A **photo** is almost certainly wanted for a "page" and is the biggest
  net-new piece — it means Supabase Storage, an upload flow, and image handling
  we don't have anywhere yet.
- **If public (option A): the view page.** A read route (e.g.
  `/trainers/[slug]` or `/t/[id]`) rendering the profile for anyone, plus a
  slug/identifier scheme, and a decision on whether `active = false` hides it.
- **If internal (option B):** likely no new public route at all — just a
  trainer-visible render of their own profile inside the authed app, much
  simpler.

## Watch-outs

- **RLS is the whole ballgame for self-service.** A trainer must be able to edit
  their own row and *no one else's*. Get the `update` policy right at the
  database level (scoped to `profile.trainer_id`), the way `leads` already is —
  don't rely on hiding the form.
- **Photos are a new capability.** No image upload/storage exists yet. If a photo
  is in scope, budget for Supabase Storage setup, upload UI, size/type limits,
  and public-URL handling. Don't assume it's a small add.
- **Design system split still applies.** `/admin` and `/pt-session` are
  monochrome, light-mode only; `/onboarding` is its own themed layer. A new
  *public* trainer page needs an intentional design decision about which world it
  lives in (or a third look) — don't let it default to unstyled.
- **Don't duplicate the Shopify page by accident.** If we build public pages,
  either replace the outbound link to `fitazgym.com/pages/personal-trainers` or
  consciously decide to run both — but don't ship a second, drifting source of
  truth for trainer info without a call on it.
- **`specialties` drives allocation.** It's not just display copy — editing it
  changes who gets suggested for which lead. Fine for a trainer to edit, but say
  so in the UI so they understand a change here affects lead matching.
- **No outbound network in this build workspace.** Same as everywhere in this
  repo: build, deploy to Vercel, verify on the live site.

## Open questions to settle with the owner (before building)

1. **Public or internal?** (Section above.) The one that gates everything.
2. **Who edits?** Trainer self-service only, or manager can still edit everyone
   too? (Recommended: both — trainer edits self, manager retains override.)
3. **What's on the page?** Bio + specialties only, or also photo, quote,
   certifications, socials, contact? Photo specifically — yes or no? (It's the
   costliest single field.)
4. **Relationship to the Shopify `personal-trainers` page.** Replace it, feed it,
   or run alongside it? Does the public form's "meet our trainers" link change to
   point in-app?
5. **What does `active = false` do to a public page** — hide it entirely, or
   leave it up? (Internal build makes this moot.)
6. **URLs / how a page is shared** if public — vanity slug per trainer, or an
   opaque id?

## Definition of done

Deliberately left open — this note exists to get the questions answered first. A
reasonable **first milestone once scope is set**: a logged-in trainer can edit
their own `bio` (and `specialties`) from a self-service screen, the change is
enforced per-trainer by RLS, it's visible wherever trainer info is shown, and no
trainer can edit another's row. Photo and any public view page follow as separate,
explicitly-scoped increments.
