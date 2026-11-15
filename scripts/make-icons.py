"""Render the PNG app icons (Android / iOS home-screen install) with Pillow.

The mark: a cream sprout on the app's forest-green gradient, with the lime
blob of the header in the corner. Mirrors public/icons/icon.svg.

Run: npm run icons
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
TOP, BOTTOM = (70, 169, 107), (37, 106, 64)  # #46a96b → #256a40
BLOB = (204, 212, 120, 72)  # #ccd478 at 28 %
STEM, LEAF_LEFT, LEAF_RIGHT = "#f7f8e8", "#d2d79f", "#f7f8e8"
S = 1024  # draw large, downscale for smooth edges


def leaf(draw, base, tip, width, fill):
    """Leaf polygon: a lens shape from base to tip."""
    (x0, y0), (x1, y1) = base, tip
    dx, dy = x1 - x0, y1 - y0
    length = math.hypot(dx, dy)
    nx, ny = -dy / length, dx / length
    pts = []
    for i in range(41):
        t = i / 40
        w = math.sin(math.pi * t) * width
        pts.append((x0 + dx * t + nx * w, y0 + dy * t + ny * w))
    for i in range(40, -1, -1):
        t = i / 40
        w = math.sin(math.pi * t) * width
        pts.append((x0 + dx * t - nx * w, y0 + dy * t - ny * w))
    draw.polygon(pts, fill=fill)


def background():
    """Vertical green gradient with the lime blob in the top-right corner."""
    img = Image.new("RGBA", (S, S))
    px = img.load()
    for y in range(S):
        t = y / (S - 1)
        row = tuple(round(TOP[i] + (BOTTOM[i] - TOP[i]) * t) for i in range(3)) + (255,)
        for x in range(S):
            px[x, y] = row
    blob = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    u = S / 64
    ImageDraw.Draw(blob).ellipse([31 * u, -13 * u, 77 * u, 23 * u], fill=BLOB)
    return Image.alpha_composite(img, blob)


def render(scale, rounded):
    img = background()
    if rounded:
        mask = Image.new("L", (S, S), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=S // 4, fill=255)
        img.putalpha(mask)
    d = ImageDraw.Draw(img)
    c = S / 2
    u = S / 64 * scale  # one unit of the 64px design grid

    def p(x, y):
        return (c + (x - 32) * u, c + (y - 32) * u)

    d.line([p(32, 52), p(32, 30)], fill=STEM, width=int(4 * u))
    for x, y in (p(32, 52), p(32, 30)):
        d.ellipse([x - 2 * u, y - 2 * u, x + 2 * u, y + 2 * u], fill=STEM)
    leaf(d, p(32, 36), p(17, 22), 5 * u, LEAF_LEFT)
    leaf(d, p(32, 31), p(48, 15), 5.5 * u, LEAF_RIGHT)
    return img


def save(img, size, name, opaque=False):
    out = img.resize((size, size), Image.LANCZOS)
    (out.convert("RGB") if opaque else out).save(OUT / name)


OUT.mkdir(parents=True, exist_ok=True)
regular = render(1.0, rounded=True)
save(regular, 192, "icon-192.png")
save(regular, 512, "icon-512.png")
# Maskable and Apple icons are full-bleed; artwork kept inside the 80% safe zone.
save(render(0.72, rounded=False), 512, "icon-maskable-512.png", opaque=True)
save(render(0.85, rounded=False), 180, "apple-touch-icon.png", opaque=True)
print("icons written to", OUT)
