import { describe, expect, it } from "vitest";

import {
  MAX_FILE_BYTES,
  daysUntilExpiry,
  getDocumentDisplayStatus,
  getExpiryBand,
  reminderDecision,
  supersededDocumentIds,
  validateFile,
} from "./documents";
import type { TrainerDocument } from "./types";

// Compliance documents: insurance, first aid, CPR. A trainer whose cover has
// lapsed is not insured to train on the floor, so the expiry bands and the
// reminder schedule are worth pinning down. The suite runs in UTC (see
// vitest.config.ts); `now` is passed in so no test depends on the real date.

const NOW = new Date("2026-11-19T09:00:00Z");

describe("days until expiry", () => {
  it("is 0 on the day itself, at any time of day", () => {
    expect(daysUntilExpiry("2026-11-19", new Date("2026-11-19T00:00:01Z"))).toBe(0);
    expect(daysUntilExpiry("2026-11-19", new Date("2026-11-19T23:59:59Z"))).toBe(0);
  });

  it("counts whole days forward and back", () => {
    expect(daysUntilExpiry("2026-11-20", NOW)).toBe(1);
    expect(daysUntilExpiry("2026-12-19", NOW)).toBe(30);
    expect(daysUntilExpiry("2026-11-18", NOW)).toBe(-1);
  });
});

describe("expiry bands", () => {
  it("has no band without a date", () => {
    expect(getExpiryBand(null, NOW)).toBe("none");
  });

  it("is still current on its expiry date, and expired the day after", () => {
    expect(getExpiryBand("2026-11-19", NOW)).toBe("soon");
    expect(getExpiryBand("2026-11-18", NOW)).toBe("expired");
  });

  it("is expiring soon from 30 days out, inclusive", () => {
    expect(getExpiryBand("2026-12-19", NOW)).toBe("soon"); // 30 days
    expect(getExpiryBand("2026-12-20", NOW)).toBe("ok"); // 31 days
  });
});

describe("the expiry label", () => {
  it.each([
    ["2026-11-19", "Expires today"],
    ["2026-11-20", "Expires in 1 day"],
    ["2026-11-29", "Expires in 10 days"],
    ["2026-12-10", "Expires in 3 weeks"],
    ["2027-05-19", "Expires in 6 months"],
    ["2026-11-18", "Expired 1 day ago"],
    ["2026-10-20", "Expired 4 weeks ago"],
  ])("reads %s as %j", (expiry, label) => {
    expect(getDocumentDisplayStatus(expiry, NOW).expiryLabel).toBe(label);
  });

  it("has no label and no day count without a date", () => {
    expect(getDocumentDisplayStatus(null, NOW)).toEqual({
      expiryBand: "none",
      daysUntilExpiry: null,
      expiryLabel: null,
    });
  });
});

