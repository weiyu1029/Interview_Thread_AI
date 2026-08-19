from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def new_id() -> str:
    return str(uuid.uuid4())


def now_utc() -> datetime:
    return datetime.now(UTC)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Workspace(TimestampMixin, Base):
    __tablename__ = "workspaces"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(160))
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    plan: Mapped[str] = mapped_column(String(30), default="free")
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)


class Membership(TimestampMixin, Base):
    __tablename__ = "memberships"
    __table_args__ = (UniqueConstraint("workspace_id", "user_id", name="uq_membership_workspace_user"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(20), default="member")


class Analysis(TimestampMixin, Base):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    workspace_id: Mapped[str | None] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=True, index=True)
    created_by: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    target_role: Mapped[str] = mapped_column(String(180), default="")
    company: Mapped[str] = mapped_column(String(180), default="")
    job_description_redacted: Mapped[str] = mapped_column(Text)
    candidate_profile_redacted: Mapped[str] = mapped_column(Text)
    provider: Mapped[str] = mapped_column(String(60), default="deterministic")
    model: Mapped[str] = mapped_column(String(180), default="evidence-engine-v1")
    result: Mapped[dict] = mapped_column(JSON)


class TrackerItem(TimestampMixin, Base):
    __tablename__ = "tracker_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), index=True)
    created_by: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    company: Mapped[str] = mapped_column(String(180))
    role: Mapped[str] = mapped_column(String(180))
    status: Mapped[str] = mapped_column(String(40), default="Interested")
    source_url: Mapped[str] = mapped_column(String(2048), default="")
    next_action: Mapped[str] = mapped_column(String(400), default="")
    next_action_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    analysis_id: Mapped[str | None] = mapped_column(ForeignKey("analyses.id", ondelete="SET NULL"), nullable=True)


class ChatThread(TimestampMixin, Base):
    __tablename__ = "chat_threads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), index=True)
    created_by: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    analysis_id: Mapped[str | None] = mapped_column(ForeignKey("analyses.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(180), default="Career Copilot")
    provider: Mapped[str] = mapped_column(String(60), default="deterministic")
    model: Mapped[str] = mapped_column(String(180), default="evidence-engine-v1")
    messages: Mapped[list[ChatMessage]] = relationship(back_populates="thread", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    thread_id: Mapped[str] = mapped_column(ForeignKey("chat_threads.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    thread: Mapped[ChatThread] = relationship(back_populates="messages")


class Feedback(TimestampMixin, Base):
    __tablename__ = "feedback"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    workspace_id: Mapped[str | None] = mapped_column(ForeignKey("workspaces.id", ondelete="SET NULL"), nullable=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    analysis_id: Mapped[str | None] = mapped_column(ForeignKey("analyses.id", ondelete="SET NULL"), nullable=True)
    category: Mapped[str] = mapped_column(String(40), default="general")
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    message: Mapped[str] = mapped_column(Text)
    contact_ok: Mapped[bool] = mapped_column(Boolean, default=False)


class UsageEvent(Base):
    __tablename__ = "usage_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    workspace_id: Mapped[str | None] = mapped_column(ForeignKey("workspaces.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    event_type: Mapped[str] = mapped_column(String(60), index=True)
    units: Mapped[int] = mapped_column(Integer, default=1)
    properties: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, index=True)


class Subscription(TimestampMixin, Base):
    __tablename__ = "subscriptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), unique=True)
    provider: Mapped[str] = mapped_column(String(40), default="manual")
    external_customer_id: Mapped[str] = mapped_column(String(180), default="")
    external_subscription_id: Mapped[str] = mapped_column(String(180), default="")
    status: Mapped[str] = mapped_column(String(40), default="inactive")
    plan: Mapped[str] = mapped_column(String(40), default="free")
    period_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class JobPosting(TimestampMixin, Base):
    __tablename__ = "job_postings"
    __table_args__ = (UniqueConstraint("source", "external_id", name="uq_job_source_external_id"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    source: Mapped[str] = mapped_column(String(60), index=True)
    external_id: Mapped[str] = mapped_column(String(180))
    title: Mapped[str] = mapped_column(String(240), index=True)
    company: Mapped[str] = mapped_column(String(240), default="")
    description: Mapped[str] = mapped_column(Text)
    industry: Mapped[str] = mapped_column(String(120), default="", index=True)
    country_code: Mapped[str] = mapped_column(String(2), default="", index=True)
    region: Mapped[str] = mapped_column(String(120), default="", index=True)
    city: Mapped[str] = mapped_column(String(160), default="")
    remote_mode: Mapped[str] = mapped_column(String(30), default="unspecified", index=True)
    employment_type: Mapped[str] = mapped_column(String(60), default="")
    source_url: Mapped[str] = mapped_column(String(2048), default="")
    posted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    raw: Mapped[dict] = mapped_column(JSON, default=dict)


class MarketMetric(Base):
    __tablename__ = "market_metrics"
    __table_args__ = (
        UniqueConstraint(
            "snapshot_at", "source", "country_code", "region", "industry", "role_family", "remote_mode",
            name="uq_market_metric_scope",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    snapshot_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, index=True)
    source: Mapped[str] = mapped_column(String(60), index=True)
    country_code: Mapped[str] = mapped_column(String(2), default="", index=True)
    region: Mapped[str] = mapped_column(String(120), default="", index=True)
    industry: Mapped[str] = mapped_column(String(120), default="", index=True)
    role_family: Mapped[str] = mapped_column(String(120), default="", index=True)
    remote_mode: Mapped[str] = mapped_column(String(30), default="all", index=True)
    openings: Mapped[int] = mapped_column(Integer)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)


class ApplicationPreference(TimestampMixin, Base):
    __tablename__ = "application_preferences"
    __table_args__ = (UniqueConstraint("workspace_id", "user_id", name="uq_application_preference_user"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    regions: Mapped[list] = mapped_column(JSON, default=list)
    countries: Mapped[list] = mapped_column(JSON, default=list)
    radius_km: Mapped[int | None] = mapped_column(Integer, nullable=True)
    remote_modes: Mapped[list] = mapped_column(JSON, default=list)
    industries: Mapped[list] = mapped_column(JSON, default=list)
    interface_locale: Mapped[str] = mapped_column(String(20), default="en")
    application_mode: Mapped[str] = mapped_column(String(20), default="manual")


class ApplicationIntent(TimestampMixin, Base):
    __tablename__ = "application_intents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    job_posting_id: Mapped[str | None] = mapped_column(ForeignKey("job_postings.id", ondelete="SET NULL"), nullable=True)
    mode: Mapped[str] = mapped_column(String(20))
    state: Mapped[str] = mapped_column(String(40), default="draft", index=True)
    payload_redacted: Mapped[dict] = mapped_column(JSON, default=dict)
    audit_log: Mapped[list] = mapped_column(JSON, default=list)
