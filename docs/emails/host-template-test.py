"""Render an email inside a hostile host template, to catch alignment loss.

GymMaster pastes our HTML into its club template, and that template brings
its own stylesheet. Any CSS rule it carries beats a presentational attribute
like align= or valign=, because those map to the lowest priority in the
cascade. Inline style= does not lose, so anything whose position matters has
to say it inline as well as in the attribute.

This wraps a template in the rules a club template most plausibly sets and
renders it, so the failure shows up here rather than in someone's inbox.

    python3 host-template-test.py cms-safe/01-welcome-nurture.html out.png

Requires Chromium. Check the numbered discs (digit centred, disc level with
the heading) and the line under the first button (centred).
"""
import subprocess
import sys
import tempfile
import os

# Modelled on what GymMaster actually does, not on what seemed plausible.
# The !important on p is the important part: on 19 August 2026 GymMaster left
# three paragraphs left aligned that carried an inline text-align:center, and
# nothing but !important in a host stylesheet can beat an inline style. Anything
# that has to be centred must therefore not be a <p> at all.
HOSTILE = """<style>
  td { text-align: left; vertical-align: middle; line-height: 1.6; }
  p  { text-align: left !important; margin: 0 0 10px 0 !important; }
  span { line-height: 1.6; }
</style>"""

CHROME_CANDIDATES = [
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    '/opt/pw-browsers/chromium/chrome-linux/chrome',
    'chromium', 'chromium-browser', 'google-chrome',
]


def chrome() -> str:
    for c in CHROME_CANDIDATES:
        if os.path.exists(c) or subprocess.run(['which', c],
                                               capture_output=True).returncode == 0:
            return c
    sys.exit('No Chromium found; set one of CHROME_CANDIDATES.')


def main() -> None:
    src, out = sys.argv[1], sys.argv[2]
    html = open(src, encoding='utf-8').read().replace('</head>', HOSTILE + '\n</head>')
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False,
                                     encoding='utf-8') as f:
        f.write(html)
        tmp = f.name
    subprocess.run([chrome(), '--headless', '--disable-gpu', '--no-sandbox',
                    '--hide-scrollbars', '--force-device-scale-factor=2',
                    '--window-size=640,3200', f'--screenshot={out}',
                    f'file://{tmp}'], capture_output=True)
    os.unlink(tmp)
    print(f'{out}: rendered {src} inside a hostile host template')


if __name__ == '__main__':
    main()
