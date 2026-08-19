from __future__ import annotations

import re

EMAIL_PATTERN = re.compile(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}")
PHONE_PATTERN = re.compile(
    r"(?<!\d)(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}(?!\d)"
)
LINKEDIN_PATTERN = re.compile(
    r"https?://(?:www\.)?linkedin\.com/[^\s]+",
    re.IGNORECASE,
)


def redact_personal_info(text: str) -> str:
    """Redact personal identifiers before using candidate context."""
    redacted, _ = redact_with_counts(text)
    return redacted


def redact_with_counts(text: str) -> tuple[str, dict[str, int]]:
    """Redact common identifiers and return transparent redaction counts."""
    counts = {
        "emails": len(EMAIL_PATTERN.findall(text)),
        "phones": len(PHONE_PATTERN.findall(text)),
        "linkedin_urls": len(LINKEDIN_PATTERN.findall(text)),
    }
    redacted = EMAIL_PATTERN.sub("[REDACTED_EMAIL]", text)
    redacted = PHONE_PATTERN.sub("[REDACTED_PHONE]", redacted)
    redacted = LINKEDIN_PATTERN.sub("[REDACTED_LINKEDIN]", redacted)
    return redacted, counts
