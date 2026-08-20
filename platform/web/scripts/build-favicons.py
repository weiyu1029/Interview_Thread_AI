from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "interviewthread-logo-lockup.png"
BACKGROUND = (244, 242, 237)
INK = (16, 49, 70)


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
    target_width = 448
    target_height = round(mask.height * target_width / mask.width)
    resized_mask = mask.resize((target_width, target_height), Image.Resampling.LANCZOS)
    color = Image.new("RGB", resized_mask.size, INK)
    canvas.paste(
        color,
        ((512 - target_width) // 2, (512 - target_height) // 2),
        resized_mask,
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
    )


if __name__ == "__main__":
    main()
