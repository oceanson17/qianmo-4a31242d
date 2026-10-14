#!/usr/bin/env python3
"""Original HD pixel RPG scene backgrounds for 青阡. Qin/pre-Qin naming. Not derived from user JPGs."""
from PIL import Image, ImageDraw
from pathlib import Path
import math, random

OUT = Path('/workspace/qianmo/assets')
W, H = 320, 180  # draw low-res then nearest upscale → HD pixel
SCALE = 4

def up(im):
    return im.resize((W * SCALE, H * SCALE), Image.NEAREST)

def save(im, name):
    hi = up(im)
    p = OUT / f'bg_{name}.webp'
    hi.save(p, 'WEBP', quality=88, method=6)
    print('wrote', p, hi.size)
    return p

def sky(d, top, bot, night=False):
    for y in range(H):
        t = y / (H - 1)
        if night:
            c = (
                int(18 + (top[0]-18)* (1-t) + bot[0]*t*0.2),
                int(22 + (top[1]-22)* (1-t) + bot[1]*t*0.2),
                int(48 + (top[2]-48)* (1-t) + bot[2]*t*0.3),
            )
        else:
            c = tuple(int(top[i]*(1-t)+bot[i]*t) for i in range(3))
        d.line([(0,y),(W,y)], fill=c)

def rect(d, x,y,w,h,c):
    d.rectangle([x,y,x+w-1,y+h-1], fill=c)

def tri(d, pts, c):
    d.polygon(pts, fill=c)

def noise(im, n=400, amp=8):
    px = im.load()
    rnd = random.Random(42)
    for _ in range(n):
        x,y = rnd.randrange(W), rnd.randrange(H)
        r,g,b = px[x,y][:3]
        k = rnd.randint(-amp, amp)
        px[x,y] = (max(0,min(255,r+k)), max(0,min(255,g+k)), max(0,min(255,b+k)))

# —— scenes ——
def terraces():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(180,210,230),(240,220,180))
    # distant mist hills
    for i,col in enumerate([(120,150,110),(90,130,90),(70,110,70)]):
        y0 = 70+i*12
        pts=[(0,H),(0,y0)]
        for x in range(0,W+1,20):
            pts.append((x, y0+int(8*math.sin(x/30+i))))
        pts += [(W,H)]
        tri(d, pts, col)
    # terraced rice steps
    greens = [(86,140,70),(100,155,80),(72,128,60),(110,165,88)]
    for i in range(8):
        y = 95 + i*10
        c = greens[i%len(greens)]
        # band
        for x in range(W):
            yy = y + int(3*math.sin(x/25.0 + i))
            rect(d, x, yy, 1, 8, c)
        # water mirror strip
        for x in range(0,W,3):
            yy = y + int(3*math.sin(x/25.0 + i)) + 3
            if 0<=yy<H: d.point((x,yy), fill=(160,200,210))
        # ridge
        for x in range(W):
            yy = y + int(3*math.sin(x/25.0 + i))
            d.point((x,yy), fill=(60,90,50))
    # farm hut silhouette
    rect(d, 240, 118, 40, 28, (120,90,60))
    tri(d, [(235,118),(260,100),(285,118)], (90,60,40))
    noise(im, 500, 6)
    save(im, 'terraces')

