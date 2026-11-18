// Types mirroring the Supabase schema in supabase/migrations/0001_init.sql.

import type { GoalCode } from "./goals";

export type TrainerGender = "male" | "female";
// Three lead types (Part 7 workbook amendments, item 7; migration 0020):
// - form: warm, they asked for PT themselves through /pt-session.
// - gymmaster_sweep: shown as "Flagged" (Karl, 18 Nov 2026). Added by the PT
//   Manager after a conversation, an email or a front of house heads-up. Not
//   cold. The value's name is left over from the original "GymMaster sweep",
//   when the PT Manager typed in new members by hand (what is now `unverified`).
//   It is kept so existing rows and the GymMaster branch line up; only the
//   label changed.
// - unverified: a new member who hasn't asked about PT, handed over around
//   day 10 to 17 after two of the three nurture emails. The only "cold" type.
// - own: a lead a trainer found and added themselves (item 8, migration 0021).
//   A trainer who picks someone up from the unverified list saves as
//   `unverified` instead, so gym-provided and trainer-found leads stay apart.
export type LeadSource = "form" | "gymmaster_sweep" | "unverified" | "own";

// Sources the PT Manager can choose when adding a lead by hand. Form leads
// only ever come from the public form.
export const MANUAL_LEAD_SOURCES = ["gymmaster_sweep", "unverified"] as const;
export type ManualLeadSource = (typeof MANUAL_LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABELS: Record<LeadSource, { label: string; hint: string }> = {
  form: { label: "Form (warm)", hint: "Warm lead: asked for PT themselves through the form" },
  gymmaster_sweep: {
    label: "Flagged",
    hint: "Added by the PT Manager after a conversation, email or heads-up. Not cold",
  },
  unverified: {
    label: "Unverified (cold)",
    hint: "New member who hasn't asked about PT yet, after two of the three welcome emails",
  },
  own: { label: "Own lead", hint: "Found and added by the trainer themselves" },
};

// Why a lead ended for good (0022). Only no_response_to_no, the 48-hour
// timer's close, can be reopened, and only by the PT Manager.
export type ClosedReason = "replied_stop" | "declined" | "ended_by_trainer" | "no_response_to_no" | "no_reply";

export const CLOSED_REASON_LABELS: Record<ClosedReason, string> = {
  replied_stop: "Replied STOP",
  declined: "Declined",
  ended_by_trainer: "Ended by trainer",
  no_response_to_no: "No response to a no in 48 hours",
  no_reply: "No reply after the 2-month reconnect",
};

// Where a trainer found a lead they added themselves (`leads.found_via`).
export type FoundVia = "gym_floor" | "referral" | "social_media" | "unverified_list" | "other";

export const FOUND_VIA_OPTIONS: { value: FoundVia; label: string }[] = [
  { value: "gym_floor", label: "Gym floor" },
  { value: "referral", label: "Referral" },
  { value: "social_media", label: "Social media" },
  { value: "unverified_list", label: "Unverified lead list" },
  { value: "other", label: "Other" },
];

export function foundViaLabel(lead: { found_via: FoundVia | null; found_via_other: string | null }): string | null {
  if (!lead.found_via) return null;
  if (lead.found_via === "other") return lead.found_via_other ? `Other: ${lead.found_via_other}` : "Other";
  return FOUND_VIA_OPTIONS.find((o) => o.value === lead.found_via)?.label ?? null;
}
export type LeadStatus =
  | "New"
  | "Allocated"
  | "Contacted"
  | "Comp. Booked"
  | "Attended"
  | "Converted"
  | "Said no"
  | "Agreed to check-in"
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
  // When the current trainer got the lead, and the last time they reached out.
  // Both kept current by a trigger (0019_lead_contact_dates.sql).
  allocated_at: string | null;
  last_contacted_at: string | null;
  // The 2-2-2 and the 48-hour clock on a no (0022_follow_ups.sql).
  closed_reason: ClosedReason | null;
  closed_at: string | null;
  said_no_at: string | null;
  permission_asked_at: string | null;
  follow_up_step: number | null;
  next_follow_up_at: string | null;
  // Only on leads a trainer added themselves (0021_own_leads.sql).
  found_via: FoundVia | null;
  found_via_other: string | null;
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
  "Comp. Booked",
  "Attended",
  "Converted",
  "Said no",
  "Agreed to check-in",
  "Not interested",
  "Unreachable",
];

