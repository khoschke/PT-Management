import type { OnboardingPart } from "../types";

// Part 10 content was not recoverable from the source PDF: the Drive
// extraction truncated after Part 9 (a known limitation on very large
// files), and no other copy in Drive contains it. This is a placeholder,
// not invented content — replace it wholesale once the real Part 10 text
// is available.
export const part10: OnboardingPart = {
  number: 10,
  slug: "growing-as-a-coach",
  title: "Growing as a Coach",
  intro:
    "This part's content wasn't recoverable from the source document yet — the workbook PDF's own table of contents promises it, but the text cut off after Part 9 during extraction. Nothing below is invented.",
  sections: [
    {
      heading: "This part is pending the source document",
      body: [
        "Every other part in this dashboard (1 through 9) is drawn faithfully from the Fitaz Gym PT Onboarding Workbook. Part 10, \"Growing as a Coach,\" is referenced in the workbook's own contents page and in the Directors Overview memo (\"...and growing as a professional\"), but the actual section text didn't come through — most likely a truncation artifact from converting a large PDF, rather than content that was never written.",
        "Once the full Part 10 text is available, this file will be replaced with the real content, matching the structure of the other nine parts exactly.",
      ],
    },
  ],
  pending: true,
};
