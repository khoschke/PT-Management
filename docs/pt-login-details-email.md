# PT login details email (template)

The individual follow-up to `docs/pt-team-update-email.md`. That one is the group
send with the news. This one carries the credentials and goes to **one PT at a
time**, never as a group email and never with anyone cc'd.

Send it once the group email has gone, so the login lands in a context the PT
already understands.

**Sent 12 August 2026** to all four PTs. Kept here for the next trainer who
joins, since the same message works unchanged.

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

There is no forgot password link on there yet, so if you get locked out just
message me and I will reset it for you in a minute. No drama, it will happen to
somebody.

Have a look around and tell me what you think.

Karl

---

## Notes

- **Sign-in is at `/admin/login`**, not the bare domain. Trainers land on the
  same dashboard as the manager and see only their own leads, enforced in the
  database rather than just hidden in the interface.
- **They can change their own password** at `/admin/account`, minimum eight
  characters. That screen is password only for now. Changing their own sign-in
  email is not built yet and is blocked on email being turned on, so if someone
  wants a different address, change it for them from `/admin/staff`.
- **No self-serve reset yet.** `docs/handoff-forgot-password.md` covers it, and
  it is blocked on Supabase Custom SMTP. Until then a locked-out PT has no way
  back in without you, which is why the line inviting them to message you is in
  the copy rather than left implied.
- **The accounts are created already confirmed**, so no verification email goes
  out and they can sign in straight away.
