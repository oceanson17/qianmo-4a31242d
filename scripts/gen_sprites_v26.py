#!/usr/bin/env python3
"""v26: Original Qin/Xianxia HD-chibi faces/chars + craftsman/hunter/ranger + pin_menu.
Inspiration-only from user sheets — never copies pixels/watermarks.
All art drawn procedurally with PIL."""
from __future__ import annotations
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from pathlib import Path
import math

ASSET = Path("/workspace/qianmo/assets")
ASSET.mkdir(parents=True, exist_ok=True)

# (robe, robe_dark, robe_light, hair, hair_hi, accent, skin, skin_shadow, lip)
PAL = {
    "hero": {
        "robe": (55, 105, 165), "robe_d": (35, 70, 120), "robe_l": (120, 165, 210),
        "hair": (28, 26, 32), "hair_hi": (55, 50, 60),
        "accent": (230, 220, 210), "sash": (180, 50, 55),
        "skin": (245, 210, 180), "skin_s": (220, 170, 140), "lip": (190, 100, 100),
        "eye": (40, 35, 40), "prop": "jian",
    },
    "farmer_m": {
        "robe": (70, 115, 75), "robe_d": (45, 80, 50), "robe_l": (120, 155, 110),
        "hair": (40, 32, 28), "hair_hi": (70, 55, 45),
        "accent": (140, 100, 60), "sash": (120, 85, 50),
        "skin": (235, 195, 155), "skin_s": (200, 155, 120), "lip": (170, 90, 90),
        "eye": (45, 35, 30), "prop": "hoe",
    },
    "farmer_f": {
        "robe": (200, 95, 125), "robe_d": (150, 60, 90), "robe_l": (235, 150, 170),
        "hair": (30, 26, 30), "hair_hi": (60, 50, 55),
        "accent": (255, 200, 210), "sash": (160, 70, 100),
        "skin": (250, 215, 195), "skin_s": (225, 175, 155), "lip": (210, 110, 120),
        "eye": (50, 40, 45), "prop": "basket", "twin": True,
    },
    "merchant": {
        "robe": (150, 95, 50), "robe_d": (110, 65, 35), "robe_l": (190, 140, 85),
        "hair": (45, 35, 30), "hair_hi": (75, 60, 50),
        "accent": (210, 170, 90), "sash": (90, 60, 40),
        "skin": (235, 200, 165), "skin_s": (200, 160, 125), "lip": (160, 85, 85),
        "eye": (45, 35, 30), "prop": "bag", "hat": True, "beard": True,
    },
    "scholar": {
        "robe": (95, 115, 155), "robe_d": (60, 75, 110), "robe_l": (150, 170, 200),
        "hair": (50, 48, 55), "hair_hi": (90, 88, 95),
        "accent": (235, 235, 240), "sash": (70, 80, 100),
        "skin": (240, 215, 185), "skin_s": (205, 170, 140), "lip": (150, 90, 90),
        "eye": (40, 38, 45), "prop": "fan", "cap": True,
    },
    "soldier": {
        "robe": (95, 100, 110), "robe_d": (60, 65, 75), "robe_l": (140, 145, 155),
        "hair": (35, 35, 40), "hair_hi": (65, 65, 70),
        "accent": (180, 50, 50), "sash": (140, 40, 40),
        "skin": (230, 195, 165), "skin_s": (195, 155, 125), "lip": (150, 80, 80),
        "eye": (35, 35, 40), "prop": "spear", "helm": True,
    },
    "doctor": {
        "robe": (75, 135, 125), "robe_d": (45, 95, 90), "robe_l": (130, 180, 170),
        "hair": (55, 50, 45), "hair_hi": (85, 78, 70),
        "accent": (245, 245, 250), "sash": (60, 110, 100),
        "skin": (238, 208, 175), "skin_s": (200, 165, 135), "lip": (155, 90, 90),
        "eye": (40, 40, 40), "prop": "bottle", "cap": True, "elder": True,
    },
    "craftsman": {
        "robe": (130, 90, 70), "robe_d": (90, 60, 45), "robe_l": (170, 130, 100),
        "hair": (40, 35, 30), "hair_hi": (70, 60, 50),
        "accent": (200, 160, 80), "sash": (70, 70, 75),
        "skin": (232, 190, 155), "skin_s": (195, 150, 120), "lip": (150, 85, 80),
        "eye": (40, 35, 30), "prop": "hammer", "apron": True,
    },
    "hunter": {
        "robe": (75, 100, 70), "robe_d": (50, 70, 48), "robe_l": (120, 145, 105),
        "hair": (35, 30, 28), "hair_hi": (65, 55, 48),
        "accent": (160, 110, 60), "sash": (100, 70, 40),
        "skin": (228, 188, 150), "skin_s": (190, 148, 115), "lip": (145, 80, 75),
        "eye": (35, 40, 30), "prop": "bow", "hood": True,
    },
    "ranger": {
        "robe": (70, 85, 120), "robe_d": (45, 55, 85), "robe_l": (120, 140, 175),
        "hair": (30, 28, 35), "hair_hi": (60, 55, 70),
        "accent": (220, 200, 160), "sash": (140, 50, 50),
        "skin": (240, 205, 175), "skin_s": (205, 165, 135), "lip": (170, 90, 90),
        "eye": (40, 35, 45), "prop": "jian", "ponytail": True,
    },
}


