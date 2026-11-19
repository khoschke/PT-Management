"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { importUnverifiedLeads, previewUnverifiedImport } from "../actions";
import type { ImportResult, PreviewResult, PreviewRow, PreviewStatus } from "../state";

const STATUS_TEXT: Record<Exclude<PreviewStatus, "ready">, string> = {
  in_portal: "Already in the portal, skipped",
  repeated_in_file: "Listed twice, skipped",
  no_phone: "No valid mobile, skipped",
};

const button =
  "press rounded-full px-4 py-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40";

export default function ImportUnverified() {
  const [preview, setPreview] = useState<Extract<PreviewResult, { ok: true }> | null>(null);
  const [choice, setChoice] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<ImportResult, { ok: true }> | null>(null);
  const [pending, startTransition] = useTransition();

  function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await previewUnverifiedImport(await file.text());
      if (!res.ok) {
        setPreview(null);
        setError(res.message);
        return;
      }
      setPreview(res);
      const initial: Record<number, string> = {};
      res.rows.forEach((r, i) => {
        if (r.status === "ready" && r.suggestedTrainerId) initial[i] = r.suggestedTrainerId;
      });
      setChoice(initial);
    });
  }

  const ready = preview?.rows.map((r, i) => ({ r, i })).filter(({ r }) => r.status === "ready") ?? [];
  const unassigned = ready.filter(({ i }) => !choice[i]).length;

  function onImport() {
    if (!preview) return;
    setError(null);
    const items = ready.map(({ r, i }) => ({
      memberId: r.memberId,
      name: r.name,
      phone: r.phone,
      email: r.email,
      joined: r.joined,
      membership: r.membership,
      trainerId: choice[i],
    }));
    startTransition(async () => {
      const res = await importUnverifiedLeads(items);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setResult(res);
      setPreview(null);
    });
  }

  if (result) {
    return (
      <div className="mt-6 rounded-2xl bg-fill p-5">
        <p className="text-[15px] font-semibold text-foreground">
          {result.added} unverified lead{result.added === 1 ? "" : "s"} added and allocated.
        </p>
        <ul className="mt-2 text-sm text-secondary-label">
          {result.perTrainer.map((t) => (
            <li key={t.name}>
              {t.name}: {t.count}, emailed
            </li>
          ))}
        </ul>
        {result.skipped.length > 0 && (
          <p className="mt-2 text-sm text-secondary-label">
            Skipped because they were added to the portal in the meantime: {result.skipped.join(", ")}.
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <Link href="/admin" className={`${button} bg-foreground text-white`}>
            Back to leads
          </Link>
          <button type="button" onClick={() => setResult(null)} className={`${button} bg-white text-foreground`}>
            Import another file
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <label className={`${button} inline-block cursor-pointer bg-foreground text-white`}>
        {pending && !preview ? "Reading…" : preview ? "Choose a different file" : "Choose the report (.csv)"}
        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {preview && (
        <>
          <p className="mt-5 text-sm text-secondary-label">
            {ready.length} to add, {preview.rows.length - ready.length} skipped. Each new lead has a suggested trainer
            (whoever is taking leads with the lightest load). Change any you like.
          </p>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-black/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-fill text-xs uppercase tracking-wide text-secondary-label">
                <tr>
                  <th className="px-3 py-2 font-semibold">Member</th>
                  <th className="px-3 py-2 font-semibold">Mobile</th>
                  <th className="px-3 py-2 font-semibold">Joined</th>
                  <th className="px-3 py-2 font-semibold">Trainer</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r: PreviewRow, i) => (
                  <tr key={i} className={`border-t border-black/5 ${r.status === "ready" ? "" : "text-secondary-label"}`}>
                    <td className="px-3 py-2">
                      <span className={r.status === "ready" ? "font-medium text-foreground" : ""}>{r.name || "(no name)"}</span>
                      {r.membership && <span className="block text-xs text-secondary-label">{r.membership}</span>}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.phone || "None"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.joined}</td>
                    <td className="px-3 py-2">
                      {r.status === "ready" ? (
                        <select
                          value={choice[i] ?? ""}
                          onChange={(e) => setChoice((c) => ({ ...c, [i]: e.target.value }))}
                          className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm"
                        >
                          <option value="">Choose…</option>
                          {preview.trainers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                              {t.paused ? " (paused)" : ""}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs">{STATUS_TEXT[r.status]}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onImport}
              disabled={pending || ready.length === 0 || unassigned > 0}
              className={`${button} bg-foreground text-white`}
            >
              {pending ? "Importing…" : `Import ${ready.length} and email trainers`}
            </button>
            {unassigned > 0 && (
              <span className="text-sm text-secondary-label">Choose a trainer for every lead first.</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
