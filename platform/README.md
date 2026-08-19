# CareerProof Platform

This directory is the production-oriented evolution path for CareerProof. The
root Streamlit application remains the simplest public reference deployment;
the platform adds a professional web client and a multi-tenant API for accounts,
permanent history, shared workspaces, usage controls, and future billing.

## Stack

- Web: Next-compatible React 19 application with an accessible guest workflow
- API: FastAPI with an extensible AI provider registry
- Database: PostgreSQL through SQLAlchemy
- Local deployment: Docker Compose

## Local start

1. Copy `.env.example` to `.env` and replace `CAREERPROOF_JWT_SECRET`.
2. Run `docker compose up --build` from this directory.
3. Open `http://localhost:3000`; API documentation is at
   `http://localhost:8000/docs`.

Guest analysis does not require an account. Accounts are used only for saved
analysis history, the permanent application tracker, team workspaces, and
conversation history.

## Model access

The API does not attempt to hard-code every model name. Model catalogs change
too quickly. Instead, it supports any chat model exposed by Ollama, LM Studio,
vLLM, llama.cpp, LocalAI, Hugging Face Inference Providers, or an
administrator-configured OpenAI-compatible endpoint. Model IDs can be discovered
from providers at runtime. User API keys are accepted only in the ephemeral
`X-Model-Api-Key` request header and are not stored.

## Production note

`CAREERPROOF_AUTO_MIGRATE=true` is intended for local alpha deployments. Before
public multi-user production, set it to `false`, introduce reviewed Alembic
migrations, configure a managed PostgreSQL backup policy, place the API behind a
rate-limiting proxy, and connect the entitlement interface to a billing provider.

