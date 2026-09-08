import { createClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/lib/types";

export interface CurrentUser {
  id: string;
  email: string | null;
  profile: Profile | null;
}

// Fetches the signed-in user and their role. Returns null if nobody is
// signed in. A signed-in user with no profile row is still returned, with
// profile: null, so the caller can show a clear "not set up yet" message
// instead of a confusing crash.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { id: user.id, email: user.email ?? null, profile: profile ?? null };
}

// Who works through the onboarding workbook and owns their own compliance
// documents, as opposed to overseeing everyone else's. Both trainers and staff
// on the development pathway do, and both carry a `trainer_id`, which is what
// every onboarding and document policy actually keys on. The manager gets the
// read-only overview instead.
//
// Prefer this over comparing to "trainer" directly. That comparison is how the
// workbook silently locked staff out before this existed, and it is the same
// mistake the `not is_manager()` RLS shorthand made (see 0010_staff_role.sql).
export function worksThroughWorkbook(role: AppRole | null | undefined): boolean {
  return role === "trainer" || role === "staff";
}

// Who may read the workbook's coaching notes and worked examples, the two
// things Manager view reveals. Managers use them to run a 1:1; trainers have
// always been able to flip to them and keep that. Staff on the development
// pathway do not: they are meant to work the questions, and a model answer
// sitting one click away is a different exercise.
//
// Written as an allow list on purpose. A role added later sees nothing until
// somebody decides it should, which is the safe direction to fail in and the
// opposite of the `not is_manager()` mistake this codebase already made once.
export function canSeeCoachingNotes(role: AppRole | null | undefined): boolean {
  return role === "manager" || role === "trainer";
}

// Defence in depth for the manager-only server actions. RLS is still the real
// gate — these actions run as the signed-in user, so the database refuses a
// trainer's write regardless — but an explicit role check means a future change
// to a policy can't quietly turn "allocate a lead" or "delete a lead" into
// something any signed-in trainer can do. Status and note updates deliberately
// don't use this: trainers use those on their own leads.
export async function callerIsManager(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.profile?.role === "manager";
}
