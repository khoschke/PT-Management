import { describe, expect, it } from "vitest";

import {
  auPhoneSchema,
  leadFormSchema,
  normalisePhone,
  ownLeadSchema,
  sweepLeadSchema,
} from "./validation";

// This is the real gate before anything reaches the database — the client-side
// copy is only for instant feedback. A member who cannot submit a valid
// Brisbane landline is a lead the gym never hears about, so the accepted forms
// are worth stating explicitly.

function validLead() {
  return {
    name: "Sam Rivers",
    phone: "0412 345 678",
    email: "sam@example.com",
    date_of_birth: "1990-04-02",
    goals: ["weight_loss"],
  };
}

describe("normalisePhone", () => {
  it("strips the punctuation people actually type", () => {
    expect(normalisePhone("(07) 3123-4567")).toBe("0731234567");
    expect(normalisePhone("0412 345 678")).toBe("0412345678");
    expect(normalisePhone("0412.345.678")).toBe("0412345678");
  });
});

describe("Australian phone numbers", () => {
  it.each([
    "0412345678",
    "0412 345 678",
    "+61 412 345 678",
    "61412345678",
    "(07) 3123 4567",
    "07 3123 4567",
    "0731234567",
  ])("accepts %j", (input) => {
    expect(auPhoneSchema.safeParse(input).success).toBe(true);
  });

  it.each([
    ["0912345678", "area code 9 is not allocated"],
    ["0112345678", "area code 1 is not allocated"],
    ["041234567", "one digit short"],
    ["04123456789", "one digit long"],
    ["+1 415 555 0123", "not an Australian number"],
    ["not a phone", "not digits at all"],
  ])("rejects %j (%s)", (input) => {
    expect(auPhoneSchema.safeParse(input).success).toBe(false);
  });

  it("normalises before storing, so the database holds one format", () => {
    const result = auPhoneSchema.safeParse("(07) 3123 4567");

    expect(result.success && result.data).toBe("0731234567");
  });

  it("asks for a number rather than complaining about the format when empty", () => {
    const result = auPhoneSchema.safeParse("");

    expect(result.success).toBe(false);
    expect(result.success === false && result.error.issues[0].message).toBe(
      "Phone number is required",
    );
  });
});

