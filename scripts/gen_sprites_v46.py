#!/usr/bin/env python3
"""v46: slice user chibi sheets + extract UI chrome; map to careers/origins/NPCs."""
from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
import numpy as np

ROOT = Path("/workspace/qianmo")
ASSET = ROOT / "assets"
RAW = ASSET / "raw"
CHIBI = ASSET / "chibi"
UI = ASSET / "ui"
CHIBI.mkdir(parents=True, exist_ok=True)
UI.mkdir(parents=True, exist_ok=True)

def trim_content(im: Image.Image, bg_mode="light", pad=4) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    a = arr[:, :, 3]
    rgb = arr[:, :, :3].astype(np.int16)
    if bg_mode == "light":
        # treat near-white/grey as bg
        mask = (a > 8) & ~((rgb[:, :, 0] > 200) & (rgb[:, :, 1] > 200) & (rgb[:, :, 2] > 200) &
                           (np.abs(rgb[:, :, 0].astype(int) - rgb[:, :, 1].astype(int)) < 25) &
                           (np.abs(rgb[:, :, 1].astype(int) - rgb[:, :, 2].astype(int)) < 25))
        # also keep saturated pixels
        sat = (rgb.max(axis=2) - rgb.min(axis=2)) > 18
        mask = mask | ((a > 8) & sat)
    else:
        # black bg
        mask = (a > 8) & ~((rgb[:, :, 0] < 28) & (rgb[:, :, 1] < 28) & (rgb[:, :, 2] < 28))
    if not mask.any():
        return im
    ys, xs = np.where(mask)
    y0, y1 = max(0, ys.min() - pad), min(arr.shape[0], ys.max() + 1 + pad)
    x0, x1 = max(0, xs.min() - pad), min(arr.shape[1], xs.max() + 1 + pad)
    crop = arr[y0:y1, x0:x1].copy()
    # punch bg to transparent
    c = crop
    rgb = c[:, :, :3].astype(np.int16)
    if bg_mode == "light":
        bg = (rgb[:, :, 0] > 205) & (rgb[:, :, 1] > 205) & (rgb[:, :, 2] > 205)
        c[bg, 3] = 0
    else:
        bg = (rgb[:, :, 0] < 22) & (rgb[:, :, 1] < 22) & (rgb[:, :, 2] < 22)
        c[bg, 3] = 0
    return Image.fromarray(c, "RGBA")

def fit_canvas(im: Image.Image, tw: int, th: int, anchor="bottom") -> Image.Image:
    im = im.convert("RGBA")
    # scale to fit
    scale = min(tw / max(1, im.width), th / max(1, im.height))
    nw, nh = max(1, int(im.width * scale)), max(1, int(im.height * scale))
    im2 = im.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    x = (tw - nw) // 2
    if anchor == "bottom":
        y = th - nh
    elif anchor == "center":
        y = (th - nh) // 2
    else:
        y = 0
    canvas.paste(im2, (x, y), im2)
    return canvas

def face_from_char(im: Image.Image, size=320) -> Image.Image:
    """Crop upper portion as face circle-friendly square."""
    w, h = im.size
    # focus on head: top ~55% of height, centered
    top = 0
    bot = int(h * 0.62)
    crop = im.crop((0, top, w, bot))
    # trim again
    crop = trim_content(crop, bg_mode="light" if np.array(crop.convert("RGBA"))[:,:,3].mean() < 250 else "light", pad=2)
    return fit_canvas(crop, size, size, anchor="center")

def slice_grid(path: Path, cols: int, rows: int, bg_mode="light"):
    im = Image.open(path).convert("RGBA")
    W, H = im.size
    cw, ch = W / cols, H / rows
    out = []
    for r in range(rows):
        for c in range(cols):
            x0, y0 = int(c * cw), int(r * ch)
            x1, y1 = int((c + 1) * cw), int((r + 1) * ch)
            cell = im.crop((x0, y0, x1, y1))
            spr = trim_content(cell, bg_mode=bg_mode, pad=3)
            # skip nearly empty
            a = np.array(spr)[:, :, 3]
            if a.mean() < 2 or (a > 10).sum() < 80:
                continue
            out.append(spr)
    return out

