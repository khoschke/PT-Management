# CMS-safe variants

Generated from the templates one directory up. **Do not edit these by hand.**
Edit the originals in `docs/emails/`, then regenerate:

```
python3 docs/emails/make-cms-safe.py docs/emails/01-welcome-nurture.html \
        docs/emails/cms-safe/01-welcome-nurture.html
```

## Why these exist

GymMaster was corrupting the pasted HTML, with the buttons losing their
position. That is a specific, diagnosable failure, and it is not really about
where the HTML came from.

The buttons in the full templates rest on two things a CRM editor routinely
throws away:

- **The `<style>` block.** 4.4KB of CSS carrying the mobile rules, the dark mode
  and the class-based layout hooks. Strip it and every `class=` in the file
  becomes dead weight.
- **The conditional comments.** These wrap the Outlook button and, importantly,
  the Outlook-only wrapper table that centres the whole email. A sanitiser that
  mishandles them can leave an unbalanced table, which is exactly what "the
  buttons move" looks like from the outside.

On top of that the button itself was a `display:inline-block` anchor with its
own padding, centred by its parent. That is the fragile pattern: three separate
things have to survive for it to sit where it should.

## What is different here

Nothing is left to strip.

- **No `<style>` block, no classes.** Everything is inline.
- **No conditional comments, so no VML.**
- **Buttons are a `<table>` with the padding on a `<td bgcolor>`.** This is the
  most sanitiser-proof button there is: it stands up on plain HTML attributes
  rather than CSS, and Outlook honours cell padding natively, so it does not
  need VML to look right.
- **`bgcolor` attributes alongside every `background-color`.** Attributes tend
  to survive sanitising when style declarations do not.
- **No `align="left"` on the button tables.** That was a real bug during the
  conversion: `align` makes a table float, and the caption underneath wraps up
  alongside the button. Alignment is only ever set for centring.

Verified by stripping **every** `style` attribute and rendering what was left.
The full template collapses to a bare blue link on a white page. This version
keeps its filled button, its grey canvas, its white cards and its number
badges, because all of that now rides on attributes.

## What you give up

Worth being straight about, since these are a fallback and not an upgrade:

- **No dark mode control.** Mail clients will auto-invert, and our brand is
  black on white, which is what they handle worst. Use these only if the full
  template genuinely cannot go in.
- **No mobile media queries.** The layout is fluid enough to hold up, but the
  buttons no longer go full width on small screens.
- **Square buttons in Outlook.** `border-radius` needs VML there, and VML needs
  the conditional comments we removed.

So: **try the full template first.** If GymMaster has a raw HTML or source
import, rather than a rich text paste, the full version should go in intact and
these are unnecessary. Only fall back to these if it does not.
