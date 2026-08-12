"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { callerIsManager, getCurrentUser } from "@/lib/auth";
import {
  DOCUMENTS_BUCKET,
  OTHER_TYPE_KEY,
  validateFile,
} from "@/lib/documents";
import { sendDocumentUploadedManagerNotification } from "@/lib/email";
import type { DocumentType, Trainer, TrainerDocument } from "@/lib/types";
import type { DocumentFormState } from "./state";

const uploadSchema = z.object({
  trainerId: z.string().uuid("Pick a trainer."),
  documentTypeId: z.string().uuid("Pick a document type."),
  customLabel: z.string().trim().max(120).optional().or(z.literal("")),
  expiryDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
    .optional()
    .or(z.literal("")),
});

function errorState(message: string, fieldErrors?: Record<string, string>): DocumentFormState {
  return { status: "error", message, fieldErrors };
}

// Turn "Cert IV - Personal Training.pdf" into a storage-safe file name while
// keeping enough of the original that a download is recognisable.
function safeFileName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/_+/g, "_");
  return cleaned.slice(-120) || "document";
}

function revalidateDocumentViews(trainerId: string) {
  revalidatePath("/admin/documents");
  revalidatePath("/admin/compliance");
  revalidatePath(`/admin/compliance/${trainerId}`);
}

