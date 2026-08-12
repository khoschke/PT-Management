# Handoff: Real Trainer Roster + Self-Service Password Change

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

Two small, self-contained tasks.

## Task 1 — Import the real trainer roster

A ready-to-run script exists: `supabase/seed_real_trainers.sql`. It inserts the
five real PTs (Dylan Heycox, Julie Manners, Shahd Herbert, Karl Hoschke, Michael
Hammett) with emails, specialty tags, and bios.

- The PT Manager runs it once in the Supabase SQL editor. It cannot be run from
  the build workspace (no DB network access here).
- **Before running:** confirm each `gender` (best-effort from names; Shahd's is
  flagged as unverified) and set real `availability` (all default to `both`,
  since the corflutes don't state AM/PM). All of this is editable in the app
  afterwards on the Trainers screen.
- **Only run on an empty trainers table**, or it duplicates (no de-dup on name).
  If the manager already added some by hand, either clear those first or adapt
  the script.
- Note: Karl is both the PT Manager (a `profiles` manager login) and a PT (a
  trainers row). Those are separate records; that's fine. If he later wants to
  receive his own allocated leads, link his manager login to his trainer row via
  the Staff screen / `profiles.trainer_id`.

## Task 2 — Let each user change their own password

Right now passwords can only be set by an admin (in Supabase, or when created on
the `/admin/staff` screen). Add a self-service "change my password" spot that any
signed-in user (manager OR trainer) can use.

### Suggested build

- New route `/admin/account` inside the `(dashboard)` group, so both roles reach
  it (they all pass through that layout). Add an **Account** link to the nav in
  `src/app/admin/(dashboard)/layout.tsx` (visible to everyone, not just managers).
- Page shows the user's email + role, and a **Change password** form
  (new password + confirm; min 8 chars; check they match).
- Server action in `account/actions.ts` (`"use server"` — remember: only async
  functions exported; form-state object goes in `account/state.ts`). Use the
  **session-scoped** server client (`@/lib/supabase/server`), NOT the admin
  client:

  ```ts
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  ```

  This changes the *currently logged-in* user's own password securely — no admin
  privileges, no other user affected.
- Mirror the existing form patterns (see `login/` and `staff/` for structure,
  styling classes, and the `useActionState` + `state.ts` split).
- Optional nicety: a small note that they can also have a manager reset it for
  them if locked out.

### Gotchas (from PROJECT_STATUS.md)

- "use server" files export only async functions — put the initial form-state
  object in a sibling `state.ts`.
- Run `npm run build` + `tsc --noEmit` + `lint`, then verify in a browser
  (sign in, change password, sign out, sign back in with the new one) before
  pushing. Thoroughness is preferred over speed.

### Definition of done

Any trainer or manager can sign in, open Account, set a new password, and use it
on next sign-in. No one can change anyone else's password from this screen.