describe("upload checks", () => {
  const file = (name: string, type: string, size = 1000) => ({ name, type, size });

  it.each([
    ["cert.pdf", "application/pdf"],
    ["Insurance.PDF", "application/pdf"],
    ["photo.jpg", "image/jpeg"],
    ["photo.jpeg", "image/jpeg"],
    ["scan.png", "image/png"],
  ])("accepts %s", (name, type) => {
    expect(validateFile(file(name, type))).toBeNull();
  });

  it("accepts the right extension when the browser leaves the type blank", () => {
    expect(validateFile(file("cert.pdf", ""))).toBeNull();
  });

  it("refuses other formats", () => {
    expect(
      validateFile(
        file("cert.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      ),
    ).toBe("Upload a PDF, JPG or PNG.");
    expect(validateFile(file("photo.heic", "image/heic"))).toBe("Upload a PDF, JPG or PNG.");
  });

  it("refuses an empty file and one over 10 MB, but not one exactly at the limit", () => {
    expect(validateFile(file("cert.pdf", "application/pdf", 0))).toBe("That file looks empty.");
    expect(validateFile(file("cert.pdf", "application/pdf", MAX_FILE_BYTES + 1))).toBe(
      "That file is over the 10 MB limit.",
    );
    expect(validateFile(file("cert.pdf", "application/pdf", MAX_FILE_BYTES))).toBeNull();
  });
});

describe("superseded documents", () => {
  function doc(overrides: Partial<TrainerDocument>): TrainerDocument {
    return {
      id: "doc",
      trainer_id: "t1",
      document_type_id: "insurance",
      custom_label: null,
      file_path: "t1/doc.pdf",
      file_name: "doc.pdf",
      file_size: 1000,
      mime_type: "application/pdf",
      expiry_date: "2026-12-01",
      status: "verified",
      rejection_reason: null,
      verified_by: null,
      verified_at: null,
      uploaded_by: null,
      uploaded_at: "2026-01-01T00:00:00Z",
      ...overrides,
    };
  }

  it("silences the old certificate once a later one of the same kind is verified", () => {
    const ids = supersededDocumentIds([
      doc({ id: "old", expiry_date: "2026-12-01" }),
      doc({ id: "new", expiry_date: "2027-12-01" }),
    ]);

    expect([...ids]).toEqual(["old"]);
  });

  it("keeps reminding while the renewal is only pending review", () => {
    // Only the manager signing the new one off should stop the reminders.
    const ids = supersededDocumentIds([
      doc({ id: "old", expiry_date: "2026-12-01" }),
      doc({ id: "new", expiry_date: "2027-12-01", status: "pending" }),
    ]);

    expect(ids.size).toBe(0);
  });

  it("never lets one kind of document silence another", () => {
    const ids = supersededDocumentIds([
      doc({ id: "insurance", document_type_id: "insurance", expiry_date: "2026-12-01" }),
      doc({ id: "first-aid", document_type_id: "first_aid", expiry_date: "2027-12-01" }),
      doc({ id: "other-a", document_type_id: "other", custom_label: "Boxing", expiry_date: "2026-12-01" }),
      doc({ id: "other-b", document_type_id: "other", custom_label: "Pilates", expiry_date: "2027-12-01" }),
    ]);

    expect(ids.size).toBe(0);
  });

  it("ignores rejected documents and ones with no expiry", () => {
    const ids = supersededDocumentIds([
      doc({ id: "rejected", expiry_date: "2026-12-01", status: "rejected" }),
      doc({ id: "undated", expiry_date: null }),
      doc({ id: "new", expiry_date: "2027-12-01" }),
    ]);

    expect(ids.size).toBe(0);
  });
});

describe("which reminder to send", () => {
  const none = new Set<string>();

  it("sends nothing while more than 60 days remain", () => {
    expect(reminderDecision(61, none, false)).toEqual({ send: null, record: [] });
  });

  it.each([
    [60, "60"],
    [30, "30"],
    [7, "7"],
  ] as const)("sends the %i-day reminder on the day", (days, milestone) => {
    const sent = new Set(["60", "30", "7"].filter((m) => Number(m) > days));

    expect(reminderDecision(days, sent, false)).toEqual({ send: milestone, record: [milestone] });
  });

  it("does not resend a reminder already sent", () => {
    expect(reminderDecision(45, new Set(["60"]), false)).toEqual({ send: null, record: [] });
  });

  // A document uploaded with 5 days left has crossed all three thresholds at
  // once. One email, the most urgent, and the rest marked handled, so they do
  // not trickle out over the next few days.
  it("sends only the most urgent when several are due at once, and records them all", () => {
    expect(reminderDecision(5, none, false)).toEqual({ send: "7", record: ["60", "30", "7"] });
  });

  it("sends the expired alert once a day after expiry", () => {
    expect(reminderDecision(-1, new Set(["60", "30", "7"]), false)).toEqual({
      send: "expired",
      record: ["expired"],
    });
    expect(reminderDecision(-1, new Set(["60", "30", "7"]), true)).toEqual({ send: null, record: [] });
  });

  it("treats the expiry date itself as the last day of the 7-day window, not expired", () => {
    expect(reminderDecision(0, new Set(["60", "30", "7"]), false)).toEqual({ send: null, record: [] });
  });
});
