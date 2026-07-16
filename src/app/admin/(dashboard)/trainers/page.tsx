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
      <h1 className="text-2xl font-bold text-neutral-900">Trainer roster</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Deactivating a trainer takes them off the public form and the allocation suggestion, but keeps every lead
        they&rsquo;ve already worked.
      </p>
      <TrainerRoster trainers={trainers ?? []} />
    </div>
  );
}
