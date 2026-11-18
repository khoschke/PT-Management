import re
def split(xml):
    b0=xml.index('<w:body>')+len('<w:body>')
    b1=xml.index('</w:body>')
    body=xml[b0:b1]
    out=[];pos=0
    while pos<len(body):
        m=re.compile(r'<w:(p|tbl|sectPr)[ >]').search(body,pos)
        if not m: break
        tag=m.group(1); d=0
        pat=re.compile(r'<(/?)w:%s(?=[ >/])'%tag)
        for mm in pat.finditer(body,m.start()):
            end=body.index('>',mm.start())
            if mm.group(1)=='':
                if body[end-1]=='/':
                    if d==0: j=end+1;break
                    continue
                d+=1
            else:
                d-=1
                if d==0: j=end+1;break
        out.append(body[m.start():j]); pos=j
    return xml[:b0], out, xml[b1:]
