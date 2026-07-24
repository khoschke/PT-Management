// Shared logic for PT compliance documents: storage constants, upload
// validation, and the pure functions that turn an expiry date into a status
// band (for badges and the compliance dashboard) and into the reminder
// milestones the daily cron acts on. Kept framework-free so both server
// actions and the cron route can lean on the same rules.

import type { DocumentExpiryRule, DocumentStatus, TrainerDocument } from "./types";

export const DOCUMENTS_BUCKET = "trainer-documents";

// Certificates are PDFs or photos of a paper document. Nothing else.
export const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"] as const;
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB, plenty for a scanned certificate.

// The built-in "other" type is the only one that needs a free-text label.
export const OTHER_TYPE_KEY = "other";

// How far ahead of expiry the reminders go out, then a daily alert once lapsed.
export const REMINDER_DAYS = [60, 30, 7] as const;
export type ReminderMilestone = "60" | "30" | "7" | "expired";

// "Expiring soon" for the dashboard amber band: within this many days.
export const EXPIRING_SOON_DAYS = 30;

export type ExpiryBand = "none" | "ok" | "soon" | "expired";

export interface DocumentDisplayStatus {
  // The verification state drives its own badge; expiry drives a second one.
  expiryBand: ExpiryBand;
  daysUntilExpiry: number | null;
  expiryLabel: string | null;
}

// Whole days from `now` until `expiry`, floored so "today" reads as 0 and a
// past date is negative. Compared at date granularity, not to the minute.
export function daysUntilExpiry(expiry: string, now: Date = new Date()): number {
  const expiryDate = new Date(`${expiry}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((expiryDate.getTime() - today.getTime()) / msPerDay);
}

export function getExpiryBand(expiry: string | null, now: Date = new Date()): ExpiryBand {
  if (!expiry) return "none";
  const days = daysUntilExpiry(expiry, now);
  if (days < 0) return "expired";
  if (days <= EXPIRING_SOON_DAYS) return "soon";
  return "ok";
}

export function getDocumentDisplayStatus(
  expiry: string | null,
  now: Date = new Date(),
): DocumentDisplayStatus {
  const expiryBand = getExpiryBand(expiry, now);
  if (!expiry) return { expiryBand, daysUntilExpiry: null, expiryLabel: null };

  const days = daysUntilExpiry(expiry, now);
  let expiryLabel: string;
  if (days < 0) expiryLabel = `Expired ${describeDays(-days)} ago`;
  else if (days === 0) expiryLabel = "Expires today";
  else expiryLabel = `Expires in ${describeDays(days)}`;

  return { expiryBand, daysUntilExpiry: days, expiryLabel };
}

function describeDays(days: number): string {
  if (days < 14) return `${days} day${days === 1 ? "" : "s"}`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  return `${Math.round(days / 30)} months`;
}

// A document flattened for display: verification and expiry already resolved so
// client components render without re-deriving dates (avoids hydration drift).
export interface DocumentListItem {
  id: string;
  typeLabel: string;
  customLabel: string | null;
  displayName: string;
  fileName: string;
  status: DocumentStatus;
  rejectionReason: string | null;
  expiryDate: string | null;
  expiryBand: ExpiryBand;
  expiryLabel: string | null;
  uploadedAt: string;
}

export function toDocumentListItem(
  doc: TrainerDocument,
  typeLabel: string,
  now: Date = new Date(),
): DocumentListItem {
  const display = getDocumentDisplayStatus(doc.expiry_date, now);
  return {
    id: doc.id,
    typeLabel,
    customLabel: doc.custom_label,
    displayName: doc.custom_label ? `${typeLabel} — ${doc.custom_label}` : typeLabel,
    fileName: doc.file_name,
    status: doc.status,
    rejectionReason: doc.rejection_reason,
    expiryDate: doc.expiry_date,
    expiryBand: display.expiryBand,
    expiryLabel: display.expiryLabel,
    uploadedAt: doc.uploaded_at,
  };
}

export function expiryRuleHint(rule: DocumentExpiryRule): string {
  switch (rule) {
    case "required":
      return "An expiry date is required for this document.";
    case "optional":
      return "Add an expiry date if this document has one.";
    case "none":
      return "This document type doesn't expire.";
  }
}

// Validate an uploaded file's type and size. Returns an error message, or null
// when the file is acceptable.
export function validateFile(file: { name: string; size: number; type: string }): string | null {
  if (file.size === 0) return "That file looks empty.";
  if (file.size > MAX_FILE_BYTES) return "That file is over the 10 MB limit.";

  const lowerName = file.name.toLowerCase();
  const extOk = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const mimeOk = (ALLOWED_MIME_TYPES as readonly string[]).includes(file.type);
  if (!extOk && !mimeOk) return "Upload a PDF, JPG or PNG.";

  return null;
}

// The status badge shown for a document's verification state.
export function verificationLabel(status: DocumentStatus): string {
  switch (status) {
    case "pending":
      return "Pending review";
    case "verified":
      return "Verified";
    case "rejected":
      return "Rejected";
  }
}

// Within a trainer, only the newest-expiring document of a given kind should
// drive expiry reminders and count toward the "coverage" view: uploading a
// renewal supersedes the old one. Grouping key is the type plus the "other"
// label, so a Cert III and a Cert IV (both qualifications, no expiry) never
// suppress each other, but two insurance certificates do.
export function supersessionKey(doc: Pick<TrainerDocument, "document_type_id" | "custom_label">): string {
  return `${doc.document_type_id}::${doc.custom_label ?? ""}`;
}

// From a trainer's documents, the set of document ids that are superseded by a
// later-expiring, non-rejected sibling of the same kind. Reminders skip these.
export function supersededDocumentIds(docs: TrainerDocument[]): Set<string> {
  const latestByKey = new Map<string, TrainerDocument>();
  for (const doc of docs) {
    if (doc.status === "rejected" || !doc.expiry_date) continue;
    const key = supersessionKey(doc);
    const current = latestByKey.get(key);
    if (!current || (current.expiry_date && doc.expiry_date > current.expiry_date)) {
      latestByKey.set(key, doc);
    }
  }

  const superseded = new Set<string>();
  for (const doc of docs) {
    if (doc.status === "rejected" || !doc.expiry_date) continue;
    const winner = latestByKey.get(supersessionKey(doc));
    if (winner && winner.id !== doc.id) superseded.add(doc.id);
  }
  return superseded;
}

// Given how many days remain until expiry and which milestones already fired,
// decide what to send today. Returns the milestone to email (most urgent unsent
// one), plus every milestone to record as handled so a burst doesn't trickle
// out over the following days. `alreadySent` holds the pre-expiry milestones
// recorded for this document; `expiredSentToday` says whether today's expired
// alert already went out.
export function reminderDecision(
  days: number,
  alreadySent: ReadonlySet<string>,
  expiredSentToday: boolean,
): { send: ReminderMilestone | null; record: ReminderMilestone[] } {
  if (days < 0) {
    if (expiredSentToday) return { send: null, record: [] };
    return { send: "expired", record: ["expired"] };
  }

  // Every threshold the document has reached but not yet been reminded about.
  const due = REMINDER_DAYS.filter((d) => days <= d).map((d) => String(d) as ReminderMilestone).filter(
    (m) => !alreadySent.has(m),
  );
  if (due.length === 0) return { send: null, record: [] };

  // Email only the most urgent (smallest threshold); mark the rest handled.
  const mostUrgent = due.reduce((a, b) => (Number(a) <= Number(b) ? a : b));
  return { send: mostUrgent, record: due };
}
