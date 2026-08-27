# Brand assets

The official Fitaz Gym artwork lives in this repo, and there is now a faithful
vector of it. An older set of Liberation Sans traces predates both.

| | |
|---|---|
| `public/brand/fitaz-gym-logo.svg` | **The mark. Use this.** A faithful vector, traced from the official artwork below. Sharp-apex A, rounded chip, correct proportions. This is what the app now renders. |
| `public/brand/fitaz-gym-logo-white.svg` | Same mark, reversed for dark backgrounds. |
| `public/brand/fitaz-gym-logo-official.png` | The real raster logo the vector was traced from. Black lockup, transparent, 1924 x 251. |
| `public/brand/source/fitaz-gym-logo-official.pdf` | The file Karl supplied, unmodified. |
| `public/brand/fitaz-gym-logo-email*.svg` / `.png`, and the old `-official`-less `.png` | **Older Liberation Sans traces.** Superseded, see below. |

## The faithful vector (added 27 August 2026)

`fitaz-gym-logo.svg` is a new, accurate vector of the official mark. It replaces
the Liberation Sans trace that used to carry this filename, and it closes the gap
this file used to describe: previously the only vector we had was the wrong-font,
wrong-chip trace, so anything needing scale beyond the raster had no good option.

How it was made, so it can be regenerated if the artwork ever changes:

- **Source.** The higher-resolution `fitaz-gym-logo-official.png` (1924 x 251),
  not the PDF. The PDF's embedded raster is only 922 x 122 and, tellingly, has
  the chip corners squared off; the PNG preserves them rounded, so it is the
  truer master.
- **FITAZ letters.** The alpha channel was upscaled 3x with a sharp (Lanczos)
  filter and auto-traced (potrace). FITAZ is entirely straight lines, so the
  edges come out dead straight and the A keeps its sharp apex. The chip region
  is masked out of this pass.
- **The chip.** Not traced. Emitted as a real rounded `<rect>`, with its edges
  measured to sub-pixel off the PNG and a corner radius of 11px on a 144.5px
  chip, i.e. **0.076 of chip height**, matching the measurement recorded further
  down this file. Tracing squared the small radius off, so a primitive is both
  cleaner and more accurate.
- **GYM.** The white lettering, traced from the colour channel and laid over the
  chip.
- **Ink.** `#0a0a0a`, to match the near-black of the official artwork
  (`rgb(4,4,4)`), rather than the `#1d1d1f` UI foreground token. The logo is its
  own asset; matching the original wins over matching the token here.

Verified by overlaying the render on the official PNG: the binarised shapes
differ by under 1% (essentially anti-aliasing), and the A diagonals and GYM
letters are indistinguishable at high magnification.

## Where the official artwork came from

Karl supplied it on 18 August 2026 as a Google Drive PDF, "Untitled design.pdf".
It was extracted here rather than re-drawn: the two pages each hold a 1080 x 1080
image plus a matching alpha mask, and the PNGs above are those images composited
and trimmed to the ink. Page one is the black lockup, page two the reversed one.

**Correcting an earlier note in this file.** It previously said the PDF was
vector and named its own typeface, on the strength of a text extraction that
returned `FITAZ`, `GYM`, `GYM`. That was wrong. The PDF contains **no fonts at
all** and no vector paths, only the two raster images. The strings came from the
document's structure tree, not from live text. Checking Document Properties then
Fonts, as this file previously advised, will show nothing.

So the typeface is still unidentified, and a raster is all we have. That is
enough for most uses at the sizes we need, and not enough to regenerate the mark
at arbitrary size. **The face was set in Canva** (`xmp:CreatorTool`), so the
quickest route to a name is opening the original Canva design and clicking the
text, not forensics on the export.

## How the traces differ from the real thing

Measured off the official artwork, not judged by eye. Proportions are given
against the FITAZ cap height so they hold at any size.

| | Official | Our trace |
|---|---|---|
| Chip corners | Rounded, radius **0.076** of chip height | Rounded, radius 0.114 of chip height |
| Chip top edge | **Flush with the cap line** | 0.069 of cap height above it |
| Gap, wordmark to chip | **0.197** of cap height | 0.81 of cap height |
| Chip height | **0.582** of cap height | 0.283 of the FITAZ size |
| Letterforms | Geometric sans, sharp-apex A | Liberation Sans |

The gap is the one that will read as wrong to anyone who knows the mark: ours
sets the chip four times further out than it belongs.

**Correcting an earlier row in this table.** It said the official chip had
**square** corners and called that the most obvious mismatch. That was wrong.
The chip is rounded, at roughly 0.076 of its own height. The error was in how it
was measured: the first check walked the corner diagonally, and a diagonal exits
a small radius in a single step, so a rounded corner reads as square. Measuring
the horizontal inset along the top edge, at the higher resolution below, gives
11px of inset on a 145px chip. Our trace is still too round, at 0.114, but it is
wrong by degree rather than in kind.

**Use `fitaz-gym-logo.svg` from here on** (see the faithful-vector section
above). It is now both the accurate mark and vector, so it is the right file
everywhere, including where a mark has to scale beyond 1924px. The
`fitaz-gym-logo-official.png` remains as the raster master it was traced from.
The old Liberation Sans traces are kept only for reference. Nothing in the
member emails depends on any of them, since the email header and footer were
removed in favour of GymMaster's club template.

## The best copy came from the Postcards email, not the PDF

