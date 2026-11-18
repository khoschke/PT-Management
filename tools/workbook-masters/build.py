import re, sys
from xml.sax.saxutils import escape
exec(open(__import__('os').path.join(__import__('os').path.dirname(__file__), 'split.py')).read())
ns = {}
exec(open(__import__('os').path.join(__import__('os').path.dirname(__file__), 'part7_content.py')).read(), ns)
C = ns['C']
mode = sys.argv[1] if len(sys.argv) > 1 else 'manager'   # manager | trainer
src = sys.argv[2] if len(sys.argv) > 2 else 'unpacked/word/document.xml'
x = open(src).read()
pre, els, post = split(x)

RPR = '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>{b}<w:i w:val="0"/><w:color w:val="{c}"/><w:sz w:val="22"/></w:rPr>'
def curly(t):
    return t.replace("'", "’")
def run(text, bold=False, color='222222'):
    t = escape(curly(text))
    sp = ' xml:space="preserve"' if (t != t.strip() or '  ' in t) else ''
    return '<w:r>' + RPR.format(b='<w:b/>' if bold else '<w:b w:val="0"/>', c=color) + f'<w:t{sp}>{t}</w:t></w:r>'
def md_runs(text, color='222222'):
    parts = re.split(r'(\*\*[^*]+\*\*)', text)
    return ''.join(run(p[2:-2], True, color) if p.startswith('**') else run(p, False, color) for p in parts if p)
def para(inner, ppr=''):
    return f'<w:p>{("<w:pPr>"+ppr+"</w:pPr>") if ppr else ""}{inner}</w:p>'
SPACER = '<w:p><w:pPr><w:spacing w:after="40"/></w:pPr></w:p>'
def h1(t):
    return f'<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:spacing w:before="320" w:after="120"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="111111"/></w:rPr><w:t>{escape(curly(t))}</w:t></w:r></w:p>'
def h2(t):
    return f'<w:p><w:pPr><w:pStyle w:val="Heading2"/><w:spacing w:before="200" w:after="80"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="222222"/></w:rPr><w:t>{escape(curly(t))}</w:t></w:r></w:p>'
def bullet(label, text):
    inner = (run('•  ' + label, True) + run(text)) if label else run('•  ' + text)
    return para(inner, '<w:spacing w:after="60"/><w:ind w:left="280"/>')
def dialogue(lines):
    inner = '<w:r><w:br/></w:r>'.join(run(l) for l in lines)
    return para(inner)
def box(title, text, fill):
    return ('<w:tbl><w:tblPr><w:tblW w:type="auto" w:w="0"/><w:jc w:val="left"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblLook w:firstColumn="1" w:firstRow="1" w:lastColumn="0" w:lastRow="0" w:noHBand="0" w:noVBand="1" w:val="04A0"/></w:tblPr><w:tblGrid><w:gridCol w:w="9964"/></w:tblGrid><w:tr><w:tc><w:tcPr><w:tcW w:type="dxa" w:w="9964"/>'
            f'<w:shd w:val="clear" w:color="auto" w:fill="{fill}"/><w:tcMar><w:top w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar></w:tcPr>'
            + para(run(title, True, '111111') + '<w:r><w:br/></w:r>' + run(text), '<w:spacing w:after="0"/>') + '</w:tc></w:tr></w:tbl>')
