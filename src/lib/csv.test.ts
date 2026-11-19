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
    created_at: "2026-11-01T02:00:00Z",
    first_contact_due_at: "2026-11-03T02:00:00Z",
    first_contacted_at: null,
    allocated_at: null,
    last_contacted_at: null,
    closed_reason: null,
    closed_at: null,
    said_no_at: null,
    permission_asked_at: null,
    follow_up_step: null,
    next_follow_up_at: null,
    found_via: null,
    found_via_other: null,
    created_by: null,
    deleted_at: null,
    allocated_trainer: null,
    preferred_trainer: null,
    status_history: [],
    post_chat_reflections: null,
    ...overrides,
  };
}

// A minimal RFC 4180 reader, which is how Excel and Sheets split the file.
// Splitting on "," would hide exactly the faults these tests exist to find.
function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (quoted) {
      if (ch === '"' && csv[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

function header(): string[] {
  return parseCsv(leadsToCsv([]))[0];
}

function rowOf(csv: string, rowIndex = 1): string {
  return csv.split("\n")[rowIndex];
}

// One named column from the first data row, as a spreadsheet would read it.
function column(csv: string, name: string): string {
  const index = header().indexOf(name);
  if (index === -1) throw new Error(`No column called ${name}`);
  return parseCsv(csv)[1][index];
}

describe("the header row", () => {
  it("leads with the columns a manager sorts by", () => {
    expect(header().slice(0, 3)).toEqual(["Name", "Phone", "Email"]);
    expect(header()).toContain("First contact due");
  });

  it("emits a header even with no leads, so the file is never empty", () => {
    expect(leadsToCsv([]).split("\n")).toHaveLength(1);
  });

  // "Goal, other" has a comma in it. Written unquoted, a spreadsheet reads it
  // as two columns, "Goal" and " other", and every heading after it sits one
  // place to the right of its data. That shipped and was caught by this test.
  it("names every column exactly once, as a spreadsheet splits it", () => {
    expect(header()).toContain("Goal, other");
    expect(header()).toHaveLength(19);
  });

  it("has a cell for every column on every row", () => {
    // A column added to the header but not the row (or the reverse) shifts
    // every value after it one place, silently.
    const csv = leadsToCsv([leadRow({ goal_other: "Hike, Kokoda", notes: "Call, then text" })]);

    expect(parseCsv(csv)[1]).toHaveLength(header().length);
    expect(column(csv, "Goal, other")).toBe("Hike, Kokoda");
    expect(column(csv, "Notes")).toBe("Call, then text");
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

    expect(rowOf(csv).startsWith(expected)).toBe(true);
  });

  it("guards every free-text field, not just the name", () => {
    const csv = leadsToCsv([
      leadRow({
        current_exercise: "=cmd()",
        contact_preference: "@evil",
        goal_other: "+1",
        notes: "-2",
        found_via: "other",
        found_via_other: "=x",
      }),
    ]);

    expect(column(csv, "Current exercise")).toBe("'=cmd()");
    expect(column(csv, "Contact preference")).toBe("'@evil");
    expect(column(csv, "Goal, other")).toBe("'+1");
    expect(column(csv, "Notes")).toBe("'-2");
    // "Other: =x" starts with O, so it is safe as written.
    expect(column(csv, "Found via")).toBe("Other: =x");
  });

  it("leaves an ordinary value alone", () => {
    const csv = leadsToCsv([leadRow({ name: "Sam Rivers" })]);

    expect(rowOf(csv).startsWith("Sam Rivers,")).toBe(true);
  });

  it("only guards the leading character, not one in the middle", () => {
    const csv = leadsToCsv([leadRow({ name: "Sam=Rivers" })]);

    expect(rowOf(csv).startsWith("Sam=Rivers,")).toBe(true);
  });

  it("guards a formula that also needs quoting", () => {
    // The prefix goes on first, then the whole thing is quoted because of the
    // comma. Getting this order wrong would put the quote outside the guard.
    const csv = leadsToCsv([leadRow({ name: "=HYPERLINK(1,2)" })]);

    expect(rowOf(csv).startsWith(`"'=HYPERLINK(1,2)"`)).toBe(true);
  });
});

describe("CSV quoting", () => {
  it("quotes a value containing a comma", () => {
    const csv = leadsToCsv([leadRow({ name: "Rivers, Sam" })]);

    expect(rowOf(csv).startsWith(`"Rivers, Sam"`)).toBe(true);
  });

  it("doubles an embedded quote", () => {
    const csv = leadsToCsv([leadRow({ name: 'Sam "Speedy" Rivers' })]);

    expect(rowOf(csv).startsWith(`"Sam ""Speedy"" Rivers"`)).toBe(true);
  });

  it("quotes a value containing a newline so the row survives", () => {
    const csv = leadsToCsv([leadRow({ notes: "Line one\nLine two" })]);

    expect(csv).toContain(`"Line one\nLine two"`);
  });
});

describe("field mapping", () => {
  it("renders goal codes as the labels a human reads", () => {
    const csv = leadsToCsv([leadRow({ goals: ["weight_loss", "increase_strength"] })]);

    expect(column(csv, "Goals")).toBe("Weight loss; Increase strength");
  });

  it.each([
    ["form", "Form (warm)"],
    ["gymmaster_sweep", "Flagged"],
    ["unverified", "Unverified (cold)"],
    ["own", "Own lead"],
  ] as const)("names the %s source as %j", (source, label) => {
    expect(column(leadsToCsv([leadRow({ lead_source: source })]), "Source")).toBe(label);
  });

  it("says where a trainer found an own lead", () => {
    const csv = leadsToCsv([leadRow({ lead_source: "own", found_via: "gym_floor" })]);

    expect(column(csv, "Found via")).toBe("Gym floor");
  });

  it("leaves Found via empty on a lead the trainer did not find", () => {
    expect(column(leadsToCsv([leadRow()]), "Found via")).toBe("");
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

    expect(column(csv, "Allocated trainer")).toBe("Julie Manners");
    expect(column(csv, "Trainer requested")).toBe("Karl Hoschke");
    expect(csv).not.toContain("t-9");
  });

  it("writes one line per lead plus the header", () => {
    const csv = leadsToCsv([leadRow({ id: "a" }), leadRow({ id: "b" }), leadRow({ id: "c" })]);

    expect(csv.split("\n")).toHaveLength(4);
  });
});
