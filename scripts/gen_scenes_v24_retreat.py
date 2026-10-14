#!/usr/bin/env python3
"""v24: Lush HD isometric mountain-retreat scene maps.
Remixed from in-repo HD assets only — never copies user uploads / watermarks."""
from PIL import Image, ImageEnhance, ImageOps, ImageDraw, ImageFilter
import math, random
from pathlib import Path

ASSET = Path("/workspace/qianmo/assets")
W, H = 1280, 720

def load(name):
    im = Image.open(ASSET / name).convert("RGB")
    if im.size != (W, H):
        im = im.resize((W, H), Image.LANCZOS)
    return im

def save(im, stem):
    im = im.convert("RGB").resize((W, H), Image.LANCZOS)
    im.save(ASSET / f"bg_{stem}.webp", "WEBP", quality=91, method=6)
    im.save(ASSET / f"bg_{stem}.jpg", "JPEG", quality=88, optimize=True)
    print(f"OK {stem:16} {(ASSET / f'bg_{stem}.webp').stat().st_size:7d}")

def grade(im, r=1.0, g=1.0, b=1.0, sat=1.0, bright=1.0, contrast=1.0):
    R, G, B = im.split()
    R = R.point(lambda i: min(255, int(i * r)))
    G = G.point(lambda i: min(255, int(i * g)))
    B = B.point(lambda i: min(255, int(i * b)))
    arr = Image.merge("RGB", (R, G, B))
    arr = ImageEnhance.Color(arr).enhance(sat)
    arr = ImageEnhance.Brightness(arr).enhance(bright)
    arr = ImageEnhance.Contrast(arr).enhance(contrast)
    return arr

def soft_vignette(im, strength=0.22):
    w, h = im.size
    vig = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(vig)
    for i in range(36):
        a = int(255 * (1 - i / 36) * strength)
        d.ellipse([i * 9, i * 6, w - i * 9, h - i * 6], fill=a)
    vig = ImageOps.invert(vig)
    dark = Image.new("RGB", (w, h), (18, 14, 10))
    return Image.composite(dark, im, vig.point(lambda p: int(p * 0.4)))

def add_mist(im, amount=0.22, y0=60, y1=300, color=(210, 220, 230)):
    mist = Image.new("RGB", im.size, color)
    mask = Image.new("L", im.size, 0)
    px = mask.load()
    w, h = im.size
    for y in range(y0, min(y1, h)):
        t = (y - y0) / max(1, y1 - y0)
        wave = 0.5 + 0.5 * math.sin(y / 18.0)
        a = int(255 * amount * max(0, (1 - abs(t - 0.5) * 1.6)) * wave)
        for x in range(w):
            n = (x * 3 + y * 7) & 15
            px[x, y] = max(0, a - n)
    return Image.composite(mist, im, mask)

def paint_lanterns(im, points):
    d = ImageDraw.Draw(im)
    for x, y in points:
        d.rectangle([x - 3, y, x + 3, y + 8], fill=(180, 60, 50))
        d.ellipse([x - 5, y - 4, x + 5, y + 4], fill=(250, 210, 120))
        d.ellipse([x - 2, y - 1, x + 2, y + 3], fill=(255, 240, 180))
    return im

def paint_npc_dots(im, pts, colors=None):
    d = ImageDraw.Draw(im)
    colors = colors or [(60, 40, 30), (90, 55, 40), (40, 50, 70), (120, 80, 50), (70, 90, 60)]
    for i, (x, y) in enumerate(pts):
        c = colors[i % len(colors)]
        d.ellipse([x - 5, y - 2, x + 5, y + 8], fill=c)
        d.ellipse([x - 4, y - 11, x + 4, y - 3], fill=(240, 210, 180))
        d.ellipse([x - 3, y - 10, x + 3, y - 6], fill=(45, 32, 28))
        # tiny eyes
        d.point((x - 1, y - 7), fill=(30, 20, 18))
        d.point((x + 1, y - 7), fill=(30, 20, 18))
    return im

