"""Produce a CRM-safe variant of an email template.

GymMaster is corrupting the HTML and the buttons lose their position. The
cause is that the buttons depend on two things a CRM editor routinely throws
away: the <style> block (which carries the centring and the width rules via
classes) and the conditional comments (which carry the Outlook button). Strip
both and a padded inline-block anchor has nothing left holding it in place.

This rewrites the template so there is nothing left to strip:

  - no <style> block, no classes, everything inline
  - no conditional comments, so no VML
  - buttons become a <table><td bgcolor> with the padding on the cell, which
    is the most sanitiser-proof button there is: it survives on plain HTML
    attributes rather than CSS
  - bgcolor attributes added alongside every background-color, because
    attributes survive sanitising when styles do not
"""
import re
import sys

FONT = "'Helvetica Neue',Helvetica,Arial,sans-serif"


def convert(src: str) -> str:
    h = src

    # 1. Namespaces and the Office settings block are only there for VML.
    h = h.replace(' xmlns:v="urn:schemas-microsoft-com:vml"', '')
    h = h.replace(' xmlns:o="urn:schemas-microsoft-com:office:office"', '')

    # 2. Conditional comments.
    #    Keep only the mso block that carries the plain-text goal list (it is
    #    the one with interpunct separators). Everything else in an mso block
    #    is either VML or the Outlook wrapper table, and unwrapping a wrapper
    #    would leave an unclosed <table> and destroy the layout.
    #    Drop every mso block. They hold VML buttons, the Outlook wrapper
    #    table and the plain-text goal fallback. Unwrapping a wrapper would
    #    leave an unclosed <table> and destroy the layout, and with VML gone
    #    the fallback has nothing to fall back from.
    h = re.sub(r'<!--\[if mso\]>.*?<!\[endif\]-->', '', h, flags=re.S)

    #    Keep everything in the downlevel-revealed blocks: the real buttons
    #    and the real goal pills.
    h = re.sub(r'<!--\[if !mso\]><!-->(.*?)<!--<!\[endif\]-->', lambda m: m.group(1), h, flags=re.S)

    # 3. The <style> block and every class that depended on it.
    h = re.sub(r'<style.*?</style>', '', h, flags=re.S)
    h = re.sub(r'\s+class="[^"]*"', '', h)

    # 4. Buttons: padded anchor -> table cell with the padding on the cell.
    def button(m):
        start = m.start()
        # Inherit the alignment of the cell the button sits in.
        before = h[max(0, start - 600):start]
        aligns = re.findall(r'<td[^>]*\salign="(left|center|right)"', before)
        # Only ever set align for centring. align="left" makes the table float,
        # and the caption underneath then wraps up alongside the button.
        align = ' align="center"' if (aligns and aligns[-1] == 'center') else ''
        href, label = m.group('href'), m.group('label').strip()
        return (
            f'<table role="presentation" border="0" cellpadding="0" cellspacing="0"{align}>\n'
            f'                <tr>\n'
            f'                  <td align="center" bgcolor="#1d1d1f" style="background-color:#1d1d1f; '
            f'border-radius:999px; padding:19px 40px;">\n'
            f'                    <a href="{href}" target="_blank" rel="noopener" '
            f'style="color:#ffffff; font-family:{FONT}; font-size:17px; font-weight:600; '
            f'line-height:17px; letter-spacing:-0.2px; text-decoration:none; display:inline-block;">'
            f'{label}</a>\n'
            f'                  </td>\n'
            f'                </tr>\n'
            f'              </table>'
        )
    h = re.sub(
        r'<a href="(?P<href>[^"]+)"[^>]*border-radius:999px;[^>]*>\s*(?P<label>[^<]+?)\s*</a>',
        button, h)

    # 5. bgcolor alongside every background-color, on tables and cells.
    def bg(m):
        tag = m.group(0)
        if 'bgcolor=' in tag:
            return tag
        c = re.search(r'background-color:\s*(#[0-9a-fA-F]{6})', tag)
        if not c:
            return tag
        return tag[:-1] + f' bgcolor="{c.group(1)}">'
    h = re.sub(r'<(?:td|table)[^>]*background-color:[^>]*>', bg, h)

    # 6. Tidy the blank lines the stripping leaves behind.
    h = re.sub(r'\n[ \t]*\n[ \t]*\n+', '\n\n', h)
    return h


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    out = convert(open(src).read())
    open(dst, 'w').write(out)
    print(f"{dst}: {len(out)} bytes")
