# Public Deployment Guide

## Recommended first release: Streamlit Community Cloud

Use the existing Streamlit application for the open-source MVP. It keeps deployment simple, supports public testing, and makes the deterministic Evidence Guard available without charging the project owner for model calls.

### Entry point

```text
streamlit_app.py
```

### Deploy

1. Push the repository to GitHub.
2. Open [Streamlit Community Cloud](https://share.streamlit.io/).
3. Create an app from `weiyu1029/careerproof-agent`.
4. Select the production branch.
5. Set the main file path to `streamlit_app.py`.
6. Deploy without a model key for deterministic public access.

The app accepts a session-only Gemini key from a user who explicitly enables AI enrichment. A server-side key is optional:

```toml
GOOGLE_API_KEY = "your_key_here"
```

Do not configure a shared paid key on a public deployment until rate limits, usage budgets, abuse monitoring, and a privacy notice are in place.

## Local verification

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
streamlit run streamlit_app.py
```

Verify these paths before release:

1. sample analysis without an API key;
2. exact and alias keyword matches;
3. a genuine missing-skill gap;
4. PDF and DOCX resume upload;
5. Markdown and JSON downloads;
6. tracker save, update, CSV export, and CSV re-import;
7. optional Gemini enrichment with a test key;
8. PII redaction counts;
9. mobile-width readability.

## Docker deployment

```bash
docker build -t careerproof-agent .
docker run --rm -p 8501:8501 careerproof-agent
```

Pass a server key only when the deployment has appropriate controls:

```bash
docker run --rm -p 8501:8501 -e GOOGLE_API_KEY careerproof-agent
```

## Privacy and operations checklist

- Do not log resumes, job descriptions, API keys, or generated reports.
- Keep uploads in memory and enforce the 12 MB file limit.
- Do not persist session state in analytics tools.
- Use HTTPS at the hosting layer.
- Pin a privacy notice near the optional external-model control.
- Apply rate limiting before enabling a shared model key.
- Set provider usage budgets and alerts.
- Keep dependency updates enabled.
- Provide a private security-reporting channel.

## When to move beyond Streamlit

Keep Streamlit for the reference implementation and early community iteration. Move to a full application stack when the product needs accounts, durable trackers, team workspaces, billing, asynchronous jobs, or high traffic.

Recommended production shape:

```text
Next.js or similar web frontend
            │
            ▼
FastAPI service with request validation and rate limiting
            │
      ┌─────┼──────────┐
      ▼     ▼          ▼
Postgres  short-lived  background queue
tracker   object store resume parsing / model jobs
            │
            ▼
provider adapters (Gemini / OpenAI-compatible / local)
```

Requirements for that phase:

- explicit account and retention controls;
- delete/export-my-data workflows;
- encrypted storage and secret management;
- audit logs without candidate content;
- tenant isolation;
- model-provider consent and cost controls;
- migration compatibility with the deterministic engine and JSON export.

The deterministic matching engine should remain a standalone Python module so the same tested behavior can serve Streamlit, an API, a CLI, or another frontend.
