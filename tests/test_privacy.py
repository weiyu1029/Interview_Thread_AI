from __future__ import annotations

from app.tools.privacy import redact_personal_info, redact_with_counts


def test_redaction_counts_and_replacements() -> None:
    text = (
        "Contact jane.doe@example.com or (312) 555-0199. "
        "Profile: https://www.linkedin.com/in/jane-doe"
    )
    redacted, counts = redact_with_counts(text)

    assert counts == {"emails": 1, "phones": 1, "linkedin_urls": 1}
    assert "jane.doe@example.com" not in redacted
    assert "555-0199" not in redacted
    assert "linkedin.com/in/jane-doe" not in redacted
    assert redact_personal_info(text) == redacted

