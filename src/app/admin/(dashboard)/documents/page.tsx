import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { toDocumentListItem } from "@/lib/documents";
import type { DocumentType, TrainerDocument } from "@/lib/types";
import UploadForm from "./components/UploadForm";
import DocumentList from "./components/DocumentList";

export const dynamic = "force-dynamic";

type DocumentRow = TrainerDocument & { document_type: { label: string; sort_order: number } | null };

export default async function MyDocumentsPage() {
  const user = await getCurrentUser();
  if (!user?.profile) redirect("/admin/login");

  // The manager has no documents of their own; send them to the overview.
  if (user.profile.role === "manager" || !user.profile.trainer_id) {
    redirect("/admin/compliance");
  }

  const trainerId = user.profile.trainer_id;
  const supabase = await createClient();

  const [{ data: documents }, { data: types }] = await Promise.all([
    supabase
      .from("trainer_documents")
      .select("*, document_type:document_types(label, sort_order)")
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

  const now = new Date();
  const items = (documents ?? [])
    .map((doc) => toDocumentListItem(doc, doc.document_type?.label ?? "Document", now))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight text-foreground">My documents</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-secondary-label">
        Upload your qualifications, CPR/First Aid, insurances and anything else the gym needs on file. The manager
        reviews each upload, and you&rsquo;ll get a reminder by email before anything expires.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <UploadForm trainerId={trainerId} documentTypes={types ?? []} />
        <DocumentList items={items} isManager={false} />
      </div>
    </div>
  );
}
