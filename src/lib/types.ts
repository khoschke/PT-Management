// Types mirroring the Supabase schema in supabase/migrations/0001_init.sql.

import type { GoalCode } from "./goals";

export type TrainerGender = "male" | "female";
export type TrainerAvailability = "AM" | "PM" | "both";
export type LeadSource = "form" | "gymmaster_sweep";
export type LeadStatus =
  | "New"
  | "Allocated"
  | "Contacted"
  | "Booked"
  | "Completed"
  | "Not interested"
  | "Unreachable";
export type GenderPreference = "male" | "female" | "no_preference";
export type TimePreference = "AM" | "PM" | "either";
export type AppRole = "manager" | "trainer";

export interface Trainer {
  id: string;
  name: string;
  email: string | null;
  gender: TrainerGender;
  specialties: GoalCode[];
  availability: TrainerAvailability;
  active: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  goals: GoalCode[];
  goal_other: string | null;
  current_exercise: string | null;
  gender_preference: GenderPreference | null;
  time_preference: TimePreference | null;
  preferred_trainer_id: string | null;
  contact_preference: string | null;
  lead_source: LeadSource;
  allocated_trainer_id: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  first_contact_due_at: string;
  first_contacted_at: string | null;
  created_by: string | null;
  deleted_at: string | null;
}

export interface StatusHistoryEntry {
  id: string;
  lead_id: string;
  old_status: LeadStatus | null;
  new_status: LeadStatus;
  changed_at: string;
  changed_by: string | null;
  changed_by_name?: string | null;
}

export interface Profile {
  id: string;
  role: AppRole;
  trainer_id: string | null;
  full_name: string | null;
  created_at: string;
}

export const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Allocated",
  "Contacted",
  "Booked",
  "Completed",
  "Not interested",
  "Unreachable",
];
