from __future__ import annotations

from io import BytesIO

import pytest
from openpyxl import Workbook

from app.tools.resume_parser import MAX_RESUME_BYTES, extract_resume_text


def test_extracts_text_resume_in_memory() -> None:
    text = extract_resume_text("resume.md", b"# Resume\n\nBuilt a reporting workflow.")

    assert text.startswith("# Resume")
    assert "reporting workflow" in text


def test_rejects_unsupported_resume_type() -> None:
    with pytest.raises(ValueError, match="Supported document formats"):
        extract_resume_text("resume.pages", b"not a supported file")


def test_rejects_oversized_resume() -> None:
    with pytest.raises(ValueError, match="12 MB"):
        extract_resume_text("resume.txt", b"x" * (MAX_RESUME_BYTES + 1))


@pytest.mark.parametrize(
    ("file_name", "content", "expected"),
    [
        ("resume.html", b"<h1>Analyst</h1><p>Built dashboards</p>", "Built dashboards"),
        ("resume.csv", b"skill,evidence\nSQL,Built a warehouse\n", "Built a warehouse"),
        ("resume.json", b'{"skill": "Python", "result": "Reduced cycle time"}', "Reduced cycle time"),
        ("resume.rtf", b"{\\rtf1\\ansi Led analytics delivery}", "Led analytics delivery"),
    ],
)
def test_extracts_structured_text_formats(file_name: str, content: bytes, expected: str) -> None:
    assert expected in extract_resume_text(file_name, content)


def test_extracts_xlsx_cells() -> None:
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Evidence"
    sheet.append(["Skill", "Result"])
    sheet.append(["SQL", "Improved reporting speed by 30%"])
    output = BytesIO()
    workbook.save(output)

    text = extract_resume_text("evidence.xlsx", output.getvalue())

    assert "Sheet: Evidence" in text
    assert "Improved reporting speed by 30%" in text