MAR = '<w:tcMar><w:top w:w="60" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:left w:w="110" w:type="dxa"/><w:right w:w="110" w:type="dxa"/></w:tcMar>'
def table(widths, rows):
    grid = ''.join(f'<w:gridCol w:w="{w}"/>' for w in widths)
    out = ('<w:tbl><w:tblPr><w:tblW w:type="auto" w:w="0"/><w:jc w:val="left"/><w:tblBorders>'
           + ''.join(f'<w:{s} w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>' for s in ['top','left','bottom','right','insideH','insideV'])
           + '</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblLook w:firstColumn="1" w:firstRow="1" w:lastColumn="0" w:lastRow="0" w:noHBand="0" w:noVBand="1" w:val="04A0"/></w:tblPr>'
           + f'<w:tblGrid>{grid}</w:tblGrid>')
    for r, row in enumerate(rows):
        out += '<w:tr>' + ('<w:trPr><w:tblHeader/></w:trPr>' if r == 0 else '')
        for c, cell in enumerate(row):
            if r == 0:
                shd, bold, color = '1A1A1A', True, 'FFFFFF'
            elif c == 0:
                shd, bold, color = 'F2F2F2', True, '111111'
            else:
                shd, bold, color = None, False, '222222'
            tcpr = f'<w:tcW w:type="dxa" w:w="{widths[c]}"/>' + (f'<w:shd w:val="clear" w:color="auto" w:fill="{shd}"/>' if shd else '') + MAR
            out += f'<w:tc><w:tcPr>{tcpr}</w:tcPr>' + para(run(cell, bold, color) if cell else '', '<w:spacing w:after="0"/>') + '</w:tc>'
        out += '</w:tr>'
    return out + '</w:tbl>'

def is_cheat_only(el):
    t = ''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', el))
    return el.startswith('<w:tbl') and (t.startswith('Manager note') or t.startswith('Worked example'))

body = []
for blk in C:
    k = blk[0]
    if k == 'KEEP':
        chunk = els[blk[1]:blk[2]]
        if mode == 'trainer':
            kept = []
            skip_spacer = False
            for el in chunk:
                if is_cheat_only(el):
                    skip_spacer = True; continue
                if skip_spacer and el == SPACER:
                    skip_spacer = False; continue
                skip_spacer = False
                kept.append(el)
            chunk = kept
        body += chunk
    elif k == 'H1': body.append(h1(blk[1]))
    elif k == 'H2': body.append(h2(blk[1]))
    elif k == 'P': body.append(para(md_runs(blk[1])))
    elif k == 'B': body.append(bullet(blk[1], blk[2]))
    elif k == 'S': body.append(para(run(blk[1])))
    elif k == 'D': body.append(dialogue(blk[1]))
    elif k in ('NOTE', 'EX'):
        if mode == 'manager':
            body += [box('Manager note' if k == 'NOTE' else 'Worked example', blk[1], 'FFF8E1' if k == 'NOTE' else 'EEF3F8'), SPACER]
    elif k == 'ACT':
        body += [para(run('✍️  ' + blk[1]), '<w:spacing w:after="40"/>'), para(run('_' * 88), '<w:spacing w:after="40"/>')]
    elif k == 'TABLE':
        body += [table(blk[1], blk[2]), SPACER]
    else:
        raise SystemExit('unknown block ' + k)
if mode == 'trainer':
    # Subtitle, and the trainer workbook's extra answer lines (counted from the
    # trainer original by prompt; new or changed prompts get 3).
    body = [e.replace('>PT Manager Cheat Sheet<', '>PT Workbook<') for e in body]
    tpre, tels, tpost = split(open(sys.argv[4]).read())
    def txt(e): return ''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', e))
    counts = {}
    for i, e in enumerate(tels):
        t = txt(e)
        if t.startswith('\u270d'):
            n = 0
            while i + 1 + n < len(tels) and txt(tels[i + 1 + n]).startswith('____'):
                n += 1
            counts[t.strip()] = n
    out = []
    i = 0
    while i < len(body):
        e = body[i]; out.append(e)
        t = txt(e)
        if t.startswith('\u270d') and i + 1 < len(body) and txt(body[i + 1]).startswith('____'):
            n = counts.get(t.strip(), 3)
            out += [body[i + 1]] * n
            i += 2
            while i < len(body) and txt(body[i]).startswith('____'):
                i += 1
            continue
        i += 1
    body = out
body.append(els[-1])  # sectPr
open(sys.argv[3] if len(sys.argv) > 3 else 'out_document.xml', 'w').write(pre + ''.join(body) + post)
print('elements', len(body))