def iron_league():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(40,35,45),(80,55,40), night=False)
    # dark workshop hall
    rect(d,0,60,W,H-60,(55,45,40))
    # beams
    for x in range(20,W,40):
        rect(d,x,50,6,H-50,(35,28,24))
    # forge glow
    for r in range(40,0,-2):
        col=(255, min(255,80+r*4), 30)
        d.ellipse([140-r,110-r//2,200+r,150+r//2], fill=col)
    # anvil
    rect(d,155,125,50,18,(70,70,75))
    rect(d,165,143,30,20,(50,50,55))
    # hanging blades
    for x in (40,70,250,280):
        rect(d,x,70,4,35,(150,150,160))
        rect(d,x-4,105,12,4,(180,140,60))
    # sparks
    rnd=random.Random(7)
    for _ in range(30):
        d.point((rnd.randint(150,200), rnd.randint(90,120)), fill=(255,220,120))
    # banner
    rect(d,100,40,120,18,(140,40,35))
    noise(im, 300, 5)
    save(im, 'iron_league')

def stargaze():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(10,12,40),(30,25,55), night=True)
    # moon
    d.ellipse([240,20,280,60], fill=(230,230,210))
    d.ellipse([250,18,285,55], fill=(10,12,40))
    # stars
    rnd=random.Random(3)
    for _ in range(80):
        x,y=rnd.randint(0,W-1),rnd.randint(0,90)
        d.point((x,y), fill=(220,220,255) if rnd.random()>0.3 else (255,240,180))
    # courtyard walls
    rect(d,0,110,W,70,(50,48,55))
    # moon well
    d.ellipse([120,125,200,165], fill=(30,40,55))
    d.ellipse([130,132,190,158], fill=(60,90,120))
    d.ellipse([145,140,175,152], fill=(180,200,220))  # moon reflection
    # pavilion pillars
    rect(d,40,95,10,50,(90,70,50))
    rect(d,90,95,10,50,(90,70,50))
    tri(d,[(30,95),(70,70),(110,95)],(120,50,45))
    # stone rail
    rect(d,110,155,100,6,(80,75,70))
    noise(im, 200, 4)
    save(im, 'stargaze')

def poplar():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(255,200,140),(255,230,190))
    # dunes
    for i,col in enumerate([(210,170,110),(190,150,95),(170,130,80)]):
        y=100+i*15
        pts=[(0,H),(0,y)]
        for x in range(0,W+1,16):
            pts.append((x,y+int(6*math.sin(x/40+i))))
        pts+=[(W,H)]; tri(d,pts,col)
    # poplar trunks + leaf crowns
    rnd=random.Random(11)
    for x in range(20,W,28):
        h=50+rnd.randint(0,30)
        rect(d,x, H-40-h, 4, h, (90,60,40))
        for dy in range(0,h-10,6):
            ww=8+dy//8
            rect(d, x-ww//2, H-40-h+dy, ww, 5, (180+rnd.randint(-20,20),140,50))
    noise(im,400,7)
    save(im,'poplar')

def dragon_bridge():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(160,190,220),(230,210,180))
    # water
    for y in range(120,H):
        c=(70+y//3,110,130); d.line([(0,y),(W,y)],fill=c)
    for x in range(0,W,4):
        d.point((x,130+int(4*math.sin(x/10))),fill=(160,200,210))
    # double arches
    for cx in (100,200):
        d.ellipse([cx-55,90,cx+55,160], fill=(100,95,90))
        d.ellipse([cx-40,105,cx+40,160], fill=(70,110,130))
    # bridge deck
    rect(d,30,100,260,12,(120,100,80))
    # rail posts
    for x in range(40,280,20):
        rect(d,x,88,4,12,(90,70,55))
    # twin dragon heads (stylized)
    for cx,flip in ((55,1),(265,-1)):
        tri(d,[(cx,95),(cx+flip*25,85),(cx+flip*10,105)],(140,50,40))
    noise(im,300,5)
    save(im,'dragon_bridge')

def canal_hq():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(140,170,200),(210,200,170))
    # river
    rect(d,0,130,W,50,(60,100,120))
    # docks
    rect(d,0,120,W,12,(100,80,55))
    # warehouse halls
    for x in (20,120,220):
        rect(d,x,70,80,55,(150,120,90))
        tri(d,[(x-5,70),(x+40,45),(x+85,70)],(120,50,40))
        rect(d,x+30,95,20,30,(60,45,35))  # door
    # boats
    for x in (40,180):
        tri(d,[(x,140),(x+50,140),(x+40,155),(x+10,155)],(80,60,40))
        rect(d,x+15,128,20,12,(160,90,50))
    # flag
    rect(d,160,30,4,45,(60,50,40))
    rect(d,164,32,30,16,(180,40,35))
    noise(im,350,6)
    save(im,'canal_hq')

def tea_master():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(200,210,200),(230,220,200))
    # interior paper walls
    rect(d,0,40,W,H-40,(220,210,190))
    # window to mist hills
    rect(d,40,50,100,60,(150,180,170))
    for i in range(3):
        tri(d,[(40,110),(40+i*30,80-i*5),(140,110)],(100-i*10,140-i*10,110))
    # low table
    rect(d,130,130,120,20,(120,90,60))
    rect(d,140,150,15,25,(100,70,50)); rect(d,225,150,15,25,(100,70,50))
    # tea set
    d.ellipse([170,118,200,138], fill=(80,100,90))
    d.ellipse([210,122,225,135], fill=(200,200,190))
    d.ellipse([155,122,168,135], fill=(200,200,190))
    # hanging scroll
    rect(d,250,50,40,70,(240,235,220))
    rect(d,255,55,30,60,(60,80,55))
    noise(im,250,4)
    save(im,'tea_master')

