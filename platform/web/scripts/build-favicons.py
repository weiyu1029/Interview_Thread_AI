from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "interviewthread-logo-lockup.png"
BACKGROUND = (244, 242, 237)
INK = (16, 49, 70)
THREAD = (244, 242, 237)
ACCENT = (141, 171, 194)


def build_master() -> Image.Image:
    source = Image.open(SOURCE).convert("RGB")
    # The upper half of the approved lockup is the connected-thread brand mark.
    mark = source.crop((145, 0, 875, 210))
    background = Image.new("RGB", mark.size, mark.getpixel((0, 0)))
    difference = ImageChops.difference(mark, background).convert("L")
    mask = difference.point(lambda value: 255 if value > 12 else 0)
    mask = mask.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(1.2))

    bounds = mask.getbbox()
    if bounds is None:
        raise RuntimeError("Could not isolate the InterviewThread brand mark")
    mask = mask.crop(bounds)

    canvas = Image.new("RGB", (512, 512), BACKGROUND)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(
        (24, 24, 488, 488),
        radius=118,
        fill=INK,
    )

    # A compact, high-contrast favicon adaptation of the approved connected-
    # thread mark. The former light-background version became nearly invisible
    # at 16 px, causing some browser surfaces to fall back to a generic globe.
    target_width = 404
    target_height = round(mask.height * target_width / mask.width)
    resized_mask = mask.resize((target_width, target_height), Image.Resampling.LANCZOS)
    color = Image.new("RGB", resized_mask.size, THREAD)
    mark_left = (512 - target_width) // 2
    mark_top = (512 - target_height) // 2
    canvas.paste(
        color,
        (mark_left, mark_top),
        resized_mask,
    )
    draw = ImageDraw.Draw(canvas)
    dot_radius = 18
    dot_center = (256, mark_top + round(target_height * 0.23))
    draw.ellipse(
        (
            dot_center[0] - dot_radius,
            dot_center[1] - dot_radius,
            dot_center[0] + dot_radius,
            dot_center[1] + dot_radius,
        ),
        fill=ACCENT,
    )
    return canvas


def main() -> None:
    master = build_master()
    outputs = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "apple-touch-icon.png": 180,
        "icon-192.png": 192,
        "icon-512.png": 512,
        "icon.png": 512,
        # Physical, versioned filenames force browser shells that cache a
        # favicon by URL (and ignore query strings) to fetch the brand mark.
        "interviewthread-favicon-32-v4.png": 32,
        "interviewthread-apple-v4.png": 180,
        "interviewthread-icon-192-v4.png": 192,
        "interviewthread-icon-512-v4.png": 512,
        "interviewthread-favicon-32-v5.png": 32,
        "interviewthread-apple-v5.png": 180,
        "interviewthread-icon-192-v5.png": 192,
        "interviewthread-icon-512-v5.png": 512,
        "interviewthread-favicon-32-v6.png": 32,
        "interviewthread-apple-v6.png": 180,
        "interviewthread-icon-192-v6.png": 192,
        "interviewthread-icon-512-v6.png": 512,
    }
    for filename, size in outputs.items():
        master.resize((size, size), Image.Resampling.LANCZOS).save(
            PUBLIC / filename,
            optimize=True,
        )
    master.save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        bitmap_format="bmp",
    )
    master.save(
        PUBLIC / "interviewthread-favicon-v4.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        bitmap_format="bmp",
    )
    master.save(
        PUBLIC / "interviewthread-favicon-v5.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        bitmap_format="bmp",
    )
    master.save(
        PUBLIC / "interviewthread-favicon-v6.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        bitmap_format="bmp",
    )

    # Next.js App Router emits automatic icon metadata for files under app/.
    # Keep those byte-for-byte aligned with the public and manifest assets.
    app = ROOT / "app"
    master.save(app / "icon.png", optimize=True)
    master.resize((180, 180), Image.Resampling.LANCZOS).save(
        app / "apple-icon.png",
        optimize=True,
    )
    master.save(
        app / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        bitmap_format="bmp",
    )


if __name__ == "__main__":
    main()
