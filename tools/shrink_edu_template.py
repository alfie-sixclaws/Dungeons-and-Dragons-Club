"""Makes the small (~3.9 MB) 2024 template from the original 16 MB textured PDF.

The original has three huge ~300 dpi images (the paper texture and two greyscale masks that
give the frame its worn edge). We halve their resolution; the masks are stored as q90 JPEG
(safe for greyscale masks) and the texture stays lossless. Measured difference from the
original: ~0.1-0.2 / 255 at normal zoom. (1/3 size = 2.3 MB, 1/4 = 1.5 MB visibly smooths the grain.)
Needs pymupdf. Usage (from the project root):
    python3 tools/shrink_edu_template.py sketches-source/character_sheet_edu.pdf assets/templates/character-sheet-2024.pdf
The image object numbers below are specific to that file.
"""
import os, sys, pymupdf
IMGS = {25: (2522, 3234), 393: (2448, 3161), 95: (2447, 3161)}    # xref -> (width, height)
src, out = sys.argv[1], sys.argv[2]
d = pymupdf.open(src)
for x, (w, h) in IMGS.items():
    raw = d.xref_stream(x); assert len(raw) == w * h, "unexpected image - wrong source PDF?"
    pm = pymupdf.Pixmap(pymupdf.csGRAY, w, h, raw, False); pm.shrink(1)      # halve with a box filter
    if x == 25:
        d.update_stream(x, pm.samples, compress=True)                         # texture: lossless
    else:
        d.update_stream(x, pm.tobytes("jpeg", jpg_quality=90), compress=False)
        d.xref_set_key(x, "Filter", "/DCTDecode")
    d.xref_set_key(x, "Width", str(pm.width)); d.xref_set_key(x, "Height", str(pm.height)); d.xref_set_key(x, "DecodeParms", "null")
d.save(out, garbage=4, deflate=True, clean=True)
print(f"{os.path.getsize(src)/1e6:.1f} MB -> {os.path.getsize(out)/1e6:.1f} MB")