def sword_wash():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(170,195,210),(210,220,200))
    # bamboo
    for x in range(10,80,12):
        rect(d,x,40,4,120,(60,100,55))
        for y in range(50,150,18):
            rect(d,x-6,y,16,3,(80,120,70))
    # stream
    for y in range(140,H):
        d.line([(0,y),(W,y)], fill=(90,140,150))
    for x in range(0,W,3):
        d.point((x,150+int(2*math.sin(x/8))), fill=(180,220,230))
    # stone platform + sword in water
    rect(d,140,125,80,20,(110,105,100))
    rect(d,175,100,4,40,(180,180,190))  # blade
    rect(d,168,138,18,4,(160,120,50))  # guard
    # hut
    rect(d,220,90,70,50,(140,110,80))
    tri(d,[(210,90),(255,65),(295,90)],(90,50,40))
    noise(im,300,5)
    save(im,'sword_wash')

def gorge():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(80,100,130),(40,50,70), night=False)
    # cliff walls
    for x,w in [(0,90),(230,90)]:
        rect(d,x,0,w,H,(55,60,70))
        for i in range(0,H,12):
            rect(d,x+10,i,w-25,8,(45,50,60))
    # fissure light from below
    for r in range(30,0,-2):
        d.ellipse([140-r//2,100,180+r//2,H], fill=(255,180,80) if r>10 else (255,220,150))
    # rope bridge
    for x in range(90,230):
        d.point((x,70+int(8*math.sin((x-90)/20))), fill=(120,90,50))
        d.point((x,78+int(8*math.sin((x-90)/20))), fill=(100,70,40))
    noise(im,400,6)
    save(im,'gorge')

def paper_shop():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(200,205,195),(230,225,210))
    rect(d,0,50,W,H-50,(210,200,180))
    # drying racks with paper
    for x in (30,100,170,240):
        rect(d,x,60,8,90,(100,80,55))
        for dy in range(0,70,14):
            rect(d,x+10,65+dy,40,12,(245,240,230))
    # vat
    d.ellipse([120,130,200,165], fill=(90,100,95))
    d.ellipse([130,135,190,155], fill=(180,190,185))
    # craftsman bench
    rect(d,220,140,70,15,(120,90,60))
    noise(im,280,4)
    save(im,'paper')

def rain_hut():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(90,100,110),(130,135,140))
    # rain streaks
    rnd=random.Random(5)
    for _ in range(120):
        x,y=rnd.randint(0,W-1),rnd.randint(0,H-1)
        d.line([(x,y),(x-1,y+6)], fill=(160,170,175))
    # thatched hut
    rect(d,100,100,120,50,(120,100,75))
    tri(d,[(85,100),(160,60),(235,100)],(90,70,45))
    rect(d,145,120,30,30,(50,40,30))
    # porch
    rect(d,90,145,140,8,(100,85,60))
    # puddles
    d.ellipse([40,155,90,170], fill=(70,90,100))
    d.ellipse([220,158,280,172], fill=(70,90,100))
    noise(im,200,5)
    save(im,'rain_hut')

def ink_pool():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(180,190,185),(220,215,200))
    # studio floor
    rect(d,0,100,W,80,(200,190,170))
    # large ink pool stone
    d.ellipse([90,110,230,165], fill=(40,40,45))
    d.ellipse([110,120,210,155], fill=(20,20,25))
    # brush rack
    rect(d,250,80,40,70,(110,90,60))
    for i in range(4):
        rect(d,258+i*8,70,3,50,(60,50,40))
    # scrolls
    rect(d,30,90,40,60,(240,235,220))
    rect(d,35,95,30,50,(30,30,30))
    # window garden
    rect(d,100,40,120,50,(140,170,150))
    noise(im,250,4)
    save(im,'ink_pool')

def dye_shop():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(190,200,210),(230,220,200))
    rect(d,0,70,W,H-70,(180,170,150))
    # dye vats indigo/crimson/ochre
    cols=[(40,70,120),(140,40,50),(160,120,50)]
    for i,c in enumerate(cols):
        x=40+i*90
        d.ellipse([x,120,x+70,160], fill=(80,70,60))
        d.ellipse([x+8,125,x+62,150], fill=c)
    # hanging cloth
    for i,c in enumerate([(50,90,140),(160,50,60),(180,150,80),(90,120,70)]):
        rect(d,30+i*70,50,50,70,c)
    noise(im,300,5)
    save(im,'dye')

