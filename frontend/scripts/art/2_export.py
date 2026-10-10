import sys, pathlib
import numpy as np
from PIL import Image
from scipy import ndimage

design, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
(out / 'characters').mkdir(parents=True, exist_ok=True)
(out / 'scenes').mkdir(parents=True, exist_ok=True)

def keep_largest(im):
    a = np.array(im)
    mask = a[..., 3] > 8
    labels, n = ndimage.label(mask)
    if n > 1:
        sizes = ndimage.sum(mask, labels, range(1, n + 1))
        keep = labels == (int(np.argmax(sizes)) + 1)
        keep = ndimage.binary_dilation(keep, iterations=2)
        a[..., 3] = np.where(keep, a[..., 3], 0)
    im = Image.fromarray(a)
    return im.crop(im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())

def save(im, path, max_side, q=82):
    im = im.copy(); im.thumbnail((max_side, max_side), Image.LANCZOS)
    im.save(path, 'WEBP', quality=q, method=6)
    print(path.relative_to(out), im.size, f'{path.stat().st_size/1024:.0f} KB')

# Transparent character cut-outs (for floating / tilt)
for p in sorted((design / 'cutouts').glob('*.png')):
    if p.name.startswith('_'): continue
    save(keep_largest(Image.open(p).convert('RGBA')), out / 'characters' / f'{p.stem}.webp', 640, 84)

# Scene crops (with their painted backgrounds) for cards and bubbles
for p in sorted((design / 'crops').glob('*.png')):
    if p.name.startswith('_') or p.stem == 'buddy': continue
    save(Image.open(p).convert('RGB'), out / 'scenes' / f'{p.stem}.webp', 720, 80)

# Hero plaza
save(Image.open(design / 'source' / 'plaza.png').convert('RGB'), out / 'scenes' / 'plaza.webp', 2400, 80)
