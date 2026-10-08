import re, sys
from bs4 import BeautifulSoup, NavigableString
h = open('/tmp/work/stripped.html').read()
h = re.sub(r'[A-Za-z0-9+/=]{2000,}', 'B64', h)
soup = BeautifulSoup(h, 'lxml')
vid = {}
def vidn(tag):
    return vid.setdefault(id(tag), len(vid))
def txt(t): return re.sub(r'\s+',' ', t.get_text(' ', strip=True)).strip()
def walk(n, d=0, out=None):
    for c in n.children:
        if isinstance(c, NavigableString): continue
        nm = c.name
        cls = ' '.join(c.get('class', []))[:90]
        if nm in ('section','header','footer','nav','main'):
            out.append(f"{'  '*d}<{nm}> id={c.get('id')} cls={cls}")
            walk(c, d+1, out)
        elif nm in ('h1','h2','h3','h4','p','button','a','li','label'):
            t = txt(c)
            if t: out.append(f"{'  '*d}{nm}: {t[:160]}" + (f"  -> {c.get('href')}" if nm=='a' and c.get('href') else ''))
            else: 
                if nm=='a' and c.get('href'): out.append(f"{'  '*d}a(icon) -> {c.get('href')}")
        elif nm == 'img':
            out.append(f"{'  '*d}img alt={c.get('alt')!r} src={(c.get('src') or '')[:70]}")
        elif nm == 'video':
            out.append(f"{'  '*d}VIDEO#{vidn(c)} autoplay={c.has_attr('autoplay')} poster={bool(c.get('poster'))}")
        elif nm in ('div','ul','svg','span'):
            walk(c, d, out) if nm!='svg' else None
        else:
            walk(c, d, out)
out=[]
walk(soup.body, 0, out)
print('\n'.join(out))
