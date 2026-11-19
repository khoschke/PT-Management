import { describe, expect, it } from "vitest";

import { getContactClock } from "./countdown";
import { LEAD_STATUSES, type LeadStatus } from "./types";

// The 48-hour first-contact clock is the number the PT Manager runs the board
// on, so the band boundaries matter: amber is the prompt to act, red is the
// promise already broken. A fixed `now` is passed in rather than mocking the
// system clock, which is why the module takes it as an argument.

const NOW = new Date("2026-11-19T09:00:00Z");

function hoursFromNow(hours: number): string {
  return new Date(NOW.getTime() + hours * 60 * 60 * 1000).toISOString();
}

// A lead still waiting on first contact, which is the only state the clock
// actually runs in.
function clock(hours: number, status: LeadStatus = "Allocated") {
  return getContactClock(hoursFromNow(hours), null, status, NOW);
}

describe("when the clock stops", () => {
  it("stops once first contact is recorded, however overdue it was", () => {
    const result = getContactClock(hoursFromNow(-30), "2026-11-18T22:00:00Z", "Contacted", NOW);

    expect(result).toEqual({ band: "done", label: "Contacted", hoursRemaining: 0 });
  });

  it("runs for New and Allocated, and only those", () => {
    const running = LEAD_STATUSES.filter((s) => clock(-5, s).band !== "done");

    expect(running).toEqual(["New", "Allocated"]);
  });

  // A lead can jump straight from Allocated to Comp. Booked or Said no without
  // the Contacted step that stamps first_contacted_at. It must still leave the
  // clock, or the board shows a booked client as overdue.
  it.each(["Comp. Booked", "Said no", "Not interested", "Unreachable"] as LeadStatus[])(
    "stops for %s with no first-contact stamp, and hides the pill",
    (status) => {
      expect(clock(-5, status)).toEqual({ band: "done", label: "", hoursRemaining: 0 });
    },
  );
});

describe("bands", () => {
  it("is green with plenty of time left", () => {
    expect(clock(40).band).toBe("green");
  });

  it("is amber inside the last 24 hours", () => {
    expect(clock(6).band).toBe("amber");
  });

  // 24, not 12, because the manager digest runs once a day. The boundary is
  // inclusive: an off-by-one here lets a lead sit just outside amber at one
  // digest and be breached before the next.
  it("treats exactly 24 hours as amber, not green", () => {
    expect(clock(24).band).toBe("amber");
  });

  it("is green just outside 24 hours", () => {
    expect(clock(24.5).band).toBe("green");
  });

  it("is red once the deadline has passed", () => {
    expect(clock(-1).band).toBe("red");
  });

  it("treats the deadline itself as red", () => {
    expect(clock(0).band).toBe("red");
  });
});

describe("hoursRemaining", () => {
  it("counts down in hours", () => {
    expect(clock(10).hoursRemaining).toBeCloseTo(10);
  });

  it("goes negative once overdue, so the board can sort by it", () => {
    expect(clock(-4).hoursRemaining).toBeCloseTo(-4);
  });
});

describe("labels", () => {
  it("counts in minutes under an hour", () => {
    expect(clock(0.5).label).toBe("30 min left");
  });

  it("counts in hours under a day", () => {
    expect(clock(5).label).toBe("5 hr left");
  });

  it("counts in days and hours beyond a day", () => {
    expect(clock(25).label).toBe("1d 1hr left");
  });

  it("drops the hours when a whole number of days", () => {
    expect(clock(48).label).toBe("2d left");
  });

  it("says how far overdue rather than showing a negative", () => {
    expect(clock(-3).label).toBe("Overdue by 3 hr");
  });

  it("reports a long overdue lead in days", () => {
    expect(clock(-50).label).toBe("Overdue by 2d 2hr");
  });
});
