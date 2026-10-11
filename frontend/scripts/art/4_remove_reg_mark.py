import sys
import numpy as np
from PIL import Image
from scipy import ndimage
D = sys.argv[1]
a = np.array(Image.open(D + 'design/cutouts/_wordmark.png').convert('RGBA'))
dark = (a[..., 3] > 120) & (a[..., :3].max(axis=2) < 90)   # the black ink parts: letters and the ® glyph
labels, n = ndimage.label(dark)
removed = []
for i, sl in enumerate(ndimage.find_objects(labels), start=1):
    y, x = sl
    h, w = y.stop - y.start, x.stop - x.start
    if x.start > 420 and y.stop < 140 and h < 40 and w < 40:     # small glyph top-right = ®
        ys, xs = slice(max(y.start - 4, 0), y.stop + 4), slice(max(x.start - 4, 0), x.stop + 4)
        a[ys, xs, 3] = 0
        removed.append((x.start, y.start, w, h))
im = Image.fromarray(a, 'RGBA')
im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox())
im.save(D + 'public/media/brand/wordmark.webp', 'WEBP', quality=92, method=6)
bg = Image.new('RGBA', (im.width + 20, im.height + 20), (255, 255, 255, 255)); bg.alpha_composite(im, (10, 10))
bg.convert('RGB').save(D + 'design/cutouts/_wordmark-check.png')
print('removed', removed, im.size)
