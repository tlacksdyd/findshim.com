"""Build the social cards assets/og-image.png (Korean) and og-image-en.png.

    python tools/screenshots/og.py            # from the web/ folder

1200x630, the launch screen's sky-blue -> violet gradient, the KORE mascot,
the world-map screenshot in a phone, and the headline. Pretendard Bold comes
from the app checkout (../kore/assets/fonts).
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

WEB = Path(__file__).resolve().parents[2]
FONT = WEB.parent / 'kore' / 'assets' / 'fonts' / 'Pretendard-Bold.otf'
W, H = 1200, 630

COPY = {
    'ko': ('함께 만들어가는', '전세계 화장실 앱', '230+개국 · 80만+ 화장실 · 5개 언어', 'og-image.png'),
    'en': ('The worldwide', 'toilet app', '230+ countries · 800K+ toilets · 5 languages', 'og-image-en.png'),
}


def gradient():
    top, mid, bot = (38, 180, 255), (63, 140, 252), (138, 92, 252)
    im = Image.new('RGB', (W, H))
    px = im.load()
    for y in range(H):
        for x in range(W):
            t = (x / W * 0.55 + y / H * 0.45)
            a, b, u = (top, mid, t / 0.5) if t < 0.5 else (mid, bot, (t - 0.5) / 0.5)
            px[x, y] = tuple(round(a[i] + (b[i] - a[i]) * u) for i in range(3))
    glow = Image.new('L', (W, H), 0)
    ImageDraw.Draw(glow).ellipse((700, 40, 1180, 560), fill=120)
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    return Image.composite(Image.new('RGB', (W, H), 'white'), im, glow)


def phone(shot, width):
    s = Image.open(shot).convert('RGB')
    s = s.resize((width, round(s.height * width / s.width)), Image.LANCZOS)
    pad, r = 12, 44
    body = Image.new('RGBA', (s.width + pad * 2, s.height + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(body).rounded_rectangle((0, 0, body.width - 1, body.height - 1), r + pad, fill=(18, 22, 32, 255))
    mask = Image.new('L', s.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, s.width - 1, s.height - 1), r, fill=255)
    body.paste(s, (pad, pad), mask)
    return body


def card(loc):
    l1, l2, sub, out = COPY[loc]
    im = gradient().convert('RGBA')

    ph = phone(WEB / 'assets' / 'shots' / f'world-{loc}.webp', 300).rotate(6, expand=True, resample=Image.BICUBIC)
    shadow = Image.new('RGBA', ph.size, (20, 30, 120, 0))
    shadow.putalpha(ph.getchannel('A').point(lambda a: a * 0.35))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    im.alpha_composite(shadow, (790, 70))
    im.alpha_composite(ph, (770, 40))

    m = Image.open(WEB / 'assets' / 'kore' / 'mascot.webp').convert('RGBA')
    m = m.resize((250, round(m.height * 250 / m.width)), Image.LANCZOS)
    im.alpha_composite(m, (610, 360))

    d = ImageDraw.Draw(im)
    icon = Image.open(WEB / 'assets' / 'app-icon.png').convert('RGBA').resize((64, 64), Image.LANCZOS)
    mask = Image.new('L', icon.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, 63, 63), 16, fill=255)
    im.paste(icon, (72, 70), mask)
    d.text((152, 80), 'KORE', font=ImageFont.truetype(str(FONT), 40), fill='white')

    big = ImageFont.truetype(str(FONT), 76 if loc == 'ko' else 80)
    d.text((72, 200), l1, font=big, fill=(226, 236, 255))
    d.text((72, 292), l2, font=big, fill='white')
    small = ImageFont.truetype(str(FONT), 30)
    bw = d.textlength(sub, font=small) + 44
    # Translucent pill: drawn on its own layer, since ImageDraw replaces alpha
    # rather than blending it.
    pill = Image.new('RGBA', im.size, (0, 0, 0, 0))
    ImageDraw.Draw(pill).rounded_rectangle((72, 430, 72 + bw, 486), 28, fill=(255, 255, 255, 52))
    im.alpha_composite(pill)
    d = ImageDraw.Draw(im)
    d.text((94, 440), sub, font=small, fill='white')

    im.convert('RGB').save(WEB / 'assets' / out, optimize=True)
    print(out)


for loc in COPY:
    card(loc)
