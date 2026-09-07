# Handoff: Self-Service Auth — Forgot Password + Change Email

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

This supersedes and combines `docs/handoff-forgot-password.md`. Build both pieces
in the one session: they share the same Supabase Auth email plumbing, the same
redirect-URL allowlist step, and the same `@supabase/ssr` patterns, so doing them
together avoids repeating the config and the verification.

## The two goals

### 1. "Forgot password?" on the login page
A locked-out manager or trainer resets their own password without an admin:
1. Clicks "Forgot password?" on `/admin/login` → enters their email.
2. Supabase Auth emails a recovery link.
3. They click it, land on a reset page, set a new password.
4. They sign in with it.

### 2. Self-service "change my email" on the Account screen
A signed-in user changes their own **sign-in email** from `/admin/account`:
1. Enters a new email.
2. `supabase.auth.updateUser({ email })` sends a confirmation link to the new
   address (Supabase Auth default: the change only takes effect once confirmed).
3. They click it; the login email is updated.

## Where this sits relative to what already exists

- **Self-service password change** already exists at `/admin/account`
  (`components/ChangePasswordForm.tsx` → `supabase.auth.updateUser({ password })`).
  The Account screen currently does password only — you are adding the email field
  beside it, and adding the forgot-password flow as a separate route.
- **Manager-assisted resets** already exist at `/admin/staff` (service-role admin
  client): a manager can change anyone's sign-in email or password immediately,
  with `email_confirm: true`, so those need no confirmation email. That path is
  the fallback and stays. These two new features are the *self-service* versions
  for when no manager is in the loop.

## STATUS, 7 September 2026: built, NOT merged — Supabase SMTP is broken

Both features are **built and on `claude/forgot-password-change-email-gl4lca`**.
They are **not merged and must not be merged** until the one item below is fixed,
because Supabase Auth currently cannot send a single email.

### What the delivery test found

The handoff said to send a real auth email first and not to trust the "Custom
SMTP is set up" report. That was the right call. A real recovery request for
`khoschke+trainer@gmail.com`, made against the live project, came back:

```
POST /auth/v1/recover
500 {"code":500,"error_code":"unexpected_failure","msg":"Error sending recovery email"}
```

and the project's own auth log gives the cause:

```
error: 535 "Authentication credentials invalid"
```

Corroborating evidence:

- `recovery_sent_at` is **null for all eight rows in `auth.users`** — no auth
  email has ever successfully left this project.
- Resend's sent-email log contains only the app's own API-sent notifications
  (allocation emails, daily digest). No SMTP-originated message has ever
  appeared.
- `535` with that exact wording is **Resend's** SMTP rejection, so host and port
  are right and Supabase *is* reaching `smtp.resend.com`. The credential is what
  it refuses.
- A Resend API key named `supabase-smtp` does exist (created 12 Aug 2026). Its
  value can't be read back after creation, so whether the string pasted into
  Supabase matches it is exactly the thing that can't be checked from outside.

### The fix (5 minutes, needs a human — it is dashboard config, not code)

1. In **Resend → API Keys**, create a fresh key with **Sending access**, and
   copy it. Don't try to reuse the existing `supabase-smtp` key — its value
   isn't recoverable, and it's the prime suspect for having been mistyped or
   truncated on the way into Supabase.
2. In **Supabase → Authentication → Emails → SMTP Settings**, confirm:
   - Host `smtp.resend.com`
   - Port `465`
   - Username `resend` (literally that word, not an email address)
   - Password: **paste the new key**, whole, no surrounding spaces
   - Sender email on the verified domain, e.g. `noreply@mail.fitazgym.com`
3. Save, then use **Send test email**. It must arrive.
4. Re-check by hitting "Forgot password?" on the deployed branch and confirming a
   real recovery email lands.

Nothing in this repo can fix that — Supabase's SMTP settings are dashboard
config, not code, and the Supabase MCP has no tool that writes auth config.

### Two other dashboard steps, still outstanding

