from __future__ import annotations

from typing import Any

TRACKER_COLUMNS = (
    "Date",
    "Company",
    "Role",
    "Evidence Fit",
    "Grade",
    "Status",
    "Notes",
)
TRACKER_STATUSES = (
    "Evaluated",
    "Shortlisted",
    "Applied",
    "Responded",
    "Interview",
    "Offer",
    "Hired",
    "Rejected",
    "Discarded",
)


def normalize_tracker_row(row: dict[str, Any]) -> dict[str, str]:
    normalized = {
        column: str(row.get(column, "")).strip()
        for column in TRACKER_COLUMNS
    }
    if normalized["Status"] not in TRACKER_STATUSES:
        normalized["Status"] = "Evaluated"
    return normalized


def upsert_tracker_row(
    rows: list[dict[str, Any]],
    new_row: dict[str, Any],
) -> list[dict[str, str]]:
    """Insert or replace one company+role row without creating duplicates."""
    normalized_rows = [normalize_tracker_row(row) for row in rows]
    normalized_new = normalize_tracker_row(new_row)
    key = (
        normalized_new["Company"].casefold(),
        normalized_new["Role"].casefold(),
    )
    for index, row in enumerate(normalized_rows):
        row_key = (row["Company"].casefold(), row["Role"].casefold())
        if row_key == key:
            normalized_rows[index] = normalized_new
            return normalized_rows
    return [*normalized_rows, normalized_new]
