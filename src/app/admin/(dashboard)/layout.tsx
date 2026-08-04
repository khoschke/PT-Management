import Image from "next/image";
import { redirect } from "next/navigation";
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

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-header sticky top-0 z-10 border-b border-black/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <Image src="/logo-fitaz.svg" alt="Fitaz Gym" width={80} height={23} priority />
              <span className="h-3.5 w-px bg-black/15" aria-hidden />
              <span className="text-[13px] font-medium text-secondary-label">PT leads</span>
            </div>
            <DashboardNav
              items={[
                { href: "/admin", label: "Lead board" },
                ...(isManager
                  ? [
                      { href: "/admin/trainers", label: "Trainers" },
                      { href: "/admin/staff", label: "Staff" },
                    ]
                  : []),
                { href: "/onboarding", label: "PT onboarding" },
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
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6">{children}</div>
    </div>
  );
}
