// Content model for the PT onboarding workbook. This is the single source
// both the PT view and Manager view render from, so the two can never say
// different things: only the *lens* changes (manager notes shown or hidden),
// never the underlying material.

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
  /** Paragraphs of body copy. A line starting with "- " renders as a bullet. */
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
