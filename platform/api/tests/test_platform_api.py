from __future__ import annotations

from collections.abc import Generator
from datetime import UTC, datetime

from careerproof_api.database import Base, get_db
from careerproof_api.main import app
from careerproof_api.models import MarketMetric
from careerproof_api.providers import public_provider_catalog
from careerproof_api.story_engine import build_story_pack
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.tools.resume_parser import extract_resume_text

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = sessionmaker(bind=engine, expire_on_commit=False)
Base.metadata.create_all(bind=engine)


def override_db() -> Generator[Session, None, None]:
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_db
client = TestClient(app)


def test_provider_catalog_covers_local_and_hosted_open_model_routes() -> None:
    provider_ids = {item["id"] for item in public_provider_catalog()}

    assert {"ollama", "lm-studio", "vllm", "llama-cpp", "localai", "huggingface"} <= provider_ids
    assert all("api_key" not in item for item in public_provider_catalog())


def test_story_pack_keeps_missing_results_as_questions() -> None:
    pack = build_story_pack(
        {
            "matches": [
                {
                    "keyword": "SQL",
                    "priority": "Required",
                    "status": "Strong",
                    "evidence": "Built SQL dashboards for product leaders.",
                    "confidence": 88,
                }
            ]
        }
    )

    assert pack[0]["source_evidence"] == "Built SQL dashboards for product leaders."
    assert "verified metric" in pack[0]["framework"]["result"]


def test_register_and_persist_evidence_analysis() -> None:
    registered = client.post(
        "/v1/auth/register",
        json={"email": "analyst@example.com", "display_name": "Casey Analyst", "password": "correct-horse-2026"},
    )
    assert registered.status_code == 201
    auth = registered.json()

    response = client.post(
        "/v1/analysis",
        headers={"Authorization": f"Bearer {auth['access_token']}"},
        json={
            "target_role": "Product Analyst",
            "company": "Example Company",
            "job_description": "The product analyst must use SQL and experimentation to explain customer behavior to cross-functional stakeholders.",
            "candidate_profile": "Built SQL dashboards and partnered with cross-functional product leaders to improve weekly decisions by 20%.",
            "provider": "deterministic",
            "model": "evidence-engine-v1",
            "workspace_id": auth["workspace"]["id"],
            "persist": True,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["saved"] is True
    assert payload["result"]["keyword_analysis"]["overall_score"] > 0
    assert payload["result"]["story_pack"]


def test_guest_analysis_stays_unsaved() -> None:
    response = client.post(
        "/v1/analysis",
        json={
            "job_description": "A business analyst must use SQL and build dashboards for operational decision support.",
            "candidate_profile": "Built SQL dashboards for operations and documented the resulting process changes.",
        },
    )

    assert response.status_code == 200
    assert response.json()["saved"] is False


def test_recommendations_rank_jobs_against_verified_stories() -> None:
    response = client.post(
        "/v1/jobs/recommendations",
        json={
            "candidate_profile": "Built SQL dashboards for product leaders and automated a data quality workflow that reduced weekly preparation time by 30%.",
            "stories": ["Partnered with cross-functional stakeholders to improve weekly product decisions."],
            "target_role": "Product Analyst",
            "jobs": [
                {
                    "id": "product-1",
                    "title": "Product Analyst",
                    "company": "Example Product Company",
                    "description": "Use SQL, build product dashboards, improve data quality, and communicate with cross-functional stakeholders every week.",
                },
                {
                    "id": "ml-1",
                    "title": "Machine Learning Researcher",
                    "company": "Example Research Lab",
                    "description": "Develop deep learning architectures, publish machine learning research, and deploy computer vision systems to production.",
                },
            ],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["source"] == "request"
    assert payload["recommendations"][0]["id"] == "product-1"
    assert payload["recommendations"][0]["match_score"] > payload["recommendations"][1]["match_score"]
    assert payload["method"].startswith("Deterministic")


def test_market_insights_calculates_comparable_snapshot_change() -> None:
    with TestingSession() as db:
        db.add_all([
            MarketMetric(
                snapshot_at=datetime(2026, 7, 1, tzinfo=UTC), source="test", country_code="us",
                region="North America", industry="Technology", role_family="Data & AI", openings=100,
            ),
            MarketMetric(
                snapshot_at=datetime(2026, 8, 1, tzinfo=UTC), source="test", country_code="us",
                region="North America", industry="Technology", role_family="Data & AI", openings=120,
            ),
        ])
        db.commit()

    response = client.get("/v1/market/insights?country_code=us&industry=Technology&live=false")

    assert response.status_code == 200
    segment = response.json()["segments"][0]
    assert segment["openings"] == 120
    assert segment["change_percent"] == 20.0
    assert response.json()["coverage"]["historical_change_requires"]


def test_application_modes_are_open_but_never_submit_by_default() -> None:
    registered = client.post(
        "/v1/auth/register",
        json={"email": "modes@example.com", "display_name": "Mode Tester", "password": "correct-horse-modes"},
    ).json()
    headers = {"Authorization": f"Bearer {registered['access_token']}"}
    workspace_id = registered["workspace"]["id"]

    manual = client.post("/v1/application/mode/check", headers=headers, json={"workspace_id": workspace_id, "mode": "manual"})
    hybrid = client.post("/v1/application/mode/check", headers=headers, json={"workspace_id": workspace_id, "mode": "hybrid"})

    assert manual.json()["enabled"] is True
    assert manual.json()["submission_enabled"] is False
    assert hybrid.json()["enabled"] is True
    assert hybrid.json()["submission_enabled"] is False
    updated = client.put(
        "/v1/application/preferences",
        headers=headers,
        json={"workspace_id": workspace_id, "application_mode": "hybrid"},
    )
    assert updated.status_code == 200


def test_extended_text_document_formats_extract_in_memory() -> None:
    assert extract_resume_text("profile.yaml", b"role: Analyst\nskills:\n  - SQL") == "role: Analyst\nskills:\n  - SQL"
    assert "Example role" in extract_resume_text("role.xml", b"<job><title>Example role</title></job>")


def test_open_source_edition_includes_all_application_modes() -> None:
    plans = client.get("/v1/plans").json()["plans"]
    assert len(plans) == 1
    community = plans[0]
    assert community["id"] == "community"
    assert community["application_modes"] == ["manual", "hybrid", "automatic"]
