// Content model for the PT onboarding workbook. This is the single source
// both the PT view and Manager view render from, so the two can never say
// different things: only the *lens* changes (manager notes shown or hidden),
// never the underlying material.
//
// Before editing any part file, read the "Never publish commercial terms into
// trainer-facing content" rule in CLAUDE.md. Everything below is read by
// self-employed trainers: prices, rates and business models are examples of
// what has worked for others, never requirements or Fitaz Gym policy.

export interface OnboardingActivity {
  /** Stable slug, unique within a part. Persisted as onboarding_responses.activity_key. */
  key: string;
  /** The reflective question or fill-in prompt, as written in the workbook. */
  prompt: string;
  /** Short placeholder shown in the empty input. */
  placeholder?: string;
  /** Long-form reflection gets a textarea; short facts (a name, a number) get a single-line input. */
  multiline?: boolean;
}

export interface OnboardingSection {
  heading: string;
  /**
   * Paragraphs of body copy, in order. Each entry is one block:
   *
   * - `"- item"` renders as a bullet; consecutive ones become one list.
   * - `"> line"` renders as a script, the words a PT can borrow verbatim
   *   (a phone opener, a text, the pricing line). Consecutive ones become
   *   one quote, so a two-part opener stays a single block.
   * - `"| A | B |\n| --- | --- |\n| 1 | 2 |"` renders as a table. Wide ones
   *   scroll inside their own container; the first column is a row label.
   * - `` `![alt](/path/to.png "optional caption")` `` renders as a figure, so
   *   a diagram sits at its exact spot in the flow the way it does in print.
   * - Anything else is a paragraph. `**bold**` works inside all of them.
   *
   * Figures and scripts live in `body` rather than in a manager-only field on
   * purpose: the workbook's diagrams and its scripts are trainer-facing.
   */
  body: string[];
  /** Zero or more fill-in activities tied to this section. */
  activities?: OnboardingActivity[];
  /** Reference links relevant to this section (external Drive docs, or internal app routes). */
  links?: OnboardingLink[];
  /**
   * Coaching note for whoever is guiding the trainer: how to use the section
   * in a 1:1, what to watch for. From the PT Manager Cheat Sheet's yellow
   * "Manager note" boxes. Shown only in Manager view.
   */
  managerNote?: string;
  /**
   * A model answer to this section's activity, in the voice of the example
   * trainer "Taylor". From the Cheat Sheet's blue "Worked example" boxes.
   * Shown only in Manager view, as something to hold up to a PT who's stuck.
   */
  workedExample?: string;
}

export interface OnboardingLink {
  label: string;
  url: string;
}

export interface OnboardingPart {
  number: number;
  slug: string;
  title: string;
  intro: string;
  sections: OnboardingSection[];
  links?: OnboardingLink[];
  /** True while this part's content is still a placeholder pending source material. */
  pending?: boolean;
}
