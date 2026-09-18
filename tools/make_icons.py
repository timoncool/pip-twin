"""Generate extension icons: two overlapping rounded rectangles (a video and its twin)."""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "assets"
OUT.mkdir(exist_ok=True)


def draw(size: int) -> Image.Image:
    s = size * 4
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = s // 8
    d.rounded_rectangle((s * 0.06, s * 0.14, s * 0.70, s * 0.62), radius=r, fill=(38, 38, 42, 255))
    d.rounded_rectangle((s * 0.30, s * 0.38, s * 0.94, s * 0.86), radius=r, fill=(255, 0, 51, 255), outline=(255, 255, 255, 255), width=s // 32)
    cx, cy = s * 0.62, s * 0.62
    t = s * 0.10
    d.polygon([(cx - t * 0.7, cy - t), (cx - t * 0.7, cy + t), (cx + t, cy)], fill=(255, 255, 255, 255))
    return img.resize((size, size), Image.LANCZOS)


for size in (16, 48, 128):
    draw(size).save(OUT / f"icon{size}.png")
    print("[OK]", OUT / f"icon{size}.png")
