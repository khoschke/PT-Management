import { describe, expect, it } from "vitest";

import { isAcceptingLeads, suggestTrainer, type TrainerWithLoad } from "./allocation";
import type { Lead } from "./types";

// The suggestion engine is the one piece of business logic in this project
// that a manager acts on without checking the working, so its priority order
// is worth pinning down. The order, from the module's own header:
//
//   0. paused trainers are out entirely
//   1. a trainer named by the member wins outright
//   2. gender preference is a hard filter
//   3. goal match (10 each) and availability match (5)
//   4. lowest current load breaks the tie

function trainer(overrides: Partial<TrainerWithLoad> = {}): TrainerWithLoad {
  return {
    id: "trainer-1",
    name: "Dylan",
    email: null,
    gender: "male",
    specialties: [],
    bio: null,
    available_am: true,
    available_pm: true,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    currentLoad: 0,
    ...overrides,
  };
}

type LeadInput = Pick<
  Lead,
  "preferred_trainer_id" | "gender_preference" | "time_preference" | "goals"
>;

function lead(overrides: Partial<LeadInput> = {}): LeadInput {
  return {
    preferred_trainer_id: null,
    gender_preference: null,
    time_preference: null,
    goals: [],
    ...overrides,
  };
}

describe("isAcceptingLeads", () => {
  it("treats either slot ticked as available", () => {
    expect(isAcceptingLeads({ available_am: true, available_pm: false })).toBe(true);
    expect(isAcceptingLeads({ available_am: false, available_pm: true })).toBe(true);
  });

  it("treats both slots off as paused", () => {
    expect(isAcceptingLeads({ available_am: false, available_pm: false })).toBe(false);
  });
});

describe("rule 0: paused trainers", () => {
  it("returns no suggestion when everyone is paused", () => {
    const paused = [
      trainer({ id: "a", available_am: false, available_pm: false }),
      trainer({ id: "b", available_am: false, available_pm: false }),
    ];

    // The manager allocates by hand in this case rather than being handed a
    // trainer who has said their book is full.
    expect(suggestTrainer(lead(), paused)).toBeNull();
  });

  // This is the regression that migration 0012 existed to fix. Before it,
  // availability was scored at +5 rather than filtered, so a paused trainer
  // stayed in the running — and because rule 4 favours the lightest book, an
  // empty-booked paused trainer was MORE likely to win, not less.
  it("does not suggest a paused trainer with an empty book over a busy available one", () => {
    const trainers = [
      trainer({ id: "paused", name: "Shahd", available_am: false, available_pm: false, currentLoad: 0 }),
      trainer({ id: "busy", name: "Julie", currentLoad: 12 }),
    ];

    expect(suggestTrainer(lead(), trainers)?.trainer.id).toBe("busy");
  });

  it("ignores a paused trainer even when the member asked for them by name", () => {
    const trainers = [
      trainer({ id: "paused", name: "Shahd", available_am: false, available_pm: false }),
      trainer({ id: "open", name: "Michael" }),
    ];

    expect(suggestTrainer(lead({ preferred_trainer_id: "paused" }), trainers)?.trainer.id).toBe("open");
  });
});

describe("rule 1: a named trainer wins outright", () => {
  it("beats a better goal match and a lighter load", () => {
    const trainers = [
      trainer({ id: "requested", name: "Karl", currentLoad: 9, specialties: [] }),
      trainer({ id: "better", name: "Julie", currentLoad: 0, specialties: ["weight_loss"] }),
    ];

    const result = suggestTrainer(
      lead({ preferred_trainer_id: "requested", goals: ["weight_loss"] }),
      trainers,
    );

    expect(result?.trainer.id).toBe("requested");
    expect(result?.reason).toBe("Karl was requested by name.");
  });

  it("falls through to scoring when the requested trainer is not in the pool", () => {
    // An inactive trainer never reaches this function, so a stale id on the
    // lead should degrade to a normal suggestion rather than to no suggestion.
    const trainers = [trainer({ id: "open", name: "Michael" })];

    expect(suggestTrainer(lead({ preferred_trainer_id: "gone" }), trainers)?.trainer.id).toBe("open");
  });
});

