"use client";

import { useState, useTransition } from "react";
import type { DocumentListItem } from "@/lib/documents";
import { deleteDocument, getDocumentDownloadUrl, rejectDocument, verifyDocument } from "../actions";
import { ExpiryBadge, VerificationBadge } from "./DocumentBadges";

function DownloadButton({ documentId }: { documentId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const { url } = await getDocumentDownloadUrl(documentId);
          if (url) window.open(url, "_blank", "noopener,noreferrer");
        })
      }
      className="press rounded-full bg-fill px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-50"
    >
      {isPending ? "Opening..." : "View"}
    </button>
  );
}

function DeleteButton({ documentId, displayName }: { documentId: string; displayName: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`Delete "${displayName}"? This can't be undone.`)) return;
        startTransition(async () => {
          await deleteDocument(documentId);
        });
      }}
      className="press rounded-full bg-fill px-3 py-1.5 text-xs font-semibold text-red-600 disabled:opacity-50"
    >
      Delete
    </button>
  );
}

function ManagerReview({ documentId }: { documentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  if (rejecting) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="rounded-full bg-fill px-3 py-1.5 text-xs text-foreground outline-none ring-1 ring-transparent focus:ring-2 focus:ring-foreground"
        />
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await rejectDocument(documentId, reason);
              setRejecting(false);
              setReason("");
            })
          }
          className="press rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Confirm reject
        </button>
        <button
          type="button"
          onClick={() => setRejecting(false)}
          className="press rounded-full bg-fill px-3 py-1.5 text-xs font-semibold text-foreground"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await verifyDocument(documentId);
          })
        }
        className="press rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        Verify
      </button>
      <button
        type="button"
        onClick={() => setRejecting(true)}
        className="press rounded-full bg-fill px-3 py-1.5 text-xs font-semibold text-red-600"
      >
        Reject
      </button>
    </>
  );
}

function DocumentRow({
  item,
  isManager,
  canDelete,
}: {
  item: DocumentListItem;
  isManager: boolean;
  canDelete: boolean;
}) {
  return (
    <li className="rounded-2xl border border-black/5 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold tracking-tight text-foreground">{item.displayName}</span>
            <VerificationBadge status={item.status} />
            <ExpiryBadge band={item.expiryBand} label={item.expiryLabel} />
          </div>
          <p className="mt-0.5 truncate text-sm text-secondary-label">{item.fileName}</p>
          {item.status === "rejected" && item.rejectionReason && (
            <p className="mt-1 text-sm text-red-600">Reason: {item.rejectionReason}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DownloadButton documentId={item.id} />
          {isManager && item.status !== "verified" && <ManagerReview documentId={item.id} />}
          {canDelete && <DeleteButton documentId={item.id} displayName={item.displayName} />}
        </div>
      </div>
    </li>
  );
}

export default function DocumentList({
  items,
  isManager,
  canDelete = true,
  emptyMessage = "No documents uploaded yet.",
}: {
  items: DocumentListItem[];
  isManager: boolean;
  canDelete?: boolean;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-secondary-label">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <DocumentRow key={item.id} item={item} isManager={isManager} canDelete={canDelete} />
      ))}
    </ul>
  );
}
