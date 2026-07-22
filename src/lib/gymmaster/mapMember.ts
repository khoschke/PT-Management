// Maps a GymMaster member onto a row ready to insert into `leads`.
//
// Kept separate from client.ts (the wire format) and the cron route (the
// database) so the "which GymMaster field becomes which lead column" decision
// lives in one obvious place.

import { normalisePhone } from "@/lib/validation";
import type { GymMasterMember } from "./client";

// The subset of a leads row the pull writes. Cold, unallocated, status New —
// the same starting point as a hand-entered sweep lead. created_at,
// first_contact_due_at and the New status default are set by the database.
export interface GymMasterLeadInsert {
  name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  goals: never[];
  lead_source: "gymmaster_api";
  status: "New";
  gymmaster_member_id: string;
}

// Join first/last into the single `name` column the board shows. Falls back to
// a labelled placeholder so a nameless GymMaster record is still actionable
// rather than an empty card.
function fullName(member: GymMasterMember): string {
  const name = [member.firstName, member.lastName].filter(Boolean).join(" ").trim();
  return name || `GymMaster member ${member.memberId}`;
}

// `leads.phone` is NOT NULL. GymMaster phone numbers may not fit the AU format
// the public form enforces, so store the number as given (whitespace/brackets
// stripped) and leave "" when GymMaster has none — the manager can fill it in.
function phone(member: GymMasterMember): string {
  return member.phone ? normalisePhone(member.phone) : "";
}

export function mapMemberToLead(member: GymMasterMember): GymMasterLeadInsert {
  return {
    name: fullName(member),
    phone: phone(member),
    email: member.email,
    date_of_birth: member.dateOfBirth,
    goals: [],
    lead_source: "gymmaster_api",
    status: "New",
    gymmaster_member_id: member.memberId,
  };
}

// A member worth importing has at least one way to reach them. Members with
// neither phone nor email are skipped (and logged) rather than creating a lead
// nobody can action.
export function isContactable(member: GymMasterMember): boolean {
  return Boolean(member.phone || member.email);
}
