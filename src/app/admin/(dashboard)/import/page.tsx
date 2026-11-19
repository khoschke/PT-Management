import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ImportUnverified from "./components/ImportUnverified";

export const dynamic = "force-dynamic";

export default async function ImportUnverifiedPage() {
  const user = await getCurrentUser();
  // Manager-only, refused here rather than relying on the button being hidden.
  if (user?.profile?.role !== "manager") redirect("/admin");

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin" className="text-sm font-semibold text-secondary-label hover:text-foreground">
        Back to leads
      </Link>
      <h1 className="display-heading mt-3 text-[28px] text-foreground">Import unverified leads</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
        Upload the GymMaster New Members report after email 2 has gone out (around day 11). Anyone already in the
        portal is skipped, including members who filled in the form and anyone who has opted out. Nothing is saved
        until you press Import.
      </p>
      <ImportUnverified />
    </div>
  );
}