def slice_51_black(path: Path):
    """Detect character columns via vertical projection peaks on black bg."""
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    rgb = arr[:, :, :3].astype(np.int16)
    content = ~((rgb[:, :, 0] < 25) & (rgb[:, :, 1] < 25) & (rgb[:, :, 2] < 25))
    # row bands: find horizontal gaps
    row_dens = content.mean(axis=1)
    # smooth
    k = 9
    ker = np.ones(k) / k
    rs = np.convolve(row_dens, ker, mode="same")
    # find valleys between rows
    thr = rs.max() * 0.08
    in_row = rs > thr
    bands = []
    i = 0
    n = len(in_row)
    while i < n:
        if not in_row[i]:
            i += 1
            continue
        j = i
        while j < n and in_row[j]:
            j += 1
        if j - i > 40:
            bands.append((i, j))
        i = j
    sprites = []
    for y0, y1 in bands:
        band = content[y0:y1, :]
        col_dens = band.mean(axis=0)
        cs = np.convolve(col_dens, np.ones(7) / 7, mode="same")
        thr_c = cs.max() * 0.06
        in_c = cs > thr_c
        cols = []
        i = 0
        m = len(in_c)
        while i < m:
            if not in_c[i]:
                i += 1
                continue
            j = i
            while j < m and in_c[j]:
                j += 1
            if j - i > 25:
                cols.append((i, j))
            i = j
        for x0, x1 in cols:
            # expand a bit
            xx0 = max(0, x0 - 4)
            xx1 = min(im.width, x1 + 4)
            yy0 = max(0, y0 - 4)
            yy1 = min(im.height, y1 + 4)
            cell = im.crop((xx0, yy0, xx1, yy1))
            spr = trim_content(cell, bg_mode="black", pad=2)
            a = np.array(spr)[:, :, 3]
            if (a > 10).sum() < 120:
                continue
            sprites.append(spr)
    return sprites

def save_webp(im: Image.Image, path: Path, q=92):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "WEBP", quality=q, method=6)

