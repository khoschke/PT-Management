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

## STATUS, 8 September 2026: email works. One dashboard item left before merge.

### Supabase Auth email is now sending — verified end to end

The 7 Sep SMTP failure is fixed. Verified against the live project, not reported:

```
POST /auth/v1/recover  →  200
auth.users.recovery_sent_at  →  2026-09-08 05:59:52+00   (first time ever non-null)
Resend log  →  "Reset your password" to khoschke+trainer@gmail.com, delivered
Gmail       →  in the INBOX, not spam, from noreply@mail.fitazgym.com
```

What had been wrong: the password in Supabase's SMTP settings was not a valid
Resend API key. A Resend key's value can't be read back after creation, so the
only fix was a fresh key. Host, port and username had been right all along —
`535` is authentication, and it fails before anything else is evaluated.

### The redirect allowlist: what it actually matches

Worth writing down, because it cost a round trip and it fails **silently**.

Two recovery emails were sent a minute apart, differing only in `redirect_to`:

| `redirect_to` sent | What arrived in the email |
|---|---|
| `https://pt.fitazgym.com/admin/auth/callback?next=/admin/reset-password` | `redirect_to=http://localhost:3000` |
| `https://pt.fitazgym.com/admin/auth/callback` | `redirect_to=https://pt.fitazgym.com/admin/auth/callback` |

**Supabase matches `redirectTo` against the allowlist as a whole string,
query string included.** An allowlist entry of `.../admin/auth/callback` does
not match a URL with `?next=...` appended. And a miss is not an error: Supabase
discards the redirect, falls back to the project's Site URL, and sends the email
anyway — with a link pointing somewhere else entirely. The email looks perfect.
The link is dead.

The code originally appended `?next=`, so it was hitting exactly this. **Fixed**:
both `redirectTo` values are now bare URLs, and what the callback needs to know
(which flow is in flight) travels in a short-lived httpOnly cookie set when the
email is sent. See `src/lib/recovery-session.ts`. No wildcard allowlist entry is
needed, and the single entry already added is correct as it stands.

### ⚠️ Still to do: the Site URL is `http://localhost:3000`

Visible in the first email above. **Authentication → URL Configuration → Site URL**
was never changed from the Supabase default. It needs to be
`https://pt.fitazgym.com`.

This is not cosmetic and it is not limited to this feature. Site URL is the
fallback for *every* auth email, so any redirect that misses the allowlist for
any reason emails a link to localhost. It is also the last thing standing
between "the link works" and "the link works reliably".

## Post-launch, 10 September 2026: two rough edges from the first real run

PR #31 merged and deployed. The first real end-to-end attempt surfaced two
things, only one of which was a defect.

### The emails that looked empty were not empty

Three recovery emails sat in one Gmail thread and the later two appeared to have
no body, just a `...`. That is Gmail collapsing message content that repeats
what an earlier message in the thread already said; the `...` is its
show-trimmed-content toggle. All three bodies were fetched and are complete and
identical. No code change, and none wanted.

It is worth knowing about anyway, because it is what set up the real problem:
identical, collapsed emails give a locked-out user no way to tell which one is
current.

### The real defect: a spent link landed on the public PT form

Reported symptom: clicking an expired link ended at

```
https://pt.fitazgym.com/pt-session#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired&sb=
```

The public lead-capture form, with a raw error in the address bar and no way
back to sign-in.

Traced with the auth logs and the actual emails:

- Karl's real request through the app was **correct** — the 05:02 email carried
  `token=pkce_…&type=recovery&redirect_to=https://pt.fitazgym.com/admin/auth/callback`.
- The link he clicked was an **earlier** email in the collapsed thread, one of
  the deliverability tests, sent deliberately with `redirect_to` = the bare Site
  URL to prove the Site URL fallback had been fixed.
- Supabase honours `redirect_to` on failure and puts the error in **both** the
  query string and the fragment. Confirmed directly:
  `…/verify?token=<invalid>&redirect_to=…/admin/auth/callback` →
  `…/admin/auth/callback?error=access_denied&error_code=otp_expired…#error=…&sb=`
- So an expired link generated **by the app** already worked correctly: the
  callback saw `?error=` and sent the user to `/admin/login?authError=expired`.
- But a link falling back to the **Site URL** landed on `/`, and `/` was a bare
  `redirect("/pt-session")` that dropped the query string while the browser
  carried the fragment along. Hence the reported URL.

Every failure the logs show is `One-time token not found`, not a timeout —
**requesting another recovery email invalidates the previous link immediately.**
Combined with Gmail collapsing the thread, clicking a dead link was the likely
outcome rather than the unlucky one.

### What changed

1. **`src/app/page.tsx`** now inspects its search params before redirecting. An
   `error` / `error_code` goes to `/admin/login?authError=expired`; a `code` or
   `token_hash`+`type` is forwarded to `/admin/auth/callback` so a valid link
   that fell back to the Site URL still establishes a session instead of being
   thrown away; anything else still goes to `/pt-session`. This makes the root a
   dynamic route, which it has to be to read the query string at all.
2. **Copy**, in three places, now says the thing that actually bites: only the
   newest email works, because asking for another cancels the previous link.
   The login banner, the "we've sent it" screen, and the expired-link card.

Verified against a local production build: `/?error=…` →
`/admin/login?authError=expired`; `/` → `/pt-session`; `/?code=…` and
`/?token_hash=…&type=…` → the callback with the parameter intact;
`/admin/auth/callback?error=…` unchanged.

**Note for whoever tests this next:** send the test email, then click *that*
email and nothing else. A second request to prove the mail is flowing kills the
first link, and the thread will not make it obvious which is which.

## 10 September 2026: why the first real reset failed, and the fix

