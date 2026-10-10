import sys, pathlib
import numpy as np
from PIL import Image
design, pub = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
src = np.asarray(Image.open(design / 'source' / 'logo-light.jpg').convert('RGB')).astype(np.float32)
# Background is slightly off-white; estimate it from the corners.
bg = np.median(np.concatenate([src[:8, :8].reshape(-1, 3), src[-8:, -8:].reshape(-1, 3)]), axis=0)
# Colour-to-alpha against bg: smallest alpha that reproduces each pixel over bg.
diff = np.maximum((bg - src) / np.maximum(bg, 1), (src - bg) / np.maximum(255 - bg, 1))
alpha = np.clip(diff.max(axis=2), 0, 1)
alpha = np.where(alpha < 0.06, 0, alpha)  # kill JPEG noise in the background
a = np.maximum(alpha[..., None], 1e-6)
rgb = np.clip((src - bg * (1 - a)) / a, 0, 255)
out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
im = Image.fromarray(out, 'RGBA')
im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox())
im.save(pub / 'media' / 'brand' / 'wordmark.webp', 'WEBP', quality=92, method=6)
im.save(design / 'cutouts' / '_wordmark.png')
plaza = Image.open(design / 'source' / 'plaza.png').convert('RGBA').crop((0, 0, im.width + 40, im.height + 40))
white = Image.new('RGBA', plaza.size, (255, 255, 255, 255))
white.alpha_composite(im, (20, 20)); plaza.alpha_composite(im, (20, 20))
prev = Image.new('RGB', (plaza.width * 2 + 10, plaza.height), 'white')
prev.paste(white.convert('RGB'), (0, 0)); prev.paste(plaza.convert('RGB'), (plaza.width + 10, 0))
prev.save(design / 'cutouts' / '_wordmark-preview.png')
print(im.size, bg)
