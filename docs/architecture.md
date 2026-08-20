# Architecture

## Design goal

InterviewThread separates evidence decisions from language generation. The deterministic engine decides whether candidate proof exists; optional AI can improve framing but cannot silently upgrade a gap.

## Request flow

```text
Web form or ADK JSON request
             │
             ▼
  size and schema validation
             │
             ▼
       privacy redaction
             │
      ┌──────┴────────┐
      ▼               ▼
 role classification  industry inference
      │               │
      └──────┬────────┘
             ▼
 weighted keyword requirements
 Required / Core / Preferred
             │
             ▼
 candidate evidence sentence ranking
 exact wording / supported alias / gap
             │
      ┌──────┴─────────────┐
      ▼                    ▼
 deterministic report     optional Gemini enrichment
      │                    │
      └──────────┬─────────┘
                 ▼
      human review + exports
```

## Components

| Component | Responsibility |
|---|---|
| `streamlit_app.py` | Public English web workflow, consent, display, and export |
| `app/agent.py` | Google ADK agent entry point |
| `app/schemas.py` | Public ADK request limits and validation |
| `app/tools/keyword_matcher.py` | Deterministic weighted extraction, alias grouping, evidence ranking, and scoring |
| `app/tools/privacy.py` | Email, phone, and LinkedIn redaction with counts |
| `app/tools/resume_parser.py` | In-memory PDF, DOCX, ODT, RTF, text, web, structured-data, and spreadsheet extraction |
| `app/tools/tracker.py` | Canonical tracker columns, statuses, normalization, and company+role deduplication |
| `app/tools/job_signals.py` | Boundary-aware role, tool, and responsibility signals |
| `app/tools/industry_map.py` | 25-industry inference and knowledge lookup |
| `app/data/industries.json` | Version-controlled industry business models, metrics, cases, and hiring signals |
| `platform/web` | Professional guest-first React experience |
| `platform/api/careerproof_api` | FastAPI identity, persistence, provider, tracker, chat, and feedback service |
| `platform/docker-compose.yml` | Local web, API, and PostgreSQL stack |

## Matching model

Concept aliases are grouped into a canonical keyword. For example, `structured query language` and `SQL` represent one concept. This prevents double counting and allows two separate user-facing signals:

- **semantic coverage** — the candidate has supported equivalent evidence;
- **exact wording coverage** — the source uses the same phrase as the JD.

Each evidence sentence receives confidence from:

- alias or exact-phrase presence;
- action verbs;
- measurable outcomes;
- sufficient context.

The source sentence is preserved in the result. A match with no source sentence is invalid.

## Source-of-truth boundary

Candidate claims can come only from candidate-provided text in the active request. The job description supplies employer requirements, not candidate facts. Industry packs supply context, not candidate facts. Generated text cannot introduce candidate experience.

Job descriptions and uploaded documents are untrusted input. Their text may affect classification and matching but cannot change application rules, request secrets, or issue tool instructions.

## Privacy boundary

- Resume files are parsed in memory and limited to 12 MB.
- Email, North American phone, and LinkedIn patterns are redacted before optional external model calls.
- The deterministic engine does not require an external model.
- A browser session may hold a user-provided key in memory; it is not written to disk or exported.
- Deployers are responsible for TLS, logs, analytics, retention, and provider terms.

## Extension points

- Add taxonomy aliases with boundary tests.
- Add industry packs as reviewed JSON changes.
- Add model providers behind the provider registry; never mix provider output
  into the canonical match status.
- Add persistence through workspace-scoped API resources with explicit
  retention controls.
- Keep the matcher independent of both Streamlit and the API transport.
