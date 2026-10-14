#!/usr/bin/env python3
"""v24: Enhance original face_* / char_* sprites for readable faces.
Never copies user sprite sheets — redraws clearer features on in-repo originals."""
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps
from pathlib import Path
import math

ASSET = Path("/workspace/qianmo/assets")

# palette per key: robe, hair, accent
PAL = {
    "hero":      ((240, 245, 250), (30, 28, 35), (70, 110, 160), (250, 220, 180)),
    "farmer_m":  ((70, 110, 70), (40, 32, 28), (120, 90, 55), (240, 205, 170)),
    "farmer_f":  ((200, 90, 110), (35, 28, 30), (180, 60, 80), (245, 210, 185)),
    "merchant":  ((160, 100, 50), (45, 35, 30), (200, 160, 80), (235, 200, 165)),
    "scholar":   ((90, 110, 150), (50, 45, 55), (220, 220, 230), (240, 215, 185)),
    "soldier":   ((90, 95, 105), (35, 35, 40), (180, 50, 50), (230, 200, 170)),
    "doctor":    ((70, 130, 120), (55, 50, 45), (240, 240, 245), (238, 208, 175)),
}

def enhance_face(key):
    src = ASSET / f"face_{key}.webp"
    if not src.exists():
        return
    im = Image.open(src).convert("RGBA")
    # upscale slightly then sharpen
    im = im.resize((320, 320), Image.LANCZOS)
    # crop toward upper face (hairline–chin)
    w, h = im.size
    # center-bias upper third
    face = im.crop((int(w * 0.08), int(h * 0.02), int(w * 0.92), int(h * 0.88)))
    face = face.resize((256, 256), Image.LANCZOS)
    rgb = face.convert("RGB")
    rgb = ImageEnhance.Contrast(rgb).enhance(1.18)
    rgb = ImageEnhance.Color(rgb).enhance(1.08)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.35)
    # draw clearer eyes/brows if too soft — light ink accents on mid-upper
    d = ImageDraw.Draw(rgb)
    # gold ring hint for readability when circular-cropped
    # soft cheek warmth
    overlay = Image.new("RGBA", rgb.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    # eye dots slightly stronger
    cx, cy = 128, 118
    for ox in (-22, 22):
        od.ellipse([cx + ox - 3, cy - 2, cx + ox + 3, cy + 3], fill=(40, 30, 28, 90))
        od.ellipse([cx + ox - 1, cy - 1, cx + ox + 1, cy + 1], fill=(20, 15, 12, 140))
    # brow
    od.arc([cx - 34, cy - 18, cx - 10, cy], 200, 340, fill=(30, 22, 18, 70), width=2)
    od.arc([cx + 10, cy - 18, cx + 34, cy], 200, 340, fill=(30, 22, 18, 70), width=2)
    # soft smile
    od.arc([cx - 14, cy + 18, cx + 14, cy + 36], 20, 160, fill=(160, 80, 80, 50), width=2)
    out = Image.alpha_composite(rgb.convert("RGBA"), overlay).convert("RGB")
    out.save(ASSET / f"face_{key}.webp", "WEBP", quality=92, method=6)
    print(f"face_{key} OK")

def redraw_char_chibi(key):
    """Build a clearer original chibi body + face composite from palette + face texture."""
    face_path = ASSET / f"face_{key}.webp"
    char_path = ASSET / f"char_{key}.webp"
    if not face_path.exists() or not char_path.exists():
        return
    robe, hair, accent, skin = PAL.get(key, PAL["farmer_m"])
    # canvas tall chibi
    W, H = 256, 320
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas)
    cx = W // 2
    # shadow
    d.ellipse([cx - 40, H - 28, cx + 40, H - 10], fill=(40, 25, 15, 50))
    # legs
    d.rounded_rectangle([cx - 28, 210, cx - 8, 280], radius=6, fill=robe + (255,))
    d.rounded_rectangle([cx + 8, 210, cx + 28, 280], radius=6, fill=robe + (255,))
    # shoes
    d.ellipse([cx - 32, 272, cx - 4, 290], fill=(30, 28, 28, 255))
    d.ellipse([cx + 4, 272, cx + 32, 290], fill=(30, 28, 28, 255))
    # body robe
    d.rounded_rectangle([cx - 48, 130, cx + 48, 230], radius=18, fill=robe + (255,))
    # sash
    d.rectangle([cx - 48, 175, cx + 48, 188], fill=accent + (255,))
    # arms
    d.rounded_rectangle([cx - 70, 140, cx - 42, 210], radius=10, fill=robe + (255,))
    d.rounded_rectangle([cx + 42, 140, cx + 70, 210], radius=10, fill=robe + (255,))
    # hands
    d.ellipse([cx - 72, 200, cx - 50, 222], fill=skin + (255,))
    d.ellipse([cx + 50, 200, cx + 72, 222], fill=skin + (255,))
    # collar
    d.polygon([(cx - 20, 130), (cx, 150), (cx + 20, 130)], fill=accent + (255,))
    # head circle from face texture
    face = Image.open(face_path).convert("RGBA").resize((110, 110), Image.LANCZOS)
    # circular mask
    mask = Image.new("L", (110, 110), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, 109, 109], fill=255)
    # hair cap behind
    d.ellipse([cx - 58, 55, cx + 58, 145], fill=hair + (255,))
    # paste face
    canvas.paste(face, (cx - 55, 62), mask)
    # gold rim
    d.ellipse([cx - 56, 61, cx + 56, 173], outline=(201, 163, 90, 220), width=3)
    # role props
    if key == "soldier":
        d.rectangle([cx + 55, 100, cx + 62, 240], fill=(180, 180, 190, 255))
        d.polygon([(cx + 50, 95), (cx + 67, 95), (cx + 58, 80)], fill=(200, 50, 50, 255))
    elif key == "scholar":
        d.rectangle([cx - 8, 95, cx + 8, 108], fill=(240, 240, 245, 255))  # cap
    elif key == "merchant":
        d.ellipse([cx + 40, 200, cx + 78, 250], fill=(140, 90, 50, 255))  # bag
    elif key == "doctor":
        d.ellipse([cx + 48, 185, cx + 72, 215], fill=(80, 160, 120, 255))  # bottle
    elif key in ("farmer_m", "farmer_f"):
        d.rectangle([cx - 75, 160, cx - 68, 250], fill=(120, 85, 50, 255))  # hoe
        d.ellipse([cx - 82, 155, cx - 60, 168], fill=(90, 70, 40, 255))
    elif key == "hero":
        d.rectangle([cx + 52, 120, cx + 58, 230], fill=(200, 205, 210, 255))  # jian
        d.rectangle([cx + 48, 225, cx + 62, 235], fill=(120, 80, 40, 255))

    canvas = canvas.filter(ImageFilter.SMOOTH_MORE)
    # keep existing silhouette proportion by resizing onto transparent
    out = canvas.resize((288, 360), Image.LANCZOS)
    out.save(ASSET / f"char_{key}.webp", "WEBP", quality=92, method=6)
    print(f"char_{key} OK")

def main():
    keys = ["hero", "farmer_m", "farmer_f", "merchant", "scholar", "soldier", "doctor"]
    for k in keys:
        enhance_face(k)
    for k in keys:
        redraw_char_chibi(k)
    print("SPRITES DONE")

if __name__ == "__main__":
    main()
