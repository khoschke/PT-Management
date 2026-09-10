# PT login details email (template)

The individual follow-up to `docs/pt-team-update-email.md`. That one is the group
send with the news. This one carries the credentials and goes to **one PT at a
time**, never as a group email and never with anyone cc'd.

Send it once the group email has gone, so the login lands in a context the PT
already understands.

**Sent 12 August 2026** to all four PTs. Kept here for the next trainer who
joins.

**Updated 10 September 2026.** The original said there was no forgot-password
link, which was true when it was sent. Self-service forgot-password and
change-email went live with PR #31, so that paragraph now points at the link
instead of at Karl. If you are reading this alongside the 12 August sends, that
one line is the only difference.

## Filling it in

| Placeholder | Where it comes from |
|---|---|
| `{FIRST NAME}` | Dylan, Julie, Shahd or Michael |
| `{EMAIL}` | the sign-in address on their account, from `/admin/staff` |
| `{PASSWORD}` | the initial password set when the account was created |

Send each one separately. Four sends, four different passwords in four different
messages, so a forward never exposes anyone else's login.

**Subject:** Your PT Portal login

---

## The email

Hi {FIRST NAME},

Here are your login details for the PT Portal, as promised.

Sign in at: https://pt.fitazgym.com/admin/login
Your email: {EMAIL}
Your password: {PASSWORD}

First thing worth doing is changing that password to one of your own. Click
Account once you are in and set a new one, at least eight characters.

Once you are signed in you will see your own leads, each with the goals and
preferred training times the member gave us, and where they are against the 48
hour clock. The workbook is at pt.fitazgym.com/onboarding and uses the same
login, so you only sign in the once.

If you ever get locked out, there is a Forgot password link on the sign in
page. It emails you a link to set a new one. Message me if it gives you any
trouble.

Have a look around and tell me what you think.

Karl

---

## Notes

- **Sign-in is at `/admin/login`**, not the bare domain. Trainers land on the
  same dashboard as the manager and see only their own leads, enforced in the
  database rather than just hidden in the interface.
- **They can change their own password and their own sign-in email** at
  `/admin/account`, minimum eight characters on the password. Both are
  self-service since PR #31. You can still change anyone's sign-in email
  immediately from `/admin/staff`, which stays the fallback and needs no
  confirmation email.
- **Self-serve reset works.** A Forgot password link sits on `/admin/login` and
  emails a reset link. Supabase Auth SMTP was fixed and verified end to end on
  8 Sep 2026, having silently failed for the four days before that, so if
  resets ever stop working suspect the SMTP credential first.
- **The accounts are created already confirmed**, so no verification email goes
  out and they can sign in straight away.
