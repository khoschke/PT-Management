import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "../actions";
import DashboardNav from "./components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (!user.profile) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-background px-5 text-center">
        <div className="rounded-3xl border border-black/5 bg-surface p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Account not set up yet</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-secondary-label">
            You&rsquo;re signed in as {user.email}, but there&rsquo;s no manager or trainer
            profile linked to this account yet. Ask whoever manages the Fitaz Gym
            Supabase project to add one, see the README for the exact steps.
          </p>
          <form action={signOut} className="mt-6">
            <button type="submit" className="text-sm font-semibold text-foreground underline">
              Sign out
            </button>
          </form>
        </div>
      </main>
    );
  }

  const isManager = user.profile.role === "manager";
  const isTrainer = user.profile.role === "trainer";
  // Staff on the development pathway: the workbook, their own compliance
  // documents and their account. No lead board, no roster, no compliance
  // overview. Hiding a nav link is presentation, not access control, so each
  // of those screens refuses staff itself as well.
  const isStaff = user.profile.role === "staff";

  // Keyed off the linked trainer row, not the role: the PT Manager is also one
  // of the five PTs, so they get a profile of their own to edit alongside the
  // roster they keep for everyone.
  //
  // Staff are excluded even though they have a trainer row. The profile exists
  // to drive the public form's picker and lead matching, and an inactive
  // roster row appears in neither, so for staff it is a screen that changes
  // nothing. They get one when they are promoted.
  const hasOwnProfile = user.profile.trainer_id != null && !isStaff;

  // A paused trainer isn't being offered new leads, and nothing else on the
  // screen would tell them. The risk isn't mis-clicking the toggle, it's
  // pausing in a flat-out week and forgetting for a month, so the reminder is
  // shown on every page for as long as it's true rather than once at the point
  // of change.
  //
  // Never shown to staff. Their roster row is inactive, so they are not being
  // offered leads whatever their AM/PM flags say, and telling them they had
  // paused something they never had would be worse than saying nothing.
  let isPaused = false;
  if (user.profile.trainer_id && !isStaff) {
    const supabase = await createClient();
    const { data: ownRow } = await supabase
      .from("trainers")
      .select("available_am, available_pm")
      .eq("id", user.profile.trainer_id)
      .maybeSingle<{ available_am: boolean; available_pm: boolean }>();
    isPaused = ownRow != null && !ownRow.available_am && !ownRow.available_pm;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-header sticky top-0 z-10 border-b border-black/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <Image src="/brand/fitaz-gym-logo.svg" alt="Fitaz Gym" width={138} height={18} priority />
              <span className="h-3.5 w-px bg-black/15" aria-hidden />
              <span className="text-[13px] font-medium text-secondary-label">PT leads</span>
            </div>
            <DashboardNav
              items={[
                ...(isStaff ? [] : [{ href: "/admin", label: "Lead board" }]),
                ...(isManager
                  ? [
                      { href: "/admin/trainers", label: "Trainers" },
                      { href: "/admin/staff", label: "Staff" },
                      { href: "/admin/development", label: "Development" },
                      { href: "/admin/compliance", label: "Compliance" },
                    ]
                  : []),
                ...(isTrainer || isStaff
                  ? [
                      // Trainers get this too: a promoted staff member keeps
                      // every goal and note they wrote, and would otherwise
                      // lose sight of them the day they are promoted.
                      { href: "/admin/development", label: "My development" },
                      { href: "/admin/documents", label: "My documents" },
                    ]
                  : []),
                ...(hasOwnProfile ? [{ href: "/admin/profile", label: "My profile" }] : []),
                { href: "/onboarding", label: "PT onboarding" },
                { href: "/admin/account", label: "Account" },
              ]}
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-secondary-label">
            <span className="flex items-center gap-1.5">
              {user.profile.full_name ?? user.email}
              <span className="rounded-full bg-fill px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-secondary-label">
                {user.profile.role}
              </span>
            </span>
            <form action={signOut}>
              <button type="submit" className="font-semibold text-foreground underline">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      {isPaused && (
        <div className="bg-foreground text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2.5 text-sm sm:px-6">
            <span className="font-semibold">You&rsquo;re paused.</span>
            <span className="text-white/80">
              You won&rsquo;t be offered new leads and members can&rsquo;t pick you on the booking form. Your existing
              leads are unaffected.
            </span>
            <Link href="/admin/profile" className="font-semibold underline underline-offset-2">
              Start taking leads again
            </Link>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6">{children}</div>
    </div>
  );
}
