// Shared interaction tokens for the ops tool. Using an outline (rather than a
// ring with a fixed offset colour) keeps the keyboard focus indicator legible
// whatever background a control sits on, white card or grey page.

export const focusRing =
  "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

// For labels wrapping an sr-only checkbox/radio (chips, toggles): the whole
// pill takes the outline when its hidden control is focused via keyboard.
export const focusRingWithin =
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground";
