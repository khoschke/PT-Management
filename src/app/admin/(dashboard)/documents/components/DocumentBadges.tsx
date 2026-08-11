import type { DocumentStatus } from "@/lib/types";
import { type ExpiryBand, verificationLabel } from "@/lib/documents";

const badgeBase = "rounded-full px-2 py-0.5 text-xs font-semibold";

const statusStyles: Record<DocumentStatus, string> = {
  pending: "bg-blue-50 text-blue-700",
  verified: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export function VerificationBadge({ status }: { status: DocumentStatus }) {
  return <span className={`${badgeBase} ${statusStyles[status]}`}>{verificationLabel(status)}</span>;
}

const expiryStyles: Record<Exclude<ExpiryBand, "none">, string> = {
  ok: "bg-green-50 text-green-700",
  soon: "bg-amber-50 text-amber-700",
  expired: "bg-red-50 text-red-700",
};

export function ExpiryBadge({ band, label }: { band: ExpiryBand; label: string | null }) {
  if (band === "none" || !label) return null;
  return <span className={`${badgeBase} ${expiryStyles[band]}`}>{label}</span>;
}
