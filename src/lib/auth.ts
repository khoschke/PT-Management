import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

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
