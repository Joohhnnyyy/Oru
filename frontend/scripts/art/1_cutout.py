import sys, pathlib
from PIL import Image
from rembg import remove, new_session

src, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
session = new_session('isnet-general-use')
for p in sorted(src.glob('*.png')):
    if p.name.startswith('_'):
        continue
    im = Image.open(p).convert('RGB')
    cut = remove(im, session=session, post_process_mask=True)
    if p.stem == 'buddy':
        # erase the palette swatches on the right edge of the source sheet
        px = cut.load()
        for x in range(395, cut.width):
            for y in range(270, cut.height):
                px[x, y] = (0, 0, 0, 0)
    bbox = cut.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    cut = cut.crop(bbox)
    cut.save(out / f'{p.stem}.png')
    print(p.stem, cut.size)
