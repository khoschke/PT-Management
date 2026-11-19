import { describe, expect, it } from "vitest";

import { getFollowUpState, needsActionToday } from "./followUps";
import type { Lead } from "./types";

// What the board and the emails say about a lead in the 2-2-2 follow-ups or on
// the 48-hour clock after a no. The rules live in 0022_follow_ups.sql; this is
// the reading of them a trainer acts on, so "due today" has to mean today in
// Brisbane, not today on the server.
//
// NOW is chosen so the Brisbane date and the UTC date differ: it is Friday
// morning in Brisbane and still Thursday in UTC, which is where Vercel runs.

const NOW = new Date("2026-11-19T23:00:00Z"); // Fri 20 Nov, 9am Brisbane
const HOUR = 60 * 60 * 1000;

type Fields = Pick<
  Lead,
  "status" | "follow_up_step" | "next_follow_up_at" | "said_no_at" | "permission_asked_at"
>;

function lead(overrides: Partial<Fields> = {}): Fields {
  return {
    status: "Contacted",
    follow_up_step: 1,
    next_follow_up_at: null,
    said_no_at: null,
    permission_asked_at: null,
    ...overrides,
  };
}

function hoursAgo(hours: number): string {
  return new Date(NOW.getTime() - hours * HOUR).toISOString();
}

describe("the 2-2-2 follow-ups", () => {
  it("names each step the way the trainer knows it", () => {
    const due = "2026-11-20T03:00:00Z"; // 1pm Brisbane, today
    const label = (step: number) =>
      getFollowUpState(lead({ follow_up_step: step, next_follow_up_at: due }), NOW)?.label;

    expect(label(1)).toBe("2-day nudge due today");
    expect(label(2)).toBe("2-week touch due today");
    expect(label(3)).toBe("2-month reconnect due today");
  });

  it("is due today for any time on today's Brisbane date, including late tonight", () => {
    // 11pm Brisbane on Friday is Friday 13:00 UTC: same Brisbane day.
    const state = getFollowUpState(lead({ next_follow_up_at: "2026-11-20T13:00:00Z" }), NOW);

    expect(state?.urgency).toBe("today");
  });

  it("stays due today, not overdue, after its time has passed on the same day", () => {
    // Due at 1am this morning: the trainer still has today to do it.
    const state = getFollowUpState(lead({ next_follow_up_at: "2026-11-19T15:00:00Z" }), NOW);

    expect(state?.urgency).toBe("today");
  });

  it("is overdue once its Brisbane day has gone, even though it is the same UTC day", () => {
    // 11pm Thursday Brisbane is Thursday 13:00 UTC, the same UTC date as NOW.
    // A UTC reading would call this due today.
    const state = getFollowUpState(lead({ next_follow_up_at: "2026-11-19T13:00:00Z" }), NOW);

    expect(state?.urgency).toBe("overdue");
    expect(state?.label).toBe("2-day nudge overdue");
  });

  it("is soon for the coming six days and names the day", () => {
    const state = getFollowUpState(lead({ next_follow_up_at: "2026-11-25T23:00:00Z" }), NOW);

    expect(state?.urgency).toBe("soon");
    expect(state?.label).toBe("2-day nudge due Thu, 26 Nov");
  });

  it("is later from the seventh day out", () => {
    const state = getFollowUpState(lead({ next_follow_up_at: "2026-11-26T23:00:00Z" }), NOW);

    expect(state?.urgency).toBe("later");
  });

  it("applies to Agreed to check-in as well as Contacted", () => {
    const state = getFollowUpState(
      lead({ status: "Agreed to check-in", follow_up_step: 3, next_follow_up_at: "2026-11-20T03:00:00Z" }),
      NOW,
    );

    expect(state?.kind).toBe("follow_up");
  });

  it("has nothing to say about a status outside the follow-ups", () => {
    const due = "2026-11-20T03:00:00Z";

    expect(getFollowUpState(lead({ status: "Comp. Booked", next_follow_up_at: due }), NOW)).toBeNull();
    expect(getFollowUpState(lead({ status: "Converted", next_follow_up_at: due }), NOW)).toBeNull();
  });

  it("shows nothing once the three steps are done or no date is set", () => {
    expect(getFollowUpState(lead({ follow_up_step: 4, next_follow_up_at: "2026-11-20T03:00:00Z" }), NOW)).toBeNull();
    expect(getFollowUpState(lead({ next_follow_up_at: null }), NOW)).toBeNull();
  });
});

describe("the 48-hour clock on a no", () => {
  it("counts down from the no, in whole hours rounded up", () => {
    const state = getFollowUpState(lead({ status: "Said no", said_no_at: hoursAgo(10.5) }), NOW);

    expect(state?.kind).toBe("no_clock");
    expect(state?.label).toBe("Respond to a no: 38h left");
    expect(state?.urgency).toBe("today");
  });

  it("turns urgent with 12 hours or fewer to go", () => {
    expect(getFollowUpState(lead({ status: "Said no", said_no_at: hoursAgo(36) }), NOW)?.urgency).toBe(
      "overdue",
    );
    expect(getFollowUpState(lead({ status: "Said no", said_no_at: hoursAgo(35) }), NOW)?.urgency).toBe(
      "today",
    );
  });

  it("bottoms out at 0h left rather than counting negative", () => {
    const state = getFollowUpState(lead({ status: "Said no", said_no_at: hoursAgo(60) }), NOW);

    expect(state?.label).toBe("Respond to a no: 0h left");
  });

  it("switches to waiting once the trainer has asked permission, closing a week later", () => {
    const state = getFollowUpState(
      lead({
        status: "Said no",
        said_no_at: hoursAgo(20),
        permission_asked_at: "2026-11-19T23:00:00Z",
      }),
      NOW,
    );

    expect(state).toMatchObject({
      kind: "awaiting_answer",
      urgency: "later",
      label: "Waiting on an answer, closes Fri, 27 Nov",
    });
  });

  it("needs the time of the no to run at all", () => {
    expect(getFollowUpState(lead({ status: "Said no", said_no_at: null }), NOW)).toBeNull();
  });
});

describe("needsActionToday", () => {
  it("is true for a no still to respond to, however much time is left", () => {
    expect(needsActionToday(lead({ status: "Said no", said_no_at: hoursAgo(1) }), NOW)).toBe(true);
  });

  it("is false while waiting on an answer", () => {
    expect(
      needsActionToday(
        lead({ status: "Said no", said_no_at: hoursAgo(20), permission_asked_at: hoursAgo(2) }),
        NOW,
      ),
    ).toBe(false);
  });

  it("is true for a follow-up due today or overdue, and false for one due later", () => {
    expect(needsActionToday(lead({ next_follow_up_at: "2026-11-20T03:00:00Z" }), NOW)).toBe(true);
    expect(needsActionToday(lead({ next_follow_up_at: "2026-11-18T03:00:00Z" }), NOW)).toBe(true);
    expect(needsActionToday(lead({ next_follow_up_at: "2026-11-23T03:00:00Z" }), NOW)).toBe(false);
  });

  it("is false for a lead with nothing scheduled", () => {
    expect(needsActionToday(lead({ status: "New" }), NOW)).toBe(false);
  });
});
