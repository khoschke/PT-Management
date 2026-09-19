import { describe, expect, it } from "vitest";

import { auPhoneSchema, leadFormSchema, normalisePhone, sweepLeadSchema } from "./validation";

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

describe("the manual sweep entry", () => {
  it("needs only a name and a phone number", () => {
    // A GymMaster sweep lead is typed in by the manager from a list, so
    // demanding goals or an email would stop the entry that matters most.
    expect(sweepLeadSchema.safeParse({ name: "Sam Rivers", phone: "0412345678" }).success).toBe(
      true,
    );
  });

  it("defaults goals to an empty list rather than failing", () => {
    const result = sweepLeadSchema.safeParse({ name: "Sam Rivers", phone: "0412345678" });

    expect(result.success && result.data.goals).toEqual([]);
  });

  it("still requires a valid phone number", () => {
    expect(sweepLeadSchema.safeParse({ name: "Sam Rivers", phone: "0912345678" }).success).toBe(
      false,
    );
  });

  it("allows a missing email but not a malformed one", () => {
    expect(sweepLeadSchema.safeParse({ name: "Sam", phone: "0412345678" }).success).toBe(true);
    expect(
      sweepLeadSchema.safeParse({ name: "Sam", phone: "0412345678", email: "" }).success,
    ).toBe(true);
    expect(
      sweepLeadSchema.safeParse({ name: "Sam", phone: "0412345678", email: "sam@" }).success,
    ).toBe(false);
  });
});
