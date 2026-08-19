from __future__ import annotations

import re
from contextlib import asynccontextmanager

import httpx
from fastapi import (
    Depends,
    FastAPI,
    File,
    Header,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.tools.industry_map import infer_industry
from app.tools.job_signals import extract_job_signals
from app.tools.keyword_matcher import analyze_keywords
from app.tools.privacy import redact_with_counts
from app.tools.resume_parser import extract_resume_text

from .config import get_settings
from .database import Base, engine, get_db
from .models import (
    Analysis,
    ChatMessage,
    ChatThread,
    Feedback,
    Membership,
    TrackerItem,
    UsageEvent,
    User,
    Workspace,
)
from .providers import (
    discover_models,
    generate_text,
    provider_registry,
    public_provider_catalog,
)
from .schemas import (
    AnalysisRequest,
    AuthResponse,
    ChatRequest,
    ChatThreadCreate,
    FeedbackCreate,
    LoginRequest,
    RegisterRequest,
    TrackerCreate,
    TrackerUpdate,
    WorkspaceCreate,
    WorkspaceInvite,
)
from .security import (
    create_access_token,
    current_user,
    hash_password,
    optional_user,
    verify_password,
)
from .story_engine import (
    build_model_prompt,
    build_story_pack,
    deterministic_copilot_reply,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.auto_migrate:
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="CareerProof API",
    version="1.0.0-alpha",
    description="Evidence-first career analysis, tracking, collaboration, chat, and feedback API.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Model-Api-Key"],
)


def as_dict(item, fields: tuple[str, ...]) -> dict:
    return {field: getattr(item, field) for field in fields}


def workspace_for_user(db: Session, user_id: str, workspace_id: str, roles: tuple[str, ...] = ()) -> Workspace:
    membership = db.scalar(
        select(Membership).where(Membership.workspace_id == workspace_id, Membership.user_id == user_id)
    )
    if not membership or (roles and membership.role not in roles):
        raise HTTPException(status_code=403, detail="Workspace access denied")
    workspace = db.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace


def unique_slug(db: Session, name: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:70] or "workspace"
    slug = base
    suffix = 2
    while db.scalar(select(Workspace).where(Workspace.slug == slug)):
        slug = f"{base}-{suffix}"
        suffix += 1
    return slug


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "careerproof-api", "version": app.version}


@app.get("/v1/plans")
def plans() -> dict:
    return {
        "plans": [
            {"id": "free", "name": "Free", "monthly_analyses": 8, "members": 1, "features": ["Guest analysis", "Local models", "Personal tracker"]},
            {"id": "pro", "name": "Pro", "monthly_analyses": 100, "members": 1, "features": ["Permanent history", "Advanced story packs", "Priority model routing"]},
            {"id": "team", "name": "Team", "monthly_analyses": 500, "members": 10, "features": ["Shared workspaces", "Role-based access", "Team feedback"]},
        ],
        "billing_status": "adapter-ready",
        "note": "Checkout is intentionally not enabled until a billing provider and refund policy are configured.",
    }


@app.get("/v1/models/providers")
def providers() -> dict:
    return {
        "providers": public_provider_catalog(),
        "coverage": "Any chat model exposed through a configured OpenAI-compatible endpoint is supported.",
        "security": "Provider URLs are administrator-configured to prevent server-side request forgery.",
    }


@app.get("/v1/models/{provider_id}")
async def models_for_provider(
    provider_id: str,
    x_model_api_key: str | None = Header(default=None),
) -> dict:
    if provider_id not in provider_registry():
        raise HTTPException(status_code=404, detail="Unknown provider")
    try:
        models = await discover_models(provider_id, x_model_api_key)
    except (httpx.HTTPError, ValueError):
        models = list(provider_registry()[provider_id].default_models)
    return {"provider": provider_id, "models": models}


