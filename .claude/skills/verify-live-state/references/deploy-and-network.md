# Deploys, and what this workspace can reach

## What a build session cannot reach

No outbound network to Supabase's REST API, Google, GymMaster, or any live HTTP
endpoint of the app — **including the Vercel preview URL**. Curling a preview
deployment fails with `CONNECT tunnel failed, response 403` at the proxy.
Confirmed 8 September 2026 while watching PR #28.

The consequence is the important part: **a green Vercel status proves the app
built and deployed. It never proves a page renders or a query works.** Somebody
has to open it in a browser.

Say that plainly when it applies, and name the URL and the person. "Open
`https://pt.fitazgym.com/admin/compliance` and confirm the table loads" is a
task someone can complete in ten seconds. "Should be working now" is not.

## What a build session *can* reach

Do not conclude something is unverifiable before checking these.

- **The Supabase MCP server** reaches the live project directly — migrations,
  the audit query, `auth_logs`, RLS tests as a real signed-in user. This is a
  direct channel to production state and it covers most of what matters.
- **Postgres 16 locally**, at `/usr/lib/postgresql/16/bin`. The whole migration
  chain, applied and tested, with no network at all. See `supabase.md`.
- **The Resend MCP**, for delivery logs.
- **The repository itself**, which settles any claim about what the code does.

## Vercel

Production branch is `claude/fitaz-gym-pt-leads-76ffhv`. Pushing to it
auto-deploys. Hobby plan, plus a daily-digest cron in `vercel.json`.

**Auto-deploy can silently stall.** If a push does not appear in Deployments,
push again to re-trigger — an empty commit works for this, and this is the one
place it is a legitimate tool rather than a way to kick CI.

Confirm a deploy actually deployed before treating it as the baseline for
anything downstream. The August migration runbook waits for green *and* checks
Deployments before applying the destructive half of a migration, for exactly
this reason.

## Environment variables

Values live in Vercel and local `.env.local`, names only in
`docs/PROJECT_STATUS.md`. Set and working: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `IP_HASH_SALT`,
`PT_MANAGER_EMAIL`, `RESEND_API_KEY`, `NOTIFICATIONS_FROM_EMAIL`, `CRON_SECRET`.

`NEXT_PUBLIC_SITE_URL` is **not set**. Nothing on production reads it today.

An environment variable being named in a doc is not evidence it is set in
Vercel, and a variable being set is not evidence its value is right — see the
Resend key in `auth-and-email.md`. If a feature depends on one, check the value
does what it claims, don't check that the name exists.

## Checks before you push

```
npx tsc --noEmit
npx eslint src
npm run build
```

There is no test suite and no CI workflow, so these three commands are the
entire automated safety net. Run them. They are cheap, and a build failure
found here costs a minute rather than a deploy cycle.
