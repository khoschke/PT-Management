// Types mirroring the Supabase schema in supabase/migrations/0001_init.sql.

import type { GoalCode } from "./goals";

export type TrainerGender = "male" | "female";
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
// `staff` are gym staff on the development pathway toward becoming a PT.
// They carry a `trainer_id` pointing at an inactive `trainers` row, which is
// how they get onboarding progress and compliance documents for free, and is
// what makes promotion to trainer two writes rather than a data migration.
export type AppRole = "manager" | "trainer" | "staff";

export interface Trainer {
  id: string;
  name: string;
  email: string | null;
  gender: TrainerGender;
  specialties: GoalCode[];
  bio: string | null;
  available_am: boolean;
  available_pm: boolean;
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

export type DocumentExpiryRule = "none" | "optional" | "required";
export type DocumentStatus = "pending" | "verified" | "rejected";

export interface DocumentType {
  id: string;
  key: string | null;
  label: string;
  expiry_rule: DocumentExpiryRule;
  active: boolean;
  sort_order: number;
  is_custom: boolean;
  created_at: string;
}

export interface TrainerDocument {
  id: string;
  trainer_id: string;
  document_type_id: string;
  custom_label: string | null;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  expiry_date: string | null;
  status: DocumentStatus;
  rejection_reason: string | null;
  verified_by: string | null;
  verified_at: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
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

// The only states the 48 hour first contact clock applies to: a lead that is
// still waiting to be contacted for the first time. Once it moves past these
// (contacted, booked, or closed out) first contact has happened or no longer
// matters, so the clock stops regardless of whether the "Contacted" step was
// ticked explicitly.
export const AWAITING_CONTACT_STATUSES: LeadStatus[] = ["New", "Allocated"];

// Finished states. The work on these is done, so the board hides them from its
// default view (a "Show closed" toggle brings them back) and the clock never
// counts them as overdue.
export const CLOSED_LEAD_STATUSES: LeadStatus[] = [
  "Completed",
  "Not interested",
  "Unreachable",
];

// ---------------------------------------------------------------------------
// Development pathway (0014_development_goals.sql)
// ---------------------------------------------------------------------------

// Three states, with no "overdue" and no failure state. See the migration.
export type DevelopmentGoalStatus = "active" | "achieved" | "parked";

export interface DevelopmentGoal {
  id: string;
  trainer_id: string;
  title: string;
  detail: string;
  status: DevelopmentGoalStatus;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  achieved_at: string | null;
}

// One row serves both conversations: `goal_id` null is a check-in on the
// person, `goal_id` set is a comment on that goal.
export interface DevelopmentNote {
  id: string;
  trainer_id: string;
  goal_id: string | null;
  body: string;
  author_id: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// PT setup checklist (0017_setup_checklist.sql)
// ---------------------------------------------------------------------------
// The operational steps that get a new trainer set up in the business. NOT the
// educational workbook at /onboarding, which is `onboarding_*`. Manager-only:
// these three tables carry no my_trainer_id() policy, deliberately, because
// the checklist touches the bond, the Business Pack and the rent ramp. See the
// migration header and the figure rule in CLAUDE.md.

// Three states rather than a boolean: the source checklist has "Fitaz email
// signature (if applicable)" in it, so without N/A a checklist can never read
// as complete.
export type SetupItemState = "pending" | "done" | "not_applicable";

export interface SetupChecklistItem {
  id: string;
  /** Stable slug. Permanent: renaming one orphans recorded ticks. */
  key: string;
  label: string;
  /** Detail under the label. Never a rent, bond or Business Pack figure. */
  hint: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface TrainerSetupChecklist {
  trainer_id: string;
  /** Drives the rent ramp. No amounts are stored anywhere. */
  start_date: string | null;
  amendments: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainerSetupChecklistItem {
  trainer_id: string;
  item_id: string;
  state: SetupItemState;
  note: string;
  updated_by: string | null;
  updated_at: string;
}
