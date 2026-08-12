# Handoff: Self-Service "Forgot Password" on the Login Page

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

## The goal

Add a **"Forgot password?"** link to the login page (`/admin/login`) so a locked-out
manager or trainer can reset their own password without an admin. Flow:

1. User clicks "Forgot password?" → enters their email.
2. Supabase emails them a recovery link.
3. They click it, land on a reset page, and set a new password.
4. They sign in with it.

This complements what already exists:
- **Self-service password change** (`/admin/account`) — for users who are already
  signed in and remember their current password.
- **Manager-assisted email/password reset** (`/admin/staff`) — a manager fixes a
  locked-out user via the admin client.
This note is the third piece: self-service recovery when the user is **locked out**.

## ⚠️ Blocked on email — build it all at once, don't ship a dead link

The recovery link is **emailed by Supabase Auth**, so this feature does nothing
until auth email is actually sending. **Do not merge the login-page "Forgot
password?" link until email works**, or locked-out users hit a dead end (worse
than having no link).

Important nuance on *which* email system:
- The app's own notification emails (allocation, daily digest) go through the
  **Resend API** in `src/lib/email.ts` — see `docs/handoff-email-notifications.md`.
- **Auth emails (recovery, confirmation) are sent by Supabase Auth itself**, not
  by that Resend code. For production you must configure **Custom SMTP in the
  Supabase dashboard** (Authentication → Emails / SMTP settings) — Supabase's
  built-in email sender is rate-limited and not meant for production. Point that
  SMTP at the same verified `fitazgym.com` sending domain (Resend offers SMTP
  credentials, so one verified domain covers both systems).
- Net dependency chain: forgot-password → Supabase Auth Custom SMTP → verified
  `fitazgym.com` sending domain → the same Shopify DNS access as
  `docs/handoff-custom-domain.md` and `docs/handoff-email-notifications.md`.
  Sort DNS once and all three unlock together.

## Suggested build

Stack notes: **@supabase/ssr** (cookie sessions, PKCE), Next.js 16 App Router,
session middleware in **`src/proxy.ts`** (Next 16's renamed middleware). Mirror
the existing `login/` and `account/` patterns (`useActionState` + sibling
`state.ts`; `"use server"` files export only async functions).

1. **Login page link** — in `src/app/admin/login/LoginForm.tsx`, add a small
   "Forgot password?" link to a new route `/admin/forgot-password`.
2. **`/admin/forgot-password`** — a form (email) whose server action calls, on the
   session-scoped server client (`@/lib/supabase/server`):
   ```ts
   await supabase.auth.resetPasswordForEmail(email, {
     redirectTo: `${siteUrl}/admin/reset-password`,
   });
   ```
   Always show a **generic** confirmation ("If that email is registered, we've
   sent a reset link") regardless of whether the email exists — don't reveal which
   emails have accounts.
3. **Recovery callback** — the emailed link comes back with a `code` (PKCE) that
   must be exchanged for a session. Add a route handler (e.g.
   `/admin/reset-password` as a server route, or an `/admin/auth/callback` that
   redirects on to the reset form) that calls
   `supabase.auth.exchangeCodeForSession(code)`. Verify the exact handling against
   the installed `@supabase/ssr` version and `src/proxy.ts` so the recovery
   session is set in cookies correctly.
4. **`/admin/reset-password`** — once the recovery session is active, show a
   set-new-password form (reuse the Account screen's `ChangePasswordForm` pattern:
   new + confirm, min 8, must match) → `supabase.auth.updateUser({ password })` →
   redirect to `/admin`.
5. **`siteUrl`** — add `NEXT_PUBLIC_SITE_URL` (ties into the custom-domain note) or
   derive from the request headers; used for `redirectTo`.
6. **Supabase config** — in the Supabase dashboard, add the reset URL(s) to
   **Authentication → URL Configuration → Redirect URLs** (production + the custom
   domain, and preview if you want to test there), or the recovery link errors out.

## Gotchas

- **Redirect URL allowlist** is the #1 thing people miss — an un-allowlisted
  `redirectTo` makes the link fail silently.
- Keep the "did that email exist?" response generic (enumeration safety).
- `"use server"` async-only; form-state object in a sibling `state.ts`.
- Recovery links are single-use and time-limited; test with a fresh one.
- Can't be tested from the build workspace (no Supabase network). Verify on a
  deployment once auth email is on.
- Run `npm run build` + `npx tsc --noEmit` + `npm run lint` before pushing.

## Definition of done

A locked-out trainer or manager clicks "Forgot password?" on the login page,
enters their email, receives a recovery email, sets a new password from the link,
and signs in with it — no admin involvement — and no confirmation is leaked about
which emails have accounts.
