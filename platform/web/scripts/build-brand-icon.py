from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


SIZE = 512
SCALE = 4
CANVAS = SIZE * SCALE
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "icon.png"


def cubic_point(t: float, points: tuple[tuple[float, float], ...]) -> tuple[int, int]:
    one_minus = 1 - t
    weights = (
        one_minus**3,
        3 * one_minus**2 * t,
        3 * one_minus * t**2,
        t**3,
    )
    x = sum(weight * point[0] for weight, point in zip(weights, points))
    y = sum(weight * point[1] for weight, point in zip(weights, points))
    return round(x * SCALE), round(y * SCALE)


def build_icon() -> None:
    image = Image.new("RGB", (CANVAS, CANVAS), "#f4f2ed")
    draw = ImageDraw.Draw(image)

    margin = 42 * SCALE
    draw.rounded_rectangle(
        (margin, margin, CANVAS - margin, CANVAS - margin),
        radius=118 * SCALE,
        fill="#273540",
        outline="#425460",
        width=8 * SCALE,
    )

    glow = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse(
        (248 * SCALE, 52 * SCALE, 482 * SCALE, 286 * SCALE),
        fill=(158, 184, 200, 56),
    )
    image = Image.alpha_composite(
        image.convert("RGBA"), glow.filter(ImageFilter.GaussianBlur(54 * SCALE))
    )
    draw = ImageDraw.Draw(image)

    controls = (
        (142.0, 360.0),
        (50.0, 142.0),
        (412.0, 374.0),
        (370.0, 142.0),
    )
    thread = [cubic_point(index / 240, controls) for index in range(241)]
    draw.line(thread, fill="#dce7ed", width=18 * SCALE, joint="curve")

    for x, y, fill in (
        (142, 360, "#dce7ed"),
        (370, 142, "#9eb8c8"),
    ):
        radius = 25 * SCALE
        draw.ellipse(
            (x * SCALE - radius, y * SCALE - radius, x * SCALE + radius, y * SCALE + radius),
            fill=fill,
            outline="#273540",
            width=8 * SCALE,
        )

    image = image.convert("RGB").resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    image.save(OUTPUT, optimize=True)


if __name__ == "__main__":
    build_icon()
