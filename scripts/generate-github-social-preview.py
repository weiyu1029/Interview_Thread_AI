#!/usr/bin/env python3
"""Build the 1280x640 InterviewThread GitHub social preview.

The approved logo lockup is composited as-is.  This script intentionally draws
the surrounding layout with deterministic primitives instead of regenerating
or tracing the brand mark.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "platform" / "web" / "public" / "interviewthread-logo-lockup.png"
OUTPUT = ROOT / "assets" / "github-social-preview.png"

WIDTH, HEIGHT = 1280, 640
PAPER = "#F7F4EF"
INK = "#202833"
GRAPHITE = "#293946"
MIST = "#E7ECEF"
MIST_BLUE = "#AFC5D2"
SLATE = "#69737D"
WHITE = "#FBFCFC"
LINE = "#D4DCE0"

SERIF_REGULAR = Path("/System/Library/Fonts/NewYork.ttf")
SERIF_FALLBACK = Path("/System/Library/Fonts/Supplemental/Georgia.ttf")
SERIF_BOLD = Path("/System/Library/Fonts/Supplemental/Georgia Bold.ttf")


def font(size: int, *, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = SERIF_BOLD if bold else (SERIF_REGULAR if SERIF_REGULAR.exists() else SERIF_FALLBACK)
    return ImageFont.truetype(str(path), size=size)


def tracked_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    value: str,
    face: ImageFont.FreeTypeFont,
    fill: str,
    tracking: int,
) -> None:
    x, y = xy
    for character in value:
        draw.text((x, y), character, font=face, fill=fill)
        x += int(draw.textlength(character, font=face)) + tracking


def centered_text(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    value: str,
    face: ImageFont.FreeTypeFont,
    fill: str,
) -> None:
    x1, y1, x2, y2 = box
    bounds = draw.textbbox((0, 0), value, font=face)
    text_width = bounds[2] - bounds[0]
    text_height = bounds[3] - bounds[1]
    x = x1 + ((x2 - x1) - text_width) / 2
    y = y1 + ((y2 - y1) - text_height) / 2 - bounds[1]
    draw.text((x, y), value, font=face, fill=fill)


def step_card(draw: ImageDraw.ImageDraw, y: int, index: str, title: str) -> None:
    draw.rounded_rectangle((808, y, 1164, y + 82), radius=18, fill="#344754", outline="#526572", width=2)
    draw.ellipse((830, y + 22, 868, y + 60), fill=MIST_BLUE)
    centered_text(draw, (830, y + 22, 868, y + 60), index, font(16, bold=True), GRAPHITE)
    draw.text((890, y + 25), title, font=font(20, bold=True), fill=WHITE)


def generate() -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
    draw = ImageDraw.Draw(image)

    # Quiet, warm-paper field with one mist accent; consistent with the site.
    draw.ellipse((988, -190, 1458, 280), fill="#EDF1F2")
    draw.line((64, 594, 1216, 594), fill=LINE, width=2)

    approved_lockup = Image.open(LOGO).convert("RGB")
    approved_lockup.thumbnail((400, 152), Image.Resampling.LANCZOS)
    image.paste(approved_lockup, (54, 28))

    tracked_text(draw, (66, 190), "EVIDENCE-GROUNDED AI MOCK INTERVIEWS", font(14, bold=True), "#486174", 2)
    draw.text((62, 232), "Interview stories", font=font(58), fill=INK)
    draw.text((62, 300), "you can defend.", font=font(58), fill=INK)
    draw.multiline_text(
        (66, 400),
        "Turn a real resume and job post into truthful stories,\nrealistic questions, and role-specific practice.",
        font=font(22),
        fill=SLATE,
        spacing=11,
    )

    # A dark, high-contrast proof flow stays legible in GitHub thumbnails.
    draw.rounded_rectangle((754, 44, 1216, 568), radius=32, fill=GRAPHITE)
    draw.rounded_rectangle((1014, 72, 1170, 114), radius=21, fill=MIST)
    centered_text(draw, (1014, 72, 1170, 114), "FOUNDING BETA", font(14, bold=True), GRAPHITE)
    tracked_text(draw, (808, 84), "INTERVIEWTHREAD", font(12, bold=True), MIST_BLUE, 2)

    draw.text((806, 135), "One clear path", font=font(32), fill=WHITE)
    draw.text((808, 176), "from evidence to practice", font=font(18), fill="#C6D1D7")

    step_card(draw, 226, "1", "Resume + job post")
    draw.line((849, 308, 849, 326), fill=MIST_BLUE, width=3)
    step_card(draw, 326, "2", "Truthful stories")
    draw.line((849, 408, 849, 426), fill=MIST_BLUE, width=3)
    step_card(draw, 426, "3", "Mock interview")

    draw.ellipse((808, 531, 820, 543), fill=MIST_BLUE)
    draw.text((836, 523), "Evidence linked at every step", font=font(15, bold=True), fill="#D7E1E6")

    draw.text((66, 604), "interviewthreadai.com", font=font(17, bold=True), fill=GRAPHITE)
    draw.text((1038, 604), "Open source", font=font(17), fill=SLATE)

    if image.size != (WIDTH, HEIGHT):
        raise RuntimeError(f"Unexpected output size: {image.size}")
    image.save(OUTPUT, format="PNG", optimize=True)
    print(OUTPUT)


if __name__ == "__main__":
    generate()
