from __future__ import annotations

from collections.abc import Generator

from careerproof_api.database import Base, get_db
from careerproof_api.main import app
from careerproof_api.providers import public_provider_catalog
from careerproof_api.story_engine import build_story_pack
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

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