- **Redirect URL allowlist.** Authentication → URL Configuration → Redirect URLs
  must include `https://pt.fitazgym.com/admin/auth/callback`. An un-allowlisted
  `redirectTo` fails **silently** — the email arrives, the link just doesn't come
  back to the app. Add the Vercel preview host too if the branch is to be tested
  before merge.
- **`NEXT_PUBLIC_SITE_URL`** must be set to `https://pt.fitazgym.com` in Vercel.
  Without it the code falls back to the request's own host, which on a preview
  deployment means emailing links that point at that preview.

### Why the code was built anyway

The handoff's rule was "do not ship a dead link", not "do not write the code".
The branch is not Vercel's production branch, so nothing here is deployed and
nothing user-facing has changed on the live site. Merging is the step that ships
it, and merging is what is being held. The "Forgot password?" link and the
Account email field go live together, after a real email has been seen to land.

## What was built

- `src/lib/site-url.ts` — absolute base URL for emailed links.
  `NEXT_PUBLIC_SITE_URL` wins; otherwise the request's own host, so local and
  preview work with no setup.
- `src/app/admin/forgot-password/` — the request-a-link screen.
- `src/app/admin/auth/callback/route.ts` — the single landing point for every
  emailed auth link. Handles **both** the PKCE `code` shape (what the default
  email templates produce) and the `token_hash` + `type` shape (what templates
  rewritten to `{{ .TokenHash }}` produce, which also works cross-device).
- `src/app/admin/reset-password/` — the set-a-new-password screen.
- `src/lib/recovery-session.ts` — the marker cookie described below.
- `src/app/admin/(dashboard)/account/components/ChangeEmailForm.tsx` and
  `changeEmail` in that folder's `actions.ts` — the self-service email change.
- `src/proxy.ts` — `/admin/forgot-password` and `/admin/auth/callback` are now
  reachable signed out.

### Two decisions worth knowing about

**The recovery marker cookie.** Exchanging a recovery link gives an ordinary
session, indistinguishable from a normal sign-in. Without a marker,
`/admin/reset-password` would let *anyone already signed in* set a new password
without knowing the current one — which is the exact hole the Account screen's
current-password check exists to close. So the callback sets an httpOnly
`pt-password-recovery` cookie (15 minutes, path `/admin`) only after verifying a
real recovery code, `/admin/reset-password` requires it, and the reset action
spends it on success. A signed-in user can't mint one for themselves.

**Errors from the send are shown, not swallowed.** The "did that email exist?"
answer is still generic — Supabase returns 200 and sends nothing for an unknown
address, so a success message reveals nothing. But when the send itself *fails*,
the user is told. Claiming "we've sent you a link" while SMTP is down is the
precise failure this handoff was written to prevent, and it would have hidden
the 535 above. The residual signal (an infrastructure error only reaches a real
account) exists only while email is broken, which is a state to fix rather than
design around.

## Build plan as originally scoped

Kept as the record of what was asked for. All of it is implemented — see
**What was built** above for where each piece actually landed.

