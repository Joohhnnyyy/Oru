import sys, pathlib
from PIL import Image, ImageChops
from rembg import remove, new_session
design, pub = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
light = Image.open(design / 'source' / 'logo-light.jpg').convert('RGB')
cut = remove(light, session=new_session('isnet-general-use'))
cut = cut.crop(cut.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox())
(pub / 'media' / 'brand').mkdir(parents=True, exist_ok=True)
cut.save(pub / 'media' / 'brand' / 'wordmark.webp', 'WEBP', quality=90, method=6)
cut.save(design / 'cutouts' / '_wordmark.png')
# Dark app icon: find the rounded square by brightness bbox of the glow
dark = Image.open(design / 'source' / 'logo-dark.jpg').convert('RGB')
g = dark.convert('L').point(lambda v: 255 if v > 40 else 0)
x0, y0, x1, y1 = g.getbbox()
side = max(x1 - x0, y1 - y0); cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
pad = int(side * 0.04)
box = (cx - side // 2 - pad, cy - side // 2 - pad, cx + side // 2 + pad, cy + side // 2 + pad)
icon = dark.crop(box)
icon.save(design / 'cutouts' / '_icon.png')
for s in (192, 512):
    icon.resize((s, s), Image.LANCZOS).save(pub / 'icons' / f'icon-{s}.png', optimize=True)
# Maskable: full-bleed black, logo square inside the 80% safe zone
for s in (192, 512):
    canvas = Image.new('RGB', (s, s), (8, 8, 8))
    inner = icon.resize((int(s * 0.8), int(s * 0.8)), Image.LANCZOS)
    canvas.paste(inner, ((s - inner.width) // 2, (s - inner.height) // 2))
    canvas.save(pub / 'icons' / f'icon-maskable-{s}.png', optimize=True)
icon.resize((64, 64), Image.LANCZOS).save(pub / 'icons' / 'favicon-64.png', optimize=True)
print('wordmark', cut.size, 'icon box', box)
