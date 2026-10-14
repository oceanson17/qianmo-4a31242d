#!/usr/bin/env python3
"""v23: Original HD isometric pixel scene maps by remixing in-repo HD assets.
NEVER copies user uploads / style-ref JPGs. Warm Qin-era RPG map aesthetic."""
from PIL import Image, ImageEnhance, ImageOps, ImageDraw, ImageFilter, ImageFont
import os, math, random
from pathlib import Path

ASSET = Path("/workspace/qianmo/assets")
W, H = 1280, 720

def load(name):
    p = ASSET / name
    im = Image.open(p).convert("RGB")
    if im.size != (W, H):
        im = im.resize((W, H), Image.LANCZOS)
    return im

def save(im, stem):
    im = im.convert("RGB").resize((W, H), Image.LANCZOS)
    webp = ASSET / f"bg_{stem}.webp"
    im.save(webp, "WEBP", quality=90, method=6)
    jpg = ASSET / f"bg_{stem}.jpg"
    # only write jpg if game.js references a distinct jpg path that exists historically
    im.save(jpg, "JPEG", quality=88, optimize=True)
    print(f"OK {stem:16} {webp.stat().st_size:7d}")

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

def soft_vignette(im, strength=0.28):
    w, h = im.size
    vig = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(vig)
    for i in range(40):
        a = int(255 * (1 - i / 40) * strength)
        d.ellipse([i * 8, i * 5, w - i * 8, h - i * 5], fill=a)
    vig = ImageOps.invert(vig)
    dark = Image.new("RGB", (w, h), (20, 15, 10))
    return Image.composite(dark, im, vig.point(lambda p: int(p * 0.45)))

def add_mist(im, amount=0.25, y0=80, y1=320, color=(210, 220, 230)):
    mist = Image.new("RGB", im.size, color)
    mask = Image.new("L", im.size, 0)
    px = mask.load()
    w, h = im.size
    for y in range(y0, min(y1, h)):
        t = (y - y0) / max(1, y1 - y0)
        wave = 0.5 + 0.5 * math.sin(y / 18)
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