describe("the public lead form", () => {
  it("accepts a complete submission", () => {
    expect(leadFormSchema.safeParse(validLead()).success).toBe(true);
  });

  it("requires at least one goal, because allocation matches on them", () => {
    const result = leadFormSchema.safeParse({ ...validLead(), goals: [] });

    expect(result.success).toBe(false);
    expect(result.success === false && result.error.issues[0].message).toBe(
      "Choose at least one goal",
    );
  });

  it("rejects a goal code that is not in the shared list", () => {
    // The same list feeds trainer specialties, so an unknown code here would
    // be a goal no trainer can ever match.
    expect(leadFormSchema.safeParse({ ...validLead(), goals: ["learn_to_juggle"] }).success).toBe(
      false,
    );
  });

  it("rejects a date of birth in the future", () => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const result = leadFormSchema.safeParse({
      ...validLead(),
      date_of_birth: nextYear.toISOString().slice(0, 10),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a date of birth that is not a date", () => {
    expect(leadFormSchema.safeParse({ ...validLead(), date_of_birth: "sometime" }).success).toBe(
      false,
    );
  });

  it("requires a name with something in it", () => {
    expect(leadFormSchema.safeParse({ ...validLead(), name: "   " }).success).toBe(false);
  });

  it("requires a valid email", () => {
    expect(leadFormSchema.safeParse({ ...validLead(), email: "sam@" }).success).toBe(false);
  });

  it("rejects a preferred trainer id that is not a uuid", () => {
    expect(
      leadFormSchema.safeParse({ ...validLead(), preferred_trainer_id: "julie" }).success,
    ).toBe(false);
  });

  it("accepts a real uuid for the preferred trainer", () => {
    expect(
      leadFormSchema.safeParse({
        ...validLead(),
        preferred_trainer_id: "3f1a6c2e-5b7d-4e9a-8c1f-2d4b6a8e0c31",
      }).success,
    ).toBe(true);
  });
});

// The PT Manager's "Add lead" form: Flagged (gymmaster_sweep in the database)
// or Unverified. Both are typed in from a conversation or a list, so only a
// name, a phone and which kind of lead it is are required.
const manual = { name: "Sam Rivers", phone: "0412345678", lead_source: "gymmaster_sweep" };

describe("the manager's manual entry", () => {
  it("needs only a name, a phone number and the lead type", () => {
    expect(sweepLeadSchema.safeParse(manual).success).toBe(true);
    expect(sweepLeadSchema.safeParse({ ...manual, lead_source: "unverified" }).success).toBe(true);
  });

  it("asks which kind of lead it is rather than guessing", () => {
    const { lead_source: _omit, ...withoutSource } = manual;
    void _omit;
    const result = sweepLeadSchema.safeParse(withoutSource);

    expect(result.success).toBe(false);
    expect(result.success === false && result.error.issues[0].message).toBe(
      "Choose flagged or unverified",
    );
  });

  it("will not save a form or own lead through the manager's form", () => {
    // Form leads only come from the public form, and own leads go through
    // add_own_lead(), which records who found them and how.
    expect(sweepLeadSchema.safeParse({ ...manual, lead_source: "form" }).success).toBe(false);
    expect(sweepLeadSchema.safeParse({ ...manual, lead_source: "own" }).success).toBe(false);
  });

  it("defaults goals to an empty list rather than failing", () => {
    const result = sweepLeadSchema.safeParse(manual);

    expect(result.success && result.data.goals).toEqual([]);
  });

  it("still requires a valid phone number", () => {
    expect(sweepLeadSchema.safeParse({ ...manual, phone: "0912345678" }).success).toBe(false);
  });

  it("allows a missing email but not a malformed one", () => {
    expect(sweepLeadSchema.safeParse(manual).success).toBe(true);
    expect(sweepLeadSchema.safeParse({ ...manual, email: "" }).success).toBe(true);
    expect(sweepLeadSchema.safeParse({ ...manual, email: "sam@" }).success).toBe(false);
  });
});

// A trainer adding a lead they found themselves. add_own_lead() checks again
// in the database; this is what gives the trainer a readable message first.
const own = { name: "Sam Rivers", phone: "0412 345 678", found_via: "gym_floor" };

describe("a trainer's own lead", () => {
  it("needs a name, a phone and where they found them", () => {
    expect(ownLeadSchema.safeParse(own).success).toBe(true);
  });

  it("asks where they found them when it is missing", () => {
    const result = ownLeadSchema.safeParse({ name: own.name, phone: own.phone });

    expect(result.success).toBe(false);
    expect(result.success === false && result.error.issues[0].message).toBe(
      "Choose where you found them",
    );
  });

  it("wants a few words when the answer is Other", () => {
    const result = ownLeadSchema.safeParse({ ...own, found_via: "other" });

    expect(result.success).toBe(false);
    expect(result.success === false && result.error.issues[0].path).toEqual(["found_via_other"]);
    expect(
      ownLeadSchema.safeParse({ ...own, found_via: "other", found_via_other: "Parkrun" }).success,
    ).toBe(true);
  });

  it("does not count spaces as an answer to Other", () => {
    expect(
      ownLeadSchema.safeParse({ ...own, found_via: "other", found_via_other: "   " }).success,
    ).toBe(false);
  });

  it("stores the phone in the same normalised form as every other lead", () => {
    // The duplicate check in add_own_lead() matches on the last nine digits,
    // which only works if the punctuation is already gone.
    const result = ownLeadSchema.safeParse(own);

    expect(result.success && result.data.phone).toBe("0412345678");
  });

  it("allows a missing email but not a malformed one", () => {
    expect(ownLeadSchema.safeParse({ ...own, email: "" }).success).toBe(true);
    expect(ownLeadSchema.safeParse({ ...own, email: "sam@" }).success).toBe(false);
  });
});
