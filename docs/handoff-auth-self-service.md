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

## Status of the blocker: email is now unblocked, but VERIFY delivery first

Both features depend on **Supabase Auth sending email** (recovery link; email-change
confirmation link). Important distinction:

- The app's own notification emails (allocation, daily digest) go through the
  **Resend API** in `src/lib/email.ts`. That is a different path.
- **Auth emails (recovery, email-change confirmation) are sent by Supabase Auth
  itself**, which needs **Custom SMTP** configured in the Supabase dashboard
  (Authentication → Emails / SMTP), pointed at Resend
  (host `smtp.resend.com`, port 465, user `resend`, password = a Resend API key),
  sending from the verified `mail.fitazgym.com` domain.

**Custom SMTP was set up on ~2 Sep 2026** (reported done), which is what unblocks
this work. But that report has NOT yet been confirmed by an actual Supabase *auth*
email landing. **First thing in the build session: send a real test.** Easiest is
the Supabase dashboard's "send test email", or wire the forgot-password form first
and trigger one recovery email to a real inbox. If it doesn't arrive, stop and fix
SMTP before building the rest — do not ship a dead reset link (a "Forgot password?"
link that emails nothing is worse than no link at all).

## ⚠️ Do not ship a dead link

Keep the login-page "Forgot password?" link and the Account email field behind
working email. If the test above fails, hold the merge. Password-change on the
Account screen already works today and needs no email — leave it working; you are
only *adding* the email field next to it.

## Suggested build

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
- **Can't be tested from the build workspace** (no Supabase network). Verify on a
  real deployment against a real inbox.
- Run `npm run build` + `npx tsc --noEmit` + `npm run lint` before pushing.

## Definition of done

1. A locked-out manager or trainer clicks "Forgot password?", enters their email,
   receives a recovery email, sets a new password from the link, and signs in —
   no admin involvement, and no leak of which emails have accounts.
2. A signed-in user changes their own sign-in email from `/admin/account`, receives
   the confirmation link, clicks it, and can then sign in with the new email.
3. Both verified against a real inbox on the live site; neither link is a dead end.