def extract_ui_pieces():
    """Crop useful chrome from classic kit (approximate regions from 1536x1024 kit)."""
    kit = Image.open(RAW / "ui_kit_classic.png").convert("RGBA")
    W, H = kit.size
    # Approximate crops based on typical kit layout description — use relative regions
    # Left buttons column ~ x 40-280, various y
    # We'll extract middle parchment panel and a few buttons by scanning for cream panels
    # Simpler: save downscaled kit textures as 9-slice-ish panels
    # Panel parchment: sample cream region from center
    # Use known-ish coordinates for 1536x1024 classic kit:
    crops = {
        "panel_parchment_v46.webp": (520, 80, 980, 420),   # tabbed parchment
        "panel_list_v46.webp": (1020, 60, 1480, 380),
        "btn_row_v46.webp": (40, 80, 300, 520),
        "dialog_v46.webp": (60, 560, 520, 920),
    }
    for name, box in crops.items():
        # clamp
        x0,y0,x1,y1 = box
        x0,y0 = max(0,x0), max(0,y0)
        x1,y1 = min(W,x1), min(H,y1)
        crop = kit.crop((x0,y0,x1,y1))
        save_webp(crop, UI / name, 88)
        print("ui crop", name, crop.size)

    # Also extract from xianxia kit: HUD avatar frame area and bottom nav
    xk = Image.open(RAW / "ui_kit_xianxia.png").convert("RGBA")
    xw, xh = xk.size
    pieces = {
        "hud_bar_ref_v46.webp": (20, 20, 700, 140),
        "inv_panel_ref_v46.webp": (360, 160, 980, 620),
        "nav_bar_ref_v46.webp": (400, 820, 1100, 980),
        "title_banner_ref_v46.webp": (1050, 40, 1500, 160),
    }
    for name, box in pieces.items():
        x0,y0,x1,y1 = box
        crop = xk.crop((max(0,x0), max(0,y0), min(xw,x1), min(xh,y1)))
        save_webp(crop, UI / name, 88)
        print("xianxia crop", name, crop.size)

    # Generate stone-gold avatar frame overlay
    fr = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    d = ImageDraw.Draw(fr)
    d.ellipse([4, 4, 123, 123], outline=(212, 175, 95, 255), width=5)
    d.ellipse([10, 10, 117, 117], outline=(140, 105, 50, 220), width=2)
    d.ellipse([2, 2, 125, 125], outline=(240, 210, 140, 180), width=2)
    # corner gems
    for cx, cy in [(18, 18), (109, 18), (18, 109), (109, 109)]:
        d.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=(55, 140, 145, 255), outline=(212, 175, 95, 255))
    save_webp(fr, UI / "frame_avatar_v46.webp", 95)

    # stone dock bar texture
    dock = Image.new("RGBA", (480, 96), (0, 0, 0, 0))
    dd = ImageDraw.Draw(dock)
    dd.rounded_rectangle([2, 8, 477, 88], 28, fill=(28, 36, 55, 245), outline=(212, 175, 95, 230), width=3)
    dd.rounded_rectangle([8, 14, 471, 82], 24, outline=(140, 105, 50, 180), width=1)
    save_webp(dock, UI / "dock_bar_v46.webp", 92)

    # soft parchment tile
    parch = Image.new("RGB", (256, 256), (241, 228, 198))
    px = parch.load()
    import random
    rnd = random.Random(46)
    for y in range(256):
        for x in range(256):
            n = rnd.randint(-10, 10)
            px[x, y] = (max(180, min(255, 241 + n)), max(170, min(250, 228 + n // 2)), max(150, min(230, 198 + n // 3)))
    parch = parch.filter(ImageFilter.GaussianBlur(0.4))
    parch.save(UI / "parchment_tile_v46.webp", "WEBP", quality=85, method=6)
    print("generated frames/dock/parchment")

def main():
    print("slicing 105…")
    s105 = slice_grid(RAW / "chibi_105.png", 15, 7, bg_mode="light")
    print("105 got", len(s105))
    print("slicing 51…")
    s51 = slice_51_black(RAW / "chibi_51.png")
    print("51 got", len(s51))

    # Prefer 51 for career variety (more distinctive roles), fill from 105
    pool = s51 + s105
    for i, spr in enumerate(pool):
        save_webp(fit_canvas(spr, 192, 256, "bottom"), CHIBI / f"c{i:03d}.webp", 90)

    # Career mapping indices (hand-picked from typical sheet layouts; clamp if short)
    # Prefer 51 indices first (0..len(s51)-1), then 105
    n51 = len(s51)
    def pick(*idxs):
        for i in idxs:
            if 0 <= i < len(pool):
                return pool[i]
        return pool[0]

    # Heuristic picks for 51 sheet (4 rows of ~13). Adjust if detection order differs.
    # We'll also print sizes to verify.
    career_idx = {
        "farmer_m": [12, 13, 0],      # veg seller / traveler
        "farmer_f": [n51 + 20, 21, 5],
        "doctor": [14, 15, 2],        # herbalist-ish
        "merchant": [16, 8, 3],
        "soldier": [11, 17, 4],
        "scholar": [1, 0, 6],
        "craftsman": [9, 10, 7],      # blacksmith
        "hunter": [18, 19, 8],
        "ranger": [5, 20, 9],
        "hero": [22, 2, 10],
        "hero_f": [23, 24, 11],
        # extras for new careers
        "scribe": [0, 1, 6],
        "courier": [7, 5, 9],
        "smith": [9, 10, 7],
        "agent": [4, 5, 20],
        "boatman": [11, 17, 4],
        "herbalist": [14, 15, 2],
        "diviner": [1, 0, 6],
        "origin_farm": [12, 13],
        "origin_scholar": [0, 1],
        "origin_merchant": [16, 8],
        "origin_soldier": [11, 17],
        "origin_healer": [14, 15],
        "origin_guest": [7, 22],
    }

    # If pool shorter, remapping by modulo
    def get_spr(keys):
        for k in keys:
            if 0 <= k < len(pool):
                return pool[k]
        return pool[k % len(pool)]

    # Better: assign sequential distinctive sprites for careers after visual sort by color
    # Score by hue variety and pick unique
    used = set()
    def unique_pick(cands):
        for i in cands:
            ii = i if i < len(pool) else i % len(pool)
            if ii not in used:
                used.add(ii)
                return pool[ii]
        for i in range(len(pool)):
            if i not in used:
                used.add(i)
                return pool[i]
        return pool[0]

    # Re-pick with spacing for visual variety across sheet
    spaced = list(range(0, len(pool), max(1, len(pool) // 24)))
    labels_char = [
        ("farmer_m", spaced[0:1] + [12, 13]),
        ("farmer_f", spaced[1:2] + [n51 + 5 if n51 + 5 < len(pool) else 5]),
        ("doctor", spaced[2:3] + [14]),
        ("merchant", spaced[3:4] + [16]),
        ("soldier", spaced[4:5] + [11]),
        ("scholar", spaced[5:6] + [0]),
        ("craftsman", spaced[6:7] + [9]),
        ("hunter", spaced[7:8] + [18]),
        ("ranger", spaced[8:9] + [5]),
        ("hero", spaced[9:10] + [22]),
        ("hero_f", spaced[10:11] + [23]),
        ("scribe", spaced[11:12] + [1]),
        ("courier", spaced[12:13] + [7]),
        ("smith", spaced[13:14] + [10]),
        ("agent", spaced[14:15] + [4]),
        ("boatman", spaced[15:16] + [17]),
        ("herbalist", spaced[16:17] + [15]),
        ("diviner", spaced[17:18] + [2]),
    ]
    for name, cands in labels_char:
        spr = unique_pick([c for c in cands if isinstance(c, int)])
        char = fit_canvas(spr, 288, 400, "bottom")
        face = face_from_char(spr, 320)
        save_webp(char, ASSET / f"char_{name}.webp", 92)
        # only write face_* for keys that game expects as face keys
        face_keys = {
            "farmer_m", "farmer_f", "doctor", "merchant", "soldier", "scholar",
            "craftsman", "hunter", "ranger", "hero", "hero_f",
            "scribe", "courier", "smith", "agent", "boatman", "herbalist", "diviner",
        }
        if name in face_keys:
            save_webp(face, ASSET / f"face_{name}.webp", 92)
        print("mapped", name, "from pool")

    # Origin thumbs (64-ish shown in chip cards via CSS background)
    origin_map = {
        "farm": "farmer_m",
        "gentry": "scholar",
        "merchant": "merchant",
        "military": "soldier",
        "medic": "doctor",
        "guest": "ranger",
        "tradoc": "farmer_m",
    }
    for oid, src in origin_map.items():
        p = ASSET / f"char_{src}.webp"
        if p.exists():
            im = Image.open(p).convert("RGBA")
            save_webp(fit_canvas(im, 96, 96, "center"), ASSET / f"origin_{oid}.webp", 90)

    # NPC faces from remaining pool
    npc_names = [
        "npc_elder", "npc_guard", "npc_maid", "npc_official", "npc_child",
        "npc_monk", "npc_archer", "npc_noble", "npc_cook", "npc_spy",
        "npc_general", "npc_musician",
    ]
    for i, name in enumerate(npc_names):
        spr = unique_pick([n51 + i * 3, i * 2, i + 30])
        save_webp(face_from_char(spr, 256), ASSET / f"face_{name}.webp", 90)
        save_webp(fit_canvas(spr, 240, 320, "bottom"), ASSET / f"char_{name}.webp", 90)

    extract_ui_pieces()
    print("DONE pool", len(pool), "used", len(used))

if __name__ == "__main__":
    main()
