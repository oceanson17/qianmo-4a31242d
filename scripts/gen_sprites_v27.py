#!/usr/bin/env python3
"""v27 original cute pixel-chibi sprites (GenerateImage unavailable in executor).
Drawn at 64×64 / 48×64 then NEAREST upscaled — classic Q-version RPG look.
No reference pixels / watermarks copied."""
from __future__ import annotations
from PIL import Image, ImageDraw
from pathlib import Path

ASSET = Path("/workspace/qianmo/assets")

# skin, skin_s, hair, robe, robe_d, accent, sash, lip, eye, detail
C = {
    "hero":      ((252,216,190),(222,176,146),(28,24,32),(68,118,188),(42,78,138),(248,244,236),(188,52,58),(208,108,112),(45,38,50),(255,255,255)),
    "farmer_m":  ((238,198,160),(202,158,122),(52,40,34),(82,128,88),(52,92,58),(200,170,100),(118,82,48),(172,96,90),(50,40,34),(185,155,90)),
    "farmer_f":  ((254,220,200),(228,182,160),(28,24,30),(212,98,112),(162,58,78),(255,214,188),(172,72,88),(220,118,128),(55,42,48),(240,130,145)),
    "merchant":  ((242,204,170),(208,164,130),(52,40,34),(168,112,62),(122,76,42),(224,184,105),(98,66,42),(168,92,86),(48,38,32),(95,65,42)),
    "scholar":   ((246,218,190),(210,174,144),(52,50,58),(98,126,172),(64,86,128),(248,248,252),(72,88,112),(158,96,96),(42,40,50),(48,52,68)),
    "soldier":   ((236,198,168),(198,158,128),(34,34,40),(108,112,122),(68,72,82),(205,55,55),(152,48,48),(152,88,82),(40,38,42),(138,142,152)),
    "doctor":    ((242,212,180),(208,170,140),(210,208,200),(78,148,138),(48,108,100),(252,252,254),(55,118,108),(158,96,92),(44,44,44),(248,248,250)),
    "craftsman": ((236,194,160),(200,154,122),(44,38,34),(142,102,78),(102,72,52),(214,174,95),(78,78,82),(158,90,82),(42,36,32),(90,90,95)),
    "hunter":    ((232,192,156),(194,152,120),(40,34,32),(78,112,76),(54,80,52),(172,122,72),(108,78,48),(152,88,80),(40,45,35),(60,70,50)),
    "ranger":    ((248,212,182),(212,170,140),(26,24,32),(72,94,142),(46,62,102),(232,218,178),(152,58,58),(178,98,98),(42,38,50),(250,250,252)),
}


def put(px, x, y, c, w=64, h=64):
    if 0 <= x < w and 0 <= y < h and len(c) >= 3:
        a = c[3] if len(c) > 3 else 255
        if a:
            px[x, y] = (c[0], c[1], c[2], a)


def fill_ellipse(px, cx, cy, rx, ry, c, w=64, h=64):
    for y in range(cy - ry, cy + ry + 1):
        for x in range(cx - rx, cx + rx + 1):
            if ((x - cx) / max(rx, 1)) ** 2 + ((y - cy) / max(ry, 1)) ** 2 <= 1.0:
                put(px, x, y, c, w, h)


def fill_rect(px, x0, y0, x1, y1, c, w=64, h=64):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            put(px, x, y, c, w, h)


