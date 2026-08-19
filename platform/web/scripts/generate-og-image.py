#!/usr/bin/env python3
"""Generate the CareerStoryMap social preview with the web brand type system."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og-careerstorymap.png"
WIDTH, HEIGHT = 1200, 630

PAPER = "#F5F4F0"
SURFACE = "#FBFBF9"
GRAPHITE = "#27333D"
INK = "#25313A"
MUTED = "#68747D"
LINE = "#D7DDDF"
MIST = "#AFC5D2"
MIST_DEEP = "#7E9FB3"
WHITE = "#F8FAFB"


def geist_path() -> Path:
    candidates = [
        ROOT / ".vinext/fonts/geist-8ac0455e797f/geist-98bbbccb.woff2",
        ROOT
        / "dist/client/_next/static/_vinext_fonts/geist-8ac0455e797f/geist-98bbbccb.woff2",
        Path("/System/Library/Fonts/SFNS.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError("Build the web app once so the self-hosted Geist font is available.")


FONT_PATH = geist_path()


def font(size: int, weight: str = "Regular") -> ImageFont.FreeTypeFont:
    face = ImageFont.truetype(str(FONT_PATH), size=size)
    try:
        face.set_variation_by_name(weight.encode())
    except OSError:
        pass
    return face


def text_with_tracking(
    draw: ImageDraw.ImageDraw,
    position: tuple[int, int],
    text: str,
    face: ImageFont.FreeTypeFont,
    fill: str,
    tracking: int,
) -> None:
    x, y = position
    for character in text:
        draw.text((x, y), character, font=face, fill=fill)
        width = draw.textlength(character, font=face)
        x += int(width) + tracking


def card(
    draw: ImageDraw.ImageDraw,
    y: int,
    number: str,
    title: str,
    detail: str,
    active: bool = False,
) -> None:
    fill = "#34424D" if active else "#303C46"
    outline = MIST_DEEP if active else "#45535E"
    draw.rounded_rectangle((690, y, 1080, y + 92), radius=18, fill=fill, outline=outline, width=2)
    draw.ellipse((713, y + 25, 755, y + 67), fill=MIST if active else "#53636F")
    draw.text((726, y + 31), number, font=font(15, "Bold"), fill=GRAPHITE if active else WHITE)
    draw.text((775, y + 20), title, font=font(20, "SemiBold"), fill=WHITE)
    draw.text((775, y + 52), detail, font=font(13, "Regular"), fill="#B9C5CC")


def generate() -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
    draw = ImageDraw.Draw(image)

    # Quiet page structure keeps the image consistent with the warm-gray website.
    for x in range(0, WIDTH, 60):
        draw.line((x, 0, x, HEIGHT), fill="#F0EFEB", width=1)
    for y in range(0, HEIGHT, 60):
        draw.line((0, y, WIDTH, y), fill="#F0EFEB", width=1)

    # Brand lockup.
    draw.rounded_rectangle((62, 58, 108, 104), radius=14, fill=GRAPHITE)
    draw.arc((70, 66, 100, 96), start=38, end=320, fill=WHITE, width=3)
    draw.text((76, 71), "CS", font=font(15, "Bold"), fill=MIST)
    draw.ellipse((96, 69, 102, 75), fill=WHITE)
    draw.text((124, 66), "CareerStoryMap", font=font(25, "SemiBold"), fill=INK)
    text_with_tracking(
        draw,
        (125, 95),
        "INTERVIEW PROOF PACK",
        font(9, "Bold"),
        MUTED,
        2,
    )

    text_with_tracking(
        draw,
        (62, 166),
        "ONE JOB. ONE PROOF PACK.",
        font(12, "Bold"),
        MIST_DEEP,
        2,
    )
    draw.text((60, 202), "Build interview stories", font=font(48, "SemiBold"), fill=INK)
    draw.text((60, 262), "you can defend.", font=font(48, "SemiBold"), fill=INK)
    draw.text(
        (64, 367),
        "Turn one job description and your real experience into\nan evidence map, defensible stories, and a mock interview.",
        font=font(19, "Regular"),
        fill=MUTED,
        spacing=10,
    )

    # Product promise chips.
    chips = ["Evidence map", "Real gaps", "Role-specific follow-ups"]
    chip_x = 62
    for chip in chips:
        chip_width = int(draw.textlength(chip, font=font(12, "Medium"))) + 30
        draw.rounded_rectangle(
            (chip_x, 487, chip_x + chip_width, 523),
            radius=18,
            fill=SURFACE,
            outline=LINE,
            width=1,
        )
        draw.text((chip_x + 15, 497), chip, font=font(12, "Medium"), fill=INK)
        chip_x += chip_width + 10

    # Story-map panel.
    draw.rounded_rectangle((630, 54, 1140, 576), radius=30, fill=GRAPHITE)
    text_with_tracking(
        draw,
        (690, 88),
        "INTERVIEW PROOF PACK",
        font(11, "Bold"),
        MIST,
        2,
    )
    draw.text((690, 119), "Evidence you can defend", font=font(29, "SemiBold"), fill=WHITE)

    card(draw, 176, "1", "Resume + JD", "What you did and what the role needs")
    draw.line((734, 268, 734, 284), fill=MIST_DEEP, width=2)
    card(draw, 284, "2", "Evidence map", "Strong proof and real gaps")
    draw.line((734, 376, 734, 392), fill=MIST_DEEP, width=2)
    card(draw, 392, "3", "Stories + mock interview", "Specific, truthful, and ready", active=True)

    draw.rounded_rectangle((690, 510, 1080, 548), radius=19, fill="#E7EFF3")
    draw.ellipse((708, 523, 720, 535), fill=MIST_DEEP)
    draw.text((734, 520), "Evidence linked at every step", font=font(13, "SemiBold"), fill=GRAPHITE)

    image.save(OUTPUT, format="PNG", optimize=True)
    print(OUTPUT)


if __name__ == "__main__":
    generate()