The reset flow was reaching the reset screen for nobody. Diagnosed to the exact
call, against the live project.

### The chain, measured rather than guessed

Following a real emailed link with an invalid-but-well-formed token, and then a
genuine one, gave the whole picture:

```
GoTrue /verify  → https://pt.fitazgym.com/admin/auth/callback?code=3e912a51-…   OK
our callback    → https://pt.fitazgym.com/admin/login?authError=verify          FAILS
```

So `/verify` was fine. The token was fine. The redirect was fine. What failed was
**`exchangeCodeForSession`** — and the auth logs contain **no `POST /token`
request at all** for any of these attempts, which is the tell: supabase-js
rejected the exchange locally, before making a network call. It does that in
exactly one situation — **the PKCE code verifier is missing from this browser.**

### What was eating the verifier

`src/proxy.ts` matched `/admin/:path*`, which includes `/admin/auth/callback`.
On every request it built a second Supabase client over the same cookie jar and
called `getUser()`. On the callback that call always fails — there is no session
yet, that being the entire point of the route — and a failed `getUser()` can
clear the auth storage keys, the PKCE code verifier among them. The route handler
then ran a few milliseconds later and found nothing to exchange.

The callback gates nothing and needs no session, so the proxy has no business
touching it. It now returns immediately for that one path, before any Supabase
client is constructed.

### The durable fix: stop depending on the verifier at all

Removing the proxy interference addresses one cause. It does not address the
other: a PKCE link **cannot** work when opened on a different device or browser
from the one that requested it, because the verifier only exists there. A trainer
requesting a reset on the gym desktop and opening the email on their phone is
not an edge case.

`token_hash` has neither problem. It verifies straight against Supabase and needs
nothing from the browser. Proven against the live project — the hashed token from
`auth.users.recovery_token` posted to `/auth/v1/verify` returns a full session for
the right user, with no cookies in the request at all:

```
POST /auth/v1/verify  {"type":"recovery","token_hash":"…"}
  → 200  {"access_token":"…","sub":"e6dfe0b7-…"}
```

The callback now tries `token_hash` **first** and falls back to `code`, so links
already sitting in inboxes keep working through the transition.

**This needs the two Supabase email templates changed** — the one remaining step,
and the only one that actually cures it. Authentication → Emails:

*Reset Password:*
```html
<h2>Reset your password</h2>
<p>We received a request to reset your password. Follow the link below to choose a new one.</p>
<p><a href="{{ .SiteURL }}/admin/auth/callback?token_hash={{ .TokenHash }}&type=recovery">Reset password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
```

*Change Email Address:*
```html
<h2>Confirm your new email</h2>
<p>Follow the link below to confirm this address as your new sign-in email.</p>
<p><a href="{{ .SiteURL }}/admin/auth/callback?token_hash={{ .TokenHash }}&type=email_change">Confirm email change</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
```

A useful side effect: these links point straight at the app instead of hopping
through Supabase's `/verify`, so the Redirect URLs allowlist stops being involved
in this flow at all — one whole class of silent failure gone.

### Also fixed: the message was lying

`exchangeCodeForSession` fails with "both auth code and code verifier should be
non-empty". The old mapping saw the word *invalid* elsewhere in that class of
error and reported "link expired", sending users round the loop requesting fresh
emails that failed identically. A missing verifier is now detected on its own and
reports the truth: open the link in the browser you requested it from.

### For whoever tests this next

`otp_expired` in the URL is **not** proof the link timed out. Every failure here
logged as `One-time token not found`, which is what Supabase says for a token
that was already spent — including one spent by a *previous* request, since each
new recovery email cancels the last. Read the auth logs before believing the
error text, and check whether a `POST /token` even happened: no `/token` means
the failure was client-side, not a bad token.

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
- `src/lib/recovery-session.ts` — the two cookies: the flow marker that
  survives the round trip through the inbox, and the recovery marker below.
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

### Where that stands, 8 September 2026

| | State |
|---|---|
| Code for both flows | **Done**, on `claude/forgot-password-change-email-gl4lca` |
| `npm run build`, `npx tsc --noEmit`, `npm run lint` | **All clean** |
| Route wiring smoke-tested against a local production build | **Done** |
| Supabase SMTP sending | **WORKING.** 200 from `/recover`, `recovery_sent_at` set, Resend shows delivered |
| Recovery email reaches a real inbox | **CONFIRMED.** Landed in the Gmail inbox, not spam, from `noreply@mail.fitazgym.com` |
| Redirect allowlist entry for `https://pt.fitazgym.com/admin/auth/callback` | **CONFIRMED WORKING** — proven by the two-email comparison above |
| Supabase **Site URL** | **STILL `http://localhost:3000`.** Set it to `https://pt.fitazgym.com` |
| `NEXT_PUBLIC_SITE_URL` in Vercel | Reported set; not verifiable from a build workspace, and it only takes effect on the next deploy |
| Clicking the link in a real browser (PKCE exchange → reset → sign in) | **Not yet run.** Needs the branch deployed — the route doesn't exist on production until merge |
| Merge to production | Ready once Site URL is fixed |

### The last mile

Everything that can be tested without a browser has been. What remains needs the
code to actually be running at `pt.fitazgym.com`, because the reset link points
there and the route only exists on this branch. The email round trip has been
exercised with raw HTTP, which does not use PKCE; the app does, so the final
click is the one thing raw HTTP cannot stand in for.

So: fix the Site URL, merge, then on the live site run
1. "Forgot password?" → email → set a new password → sign in with it, and
2. Account → change sign-in email → confirm from the link → sign in on the new address.

Use `khoschke+trainer@gmail.com` for both. It is a real trainer-role login that
delivers to Karl's inbox, and it is what every test so far has used.

