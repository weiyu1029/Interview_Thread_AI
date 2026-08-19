from __future__ import annotations

import csv
import json
from io import BytesIO

MAX_RESUME_BYTES = 12 * 1024 * 1024
SUPPORTED_EXTENSIONS = ("pdf", "docx", "odt", "rtf", "txt", "md", "html", "htm", "csv", "json", "xlsx")


def extract_resume_text(file_name: str, content: bytes) -> str:
    """Extract resume text from an in-memory public-web upload.

    The file is never written to disk. Callers should keep the documented 12 MB
    limit so a public deployment cannot be used for unbounded file processing.
    """
    if len(content) > MAX_RESUME_BYTES:
        raise ValueError("Resume files must be 12 MB or smaller.")

    suffix = file_name.lower().rsplit(".", maxsplit=1)[-1] if "." in file_name else ""
    if suffix == "pdf":
        from pypdf import PdfReader

        reader = PdfReader(BytesIO(content))
        return "\n".join((page.extract_text() or "") for page in reader.pages).strip()

    if suffix == "docx":
        from docx import Document

        document = Document(BytesIO(content))
        return "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
            if paragraph.text.strip()
        ).strip()

    if suffix == "odt":
        from odf import teletype
        from odf.opendocument import load
        from odf.text import P

        document = load(BytesIO(content))
        return "\n".join(teletype.extractText(paragraph) for paragraph in document.getElementsByType(P)).strip()

    if suffix == "rtf":
        from striprtf.striprtf import rtf_to_text

        return rtf_to_text(content.decode("utf-8", errors="replace")).strip()

    if suffix in {"html", "htm"}:
        from bs4 import BeautifulSoup

        return BeautifulSoup(content, "html.parser").get_text("\n", strip=True)

    if suffix == "csv":
        decoded = content.decode("utf-8-sig", errors="replace")
        return "\n".join(" | ".join(cell.strip() for cell in row if cell.strip()) for row in csv.reader(decoded.splitlines())).strip()

    if suffix == "json":
        payload = json.loads(content.decode("utf-8-sig", errors="replace"))

        def flatten(value: object) -> list[str]:
            if isinstance(value, dict):
                return [f"{key}: {'; '.join(flatten(item))}" for key, item in value.items()]
            if isinstance(value, list):
                return [piece for item in value for piece in flatten(item)]
            return [str(value)]

        return "\n".join(flatten(payload)).strip()

    if suffix == "xlsx":
        from openpyxl import load_workbook

        workbook = load_workbook(BytesIO(content), read_only=True, data_only=True)
        lines: list[str] = []
        for sheet in workbook.worksheets:
            lines.append(f"Sheet: {sheet.title}")
            for row in sheet.iter_rows(values_only=True):
                values = [str(value).strip() for value in row if value not in (None, "")]
                if values:
                    lines.append(" | ".join(values))
        return "\n".join(lines).strip()

    if suffix in {"txt", "md"}:
        return content.decode("utf-8", errors="replace").strip()

    supported = ", ".join(item.upper() for item in SUPPORTED_EXTENSIONS)
    raise ValueError(f"Supported document formats: {supported}.")