Stack notes: **@supabase/ssr** (cookie sessions, PKCE), Next.js 16 App Router,
session middleware in **`src/proxy.ts`** (Next 16's renamed middleware). Mirror the
existing `login/` and `account/` patterns: `useActionState` + a sibling `state.ts`;
`"use server"` files export only async functions (a plain object export 500s on
Vercel — this has bitten the project before).

### Forgot password
1. **Login link** — in `src/app/admin/login/LoginForm.tsx`, add a small
   "Forgot password?" link to a new route `/admin/forgot-password`.
2. **`/admin/forgot-password`** — a form (email) whose server action calls, on the
   session-scoped server client (`@/lib/supabase/server`):
   ```ts
   await supabase.auth.resetPasswordForEmail(email, {
     redirectTo: `${siteUrl}/admin/reset-password`,
   });
   ```
   Always show a **generic** confirmation ("If that email is registered, we've sent
   a reset link") whether or not the email exists — don't reveal which emails have
   accounts (enumeration safety).
3. **Recovery callback** — the emailed link returns with a `code` (PKCE) to be
   exchanged for a session. Add a route handler that calls
   `supabase.auth.exchangeCodeForSession(code)` and lands the user on the reset
   form. Verify the exact handling against the installed `@supabase/ssr` version
   and `src/proxy.ts` so the recovery session lands in cookies correctly.
4. **`/admin/reset-password`** — with the recovery session active, show a
   set-new-password form (reuse the `ChangePasswordForm` pattern: new + confirm,
   min 8, must match) → `supabase.auth.updateUser({ password })` → redirect to
   `/admin`.

### Change email
5. **Account screen** — add an email-change form to
   `src/app/admin/(dashboard)/account/` (new component beside `ChangePasswordForm`,
   plus an action in `account/actions.ts`). Action calls
   `supabase.auth.updateUser({ email: newEmail })` on the session server client.
   Tell the user plainly: "We've sent a confirmation link to the new address. Your
   sign-in email changes once you click it." Handle the "already in use" error
   path with a friendly message.
   - There is an email-change confirmation callback too. Depending on Supabase's
     settings it may require confirming from **both** the old and new address
     ("Secure email change"). Decide whether to keep that on (safer) and word the
     UI to match. The same `exchangeCodeForSession` / callback route can serve it.

### Shared config
6. **`siteUrl`** — add `NEXT_PUBLIC_SITE_URL` (set it to `https://pt.fitazgym.com`
   in Vercel) or derive from request headers; used for every `redirectTo`.
7. **Supabase redirect allowlist** — in Authentication → URL Configuration →
   Redirect URLs, add the callback/reset URLs for **`https://pt.fitazgym.com`**
   (the live custom domain — not just the `*.vercel.app` host), plus a preview URL
   if you want to test on a deployment. An un-allowlisted `redirectTo` fails
   **silently** — this is the #1 thing people miss.

## Gotchas

- Redirect-URL allowlist must include the live domain `pt.fitazgym.com`.
- Keep the "did that email exist?" response generic.
- `"use server"` async-only; form-state objects in sibling `state.ts`.
- Recovery / confirmation links are single-use and time-limited; test with a fresh
  one each time.
- **Direct HTTPS to Supabase and to pt.fitazgym.com is still blocked** from a
  Claude build workspace. But the **Supabase MCP server is not** — `execute_sql`
  and `query_logs` reach the live project, and that is how the 535 above was
  found without deploying anything. Use it. The browser-level flow (clicking a
  real link in a real inbox) still needs a real deployment.
- Run `npm run build` + `npx tsc --noEmit` + `npm run lint` before pushing.

## Definition of done

1. A locked-out manager or trainer clicks "Forgot password?", enters their email,
   receives a recovery email, sets a new password from the link, and signs in —
   no admin involvement, and no leak of which emails have accounts.
2. A signed-in user changes their own sign-in email from `/admin/account`, receives
   the confirmation link, clicks it, and can then sign in with the new email.
3. Both verified against a real inbox on the live site; neither link is a dead end.

### Where that stands, 7 September 2026

| | State |
|---|---|
| Code for both flows | **Done**, on `claude/forgot-password-change-email-gl4lca` |
| `npm run build`, `npx tsc --noEmit`, `npm run lint` | **All clean** |
| Route wiring smoke-tested (public routes reachable signed out, `/admin/reset-password` and `/admin/account` bounce to sign-in, dead callback links land on sign-in with a friendly notice) | **Done**, against a local production build |
| Supabase SMTP actually sending | **FAILING — `535 Authentication credentials invalid`.** See the fix above |
| Redirect URL allowlist includes `https://pt.fitazgym.com/admin/auth/callback` | **Not confirmed** — not readable from outside the dashboard |
| `NEXT_PUBLIC_SITE_URL` set in Vercel | **Not set** |
| End-to-end against a real inbox | **Blocked** on the three rows above |
| Merge to production | **Held** until the end-to-end test passes |

The next session's job is short: fix SMTP, add the redirect URL and the env var,
deploy the branch, run one real reset and one real email change against a real
inbox, then merge. No further code is expected to be needed — but if the
end-to-end run finds something, fix it before merging rather than after.
