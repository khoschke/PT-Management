// Shared validation for the lead form, used client side for instant
// feedback and server side as the real gate before anything touches the
// database.

import { z } from "zod";
import { GOAL_OPTIONS, isGoalTag } from "./goals";
import { MANUAL_LEAD_SOURCES } from "./types";

const GOAL_CODES = GOAL_OPTIONS.map((g) => g.code) as [string, ...string[]];

// Accepts Australian mobiles and landlines in the common written forms:
// 04XX XXX XXX, +61 4XX XXX XXX, (07) 3XXX XXXX, 07 3XXX XXXX, and so on.
// Spaces, dashes and brackets are stripped before matching.
const AU_PHONE_REGEX = /^(\+?61|0)[2-478]\d{8}$/;

export function normalisePhone(raw: string): string {
  return raw.replace(/[\s().-]/g, "");
}

export const auPhoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .transform(normalisePhone)
  .refine((val) => AU_PHONE_REGEX.test(val), {
    message: "Enter a valid Australian phone number",
  });

// The public form fields (field 9, the preferred trainer id, is validated
// separately once we know the live list of active trainers).
export const leadFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  phone: auPhoneSchema,
  email: z.string().trim().email("Enter a valid email address").max(320),
  date_of_birth: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), "Enter a valid date")
    .refine((val) => new Date(val) <= new Date(), "Date of birth can't be in the future"),
  // One list carries goals and the who/how tags (see goals.ts), but the form
  // still needs at least one actual goal.
  goals: z
    .array(z.enum(GOAL_CODES))
    .refine((codes) => codes.some(isGoalTag), "Choose at least one goal"),
  goal_other: z.string().trim().max(300).optional().nullable(),
  current_exercise: z.string().trim().max(500).optional().nullable(),
  gender_preference: z.enum(["male", "female", "no_preference"]).optional().nullable(),
  time_preference: z.enum(["AM", "PM", "either"]).optional().nullable(),
  preferred_trainer_id: z.string().uuid().optional().nullable(),
  contact_preference: z.string().trim().max(300).optional().nullable(),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

// Manual "Add lead" entry (Flagged or Unverified) only requires name and phone.
export const sweepLeadSchema = leadFormSchema
  .partial()
  .extend({
    name: leadFormSchema.shape.name,
    phone: leadFormSchema.shape.phone,
    goals: z.array(z.enum(GOAL_CODES)).optional().default([]),
    lead_source: z.enum(MANUAL_LEAD_SOURCES, { message: "Choose flagged or unverified" }),
    email: z
      .string()
      .trim()
      .max(320)
      .optional()
      .nullable()
      .refine(
        (val) => !val || z.string().email().safeParse(val).success,
        "Enter a valid email address",
      ),
  });

export type SweepLeadInput = z.infer<typeof sweepLeadSchema>;

// A trainer adding a lead they found themselves (item 8). The database
// function add_own_lead() checks all of this again, plus duplicates.
export const ownLeadSchema = z
  .object({
    name: leadFormSchema.shape.name,
    phone: leadFormSchema.shape.phone,
    email: sweepLeadSchema.shape.email,
    goals: z.array(z.enum(GOAL_CODES)).optional().default([]),
    found_via: z.enum(["gym_floor", "referral", "social_media", "unverified_list", "other"], {
      message: "Choose where you found them",
    }),
    found_via_other: z.string().trim().max(200).optional(),
  })
  .refine((v) => v.found_via !== "other" || (v.found_via_other ?? "").length > 0, {
    message: "Say where you found them",
    path: ["found_via_other"],
  });
