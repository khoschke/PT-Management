import { describe, expect, it } from "vitest";

import { getContactClock } from "./countdown";

// The 48-hour first-contact clock is the number the PT Manager runs the board
// on, so the band boundaries matter: amber is the prompt to act, red is the
// promise already broken. A fixed `now` is passed in rather than mocking the
// system clock, which is why the module takes it as an argument.

const NOW = new Date("2026-09-15T09:00:00Z");

function hoursFromNow(hours: number): string {
  return new Date(NOW.getTime() + hours * 60 * 60 * 1000).toISOString();
}

describe("a lead that has been contacted", () => {
  it("leaves the clock regardless of how overdue it was", () => {
    const clock = getContactClock(hoursFromNow(-30), "2026-09-14T22:00:00Z", NOW);

    expect(clock).toEqual({ band: "done", label: "Contacted", hoursRemaining: 0 });
  });
});

describe("bands", () => {
  it("is green with plenty of time left", () => {
    expect(getContactClock(hoursFromNow(40), null, NOW).band).toBe("green");
  });

  it("is amber inside the last 12 hours", () => {
    expect(getContactClock(hoursFromNow(6), null, NOW).band).toBe("amber");
  });

  it("treats exactly 12 hours as amber, not green", () => {
    // The boundary is inclusive. Worth pinning: an off-by-one here means a
    // lead goes from green straight to red with no warning.
    expect(getContactClock(hoursFromNow(12), null, NOW).band).toBe("amber");
  });

  it("is green just outside 12 hours", () => {
    expect(getContactClock(hoursFromNow(12.5), null, NOW).band).toBe("green");
  });

  it("is red once the deadline has passed", () => {
    expect(getContactClock(hoursFromNow(-1), null, NOW).band).toBe("red");
  });

  it("treats the deadline itself as red", () => {
    expect(getContactClock(hoursFromNow(0), null, NOW).band).toBe("red");
  });
});

describe("hoursRemaining", () => {
  it("counts down in hours", () => {
    expect(getContactClock(hoursFromNow(10), null, NOW).hoursRemaining).toBeCloseTo(10);
  });

  it("goes negative once overdue, so the board can sort by it", () => {
    expect(getContactClock(hoursFromNow(-4), null, NOW).hoursRemaining).toBeCloseTo(-4);
  });
});

describe("labels", () => {
  it("counts in minutes under an hour", () => {
    expect(getContactClock(hoursFromNow(0.5), null, NOW).label).toBe("30 min left");
  });

  it("counts in hours under a day", () => {
    expect(getContactClock(hoursFromNow(5), null, NOW).label).toBe("5 hr left");
  });

  it("counts in days and hours beyond a day", () => {
    expect(getContactClock(hoursFromNow(25), null, NOW).label).toBe("1d 1hr left");
  });

  it("drops the hours when a whole number of days", () => {
    expect(getContactClock(hoursFromNow(48), null, NOW).label).toBe("2d left");
  });

  it("says how far overdue rather than showing a negative", () => {
    expect(getContactClock(hoursFromNow(-3), null, NOW).label).toBe("Overdue by 3 hr");
  });

  it("reports a long overdue lead in days", () => {
    expect(getContactClock(hoursFromNow(-50), null, NOW).label).toBe("Overdue by 2d 2hr");
  });
});
