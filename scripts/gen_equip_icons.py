#!/usr/bin/env python3
"""Original HD pixel RPG equip icons — Qin / pre-Qin aesthetic. Not based on user uploads."""
from PIL import Image, ImageDraw
from pathlib import Path

OUT = Path('/workspace/qianmo/assets/equip')
OUT.mkdir(parents=True, exist_ok=True)

# Palette — warm metal / jade Qin
BG = (42, 32, 28, 0)  # transparent
INK = (48, 36, 28, 255)
BRONZE = (168, 118, 58, 255)
BRONZE_D = (120, 78, 36, 255)
BRONZE_L = (210, 168, 96, 255)
IRON = (110, 108, 112, 255)
IRON_L = (170, 168, 172, 255)
IRON_D = (70, 68, 72, 255)
JADE = (72, 148, 118, 255)
JADE_L = (140, 198, 168, 255)
JADE_D = (40, 98, 78, 255)
GOLD = (212, 170, 72, 255)
GOLD_L = (240, 210, 120, 255)
GOLD_D = (160, 120, 40, 255)
CRIMSON = (168, 52, 48, 255)
CRIMSON_D = (110, 32, 28, 255)
BONE = (232, 214, 186, 255)
WOOD = (120, 78, 48, 255)
WOOD_L = (160, 112, 72, 255)
LEATHER = (140, 96, 64, 255)
SILK = (200, 170, 140, 255)
SHADOW = (30, 22, 18, 180)

SIZE = 32  # draw at 32, upscale to 128


def new_canvas():
    return Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))


def upscale(im, factor=4):
    return im.resize((SIZE * factor, SIZE * factor), Image.NEAREST)


def px(d, pts, c):
    for x, y in pts:
        if 0 <= x < SIZE and 0 <= y < SIZE:
            d.point((x, y), fill=c)


def fill_rect(d, x0, y0, x1, y1, c):
    d.rectangle([x0, y0, x1, y1], fill=c)


def fill_poly(d, pts, c):
    d.polygon(pts, fill=c)


def soft_frame(d):
    """Soft rounded dark frame hint."""
    # subtle corner ticks only — keep icon clean
    for x, y in [(1, 1), (SIZE - 2, 1), (1, SIZE - 2), (SIZE - 2, SIZE - 2)]:
        d.point((x, y), fill=SHADOW)


# ---- Icon drawers ----

def icon_jian():
    """Straight bronze sword."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    # blade
    fill_poly(d, [(15, 2), (17, 2), (18, 20), (14, 20)], BRONZE_L)
    fill_poly(d, [(15, 2), (16, 2), (16, 20), (14, 20)], BRONZE)
    # guard
    fill_rect(d, 11, 20, 20, 22, GOLD)
    # grip
    fill_rect(d, 14, 22, 17, 27, WOOD)
    fill_rect(d, 14, 24, 17, 24, WOOD_L)
    # pommel
    fill_rect(d, 13, 27, 18, 29, GOLD_D)
    soft_frame(d); return im


def icon_ge():
    """Dagger-axe (戈) — L-shaped bronze blade on shaft."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 14, 4, 16, 28, WOOD)  # shaft
    fill_poly(d, [(16, 6), (26, 8), (26, 12), (16, 11)], BRONZE_L)
    fill_poly(d, [(16, 7), (24, 9), (24, 11), (16, 10)], BRONZE)
    fill_rect(d, 12, 5, 17, 8, BRONZE_D)  # collar
    soft_frame(d); return im


def icon_mao():
    """Spear tip."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_poly(d, [(16, 2), (20, 12), (16, 14), (12, 12)], IRON_L)
    fill_poly(d, [(16, 2), (18, 12), (16, 13), (14, 12)], IRON)
    fill_rect(d, 14, 13, 17, 16, BRONZE)
    fill_rect(d, 15, 16, 16, 29, WOOD)
    soft_frame(d); return im


def icon_ji():
    """Halberd — spear + crescent."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 15, 4, 16, 29, WOOD)
    fill_poly(d, [(16, 3), (19, 10), (16, 12), (13, 10)], IRON_L)
    fill_poly(d, [(16, 10), (25, 12), (24, 16), (16, 14)], BRONZE)
    fill_rect(d, 13, 9, 18, 11, BRONZE_D)
    soft_frame(d); return im


