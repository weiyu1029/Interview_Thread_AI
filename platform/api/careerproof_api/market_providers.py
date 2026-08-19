from __future__ import annotations

import re
from datetime import datetime

import httpx

COUNTRY_CODE = re.compile(r"^[a-z]{2}$")


class AdzunaClient:
    """Small, fixed-host adapter for licensed Adzuna job search data."""

    base_url = "https://api.adzuna.com/v1/api"

    def __init__(self, app_id: str, app_key: str, timeout_seconds: float = 12.0):
        if not app_id or not app_key:
            raise ValueError("Adzuna credentials are not configured")
        self.app_id = app_id
        self.app_key = app_key
        self.timeout_seconds = timeout_seconds

    async def search(
        self,
        country_code: str,
        what: str = "",
        where: str = "",
        distance_km: int | None = None,
        results_per_page: int = 50,
    ) -> dict:
        country = country_code.lower()
        if not COUNTRY_CODE.fullmatch(country):
            raise ValueError("country_code must be a two-letter ISO-style provider code")
        params: dict[str, str | int] = {
            "app_id": self.app_id,
            "app_key": self.app_key,
            "results_per_page": min(max(results_per_page, 1), 50),
            "content-type": "application/json",
        }
        if what:
            params["what"] = what
        if where:
            params["where"] = where
        if distance_km is not None:
            params["distance"] = min(max(distance_km, 1), 2_000)
        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            response = await client.get(f"{self.base_url}/jobs/{country}/search/1", params=params)
            response.raise_for_status()
            return response.json()


def normalize_adzuna_job(item: dict, country_code: str) -> dict:
    location = item.get("location") or {}
    company = item.get("company") or {}
    category = item.get("category") or {}
    posted_at = item.get("created")
    if posted_at:
        try:
            posted_at = datetime.fromisoformat(str(posted_at).replace("Z", "+00:00"))
        except ValueError:
            posted_at = None
    return {
        "id": str(item.get("id") or ""),
        "source": "adzuna",
        "title": str(item.get("title") or "Untitled role"),
        "company": str(company.get("display_name") or ""),
        "description": str(item.get("description") or ""),
        "industry": str(category.get("label") or ""),
        "country_code": country_code.lower(),
        "region": "",
        "city": str(location.get("display_name") or ""),
        "remote_mode": "unspecified",
        "source_url": str(item.get("redirect_url") or ""),
        "posted_at": posted_at,
    }
