# Test variants

Not for sending. These exist to answer a specific question about how GymMaster
renders something, and each one should either be promoted into the main series
or deleted once the question is settled.

Generate the CMS-safe twin the same way as the real ones, never by hand:

```
python3 ../make-cms-safe.py 01-welcome-nurture-plain-discs.html \
                            01-welcome-nurture-plain-discs.cms-safe.html
```

## `01-welcome-nurture-plain-discs`

Email 1 with the digits taken out of the numbered discs, leaving plain filled
circles. Asked for on 19 August 2026, after the hardened numbered version still
came out wrong in GymMaster.

**Why this one should hold where the numbered version did not.** The digit was
the fragile part. Centring it depended on `text-align` and `line-height`
surviving the club template's stylesheet, and it is now clear that at least one
of them does not. With no digit there is nothing to centre: the disc is a cell
with a background, a border radius and fixed dimensions, and its height is held
by the `height` attribute and the inline `height` together. `line-height:0`
inline stops a host template's own font size from growing the cell.

Confirmed against `../host-template-test.py`: the discs stay round, evenly
sized and level with their headings under the same rules that reproduced the
photographed bug.

**What it costs.** The steps no longer say they are steps 1, 2 and 3. Reading
order still carries the sequence, and the headings are written to be read in
order, so little is lost. If the numbering is wanted back, **do not put it back
in the disc**. Put it in the heading text instead:

> **1. You tell us what you want**

That is ordinary body copy in a paragraph that is already left aligned, so no
host stylesheet can move it, and it survives everything a disc does not.