def icon_nu():
    """Handheld crossbow."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    # bow arms
    fill_poly(d, [(4, 10), (16, 8), (28, 10), (28, 12), (16, 10), (4, 12)], WOOD_L)
    fill_rect(d, 14, 8, 17, 24, WOOD)
    fill_rect(d, 8, 10, 23, 11, INK)  # string
    fill_rect(d, 15, 11, 16, 18, IRON_L)  # bolt
    fill_rect(d, 12, 22, 19, 25, BRONZE)
    soft_frame(d); return im


def icon_gong():
    """Composite bow."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    # arc
    for i, y in enumerate(range(3, 29)):
        x = 10 + abs(16 - y) // 3
        d.point((x, y), fill=WOOD_L)
        d.point((x + 1, y), fill=WOOD)
        d.point((22 - (x - 10), y), fill=WOOD_L)
        d.point((21 - (x - 10), y), fill=WOOD)
    fill_rect(d, 11, 15, 20, 16, INK)  # string mid
    soft_frame(d); return im


def icon_fu():
    """Bronze axe."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 15, 6, 16, 28, WOOD)
    fill_poly(d, [(16, 6), (27, 8), (27, 16), (16, 14)], BRONZE_L)
    fill_poly(d, [(16, 7), (25, 9), (25, 15), (16, 13)], BRONZE)
    fill_rect(d, 13, 6, 17, 9, BRONZE_D)
    soft_frame(d); return im


def icon_chui():
    """War hammer / mace."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 15, 12, 16, 28, WOOD)
    fill_rect(d, 10, 5, 21, 13, IRON)
    fill_rect(d, 11, 6, 20, 12, IRON_L)
    fill_rect(d, 13, 7, 18, 11, IRON_D)
    soft_frame(d); return im


def icon_bian():
    """Leather whip coiled."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 12, 4, 15, 10, WOOD)  # handle
    # coils
    for r, c in [(6, LEATHER), (4, WOOD_L), (2, LEATHER)]:
        d.ellipse([16 - r, 12 - r // 2, 16 + r + 6, 22 + r // 2], outline=c, width=2)
    fill_poly(d, [(26, 18), (29, 24), (27, 25), (24, 20)], LEATHER)
    soft_frame(d); return im


def icon_dao():
    """Curved saber / dao."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_poly(d, [(10, 4), (18, 3), (22, 18), (16, 20), (12, 10)], IRON_L)
    fill_poly(d, [(12, 5), (17, 4), (20, 17), (16, 18)], IRON)
    fill_rect(d, 14, 19, 19, 21, GOLD)
    fill_rect(d, 15, 21, 18, 27, WOOD)
    fill_rect(d, 14, 27, 19, 29, GOLD_D)
    soft_frame(d); return im


