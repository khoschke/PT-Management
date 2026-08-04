import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";
import StaffManager from "./components/StaffManager";

export const dynamic = "force-dynamic";

export interface StaffMember {
  id: string;
  email: string | null;
  fullName: string | null;
  role: "manager" | "trainer";
  trainerName: string | null;
}

export default async function StaffPage() {
  const me = await getCurrentUser();
  if (me?.profile?.role !== "manager") {
    redirect("/admin");
  }

  const admin = createAdminClient();

  const [{ data: profiles }, { data: trainers }, usersResult] = await Promise.all([
    admin.from("profiles").select("*").returns<Profile[]>(),
    admin.from("trainers").select("id, name, active").order("name"),
    admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
  ]);

  const emailById = new Map<string, string | null>(
    (usersResult.data?.users ?? []).map((u) => [u.id, u.email ?? null]),
  );
  const trainerNameById = new Map<string, string>(
    (trainers ?? []).map((t) => [t.id as string, t.name as string]),
  );

  const staff: StaffMember[] = (profiles ?? [])
    .map((p) => ({
      id: p.id,
      email: emailById.get(p.id) ?? null,
      fullName: p.full_name,
      role: p.role,
      trainerName: p.trainer_id ? trainerNameById.get(p.trainer_id) ?? null : null,
    }))
    .sort((a, b) => {
      if (a.role !== b.role) return a.role === "manager" ? -1 : 1;
      return (a.fullName ?? a.email ?? "").localeCompare(b.fullName ?? b.email ?? "");
    });

  // Roster trainers who don't yet have a login, offered when adding a trainer login.
  const linkedTrainerIds = new Set((profiles ?? []).map((p) => p.trainer_id).filter(Boolean));
  const trainersWithoutLogin = (trainers ?? [])
    .filter((t) => t.active && !linkedTrainerIds.has(t.id))
    .map((t) => ({ id: t.id as string, name: t.name as string }));

  return (
    <div>
      <h1 className="display-heading text-[28px] text-foreground">Staff &amp; access</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
        Who can sign in, and what they can see. Managers see and allocate every lead; trainers see only the leads
        allocated to them. Add the gym owners as managers here so the business always has access.
      </p>
      <StaffManager staff={staff} trainersWithoutLogin={trainersWithoutLogin} currentUserId={me.id} />
    </div>
  );
}
