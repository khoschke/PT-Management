import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { toDocumentListItem } from "@/lib/documents";
import type { DocumentType, Trainer, TrainerDocument } from "@/lib/types";
import UploadForm from "../../documents/components/UploadForm";
import DocumentList from "../../documents/components/DocumentList";

export const dynamic = "force-dynamic";

type DocumentRow = TrainerDocument & { document_type: { label: string } | null };

export default async function TrainerCompliancePage({
  params,
}: {
  params: Promise<{ trainerId: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.profile?.role !== "manager") redirect("/admin");

  const { trainerId } = await params;
  const supabase = await createClient();

  const [{ data: trainer }, { data: documents }, { data: types }] = await Promise.all([
    supabase
      .from("trainers")
      .select("id, name")
      .eq("id", trainerId)
      .maybeSingle<Pick<Trainer, "id" | "name">>(),
    supabase
      .from("trainer_documents")
      .select("*, document_type:document_types(label)")
      .eq("trainer_id", trainerId)
      .order("uploaded_at", { ascending: false })
      .returns<DocumentRow[]>(),
    supabase
      .from("document_types")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .returns<DocumentType[]>(),
  ]);

  if (!trainer) notFound();

  const now = new Date();
  const items = (documents ?? [])
    .map((doc) => toDocumentListItem(doc, doc.document_type?.label ?? "Document", now))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  return (
    <div>
      <Link href="/admin/compliance" className="text-sm font-semibold text-secondary-label hover:text-foreground">
        &larr; Compliance
      </Link>
      <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-foreground">{trainer.name}</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
        Review uploaded documents, or add one on this trainer&rsquo;s behalf. Documents you upload here are verified
        automatically.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <UploadForm trainerId={trainer.id} documentTypes={types ?? []} />
        <DocumentList items={items} isManager />
      </div>
    </div>
  );
}
