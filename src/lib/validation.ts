// Shared validation for the lead form, used client side for instant
// feedback and server side as the real gate before anything touches the
// database.

import { z } from "zod";
import { GOAL_OPTIONS } from "./goals";

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
  goals: z
    .array(z.enum(GOAL_CODES))
    .min(1, "Choose at least one goal"),
  goal_other: z.string().trim().max(300).optional().nullable(),
  current_exercise: z.string().trim().max(500).optional().nullable(),
  gender_preference: z.enum(["male", "female", "no_preference"]).optional().nullable(),
  time_preference: z.enum(["AM", "PM", "either"]).optional().nullable(),
  preferred_trainer_id: z.string().uuid().optional().nullable(),
  contact_preference: z.string().trim().max(300).optional().nullable(),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

// Manual "add sweep lead" entry only requires name and phone.
export const sweepLeadSchema = leadFormSchema
  .partial()
  .extend({
    name: leadFormSchema.shape.name,
    phone: leadFormSchema.shape.phone,
    goals: z.array(z.enum(GOAL_CODES)).optional().default([]),
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
