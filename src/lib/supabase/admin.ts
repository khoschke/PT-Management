// Service role client. Bypasses RLS entirely, so it is only used for the
// two jobs that have no signed-in user to run as: the daily digest cron and
// the trainer allocation email. Never import this into anything reachable
// from the browser.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
