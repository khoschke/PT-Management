import { describe, expect, it } from "vitest";

import { onboardingParts } from "./content";
import shippedKeys from "./activity-keys.json";

// Every workbook activity's `key` is persisted as
// onboarding_responses.activity_key. Rename or remove one and the answers
// trainers already saved under it stop showing, with no error anywhere: the
// row is still in the database, it just matches nothing on the page.
//
// activity-keys.json lists every key that has shipped, as `part:key`. On
// 19 Nov 2026 all 94 keys with saved answers on live were in it. Adding an
// activity is fine, and you should add its key to the list. Removing a key
// from the list is a decision to orphan answers: check onboarding_responses
// for that key first.

const current = onboardingParts.flatMap((part) =>
  part.sections.flatMap((section) =>
    (section.activities ?? []).map((activity) => `${part.number}:${activity.key}`),
  ),
);

describe("workbook activity keys", () => {
  it("still has every key that has shipped, so no saved answer is orphaned", () => {
    const missing = shippedKeys.filter((key) => !current.includes(key));

    expect(missing, "These keys were renamed or removed. Answers saved under them will vanish.").toEqual(
      [],
    );
  });

  it("lists every current key, so a new one is protected from the day it ships", () => {
    const unlisted = current.filter((key) => !shippedKeys.includes(key));

    expect(unlisted, "Add these to src/lib/onboarding/activity-keys.json.").toEqual([]);
  });

  it("never repeats a key within a part, where two activities would share one answer", () => {
    const duplicates = current.filter((key, i) => current.indexOf(key) !== i);

    expect(duplicates).toEqual([]);
  });

  it("uses keys that are plain slugs", () => {
    const odd = current.filter((key) => !/^\d+:[a-z0-9]+(-[a-z0-9]+)*$/.test(key));

    expect(odd).toEqual([]);
  });
});

describe("workbook parts", () => {
  it("numbers the parts 1 to 10 in order, since progress is saved by part number", () => {
    expect(onboardingParts.map((p) => p.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("gives every part its own address", () => {
    const slugs = onboardingParts.map((p) => p.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
