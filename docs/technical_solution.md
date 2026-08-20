# Technical Solution: Evidence-Grounded Interview Intelligence

InterviewThread is designed to answer one difficult question reliably:

> What can this candidate truthfully prove for this specific role, and how
> should an interviewer test that evidence?

The system must never turn a plausible inference into a candidate claim. No
model can honestly guarantee 100% accuracy. InterviewThread therefore uses
measurable quality gates, source-level citations, explicit uncertainty, and a
separate verification pass instead of relying on a single prompt.

## Step 1 → Build a candidate evidence ledger

### Accepted candidate-controlled sources

- resume or CV files;
- LinkedIn profile PDF or LinkedIn account data export;
- text pasted from the candidate's own LinkedIn profile;
- personal websites and public resume pages;
- GitHub, portfolio, publication, presentation, project, or case-study pages;
- certifications, transcripts, performance notes, and work samples that the
  candidate is authorized to use.

A URL is provenance, not proof. A source can affect scoring only after the
candidate provides readable content or an approved connector retrieves content
with the candidate's authorization.

LinkedIn member data must not be scraped. LinkedIn documents an official
[profile PDF export](https://www.linkedin.com/help/linkedin/answer/a541960/save-a-profile-as-a-pdf?lang=en),
[account data download](https://www.linkedin.com/help/linkedin/answer/a1339364/downloading-your-account-data),
and OAuth-based member authorization. Direct API access requires authentication,
the appropriate permissions, and compliance with LinkedIn's storage rules.

### Normalized evidence record

Every parsed span receives immutable provenance before any model sees it:

```json
{
  "source_id": "src_01",
  "source_type": "resume | linkedin_export | portfolio | work_sample",
  "source_url": "https://example.com/profile",
  "document_hash": "sha256:...",
  "span_id": "src_01:p2:s7",
  "text": "Automated weekly validation and reduced preparation time by 30%.",
  "event_date": "2025-03",
  "entities": ["weekly validation"],
  "candidate_confirmed": true
}
```

The ingestion pipeline performs format parsing, OCR when required, language
detection, timeline normalization, entity resolution, duplicate removal, PII
controls, and prompt-injection isolation. Candidate documents are untrusted data;
they can supply evidence but cannot give the system instructions.

## Step 2 → Decode the JD and map requirements to proof

### Structured requirement extraction

The JD is converted into a typed requirement graph rather than a flat keyword
list. Each requirement records:

- normalized concept and aliases;
- required, core, or preferred priority;
- responsibility, skill, outcome, domain, seniority, or constraint type;
- explicit wording versus inferred intent;
- supporting JD span IDs;
- extraction confidence and ambiguity notes.

Production model output must follow a strict JSON Schema. OpenAI
[Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
can enforce the response shape and make refusals detectable.

### Hybrid retrieval and reranking

For every JD requirement, the system retrieves candidate evidence with:

1. lexical matching for exact tools, credentials, numbers, and titles;
2. multilingual dense embeddings for semantic similarity;
3. metadata filters for source, date, role, project, and confidence;
4. a cross-encoder or frontier-model reranker for contextual relevance;
5. an entailment and contradiction check before a match is accepted.

OpenAI [File Search](https://developers.openai.com/api/docs/guides/tools-file-search)
supports combined semantic and keyword retrieval plus metadata filtering. The
open-source deployment can provide the same interface through PostgreSQL with
pgvector, BM25/full-text search, and a self-hosted reranker.

### Transparent match record

```json
{
  "requirement_id": "req_sql_01",
  "priority": "required",
  "jd_span_ids": ["jd:p1:s4"],
  "evidence_span_ids": ["src_01:p2:s7"],
  "relationship": "supported | partial | gap | conflict",
  "lexical_score": 0.92,
  "semantic_score": 0.88,
  "entailment_score": 0.97,
  "confidence": 0.91,
  "explanation": "The candidate used SQL to automate a recurring validation workflow."
}
```

Scoring remains inspectable. Missing evidence is a gap, not permission to infer
that the candidate has the skill. Conflicting dates, job titles, ownership
claims, or metrics are surfaced for candidate review.

## Step 3 → Generate only verified stories and realistic interviews

### Claim ledger and generation gate

The generator may only assemble claims already present in the evidence ledger.
Every sentence in a proposed story must carry one or more `span_id` citations.
The verifier then checks:

- whether the cited span entails the claim;
- whether the actor, action, scope, metric, and date are preserved;
- whether the story conflicts with any other source;
- whether wording changes meaning or inflates ownership;
- whether a missing detail is clearly marked as a question for the candidate.

The release rule is simple:

```text
no citation → no claim
contradiction → block and ask the candidate
partial support → qualify the wording
unsupported requirement → show a gap
```

The verifier should use a separate model call and a strict schema. For high-risk
claims such as revenue, headcount, legal credentials, or security access, the
system can require both deterministic checks and model agreement. A model is
never allowed to verify its own free-form output without source comparison.

### Interviewer policy

The AI interviewer receives the JD requirement graph, verified evidence spans,
known gaps, interview role, time limit, language, and prior questions. It must:

- ask one natural question at a time;
- reference the candidate's latest answer;
- probe the weakest unverified part of that answer;
- vary question depth and avoid repeats;
- separate new topics from follow-up questions;
- never teach or praise during realistic mode;
- never introduce a candidate achievement that is absent from the ledger.

Questions are generated from a coverage plan so HR screening, hiring manager,
technical, peer, case, executive, and final-panel rounds test different hiring
decisions.

## Recommended model routing

Model names should be configuration, not hard-coded product logic. As of
2026-08-20, official OpenAI documentation recommends
[GPT-5.6 Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol) for
complex professional work. A production routing policy can use:

| Workload | Quality-first default | Cost-aware option | Open-source option |
|---|---|---|---|
| JD requirement graph | GPT-5.6 Sol, high reasoning | GPT-5.6 Terra | administrator-approved open-weight instruct model |
| Bulk parsing and normalization | GPT-5.6 Terra or Luna | GPT-5.6 Luna | local extraction model plus deterministic parser |
| Evidence reranking | GPT-5.6 Terra plus cross-encoder | dedicated reranker | BGE/Jina-family reranker selected by benchmark |
| Claim verification | GPT-5.6 Sol, independent pass | GPT-5.6 Terra | separate local verifier model |
| Interview follow-ups | GPT-Realtime-2.1 or GPT-5.6 Terra | lower-latency configured model | local chat model behind the same contract |
| Live transcription | `gpt-live-transcribe` | browser speech fallback | local Whisper-compatible service |
| Completed recording | `gpt-transcribe` | batch transcription | local Whisper-compatible service |

The public repository must continue to work with the deterministic Evidence
Engine and no paid key. Cloud models are optional, server-side adapters. API
keys must never be sent to the browser or committed to Git.

For multilingual speech, the transcription request should include the expected
languages and a dynamic keyword list built from the candidate's sources, JD,
company, products, tools, and interviewer role. OpenAI's
[transcription guidance](https://developers.openai.com/api/docs/guides/transcription)
recommends representative testing across languages, accents, code-switching,
noise, names, numbers, and domain terminology.

## Accuracy gates and evaluation

“1000% accurate” is not a measurable product claim. The release process should
publish a versioned evaluation card with at least these metrics:

| Metric | Initial release gate |
|---|---:|
| JD requirement extraction macro F1 | ≥ 0.90 |
| Required-vs-preferred classification accuracy | ≥ 0.95 |
| Evidence citation precision | ≥ 0.98 |
| Unsupported-claim rate | < 0.01, with a target of zero |
| Contradiction recall | ≥ 0.95 |
| Question duplication rate per session | < 0.02 |
| Human evidence-fidelity rating | ≥ 4.5 / 5 |
| Critical name, number, and tool transcription accuracy | benchmarked per supported language |

The benchmark must contain real, consented or synthetic resumes and JDs across
industries, seniority levels, languages, career gaps, non-native accents, and
adversarial cases. Every model or prompt change is tested against the same
frozen set before release. OpenAI's
[evaluation workflow](https://developers.openai.com/api/docs/guides/evaluation-getting-started)
can be used for cloud adapters; open-source adapters must implement the same
test contract.

## Privacy and retention

- Guest-mode evidence remains on the device unless the user explicitly chooses
  a server-backed model.
- Server-backed ingestion requires clear consent, encryption, tenant isolation,
  deletion controls, retention limits, and an audit trail.
- Sources are never used to train a model without separate, explicit consent.
- Private or employer-confidential documents must not be made public.
- URL ingestion must block private network addresses, unsafe redirects,
  executable content, oversized files, and unsupported schemes.
- Removing a source invalidates its derived claims, stories, embeddings, and
  interview questions.

## Implementation sequence

1. **Now — open-source evidence ledger:** multi-file input, candidate-provided
   source links and text, deterministic source citations, visible gaps, and
   local-only analysis.
2. **Next — server-side intelligence:** Next.js + FastAPI + Postgres/pgvector,
   approved OAuth connectors, structured JD extraction, hybrid retrieval,
   independent claim verification, and benchmarked model routing.
3. **Later — account product:** encrypted persistent evidence vault, source
   refresh and invalidation, realtime multilingual interview sessions, team
   review, consent and deletion controls, observability, and paid usage limits.

No later step may weaken the evidence boundary established in Step 1.
