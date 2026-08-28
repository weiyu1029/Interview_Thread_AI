# InterviewThread

[![CI](https://github.com/weiyu1029/Interview_Thread_AI/actions/workflows/ci.yml/badge.svg)](https://github.com/weiyu1029/Interview_Thread_AI/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-273846.svg)](LICENSE)
[![Founding Beta](https://img.shields.io/badge/status-founding%20beta-6f8da6.svg)](https://interviewthreadai.com/en/beta)

![InterviewThread — Evidence you can defend](assets/interviewthread-readme-hero-v2.png)

**Ace the interview for your dream job—with evidence you can defend.**

InterviewThread is an open-source, evidence-grounded AI mock interview coach.
It turns a real resume and job post into defensible stories and role-specific
practice while keeping genuine gaps visible. Beta testers are welcome.

> **Evidence rule:** no source, no claim. Partial proof stays qualified. Missing
> proof stays visible.

**[Try InterviewThread](https://interviewthreadai.com/en)** · **[Join the founding beta](https://interviewthreadai.com/en/beta)** · **[Report a reproducible beta issue](https://github.com/weiyu1029/Interview_Thread_AI/issues/new?template=beta_feedback.yml)**

[Watch the 60-second walkthrough](https://interviewthreadai.com/interviewthread-60-second-walkthrough.mp4) · [Read the beta guide](docs/BETA_TESTING.md) · [Production architecture](docs/platform_architecture.md) · [Operations runbook](docs/production_operations.md) · [Contribute](CONTRIBUTING.md) · [Security](SECURITY.md)

> **Founding beta testers wanted.** We are inviting new graduates, career
> changers, non-native English speakers, and candidates interviewing in the
> next 30 days to test the complete resume-to-mock-interview workflow. We want
> candid reports about anything inaccurate, repetitive, confusing, inaccessible,
> or blocked—not promotional praise.

## Test InterviewThread in about 15 minutes

1. Add a resume or truthful career evidence and one real job post.
2. Review the evidence matches, genuine gaps, and suggested interview stories.
3. Complete one coaching-mode or realistic-mode mock interview.
4. Share the first thing that felt wrong or difficult through the
   [private contact form](https://interviewthreadai.com/en/contact) or the
   [privacy-safe beta issue form](https://github.com/weiyu1029/Interview_Thread_AI/issues/new?template=beta_feedback.yml).

The beta application does not ask for a resume or job description. Guest-mode
interview history is not saved. Never paste real candidate data into a public
GitHub issue; use synthetic examples when reporting a reproducible bug.

## Most career AI writes first. InterviewThread verifies first.

Fluent answers are not useful when a candidate cannot defend them. InterviewThread
starts with evidence, then builds the preparation workflow around what is true:

1. **Resume + JD** — identify the experience supplied by the candidate and the
   decisions the employer needs to make.
2. **Evidence Map** — separate strong proof, partial proof, contradictions, and
   genuine gaps with traceable source context.
3. **Story Builder** — shape only supported actions and outcomes into concise,
   defensible interview narratives.
4. **Mock Interview** — rehearse with role-specific follow-ups that probe the
   weakest evidence without coaching the answer in realistic mode. Voice mode
   reads each question aloud, waits for an explicit finished answer, then asks
   an evidence-aware follow-up or opens a new topic.

The result is a preparation system a candidate can inspect, correct, and trust—not
a polished story they cannot substantiate.

## Interview Proof Pack

Provide one real resume, one real job description, and an interview date or
current application stage. Within about ten minutes, InterviewThread produces:

1. three strongest role-match proofs linked to source evidence;
2. three real capability or evidence gaps;
3. three to five defensible interview stories;
4. ten likely role-specific follow-up questions;
5. one focused 30-minute interview preparation plan.

The primary journey is:

`Resume + JD → Evidence Map → 3 Interview Stories → Mock Interview`

Candidate evidence is not limited to one resume. The current web workspace can
attach any number of LinkedIn, portfolio, GitHub, publication, project, or
public resume links to candidate-provided text or uploaded files. A URL is
recorded as provenance and never counts as proof by itself. See the
[evidence-grounded technical solution](docs/technical_solution.md).

InterviewThread does **not** claim to predict a proprietary applicant tracking system. It provides a transparent, reproducible comparison that the candidate can inspect.

## Legacy Streamlit reference experience

The original Streamlit implementation remains available for local evaluation
and feature experiments. It supports:

- pasted candidate profiles;
- in-memory PDF, DOCX, ODT, RTF, TXT, Markdown, HTML, CSV, JSON, and XLSX parsing;
- deterministic analysis without an API key;
- optional session-only Gemini bring-your-own-key access;
- PII redaction before optional external model calls;
- a 25-industry interview knowledge graph;
- an evidence-grounded follow-up copilot;
- a human-reviewed, session-local application tracker with CSV import/export;
- English user interface, reports, and contributor documentation.

## Production web platform

`platform/web` is the formal production full-stack application. Its localized
React interface and same-origin backend routes ship as one Cloudflare Sites
Worker, and Cloudflare D1 stores account-backed records. This keeps the browser,
API and OAuth callbacks on one origin and makes every frontend/backend release
atomic and reversible.

The production platform includes:

- responsive web and mobile interfaces with 40 locale choices;
- guest mode plus Google, GitHub and LinkedIn OAuth accounts;
- server-side document parsing, evidence mapping, job adapters and mock
  interview APIs;
- a 4,362-record English open interview bank plus a 2,025-record localized
  matrix for every supported locale, with source, license and pinned revision;
- turn-based AI voice interviews with ElevenLabs conversational question
  delivery, corrected transcripts, adaptive follow-ups and safe Azure/device
  fallbacks;
- D1-backed activity, beta and feedback records;
- privacy-minimized structured logs, a D1 health endpoint, scheduled smoke
  checks and a private aggregate-only operator dashboard;
- one open-source access level with no checkout or paid entitlement.

Run the production application locally:

```bash
cd platform/web
cp .dev.vars.example .dev.vars
npm install
npm run dev
```

The optional `platform/api` FastAPI/PostgreSQL project is retained for
self-hosting experiments. It is not called by `interviewthreadai.com` and is
not a second production backend. See the [production architecture](docs/platform_architecture.md)
and [operations runbook](docs/production_operations.md).

## Open and local model ecosystem

InterviewThread does not freeze a list that will become obsolete. It discovers
models at runtime and supports any compatible chat model served by:

- Ollama;
- LM Studio;
- vLLM;
- llama.cpp;
- LocalAI;
- Hugging Face Inference Providers;
- administrator-approved OpenAI-compatible endpoints.

The existing optional Gemini route is retained. The deterministic Evidence
Engine remains the no-key default. User model keys are request-scoped and are
not persisted. See [Model Provider Strategy](docs/model_providers.md).

Run it locally:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
streamlit run streamlit_app.py
```

The deterministic Evidence Guard is the default. To enable optional Gemini enrichment, paste a Gemini API key into the session-only password field or configure one of these environment variables:

```bash
GOOGLE_API_KEY=your_key
# or
GEMINI_API_KEY=your_key
```

Never commit a real key or resume.

## Transparent scoring

InterviewThread weights detected concepts by where and how they appear in the job description:

| Priority | Typical source | Relative weight |
|---|---|---:|
| Required | requirements, minimum qualifications, “must” language | 1.35× |
| Core | responsibilities and repeated role outcomes | 1.00× |
| Preferred | preferred, bonus, plus, nice-to-have | 0.65× |

The final 0–100 evidence-fit score combines:

- 58% weighted concept coverage;
- 27% quality of the candidate evidence sentence;
- 15% exact JD wording coverage.

Action verbs, measurable results, and fuller source sentences strengthen confidence. Synonyms are grouped into one concept so coverage is not inflated by counting the same skill twice.

## Evidence boundary

Candidate-facing claims may come only from the pasted profile or uploaded resume. The system may reorder, reframe, or use an employer's terminology when the evidence supports it. It may not invent a tool, responsibility, employer, project, credential, result, number, or authorship claim.

Job descriptions and uploaded documents are treated as untrusted data. They can influence matching, but they cannot issue instructions to the agent, expose secrets, or override the evidence boundary.

The open-source default never auto-submits an application or sends a message.
Manual, Hybrid, and Automatic controls are free and open source. Hybrid is
designed to require approval for each submission, and any future automatic workflow must use approved employer
APIs with explicit consent, rate limits, audit logs, and an emergency stop; no
submission connector is enabled in this repository.

## Architecture

```text
Job description + candidate evidence
                │
                ▼
        privacy redaction
                │
                ▼
 role + 25-industry classification
                │
                ▼
 weighted keyword extraction
  required / core / preferred
                │
                ▼
 alias-aware evidence matching
 exact / safe rewrite / real gap
                │
        ┌───────┴────────┐
        ▼                ▼
 deterministic report   optional Gemini framing
        │                │
        └───────┬────────┘
                ▼
 human-reviewed strategy + JSON export
```

The deterministic matrix remains canonical when Gemini is enabled.

## Project structure

```text
Interview_Thread_AI/
├── app/
│   ├── agent.py                 # Google ADK entry point
│   ├── schemas.py               # validated public request contract
│   ├── data/industries.json     # 25 industry knowledge packs
│   └── tools/
│       ├── keyword_matcher.py   # weighted exact + alias evidence engine
│       ├── resume_parser.py     # in-memory PDF/DOCX/TXT/MD parsing
│       ├── job_signals.py       # role and responsibility signals
│       ├── industry_map.py      # industry inference
│       ├── evidence_mapper.py
│       └── privacy.py
├── tests/                       # deterministic matching and privacy tests
├── platform/
│   ├── web/                     # production Cloudflare full-stack app + D1
│   ├── api/                     # optional FastAPI self-hosting prototype
│   └── docker-compose.yml       # local prototype stack only
├── docs/
├── .github/                     # CI, issue forms, dependency updates
├── streamlit_app.py             # public web entry point
├── Dockerfile
├── CONTRIBUTING.md
├── GOVERNANCE.md
├── SECURITY.md
└── LICENSE
```

## ADK agent

The original Google ADK-compatible agent remains available for agent-platform experiments:

```bash
agents-cli install
agents-cli run '{"target_role":"Business Analyst","company":"Example","industry":"Enterprise SaaS / B2B Software","job_description":"...","candidate_profile":"..."}'
```

Public web users do not need ADK or an API key.

## Quality checks

Install development dependencies, then run:

```bash
python -m pip install -e '.[lint]'
python -m pip install pytest pytest-cov
make check
```

GitHub Actions runs Python lint, compilation, tests, API contract tests, and the
web build for every pull request.

## Deployment

### Streamlit Community Cloud

Use `streamlit_app.py` as the entry point. The application is fully useful without a server API key. See [the deployment guide](docs/streamlit_deployment.md).

### Docker

```bash
docker build -t interviewthread .
docker run --rm -p 8501:8501 interviewthread
```

### Production platform

The public product is deployed from `platform/web` to Cloudflare Sites with D1,
reviewed environment configuration, immutable release versions, protected-branch
CI and rollback. `platform/docker-compose.yml` is for optional local prototype
evaluation only. The Streamlit version remains a legacy reference implementation
and feature incubator.

## Community maintenance

- Start with an issue for scoring, data-flow, or architecture changes.
- Join the [founding beta](https://interviewthreadai.com/en/beta) to test the
  hosted product, or follow the [beta testing guide](docs/BETA_TESTING.md) to
  submit reproducible feedback.
- Use the [beta and release-gate system](docs/product_iteration.md) for staged,
  reversible product changes.
- Use synthetic resumes and job descriptions in tests and reports.
- Follow the evidence and privacy rules in [CONTRIBUTING.md](CONTRIBUTING.md).
- Review project decisions in [GOVERNANCE.md](GOVERNANCE.md).
- Track public changes in [CHANGELOG.md](CHANGELOG.md).
- Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## Origins and attribution

This repository is the canonical home for the public InterviewThread project.
The brand, domain, metadata, documentation, and product UI use InterviewThread.
Legacy environment-variable and Python-module identifiers remain temporarily
supported only to avoid breaking existing self-hosted installations.

It incorporates product lessons from:

- [`weiyu1029/careerproof-ai-portfolio`](https://github.com/weiyu1029/careerproof-ai-portfolio), whose deterministic Evidence Guard and resume-first UI demonstrated the stronger matching direction;
- [`santifer/career-ops`](https://github.com/santifer/career-ops), whose source-of-truth boundary, human-in-the-loop workflow, and “reformulate, never fabricate” principle inform the safety model.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Additional product research is documented in
[Open-Source Product Benchmarks](docs/open_source_benchmarks.md). The staged
account, collaboration, quality, and monetization plan is in the
[Product and Commercial Roadmap](docs/commercial_roadmap.md).

## License

MIT
