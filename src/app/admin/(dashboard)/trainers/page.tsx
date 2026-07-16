import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Trainer } from "@/lib/types";
import TrainerRoster from "./components/TrainerRoster";

export const dynamic = "force-dynamic";

export default async function TrainersPage() {
  const user = await getCurrentUser();
  if (user?.profile?.role !== "manager") {
    redirect("/admin");
  }

  const supabase = await createClient();
  const { data: trainers } = await supabase
    .from("trainers")
    .select("*")
    .order("active", { ascending: false })
    .order("name")
    .returns<Trainer[]>();

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Trainer roster</h1>
      <p className="mt-1 text-[15px] text-secondary-label">
        Deactivating a trainer takes them off the public form and the allocation suggestion, but keeps every lead
        they&rsquo;ve already worked.
      </p>
      <TrainerRoster trainers={trainers ?? []} />
    </div>
  );
}
