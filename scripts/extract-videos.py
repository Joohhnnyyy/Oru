"""Extract embedded base64 videos from reference/index.html (read-only).
Writes butter-clone/public/videos/clip_NN.(mp4|webm) and /tmp/work/videos.json
with the DOM context of each clip. Prints sizes only."""
import re, base64, json, os
src = open('reference/index.html', encoding='utf-8', errors='ignore').read()
out = 'butter-clone/public/videos'; os.makedirs(out, exist_ok=True)
pat = re.compile(r'data:video/(mp4|webm)(?:;codecs=[^;"\']+)?;base64,([A-Za-z0-9+/=]+)')
meta = []
for i, m in enumerate(pat.finditer(src)):
    ext, b64 = m.group(1), m.group(2)
    data = base64.b64decode(b64)
    name = f'clip_{i:02d}.{ext}'
    open(f'{out}/{name}', 'wb').write(data)
    # context: 400 chars before, with base64 stripped
    ctx = src[max(0, m.start()-1500):m.start()]
    ctx = re.sub(r'data:[a-z]+/[a-z0-9.+-]+(;codecs=[^;"\']+)?;base64,[A-Za-z0-9+/=]+', 'DATA', ctx)
    meta.append({'file': name, 'kb': round(len(data)/1024), 'pos': m.start(), 'ctx': ctx[-600:]})
    print(f'{name}  {len(data)/1024:8.0f} KB')
json.dump(meta, open('/tmp/work/videos.json', 'w'))
print('total', len(meta))
