# Brand assets

Traced, self-contained versions of the FITAZ GYM lockup, in `public/brand/`.

## Three variants, pick one

They differ in two things: how tightly FITAZ is tracked, and how big the GYM
chip is relative to the wordmark.

| Variant | Files | Tracking | Chip |
|---|---|---|---|
| **A. Header lockup** | `fitaz-gym-logo.*` | 0.200em, wide | Large, centred on the caps |
| **B. Original chip** | `fitaz-gym-logo-classic-chip.*` | 0.200em, wide | Small, centred on the caps |
| **C. Original** | `fitaz-gym-logo-original.*` | 0.066em, tight | Small, hung at the top right |

**A** is what the welcome email uses today. **C** is a faithful trace of
`public/logo-fitaz.svg`, the mark as it was originally drawn. **B** is the
midpoint: the original's chip proportion on the header's wider tracking.

Each comes in four files: `.svg` and `.png` in dark ink for light backgrounds,
and `-white.svg` / `-white.png` reversed for dark ones. All have a
**transparent background**, so they sit on any colour. The PNGs are 1600px wide
RGBA with antialiased edges, not a white box.

If you only ever want one, take **C**: it is the actual brand mark. A is worth
keeping only because it reads better at inbox sizes, which is why the email
uses it.

## What actually differs

Worth knowing before choosing, because the chip is not the biggest difference:

- **Tracking.** The original tracks FITAZ at 0.066em. The email header tracks it
  at 0.200em, three times looser. At a glance that reads as a different mark
  more than the chip size does. Wide tracking holds up better at small sizes,
  which is why the header has it; the original is more confident at large sizes.
- **Chip size.** The original sets GYM at 28% of the FITAZ size, giving a chip
  about 60% of the cap height. The header sets it at 43%, giving a chip about
  90% of cap height.
- **Chip alignment.** The original hangs the chip at the **top** of the
  wordmark, its top edge just above the cap line and its bottom around the
  middle of the caps. The header centres it. This is easy to miss and is a real
  part of the original's character.

## What "traced" means here

`public/logo-fitaz.svg`, the original, sets the wordmark in **live text**
(`<text>` elements asking for Helvetica Neue). That renders correctly only on a
machine that has the font. Anywhere else it silently falls back to something
else, and the letter spacing and weight shift with it.

These four have the letterforms converted to **outlines**: every character is a
filled path, so there is no font to be missing and the mark is pixel identical
everywhere. That is what makes them safe to hand to a printer, drop into a deck,
or upload to a platform you do not control.

Keep the original around. Outlines cannot be re-typeset, so if the wordmark ever
needs different spacing or a different string, edit `logo-fitaz.svg` and
re-trace rather than trying to edit the paths.

## Two things worth knowing

**The letterforms are Liberation Sans, not Helvetica Neue.** Liberation Sans is
metrically compatible with Arial, which is the last fallback in the email's font
stack and therefore what the header actually renders as for most recipients. So
these match what members see. They are **not** an exact trace of Helvetica Neue:
if you have a licensed copy and want true brand fidelity, the trace should be
redone from it. The difference is subtle at a glance and real at large sizes.

**The trace is geometric, not a scan.** The letterforms come from the font
outlines and the chip from its measured proportions, so the marks are clean at
any size. What they are not is a pixel copy of a rendered image, which means
tiny differences from `logo-fitaz.svg` as your machine renders it are expected
and are down to the font substitution above.

## Geometry

All three are built at a common FITAZ size of 120px so they can be compared like
for like, with the chip padding, corner radius and gap derived as ratios rather
than hardcoded, so any of them can be rebuilt at another size without drift. Ink
is `#1d1d1f`, the same foreground token as `src/app/globals.css`. The viewBox is
trimmed to the ink with 8px of padding, so the files carry no dead margin to
fight when placing them.

Variant C reproduces `logo-fitaz.svg`'s own ratios: GYM at 0.283 of the FITAZ
size, chip padding of 0.95 and 0.38 of the GYM size, a corner radius of 0.114 of
the chip height, a gap of 0.81 of the cap height, and the chip's top edge
0.069 of the cap height above the cap line.
