import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { RECOVERY_COOKIE } from "@/lib/recovery-session";
import ResetPasswordForm from "./ResetPasswordForm";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const cookieStore = await cookies();
  const inRecovery = Boolean(cookieStore.get(RECOVERY_COOKIE));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image src="/brand/fitaz-gym-logo.svg" alt="Fitaz Gym" width={245} height={32} priority />
        </div>

        {inRecovery && user ? (
          <ResetPasswordForm email={user.email ?? null} />
        ) : (
          <div className="rounded-3xl border border-black/5 bg-surface p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
            <h1 className="display-heading text-2xl text-foreground">Link expired</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-secondary-label">
              Reset links can only be used once, and they stop working after an hour.
              Request a fresh one and open it in this browser.
            </p>
            <Link
              href="/admin/forgot-password"
              className="press mt-6 flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-[17px] font-semibold text-white"
            >
              Request a new link
            </Link>
            <Link
              href="/admin/login"
              className="mt-4 block text-center text-[15px] font-semibold text-foreground underline"
            >
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
