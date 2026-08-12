"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { callerIsManager } from "@/lib/auth";
import type { DocumentType } from "@/lib/types";
import type { DocumentTypeFormState } from "./state";

// Document types are part of the compliance setup, so the manager owns them.
// RLS says the same (document_types_write_manager); this is the explicit check
// alongside it.

const typeSchema = z.object({
  label: z.string().trim().min(1, "Name is required").max(80),
  expiryRule: z.enum(["none", "optional", "required"]),
});

function parseFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString();
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function revalidate() {
  revalidatePath("/admin/compliance/types");
  revalidatePath("/admin/compliance");
  revalidatePath("/admin/documents");
}

export async function addDocumentType(
  _prevState: DocumentTypeFormState,
  formData: FormData,
): Promise<DocumentTypeFormState> {
  if (!(await callerIsManager())) {
    return { status: "error", message: "Only managers can add document types." };
  }

  const parsed = typeSchema.safeParse({
    label: formData.get("label")?.toString() ?? "",
    expiryRule: formData.get("expiryRule")?.toString(),
  });
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: parseFieldErrors(parsed.error) };
  }

  const supabase = await createClient();

  // Place new custom types after everything existing.
  const { data: last } = await supabase
    .from("document_types")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<Pick<DocumentType, "sort_order">>();
  const sortOrder = (last?.sort_order ?? 0) + 10;

  const { error } = await supabase.from("document_types").insert({
    label: parsed.data.label,
    expiry_rule: parsed.data.expiryRule,
    is_custom: true,
    active: true,
    sort_order: sortOrder,
  });

  if (error) {
    console.error("Add document type failed", error);
    return { status: "error", message: "Something went wrong saving that type." };
  }

  revalidate();
  return { status: "success" };
}

export async function updateDocumentType(
  typeId: string,
  _prevState: DocumentTypeFormState,
  formData: FormData,
): Promise<DocumentTypeFormState> {
  if (!(await callerIsManager())) {
    return { status: "error", message: "Only managers can edit document types." };
  }

  const parsed = typeSchema.safeParse({
    label: formData.get("label")?.toString() ?? "",
    expiryRule: formData.get("expiryRule")?.toString(),
  });
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: parseFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("document_types")
    .update({ label: parsed.data.label, expiry_rule: parsed.data.expiryRule })
    .eq("id", typeId);

  if (error) {
    console.error("Update document type failed", error);
    return { status: "error", message: "Something went wrong saving that type." };
  }

  revalidate();
  return { status: "success" };
}

export async function setDocumentTypeActive(typeId: string, active: boolean) {
  if (!(await callerIsManager())) return { ok: false };

  const supabase = await createClient();
  const { error } = await supabase.from("document_types").update({ active }).eq("id", typeId);
  if (error) return { ok: false };
  revalidate();
  return { ok: true };
}
