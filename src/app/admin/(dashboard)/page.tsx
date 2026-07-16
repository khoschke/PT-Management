import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Lead, Trainer } from "@/lib/types";
import LeadBoard from "./components/LeadBoard";

export const dynamic = "force-dynamic";

export interface LeadRow extends Lead {
  allocated_trainer: Pick<Trainer, "id" | "name"> | null;
  preferred_trainer: Pick<Trainer, "id" | "name"> | null;
  status_history: { old_status: string | null; new_status: string; changed_at: string }[];
}

const ACTIVE_LOAD_STATUSES = ["New", "Allocated", "Contacted", "Booked"];

export default async function AdminLeadBoardPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const isManager = user?.profile?.role === "manager";

  const { data: leads } = await supabase
    .from("leads")
    .select(
      "*, allocated_trainer:trainers!leads_allocated_trainer_id_fkey(id,name), preferred_trainer:trainers!leads_preferred_trainer_id_fkey(id,name), status_history(old_status,new_status,changed_at)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .returns<LeadRow[]>();

  const { data: activeTrainers } = await supabase
    .from("trainers")
    .select("*")
    .eq("active", true)
    .order("name")
    .returns<Trainer[]>();

  const trainerLoads: Record<string, number> = {};
  if (isManager) {
    for (const lead of leads ?? []) {
      if (lead.allocated_trainer_id && ACTIVE_LOAD_STATUSES.includes(lead.status)) {
        trainerLoads[lead.allocated_trainer_id] = (trainerLoads[lead.allocated_trainer_id] ?? 0) + 1;
      }
    }
  }

  return (
    <LeadBoard
      leads={leads ?? []}
      activeTrainers={activeTrainers ?? []}
      trainerLoads={trainerLoads}
      isManager={isManager}
    />
  );
}