@app.post("/v1/auth/register", response_model=AuthResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    email = payload.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account already exists for this email")
    user = User(email=email, display_name=payload.display_name.strip(), password_hash=hash_password(payload.password))
    db.add(user)
    db.flush()
    workspace = Workspace(
        name=f"{user.display_name}'s workspace",
        slug=unique_slug(db, user.display_name),
        owner_id=user.id,
        plan=settings.default_workspace_plan,
    )
    db.add(workspace)
    db.flush()
    db.add(Membership(workspace_id=workspace.id, user_id=user.id, role="owner"))
    db.commit()
    return AuthResponse(
        access_token=create_access_token(user.id),
        user=as_dict(user, ("id", "email", "display_name")),
        workspace=as_dict(workspace, ("id", "name", "slug", "plan")),
    )


@app.post("/v1/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    membership = db.scalar(select(Membership).where(Membership.user_id == user.id).order_by(Membership.created_at))
    workspace = db.get(Workspace, membership.workspace_id) if membership else None
    if not workspace:
        raise HTTPException(status_code=409, detail="Account has no workspace")
    return AuthResponse(
        access_token=create_access_token(user.id),
        user=as_dict(user, ("id", "email", "display_name")),
        workspace=as_dict(workspace, ("id", "name", "slug", "plan")),
    )


@app.get("/v1/auth/me")
def me(user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    memberships = db.scalars(select(Membership).where(Membership.user_id == user.id)).all()
    workspaces = [db.get(Workspace, item.workspace_id) for item in memberships]
    return {
        "user": as_dict(user, ("id", "email", "display_name")),
        "workspaces": [
            {**as_dict(workspace, ("id", "name", "slug", "plan")), "role": membership.role}
            for membership, workspace in zip(memberships, workspaces, strict=True)
            if workspace
        ],
    }


@app.post("/v1/workspaces", status_code=201)
def create_workspace(
    payload: WorkspaceCreate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> dict:
    workspace = Workspace(name=payload.name.strip(), slug=unique_slug(db, payload.name), owner_id=user.id, plan="free")
    db.add(workspace)
    db.flush()
    db.add(Membership(workspace_id=workspace.id, user_id=user.id, role="owner"))
    db.commit()
    return as_dict(workspace, ("id", "name", "slug", "plan"))


@app.post("/v1/workspaces/{workspace_id}/members", status_code=201)
def add_workspace_member(
    workspace_id: str,
    payload: WorkspaceInvite,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> dict:
    workspace_for_user(db, user.id, workspace_id, ("owner", "admin"))
    invited = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not invited:
        raise HTTPException(status_code=404, detail="Invitee must create an account before being added")
    existing = db.scalar(select(Membership).where(Membership.workspace_id == workspace_id, Membership.user_id == invited.id))
    if existing:
        existing.role = payload.role
        membership = existing
    else:
        membership = Membership(workspace_id=workspace_id, user_id=invited.id, role=payload.role)
        db.add(membership)
    db.commit()
    return {"workspace_id": workspace_id, "user_id": invited.id, "email": invited.email, "role": membership.role}


@app.post("/v1/files/extract")
async def extract_file(upload: UploadFile = File(...)) -> dict:
    content = await upload.read(settings.max_upload_bytes + 1)
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail=f"Files must be {settings.max_upload_bytes // 1024 // 1024} MB or smaller")
    try:
        text = extract_resume_text(upload.filename or "upload.txt", content)
    except ValueError as exc:
        raise HTTPException(status_code=415, detail=str(exc)) from exc
    clean_text, redactions = redact_with_counts(text)
    return {"filename": upload.filename, "characters": len(clean_text), "text": clean_text, "redactions": redactions}


@app.post("/v1/analysis")
async def create_analysis(
    payload: AnalysisRequest,
    x_model_api_key: str | None = Header(default=None),
    user: User | None = Depends(optional_user),
    db: Session = Depends(get_db),
) -> dict:
    clean_jd, jd_redactions = redact_with_counts(payload.job_description)
    clean_profile, profile_redactions = redact_with_counts(payload.candidate_profile)
    industry_context = infer_industry(clean_jd, payload.industry if payload.industry != "Auto-detect" else None)
    knowledge = industry_context.get("knowledge", {})
    extra_terms = [*knowledge.get("metrics", []), *knowledge.get("hiring_signals", [])]
    keyword_analysis = analyze_keywords(clean_jd, clean_profile, extra_terms).to_dict()
    story_pack = build_story_pack(keyword_analysis)
    result = {
        "keyword_analysis": keyword_analysis,
        "job_signals": extract_job_signals(clean_jd),
        "industry_context": industry_context,
        "story_pack": story_pack,
        "redactions": {
            key: jd_redactions.get(key, 0) + profile_redactions.get(key, 0)
            for key in set(jd_redactions) | set(profile_redactions)
        },
        "ai_brief": None,
    }
    if payload.provider != "deterministic":
        try:
            result["ai_brief"] = await generate_text(
                payload.provider,
                payload.model,
                build_model_prompt(payload.target_role, payload.company, keyword_analysis, story_pack),
                x_model_api_key,
            )
        except (httpx.HTTPError, KeyError, ValueError) as exc:
            raise HTTPException(status_code=502, detail=f"Model provider error: {exc}") from exc

    saved_id = None
    workspace_id = None
    if payload.persist and user and payload.workspace_id:
        workspace_for_user(db, user.id, payload.workspace_id)
        analysis = Analysis(
            workspace_id=payload.workspace_id,
            created_by=user.id,
            target_role=payload.target_role,
            company=payload.company,
            job_description_redacted=clean_jd,
            candidate_profile_redacted=clean_profile,
            provider=payload.provider,
            model=payload.model,
            result=result,
        )
        db.add(analysis)
        db.flush()
        saved_id = analysis.id
        workspace_id = payload.workspace_id
    db.add(UsageEvent(workspace_id=workspace_id, user_id=user.id if user else None, event_type="analysis", properties={"provider": payload.provider}))
    db.commit()
    return {"id": saved_id, "saved": bool(saved_id), "result": result}


@app.get("/v1/analyses")
def list_analyses(
    workspace_id: str,
    limit: int = Query(default=30, ge=1, le=100),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> dict:
    workspace_for_user(db, user.id, workspace_id)
    items = db.scalars(select(Analysis).where(Analysis.workspace_id == workspace_id).order_by(Analysis.created_at.desc()).limit(limit)).all()
    return {"items": [as_dict(item, ("id", "target_role", "company", "provider", "model", "result", "created_at")) for item in items]}


@app.get("/v1/tracker")
def list_tracker(
    workspace_id: str,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> dict:
    workspace_for_user(db, user.id, workspace_id)
    items = db.scalars(select(TrackerItem).where(TrackerItem.workspace_id == workspace_id).order_by(TrackerItem.updated_at.desc())).all()
    fields = ("id", "company", "role", "status", "source_url", "next_action", "next_action_at", "notes", "analysis_id", "created_at", "updated_at")
    return {"items": [as_dict(item, fields) for item in items]}


@app.post("/v1/tracker", status_code=201)
def create_tracker_item(payload: TrackerCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    workspace_for_user(db, user.id, payload.workspace_id)
    item = TrackerItem(created_by=user.id, **payload.model_dump())
    db.add(item)
    db.commit()
    return as_dict(item, ("id", "workspace_id", "company", "role", "status", "next_action", "updated_at"))


@app.patch("/v1/tracker/{item_id}")
def update_tracker_item(item_id: str, payload: TrackerUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    item = db.get(TrackerItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Tracker item not found")
    workspace_for_user(db, user.id, item.workspace_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    return as_dict(item, ("id", "company", "role", "status", "next_action", "updated_at"))


@app.delete("/v1/tracker/{item_id}", status_code=204)
def delete_tracker_item(item_id: str, user: User = Depends(current_user), db: Session = Depends(get_db)) -> None:
    item = db.get(TrackerItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Tracker item not found")
    workspace_for_user(db, user.id, item.workspace_id)
    db.delete(item)
    db.commit()


@app.post("/v1/chat/threads", status_code=201)
def create_chat_thread(payload: ChatThreadCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    workspace_for_user(db, user.id, payload.workspace_id)
    thread = ChatThread(created_by=user.id, **payload.model_dump())
    db.add(thread)
    db.commit()
    return as_dict(thread, ("id", "workspace_id", "analysis_id", "title", "provider", "model", "created_at"))


@app.post("/v1/chat/threads/{thread_id}/messages")
async def send_chat_message(
    thread_id: str,
    payload: ChatRequest,
    x_model_api_key: str | None = Header(default=None),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> dict:
    thread = db.get(ChatThread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Chat thread not found")
    workspace_for_user(db, user.id, thread.workspace_id)
    analysis = db.get(Analysis, thread.analysis_id) if thread.analysis_id else None
    db.add(ChatMessage(thread_id=thread.id, role="user", content=payload.content))
    if thread.provider == "deterministic":
        reply = deterministic_copilot_reply(payload.content, analysis.result if analysis else None)
    else:
        history = [{"role": item.role, "content": item.content} for item in thread.messages[-12:]]
        evidence = analysis.result if analysis else {"instruction": "Ask the user to run an analysis first."}
        messages = [
            {"role": "system", "content": f"Use only this CareerProof evidence and never fabricate claims: {evidence}"},
            *history,
            {"role": "user", "content": payload.content},
        ]
        try:
            reply = await generate_text(thread.provider, thread.model, messages, x_model_api_key) or "No response was generated."
        except (httpx.HTTPError, KeyError, ValueError) as exc:
            raise HTTPException(status_code=502, detail=f"Model provider error: {exc}") from exc
    assistant_message = ChatMessage(thread_id=thread.id, role="assistant", content=reply)
    db.add(assistant_message)
    db.add(UsageEvent(workspace_id=thread.workspace_id, user_id=user.id, event_type="chat_message", properties={"provider": thread.provider}))
    db.commit()
    return {"id": assistant_message.id, "role": "assistant", "content": reply, "created_at": assistant_message.created_at}


@app.post("/v1/feedback", status_code=201)
def create_feedback(
    payload: FeedbackCreate,
    user: User | None = Depends(optional_user),
    db: Session = Depends(get_db),
) -> dict:
    if payload.workspace_id:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication is required for workspace feedback")
        workspace_for_user(db, user.id, payload.workspace_id)
    feedback = Feedback(user_id=user.id if user else None, **payload.model_dump())
    db.add(feedback)
    db.commit()
    return {"id": feedback.id, "status": "received", "created_at": feedback.created_at}
