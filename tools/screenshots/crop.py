"""Turn raw iPhone captures of the app into the site's phone screenshots.

    python tools/screenshots/crop.py            # from the web/ folder

Reads the 2.2.0 capture set in ../data/pic,video/261023 (1179x2556) and writes
assets/shots/<name>-<locale>.webp at 780x1552 — the size the .device bezel in
assets/styles.css is drawn for. What it does to each capture:

  * cuts the AdMob *test* banner out (dev builds show "Test mode" cards; real
    users see a real ad there, which a marketing shot should not carry); over
    the map, the strip left above it becomes a frosted status bar, so the map
    does not jump where the card was,
  * paints the Dynamic Island solid black (the capture tool's icon sits in it),
  * evens every shot to the same height (2346 rows at full size) so phones
    side by side match — by removing a strip of plain floor art, or by adding
    white rows above a sheet that is open to full height.

The ad card is found by its blue "OPEN" button, so the cuts follow the card
wherever the layout put it. Re-run after replacing a capture, then look at the
output: a new layout can need a different `fix` entry below.
"""
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps

WEB = Path(__file__).resolve().parents[2]
SRC = WEB.parent / 'data' / 'pic,video' / '261023'
OUT = WEB / 'assets' / 'shots'
H = 2346  # target height at 1179 wide (780x1552 after resize)
# Per locale, a capture whose status bar sits on plain white (the nearby
# list): frost() lifts the clock and icons from it.
STATUS = {
    'ko': 'KO/KakaoTalk_20261023_194852089_15.png',
    'en': 'EN/KakaoTalk_20261023_194852089_07.png',
}


def open_buttons(im):
    """Row spans of AdMob's blue OPEN button (right half of the screen)."""
    spans = []
    px = im.load()
    for y in range(im.height):
        n = 0
        for x in range(820, 1160, 3):
            r, g, b = px[x, y]
            if b > 210 and r < 60 and 90 < g < 140:
                n += 1
        if n > 25:
            if spans and y - spans[-1][1] <= 3:
                spans[-1][1] = y
            else:
                spans.append([y, y])
    return [s for s in spans if s[1] - s[0] > 50]


def cut(im, bands):
    """Remove row bands [y0, y1) from the image."""
    keep, y = [], 0
    for y0, y1 in sorted(bands):
        if y0 > y:
            keep.append(im.crop((0, y, im.width, y0)))
        y = max(y, y1)
    keep.append(im.crop((0, y, im.width, im.height)))
    out = Image.new('RGB', (im.width, sum(k.height for k in keep)), 'white')
    yy = 0
    for k in keep:
        out.paste(k, (0, yy))
        yy += k.height
    return out


def pad_top(im, rows, at=150):
    """Insert white rows under the status bar (only for full-height sheets)."""
    out = Image.new('RGB', (im.width, im.height + rows), 'white')
    out.paste(im.crop((0, 0, im.width, at)), (0, 0))
    out.paste(im.crop((0, at, im.width, im.height)), (0, at + rows))
    return out


def island(im):
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((300, 30, 858, 150), radius=60, fill='black')
    return im


def frost(im, seam, locale, fade=56):
    """Redraw rows [0, seam) as a frosted status bar over the map below.

    The glass is the map just under the seam, mirrored upward, blurred and
    whitened, so its colours run on into the map; it fades out over `fade`
    rows. The clock and icons come from a capture of the same phone whose
    status bar sits on plain white (multiplied in, so they keep their
    anti-aliasing)."""
    w = im.width
    below = im.crop((0, seam, w, 2 * seam + fade))
    src = Image.new('RGB', (w, below.height + seam))
    src.paste(ImageOps.flip(below.crop((0, 0, w, seam))), (0, 0))
    src.paste(below, (0, seam))
    glass = Image.blend(src.filter(ImageFilter.GaussianBlur(28)),
                        Image.new('RGB', src.size, 'white'), 0.72)
    status = Image.open(SRC / STATUS[locale]).convert('RGB').crop((0, 0, w, seam))
    im.paste(ImageChops.multiply(glass.crop((0, 0, w, seam)), status), (0, 0))
    ramp = Image.linear_gradient('L').resize((w, fade)).point(lambda v: 255 - v)
    under = im.crop((0, seam, w, seam + fade))
    im.paste(Image.composite(glass.crop((0, seam, w, seam + fade)), under, ramp), (0, seam))
    return island(im)


