# Member onboarding email

A separate flow from the PT nurture series in `docs/emails/`. This one is built
in **Designmodo Postcards** and covers getting a new member set up: the intro
video, the app, booking a first class, door access and the Facebook group.

`01-welcome-onboarding.html` is a corrected copy of the version sending on
19 August 2026.

## Postcards is the source of truth, not this file

This is an export, so **fixing it here fixes nothing on its own**. The next
export from Postcards will reintroduce every one of the problems below. Make
the same changes in the Postcards project, then re-export. This copy exists so
the corrected markup can be pasted straight into GymMaster in the meantime, and
so the fixes are written down somewhere they will not be lost.

## What was changed

### 1. The logo pointed at Designmodo

```
was:  <a href="https://designmodo.com/postcards">
now:  <a href="https://fitazgym.com">
```

The Postcards placeholder link was never replaced, so clicking the gym's own
logo took a member to Designmodo's marketing site. **In Postcards**: select the
logo, open its link setting, replace the URL.

### 2. Every image had an empty `alt`

Nine images, all `alt=""`. A good share of first opens block images, and six of
these are links, so a member with images off had no logo, no video link and no
app store buttons: nothing to click and nothing saying what was missing.

Alt text is now set on the six that carry meaning:

| Image | Alt |
|---|---|
| Header logo | `Fitaz Gym` |
| Video thumbnail | `Watch the Fitaz Gym introduction video` |
| App Store button | `Download on the App Store` |
| Google Play button | `Get it on Google Play` |
| Facebook icon | `Facebook` |
| Instagram icon | `Instagram` |

The other three keep `alt=""` **on purpose**. They are the hero image, the step 4
image and the Facebook screenshot, and nobody here has seen them: their URLs are
on Designmodo's CDN, which is unreachable from this environment. An empty alt is
the correct value for a decorative image, and inventing a description for a file
you cannot see is worse than leaving it blank. **If any of the three carries
information the copy does not already state, describe it in Postcards.**

### 3. The steps were numbered 1, 2, 2, 4, 5

There were two step 2s, "Download the Fitaz Gym App" and "Log in and book your
first class", and no step 3. The second one is now **Step 3**.

### 4. Small text fixes, made at the same time

- `Step 2-` had no space after the number.
- `No fobs required.Once you've` and `unlock the door.This will be` were missing
  the space after the full stop.

## Two things this copy is not

- **It is not byte-identical to the export.** The invisible spacer run after the
  preheader was regenerated rather than transcribed, and one empty grid block
  Postcards left in the footer was dropped. Neither renders anything.
- **It may be missing conditional comments.** If this HTML was copied out of a
  received email, Gmail will have stripped them. That matters for one reason,
  below.

## Still open, worth checking in Postcards

- **`mso-hide:all` on both buttons.** "Book your first class" and "Join Group"
  both carry it, which hides them in Outlook. Postcards normally pairs that with
  a VML fallback inside a conditional comment, and there is none in this copy,
  but see above: it may simply have been stripped in transit. **Check the
  Postcards source before assuming it is broken.** If there is no VML fallback,
  Outlook users cannot book a class.
- **No unsubscribe link.** The footer has the address and the social icons and
  nothing else. Same question as the nurture series: if this sends through
  GymMaster, the club template needs to supply one.
- **`min-width:600px`** on the outer table forces horizontal scrolling on a
  phone.
- **Three typefaces**: Raleway for the greeting, Poppins for body copy, Inter
  for the steps. The body ink is `#242527` here and `#1d1d1f` in the nurture
  series. Worth settling on one of each across both flows.
- **The logo file may be padded.** It is declared 140x35, a 4:1 ratio, where the
  official artwork in `public/brand/` is 7.56:1. Either it is a different
  variant, or it is the same lockup with empty space baked into the canvas, in
  which case it renders at about half the height it could. See
  `docs/brand-assets.md`.
