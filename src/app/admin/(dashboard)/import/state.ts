// Types for the unverified lead import. Kept out of actions.ts because a "use
// server" file may only export async functions.

export type PreviewStatus = "ready" | "in_portal" | "repeated_in_file" | "no_phone";

export interface PreviewRow {
  memberId: string;
  name: string;
  phone: string;
  email: string;
  joined: string;
  membership: string;
  status: PreviewStatus;
  suggestedTrainerId: string | null;
}

export type PreviewResult =
  | { ok: true; rows: PreviewRow[]; trainers: { id: string; name: string; paused: boolean }[] }
  | { ok: false; message: string };

export interface ImportItem {
  memberId: string;
  name: string;
  phone: string;
  email: string;
  joined: string;
  membership: string;
  trainerId: string;
}

export type ImportResult =
  | { ok: true; added: number; skipped: string[]; perTrainer: { name: string; count: number }[] }
  | { ok: false; message: string };