def rainy_tea():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(100,110,120),(140,145,150))
    rnd=random.Random(9)
    for _ in range(100):
        x,y=rnd.randint(0,W-1),rnd.randint(0,H-1)
        d.line([(x,y),(x-1,y+5)], fill=(150,160,165))
    # open pavilion
    rect(d,60,90,200,60,(200,190,170))
    for x in (70,150,240):
        rect(d,x,70,8,80,(100,80,55))
    tri(d,[(50,75),(160,40),(270,75)],(110,50,40))
    # tea table
    rect(d,120,120,80,15,(120,90,60))
    d.ellipse([145,110,175,128], fill=(70,90,80))
    # mist hills beyond
    tri(d,[(0,100),(80,70),(160,100)],(120,130,125))
    noise(im,250,4)
    save(im,'rainy_tea')

def brewery():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(200,180,140),(230,210,170))
    rect(d,0,80,W,H-80,(160,130,90))
    # big jars
    for x in (40,100,160,220):
        d.ellipse([x,100,x+50,160], fill=(140,100,60))
        d.ellipse([x+8,105,x+42,130], fill=(180,140,80))
        rect(d,x+18,90,14,15,(120,80,40))
    # hanging gourd sign
    rect(d,250,40,8,40,(80,60,40))
    d.ellipse([240,50,280,90], fill=(180,140,50))
    noise(im,300,5)
    save(im,'brewery')

def pharmacy():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(190,200,190),(220,215,200))
    rect(d,0,50,W,H-50,(210,200,185))
    # cabinet grid
    for row in range(3):
        for col in range(6):
            x,y=30+col*45,55+row*35
            rect(d,x,y,40,30,(120,90,60))
            rect(d,x+4,y+4,32,22,(200,190,160))
            # herb color dots
            d.point((x+12,y+12), fill=(60,120,60))
            d.point((x+22,y+18), fill=(140,80,40))
    # counter + mortar
    rect(d,80,150,160,20,(100,80,55))
    d.ellipse([140,135,180,155], fill=(90,90,95))
    noise(im,200,4)
    save(im,'pharmacy')

def stone_forest():
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(160,190,210),(220,210,180))
    # karst pillars
    rnd=random.Random(13)
    for _ in range(18):
        x=rnd.randint(10,W-30)
        h=60+rnd.randint(0,80)
        w=12+rnd.randint(0,18)
        base=H-20
        col=(90+rnd.randint(-10,20),95,90)
        rect(d,x,base-h,w,h,col)
        tri(d,[(x-2,base-h),(x+w//2,base-h-15),(x+w+2,base-h)],(70,75,70))
    # grass
    rect(d,0,H-25,W,25,(70,110,60))
    noise(im,350,6)
    save(im,'stone_forest')

def garden_water():
    """水榭園 — Qin-era garden with water pavilion (not modern Suzhou naming in game label)."""
    im = Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    sky(d,(170,200,210),(230,220,190))
    # pond
    d.ellipse([20,100,300,170], fill=(70,120,130))
    d.ellipse([40,110,280,160], fill=(90,150,160))
    # pavilion on water
    rect(d,120,90,80,40,(200,190,170))
    for x in (130,155,180):
        rect(d,x,85,6,50,(100,80,55))
    tri(d,[(110,90),(160,55),(210,90)],(130,50,40))
    # willow
    rect(d,40,60,6,80,(80,60,40))
    for i in range(8):
        d.line([(43,70),(20+i*5,130)], fill=(70,120,60))
    # stone path
    for x in range(200,300,12):
        rect(d,x,150,10,6,(120,115,110))
    noise(im,300,5)
    save(im,'garden_water')

if __name__ == '__main__':
    terraces(); iron_league(); stargaze(); poplar(); dragon_bridge()
    canal_hq(); tea_master(); sword_wash(); gorge()
    paper_shop(); rain_hut(); ink_pool(); dye_shop(); rainy_tea()
    brewery(); pharmacy(); stone_forest(); garden_water()
    print('done', len(list(OUT.glob('bg_*.webp'))))