def process(src, name, fix=None, pad=False):
    im = island(Image.open(SRC / src).convert('RGB'))
    bands, seam = [], None
    for b0, b1 in open_buttons(im):
        if b0 < 500:   # banner card over the map, under the status bar:
            # the bottom of the white card the ad sits in: walk down from the
            # button while one of the next few rows is at least a third pure
            # white (its 1px border rows are not, hence the look-ahead; the
            # map is <10%)
            def white(y):
                px = [im.getpixel((x, y)) for x in range(60, 1120, 8)]
                return sum(1 for p in px if sum(p) >= 750) / len(px)
            end = b1
            while end < 520 and max(white(y) for y in range(end, end + 6)) >= 0.3:
                end += 1
            end += 2
            # Every shot loses 210 rows here. Whatever is left above them (the
            # status bar over a strip of map, plus the top of a taller card)
            # is redrawn as a frosted bar after the cut — spliced as it is
            # onto the map below the card, it reads as a tear in the screen.
            seam = end - 210
            if seam > 215:     # the white status bar in STATUS ends there
                raise SystemExit(f'{name}: banner ends at {end}, too low for frost()')
            bands.append((seam, end))
        else:          # card inside a sheet: "광고 없애기" header + banner + gap
            bands.append((b0 - 152, b1 + 80))
    bands += fix or []
    im = cut(im, bands)
    if seam is not None:
        im = frost(im, seam, name.rsplit('-', 1)[1])
    if im.height < H:
        if not pad:
            raise SystemExit(f'{name}: {im.height} rows after cuts, needs pad=True')
        im = pad_top(im, H - im.height)
    if im.height > H:
        raise SystemExit(f'{name}: {im.height} rows after cuts, add a fix band')
    im = im.resize((780, 1552), Image.LANCZOS)
    OUT.mkdir(parents=True, exist_ok=True)
    im.save(OUT / f'{name}.webp', quality=86, method=6)
    print(f'{name}.webp  bands={bands}')


# Korea map with the map sheet (내 주변 인기), world map, Tokyo, nearby list,
# detail sheet, Grow (kiln workshop), the KORE room — one set per locale.
GROW_FIX = [(1590, 1680), (2436, 2556)]
ROOM_FIX = [(1850, 1929), (2425, 2556)]
process('KO/KakaoTalk_20261023_194852089_09.png', 'map-ko')
process('KakaoTalk_20261023_222722048_01.png', 'world-ko')
process('KakaoTalk_20261024_023004801_03.png', 'tokyo-ko')
process('KO/KakaoTalk_20261023_194852089_15.png', 'nearby-ko', pad=True)
process('KO/KakaoTalk_20261023_194852089_13.png', 'detail-ko', pad=True)
process('KO/KakaoTalk_20261023_194852089_16.png', 'grow-ko', GROW_FIX)
process('KO/KakaoTalk_20261023_194852089_17.png', 'room-ko', ROOM_FIX)

process('EN/KakaoTalk_20261023_194852089.png', 'map-en')
process('KakaoTalk_20261023_222722048_08.png', 'world-en')
process('KakaoTalk_20261024_023004801_04.png', 'tokyo-en')
process('EN/KakaoTalk_20261023_194852089_07.png', 'nearby-en', pad=True)
process('EN/KakaoTalk_20261023_194852089_04.png', 'detail-en', pad=True)
process('EN/KakaoTalk_20261023_194852089_03.png', 'grow-en', GROW_FIX)
process('EN/KakaoTalk_20261023_194852089_02.png', 'room-en', ROOM_FIX)

# Floating cards cut from a sheet: a toilet abroad (directions in Google /
# Apple Maps) and the global KORE ranking.
def card(src, name, box):
    im = island(Image.open(SRC / src).convert('RGB')).crop(box)
    w = 640
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(OUT / f'{name}.webp', quality=88, method=6)
    print(f'{name}.webp  {im.size}')

card('KakaoTalk_20261024_023306451.png', 'abroad-ko', (0, 1355, 1179, 2080))
card('KakaoTalk_20261024_023306451_01.png', 'abroad-en', (0, 1355, 1179, 2080))
card('EN/KakaoTalk_20261023_194852089_08.png', 'ranking-en', (0, 220, 1179, 1720))
