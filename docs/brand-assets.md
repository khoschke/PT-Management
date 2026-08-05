# Brand assets

Traced, self-contained versions of the FITAZ GYM lockup, in `public/brand/`.

| File | Use |
|---|---|
| `fitaz-gym-logo.svg` | Primary. Dark ink, for light backgrounds. Scales to any size. |
| `fitaz-gym-logo.png` | Same, 1600px wide, transparent. For anywhere SVG is awkward. |
| `fitaz-gym-logo-white.svg` | Reversed. White wordmark, dark GYM on a white chip, for dark backgrounds. |
| `fitaz-gym-logo-white.png` | Same, 1600px wide, transparent. |

All four have a **transparent background**, so they sit on any colour. The PNGs
are RGBA with antialiased edges, not a white box.

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

**The chip is proportioned like the email header, not like `logo-fitaz.svg`.**
The original sets GYM at roughly 28% of the FITAZ size; the email header, and so
this trace, sets it at about 43%, which reads better at small sizes and in an
inbox. If you want the original proportion instead, say so and it can be
re-traced to match.

## Geometry

Sized from the email header at 4x: FITAZ at 120px with 24px tracking, the GYM
chip at 52px with 6px tracking, 36px and 20px of chip padding, a 16px corner
radius, and 40px between the wordmark and the chip. Ink is `#1d1d1f`, the same
foreground token as `src/app/globals.css`. The viewBox is trimmed to the ink
with 8px of padding, so the files have no dead margin to fight when placing them.
