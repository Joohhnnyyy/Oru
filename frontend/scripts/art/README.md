# Art pipeline (character cut-outs, scenes, logo, icons)

Turns the source art in `frontend/design/source/` into the web assets in `frontend/public/media/` and `public/icons/`.
Runs locally and needs no paid service. Requires Python 3.10+ with `rembg[cpu]`, `Pillow`, `numpy` and `scipy`
(install them in a virtualenv, not in your system Python).

```bash
python -m venv .venv-art && .venv-art/Scripts/pip install "rembg[cpu]"   # Windows path; use bin/ on macOS/Linux
# 0. crop each character from the sheets into design/crops/<name>.png (see crop boxes in the commit history)
.venv-art/Scripts/python -I scripts/art/1_cutout.py design/crops design/cutouts      # background removal (isnet-general-use)
.venv-art/Scripts/python -I scripts/art/2_export.py design public/media              # WebP cut-outs + scenes + plaza
.venv-art/Scripts/python -I scripts/art/3_wordmark.py design public                  # colour-to-alpha wordmark
.venv-art/Scripts/python -I scripts/art/4_remove_reg_mark.py ./                       # drop the ® glyph (see README)
.venv-art/Scripts/python -I scripts/art/5_icons.py design public                     # PWA icons from the dark logo
```

Note: `5_icons.py` also writes a rembg wordmark that `3_wordmark.py` and `4_remove_reg_mark.py` then replace, so keep the order 5 → 3 → 4
if you re-run everything.
