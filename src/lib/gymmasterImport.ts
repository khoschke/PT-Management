// Reads GymMaster's "New Members" report (the CSV Karl downloads each week,
// named like report_New_Members_2026-11-01_2026-11-07_xxxx.csv) into rows the
// unverified lead import can check and save. Change list, Batch 2.
//
// Only the columns the portal needs are read. Everything else in the report
// (billing comment, sales rep, promotions) is ignored and never stored.

export interface ReportRow {
  memberId: string;
  name: string;
  phone: string;
  email: string;
  joined: string;
  membership: string;
}

// RFC 4180: commas inside quotes, doubled quotes, CRLF or LF line endings.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

const REQUIRED = ["Member Cell"] as const;

export function parseNewMembersReport(text: string): { rows: ReportRow[] } | { error: string } {
  const table = parseCsv(text);
  if (table.length < 2) return { error: "That file has no member rows in it." };

  const header = table[0].map((h) => h.trim());
  const col = (name: string) => header.indexOf(name);

  for (const name of REQUIRED) {
    if (col(name) === -1) {
      return {
        error: `That doesn't look like the GymMaster New Members report: there's no "${name}" column.`,
      };
    }
  }
  if (col("Member Name") === -1 && col("Member First Name") === -1) {
    return { error: 'That doesn\'t look like the GymMaster New Members report: there\'s no "Member Name" column.' };
  }

  const get = (r: string[], name: string) => {
    const i = col(name);
    return i === -1 ? "" : (r[i] ?? "").trim();
  };

  const rows = table.slice(1).map((r) => {
    const full = get(r, "Member Name");
    const split = [get(r, "Member First Name"), get(r, "Member Last Name")].filter(Boolean).join(" ");
    return {
      memberId: get(r, "Member ID"),
      name: full || split,
      phone: get(r, "Member Cell"),
      email: get(r, "Member Email"),
      joined: get(r, "Member Joining Date") || get(r, "Membership Start Date"),
      membership: get(r, "Membership Name") || get(r, "Current Memberships"),
    };
  });

  return { rows };
}

// The duplicate key add_own_lead() uses: the last nine digits, so 04xx, +614xx
// and 614xx all match the same number.
export function phoneKey(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}
