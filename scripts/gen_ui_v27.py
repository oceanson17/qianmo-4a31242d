#!/usr/bin/env python3
"""v27 UI kit assets — original navy/gold stone panels & chrome.
Inspired by user UI kit; never copies pixels/watermarks."""
from __future__ import annotations
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pathlib import Path
import math, random

UI = Path("/workspace/qianmo/assets/ui")
UI.mkdir(parents=True, exist_ok=True)

NAVY = (22, 32, 58)
NAVY2 = (32, 44, 78)
STONE = (28, 36, 55)
GOLD = (212, 175, 95)
GOLD2 = (240, 210, 140)
GOLD_D = (140, 105, 50)
TEAL = (55, 140, 145)


def noise_bg(w, h, base=STONE):
    im = Image.new("RGBA", (w, h), base + (255,))
    px = im.load()
    rnd = random.Random(27)
    for y in range(h):
        for x in range(w):
            n = rnd.randint(-12, 12)
            r = max(0, min(255, base[0] + n))
            g = max(0, min(255, base[1] + n))
            b = max(0, min(255, base[2] + n // 2))
            # subtle crack lines
            if (x * 17 + y * 13) % 97 == 0:
                r, g, b = max(0, r - 20), max(0, g - 18), max(0, b - 10)
            px[x, y] = (r, g, b, 255)
    return im


def gold_border(d, w, h, thick=4, radius=18):
    # outer gold frame
    d.rounded_rectangle([2, 2, w - 3, h - 3], radius, outline=GOLD + (255,), width=thick)
    d.rounded_rectangle([thick + 2, thick + 2, w - thick - 3, h - thick - 3], radius - 4,
                        outline=GOLD_D + (200,), width=2)
    # corner gems
    for cx, cy in [(14, 14), (w - 15, 14), (14, h - 15), (w - 15, h - 15)]:
        d.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=TEAL + (255,), outline=GOLD + (255,), width=2)
        d.ellipse([cx - 2, cy - 2, cx + 2, cy + 2], fill=GOLD2 + (255,))


def make_panel(name, w, h):
    im = noise_bg(w, h)
    # vignette
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    od.rectangle([0, 0, w, 48], fill=NAVY2 + (180,))
    # teal silk header strip
    od.rounded_rectangle([40, 10, w - 40, 36], 8, fill=(40, 110, 120, 220), outline=GOLD + (200,))
    im = Image.alpha_composite(im, ov)
    d = ImageDraw.Draw(im)
    gold_border(d, w, h, thick=5, radius=22)
    im.save(UI / name, "WEBP", quality=92, method=6)
    print("panel", name)


def make_btn(name, color, w=200, h=56):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # bevel
    c = color
    dark = tuple(max(0, x - 40) for x in c)
    light = tuple(min(255, x + 45) for x in c)
    d.rounded_rectangle([0, 0, w - 1, h - 1], 12, fill=dark + (255,))
    d.rounded_rectangle([2, 2, w - 3, h - 5], 11, fill=c + (255,))
    d.rounded_rectangle([4, 4, w - 5, h // 2], 10, fill=light[:3] + (90,))
    d.rounded_rectangle([1, 1, w - 2, h - 2], 12, outline=GOLD + (230,), width=2)
    im.save(UI / name, "WEBP", quality=92, method=6)
    print("btn", name)


def make_icon_circle(name, icon_kind, size=96):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # outer gold ring
    d.ellipse([2, 2, size - 3, size - 3], fill=NAVY + (245,), outline=GOLD + (255,), width=4)
    d.ellipse([10, 10, size - 11, size - 11], outline=GOLD_D + (180,), width=2)
    cx = cy = size // 2
    # yellow icon glyph
    yel = (245, 210, 90, 255)
    if icon_kind == "plus":
        d.rectangle([cx - 6, cy - 22, cx + 6, cy + 22], fill=yel)
        d.rectangle([cx - 22, cy - 6, cx + 22, cy + 6], fill=yel)
    elif icon_kind == "close":
        for i in range(-3, 4):
            d.line([(cx - 18, cy - 18 + i), (cx + 18, cy + 18 + i)], fill=yel, width=5)
            d.line([(cx + 18, cy - 18 + i), (cx - 18, cy + 18 + i)], fill=yel, width=5)
    elif icon_kind == "back":
        d.polygon([(cx + 12, cy - 20), (cx - 16, cy), (cx + 12, cy + 20)], fill=yel)
    elif icon_kind == "map":
        d.ellipse([cx - 20, cy - 20, cx + 20, cy + 20], outline=yel, width=4)
        d.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=yel)
    elif icon_kind == "bag":
        d.rounded_rectangle([cx - 18, cy - 8, cx + 18, cy + 20], 4, outline=yel, width=4)
        d.arc([cx - 12, cy - 22, cx + 12, cy - 2], 200, 340, fill=yel, width=4)
    elif icon_kind == "ppl":
        d.ellipse([cx - 10, cy - 20, cx + 10, cy - 2], fill=yel)
        d.pieslice([cx - 20, cy - 4, cx + 20, cy + 24], 0, 180, fill=yel)
    elif icon_kind == "quest":
        d.rounded_rectangle([cx - 16, cy - 20, cx + 16, cy + 20], 3, outline=yel, width=4)
        d.line([(cx - 8, cy - 8), (cx + 8, cy - 8)], fill=yel, width=3)
        d.line([(cx - 8, cy + 2), (cx + 8, cy + 2)], fill=yel, width=3)
        d.line([(cx - 8, cy + 12), (cx + 4, cy + 12)], fill=yel, width=3)
    elif icon_kind == "menu":
        for dy in (-14, 0, 14):
            d.rounded_rectangle([cx - 18, cy + dy - 3, cx + 18, cy + dy + 3], 2, fill=yel)
    im.save(UI / name, "WEBP", quality=92, method=6)
    print("icon", name)


def make_slot(name, size=96):
    im = noise_bg(size, size, (24, 30, 48))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([2, 2, size - 3, size - 3], 12, outline=GOLD + (255,), width=3)
    d.rounded_rectangle([8, 8, size - 9, size - 9], 8, outline=GOLD_D + (160,), width=2)
    # inner sheen
    ov = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(ov).ellipse([16, 10, size - 16, 40], fill=(255, 255, 255, 25))
    im = Image.alpha_composite(im, ov)
    im.save(UI / name, "WEBP", quality=92, method=6)
    print("slot", name)


def make_avatar_frame(name, size=128):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # ornate ring
    d.ellipse([2, 2, size - 3, size - 3], outline=GOLD_D + (255,), width=8)
    d.ellipse([8, 8, size - 9, size - 9], outline=GOLD + (255,), width=4)
    d.ellipse([14, 14, size - 15, size - 15], outline=(255, 230, 160, 180), width=2)
    # gems at N/E/S/W
    for ang in (0, 90, 180, 270):
        rad = math.radians(ang)
        gx = size // 2 + int(math.cos(rad) * (size // 2 - 8))
        gy = size // 2 + int(math.sin(rad) * (size // 2 - 8))
        d.ellipse([gx - 7, gy - 7, gx + 7, gy + 7], fill=TEAL + (255,), outline=GOLD + (255,), width=2)
    im.save(UI / name, "WEBP", quality=92, method=6)
    print("frame", name)


def make_toast_bar(name, color, w=420, h=56):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    dark = tuple(max(0, c - 50) for c in color)
    d.rounded_rectangle([0, 0, w - 1, h - 1], 14, fill=dark + (235,))
    d.rounded_rectangle([2, 2, w - 3, h - 3], 12, outline=color + (255,), width=3)
    d.rounded_rectangle([3, 3, w - 4, h // 2], 10, fill=(255, 255, 255, 30))
    # icon circle
    d.ellipse([12, 10, 46, 44], fill=color + (255,), outline=GOLD + (200,), width=2)
    im.save(UI / name, "WEBP", quality=92, method=6)
    print("toast", name)


def make_banner(name, color, w=480, h=80):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # winged banner shape
    poly = [(40, 10), (w - 40, 10), (w - 10, h // 2), (w - 40, h - 10),
            (40, h - 10), (10, h // 2)]
    d.polygon(poly, fill=color + (240,), outline=GOLD + (255,))
    d.polygon([(50, 18), (w - 50, 18), (w - 24, h // 2), (w - 50, h - 18),
               (50, h - 18), (24, h // 2)], outline=GOLD2 + (200,))
    im.save(UI / name, "WEBP", quality=92, method=6)
    print("banner", name)


def main():
    make_panel("panel_lg.webp", 420, 560)
    make_panel("panel_md.webp", 360, 320)
    make_panel("panel_sm.webp", 300, 200)
    make_btn("btn_gold.webp", (196, 155, 70))
    make_btn("btn_blue.webp", (55, 95, 170))
    make_btn("btn_green.webp", (55, 140, 100))
    make_btn("btn_gray.webp", (90, 95, 110))
    make_btn("btn_red.webp", (170, 55, 65))
    for kind in ("plus", "close", "back", "map", "bag", "ppl", "quest", "menu"):
        make_icon_circle(f"ico_{kind}.webp", kind)
    make_slot("slot_item.webp")
    make_avatar_frame("frame_avatar.webp")
    make_toast_bar("toast_ok.webp", (55, 150, 110))
    make_toast_bar("toast_err.webp", (180, 55, 65))
    make_toast_bar("toast_warn.webp", (200, 140, 50))
    make_banner("banner_win.webp", (160, 50, 55))
    make_banner("banner_lose.webp", (80, 60, 120))
    # replace tab pins with circular gold icons (overwrite pin_* used by tabs)
    for src, kind in [("pin_map", "map"), ("pin_bag", "bag"), ("pin_ppl", "ppl"),
                      ("pin_quest", "quest"), ("pin_menu", "menu")]:
        make_icon_circle(f"{src}.webp", kind, 80)
    print("UI kit done")


if __name__ == "__main__":
    main()
