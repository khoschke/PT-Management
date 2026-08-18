# Brand assets

The official Fitaz Gym artwork now lives in this repo, alongside a set of
traced marks that predate it.

| | |
|---|---|
| `public/brand/fitaz-gym-logo-official.png` | **The real logo.** Black lockup, transparent, 922 x 122. |
| `public/brand/fitaz-gym-logo-official-white.png` | Same, reversed for dark backgrounds. |
| `public/brand/source/fitaz-gym-logo-official.pdf` | The file Karl supplied, unmodified. |
| `public/brand/fitaz-gym-logo*.svg` / `.png` | **Traces.** Superseded, see below. |

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
| Chip corners | **Square**, a plain rectangle | Rounded, radius 0.114 of chip height |
| Chip top edge | **Flush with the cap line** | 0.069 of cap height above it |
| Gap, wordmark to chip | **0.197** of cap height | 0.81 of cap height |
| Chip height | **0.582** of cap height | 0.283 of the FITAZ size |
| Letterforms | Geometric sans, sharp-apex A | Liberation Sans |

The gap is the one that will read as wrong to anyone who knows the mark: ours
sets the chip four times further out than it belongs.

**Use `fitaz-gym-logo-official.png` from here on.** The traces are kept because
they are vector and the official is not, so they remain the only option where a
mark has to scale beyond 922px wide. Anywhere else they are the wrong file.
Nothing in the member emails depends on either, since the email header and
footer were removed in favour of GymMaster's club template.

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

Everything below describes the traced marks, which the official artwork now
supersedes. Reach for them only when you need vector, or a size beyond 922px.

**Of the traces, use `fitaz-gym-logo.svg`.** It follows `public/logo-fitaz.svg`:
tight 0.066em tracking on FITAZ, a small GYM chip hung at the top right rather
than centred. Note that its chip proportions are the ones the table above marks
as wrong.

| File | Use |
|---|---|
| `fitaz-gym-logo.svg` / `.png` | **The brand mark.** Default for everything. |
| `fitaz-gym-logo-white.svg` / `.png` | Same, reversed for dark backgrounds. |
| `fitaz-gym-logo-email.svg` / `.png` | **Email headers only.** See below. |
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
