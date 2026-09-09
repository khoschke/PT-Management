import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Trainer } from "@/lib/types";
import Avatar from "../components/Avatar";
import MyProfileForm from "./components/MyProfileForm";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  const user = await getCurrentUser();
  if (!user?.profile) redirect("/admin/login");

  // A manager whose login isn't linked to a trainer row has no profile of
  // their own to edit; the roster is where they edit everyone else's.
  const trainerId = user.profile.trainer_id;
  if (!trainerId) {
    redirect(user.profile.role === "manager" ? "/admin/trainers" : "/admin");
  }

  // Staff have a trainer row but no use for this screen: an inactive row is in
  // neither the public form's picker nor lead matching, so nothing they set
  // here would take effect. The nav hides it; this is what enforces it.
  if (user.profile.role === "staff") {
    redirect("/admin/development");
  }

  const supabase = await createClient();
  const { data: trainer } = await supabase
    .from("trainers")
    .select("*")
    .eq("id", trainerId)
    .maybeSingle<Trainer>();

  if (!trainer) {
    return (
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground">My profile</h1>
        <p className="mt-3 max-w-2xl text-[15px] text-secondary-label">
          We couldn&rsquo;t load your trainer profile. Ask the PT Manager to check your login is linked to your trainer
          record on the Staff screen.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight text-foreground">My profile</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
        How you&rsquo;re represented inside the PT portal. Your availability, specialties and what you write about
        yourself are yours to edit any time. This is internal only, it isn&rsquo;t published to members.
      </p>

      <div className="mt-6 max-w-2xl rounded-2xl border border-black/5 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-start gap-3">
          <Avatar name={trainer.name} size="md" muted={!trainer.active} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-foreground">{trainer.name}</span>
              {!trainer.active && (
                <span className="rounded-full bg-fill px-2 py-0.5 text-xs font-semibold text-secondary-label">
                  Inactive
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-secondary-label">{trainer.email ?? "No email on file"}</p>
          </div>
        </div>
        <p className="mt-3 border-t border-black/5 pt-3 text-xs text-secondary-label">
          Your name and email are kept by the PT Manager on the Trainers screen, since your email is where lead
          notifications are sent. Ask them if either needs changing.
        </p>
      </div>

      <MyProfileForm trainer={trainer} />
    </div>
  );
}
