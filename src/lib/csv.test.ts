import { describe, expect, it } from "vitest";

import { leadsToCsv } from "./csv";
import type { LeadRow } from "@/app/admin/(dashboard)/page";

// Members type freely into the public form, and those values land in a file a
// manager opens in Excel or Google Sheets. Both treat a cell starting with =,
// +, -, @, tab or CR as a formula, so the export neutralises them. That is a
// security control (it was part of the August hardening pass) and this is the
// only thing that checks it still works.

function leadRow(overrides: Partial<LeadRow> = {}): LeadRow {
  return {
    id: "lead-1",
    name: "Sam Rivers",
    phone: "0412345678",
    email: "sam@example.com",
    date_of_birth: "1990-04-02",
    goals: ["weight_loss"],
    goal_other: null,
    current_exercise: "Walking twice a week",
    gender_preference: "no_preference",
    time_preference: "AM",
    preferred_trainer_id: null,
    contact_preference: "Text after 5pm",
    lead_source: "form",
    allocated_trainer_id: null,
    status: "New",
    notes: null,
    created_at: "2026-09-01T02:00:00Z",
    first_contact_due_at: "2026-09-03T02:00:00Z",
    first_contacted_at: null,
    created_by: null,
    deleted_at: null,
    allocated_trainer: null,
    preferred_trainer: null,
    status_history: [],
    ...overrides,
  };
}

function cellsOf(csv: string, rowIndex = 1): string {
  return csv.split("\n")[rowIndex];
}

describe("the header row", () => {
  it("leads with the columns a manager sorts by", () => {
    const header = leadsToCsv([]).split("\n")[0];

    expect(header.startsWith("Name,Phone,Email")).toBe(true);
    expect(header).toContain("First contact due");
  });

  it("emits a header even with no leads, so the file is never empty", () => {
    expect(leadsToCsv([]).split("\n")).toHaveLength(1);
  });
});

describe("spreadsheet formula injection", () => {
  // Each of these is a real attack shape: =cmd, +HYPERLINK, -2+3, @SUM, and
  // the tab/CR variants Excel also evaluates.
  it.each([
    ["=1+1", "'=1+1"],
    ["+1+1", "'+1+1"],
    ["-1+1", "'-1+1"],
    ["@SUM(A1)", "'@SUM(A1)"],
    ["\tSUM(A1)", "'\tSUM(A1)"],
    ["\rSUM(A1)", "'\rSUM(A1)"],
  ])("prefixes a cell starting with %j", (input, expected) => {
    const csv = leadsToCsv([leadRow({ name: input })]);

    expect(cellsOf(csv).startsWith(expected)).toBe(true);
  });

  it("leaves an ordinary value alone", () => {
    const csv = leadsToCsv([leadRow({ name: "Sam Rivers" })]);

    expect(cellsOf(csv).startsWith("Sam Rivers,")).toBe(true);
  });

  it("only guards the leading character, not one in the middle", () => {
    const csv = leadsToCsv([leadRow({ name: "Sam=Rivers" })]);

    expect(cellsOf(csv).startsWith("Sam=Rivers,")).toBe(true);
  });

  it("guards a formula that also needs quoting", () => {
    // The prefix goes on first, then the whole thing is quoted because of the
    // comma. Getting this order wrong would put the quote outside the guard.
    const csv = leadsToCsv([leadRow({ name: "=HYPERLINK(1,2)" })]);

    expect(cellsOf(csv).startsWith(`"'=HYPERLINK(1,2)"`)).toBe(true);
  });
});

describe("CSV quoting", () => {
  it("quotes a value containing a comma", () => {
    const csv = leadsToCsv([leadRow({ name: "Rivers, Sam" })]);

    expect(cellsOf(csv).startsWith(`"Rivers, Sam"`)).toBe(true);
  });

  it("doubles an embedded quote", () => {
    const csv = leadsToCsv([leadRow({ name: 'Sam "Speedy" Rivers' })]);

    expect(cellsOf(csv).startsWith(`"Sam ""Speedy"" Rivers"`)).toBe(true);
  });

  it("quotes a value containing a newline so the row survives", () => {
    const csv = leadsToCsv([leadRow({ notes: "Line one\nLine two" })]);

    expect(csv).toContain(`"Line one\nLine two"`);
  });
});

describe("field mapping", () => {
  it("renders goal codes as the labels a human reads", () => {
    const csv = leadsToCsv([leadRow({ goals: ["weight_loss", "increase_strength"] })]);

    expect(csv).toContain("Weight loss; Increase strength");
  });

  it("names the lead source in words", () => {
    expect(leadsToCsv([leadRow({ lead_source: "form" })])).toContain(",Form,");
    expect(leadsToCsv([leadRow({ lead_source: "gymmaster_sweep" })])).toContain(
      ",GymMaster sweep,",
    );
  });

  it("writes an empty cell for a null rather than the word null", () => {
    const csv = leadsToCsv([
      leadRow({ email: null, notes: null, goal_other: null, first_contacted_at: null }),
    ]);

    expect(csv).not.toContain("null");
  });

  it("uses the joined trainer names, not their ids", () => {
    const csv = leadsToCsv([
      leadRow({
        allocated_trainer: { id: "t-9", name: "Julie Manners" },
        preferred_trainer: { id: "t-4", name: "Karl Hoschke" },
      }),
    ]);

    expect(csv).toContain("Julie Manners");
    expect(csv).toContain("Karl Hoschke");
    expect(csv).not.toContain("t-9");
  });

  it("writes one line per lead plus the header", () => {
    const csv = leadsToCsv([leadRow({ id: "a" }), leadRow({ id: "b" }), leadRow({ id: "c" })]);

    expect(csv.split("\n")).toHaveLength(4);
  });
});
