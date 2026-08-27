# Production Platform Architecture

InterviewThread is a real full-stack application deployed at
`interviewthreadai.com`. The production source of truth is `platform/web`.
Its React interface and same-origin API routes run together as a Cloudflare
Sites Worker, with Cloudflare D1 as the managed relational database.

The separate `platform/api` FastAPI/PostgreSQL project remains an optional
self-hosting prototype. The public website does not call it, and it must not be
treated as a second production backend.

## System boundary

```text
Browser
  │ HTTPS, Cloudflare TLS, WAF and edge controls
  ▼
Cloudflare Sites Worker (`platform/web`)
  ├─ localized React / server-rendered pages
  ├─ OAuth callbacks and encrypted session cookies
  ├─ same-origin API routes and request validation
  ├─ in-memory document parsing and evidence analysis
  ├─ aggregate-only operational events
  └─ fixed-host outbound provider adapters
          │                    │
          ▼                    └─ ElevenLabs / Azure Speech / Resend / approved ATS hosts
Cloudflare D1
  ├─ accounts and hashed sessions
  ├─ user-requested activity history
  ├─ beta status and product feedback
  └─ aggregate event counts
```

This arrangement keeps browser, API and identity on one origin, removes a
public database endpoint, and lets one immutable release contain both frontend
and backend code. Cloudflare version history is the rollback boundary.

## Identity and access

- Guest mode is supported, but guest interview history is not saved.
- Google, GitHub and LinkedIn use OAuth; provider secrets stay in encrypted
  production environment variables.
- Session tokens are random, stored only as hashes in D1 and sent in secure,
  HTTP-only cookies.
- Paid speech endpoints require a signed-in account.
- The operator dashboard requires both a valid session and an exact email match
  in `ADMIN_EMAILS`; non-operators receive a 404.

## Data and privacy boundary

Uploaded documents are parsed in memory. Raw resume files, job descriptions,
interview audio and transcripts are not copied into observability logs.
Product tracking is deliberately limited to bounded event names, counts,
status codes, latency, provider category, release ID and random request ID.

The public health endpoint runs `SELECT 1` against D1 and returns only
`{"status":"ok"}` or `{"status":"unavailable"}`. It never reveals schema,
provider errors, account data or infrastructure credentials.

Original-file object storage is disabled. If it is ever introduced, require a
separate threat model, malware scanning, short-lived upload URLs, retention and
deletion controls, and encryption-at-rest review before production use.

## Abuse and provider boundary

- State-changing JSON routes require an exact same-origin request, the correct
  media type and both declared and actual request-size limits.
- Speech-to-text validates authentication, locale, audio type and size. A local
  user window is a second layer; global limits belong at the Cloudflare edge.
- Text-to-speech accepts bounded normalized question text, enforces per-user,
  global-request and global daily-character budgets, and never exposes a
  provider key to the browser.
- Contact delivery uses a honeypot, bounded fields, a fixed recipient map and a
  server-side Resend key. User input cannot choose arbitrary recipients.
- Job adapters may call only documented, fixed provider hosts.

## Read-aloud provider chain

```text
Interview question + selected locale
                │ same-origin POST /api/speech
                ▼
Cloudflare Sites Worker
  ├─ validate origin, JSON, locale and 1,600-character maximum
  ├─ enforce guest/user/global request windows
  ├─ atomically consume the D1 UTC-day character budget
  └─ call providers within one bounded deadline
        │
        ├─ 1. ElevenLabs eleven_v3
        │      └─ reviewed native locale voice; English uses the baseline ID
        ├─ 2. Azure Dragon HD Omni multilingual voice
        └─ 3. Azure locale-specific standard neural voice
                │
                ▼
private, no-store MP3 + bounded diagnostic headers
                │ all cloud attempts fail, time out or hit the app budget
                ▼
browser/device speech fallback
```

ElevenLabs is the natural-voice primary. Azure Dragon HD Omni provides a
consistent multilingual interviewer persona, and locale-specific Azure neural
voices are the last cloud fallback. Device speech is a client capability, not
a fourth server provider. A single ElevenLabs voice can have a non-native
accent in some languages, so non-English locales require a reviewed locale-to-
voice map and otherwise start at Azure instead of inheriting the English
baseline. Coverage means the code can request all 40 product locales; it does
not replace native-listener acceptance testing.

The provider boundary sends only the normalized current question and language
needed to generate audio. Tailored questions may contain short terms derived
from a user's evidence, so they remain user data. The full resume, full job
description, answer audio and transcript are not part of the read-aloud
request. Generated bytes are not persisted by InterviewThread. Provider-side
retention remains governed by the production ElevenLabs or Microsoft account
and must be represented accurately in the public privacy notice.

The D1 table `speech_character_usage_windows` is aggregate operational state:
one UTC-day key, character count and update time. It contains no prompt text or
identity and is pruned automatically. This application-level daily limit must
be paired with a provider-side restricted key and credit cap. Per-request
success responses expose only `X-InterviewThread-Speech-Provider`,
`X-InterviewThread-Speech-Model`, `X-InterviewThread-Speech-Fallback` and a
random request ID. Structured logs use the same bounded provider/outcome/status
categories plus duration and release ID.

## Monitoring and release

- `/api/healthz` verifies Worker-to-D1 health and disables caching.
- A scheduled GitHub Actions smoke check requests the English landing page and
  health endpoint every 15 minutes without credentials.
- Worker logs are structured and privacy-minimized; the private operator page
  exposes aggregate counts only.
- Production variables are managed through Sites. Secrets never enter source,
  logs, build artifacts or the browser bundle.
- Releases are built from the reviewed Git commit, saved as an immutable Sites
  version, deployed, smoke-tested and rolled back to the previous version if a
  release gate fails.
- Speech release state has two rollback boundaries: the immutable Sites code
  version and the Sites environment revision containing provider selection,
  voice IDs, budgets and secrets. Operators record and restore both.

See [Production Operations](production_operations.md) for the release,
incident and recovery checklist.
