from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class CareerProofRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    target_role: str = Field(
        min_length=2,
        max_length=160,
        description="Target job title or role family.",
    )
    company: str = Field(default="Unknown company", max_length=160)
    industry: str | None = Field(default=None, max_length=160)
    job_description: str = Field(
        min_length=40,
        max_length=60_000,
        description="Raw job description.",
    )
    candidate_profile: str = Field(
        min_length=40,
        max_length=80_000,
        description="Candidate experience summary or resume text.",
    )
    goal: str = Field(default="interview_strategy", max_length=80)
