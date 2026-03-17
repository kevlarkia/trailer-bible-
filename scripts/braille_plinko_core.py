"""
LEAVE IT BLANK: 2010-2020 — Core Library v2
Real braille poem encoding + full-canvas Plinko drift
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import math, random, os

CANVAS = 3600
MARGIN = 180
REG_INSET = 60
FONTS_DIR = '/home/claude/fonts'

PALETTE = {
    'bg':        (18, 16, 14),
    'paper':     (24, 22, 20),
    'text_main': (215, 210, 200),
    'text_dim':  (120, 115, 108),
    'gold':      (198, 168, 108),
    'red':       (178, 48, 38),
    'purple':    (128, 72, 148),
    'blue':      (68, 98, 148),
    'orange':    (198, 118, 58),
    'pink':      (188, 78, 108),
    'teal':      (58, 138, 128),
    'reg_mark':  (60, 55, 50),
}

SECTION_COLORS = {
    'philosophy': PALETTE['gold'],
    'reads':      PALETTE['orange'],
    'mood':       PALETTE['blue'],
    'romance':    PALETTE['red'],
    'party':      PALETTE['purple'],
    'confidence': PALETTE['pink'],
    'legacy':     PALETTE['teal'],
    'photo':      PALETTE['gold'],
}

# ═══ BRAILLE ═══
BRAILLE_MAP = {
    'a': '\u2801', 'b': '\u2803', 'c': '\u2809', 'd': '\u2819', 'e': '\u2811',
    'f': '\u280b', 'g': '\u281b', 'h': '\u2813', 'i': '\u280a', 'j': '\u281a',
    'k': '\u2805', 'l': '\u2807', 'm': '\u280d', 'n': '\u281d', 'o': '\u2815',
    'p': '\u280f', 'q': '\u281f', 'r': '\u2817', 's': '\u280e', 't': '\u281e',
    'u': '\u2825', 'v': '\u2827', 'w': '\u283a', 'x': '\u282d', 'y': '\u283d',
    'z': '\u2835', ' ': '\u2800', '.': '\u2832', ',': '\u2802', '!': '\u2816',
    '?': '\u2826', "'": '\u2804', '-': '\u2824',
}

def text_to_braille(text):
    return ''.join(BRAILLE_MAP.get(c.lower(), '') for c in text if c.lower() in BRAILLE_MAP)

# Poem distributed across 42 pages at ~3-4 words each
_POEM_WORDS = (
    "Never missed you till I saw you again. "
    "Has our love burnt out or faded away? "
    "Cant repair this broken heart. Forgive never forget. "
    "Can I survive another start? "
    "In the darkest hour you hold me close. "
    "Wether or not were in love is a question for another day. "
    "We look to the future and leave it blank. "
    "You want to taste the fire inside of me "
    "I want to taste my fire inside of you. "
    "Nothing but the ashes of a dream. "
    "I lie to myself and lie to you "
    "You lie to yourself and lay with me. "
    "Leave the scabs! Never pick at it again. "
    "I promise this fire wont burn you anymore. "
    "Cross my heart and hope to die. "
    "Blown into the slowly drifting river, "
    "I only have myself to thank. "
    "I look to the future and leave it blank. "
    "Three strikes! Im out."
).split()

# Pre-compute chunks: ~3-4 words per page
_CHUNKS = []
_wpp = max(1, math.ceil(len(_POEM_WORDS) / 42))
for i in range(0, len(_POEM_WORDS), _wpp):
    _CHUNKS.append(' '.join(_POEM_WORDS[i:i+_wpp]))
while len(_CHUNKS) < 42:
    _CHUNKS.append('')

def get_braille_for_page(page_index, total_pages=42):
    if page_index < len(_CHUNKS) and _CHUNKS[page_index]:
        return text_to_braille(_CHUNKS[page_index])
    return '\u2800\u2800\u2800'

# ═══ PLINKO DRIFT ═══
def get_plinko_position(page_index, total_pages=42):
    rng = random.Random(page_index * 31 + 7)
    safe_min = MARGIN + 120
    safe_max_x = CANVAS - MARGIN - 500
    safe_max_y = CANVAS - MARGIN - 250

    # Vertical: general drift top-to-bottom
    progress = page_index / max(total_pages - 1, 1)
    base_y = int(safe_min + progress * (safe_max_y - safe_min))

    # Horizontal: random walk with momentum
    x_walk = 0.0
    for step in range(page_index + 1):
        direction = rng.choice([-1, 1])
        magnitude = rng.uniform(0.08, 0.25)
        x_walk += direction * magnitude
        x_walk = max(-1.0, min(1.0, x_walk))

    center_x = CANVAS // 2
    range_x = (safe_max_x - safe_min) // 2
    base_x = int(center_x + x_walk * range_x)

    jitter_x = rng.randint(-100, 100)
    jitter_y = rng.randint(-80, 80)

    final_x = max(safe_min, min(safe_max_x, base_x + jitter_x))
    final_y = max(safe_min, min(safe_max_y, base_y + jitter_y))

    return final_x, final_y

# ═══ FONT ═══
def font(name, size):
    paths = {
        'bebas':     f'{FONTS_DIR}/BebasNeue.ttf',
        'playfair':  f'{FONTS_DIR}/PlayfairDisplay-Regular.ttf',
        'playfair_b': f'{FONTS_DIR}/PlayfairDisplay-Bold.ttf',
        'playfair_i': f'{FONTS_DIR}/PlayfairDisplay-Italic.ttf',
        'space':     f'{FONTS_DIR}/SpaceMono-Regular.ttf',
        'space_b':   f'{FONTS_DIR}/SpaceMono-Bold.ttf',
        'dm':        f'{FONTS_DIR}/DMSerifDisplay-Regular.ttf',
        'garamond':  f'{FONTS_DIR}/CormorantGaramond-Regular.ttf',
        'garamond_i': f'{FONTS_DIR}/CormorantGaramond-Italic.ttf',
        'garamond_b': f'{FONTS_DIR}/CormorantGaramond-Bold.ttf',
        'oswald':    f'{FONTS_DIR}/Oswald-Variable.ttf',
        'raleway':   f'{FONTS_DIR}/Raleway-Variable.ttf',
    }
    try:
        return ImageFont.truetype(paths.get(name, paths['garamond']), size)
    except:
        return ImageFont.load_default()

# ═══ TEXTURE ═══
def make_paper_texture(size=CANVAS):
    img = Image.new('RGB', (size, size), PALETTE['bg'])
    rng = random.Random(42)
    for _ in range(800000):
        x = rng.randint(0, size-1)
        y = rng.randint(0, size-1)
        v = rng.randint(-8, 8)
        base = PALETTE['bg']
        c = tuple(max(0, min(255, base[i] + v)) for i in range(3))
        img.putpixel((x, y), c)
    draw = ImageDraw.Draw(img)
    for _ in range(200):
        x1 = rng.randint(0, size)
        y1 = rng.randint(0, size)
        angle = rng.uniform(-0.3, 0.3)
        length = rng.randint(40, 200)
        x2 = x1 + int(length * math.cos(angle))
        y2 = y1 + int(length * math.sin(angle))
        v = rng.randint(22, 28)
        draw.line([(x1, y1), (x2, y2)], fill=(v, v-1, v-2), width=1)
    return img.filter(ImageFilter.GaussianBlur(0.5))

# ═══ REGISTRATION ═══
def add_registration_marks(draw, color=None):
    c = color or PALETTE['reg_mark']
    s = CANVAS
    inset = REG_INSET
    length = 40
    w = 2
    for cx, cy in [(inset,inset),(s-inset,inset),(inset,s-inset),(s-inset,s-inset)]:
        draw.line([(cx-length,cy),(cx+length,cy)], fill=c, width=w)
        draw.line([(cx,cy-length),(cx,cy+length)], fill=c, width=w)
        draw.ellipse([cx-12,cy-12,cx+12,cy+12], outline=c, width=w)

# ═══ BRAILLE RENDERER ═══
def add_braille_motif(draw, page_index, total_pages, accent_color):
    braille_text = get_braille_for_page(page_index, total_pages)
    px, py = get_plinko_position(page_index, total_pages)

    progress = page_index / max(total_pages - 1, 1)
    r0, g0, b0 = accent_color
    r1, g1, b1 = 55, 52, 48
    cr = int(r0 + (r1 - r0) * progress * 0.7)
    cg = int(g0 + (g1 - g0) * progress * 0.7)
    cb = int(b0 + (b1 - b0) * progress * 0.7)
    dot_color = (cr, cg, cb)

    dot_r = 14
    dot_gap = 38
    char_gap = 20

    cx = px
    for char in braille_text:
        code = ord(char) - 0x2800
        if code < 0 or code > 255:
            cx += char_gap
            continue
        if code == 0:  # blank space
            cx += dot_gap + char_gap
            continue

        for dot_num in range(6):
            if code & (1 << dot_num):
                col = dot_num // 3
                row = dot_num % 3
                dx = cx + col * dot_gap
                dy = py + row * dot_gap
                draw.ellipse([dx-dot_r, dy-dot_r, dx+dot_r, dy+dot_r], fill=dot_color)

        cx += dot_gap * 2 + char_gap

# ═══ DATE STAMP ═══
def add_date_stamp(draw, text, color=None):
    c = color or PALETTE['text_dim']
    f = font('space', 28)
    draw.text((MARGIN+20, CANVAS-MARGIN-10), text, font=f, fill=c, anchor='lb')

# ═══ PHOTO TOOLS ═══
def treat_photo_for_book(photo_path, style='desaturated', accent=None):
    img = Image.open(photo_path).convert('RGB')
    if style == 'monochrome':
        img = ImageEnhance.Color(img).enhance(0)
        img = ImageEnhance.Contrast(img).enhance(1.1)
        img = ImageEnhance.Brightness(img).enhance(0.85)
    elif style == 'desaturated':
        img = ImageEnhance.Color(img).enhance(0.3)
        img = ImageEnhance.Contrast(img).enhance(1.15)
        img = ImageEnhance.Brightness(img).enhance(0.8)
    elif style == 'tinted' and accent:
        img = ImageEnhance.Color(img).enhance(0.15)
        img = ImageEnhance.Contrast(img).enhance(1.1)
        tint = Image.new('RGB', img.size, accent)
        img = Image.blend(img, tint, 0.12)
    return img

def fit_photo_portrait(photo, target_w=CANVAS, target_h=CANVAS, max_height_ratio=0.82):
    w, h = photo.size
    max_h = int(target_h * max_height_ratio)
    scale = min(target_w * 0.7 / w, max_h / h)
    nw, nh = int(w * scale), int(h * scale)
    photo = photo.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new('RGB', (target_w, target_h), PALETTE['bg'])
    canvas.paste(photo, ((target_w-nw)//2, (target_h-nh)//2))
    return canvas

def wrap_text(draw, text, fnt, max_width):
    words = text.split()
    lines, current = [], ""
    for w in words:
        test = f"{current} {w}".strip()
        bbox = draw.textbbox((0,0), test, font=fnt)
        if bbox[2] - bbox[0] > max_width and current:
            lines.append(current)
            current = w
        else:
            current = test
    if current:
        lines.append(current)
    return lines

print("Core library v2 loaded.")
print(f"Poem chunks: {len(_CHUNKS)} for 42 pages, {len(_POEM_WORDS)} words total")
