"""Opaque 'sticker' wordmark for dark backgrounds (hero): keeps pixels that clearly differ
from the paper colour of design/source/logo-light.jpg, drops the haze and the ® glyph."""
import os
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

root = sys.argv[1] if len(sys.argv) > 1 else '.'
src = np.asarray(Image.open(os.path.join(root, 'design/source/logo-light.jpg')).convert('RGB')).astype(np.float32)
bg = np.median(np.concatenate([src[:8, :8].reshape(-1, 3), src[-8:, -8:].reshape(-1, 3)]), axis=0)
diff = np.abs(src - bg).max(axis=2)
mask = np.clip((diff - 48) / 30, 0, 1)
solid = mask > 0.5
lab, n = ndimage.label(solid)
sizes = ndimage.sum(solid, lab, range(1, n + 1))
keep = ndimage.binary_closing(np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 150]), iterations=2)
keep = ndimage.binary_fill_holes(keep) & (mask > 0) | keep
alpha = np.where(keep, mask, 0.0)
dark = src.max(axis=2) < 90
lab2, _ = ndimage.label(dark)
for sl in ndimage.find_objects(lab2):
    y, x = sl
    if x.start > 420 and y.stop < 140 and (y.stop - y.start) < 40:
        alpha[max(y.start - 4, 0):y.stop + 4, max(x.start - 4, 0):x.stop + 4] = 0
im = Image.fromarray(np.dstack([src, alpha * 255]).astype(np.uint8), 'RGBA')
im.putalpha(im.getchannel('A').filter(ImageFilter.GaussianBlur(0.6)))
im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox())
# The glow layer touches the source's edges; feather all four sides so it fades instead of stopping.
arr = np.asarray(im).astype(np.float32)
h, w = arr.shape[:2]
f = 22
ys = np.clip(np.minimum(np.arange(h), h - 1 - np.arange(h)) / f, 0, 1)
xs = np.clip(np.minimum(np.arange(w), w - 1 - np.arange(w)) / f, 0, 1)
m = np.outer(ys, xs); arr[..., 3] *= m * m * (3 - 2 * m)
im = Image.fromarray(arr.astype(np.uint8), 'RGBA')
out = os.path.join(root, 'public/media/brand/wordmark-on-dark.webp')
im.save(out, 'WEBP', quality=90, method=6)
print(im.size, os.path.getsize(out) // 1024, 'KB')
if len(sys.argv) > 2:
    plaza = Image.open(os.path.join(root, 'design/source/plaza.png')).convert('RGBA').crop((40, 10, 40 + im.width + 60, 10 + im.height + 60))
    plaza.alpha_composite(im, (30, 30))
    plaza.convert('RGB').save(sys.argv[2])
