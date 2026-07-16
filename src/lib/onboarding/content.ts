import type { OnboardingPart } from "./types";
import { part1 } from "./parts/part1";
import { part2 } from "./parts/part2";
import { part3 } from "./parts/part3";
import { part4 } from "./parts/part4";
import { part5 } from "./parts/part5";
import { part6 } from "./parts/part6";
import { part7 } from "./parts/part7";
import { part8 } from "./parts/part8";
import { part9 } from "./parts/part9";
import { part10 } from "./parts/part10";

export const onboardingParts: OnboardingPart[] = [
  part1,
  part2,
  part3,
  part4,
  part5,
  part6,
  part7,
  part8,
  part9,
  part10,
];

export function getPartByNumber(n: number): OnboardingPart | undefined {
  return onboardingParts.find((p) => p.number === n);
}

export function getPartBySlug(slug: string): OnboardingPart | undefined {
  return onboardingParts.find((p) => p.slug === slug);
}

export function totalActivityCount(part: OnboardingPart): number {
  return part.sections.reduce((sum, s) => sum + (s.activities?.length ?? 0), 0);
}

export const TOTAL_PARTS = onboardingParts.length;