// What each status means, in one line. Shown to trainers when they hover over
// a status and under the status dropdown, so two trainers in the same
// situation pick the same one. Agreed with Karl, 17 Nov 2026; change the
// wording here and it changes everywhere. The fuller reference, stages and
// rules included, is docs/pipeline-stage-definitions.md: keep the two in step.
export const STATUS_DEFINITIONS: Record<LeadStatus, string> = {
  New: "Lead has come in, no trainer yet.",
  Allocated: "Assigned to a trainer, not contacted yet.",
  Contacted: "You have reached out (call, text or email), whether or not they replied.",
  "Comp. Booked": "A date is locked in for the complimentary session.",
  Attended: "Session happened, decision pending. Move to Converted or Not interested once they decide.",
  Converted: "They have signed up to paid PT.",
  "Said no": "They said no or not right now. Ask the permission question within 48 hours.",
  "Agreed to check-in": "They said yes to a check-in down the track. They're on the 2-2-2.",
  "Not interested": "They said no, or opted out. Don't contact them about PT again.",
  Unreachable: "You tried and never got a reply. They stay in the member email flow.",
};

// The only states the 48 hour first contact clock applies to: a lead that is
// still waiting to be contacted for the first time. Once it moves past these
// (contacted, booked, or closed out) first contact has happened or no longer
// matters, so the clock stops regardless of whether the "Contacted" step was
// ticked explicitly.
export const AWAITING_CONTACT_STATUSES: LeadStatus[] = ["New", "Allocated"];

// Finished states. The work on these is done, so the board hides them from its
// default view (a "Show closed" toggle brings them back) and the clock never
// counts them as overdue. Attended is deliberately not here: the conversion
// conversation is still to come, so it stays on the trainer's live list. It is
// a waiting room, not a destination: the weekly email flags an Attended lead
// that has waited longer than ATTENDED_DECISION_DAYS for an outcome, and a
// Comp. Booked lead booked longer than COMP_BOOKED_CHECK_DAYS ago, whose
// session has most likely happened or been missed by then.
export const CLOSED_LEAD_STATUSES: LeadStatus[] = [
  "Converted",
  "Not interested",
  "Unreachable",
];

export const ATTENDED_DECISION_DAYS = 7;
export const COMP_BOOKED_CHECK_DAYS = 7;

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

// ---------------------------------------------------------------------------
// Post-chat reflections (0023_post_chat_reflections.sql)
// ---------------------------------------------------------------------------

export type ReflectionFeel = "well" | "mixed" | "tough";
export type ReflectionStall =
  | "nowhere"
  | "engage"
  | "frame"
  | "summarise"
  | "plan"
  | "recommend"
  | "price"
  | "frequency"
  | "other";
export type ReflectionCertainty = "none" | "emotional" | "logical" | "self_belief";

export interface PostChatReflection {
  id: string;
  lead_id: string;
  trainer_id: string | null;
  created_at: string;
  skipped: boolean;
  feel: ReflectionFeel | null;
  stalled_at: ReflectionStall | null;
  missing_certainty: ReflectionCertainty | null;
  next_time: string | null;
}

export const REFLECTION_FEEL_LABELS: Record<ReflectionFeel, string> = {
  well: "Went well",
  mixed: "Mixed",
  tough: "Didn't land",
};

export const REFLECTION_STALL_LABELS: Record<ReflectionStall, string> = {
  nowhere: "It didn't",
  engage: "Engage",
  frame: "Frame",
  summarise: "Summarise",
  plan: "Plan",
  recommend: "Recommend",
  price: "The price",
  frequency: "Twice a week",
  other: "Somewhere else",
};

export const REFLECTION_CERTAINTY_LABELS: Record<ReflectionCertainty, string> = {
  none: "None, all three were there",
  emotional: "Emotional",
  logical: "Logical",
  self_belief: "Self-belief",
};
