// Runs every automatic close (close_expired_leads() in 0022_follow_ups.sql) and
// tells the PT Manager about any lead the 48-hour timer closed. Called from the
// daily follow-ups cron and whenever the lead board loads, so a lead never
// shows as open past its deadline even though crons only run once a day.

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendTimerCloseNotification } from "./email";

interface ClosedRow {
  lead_id: string;
  lead_name: string;
  trainer_id: string | null;
  said_no_at: string;
  closed_at: string;
}

export async function closeExpiredLeads(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase.rpc("close_expired_leads");
  if (error) {
    console.error("close_expired_leads failed", error);
    return 0;
  }
  const closed = (data ?? []) as ClosedRow[];
  const managerEmail = process.env.PT_MANAGER_EMAIL;
  if (closed.length === 0 || !managerEmail) return closed.length;

  const trainerIds = [...new Set(closed.map((c) => c.trainer_id).filter((id): id is string => !!id))];
  const { data: trainers } = trainerIds.length
    ? await supabase.from("trainers").select("id, name").in("id", trainerIds)
    : { data: [] as { id: string; name: string }[] };

  try {
    await sendTimerCloseNotification(
      managerEmail,
      closed.map((c) => ({
        leadName: c.lead_name,
        trainerName: (trainers ?? []).find((t) => t.id === c.trainer_id)?.name ?? "Unallocated",
        saidNoAt: c.said_no_at,
        closedAt: c.closed_at,
      })),
    );
  } catch (err) {
    console.error("Timer close notification failed", err);
  }
  return closed.length;
}
