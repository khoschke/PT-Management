import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ChangeEmailForm from "./components/ChangeEmailForm";
import ChangePasswordForm from "./components/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  const roleLabel = user.profile?.role ?? "no role";

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Account</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
        Your sign-in details. Change your own password or sign-in email here any time.
      </p>

      <div className="mt-6 max-w-md rounded-2xl border border-black/5 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="font-semibold text-foreground">Email</dt>
          <dd className="text-secondary-label">
            {user.email ?? "—"}
            {user.newEmail && (
              <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {user.newEmail} pending
              </span>
            )}
          </dd>
          <dt className="font-semibold text-foreground">Role</dt>
          <dd className="capitalize text-secondary-label">{roleLabel}</dd>
        </dl>
      </div>

      <ChangePasswordForm />

      <ChangeEmailForm pendingEmail={user.newEmail} />

      <p className="mt-4 max-w-md text-xs text-secondary-label">
        Locked out and can&rsquo;t sign in at all? Use &ldquo;Forgot password?&rdquo; on the
        sign-in screen, or ask a manager to reset it for you on the Staff screen.
      </p>
    </div>
  );
}
