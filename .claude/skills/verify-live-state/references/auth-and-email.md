# Auth and email

Shipping self-service forgot-password took **six separate faults**, each
invisible until something was measured, and four days went to one of them alone.
Every one of these will recur. Read this before touching Supabase Auth, Resend,
or anything that sends a link to a human.

## How to test an auth email

**Send one email. Click that one. Touch nothing else.**

Three things conspire here:

- Each new recovery request **immediately invalidates the previous link**.
- The emails are byte-identical, so Gmail collapses them into one thread and
  shows the later ones as `...` — its trimmed-content toggle, not an empty body.
- `otp_expired` reports a **spent** token, not a timed-out one.

So the natural move — fire off a few test emails, click whichever one you can
find — is close to guaranteed to fail, in a way that looks exactly like a broken
feature. It produced two wrong diagnoses before anyone noticed. Delete the
thread, send exactly one, click that one.

## The six faults

**1. A Resend API key cannot be read back after creation.**
The SMTP password stored in Supabase was not a valid key. Host, port and
username had been right the whole time — `535` is authentication, and it fails
before anything else is evaluated. Four days went to this, on the strength of a
report that SMTP "was set up" and had never been tested. A suspect key is never
worth re-typing. Mint a fresh one.

**2. Supabase matches `redirectTo` against the allowlist as a whole string,
query string included — and a miss is silent.**
An allowlist entry of `…/admin/auth/callback` does not match a URL with
`?next=…` appended. On a miss Supabase does not error: it discards the redirect,
falls back to the project's Site URL, and **sends the email anyway**, with a
link pointing somewhere else. The email looks perfect. The link is dead.

Proven with two emails sent a minute apart differing only in that parameter:

| `redirect_to` sent | What arrived |
|---|---|
| `https://pt.fitazgym.com/admin/auth/callback?next=/admin/reset-password` | `redirect_to=http://localhost:3000` |
| `https://pt.fitazgym.com/admin/auth/callback` | `redirect_to=https://pt.fitazgym.com/admin/auth/callback` |

Both `redirectTo` values are now bare URLs. What the callback needs to know
travels in a short-lived httpOnly cookie instead — see
`src/lib/recovery-session.ts`. Do not reintroduce a query string.

**3. Site URL was left on the Supabase default `http://localhost:3000`.**
It is the fallback for *every* auth email, so any redirect that misses the
allowlist for any reason emails a link to localhost. Scope is the whole project,
not one feature.

**4. `otp_expired` does not mean the link timed out.**
It means the token was spent, and every new recovery email spends the previous
one. Every failure in the logs read `One-time token not found`.

**5. PKCE cannot work cross-device.**
It needs a code verifier cookie in the requesting browser, so it can never work
when the email is opened on a phone. The Supabase email templates now use
`{{ .TokenHash }}` and point straight at `/admin/auth/callback`, which also
takes the redirect allowlist out of the flow entirely. **Do not revert the
templates to `{{ .ConfirmationURL }}`.**

**6. Middleware must never touch `/admin/auth/callback`.**
`src/proxy.ts` calling `getUser()` there cleared the PKCE verifier
mid-handshake. It now returns before building a Supabase client.

## The two techniques that found them

Worth as much as the faults themselves.

**Read `auth_logs` and check whether `POST /token` happened at all.** Absent
means supabase-js refused locally and the token was fine — that single
observation cracked the problem after two wrong diagnoses. Reachable from a
build session through the Supabase MCP.

**Follow a real emailed link with the Postgres `http` extension and read the
`Location` chain.** This is how the redirect behaviour above was proven rather
than inferred. It also confirmed that Supabase honours `redirect_to` on
*failure* and puts the error in both the query string and the fragment.

## What "the email works" actually requires

Three independent facts, not one:

1. `auth.users.recovery_sent_at` is non-null (Supabase accepted and sent).
2. The Resend log shows it delivered.
3. It is in the inbox, not spam, from `noreply@mail.fitazgym.com`.

Then separately: the link in it points where you think it does. Read the actual
`redirect_to` in the actual email.

## Sender and DNS

Sending from `noreply@mail.fitazgym.com` via Resend. SPF and DKIM both pass.

DNS lives at **CrazyDomains (Dreamscape), not Shopify** — `fitazgym.com` is
connected to Shopify but was not bought through it, so the zone is elsewhere.
The SPF record carried a copy-paste error early on and has since been corrected;
`send.mail.fitazgym.com` reads `v=spf1 include:amazonses.com ~all` and is
Active, alongside the Active `resend._domainkey` DKIM record.

Verifying a DNS claim means reading the record in the CrazyDomains panel and
confirming it is Active. Not inferring it from an email that happened to arrive.