def draw_face64(key: str) -> Image.Image:
    skin, skin_s, hair, robe, robe_d, accent, sash, lip, eye, detail = C[key]
    im = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    px = im.load()

    # head
    fill_ellipse(px, 32, 34, 22, 24, skin)
    # right shade
    for y in range(20, 55):
        for x in range(38, 54):
            if ((x - 32) / 22) ** 2 + ((y - 34) / 24) ** 2 <= 1:
                put(px, x, y, skin_s + (180,))

    # hair back / crown
    fill_ellipse(px, 32, 22, 24, 18, hair)
    # side hair curtains (leave eyes clear ~ y28-40, x22-42)
    fill_ellipse(px, 14, 32, 8, 16, hair)
    fill_ellipse(px, 50, 32, 8, 16, hair)
    # fringe above eyes
    for x, yo in [(20, 22), (26, 20), (32, 19), (38, 20), (44, 22)]:
        fill_ellipse(px, x, yo, 4, 5, hair)

    # style extras
    if key == "farmer_f":
        fill_ellipse(px, 14, 16, 7, 7, hair)
        fill_ellipse(px, 50, 16, 7, 7, hair)
        fill_ellipse(px, 14, 10, 3, 3, detail)
        fill_ellipse(px, 50, 10, 3, 3, detail)
    elif key in ("hero", "ranger"):
        fill_ellipse(px, 32, 8, 6, 7, hair)
        fill_ellipse(px, 32, 14, 3, 3, accent)
        if key == "ranger":
            fill_ellipse(px, 54, 40, 6, 14, hair)
    elif key == "farmer_m":
        # douli brim
        for x in range(6, 58):
            put(px, x, 18, detail)
            put(px, x, 19, detail)
        fill_ellipse(px, 32, 14, 10, 6, detail)
        # beard
        fill_ellipse(px, 32, 50, 10, 6, (70, 55, 45, 230))
    elif key == "scholar":
        fill_rect(px, 16, 12, 48, 22, detail)
        fill_rect(px, 28, 4, 36, 14, detail)
        put(px, 32, 24, (210, 185, 95, 255))
    elif key == "soldier":
        fill_ellipse(px, 32, 18, 20, 14, detail)
        fill_rect(px, 30, 2, 34, 16, (205, 55, 55, 255))
        put(px, 32, 1, (205, 55, 55, 255))
    elif key == "merchant":
        fill_ellipse(px, 32, 16, 20, 8, detail)
        fill_ellipse(px, 32, 50, 9, 5, (70, 55, 45, 220))
    elif key == "doctor":
        fill_ellipse(px, 32, 16, 22, 8, detail)
        fill_ellipse(px, 32, 52, 12, 10, (245, 245, 248, 255))
    elif key == "hunter":
        fill_ellipse(px, 32, 18, 22, 12, robe_d)
    elif key == "craftsman":
        fill_rect(px, 14, 20, 50, 26, detail)

    # eyes — cute, forward, with pupils + shine
    for ex in (24, 40):
        fill_ellipse(px, ex, 34, 5, 6, (255, 255, 252, 255))
        fill_ellipse(px, ex, 35, 3, 4, eye)
        put(px, ex - 1, 33, (255, 255, 255, 255))
        put(px, ex, 33, (255, 255, 255, 255))
        # lid
        for x in range(ex - 5, ex + 6):
            put(px, x, 29, hair)
    # brows
    for x in range(19, 29):
        put(px, x, 27, (40, 32, 36, 255))
    for x in range(35, 45):
        put(px, x, 27, (40, 32, 36, 255))

    # blush
    fill_ellipse(px, 18, 42, 4, 3, (245, 130, 130, 120))
    fill_ellipse(px, 46, 42, 4, 3, (245, 130, 130, 120))
    # mouth
    put(px, 30, 46, lip)
    put(px, 31, 47, lip)
    put(px, 32, 47, lip)
    put(px, 33, 47, lip)
    put(px, 34, 46, lip)

    # collar
    for x in range(18, 47):
        put(px, x, 58, robe)
        put(px, x, 59, robe)
        put(px, x, 60, robe)
        put(px, x, 61, robe_d if x > 36 else robe)
    put(px, 30, 56, accent)
    put(px, 31, 57, accent)
    put(px, 32, 58, accent)
    put(px, 33, 57, accent)
    put(px, 34, 56, accent)

    return im.resize((320, 320), Image.NEAREST)


def draw_char48(key: str) -> Image.Image:
    """48×64 body pixel sprite, ¾ lean."""
    skin, skin_s, hair, robe, robe_d, accent, sash, lip, eye, detail = C[key]
    W, H = 48, 64
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = im.load()

    # legs
    fill_rect(px, 16, 48, 20, 58, robe_d, W, H)
    fill_rect(px, 26, 49, 30, 59, robe, W, H)
    fill_ellipse(px, 18, 60, 4, 2, (35, 32, 38, 255), W, H)
    fill_ellipse(px, 28, 61, 4, 2, (35, 32, 38, 255), W, H)

    # torso
    for y in range(28, 50):
        for x in range(12, 36):
            # taper
            if y < 32 and (x < 14 or x > 33):
                continue
            c = robe_d if x > 26 else robe
            put(px, x, y, c, W, H)
    # sash
    fill_rect(px, 12, 40, 35, 43, sash, W, H)
    # collar V
    put(px, 22, 28, accent, W, H)
    put(px, 23, 29, accent, W, H)
    put(px, 24, 30, accent, W, H)
    put(px, 25, 29, accent, W, H)
    put(px, 26, 28, accent, W, H)

    # arms
    fill_rect(px, 6, 30, 11, 44, robe, W, H)
    fill_ellipse(px, 8, 46, 3, 3, skin, W, H)
    fill_rect(px, 36, 29, 41, 44, robe_d, W, H)
    fill_ellipse(px, 39, 46, 3, 3, skin, W, H)

    # prop hint
    if key in ("hero", "ranger", "soldier"):
        fill_rect(px, 40, 20, 42, 48, (200, 210, 220, 255) if key != "soldier" else (140, 100, 60, 255), W, H)
    if key == "farmer_m":
        fill_rect(px, 4, 36, 44, 37, (135, 95, 55, 255), W, H)

    # head from mini face (paste small)
    face = draw_face64(key).resize((28, 28), Image.NEAREST)
    im.paste(face, (10, 2), face)

    # upscale to 288×400
    out = im.resize((288, 400), Image.NEAREST)
    return out


def main():
    for k in C:
        f = draw_face64(k)
        f.save(ASSET / f"face_{k}.webp", "WEBP", quality=95, method=6)
        c = draw_char48(k)
        c.save(ASSET / f"char_{k}.webp", "WEBP", quality=95, method=6)
        print("ok", k, f.size, c.size)


if __name__ == "__main__":
    main()