def aa_ellipse(draw, box, fill, outline=None, width=1):
    draw.ellipse(box, fill=fill, outline=outline, width=width)


def draw_face(key: str, size: int = 320) -> Image.Image:
    p = PAL[key]
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx = cy = size // 2
    R = int(size * 0.46)

    # soft shadow ring
    aa_ellipse(d, [cx - R - 4, cy - R - 2, cx + R + 4, cy + R + 6], (40, 25, 15, 40))

    # hair back mass
    aa_ellipse(d, [cx - R - 2, cy - R - 8, cx + R + 2, cy + int(R * 0.55)], p["hair"] + (255,))

    # head
    aa_ellipse(d, [cx - R, cy - R, cx + R, cy + R], p["skin"] + (255,))
    # cheek shade
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse([cx - R + 8, cy + 10, cx + R - 8, cy + R - 4], fill=p["skin_s"] + (55,))
    # blush
    od.ellipse([cx - 70, cy + 18, cx - 35, cy + 42], fill=(240, 140, 140, 55))
    od.ellipse([cx + 35, cy + 18, cx + 70, cy + 42], fill=(240, 140, 140, 55))
    im = Image.alpha_composite(im, overlay)
    d = ImageDraw.Draw(im)

    # bangs / hair front
    hair = p["hair"] + (255,)
    hi = p["hair_hi"] + (255,)
    if p.get("twin"):
        # twin buns
        aa_ellipse(d, [cx - 95, cy - R - 25, cx - 35, cy - R + 35], hair)
        aa_ellipse(d, [cx + 35, cy - R - 25, cx + 95, cy - R + 35], hair)
        # flower accents
        aa_ellipse(d, [cx - 78, cy - R - 5, cx - 58, cy - R + 15], (255, 160, 180, 255))
        aa_ellipse(d, [cx + 58, cy - R - 5, cx + 78, cy - R + 15], (255, 160, 180, 255))
        # bangs
        for dx in (-50, -20, 10, 40):
            d.polygon([(cx + dx - 12, cy - 40), (cx + dx + 12, cy - 40), (cx + dx, cy + 25)], fill=hair)
    elif p.get("elder"):
        # white/grey long beard later; top baldish with side hair
        aa_ellipse(d, [cx - R - 4, cy - R + 20, cx + R + 4, cy + 10], (220, 220, 225, 255))
        d.polygon([(cx - 40, cy - R + 30), (cx, cy - R - 5), (cx + 40, cy - R + 30)], fill=(200, 200, 205, 255))
    else:
        # high bun for hero / scholar styles
        if key in ("hero", "scholar") or p.get("cap"):
            aa_ellipse(d, [cx - 28, cy - R - 35, cx + 28, cy - R + 15], hair)
            if key == "hero":
                # ribbon
                d.polygon([(cx + 20, cy - R - 10), (cx + 55, cy - R - 25), (cx + 50, cy - R), (cx + 22, cy - R + 5)],
                          fill=(245, 245, 250, 255))
        # bangs fringe
        for dx, w in [(-55, 22), (-25, 24), (5, 24), (35, 22)]:
            d.polygon([
                (cx + dx - w // 2, cy - 50),
                (cx + dx + w // 2, cy - 50),
                (cx + dx + 4, cy + 30),
                (cx + dx - 4, cy + 30),
            ], fill=hair)
        # side locks
        d.polygon([(cx - R + 5, cy - 20), (cx - R - 8, cy + 60), (cx - R + 25, cy + 40)], fill=hair)
        d.polygon([(cx + R - 5, cy - 20), (cx + R + 8, cy + 60), (cx + R - 25, cy + 40)], fill=hair)
        # highlight streak
        d.polygon([(cx - 30, cy - R + 10), (cx - 18, cy - R + 10), (cx - 22, cy - 20)], fill=hi)

    if p.get("cap") and not p.get("elder"):
        # scholar/doctor flat cap
        d.rounded_rectangle([cx - 55, cy - R - 18, cx + 55, cy - R + 12], radius=6,
                            fill=p["accent"] + (255,))
        d.rectangle([cx - 8, cy - R - 28, cx + 8, cy - R - 10], fill=p["accent"] + (255,))

    if p.get("helm"):
        # helmet plate + red plume
        d.ellipse([cx - R - 2, cy - R - 5, cx + R + 2, cy + 15], fill=p["robe"] + (255,))
        d.ellipse([cx - R + 15, cy - R + 25, cx + R - 15, cy + 5], fill=p["skin"] + (255,))
        d.polygon([(cx - 8, cy - R - 5), (cx + 8, cy - R - 5), (cx + 4, cy - R - 55), (cx - 4, cy - R - 55)],
                  fill=p["accent"] + (255,))
        # re-draw bangs under helm brim lightly
        d.arc([cx - 40, cy - 30, cx + 40, cy + 10], 200, 340, fill=p["hair"] + (200,), width=3)

    if p.get("hat"):
        # conical / traveler hat brim
        d.ellipse([cx - R - 20, cy - R + 5, cx + R + 20, cy - R + 45], fill=(90, 70, 45, 255))
        d.ellipse([cx - 40, cy - R - 25, cx + 40, cy - R + 25], fill=(120, 95, 60, 255))

    if p.get("hood"):
        d.polygon([(cx - R - 8, cy - 10), (cx - R + 20, cy - R - 20), (cx + R - 20, cy - R - 20),
                   (cx + R + 8, cy - 10), (cx + R - 10, cy + 40), (cx - R + 10, cy + 40)],
                  fill=p["robe_d"] + (255,))
        # reopen face oval
        aa_ellipse(d, [cx - int(R*0.78), cy - int(R*0.55), cx + int(R*0.78), cy + int(R*0.7)], p["skin"] + (255,))

    if p.get("ponytail"):
        d.polygon([(cx + 20, cy - R + 10), (cx + 55, cy - R + 40), (cx + 48, cy + 50), (cx + 30, cy + 20)],
                  fill=p["hair"] + (255,))
        aa_ellipse(d, [cx - 26, cy - R - 32, cx + 26, cy - R + 12], p["hair"] + (255,))

    # eyes — large expressive
    eye_y = cy - 8
    for ox in (-32, 32):
        # white
        aa_ellipse(d, [cx + ox - 16, eye_y - 12, cx + ox + 16, eye_y + 14], (255, 255, 255, 255))
        # iris
        aa_ellipse(d, [cx + ox - 9, eye_y - 6, cx + ox + 9, eye_y + 10], p["eye"] + (255,))
        # pupil
        aa_ellipse(d, [cx + ox - 4, eye_y - 2, cx + ox + 4, eye_y + 6], (15, 12, 15, 255))
        # shine
        aa_ellipse(d, [cx + ox - 2, eye_y - 5, cx + ox + 3, eye_y], (255, 255, 255, 255))
        # lower lid soft
        d.arc([cx + ox - 15, eye_y - 2, cx + ox + 15, eye_y + 16], 10, 170, fill=p["skin_s"] + (180,), width=2)
    # brows
    for ox, flip in [(-32, 1), (32, -1)]:
        d.arc([cx + ox - 18, eye_y - 28, cx + ox + 16, eye_y - 2], 200, 340,
              fill=p["hair"] + (230,), width=3)

    # nose
    d.line([(cx, cy + 8), (cx - 3, cy + 22), (cx + 4, cy + 22)], fill=p["skin_s"] + (200,), width=2)

    # mouth
    d.arc([cx - 16, cy + 28, cx + 16, cy + 48], 20, 160, fill=p["lip"] + (220,), width=3)

    if p.get("beard") or p.get("elder"):
        beard_c = (230, 230, 235, 255) if p.get("elder") else (55, 45, 40, 255)
        d.polygon([(cx - 35, cy + 35), (cx, cy + R - 5), (cx + 35, cy + 35), (cx + 20, cy + 55), (cx - 20, cy + 55)],
                  fill=beard_c)
        if p.get("elder"):
            d.polygon([(cx - 8, cy + 40), (cx, cy + R + 15), (cx + 8, cy + 40)], fill=(245, 245, 248, 255))

    # collar hint at bottom
    d.polygon([(cx - 50, size - 8), (cx, size - 45), (cx + 50, size - 8)], fill=p["robe"] + (255,))
    d.polygon([(cx - 20, size - 8), (cx, size - 30), (cx + 20, size - 8)], fill=p["accent"] + (255,))

    # gold rim for circular crop readability
    ring = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    rd.ellipse([cx - R - 3, cy - R - 3, cx + R + 3, cy + R + 3], outline=(201, 163, 90, 230), width=5)
    rd.ellipse([cx - R - 1, cy - R - 1, cx + R + 1, cy + R + 1], outline=(255, 240, 200, 100), width=2)
    im = Image.alpha_composite(im, ring)

    # slight sharpen
    rgb = im.convert("RGBA")
    return rgb


def draw_char(key: str) -> Image.Image:
    p = PAL[key]
    W, H = 288, 400
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas)
    cx = W // 2

    # ground shadow
    d.ellipse([cx - 48, H - 36, cx + 48, H - 14], fill=(40, 25, 15, 55))

    # legs
    leg = p["robe_d"] + (255,)
    d.rounded_rectangle([cx - 32, 250, cx - 8, 340], radius=8, fill=leg)
    d.rounded_rectangle([cx + 8, 250, cx + 32, 340], radius=8, fill=leg)
    # shoes
    d.ellipse([cx - 38, 330, cx - 4, 352], fill=(35, 30, 28, 255))
    d.ellipse([cx + 4, 330, cx + 38, 352], fill=(35, 30, 28, 255))

    # body robe
    robe = p["robe"] + (255,)
    robe_l = p["robe_l"] + (255,)
    d.rounded_rectangle([cx - 58, 155, cx + 58, 270], radius=22, fill=robe)
    # highlight panel
    d.polygon([(cx - 20, 160), (cx - 5, 260), (cx - 45, 260)], fill=robe_l)
    # sash
    d.rectangle([cx - 58, 210, cx + 58, 226], fill=p["sash"] + (255,))
    d.rectangle([cx - 58, 214, cx + 58, 218], fill=p["accent"] + (200,))

    # arms
    d.rounded_rectangle([cx - 82, 165, cx - 52, 250], radius=12, fill=robe)
    d.rounded_rectangle([cx + 52, 165, cx + 82, 250], radius=12, fill=robe)
    # hands
    d.ellipse([cx - 84, 240, cx - 56, 268], fill=p["skin"] + (255,))
    d.ellipse([cx + 56, 240, cx + 84, 268], fill=p["skin"] + (255,))

    if p.get("apron"):
        d.polygon([(cx - 40, 200), (cx + 40, 200), (cx + 48, 268), (cx - 48, 268)], fill=(210, 200, 180, 255))
        d.line([(cx, 200), (cx, 268)], fill=(160, 150, 130, 255), width=2)

    # collar / lapel
    d.polygon([(cx - 28, 155), (cx, 185), (cx + 28, 155)], fill=p["accent"] + (255,))
    d.line([(cx, 155), (cx, 210)], fill=p["robe_d"] + (255,), width=3)

    # props
    prop = p.get("prop")
    if prop == "jian":
        d.rectangle([cx + 62, 130, cx + 70, 280], fill=(190, 200, 210, 255))
        d.rectangle([cx + 58, 275, cx + 74, 288], fill=(140, 100, 50, 255))
        d.ellipse([cx + 60, 125, cx + 72, 138], fill=(100, 160, 220, 200))  # glow tip
    elif prop == "spear":
        d.rectangle([cx + 66, 90, cx + 72, 300], fill=(160, 160, 170, 255))
        d.polygon([(cx + 58, 95), (cx + 80, 95), (cx + 69, 70)], fill=p["accent"] + (255,))
    elif prop == "hoe":
        d.rectangle([cx - 88, 180, cx - 80, 310], fill=(120, 85, 50, 255))
        d.polygon([(cx - 100, 175), (cx - 70, 175), (cx - 85, 155)], fill=(90, 70, 40, 255))
    elif prop == "bag":
        d.rounded_rectangle([cx + 48, 230, cx + 95, 295], radius=10, fill=(120, 80, 45, 255))
        d.arc([cx + 55, 220, cx + 88, 250], 200, 340, fill=(90, 60, 35, 255), width=3)
    elif prop == "fan":
        d.pieslice([cx - 100, 175, cx - 40, 235], 200, 340, fill=(240, 240, 245, 255), outline=(180, 160, 100, 255))
    elif prop == "bottle":
        d.rounded_rectangle([cx + 58, 215, cx + 82, 255], radius=6, fill=(60, 150, 110, 255))
        d.rectangle([cx + 65, 205, cx + 75, 218], fill=(200, 200, 205, 255))
    elif prop == "basket":
        d.ellipse([cx - 95, 240, cx - 50, 275], fill=(160, 120, 70, 255))
        d.arc([cx - 90, 230, cx - 55, 255], 200, 340, fill=(120, 90, 50, 255), width=3)
    elif prop == "hammer":
        d.rectangle([cx + 66, 175, cx + 74, 290], fill=(120, 85, 50, 255))
        d.rounded_rectangle([cx + 52, 165, cx + 88, 190], radius=4, fill=(140, 140, 150, 255))
    elif prop == "bow":
        d.arc([cx + 48, 140, cx + 100, 280], 250, 470, fill=(120, 85, 50, 255), width=5)
        d.line([(cx + 58, 155), (cx + 58, 265)], fill=(220, 210, 190, 255), width=2)

    # head from face (without huge gold ring — redraw smaller)
    face = draw_face_for_body(key, 140)
    hx, hy = cx - 70, 48
    canvas.paste(face, (hx, hy), face)

    # soft outline pass
    canvas = canvas.filter(ImageFilter.SMOOTH)
    return canvas


def draw_face_for_body(key: str, size: int = 140) -> Image.Image:
    """Compact face without outer gold ring for body composite."""
    full = draw_face(key, 280)
    # crop to head circle region
    full = full.crop((20, 10, 260, 250)).resize((size, size), Image.LANCZOS)
    # circular mask
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse([2, 2, size - 3, size - 3], fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(full, (0, 0), mask)
    return out


def save_face(key: str):
    im = draw_face(key, 320)
    # flatten to RGB on soft paper for webp size, keep circular by compositing on transparent then convert
    # Save as RGBA webp
    im = ImageEnhance.Contrast(im).enhance(1.08)
    im = ImageEnhance.Color(im).enhance(1.06)
    im = ImageEnhance.Sharpness(im).enhance(1.25)
    # export square RGB with white→transparent already RGBA
    # For face thumbs used with object-fit cover, RGB is fine if we keep circular content on transparent — but old faces were RGB.
    # Save RGBA webp; browsers handle it.
    bg = Image.new("RGB", im.size, (251, 244, 234))
    bg.paste(im, mask=im.split()[3])
    # circular crop into RGB with paper outside? Better: keep face filling square tightly
    # Crop to circle bounding box already filled — paste onto paper then circular isn't needed for img tags that use border-radius
    bg.save(ASSET / f"face_{key}.webp", "WEBP", quality=93, method=6)
    print(f"face_{key} {bg.size}")


def save_char(key: str):
    im = draw_char(key)
    im = ImageEnhance.Sharpness(im).enhance(1.15)
    im.save(ASSET / f"char_{key}.webp", "WEBP", quality=93, method=6)
    print(f"char_{key} {im.size}")


def gen_pin_icons():
    """Tiny original map-pin icons (32→64), Qin vibe — not sheet dumps."""
    ui = ASSET / "ui"
    ui.mkdir(exist_ok=True)
    icons = {
        "farm": ("田", (90, 140, 80)),
        "hut": ("陋", (140, 110, 70)),
        "village": ("村", (180, 90, 70)),
        "market": ("市", (190, 140, 60)),
        "clinic": ("藥", (70, 140, 120)),
        "drill": ("武", (100, 100, 120)),
        "wild": ("山", (70, 110, 90)),
        "garden": ("園", (180, 100, 130)),
        "map": ("輿", (70, 110, 150)),
        "bag": ("囊", (150, 100, 50)),
        "quest": ("差", (180, 60, 60)),
        "ppl": ("誼", (120, 90, 140)),
        "menu": ("選", (90, 90, 100)),
    }
    for name, (glyph, col) in icons.items():
        im = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        d.ellipse([4, 4, 60, 60], fill=col + (255,))
        d.ellipse([8, 8, 56, 56], outline=(255, 240, 210, 200), width=2)
        d.ellipse([6, 6, 58, 58], outline=(201, 163, 90, 230), width=2)
        # simple symbol instead of font glyph (font may miss CJK)
        sym = {
            "farm": [(32, 18), (22, 42), (42, 42)],
            "hut": [(20, 40), (32, 18), (44, 40), (44, 48), (20, 48)],
            "village": [(24, 44), (24, 28), (40, 20), (40, 44)],
            "market": [(22, 22), (42, 22), (42, 42), (22, 42)],
            "clinic": [(30, 18), (34, 18), (34, 30), (46, 30), (46, 34), (34, 34), (34, 46), (30, 46), (30, 34), (18, 34), (18, 30), (30, 30)],
            "drill": [(32, 16), (36, 40), (28, 40)],
            "wild": [(18, 42), (28, 22), (38, 38), (46, 20), (50, 42)],
            "garden": [(32, 20), (32, 44), (22, 36), (42, 36)],
            "map": [(20, 20), (44, 20), (44, 44), (20, 44)],
            "bag": [(24, 24), (40, 24), (44, 48), (20, 48)],
            "quest": [(28, 18), (36, 18), (38, 44), (26, 44), (28, 18)],
            "ppl": [(32, 20), (24, 36), (40, 36), (32, 20)],
            "menu": [(20, 24), (44, 24), (20, 32), (44, 32), (20, 40), (44, 40)],
        }
        pts = sym.get(name, [(32, 24), (32, 40)])
        if name in ("clinic",):
            d.polygon(pts, fill=(255, 250, 240, 255))
        elif name in ("wild", "garden"):
            d.line(pts, fill=(255, 250, 240, 255), width=3, joint="curve")
        elif name == "menu":
            for y in (24, 32, 40):
                d.line([(20, y), (44, y)], fill=(255, 250, 240, 255), width=3)
        else:
            d.polygon(pts, fill=(255, 250, 240, 255))
        im.save(ui / f"pin_{name}.webp", "WEBP", quality=90, method=6)
    print("pin icons OK", len(icons))


def main():
    keys = list(PAL.keys())
    for k in keys:
        save_face(k)
    for k in keys:
        save_char(k)
    gen_pin_icons()
    print("SPRITES V26 DONE")


if __name__ == "__main__":
    main()
