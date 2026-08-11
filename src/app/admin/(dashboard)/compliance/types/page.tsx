import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { DocumentType } from "@/lib/types";
import DocumentTypesManager from "./components/DocumentTypesManager";

export const dynamic = "force-dynamic";

export default async function DocumentTypesPage() {
  const user = await getCurrentUser();
  if (user?.profile?.role !== "manager") redirect("/admin");

  const supabase = await createClient();
  const { data: types } = await supabase
    .from("document_types")
    .select("*")
    .order("sort_order")
    .returns<DocumentType[]>();

  return (
    <div>
      <Link href="/admin/compliance" className="text-sm font-semibold text-secondary-label hover:text-foreground">
        &larr; Compliance
      </Link>
      <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-foreground">Document types</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
        The kinds of document trainers can upload, and whether each one carries an expiry date. Hiding a type keeps
        existing documents but removes it from the upload menu.
      </p>
      <DocumentTypesManager types={types ?? []} />
    </div>
  );
}
