import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "../actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (!user.profile) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-5 text-center">
        <h1 className="text-lg font-bold text-neutral-900">Account not set up yet</h1>
        <p className="mt-3 text-sm text-neutral-600">
          You&rsquo;re signed in as {user.email}, but there&rsquo;s no manager or trainer
          profile linked to this account yet. Ask whoever manages the Fitaz Gym
          Supabase project to add one, see the README for the exact steps.
        </p>
        <form action={signOut} className="mt-6">
          <button type="submit" className="text-sm font-semibold text-neutral-900 underline">
            Sign out
          </button>
        </form>
      </main>
    );
  }

  const isManager = user.profile.role === "manager";

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-8">
            <span className="text-base font-bold text-neutral-900">Fitaz Gym PT leads</span>
            <nav className="flex gap-5 text-sm font-medium text-neutral-600">
              <Link href="/admin" className="hover:text-neutral-900">
                Lead board
              </Link>
              {isManager && (
                <Link href="/admin/trainers" className="hover:text-neutral-900">
                  Trainers
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span>
              {user.profile.full_name ?? user.email}
              <span className="ml-1.5 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                {user.profile.role}
              </span>
            </span>
            <form action={signOut}>
              <button type="submit" className="font-semibold text-neutral-900 underline">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8">{children}</div>
    </div>
  );
}
