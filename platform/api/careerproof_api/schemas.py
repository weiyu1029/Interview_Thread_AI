from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=10, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
    workspace: dict


class AnalysisRequest(BaseModel):
    target_role: str = Field(default="", max_length=180)
    company: str = Field(default="", max_length=180)
    industry: str = Field(default="Auto-detect", max_length=100)
    job_description: str = Field(min_length=40, max_length=100_000)
    candidate_profile: str = Field(min_length=40, max_length=100_000)
    provider: str = Field(default="deterministic", max_length=60)
    model: str = Field(default="evidence-engine-v1", max_length=180)
    workspace_id: str | None = None
    persist: bool = True


class TrackerCreate(BaseModel):
    workspace_id: str
    company: str = Field(min_length=1, max_length=180)
    role: str = Field(min_length=1, max_length=180)
    status: Literal["Interested", "Preparing", "Applied", "Interviewing", "Offer", "Closed"] = "Interested"
    source_url: str = Field(default="", max_length=2048)
    next_action: str = Field(default="", max_length=400)
    next_action_at: datetime | None = None
    notes: str = Field(default="", max_length=10_000)
    analysis_id: str | None = None


class TrackerUpdate(BaseModel):
    company: str | None = Field(default=None, max_length=180)
    role: str | None = Field(default=None, max_length=180)
    status: Literal["Interested", "Preparing", "Applied", "Interviewing", "Offer", "Closed"] | None = None
    source_url: str | None = Field(default=None, max_length=2048)
    next_action: str | None = Field(default=None, max_length=400)
    next_action_at: datetime | None = None
    notes: str | None = Field(default=None, max_length=10_000)


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)


class WorkspaceInvite(BaseModel):
    email: EmailStr
    role: Literal["admin", "member", "viewer"] = "member"


class ChatThreadCreate(BaseModel):
    workspace_id: str
    analysis_id: str | None = None
    title: str = Field(default="Career Copilot", max_length=180)
    provider: str = Field(default="deterministic", max_length=60)
    model: str = Field(default="evidence-engine-v1", max_length=180)


class ChatRequest(BaseModel):
    content: str = Field(min_length=1, max_length=12_000)


class FeedbackCreate(BaseModel):
    workspace_id: str | None = None
    analysis_id: str | None = None
    category: Literal["accuracy", "usability", "model", "feature", "general"] = "general"
    rating: int | None = Field(default=None, ge=1, le=5)
    message: str = Field(min_length=2, max_length=5_000)
    contact_ok: bool = False
