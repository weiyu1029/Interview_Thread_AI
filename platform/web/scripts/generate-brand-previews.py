#!/usr/bin/env python3
"""Generate InterviewThread walkthrough and LinkedIn preview artwork."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
LOCKUP = PUBLIC / "interviewthread-logo-lockup.png"
POSTER = PUBLIC / "interviewthread-walkthrough-poster.png"
BANNER = PUBLIC / "interviewthread-linkedin-banner.png"

PAPER = "#F5F4F0"
SURFACE = "#FBFBF9"
INK = "#1F2933"
GRAPHITE = "#2A3D4C"
MUTED = "#66747F"
LINE = "#CDD6DB"
MIST = "#91AFC2"
SERIF = Path("/System/Library/Fonts/NewYork.ttf")
SERIF_FALLBACK = Path("/System/Library/Fonts/Supplemental/Georgia.ttf")
SERIF_BOLD = Path("/System/Library/Fonts/Supplemental/Georgia Bold.ttf")


def face(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = SERIF_BOLD if bold else (SERIF if SERIF.exists() else SERIF_FALLBACK)
    return ImageFont.truetype(str(path), size=size)


def center_text(draw: ImageDraw.ImageDraw, text: str, y: int, font: ImageFont.FreeTypeFont, fill: str, width: int) -> None:
    box = draw.textbbox((0, 0), text, font=font)
    draw.text(((width - (box[2] - box[0])) / 2, y), text, font=font, fill=fill)


def rounded_button(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], text: str, primary: bool) -> None:
    fill = GRAPHITE if primary else SURFACE
    outline = GRAPHITE if primary else LINE
    draw.rounded_rectangle(box, radius=16, fill=fill, outline=outline, width=2)
    font = face(18, bold=True)
    text_box = draw.textbbox((0, 0), text, font=font)
    x = box[0] + ((box[2] - box[0]) - (text_box[2] - text_box[0])) / 2
    y = box[1] + ((box[3] - box[1]) - (text_box[3] - text_box[1])) / 2 - 2
    draw.text((x, y), text, font=font, fill=SURFACE if primary else GRAPHITE)


def generate_poster() -> None:
    width, height = 1280, 720
    image = Image.new("RGB", (width, height), PAPER)
    draw = ImageDraw.Draw(image)

    lockup = Image.open(LOCKUP).convert("RGBA")
    lockup.thumbnail((248, 82), Image.Resampling.LANCZOS)
    image.alpha_composite(lockup, (42, 18)) if image.mode == "RGBA" else image.paste(lockup, (42, 18), lockup)
    draw.line((0, 104, width, 104), fill=LINE, width=2)

    center_text(draw, "AI MOCK INTERVIEW", 142, face(17, bold=True), "#486174", width)
    center_text(draw, "Ace the interview for your dream job.", 184, face(56), INK, width)
    center_text(
        draw,
        "Build truthful stories, predict realistic questions, and practice with evidence you can defend.",
        266,
        face(21),
        MUTED,
        width,
    )

    rounded_button(draw, (295, 326, 625, 386), "Start my mock interview", True)
    rounded_button(draw, (655, 326, 985, 386), "Watch the 60-second walkthrough", False)

    steps = [
        ("1", "Upload your resume"),
        ("2", "Add the job post"),
        ("3", "Get your interview plan"),
        ("4", "Practice with AI"),
    ]
    card_width = 270
    gap = 18
    start_x = (width - (card_width * 4 + gap * 3)) // 2
    for index, (number, label) in enumerate(steps):
        x = start_x + index * (card_width + gap)
        draw.rounded_rectangle((x, 445, x + card_width, 548), radius=20, fill=SURFACE, outline=LINE, width=2)
        draw.ellipse((x + 18, 474, x + 62, 518), fill="#E8EFF3", outline=MIST, width=2)
        number_box = draw.textbbox((0, 0), number, font=face(18, bold=True))
        draw.text((x + 40 - (number_box[2] - number_box[0]) / 2, 483), number, font=face(18, bold=True), fill=GRAPHITE)
        draw.text((x + 78, 483), label, font=face(17, bold=True), fill=GRAPHITE)

    trust = "Every suggestion links to your evidence   ·   Private by default   ·   No invented achievements"
    center_text(draw, trust, 610, face(17), MUTED, width)
    image.save(POSTER, format="PNG", optimize=True)


def generate_banner() -> None:
    width, height = 1128, 191
    image = Image.new("RGB", (width, height), PAPER)
    draw = ImageDraw.Draw(image)

    for x in range(width):
        ratio = x / max(width - 1, 1)
        base = (245, 244, 240)
        mist = (232, 239, 243)
        color = tuple(round(base[i] * (1 - ratio * 0.34) + mist[i] * ratio * 0.34) for i in range(3))
        draw.line((x, 0, x, height), fill=color)

    lockup = Image.open(LOCKUP).convert("RGBA")
    lockup.thumbnail((252, 84), Image.Resampling.LANCZOS)
    image.paste(lockup, (45, 28), lockup)
    draw.line((328, 32, 328, 159), fill=LINE, width=2)

    draw.text((370, 42), "Ace the interview for your dream job.", font=face(39), fill=INK)
    draw.text((372, 108), "Truthful, role-specific AI practice grounded in your real experience.", font=face(18), fill=MUTED)
    draw.rounded_rectangle((1000, 71, 1050, 121), radius=25, fill=GRAPHITE)
    draw.ellipse((1018, 89, 1032, 103), fill=MIST)
    image.save(BANNER, format="PNG", optimize=True)


if __name__ == "__main__":
    generate_poster()
    generate_banner()
    print(POSTER)
    print(BANNER)