def paint_boats(im, boats):
    d = ImageDraw.Draw(im)
    for x, y, L in boats:
        d.ellipse([x - L, y - 6, x + L, y + 6], fill=(110, 70, 45))
        d.rectangle([x - L // 2, y - 18, x + L // 2, y - 4], fill=(200, 190, 170))
        d.rectangle([x - L // 2 + 2, y - 22, x + L // 2 - 2, y - 16], fill=(90, 60, 40))
    return im

def paint_crates(im, pts):
    d = ImageDraw.Draw(im)
    for x, y in pts:
        d.rectangle([x, y, x + 18, y + 14], fill=(140, 95, 55), outline=(90, 60, 35))
        d.line([x, y + 7, x + 18, y + 7], fill=(90, 60, 35))
    return im

def paint_npc_dots(im, pts, colors=None):
    """Tiny readable NPC silhouettes (head+body) — faces too small at map scale but readable shapes."""
    d = ImageDraw.Draw(im)
    colors = colors or [(60, 40, 30), (90, 55, 40), (40, 50, 70), (120, 80, 50)]
    for i, (x, y) in enumerate(pts):
        c = colors[i % len(colors)]
        # body
        d.ellipse([x - 4, y - 2, x + 4, y + 6], fill=c)
        # head (lighter)
        d.ellipse([x - 3, y - 9, x + 3, y - 3], fill=(240, 210, 180))
        d.ellipse([x - 2, y - 8, x + 2, y - 5], fill=(50, 35, 30))  # hair
    return im

def wooden_plaque(im, text, x=36, y=640, w=150, h=48):
    """Dark wood plaque with cream calligraphy blocks (glyph-agnostic stylized strokes)."""
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([x, y, x + w, y + h], radius=6, fill=(72, 48, 28), outline=(201, 163, 90), width=2)
    d.rounded_rectangle([x + 4, y + 4, x + w - 4, y + h - 4], radius=4, fill=(110, 75, 45))
    # stylized character blocks — number matches Chinese plaque length
    n = max(2, min(6, len(text)))
    gap = (w - 16) / n
    for i in range(n):
        cx = x + 10 + gap * (i + 0.5)
        # cream tablet
        d.rectangle([cx - 10, y + 10, cx + 10, y + h - 10], fill=(245, 236, 214))
        # ink strokes (not real glyphs — decorative)
        d.line([cx - 5, y + 16, cx + 5, y + h - 16], fill=(35, 28, 22), width=2)
        d.line([cx - 6, y + 22, cx + 6, y + 22], fill=(35, 28, 22), width=2)
        d.line([cx, y + 14, cx, y + h - 14], fill=(35, 28, 22), width=1)
    # tiny gold diamond accents
    d.polygon([(x + 8, y + h // 2), (x + 12, y + h // 2 - 4), (x + 16, y + h // 2), (x + 12, y + h // 2 + 4)], fill=(201, 163, 90))
    return im

def paint_rope_bridge(im, x0, y0, x1, y1, posts=6):
    d = ImageDraw.Draw(im)
    for i in range(posts):
        t = i / (posts - 1)
        x = int(x0 + (x1 - x0) * t)
        y = int(y0 + (y1 - y0) * t + 8 * math.sin(t * math.pi))
        d.line([x, y - 18, x, y + 4], fill=(90, 60, 35), width=3)
        d.ellipse([x - 3, y - 20, x + 3, y - 14], fill=(120, 80, 45))
    # ropes
    for off in (-10, 0, 10):
        pts = []
        for i in range(posts * 3):
            t = i / (posts * 3 - 1)
            x = int(x0 + (x1 - x0) * t)
            y = int(y0 + (y1 - y0) * t + 10 * math.sin(t * math.pi) + off * 0.3)
            pts.append((x, y))
        d.line(pts, fill=(140, 100, 60), width=2)
    # planks
    for i in range(posts * 2):
        t = i / (posts * 2)
        x = int(x0 + (x1 - x0) * t)
        y = int(y0 + (y1 - y0) * t + 10 * math.sin(t * math.pi))
        d.rectangle([x - 8, y - 2, x + 8, y + 3], fill=(150, 110, 70), outline=(90, 60, 35))
    return im

def paint_banners(im, pts, color=(40, 80, 140)):
    d = ImageDraw.Draw(im)
    for x, y in pts:
        d.rectangle([x, y, x + 4, y + 50], fill=(90, 60, 40))
        d.rectangle([x + 4, y + 4, x + 28, y + 40], fill=color)
        d.ellipse([x + 10, y + 14, x + 22, y + 26], outline=(240, 240, 240), width=2)
    return im

def paint_sparks(im, cx, cy, n=40, seed=3):
    rng = random.Random(seed)
    d = ImageDraw.Draw(im)
    for _ in range(n):
        x = cx + rng.randint(-40, 40)
        y = cy + rng.randint(-60, 20)
        r = rng.randint(1, 3)
        col = rng.choice([(255, 200, 80), (255, 140, 40), (255, 90, 30)])
        d.ellipse([x - r, y - r, x + r, y + r], fill=col)
    return im

def paint_stars(im, n=80, seed=9):
    rng = random.Random(seed)
    d = ImageDraw.Draw(im)
    for _ in range(n):
        x = rng.randint(0, W - 1)
        y = rng.randint(0, int(H * 0.45))
        r = rng.choice([1, 1, 1, 2])
        d.ellipse([x - r, y - r, x + r, y + r], fill=(240, 245, 255))
    return im

def paint_lotus(im, pts):
    d = ImageDraw.Draw(im)
    for x, y in pts:
        d.ellipse([x - 10, y - 4, x + 10, y + 4], fill=(50, 120, 70))
        d.ellipse([x - 5, y - 8, x + 5, y + 2], fill=(230, 120, 150))
    return im

def blend_soft(base, overlay, box, fade=80):
    """Paste overlay at box with left/right soft edges."""
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

# ========== SCENE BUILDERS ==========

def make_gorge():
    """雲縫谷 — cliff canyon + mist + rope bridge + cave glow"""
    cliff = load("bg_cliff.webp")
    pond = load("bg_pond.webp")
    im = cliff.copy()
    # cool deep gorge grade
    im = grade(im, r=0.85, g=0.95, b=1.12, sat=1.05, bright=0.92, contrast=1.15)
    # add water strip from pond lower third
    water = pond.crop((0, 400, 1280, 720)).resize((1280, 280), Image.LANCZOS)
    water = grade(water, r=0.7, g=0.9, b=1.2, sat=1.1, bright=0.85)
    mask = Image.new("L", (1280, 280), 0)
    mp = mask.load()
    for y in range(280):
        a = int(200 * (y / 280) ** 0.7)
        for x in range(1280):
            mp[x, y] = a
    im.paste(water, (0, 440), mask)
    im = add_mist(im, 0.35, 40, 280, (180, 200, 220))
    im = add_mist(im, 0.22, 300, 500, (160, 180, 200))
    # cave glow (orange)
    glow = Image.new("RGB", im.size, (255, 120, 40))
    gmask = Image.new("L", im.size, 0)
    gd = ImageDraw.Draw(gmask)
    gd.ellipse([900, 280, 1100, 420], fill=140)
    gmask = gmask.filter(ImageFilter.GaussianBlur(30))
    im = Image.composite(glow, im, gmask.point(lambda p: int(p * 0.35)))
    im = paint_rope_bridge(im, 280, 340, 820, 380, posts=7)
    im = paint_npc_dots(im, [(360, 350), (520, 365), (700, 375), (450, 520)])
    im = paint_lanterns(im, [(300, 300), (800, 320)])
    im = wooden_plaque(im, "雲縫谷", 36, 640, 140, 48)
    im = soft_vignette(im, 0.3)
    save(im, "gorge")

def make_canal_hq():
    """漕幫總壇 — dock HQ with warehouses, boats, banners"""
    canal = load("bg_canal.webp")
    town = load("bg_town.webp")
    im = canal.copy()
    # blend town roofs into upper band for HQ buildings
    roof = town.crop((100, 20, 1100, 340)).resize((1000, 300), Image.LANCZOS)
    roof = grade(roof, r=1.0, g=0.98, b=1.02, sat=1.05, contrast=1.05)
    im = blend_soft(im, roof, (140, 10), fade=60)
    im = grade(im, r=0.98, g=1.0, b=1.06, sat=1.05, contrast=1.1)
    im = paint_boats(im, [(260, 500, 52), (640, 530, 46), (980, 470, 50)])
    im = paint_crates(im, [(300, 370), (340, 380), (380, 375), (900, 350), (940, 360), (500, 390)])
    im = paint_banners(im, [(420, 180), (560, 170), (720, 185)], color=(35, 90, 150))
    im = paint_lanterns(im, [(400, 320), (700, 300), (850, 340)])
    im = paint_npc_dots(im, [(350, 400), (480, 420), (620, 410), (800, 390), (520, 500)])
    im = wooden_plaque(im, "漕幫總壇", 36, 640, 160, 48)
    save(im, "canal_hq")

def make_dragon_bridge():
    """雙龍橋 — grand bridge over turquoise water"""
    bridge = load("bg_bridge.webp")
    garden = load("bg_garden.webp")
    # zoom on bridge
    im = bridge.crop((80, 20, 1200, 700)).resize((W, H), Image.LANCZOS)
    # blend garden water tones
    waterish = garden.crop((200, 300, 1000, 700)).resize((900, 360), Image.LANCZOS)
    waterish = grade(waterish, r=0.7, g=1.1, b=1.25, sat=1.2)
    mask = Image.new("L", waterish.size, 0)
    mp = mask.load()
    ww, hh = waterish.size
    for y in range(hh):
        for x in range(ww):
            mp[x, y] = int(160 * (y / hh))
    im.paste(waterish, (190, 360), mask)
    im = grade(im, r=0.95, g=1.05, b=1.1, sat=1.12, bright=1.02, contrast=1.08)
    im = paint_lotus(im, [(300, 520), (360, 540), (900, 500), (960, 530), (500, 560)])
    im = paint_boats(im, [(220, 480, 40), (1000, 500, 38)])
    im = paint_npc_dots(im, [(520, 300), (600, 310), (680, 290), (640, 400)])
    im = paint_lanterns(im, [(500, 260), (700, 250)])
    im = wooden_plaque(im, "雙龍橋", 36, 640, 140, 48)
    save(im, "dragon_bridge")

def make_iron_league():
    """鐵盟坊 — forge workshop"""
    forge = load("bg_forge.webp")
    tavern = load("bg_tavern.webp")
    im = forge.copy()
    # warmer forge glow
    im = grade(im, r=1.18, g=0.92, b=0.78, sat=1.12, bright=0.95, contrast=1.15)
    # paste forge-y roof from tavern corner
    piece = tavern.crop((600, 40, 1100, 400)).resize((480, 340), Image.LANCZOS)
    im = blend_soft(im, grade(piece, r=1.1, g=0.9, b=0.8), (720, 40), fade=50)
    im = paint_sparks(im, 640, 360, n=50, seed=5)
    im = paint_crates(im, [(200, 480), (240, 490), (900, 470)])
    im = paint_npc_dots(im, [(400, 450), (560, 440), (700, 460), (820, 450)])
    im = paint_lanterns(im, [(380, 300), (780, 280)])
    im = wooden_plaque(im, "鐵盟坊", 36, 640, 140, 48)
    im = soft_vignette(im, 0.25)
    save(im, "iron_league")

def make_stargaze():
    """觀星隱廬 — night mountain hut + stars"""
    moon = load("bg_moon.webp")
    cliff = load("bg_cliff.webp")
    im = moon.copy()
    # blend cliff silhouette upper
    cl = grade(cliff, r=0.5, g=0.55, b=0.75, sat=0.7, bright=0.55)
    mask = Image.new("L", (W, H), 0)
    mp = mask.load()
    for y in range(H):
        a = int(180 * max(0, 1 - y / 400)) if y < 400 else 0
        for x in range(W):
            mp[x, y] = a
    im = Image.composite(cl, im, mask)
    im = grade(im, r=0.85, g=0.9, b=1.2, sat=0.95, bright=0.88, contrast=1.1)
    im = paint_stars(im, 100, seed=12)
    im = paint_lanterns(im, [(520, 380), (700, 360)])
    im = paint_npc_dots(im, [(560, 420), (640, 410), (720, 430)])
    im = add_mist(im, 0.2, 200, 450, (40, 50, 80))
    im = wooden_plaque(im, "觀星隱廬", 36, 640, 160, 48)
    save(im, "stargaze")

def make_poplar():
    """胡楊洲 — autumn golden isle"""
    village = load("bg_village.webp")
    canal = load("bg_canal.webp")
    im = village.copy()
    # golden autumn grade
    im = grade(im, r=1.25, g=1.05, b=0.7, sat=1.2, bright=1.05, contrast=1.1)
    # water edge from canal
    water = canal.crop((0, 450, 1280, 720)).resize((1280, 240), Image.LANCZOS)
    water = grade(water, r=1.05, g=1.0, b=0.95, sat=1.05)
    mask = Image.new("L", (1280, 240), 0)
    mp = mask.load()
    for y in range(240):
        a = int(220 * (y / 240) ** 0.5)
        for x in range(1280):
            mp[x, y] = a
    im.paste(water, (0, 480), mask)
    im = paint_boats(im, [(900, 560, 42)])
    im = paint_npc_dots(im, [(400, 400), (550, 420), (700, 390)])
    im = wooden_plaque(im, "胡楊洲", 36, 640, 140, 48)
    save(im, "poplar")

def make_tea_master():
    """品茗室"""
    tea = load("bg_tea.webp")
    im = grade(tea, r=1.02, g=1.05, b=0.98, sat=1.05, bright=1.02, contrast=1.08)
    im = add_mist(im, 0.18, 80, 300, (230, 235, 230))
    im = paint_lanterns(im, [(480, 280), (720, 270)])
    im = paint_npc_dots(im, [(500, 400), (620, 390), (740, 410)])
    im = wooden_plaque(im, "品茗室", 36, 640, 140, 48)
    save(im, "tea_master")

def make_sword_wash():
    """浣劍居"""
    garden = load("bg_garden.webp")
    swim = load("bg_swim.webp")
    im = garden.crop((60, 40, 1180, 680)).resize((W, H), Image.LANCZOS)
    # cool stream
    stream = swim.crop((200, 300, 1000, 700)).resize((800, 360), Image.LANCZOS)
    stream = grade(stream, r=0.85, g=1.05, b=1.15, sat=1.1)
    im = blend_soft(im, stream, (240, 340), fade=70)
    im = grade(im, r=0.95, g=1.02, b=1.08, sat=1.05, contrast=1.1)
    # hanging blades suggestion
    d = ImageDraw.Draw(im)
    for i, x in enumerate((520, 560, 600, 640)):
        d.rectangle([x, 220, x + 4, 300], fill=(160, 165, 170))
        d.polygon([(x - 2, 300), (x + 6, 300), (x + 2, 340)], fill=(180, 185, 190))
    im = paint_npc_dots(im, [(480, 420), (700, 400), (600, 450)])
    im = wooden_plaque(im, "浣劍居", 36, 640, 140, 48)
    save(im, "sword_wash")

def make_paper():
    """紙坊"""
    wood = load("bg_wood.webp")
    yard = load("bg_yard.webp")
    im = wood.copy()
    sheets = yard.crop((400, 100, 1000, 500)).resize((550, 360), Image.LANCZOS)
    sheets = grade(sheets, r=1.05, g=1.02, b=0.95, sat=0.9, bright=1.08)
    im = blend_soft(im, sheets, (600, 80), fade=50)
    im = grade(im, r=1.05, g=1.02, b=0.95, sat=0.95, contrast=1.08)
    # drying paper sheets
    d = ImageDraw.Draw(im)
    for i in range(6):
        x = 200 + i * 50
        d.rectangle([x, 280, x + 36, 360], fill=(245, 240, 225), outline=(200, 190, 170))
    im = paint_npc_dots(im, [(350, 430), (500, 420), (700, 440)])
    im = wooden_plaque(im, "紙坊", 36, 640, 120, 48)
    save(im, "paper")

def make_rain_hut():
    """聽雨廬"""
    tea = load("bg_tea.webp")
    pond = load("bg_pond.webp")
    im = grade(tea, r=0.9, g=0.95, b=1.1, sat=0.9, bright=0.92, contrast=1.08)
    im = add_mist(im, 0.35, 40, 400, (170, 185, 200))
    # rain streaks
    d = ImageDraw.Draw(im)
    rng = random.Random(21)
    for _ in range(120):
        x = rng.randint(0, W)
        y = rng.randint(0, H)
        d.line([x, y, x - 2, y + 14], fill=(200, 210, 220), width=1)
    water = pond.crop((0, 500, 1280, 720)).resize((1280, 200), Image.LANCZOS)
    mask = Image.new("L", (1280, 200), 160)
    im.paste(grade(water, r=0.85, g=0.95, b=1.1), (0, 520), mask)
    im = paint_npc_dots(im, [(500, 400), (650, 410)])
    im = wooden_plaque(im, "聽雨廬", 36, 640, 140, 48)
    save(im, "rain_hut")

def make_ink_pool():
    """墨池齋"""
    study = load("bg_study.webp")
    academy = load("bg_academy.webp")
    im = study.copy()
    piece = academy.crop((200, 50, 900, 450)).resize((650, 360), Image.LANCZOS)
    im = blend_soft(im, grade(piece, r=0.95, g=0.98, b=1.05, sat=0.9), (100, 40), fade=55)
    im = grade(im, r=0.92, g=0.95, b=1.05, sat=0.88, contrast=1.1)
    # ink pool
    d = ImageDraw.Draw(im)
    d.ellipse([520, 420, 720, 520], fill=(30, 35, 45), outline=(60, 70, 80))
    d.ellipse([540, 440, 600, 470], fill=(50, 55, 65))
    im = paint_npc_dots(im, [(400, 400), (600, 380), (760, 410)])
    im = wooden_plaque(im, "墨池齋", 36, 640, 140, 48)
    save(im, "ink_pool")

def make_dye():
    """染坊"""
    weave = load("bg_weave.webp")
    yard = load("bg_yard.webp")
    im = weave.copy()
    im = grade(im, r=1.05, g=1.0, b=1.08, sat=1.25, bright=1.02, contrast=1.1)
    # colorful hanging cloth
    d = ImageDraw.Draw(im)
    colors = [(200, 50, 60), (40, 90, 180), (50, 140, 80), (220, 160, 40), (140, 60, 160), (30, 100, 110)]
    for i, col in enumerate(colors):
        x = 280 + i * 70
        d.rectangle([x, 180, x + 40, 340], fill=col)
        d.rectangle([x, 180, x + 40, 190], fill=(90, 60, 40))
    im = paint_npc_dots(im, [(400, 430), (560, 420), (720, 440)])
    im = wooden_plaque(im, "染坊", 36, 640, 120, 48)
    save(im, "dye")

def make_terraces():
    """層田"""
    fields = load("bg_fields.webp")
    farm = load("bg_busy_farm.webp")
    im = fields.copy()
    # blend farm hut
    hut = farm.crop((700, 80, 1200, 420)).resize((420, 280), Image.LANCZOS)
    im = blend_soft(im, hut, (800, 60), fade=40)
    im = grade(im, r=0.98, g=1.08, b=0.95, sat=1.1, contrast=1.08)
    im = paint_npc_dots(im, [(300, 450), (500, 480), (700, 460)])
    im = wooden_plaque(im, "層田", 36, 640, 120, 48)
    save(im, "terraces")

def make_rainy_tea():
    """雨亭茶寮"""
    tea = load("bg_tea.webp")
    im = grade(tea, r=0.88, g=0.95, b=1.12, sat=0.92, bright=0.9, contrast=1.05)
    im = add_mist(im, 0.4, 30, 420, (160, 175, 195))
    d = ImageDraw.Draw(im)
    rng = random.Random(33)
    for _ in range(100):
        x = rng.randint(0, W); y = rng.randint(0, H)
        d.line([x, y, x - 1, y + 12], fill=(190, 200, 215), width=1)
    im = paint_lanterns(im, [(500, 300), (680, 290)])
    im = paint_npc_dots(im, [(540, 400), (660, 410)])
    im = wooden_plaque(im, "雨亭茶寮", 36, 640, 160, 48)
    save(im, "rainy_tea")

def make_brewery():
    """酒坊"""
    tavern = load("bg_tavern.webp")
    im = grade(tavern, r=1.1, g=1.0, b=0.88, sat=1.08, bright=0.98, contrast=1.1)
    im = paint_crates(im, [(280, 450), (320, 460), (360, 455), (800, 440)])
    # barrels
    d = ImageDraw.Draw(im)
    for x, y in [(500, 480), (560, 485), (620, 478)]:
        d.ellipse([x - 22, y - 16, x + 22, y + 16], fill=(120, 75, 40), outline=(80, 50, 25))
        d.line([x - 22, y, x + 22, y], fill=(80, 50, 25))
    im = paint_npc_dots(im, [(400, 420), (700, 430), (550, 400)])
    im = wooden_plaque(im, "酒坊", 36, 640, 120, 48)
    save(im, "brewery")

def make_pharmacy():
    """藥鋪"""
    clinic = load("bg_clinic.webp")
    im = grade(clinic, r=1.02, g=1.05, b=0.98, sat=1.05, bright=1.02, contrast=1.08)
    im = add_mist(im, 0.12, 100, 350, (220, 230, 210))
    im = paint_lanterns(im, [(450, 280), (700, 270)])
    im = paint_npc_dots(im, [(480, 420), (620, 410), (750, 430)])
    im = wooden_plaque(im, "藥鋪", 36, 640, 120, 48)
    save(im, "pharmacy")

def make_stone_forest():
    """石林"""
    cliff = load("bg_cliff.webp")
    wild = load("bg_cliff.webp")
    im = grade(cliff, r=1.0, g=1.05, b=1.08, sat=1.0, bright=1.0, contrast=1.2)
    # vertical stone pillars
    d = ImageDraw.Draw(im)
    rng = random.Random(44)
    for i in range(12):
        x = 150 + i * 90 + rng.randint(-20, 20)
        top = 120 + rng.randint(0, 80)
        bot = 480 + rng.randint(0, 60)
        col = (110 + rng.randint(0, 40), 115 + rng.randint(0, 30), 105 + rng.randint(0, 30))
        d.polygon([(x, bot), (x + 30, bot), (x + 22, top), (x + 8, top)], fill=col)
    im = paint_npc_dots(im, [(400, 500), (600, 520), (800, 490)])
    im = wooden_plaque(im, "石林", 36, 640, 120, 48)
    im = soft_vignette(im, 0.22)
    save(im, "stone_forest")

def make_garden_water():
    """水榭園"""
    garden = load("bg_garden.webp")
    swim = load("bg_swim.webp")
    im = garden.copy()
    water = swim.crop((100, 250, 1100, 700)).resize((900, 400), Image.LANCZOS)
    water = grade(water, r=0.9, g=1.05, b=1.15, sat=1.1)
    im = blend_soft(im, water, (190, 300), fade=60)
    im = grade(im, r=0.98, g=1.05, b=1.08, sat=1.08, contrast=1.08)
    im = paint_lotus(im, [(400, 500), (480, 520), (700, 510), (800, 490)])
    im = paint_npc_dots(im, [(500, 380), (650, 370), (780, 400)])
    im = paint_lanterns(im, [(520, 300), (720, 290)])
    im = wooden_plaque(im, "水榭園", 36, 640, 140, 48)
    save(im, "garden_water")

def main():
    makers = [
        make_gorge, make_canal_hq, make_dragon_bridge, make_iron_league,
        make_stargaze, make_poplar, make_tea_master, make_sword_wash,
        make_paper, make_rain_hut, make_ink_pool, make_dye, make_terraces,
        make_rainy_tea, make_brewery, make_pharmacy, make_stone_forest,
        make_garden_water,
    ]
    for fn in makers:
        fn()
    print("ALL DONE", len(makers))

if __name__ == "__main__":
    main()
