# Handoff: Apple-Grade Design Pass

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

## The brief (from the gym owner)

"Push UI and UX boundaries. Match Apple's design thinking. Think like the head
of UI and UX at Apple." Take that literally. The app is currently clean and
"Apple-adjacent"; the job is to make it genuinely Apple-grade.

## Operating principles (how Apple's design team would approach it)

- **Content first, not decoration.** Ruthless visual hierarchy; one clear
  primary action per screen; remove anything that isn't earning its place.
- **Whitespace and rhythm.** Generous, consistent spacing on a real grid.
  Let things breathe.
- **A true type scale.** Deliberate sizes/weights/leading, optical alignment,
  tight tracking on headlines. Not ad-hoc font sizes.
- **Motion with meaning.** Nothing animates unless it communicates (state
  change, spatial relationship). Fast, soft, cubic-bezier easing. No motion for
  motion's sake.
- **The details that are felt, not seen.** Press states, focus rings,
  hover/active feedback, loading/skeleton states, thoughtful empty states, and
  error copy that sounds like a person.
- **Accessibility is design.** Contrast, hit targets, keyboard focus, reduced-motion.

## Scope & priority order

1. **The public form (`/pt-session`)** — first impression, member-facing, and
   polish here lifts completion rate. Do this first and set the bar.
2. **The lead board + detail panel (`/admin`)** — the daily driver.
3. **Trainers, Staff screens.**
4. Login.

## Constraints (respect the existing decisions)

- `/admin` and `/pt-session` stay **monochrome black-and-white** (brand). Elevate
  within that constraint — restraint is the point, not adding colour.
- Design tokens live in `src/app/globals.css`. Extend the system; don't scatter
  one-off values.
- **Leave the `/onboarding` area's separate `.onboarding-scope` theme alone**
  unless asked — it's an intentionally distinct visual layer with its own
  light/dark palette.
- Keep Australian English, no em dashes in user-facing copy.

## Way of working

- Move screen by screen; refine the shared components (buttons, inputs, cards,
  badges, pills) so improvements compound.
- **Verify every change in a real browser and screenshot it** (mobile + desktop)
  — thoroughness is explicitly preferred here over speed.
- `npm run build` + `tsc --noEmit` + `lint` clean before every push.

## Definition of done

Each screen reads as one considered system: confident hierarchy, consistent
spacing/type, purposeful motion, and polished states — the kind of quality that
would survive a review by an Apple design lead.
