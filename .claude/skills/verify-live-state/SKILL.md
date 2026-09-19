---
name: verify-live-state
description: Verification discipline for the Fitaz PT portal — how to prove a claim about the live system instead of asserting it. Use this whenever you are about to say something is applied, live, working, fixed, sending, done or broken; before updating docs/PROJECT_STATUS.md or marking a workstream complete; before reporting a fault in the live site or the onboarding workbook; and whenever the work touches Supabase migrations, RLS, auth emails, Resend, DNS, or a Vercel deploy. In this project the code is usually right and the live configuration is usually wrong, so "built and deployed" is never the same as "verified", and a green deploy proves nothing about whether a page works.
---

# Verifying live state

## The one idea

Almost nothing in this project has broken because the code was wrong.

Things have broken because a migration in `supabase/migrations/` was never run.
Because a Supabase Site URL was still `http://localhost:3000`. Because an SMTP
password was not a valid Resend key. Because a redirect allowlist entry did not
match a URL with a query string appended, and said nothing about it. Because an
SPF record had a copy-paste error. Because a Vercel deploy silently stalled.

None of those are visible in the repository. All of them were invisible until
something was measured.

So the habit this skill asks for is narrow and specific: **before stating that
something about the live system is true, name the observation that makes it
true, go and make that observation, and report what came back.** If you cannot
make it, say which fact is unverified and who has to check it. That sentence is
more useful than a confident guess, and it costs about one tool call.

## Three words that are not synonyms

Keep these apart in your own head and in anything you write down. Conflating
them is how `/admin/compliance` stayed broken in production for weeks while the
status doc said the feature was done.

- **Built** — the code exists on a branch. Proves nothing about production.
- **Deployed** — the code is on the live host. Proves it compiled. Does not
  prove a page renders, a query succeeds, or a migration ran.
- **Verified** — a specific observation of the live system came back the way it
  needed to, and you can quote it.

When you write a status, say which of the three you mean. "Built and deployed
but not exercised against a real inbox" is an honest and genuinely useful
sentence. "DONE" over the top of it is not.

## Claim to evidence

When you are about to make a claim in the left column, the right column is what
turns it into a fact. This table is the working core of the skill.

| Claim | Evidence that settles it |
|---|---|
| "Migration `00NN` is applied to live" | Run `supabase/reconcile/01_audit_live_schema.sql` and read the PRESENT/MISSING rows. The file list is a claim; the query is the evidence. |
| "This migration is safe to apply" | Run `./supabase/reconcile/local_migration_check.sh` first. It builds a throwaway Postgres and applies the whole chain in fresh-setup order. No network, no credentials. |
| "RLS lets a trainer see only their own rows" | Become that user in a transaction and read back, then roll it back. See `references/supabase.md`. |
| "The feature works on the live site" | Somebody opened it in a browser and it did the thing. A green Vercel status is not this. |
| "The auth email sends" | `recovery_sent_at` is non-null, the Resend log shows delivered, and the message is in the inbox. Three separate facts. |
| "The emailed link points at the right place" | Read the actual `redirect_to` in the actual email. Supabase drops a non-matching redirect *silently* and sends the email anyway. |
| "The deploy went out" | It appears in Vercel Deployments. Auto-deploy can stall with no error. |
| "DNS is correct" | Read the record in the CrazyDomains panel and confirm it is Active. The zone is at CrazyDomains, not Shopify. |
| "The workbook says something wrong" | Grep the master `.docx` and quote its actual words. See below. |
| "It's fixed" | Reproduce the original failure, apply the fix, watch the same check pass. Not one or the other. |

## Check the source before flagging a fault in it

Three faults reported against the onboarding workbook turned out not to be
faults: the master document already said the right thing, and the gap was the
portal's condensation of it. Each cost a round trip through two agents and a
human.

Before reporting that content is wrong, or proposing a change to it, pull the
master and read the passage. One grep turns a wrong flag into a correct one.
This generalises past the workbook: it is the same move as reading the audit
query before asserting what is on live. Check the thing itself, not your model
of it.

## When you cannot verify

This build workspace has no outbound network to Supabase's REST API, Google,
GymMaster, or a Vercel preview URL. Curling a preview gets `403` at the proxy.
That limit is real and it is not a reason to guess.

Two things still work from here, and they cover more than they look like they
do:

- **The Supabase MCP server** reaches the live project directly. Migrations, the
  audit query, RLS tests as a real signed-in user.
- **Postgres 16 is installed locally** at `/usr/lib/postgresql/16/bin`, so the
  whole migration chain can be applied and tested with no network at all.

Reach for those before concluding something is unverifiable. When it genuinely
is, write the specific sentence: *what is unverified, what observation would
settle it, and who can make it.* "Michael needs to open
`https://pt.fitazgym.com/admin/compliance` and confirm the table loads" is a
task someone can do. "Should be working" is not.

## Testing auth emails without wasting an afternoon

This one has its own section because it burned four days once and nearly did it
again.

**Send one email. Click that one. Touch nothing else.**

Each new recovery request immediately invalidates the previous link, Gmail
collapses the identical messages into one thread, and `otp_expired` means a
*spent* token, not a timed-out one. So sending three test emails and clicking
whichever one you can find is close to guaranteed to fail, in a way that looks
exactly like a broken feature. Delete the thread, send exactly one, click that.

## Record what it cost

When a fault took real effort to find, write down the fault *and the technique
that found it* — in the commit message, and in the relevant handoff doc under
`docs/`. Not out of tidiness: every one of these recurs, and the technique is
usually the more valuable half. "Check whether `POST /token` happened at all"
cracked a problem after two wrong diagnoses, and it is reusable.

The existing docs are the standard to match. Read one before writing one.

## Reference files

Load the one that matches what you are touching.

- `references/supabase.md` — migrations, the audit query, the local Postgres
  check, testing RLS as a real user, storage buckets, ordering around a deploy.
- `references/auth-and-email.md` — the six forgot-password faults and what each
  one looked like, Resend keys, Site URL, the redirect allowlist, TokenHash vs
  PKCE, the middleware trap.
- `references/deploy-and-network.md` — what the build workspace can and cannot
  reach, Vercel stalls, preview URLs, DNS and SPF/DKIM.
