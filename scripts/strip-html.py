import re, sys, json
src = open('reference/index.html', encoding='utf-8', errors='ignore').read()
# inventory embedded data URIs first (no content printed)
uris = re.findall(r'data:([a-z]+/[a-z0-9.+-]+);base64,', src)
from collections import Counter
print('data URIs:', dict(Counter(uris)))
# collect inline css before stripping
styles = re.findall(r'<style[^>]*>(.*?)</style>', src, flags=re.S)
css = '\n'.join(styles)
css = re.sub(r'data:[a-z]+/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+', 'data:BASE64', css)
open('/tmp/work/inline.css','w').write(css)
# scripts: keep only json-ish sizes
html = re.sub(r'<script[^>]*>.*?</script>', '', src, flags=re.S)
html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.S)
html = re.sub(r'data:[a-z]+/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+', 'data:BASE64', html)
open('/tmp/work/stripped.html','w').write(html)
print('stripped html bytes', len(html), 'css bytes', len(css))