export async function uploadDocument(
  _prevState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const user = await getCurrentUser();
  if (!user?.profile) return errorState("You need to be signed in to upload.");

  const isManager = user.profile.role === "manager";

  const parsed = uploadSchema.safeParse({
    trainerId: formData.get("trainerId")?.toString() ?? "",
    documentTypeId: formData.get("documentTypeId")?.toString() ?? "",
    customLabel: formData.get("customLabel")?.toString() ?? "",
    expiryDate: formData.get("expiryDate")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return errorState("Please check the highlighted fields.", fieldErrors);
  }

  const { trainerId, documentTypeId } = parsed.data;

  // A trainer may only upload to their own folder. RLS enforces this too, but
  // failing early gives a clean message instead of a storage permission error.
  if (!isManager && trainerId !== user.profile.trainer_id) {
    return errorState("You can only upload your own documents.");
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return errorState("Choose a file to upload.", { file: "Choose a file to upload." });
  }
  const fileError = validateFile(file);
  if (fileError) return errorState(fileError, { file: fileError });

  const supabase = await createClient();

  const { data: docType } = await supabase
    .from("document_types")
    .select("*")
    .eq("id", documentTypeId)
    .maybeSingle<DocumentType>();
  if (!docType) return errorState("That document type no longer exists.");

  // "Other" needs a human-readable label; nothing else uses one.
  let customLabel: string | null = null;
  if (docType.key === OTHER_TYPE_KEY) {
    const label = parsed.data.customLabel?.trim();
    if (!label) {
      return errorState("Give this document a name.", {
        customLabel: "Give this document a name, e.g. Blue Card.",
      });
    }
    customLabel = label;
  }

  // Apply the type's expiry rule.
  const rawExpiry = parsed.data.expiryDate?.trim() || null;
  let expiryDate: string | null = null;
  if (docType.expiry_rule === "none") {
    expiryDate = null; // Ignore anything submitted; this type doesn't expire.
  } else if (docType.expiry_rule === "required") {
    if (!rawExpiry) {
      return errorState("This document needs an expiry date.", {
        expiryDate: "This document needs an expiry date.",
      });
    }
    expiryDate = rawExpiry;
  } else {
    expiryDate = rawExpiry;
  }

  // Upload the file, namespaced by trainer id so the storage policies can scope
  // access. A random prefix keeps same-named uploads from clobbering each other.
  const objectPath = `${trainerId}/${crypto.randomUUID()}_${safeFileName(file.name)}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(objectPath, bytes, { contentType: file.type || "application/octet-stream", upsert: false });
  if (uploadError) {
    console.error("Document upload failed", uploadError);
    return errorState("Something went wrong uploading that file.");
  }

  // Manager uploads are trusted and verified on the spot; trainer uploads land
  // as pending for the manager to review.
  const verifiedFields = isManager
    ? { status: "verified" as const, verified_by: user.id, verified_at: new Date().toISOString() }
    : { status: "pending" as const };

  const { error: insertError } = await supabase.from("trainer_documents").insert({
    trainer_id: trainerId,
    document_type_id: documentTypeId,
    custom_label: customLabel,
    file_path: objectPath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type || "application/octet-stream",
    expiry_date: expiryDate,
    uploaded_by: user.id,
    ...verifiedFields,
  });

  if (insertError) {
    // Roll the orphaned file back so storage doesn't collect dead objects.
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([objectPath]);
    console.error("Document insert failed", insertError);
    return errorState("Something went wrong saving that document.");
  }

  // Tell the manager a trainer-uploaded document is waiting for review.
  if (!isManager && process.env.PT_MANAGER_EMAIL) {
    const { data: trainer } = await supabase
      .from("trainers")
      .select("name")
      .eq("id", trainerId)
      .maybeSingle<Pick<Trainer, "name">>();
    const label = customLabel ? `${docType.label} — ${customLabel}` : docType.label;
    await sendDocumentUploadedManagerNotification(process.env.PT_MANAGER_EMAIL, {
      trainerName: trainer?.name ?? "A trainer",
      documentLabel: label,
      expiryDate,
    });
  }

  revalidateDocumentViews(trainerId);
  return { status: "success" };
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient();

  // Read first so we know the storage path and can revalidate the right trainer.
  const { data: doc } = await supabase
    .from("trainer_documents")
    .select("id, trainer_id, file_path")
    .eq("id", documentId)
    .maybeSingle<Pick<TrainerDocument, "id" | "trainer_id" | "file_path">>();
  if (!doc) return { ok: false };

  const { error } = await supabase.from("trainer_documents").delete().eq("id", documentId);
  if (error) {
    console.error("Document delete failed", error);
    return { ok: false };
  }

  await supabase.storage.from(DOCUMENTS_BUCKET).remove([doc.file_path]);
  revalidateDocumentViews(doc.trainer_id);
  return { ok: true };
}

// Manager marks a document verified. RLS restricts the update to managers, and
// the explicit check here means that's stated in both places — a trainer must
// never be able to sign off their own compliance document.
export async function verifyDocument(documentId: string) {
  if (!(await callerIsManager())) return { ok: false };

  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data: doc, error } = await supabase
    .from("trainer_documents")
    .update({
      status: "verified",
      verified_by: user?.id ?? null,
      verified_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", documentId)
    .select("trainer_id")
    .maybeSingle<Pick<TrainerDocument, "trainer_id">>();

  if (error || !doc) {
    console.error("Verify document failed", error);
    return { ok: false };
  }
  revalidateDocumentViews(doc.trainer_id);
  return { ok: true };
}

// Manager rejects a document, with an optional reason shown back to the trainer.
export async function rejectDocument(documentId: string, reason: string) {
  if (!(await callerIsManager())) return { ok: false };

  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data: doc, error } = await supabase
    .from("trainer_documents")
    .update({
      status: "rejected",
      verified_by: user?.id ?? null,
      verified_at: new Date().toISOString(),
      rejection_reason: reason.trim().slice(0, 500) || null,
    })
    .eq("id", documentId)
    .select("trainer_id")
    .maybeSingle<Pick<TrainerDocument, "trainer_id">>();

  if (error || !doc) {
    console.error("Reject document failed", error);
    return { ok: false };
  }
  revalidateDocumentViews(doc.trainer_id);
  return { ok: true };
}

// A short-lived signed URL for viewing/downloading a document. RLS on the
// select decides whether the caller may see this row at all, so an unauthorised
// request simply finds no document.
export async function getDocumentDownloadUrl(documentId: string): Promise<{ url: string | null }> {
  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("trainer_documents")
    .select("file_path")
    .eq("id", documentId)
    .maybeSingle<Pick<TrainerDocument, "file_path">>();
  if (!doc) return { url: null };

  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(doc.file_path, 60);
  if (error) {
    console.error("Signed URL failed", error);
    return { url: null };
  }
  return { url: data.signedUrl };
}