Karl uploaded the logo file used in the Postcards onboarding email on 19 August
2026, saved as `public/brand/source/postcards-header-logo.png`. It turns out to
be **the same lockup at more than twice the resolution** of the version
extracted from the PDF, so `fitaz-gym-logo-official.png` is now built from it:
1924 x 251 rather than 922 x 122.

Same mark, confirmed by proportion rather than by eye:

| | Postcards PNG | PDF extraction |
|---|---|---|
| FITAZ, share of total width | 0.792 | 0.798 |
| Gap | 0.035 | 0.026 |
| Chip | 0.174 | 0.176 |
| Chip height, share of cap height | 0.578 | 0.582 |
| Chip top edge | flush | flush |

### It is half empty, and that is why it looks small in the email

The uploaded file is a 2000 x 500 canvas, but the artwork inside it is only
1924 x 251, sitting in the vertical middle with about 125px of nothing above and
below. **The ink fills 96% of the width and 50% of the height.**

The Postcards email displays it at 140px wide, so the mark renders about 18px
tall inside a 35px box. Cropping alone does not make it bigger, it just removes
the dead space. To get a larger mark the width has to go up as well:

| Wanted height | Set the width to |
|---|---|
| 18px (what it does now) | 138px |
| 24px | 184px |
| 30px | 230px |

`fitaz-gym-logo-official.png` is already cropped, so it is the file to upload
back into Postcards. Our own email masthead ran at about 30px before it was
removed, which is the sensible target.

**There is no reversed variant on purpose.** One was extracted from the PDF and
then removed on 19 August 2026: it was a second file to keep in sync for
something that is a colour change on a black-and-transparent PNG. If a dark
background needs the mark in white, recolour from
`fitaz-gym-logo-official.png` at the point of use rather than adding a file
back here.

## One of the supplied PNGs is empty. Do not use it.

The Drive file named **"Fitaz Gym Logo Black Transparent Background.png"**
(`1NhXJOkNkdNnkOuhR7kWmHXZpv__xKemi`, 1080 x 1080, RGBA, 20,061 bytes) contains
**no artwork at all**. This is not a guess from looking at it: the file was
decoded and its pixels inspected directly. Every one of the 1,035 scanlines that
could be recovered is fully transparent, alpha zero, edge to edge. Its embedded
XMP title is `GYM - 1`, and its author field says `FitazFK Gym`, so it looks
like a real export that simply rendered nothing.

The filename is the trap here. It reads like the definitive asset, so it is the
one anybody would reach for first. **Delete it at source or rename it**, because
the next person to go looking will pick it for the same reason we did.

![The two marks](brand-logo-comparison.png)

## The traces: which one, if you need one

Everything below describes the old Liberation Sans traced marks. The faithful
vector (`fitaz-gym-logo.svg`, section near the top) now supersedes them for the
brand mark; the notes here survive because the **email** variants are still these
traces, and because the history is worth keeping. These sit on
`public/logo-fitaz.svg`: tight 0.066em tracking on FITAZ, a small GYM chip hung
at the top right rather than centred. Their chip proportions are the ones the
table above marks as wrong, which is exactly why the brand mark was re-traced.

| File | Use |
|---|---|
| `fitaz-gym-logo.svg` | **No longer a trace.** This filename now holds the faithful vector. |
| `fitaz-gym-logo.png` / `fitaz-gym-logo-white.png` | Old Liberation Sans raster traces. Reference only. |
| `fitaz-gym-logo-email.svg` / `.png` | **Email headers only.** Still a Liberation Sans trace. See below. |
| `fitaz-gym-logo-email-white.svg` / `.png` | Same, reversed. |

All have a **transparent background**, so they sit on any colour. The PNGs are
1600px wide RGBA with antialiased edges, not a white box. The SVGs scale to any
size.

## Why there is a separate email mark

The email header uses a deliberately different lockup: FITAZ tracked three times
looser at 0.200em, and a chip roughly 90% of the cap height rather than 60%,
centred rather than hung at the top.

That is not a second brand. It is the same mark adjusted to survive being about
30px tall in an inbox, where the brand mark's tight tracking closes up and its
small chip stops being legible. Anywhere the mark is bigger than an email
header, the brand mark is the right one.

Do not introduce a third variant. If a new context needs something in between,
change one of these two rather than adding to the set.

## What "traced" means here

`public/logo-fitaz.svg`, the original, sets the wordmark in **live text**
(`<text>` elements asking for Helvetica Neue). That renders correctly only on a
machine that has the font. Anywhere else it silently falls back to something
else, and the letter spacing and weight shift with it.

These have the letterforms converted to **outlines**: every character is a
filled path, so there is no font to be missing and the mark is identical
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

Both are built at a common FITAZ size of 120px, with chip padding, corner radius
and gap derived as ratios rather than hardcoded, so either can be rebuilt at
another size without drift. Ink is `#1d1d1f`, the same foreground token as
`src/app/globals.css`. The viewBox is trimmed to the ink with 8px of padding, so
the files carry no dead margin to fight when placing them.

The brand mark reproduces `logo-fitaz.svg`'s own ratios: GYM at 0.283 of the
FITAZ size, chip padding of 0.95 and 0.38 of the GYM size, a corner radius of
0.114 of the chip height, a gap of 0.81 of the cap height, and the chip's top
edge 0.069 of the cap height above the cap line.