def wooden_plaque(im, text, x=36, y=640, w=150, h=48):
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([x, y, x + w, y + h], radius=6, fill=(72, 48, 28), outline=(201, 163, 90), width=2)
    d.rounded_rectangle([x + 4, y + 4, x + w - 4, y + h - 4], radius=4, fill=(110, 75, 45))
    n = max(2, min(6, len(text)))
    gap = (w - 16) / n
    for i in range(n):
        cx = x + 10 + gap * (i + 0.5)
        d.rectangle([cx - 10, y + 10, cx + 10, y + h - 10], fill=(245, 236, 214))
        d.line([cx - 5, y + 16, cx + 5, y + h - 16], fill=(35, 28, 22), width=2)
        d.line([cx - 6, y + 22, cx + 6, y + 22], fill=(35, 28, 22), width=2)
        d.line([cx, y + 14, cx, y + h - 14], fill=(35, 28, 22), width=1)
    d.polygon([(x + 8, y + h // 2), (x + 12, y + h // 2 - 4), (x + 16, y + h // 2), (x + 12, y + h // 2 + 4)], fill=(201, 163, 90))
    return im

def paint_lotus(im, pts):
    d = ImageDraw.Draw(im)
    for x, y in pts:
        d.ellipse([x - 12, y - 5, x + 12, y + 5], fill=(45, 115, 65))
        d.ellipse([x - 6, y - 10, x + 6, y + 2], fill=(230, 120, 150))
        d.ellipse([x - 3, y - 6, x + 3, y], fill=(250, 200, 80))
    return im

def paint_blossoms(im, pts, color=(240, 150, 170)):
    d = ImageDraw.Draw(im)
    rng = random.Random(77)
    for x, y in pts:
        for _ in range(8):
            ox, oy = rng.randint(-18, 18), rng.randint(-14, 14)
            r = rng.randint(3, 7)
            d.ellipse([x + ox - r, y + oy - r, x + ox + r, y + oy + r], fill=color)
    return im

def paint_peaches(im, pts):
    d = ImageDraw.Draw(im)
    for x, y in pts:
        d.ellipse([x - 7, y - 8, x + 7, y + 6], fill=(230, 110, 70))
        d.ellipse([x - 3, y - 10, x + 2, y - 4], fill=(60, 120, 50))
    return im

def paint_fence(im, x0, y0, x1, y1, posts=8):
    d = ImageDraw.Draw(im)
    for i in range(posts):
        t = i / max(1, posts - 1)
        x = int(x0 + (x1 - x0) * t)
        y = int(y0 + (y1 - y0) * t)
        d.rectangle([x - 2, y - 18, x + 2, y + 4], fill=(120, 85, 50))
    d.line([(x0, y0 - 8), (x1, y1 - 8)], fill=(140, 100, 60), width=3)
    d.line([(x0, y0 + 2), (x1, y1 + 2)], fill=(140, 100, 60), width=2)
    return im

def paint_steam(im, cx, cy, n=18, seed=5):
    rng = random.Random(seed)
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for i in range(n):
        x = cx + rng.randint(-50, 50)
        y = cy - i * 8 - rng.randint(0, 10)
        r = 10 + rng.randint(0, 12)
        d.ellipse([x - r, y - r // 2, x + r, y + r // 2], fill=(230, 240, 245, 40))
    return Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")

def blend_soft(base, overlay, box, fade=70):
    ow = overlay
    mask = Image.new("L", ow.size, 255)
    mp = mask.load()
    ww, hh = ow.size
    for x in range(min(fade, ww)):
        a = int(255 * x / fade)
        for y in range(hh):
            mp[x, y] = min(mp[x, y], a)
            mp[ww - 1 - x, y] = min(mp[ww - 1 - x, y], a)
    base.paste(ow, box, mask)
    return base

def paint_stars(im, n=90, seed=9):
    rng = random.Random(seed)
    d = ImageDraw.Draw(im)
    for _ in range(n):
        x = rng.randint(0, W - 1)
        y = rng.randint(0, int(H * 0.42))
        r = rng.choice([1, 1, 1, 2])
        d.ellipse([x - r, y - r, x + r, y + r], fill=(240, 245, 255))
    return im

def paint_snow(im, n=400, seed=3):
    rng = random.Random(seed)
    d = ImageDraw.Draw(im)
    for _ in range(n):
        x, y = rng.randint(0, W - 1), rng.randint(0, H - 1)
        r = rng.choice([1, 1, 2, 2, 3])
        d.ellipse([x - r, y - r, x + r, y + r], fill=(245, 248, 255))
    return im

# ========== PRIORITY RETREAT SCENES ==========

def make_homestead():
    """陋室 hut — bamboo mountain hut courtyard"""
    base = load("bg_homestead.webp")
    tea = load("bg_tea.webp")
    im = base.copy()
    lush = tea.crop((80, 40, 1100, 500)).resize((900, 400), Image.LANCZOS)
    lush = grade(lush, r=0.95, g=1.12, b=0.95, sat=1.15)
    im = blend_soft(im, lush, (80, 20), fade=80)
    im = grade(im, r=0.98, g=1.08, b=0.95, sat=1.12, bright=1.02, contrast=1.08)
    im = add_mist(im, 0.18, 40, 260, (200, 220, 200))
    im = paint_fence(im, 200, 520, 900, 540, posts=10)
    im = paint_lanterns(im, [(420, 300), (680, 280), (780, 320)])
    im = paint_npc_dots(im, [(480, 420), (620, 400), (720, 440), (540, 500)])
    im = wooden_plaque(im, "陋室", 36, 640, 120, 48)
    im = soft_vignette(im, 0.2)
    save(im, "homestead")

def make_busy_farm():
    """田莊 — lush farm courtyard with garden patch"""
    farm = load("bg_busy_farm.webp")
    garden = load("bg_garden.webp")
    im = farm.copy()
    patch = garden.crop((600, 200, 1200, 700)).resize((520, 400), Image.LANCZOS)
    patch = grade(patch, r=0.95, g=1.15, b=0.9, sat=1.2)
    im = blend_soft(im, patch, (720, 280), fade=60)
    im = grade(im, r=0.98, g=1.1, b=0.92, sat=1.15, bright=1.03, contrast=1.1)
    im = paint_fence(im, 780, 480, 1180, 520, posts=7)
    im = paint_blossoms(im, [(900, 350), (1050, 380)], color=(250, 180, 100))
    im = paint_npc_dots(im, [(350, 450), (520, 480), (700, 430), (880, 500), (450, 560)])
    im = paint_lanterns(im, [(400, 320), (750, 300)])
    im = wooden_plaque(im, "田莊", 36, 640, 120, 48)
    save(im, "busy_farm")

def make_yard():
    """庭院 — peach blossom courtyard"""
    yard = load("bg_yard.webp")
    pers = load("bg_persimmon.webp") if (ASSET / "bg_persimmon.webp").exists() else load("bg_garden.webp")
    im = yard.copy()
    bloom = pers.crop((100, 0, 900, 450)).resize((850, 400), Image.LANCZOS)
    bloom = grade(bloom, r=1.15, g=0.95, b=1.05, sat=1.25)
    im = blend_soft(im, bloom, (50, 10), fade=70)
    im = grade(im, r=1.08, g=1.0, b=1.02, sat=1.18, bright=1.04, contrast=1.08)
    im = paint_blossoms(im, [(280, 220), (900, 200), (1100, 280), (150, 350)], color=(245, 140, 165))
    im = paint_peaches(im, [(300, 280), (320, 300), (880, 260), (920, 290), (200, 400)])
    im = paint_fence(im, 180, 540, 1000, 560, posts=9)
    im = paint_npc_dots(im, [(420, 430), (580, 410), (720, 450)])
    im = paint_lanterns(im, [(500, 310), (700, 300)])
    im = wooden_plaque(im, "庭院", 36, 640, 120, 48)
    save(im, "yard")

def make_wish():
    """祈願樹"""
    wish = load("bg_wish.webp")
    garden = load("bg_garden.webp")
    im = wish.copy()
    canopy = garden.crop((200, 0, 1000, 400)).resize((900, 380), Image.LANCZOS)
    canopy = grade(canopy, r=1.05, g=1.1, b=0.95, sat=1.15)
    im = blend_soft(im, canopy, (180, 0), fade=80)
    im = grade(im, r=1.02, g=1.05, b=0.98, sat=1.1, contrast=1.08)
    # red wish tags
    d = ImageDraw.Draw(im)
    for i, (x, y) in enumerate([(480, 280), (520, 300), (560, 270), (600, 310), (640, 285), (700, 295)]):
        d.rectangle([x, y, x + 10, y + 28], fill=(200, 50, 55))
        d.rectangle([x + 1, y + 2, x + 9, y + 8], fill=(250, 220, 180))
    im = paint_npc_dots(im, [(400, 480), (620, 460), (780, 490)])
    im = paint_lanterns(im, [(450, 340), (720, 330)])
    im = wooden_plaque(im, "祈願樹", 36, 640, 140, 48)
    save(im, "wish")

def make_tea():
    """云海茶寮"""
    tea = load("bg_tea.webp")
    im = grade(tea, r=0.98, g=1.06, b=1.02, sat=1.08, bright=1.02, contrast=1.1)
    im = add_mist(im, 0.28, 50, 320, (220, 230, 225))
    im = paint_lanterns(im, [(460, 290), (700, 280), (820, 310)])
    im = paint_npc_dots(im, [(500, 420), (620, 400), (740, 430), (560, 480)])
    im = paint_blossoms(im, [(300, 250), (950, 240)], color=(200, 220, 180))
    im = wooden_plaque(im, "云海茶寮", 36, 640, 160, 48)
    im = soft_vignette(im, 0.18)
    save(im, "tea")

def make_rain_hut():
    """聽雨廬"""
    tea = load("bg_tea.webp")
    pond = load("bg_pond.webp")
    im = grade(tea, r=0.88, g=0.95, b=1.12, sat=0.9, bright=0.9, contrast=1.08)
    im = add_mist(im, 0.38, 30, 420, (165, 180, 200))
    d = ImageDraw.Draw(im)
    rng = random.Random(21)
    for _ in range(140):
        x, y = rng.randint(0, W), rng.randint(0, H)
        d.line([x, y, x - 2, y + 16], fill=(195, 208, 220), width=1)
    water = pond.crop((0, 480, 1280, 720)).resize((1280, 220), Image.LANCZOS)
    mask = Image.new("L", (1280, 220), 170)
    im.paste(grade(water, r=0.85, g=0.95, b=1.12), (0, 500), mask)
    im = paint_lanterns(im, [(500, 320), (680, 310)])
    im = paint_npc_dots(im, [(520, 410), (660, 420)])
    im = wooden_plaque(im, "聽雨廬", 36, 640, 140, 48)
    save(im, "rain_hut")

def make_stargaze():
    """觀星隱廬 — snowy night retreat vibe"""
    moon = load("bg_moon.webp")
    cliff = load("bg_cliff.webp")
    im = moon.copy()
    cl = grade(cliff, r=0.55, g=0.6, b=0.8, sat=0.7, bright=0.5)
    mask = Image.new("L", (W, H), 0)
    mp = mask.load()
    for y in range(H):
        a = int(170 * max(0, 1 - y / 380)) if y < 380 else 0
        for x in range(W):
            mp[x, y] = a
    im = Image.composite(cl, im, mask)
    im = grade(im, r=0.88, g=0.92, b=1.18, sat=0.92, bright=0.9, contrast=1.12)
    im = paint_stars(im, 110, seed=14)
    im = paint_snow(im, 220, seed=8)
    im = paint_lanterns(im, [(500, 380), (680, 360), (780, 400)])
    im = paint_npc_dots(im, [(540, 450), (650, 440)])
    im = add_mist(im, 0.2, 200, 480, (40, 50, 80))
    im = wooden_plaque(im, "觀星隱廬", 36, 640, 160, 48)
    save(im, "stargaze")

def make_swim():
    """水塘 — hot-spring / turquoise pool retreat"""
    swim = load("bg_swim.webp")
    garden = load("bg_garden.webp")
    im = swim.copy()
    rocks = garden.crop((0, 300, 700, 700)).resize((600, 360), Image.LANCZOS)
    rocks = grade(rocks, r=0.9, g=1.0, b=1.05, sat=1.05)
    im = blend_soft(im, rocks, (40, 300), fade=70)
    im = grade(im, r=0.9, g=1.08, b=1.18, sat=1.15, bright=1.02, contrast=1.1)
    im = paint_lotus(im, [(420, 480), (520, 510), (700, 500), (800, 470), (600, 540)])
    im = paint_steam(im, 640, 420, n=22, seed=6)
    im = paint_lanterns(im, [(380, 320), (820, 300)])
    im = paint_npc_dots(im, [(480, 400), (700, 390), (560, 480)])
    im = wooden_plaque(im, "水塘", 36, 640, 120, 48)
    save(im, "swim")

def make_garden():
    """園林"""
    garden = load("bg_garden.webp")
    im = grade(garden, r=1.0, g=1.1, b=0.98, sat=1.18, bright=1.03, contrast=1.1)
    im = paint_blossoms(im, [(250, 220), (900, 200), (1100, 300)], color=(245, 150, 175))
    im = paint_lotus(im, [(500, 520), (600, 540), (720, 510)])
    im = paint_fence(im, 200, 560, 900, 580, posts=8)
    im = paint_lanterns(im, [(420, 300), (750, 290)])
    im = paint_npc_dots(im, [(450, 420), (620, 400), (780, 440)])
    im = wooden_plaque(im, "園林", 36, 640, 120, 48)
    save(im, "garden")

def make_garden_water():
    """水榭園 — cave-pond lotus sanctuary"""
    garden = load("bg_garden.webp")
    swim = load("bg_swim.webp")
    cliff = load("bg_cliff.webp")
    im = garden.copy()
    cave = grade(cliff, r=0.85, g=0.9, b=1.0, sat=0.85, bright=0.75)
    cave_crop = cave.crop((100, 0, 1100, 400)).resize((1000, 360), Image.LANCZOS)
    im = blend_soft(im, cave_crop, (140, 0), fade=90)
    water = swim.crop((100, 280, 1100, 700)).resize((950, 380), Image.LANCZOS)
    water = grade(water, r=0.85, g=1.08, b=1.2, sat=1.15)
    im = blend_soft(im, water, (160, 300), fade=60)
    im = grade(im, r=0.95, g=1.05, b=1.1, sat=1.12, contrast=1.08)
    im = paint_lotus(im, [(400, 480), (500, 510), (650, 500), (780, 470), (580, 540)])
    im = paint_blossoms(im, [(300, 180), (900, 160)], color=(250, 160, 180))
    im = paint_lanterns(im, [(480, 280), (720, 270), (850, 320)])
    im = paint_npc_dots(im, [(520, 380), (680, 370), (600, 450)])
    im = wooden_plaque(im, "水榭園", 36, 640, 140, 48)
    save(im, "garden_water")

def make_persimmon():
    """霜柿山居"""
    pers = load("bg_persimmon.webp")
    yard = load("bg_yard.webp")
    im = pers.copy()
    trees = yard.crop((0, 0, 600, 500)).resize((550, 420), Image.LANCZOS)
    trees = grade(trees, r=1.2, g=0.95, b=0.85, sat=1.2)
    im = blend_soft(im, trees, (0, 40), fade=60)
    im = grade(im, r=1.15, g=1.0, b=0.88, sat=1.2, bright=1.02, contrast=1.1)
    im = paint_peaches(im, [(280, 300), (320, 340), (900, 280), (940, 320), (200, 400), (1000, 360)])
    im = paint_blossoms(im, [(400, 200), (850, 180)], color=(240, 120, 90))
    im = paint_npc_dots(im, [(480, 450), (650, 430), (780, 470)])
    im = paint_lanterns(im, [(500, 320), (720, 310)])
    im = wooden_plaque(im, "霜柿山居", 36, 640, 160, 48)
    save(im, "persimmon")

def make_clinic():
    """藥廬 — mountain clinic cottage"""
    clinic = load("bg_clinic.webp")
    tea = load("bg_tea.webp")
    im = clinic.copy()
    porch = tea.crop((200, 100, 900, 500)).resize((700, 360), Image.LANCZOS)
    porch = grade(porch, r=1.0, g=1.08, b=0.95, sat=1.05)
    im = blend_soft(im, porch, (300, 40), fade=70)
    im = grade(im, r=1.0, g=1.06, b=0.98, sat=1.08, bright=1.02, contrast=1.08)
    im = add_mist(im, 0.14, 80, 280, (220, 230, 210))
    im = paint_lanterns(im, [(420, 280), (700, 270)])
    im = paint_npc_dots(im, [(460, 430), (600, 410), (740, 440), (520, 500)])
    im = wooden_plaque(im, "藥廬", 36, 640, 120, 48)
    save(im, "clinic")

def make_study():
    """書齋 — cave study / scholar retreat"""
    study = load("bg_study.webp")
    academy = load("bg_academy.webp")
    cliff = load("bg_cliff.webp")
    im = study.copy()
    cave = grade(cliff, r=0.9, g=0.92, b=1.0, sat=0.8, bright=0.72)
    cave_c = cave.crop((150, 0, 1050, 380)).resize((950, 340), Image.LANCZOS)
    im = blend_soft(im, cave_c, (160, 0), fade=85)
    desk = academy.crop((300, 200, 900, 600)).resize((550, 340), Image.LANCZOS)
    desk = grade(desk, r=1.02, g=1.0, b=0.95, sat=0.95)
    im = blend_soft(im, desk, (380, 280), fade=55)
    im = grade(im, r=0.95, g=0.98, b=1.05, sat=0.92, contrast=1.1)
    im = paint_lanterns(im, [(480, 300), (720, 290), (600, 340)])
    im = paint_npc_dots(im, [(520, 420), (680, 400), (600, 480)])
    im = wooden_plaque(im, "書齋", 36, 640, 120, 48)
    save(im, "study")

def make_incense():
    """香鋪"""
    incense = load("bg_incense.webp")
    tea = load("bg_tea.webp")
    im = incense.copy()
    hall = tea.crop((150, 80, 1000, 480)).resize((800, 360), Image.LANCZOS)
    hall = grade(hall, r=1.05, g=1.0, b=0.95, sat=1.05)
    im = blend_soft(im, hall, (220, 40), fade=70)
    im = grade(im, r=1.05, g=1.02, b=0.95, sat=1.08, bright=1.0, contrast=1.08)
    # incense smoke wisps
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    rng = random.Random(11)
    for i in range(16):
        x = 560 + rng.randint(-40, 40)
        y = 360 - i * 12
        r = 8 + rng.randint(0, 10)
        d.ellipse([x - r, y - r // 2, x + r, y + r // 2], fill=(220, 215, 200, 35))
    im = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")
    im = paint_lanterns(im, [(450, 290), (720, 280)])
    im = paint_npc_dots(im, [(500, 430), (640, 410), (760, 440)])
    im = wooden_plaque(im, "香鋪", 36, 640, 120, 48)
    save(im, "incense")

def main():
    makers = [
        make_homestead, make_busy_farm, make_yard, make_wish, make_tea,
        make_rain_hut, make_stargaze, make_swim, make_garden, make_garden_water,
        make_persimmon, make_clinic, make_study, make_incense,
    ]
    for fn in makers:
        fn()
    print("ALL DONE", len(makers))

if __name__ == "__main__":
    main()
