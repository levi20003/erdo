"""Render the PNG app icons (Android / iOS home-screen install) with Pillow.

Run: npm run icons
"""
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
BG, SAND, OLIVE, OLIVE_LIGHT = "#18181b", "#c9ab84", "#5f6239", "#80844d"
S = 1024  # draw large, downscale for smooth edges


def leaf(draw, base, tip, width, fill):
    """Leaf polygon: a lens shape from base to tip."""
    import math

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


def render(scale, rounded):
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0) if rounded else BG)
    d = ImageDraw.Draw(img)
    if rounded:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=S // 4, fill=BG)
    c = S / 2
    u = S / 64 * scale  # one unit of the 64px design grid

    def p(x, y):
        return (c + (x - 32) * u, c + (y - 32) * u)

    d.line([p(32, 52), p(32, 30)], fill=SAND, width=int(4 * u))
    d.ellipse([*map(lambda v: v - 2 * u, p(32, 52)), *map(lambda v: v + 2 * u, p(32, 52))], fill=SAND)
    leaf(d, p(32, 36), p(17, 22), 5 * u, OLIVE)
    leaf(d, p(32, 31), p(48, 15), 5.5 * u, OLIVE_LIGHT)
    return img


def save(img, size, name):
    img.resize((size, size), Image.LANCZOS).save(OUT / name)


OUT.mkdir(parents=True, exist_ok=True)
regular = render(1.0, rounded=True)
save(regular, 192, "icon-192.png")
save(regular, 512, "icon-512.png")
# Maskable and Apple icons are full-bleed; artwork kept inside the 80% safe zone.
full = render(0.72, rounded=False)
save(full, 512, "icon-maskable-512.png")
save(render(0.85, rounded=False), 180, "apple-touch-icon.png")
print("icons written to", OUT)
