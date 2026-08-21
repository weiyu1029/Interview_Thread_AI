# InterviewThread Platform

This directory contains the production-oriented InterviewThread platform. The
Next.js workspace powers the public product; the root Streamlit application is
retained as a legacy local reference. The platform adds accounts, permanent
history, shared workspaces, and usage controls. Every current feature is open
source.

## Stack

- Web: Next-compatible React 19 application with an accessible guest workflow
- API: FastAPI with an extensible AI provider registry
- Database: PostgreSQL through SQLAlchemy
- Local deployment: Docker Compose

## Local start

1. Copy `.env.example` to `.env` and replace the legacy compatibility variable
   `CAREERPROOF_JWT_SECRET`.
2. Run `docker compose up --build` from this directory.
3. Open `http://localhost:3000`; API documentation is at
   `http://localhost:8000/docs`.

Guest analysis does not require an account. Accounts are used only for saved
analysis history, the permanent application tracker, shared workspaces, and
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
rate-limiting proxy, and keep safety checks independent from account status.
