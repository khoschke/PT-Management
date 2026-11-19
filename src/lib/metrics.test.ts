import { describe, expect, it } from "vitest";

import { computeFunnelMetrics, rate, type FunnelLead } from "./metrics";

// The funnel on /admin/metrics. The rule that matters, from
// docs/pipeline-stage-definitions.md: a rate counts whether a lead EVER reached
// a stage, read from its history, not where it sits now. Get that wrong and a
// trainer who books a client who later says no looks like they never booked.

function lead(statuses: string[], overrides: Partial<FunnelLead> = {}): FunnelLead {
  const history = statuses.map((s, i) => ({
    new_status: s,
    changed_at: new Date(Date.UTC(2026, 10, 1 + i)).toISOString(),
  }));
  return {
    lead_source: "form",
    status: (statuses[statuses.length - 1] ?? "New") as FunnelLead["status"],
    created_at: "2026-11-01T00:00:00Z",
    first_contact_due_at: "2026-11-03T00:00:00Z",
    first_contacted_at: null,
    status_history: history,
    ...overrides,
  };
}

describe("stage counts", () => {
  it("counts each stage a lead passed through, not just where it ended", () => {
    const { overall } = computeFunnelMetrics([
      lead(["New", "Allocated", "Contacted", "Comp. Booked", "Not interested"]),
    ]);

    expect(overall).toEqual({ total: 1, contacted: 1, booked: 1, attended: 0, converted: 0 });
  });

  it("counts every earlier stage for a lead that skipped some", () => {
    // Allocated straight to Converted: it was contacted, booked and attended
    // in all but the clicks.
    const { overall } = computeFunnelMetrics([lead(["New", "Allocated", "Converted"])]);

    expect(overall).toEqual({ total: 1, contacted: 1, booked: 1, attended: 1, converted: 1 });
  });

  it("counts Said no and Agreed to check-in as contacted, but no further", () => {
    // Someone can say no on the very first call. Before this was handled, those
    // leads were missing from "contacted" and from the booking rate's base.
    const { overall } = computeFunnelMetrics([
      lead(["New", "Allocated", "Said no"]),
      lead(["New", "Allocated", "Agreed to check-in"]),
    ]);

    expect(overall).toEqual({ total: 2, contacted: 2, booked: 0, attended: 0, converted: 0 });
  });

  it("gives no progress for the exits on their own", () => {
    const { overall } = computeFunnelMetrics([
      lead(["New", "Allocated", "Unreachable"]),
      lead(["New", "Not interested"]),
    ]);

    expect(overall.contacted).toBe(0);
  });

  it("reads the current status as well as the history", () => {
    // A lead whose history row is missing still counts for where it is.
    const { overall } = computeFunnelMetrics([lead([], { status: "Attended" })]);

    expect(overall.attended).toBe(1);
  });
});

describe("by source", () => {
  it("lists sources in funnel order, warm first, and only those present", () => {
    const { bySource } = computeFunnelMetrics([
      lead(["New"], { lead_source: "own" }),
      lead(["New"], { lead_source: "unverified" }),
      lead(["New"], { lead_source: "form" }),
    ]);

    expect(bySource.map((s) => s.source)).toEqual(["form", "unverified", "own"]);
  });

  it("keeps an unexpected source rather than dropping it, so the rows sum to the total", () => {
    const leads = [
      lead(["New"], { lead_source: "gymmaster_sweep" }),
      lead(["New"], { lead_source: "walk_in" as FunnelLead["lead_source"] }),
      lead(["New"], { lead_source: "form" }),
    ];
    const { overall, bySource } = computeFunnelMetrics(leads);

    expect(bySource.map((s) => s.source)).toEqual(["form", "gymmaster_sweep", "walk_in"]);
    expect(bySource.reduce((sum, s) => sum + s.counts.total, 0)).toBe(overall.total);
  });
});

describe("contacted within 48 hours", () => {
  it("measures only leads with a recorded first contact, and counts the deadline itself as in time", () => {
    const { contactedWithin48h } = computeFunnelMetrics([
      lead(["Contacted"], { first_contacted_at: "2026-11-02T00:00:00Z" }),
      lead(["Contacted"], { first_contacted_at: "2026-11-03T00:00:00Z" }), // on the deadline
      lead(["Contacted"], { first_contacted_at: "2026-11-03T00:00:01Z" }), // one second late
      lead(["Allocated"]), // never contacted: not in the sample
    ]);

    expect(contactedWithin48h).toEqual({ within: 2, measured: 3 });
  });
});

describe("time to convert", () => {
  it("is the median in days from creation to the first Converted", () => {
    const converted = (days: number) =>
      lead([], {
        status: "Converted",
        status_history: [
          { new_status: "Converted", changed_at: new Date(Date.UTC(2026, 10, 1 + days)).toISOString() },
        ],
      });

    // One slow outlier does not drag the median the way it would a mean.
    const { timeToConvert } = computeFunnelMetrics([converted(2), converted(4), converted(60)]);

    expect(timeToConvert).toEqual({ medianDays: 4, count: 3 });
  });

  it("averages the middle two for an even count", () => {
    const converted = (days: number) =>
      lead([], {
        status: "Converted",
        status_history: [
          { new_status: "Converted", changed_at: new Date(Date.UTC(2026, 10, 1 + days)).toISOString() },
        ],
      });

    expect(computeFunnelMetrics([converted(2), converted(5)]).timeToConvert.medianDays).toBe(3.5);
  });

  it("uses the first time a lead converted if it converted twice", () => {
    const twice = lead([], {
      status: "Converted",
      status_history: [
        { new_status: "Converted", changed_at: "2026-11-11T00:00:00Z" },
        { new_status: "Converted", changed_at: "2026-11-04T00:00:00Z" },
      ],
    });

    expect(computeFunnelMetrics([twice]).timeToConvert.medianDays).toBe(3);
  });

  it("skips a Converted lead with no history row rather than counting it as instant", () => {
    const { timeToConvert } = computeFunnelMetrics([lead([], { status: "Converted" })]);

    expect(timeToConvert).toEqual({ medianDays: null, count: 0 });
  });
});

describe("rate", () => {
  it("is a fraction", () => {
    expect(rate(1, 4)).toBe(0.25);
  });

  it("is null rather than NaN or Infinity when there is nothing to divide by", () => {
    expect(rate(0, 0)).toBeNull();
    expect(rate(3, 0)).toBeNull();
  });
});

describe("an empty book", () => {
  it("returns zeros and nulls, not errors", () => {
    expect(computeFunnelMetrics([])).toEqual({
      overall: { total: 0, contacted: 0, booked: 0, attended: 0, converted: 0 },
      bySource: [],
      contactedWithin48h: { within: 0, measured: 0 },
      timeToConvert: { medianDays: null, count: 0 },
    });
  });
});
