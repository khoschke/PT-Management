# Test variants

Not for sending. These exist to answer a specific question about how GymMaster
renders something, and each one should either be promoted into the main series
or deleted once the question is settled.

Generate the CMS-safe twin the same way as the real ones, never by hand:

```
python3 ../make-cms-safe.py 01-welcome-nurture-plain-discs.html \
                            01-welcome-nurture-plain-discs.cms-safe.html
```

## `01-welcome-nurture-no-discs`, `02-plan-not-motivation-no-discs`

Emails 1 and 2 with the numbered discs removed altogether: no circles, no
digits, no indent column. The three steps are now just a heading and a
paragraph each, at the same left margin as the rest of the email.

Asked for on 19 August 2026, after two earlier attempts failed in GymMaster.

### How this got here, so nobody tries the failed routes again

1. **Numbered discs, hardened.** Inline `text-align`, `vertical-align` and
   `line-height` added alongside the attributes, so a host stylesheet could not
   beat them. Still came out wrong in GymMaster.
2. **Plain discs, no digits.** The digit was the fragile part, so it went, and
   the disc became a cell with a background and fixed dimensions. It passed
   `../host-template-test.py`, but was rejected before testing in GymMaster.
3. **No discs.** What is here now.

Each step removed something that could break. The third removes the last of it:
there is no cell whose height, alignment or radius has to survive anything,
only text in paragraphs, which is the one thing every renderer in this project
has handled correctly all along.

### If the numbering is wanted back

**Not in a disc.** Put it in the heading text:

> **1. You tell us what you want**

Ordinary copy in an already left-aligned paragraph. No host stylesheet can move
it, and it survives everything a disc does not.

### Before promoting

These are variants, not the series. If GymMaster renders them correctly, they
replace the disc versions in `../01-welcome-nurture.html` and
`../02-plan-not-motivation.html`, the CMS-safe files get regenerated, and this
directory empties. Email 3 has no discs and needs no change.
