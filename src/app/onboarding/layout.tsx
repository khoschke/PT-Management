import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { onboardingParts } from "@/lib/onboarding/content";
import { getTrainerOnboardingState, effectivePartStatus, partCompletionFraction } from "@/lib/onboarding/progress";
import { signOut } from "../admin/actions";
import { ViewProvider } from "./components/ViewProvider";
import { ViewToggle } from "./components/ViewToggle";
import { PartsNav, type PartNavItem } from "./components/PartsNav";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  if (!user.profile) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-5 text-center">
        <h1 className="text-lg font-bold text-neutral-900">Account not set up yet</h1>
        <p className="mt-3 text-sm text-neutral-600">
          You&rsquo;re signed in as {user.email}, but there&rsquo;s no manager or trainer profile linked
          to this account yet.
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
  const supabase = await createClient();
  const state = await getTrainerOnboardingState(supabase, user.profile.trainer_id);

  const navItems: PartNavItem[] = onboardingParts.map((part) => ({
    number: part.number,
    title: part.title,
    status: effectivePartStatus(part.number, state),
    fraction: partCompletionFraction(part.number, state),
    pending: part.pending,
  }));

  return (
    <ViewProvider defaultView={isManager ? "manager" : "pt"}>
      <div className="onboarding-scope">
        <header
          className="sticky top-0 z-40 backdrop-blur-xl"
          style={{ background: "var(--ob-header-bg)", borderBottom: "1px solid var(--ob-border)" }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
            <div className="flex items-center gap-3">
              <Link href="/onboarding" className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ background: "var(--ob-text)" }}
                >
                  F
                </span>
                <span className="text-[15px] font-semibold tracking-tight">PT Onboarding</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ViewToggle />
              <Link
                href="/admin"
                className="hidden text-[13px] font-medium sm:block"
                style={{ color: "var(--ob-text-secondary)" }}
              >
                Back to dashboard
              </Link>
              <span className="hidden text-[13px] sm:block" style={{ color: "var(--ob-text-secondary)" }}>
                {user.profile.full_name ?? user.email}
              </span>
              <form action={signOut}>
                <button type="submit" className="text-[13px] font-medium" style={{ color: "var(--ob-text-secondary)" }}>
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 md:flex-row md:py-10">
          <PartsNav items={navItems} />
          <main className="min-w-0 flex-1 pb-24">{children}</main>
        </div>
      </div>
    </ViewProvider>
  );
}