describe("rule 2: gender preference is a hard filter", () => {
  it("excludes trainers of the other gender, whatever else they have going for them", () => {
    const trainers = [
      trainer({ id: "male-strong", gender: "male", specialties: ["weight_loss"], currentLoad: 0 }),
      trainer({ id: "female", gender: "female", specialties: [], currentLoad: 8 }),
    ];

    const result = suggestTrainer(
      lead({ gender_preference: "female", goals: ["weight_loss"] }),
      trainers,
    );

    expect(result?.trainer.id).toBe("female");
    // Capitalised because it is the leading fragment of the reason sentence.
    expect(result?.reason).toContain("Matches gender preference (female)");
  });

  it("does not filter on no_preference", () => {
    const trainers = [trainer({ id: "male", gender: "male" })];

    const result = suggestTrainer(lead({ gender_preference: "no_preference" }), trainers);

    expect(result?.trainer.id).toBe("male");
    expect(result?.reason).not.toContain("gender preference");
  });

  it("ignores the preference rather than returning nothing when no trainer matches", () => {
    // Better to suggest someone and let the manager judge than to hand back
    // an empty board with no explanation.
    const trainers = [trainer({ id: "male", gender: "male" })];

    const result = suggestTrainer(lead({ gender_preference: "female" }), trainers);

    expect(result?.trainer.id).toBe("male");
    expect(result?.reason).not.toContain("gender preference");
  });
});

describe("rule 3: goal and availability scoring", () => {
  it("weighs one goal match above an availability match", () => {
    const trainers = [
      trainer({ id: "goal", specialties: ["reduce_body_fat"], available_am: false, available_pm: true }),
      trainer({ id: "time", specialties: [], available_am: true, available_pm: true }),
    ];

    const result = suggestTrainer(
      lead({ goals: ["reduce_body_fat"], time_preference: "AM" }),
      trainers,
    );

    expect(result?.trainer.id).toBe("goal");
  });

  it("prefers more goal overlap", () => {
    const trainers = [
      trainer({ id: "one", specialties: ["weight_loss"] }),
      trainer({ id: "two", specialties: ["weight_loss", "increase_strength"] }),
    ];

    const result = suggestTrainer(
      lead({ goals: ["weight_loss", "increase_strength"] }),
      trainers,
    );

    expect(result?.trainer.id).toBe("two");
    expect(result?.reason).toContain("Shares 2 goals (Weight loss, Increase strength)");
  });

  it("gives no availability credit when the member will take either slot", () => {
    const trainers = [
      trainer({ id: "am-only", available_am: true, available_pm: false, currentLoad: 3 }),
      trainer({ id: "both", available_am: true, available_pm: true, currentLoad: 4 }),
    ];

    const result = suggestTrainer(lead({ time_preference: "either" }), trainers);

    // No signal from either trainer, so this falls to load alone.
    expect(result?.trainer.id).toBe("am-only");
    expect(result?.reason).toContain("No strong signal");
  });

  it("credits a PM match only to a trainer who works PM", () => {
    const trainers = [
      trainer({ id: "am-only", available_am: true, available_pm: false, currentLoad: 0 }),
      trainer({ id: "pm", available_am: false, available_pm: true, currentLoad: 5 }),
    ];

    const result = suggestTrainer(lead({ time_preference: "PM" }), trainers);

    expect(result?.trainer.id).toBe("pm");
    expect(result?.reason).toContain("Available PM");
  });
});

describe("rule 4: load breaks the tie", () => {
  it("picks the lightest book when nothing else separates them", () => {
    const trainers = [
      trainer({ id: "heavy", currentLoad: 6 }),
      trainer({ id: "light", currentLoad: 1 }),
      trainer({ id: "middle", currentLoad: 3 }),
    ];

    expect(suggestTrainer(lead(), trainers)?.trainer.id).toBe("light");
  });

  it("does not let a lighter book override a goal match", () => {
    const trainers = [
      trainer({ id: "idle", specialties: [], currentLoad: 0 }),
      trainer({ id: "matched", specialties: ["rehabilitation"], currentLoad: 7 }),
    ];

    const result = suggestTrainer(lead({ goals: ["rehabilitation"] }), trainers);

    expect(result?.trainer.id).toBe("matched");
  });
});

describe("the reason shown to the manager", () => {
  it("reads as a sentence and reports the load", () => {
    const trainers = [
      trainer({ id: "a", gender: "female", specialties: ["weight_loss"], currentLoad: 2 }),
    ];

    const result = suggestTrainer(
      lead({ gender_preference: "female", goals: ["weight_loss"] }),
      trainers,
    );

    expect(result?.reason).toBe(
      "Matches gender preference (female), shares 1 goal (Weight loss); 2 active leads on their books.",
    );
  });

  it("uses the singular for a single active lead", () => {
    const trainers = [trainer({ specialties: ["reshape"], currentLoad: 1 })];

    const result = suggestTrainer(lead({ goals: ["reshape"] }), trainers);

    expect(result?.reason).toContain("1 active lead on their books.");
  });

  it("says so plainly when nothing but load separated them", () => {
    const trainers = [trainer({ currentLoad: 0 })];

    expect(suggestTrainer(lead(), trainers)?.reason).toBe(
      "No strong signal from goals or availability, so this is the lowest current load (0 active leads).",
    );
  });
});