def icon_jia():
    """Lamellar armor torso."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_poly(d, [(8, 8), (24, 8), (26, 26), (6, 26)], BRONZE_D)
    for y in range(9, 25, 3):
        for x in range(9, 24, 4):
            fill_rect(d, x, y, x + 3, y + 2, BRONZE_L if (x + y) % 8 else BRONZE)
    fill_rect(d, 10, 6, 13, 9, LEATHER)  # strap
    fill_rect(d, 19, 6, 22, 9, LEATHER)
    soft_frame(d); return im


def icon_kai():
    """Scale / plate chest."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_poly(d, [(9, 7), (23, 7), (25, 25), (7, 25)], IRON_D)
    for y in range(8, 24, 3):
        ox = (y // 3) % 2
        for x in range(9 + ox, 23, 4):
            d.ellipse([x, y, x + 3, y + 2], fill=IRON_L)
    fill_rect(d, 14, 5, 17, 8, GOLD)
    soft_frame(d); return im


def icon_dun():
    """Round bronze shield."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    d.ellipse([5, 5, 26, 26], fill=BRONZE_D)
    d.ellipse([7, 7, 24, 24], fill=BRONZE)
    d.ellipse([12, 12, 19, 19], fill=GOLD)
    d.ellipse([14, 14, 17, 17], fill=GOLD_L)
    # boss cross
    fill_rect(d, 15, 8, 16, 23, BRONZE_L)
    fill_rect(d, 8, 15, 23, 16, BRONZE_L)
    soft_frame(d); return im


def icon_zhou():
    """Helmet / 胄."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_poly(d, [(8, 14), (16, 4), (24, 14), (22, 22), (10, 22)], IRON)
    fill_poly(d, [(10, 14), (16, 6), (22, 14)], IRON_L)
    fill_rect(d, 7, 20, 24, 24, BRONZE_D)
    fill_rect(d, 15, 3, 16, 8, GOLD)  # plume pin
    fill_poly(d, [(16, 2), (18, 6), (14, 6)], CRIMSON)
    soft_frame(d); return im


def icon_yu():
    """Bi disc jade."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    d.ellipse([6, 6, 25, 25], fill=JADE_D)
    d.ellipse([8, 8, 23, 23], fill=JADE)
    d.ellipse([12, 12, 19, 19], fill=(0, 0, 0, 0))
    # punch hole by redrawing bg — use dark jade ring look
    d.ellipse([12, 12, 19, 19], fill=JADE_L)
    d.ellipse([13, 13, 18, 18], fill=(0, 0, 0, 0))
    soft_frame(d); return im


def icon_pei():
    """Jade pendant hanging."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 15, 3, 16, 8, GOLD)  # cord
    d.ellipse([14, 2, 17, 5], fill=GOLD_L)
    fill_poly(d, [(16, 8), (22, 14), (16, 26), (10, 14)], JADE)
    fill_poly(d, [(16, 10), (20, 14), (16, 22), (12, 14)], JADE_L)
    soft_frame(d); return im


def icon_huan():
    """Ring / bracelet."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    d.ellipse([6, 8, 25, 24], outline=GOLD_D, width=3)
    d.ellipse([8, 10, 23, 22], outline=GOLD, width=2)
    d.ellipse([10, 12, 21, 20], outline=GOLD_L, width=1)
    fill_rect(d, 14, 8, 17, 11, JADE)  # inlay
    soft_frame(d); return im


def icon_yin():
    """Official seal / 印."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 8, 10, 23, 26, CRIMSON_D)
    fill_rect(d, 9, 11, 22, 25, CRIMSON)
    # knob
    fill_rect(d, 13, 5, 18, 11, GOLD)
    fill_rect(d, 14, 4, 17, 6, GOLD_L)
    # carved character suggestion (田-like)
    fill_rect(d, 12, 14, 19, 15, BONE)
    fill_rect(d, 12, 18, 19, 19, BONE)
    fill_rect(d, 12, 14, 13, 22, BONE)
    fill_rect(d, 18, 14, 19, 22, BONE)
    fill_rect(d, 15, 14, 16, 22, BONE)
    soft_frame(d); return im


def icon_fu():
    """Talisman / 符 — silk strip with marks."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 10, 4, 21, 28, BONE)
    fill_rect(d, 11, 5, 20, 27, SILK)
    fill_rect(d, 13, 3, 18, 6, CRIMSON)
    for y in (9, 13, 17, 21):
        fill_rect(d, 13, y, 18, y + 1, CRIMSON_D)
    fill_rect(d, 14, 11, 15, 19, CRIMSON)
    soft_frame(d); return im


def icon_dai():
    """Medicine / coin pouch."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_poly(d, [(8, 12), (24, 12), (26, 24), (6, 24)], LEATHER)
    fill_poly(d, [(9, 13), (23, 13), (24, 22), (8, 22)], WOOD_L)
    fill_rect(d, 12, 8, 19, 13, WOOD)
    fill_rect(d, 14, 6, 17, 9, GOLD)
    d.ellipse([13, 16, 18, 20], fill=GOLD_L)
    soft_frame(d); return im


def icon_chu():
    """Hoe / 鋤."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 15, 4, 16, 22, WOOD)
    fill_poly(d, [(8, 20), (24, 18), (24, 24), (8, 26)], IRON)
    fill_poly(d, [(9, 21), (23, 19), (23, 23), (9, 25)], IRON_L)
    soft_frame(d); return im


def icon_lian():
    """Sickle / 鐮."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 8, 18, 18, 21, WOOD)
    # blade arc
    for t in range(0, 20):
        import math
        ang = math.radians(-40 + t * 7)
        x = int(18 + 10 * math.cos(ang))
        y = int(18 + 10 * math.sin(ang))
        d.point((x, y), fill=IRON_L)
        d.point((x, y + 1), fill=IRON)
        d.point((x - 1, y), fill=IRON)
    soft_frame(d); return im


def icon_li():
    """Plow blade / 犁."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 8, 8, 11, 26, WOOD)
    fill_rect(d, 10, 10, 22, 13, WOOD_L)
    fill_poly(d, [(20, 12), (28, 22), (18, 24), (16, 16)], IRON)
    fill_poly(d, [(21, 14), (26, 21), (19, 22)], IRON_L)
    soft_frame(d); return im


def icon_bi():
    """Writing brush / 筆 — scholar tool-acc."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 15, 4, 16, 22, WOOD_L)
    fill_rect(d, 14, 3, 17, 5, GOLD)
    fill_poly(d, [(14, 22), (17, 22), (16, 29), (15, 29)], INK)
    soft_frame(d); return im


def icon_jian_dual():
    """Short dagger / 匕首."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_poly(d, [(16, 4), (18, 16), (16, 18), (14, 16)], IRON_L)
    fill_rect(d, 12, 17, 19, 19, BRONZE)
    fill_rect(d, 14, 19, 17, 26, WOOD)
    fill_rect(d, 13, 26, 18, 28, GOLD_D)
    soft_frame(d); return im


def icon_mirror():
    """Bronze mirror / 護心鏡."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    d.ellipse([5, 5, 26, 26], fill=BRONZE_D)
    d.ellipse([7, 7, 24, 24], fill=BRONZE_L)
    d.ellipse([10, 10, 21, 21], fill=BRONZE)
    d.ellipse([13, 13, 18, 18], fill=GOLD)
    soft_frame(d); return im


def icon_boots():
    """Leather boots / 履 — armor feet as accessory-like."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_poly(d, [(8, 10), (16, 10), (18, 26), (6, 26)], LEATHER)
    fill_poly(d, [(16, 12), (24, 10), (26, 26), (16, 26)], WOOD)
    fill_rect(d, 7, 24, 25, 27, IRON_D)
    soft_frame(d); return im


def icon_belt():
    """Belt buckle / 革帶."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 4, 13, 27, 18, LEATHER)
    fill_rect(d, 5, 14, 26, 17, WOOD_L)
    fill_rect(d, 12, 11, 19, 20, GOLD)
    fill_rect(d, 13, 12, 18, 19, GOLD_L)
    soft_frame(d); return im


def icon_arrow():
    """Arrow bundle."""
    im = new_canvas(); d = ImageDraw.Draw(im)
    for ox, c in [(0, IRON_L), (3, IRON), (6, IRON_L)]:
        fill_rect(d, 12 + ox, 6, 13 + ox, 24, WOOD_L)
        fill_poly(d, [(12 + ox, 4), (14 + ox, 8), (11 + ox, 8)], IRON)
        fill_poly(d, [(12 + ox, 24), (14 + ox, 28), (10 + ox, 28)], CRIMSON)
    soft_frame(d); return im


ICONS = {
    'jian': icon_jian,
    'ge': icon_ge,
    'mao': icon_mao,
    'ji': icon_ji,
    'nu': icon_nu,
    'gong': icon_gong,
    'fu': icon_fu,
    'chui': icon_chui,
    'bian': icon_bian,
    'dao': icon_dao,
    'jia': icon_jia,
    'kai': icon_kai,
    'dun': icon_dun,
    'zhou': icon_zhou,
    'yu': icon_yu,
    'pei': icon_pei,
    'huan': icon_huan,
    'yin': icon_yin,
    'talisman': icon_fu,  # 符 — rename key
    'dai': icon_dai,
    'chu': icon_chu,
    'lian': icon_lian,
    'li': icon_li,
    'bi': icon_bi,
    'bishou': icon_jian_dual,
    'mirror': icon_mirror,
    'boots': icon_boots,
    'belt': icon_belt,
    'arrow': icon_arrow,
}

# Fix: icon_fu used for both axe and talisman — axe is icon_fu_axe
# Rebuild axe under axe key - already have icon_fu as axe in first definition
# Wait - I overwrote: def icon_fu for talisman replaced axe. Fix:

def icon_axe():
    return icon_fu.__wrapped__ if False else None

# Redefine properly
def icon_axe_blade():
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 15, 6, 16, 28, WOOD)
    fill_poly(d, [(16, 6), (27, 8), (27, 16), (16, 14)], BRONZE_L)
    fill_poly(d, [(16, 7), (25, 9), (25, 15), (16, 13)], BRONZE)
    fill_rect(d, 13, 6, 17, 9, BRONZE_D)
    soft_frame(d); return im


def icon_talisman():
    im = new_canvas(); d = ImageDraw.Draw(im)
    fill_rect(d, 10, 4, 21, 28, BONE)
    fill_rect(d, 11, 5, 20, 27, SILK)
    fill_rect(d, 13, 3, 18, 6, CRIMSON)
    for y in (9, 13, 17, 21):
        fill_rect(d, 13, y, 18, y + 1, CRIMSON_D)
    fill_rect(d, 14, 11, 15, 19, CRIMSON)
    soft_frame(d); return im


ICONS['fu'] = icon_axe_blade
ICONS['talisman'] = icon_talisman

def main():
    written = []
    for name, fn in ICONS.items():
        im = upscale(fn(), 4)
        path = OUT / f'{name}.webp'
        im.save(path, 'WEBP', quality=90, method=6)
        # also png fallback
        im.save(OUT / f'{name}.png', 'PNG')
        written.append(name)
        print('wrote', name, im.size)
    print('TOTAL', len(written))

if __name__ == '__main__':
    main()
