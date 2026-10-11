import pathlib
from PIL import Image

src_path = pathlib.Path('/Users/anshjohnson/.gemini/antigravity-ide/brain/68ab9a2e-9844-4629-bcd3-2798e1099a2b/.user_uploaded/media_1791729146473.jpg')
root = pathlib.Path('/Users/anshjohnson/Oru')

im = Image.open(src_path).convert('RGBA')

# 1. apps/mobile/assets/icon.png (1024x1024)
mobile_assets = root / 'apps' / 'mobile' / 'assets'
mobile_assets.mkdir(parents=True, exist_ok=True)
im.save(mobile_assets / 'icon.png', 'PNG')

# 2. apps/mobile/assets/adaptive-icon.png (1024x1024)
# For adaptive icon, Android places it in a mask, safe zone is inner 66% (center 676px)
adaptive = Image.new('RGBA', (1024, 1024), (255, 255, 255, 255))
scaled_bubble = im.resize((768, 768), Image.Resampling.LANCZOS)
adaptive.paste(scaled_bubble, (128, 128), scaled_bubble)
adaptive.save(mobile_assets / 'adaptive-icon.png', 'PNG')

# 3. apps/mobile/assets/favicon.png (192x192)
im.resize((192, 192), Image.Resampling.LANCZOS).save(mobile_assets / 'favicon.png', 'PNG')

# 4. frontend/public/icons/
fe_icons = root / 'frontend' / 'public' / 'icons'
fe_icons.mkdir(parents=True, exist_ok=True)

im.resize((64, 64), Image.Resampling.LANCZOS).save(fe_icons / 'favicon-64.png', 'PNG', optimize=True)
im.resize((192, 192), Image.Resampling.LANCZOS).save(fe_icons / 'icon-192.png', 'PNG', optimize=True)
im.resize((512, 512), Image.Resampling.LANCZOS).save(fe_icons / 'icon-512.png', 'PNG', optimize=True)

# Maskable icons (white background with logo scaled inside 80% safe zone)
for size in (192, 512):
    maskable = Image.new('RGB', (size, size), (255, 255, 255))
    inner_size = int(size * 0.85)
    inner = im.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
    dx = (size - inner_size) // 2
    dy = (size - inner_size) // 2
    maskable.paste(inner.convert('RGB'), (dx, dy), inner)
    maskable.save(fe_icons / f'icon-maskable-{size}.png', 'PNG', optimize=True)

# Multi-resolution favicon.ico
im.save(root / 'frontend' / 'public' / 'favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# Also copy to frontend/dist/icons/ if exists
dist_icons = root / 'frontend' / 'dist' / 'icons'
if dist_icons.exists():
    for f in ['favicon-64.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png']:
        data = (fe_icons / f).read_bytes()
        (dist_icons / f).write_bytes(data)
    (root / 'frontend' / 'dist' / 'favicon.ico').write_bytes((root / 'frontend' / 'public' / 'favicon.ico').read_bytes())

print('Successfully generated all icon and favicon assets!')
