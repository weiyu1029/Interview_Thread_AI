from __future__ import annotations

from app.tools.tracker import normalize_tracker_row, upsert_tracker_row


def _row(company: str = "Example", role: str = "Analyst") -> dict[str, str]:
    return {
        "Date": "2026-08-19",
        "Company": company,
        "Role": role,
        "Evidence Fit": "72/100",
        "Grade": "B",
        "Status": "Evaluated",
        "Notes": "Review SQL gap",
    }


def test_tracker_normalizes_unknown_status() -> None:
    row = normalize_tracker_row({**_row(), "Status": "Maybe"})

    assert row["Status"] == "Evaluated"


def test_tracker_upsert_deduplicates_company_and_role() -> None:
    rows = [_row()]
    updated = upsert_tracker_row(
        rows,
        {**_row(company="example", role="analyst"), "Status": "Applied"},
    )

    assert len(updated) == 1
    assert updated[0]["Status"] == "Applied"


def test_tracker_keeps_distinct_roles() -> None:
    updated = upsert_tracker_row([_row()], _row(role="Senior Analyst"))

    assert len(updated) == 2
