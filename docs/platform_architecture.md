# Platform Architecture

CareerStoryMap uses a progressive architecture: anyone can start without an
account, while people who need permanent history or collaboration can move into
the free account-backed platform without changing the
evidence model.

## System boundary

```text
Next-compatible web client
  ├─ guest evidence match and device-local tracker
  └─ authenticated API client
               │
               ▼
FastAPI application
  ├─ identity and workspace authorization
  ├─ document extraction and PII redaction
  ├─ canonical keyword and evidence engine
  ├─ model-provider router
  ├─ story and chat orchestration
  ├─ global job-provider adapters and evidence ranking
  ├─ market snapshot aggregation and provenance
  ├─ application-mode safety policy
  ├─ feedback and usage events
  └─ open-source feature configuration
               │
               ▼
PostgreSQL
  ├─ users, workspaces, and memberships
  ├─ analyses and evidence-linked stories
  ├─ tracker items and conversations
  ├─ jobs, market metrics, and application preferences
  ├─ feedback
  └─ usage events
```

The deterministic evidence result is canonical. A language model can improve
organization and phrasing, but cannot create a supported claim or silently
change the underlying score.

Live job data is adapter-based and administrator-configured. The current
implementation includes a fixed-host Adzuna adapter and storage contracts for
imported job postings and market snapshots. Provider coverage is displayed as
provider coverage, not as a census of the global labor market.

## Identity and tenancy

- Guest use is available for the first analysis and device-local tracking.
- Registration creates a personal workspace and an owner membership.
- Every persisted record belongs to a workspace.
- Owner, admin, member, and viewer roles provide the basis for team access.
- API authorization checks workspace membership instead of trusting IDs from
  the browser.

The current alpha accepts email and password credentials. Production should
add verified email, password reset, passkeys or a well-maintained identity
provider, session revocation, audit logging, and abuse controls before public
registration is opened.

## Data lifecycle

Uploaded files are parsed in memory. The API stores redacted text and derived
analysis only when an authenticated user asks to persist the result. Raw file
storage is deliberately absent from the alpha. If original-file storage is
introduced, it should use encrypted object storage, short-lived upload URLs,
malware scanning, explicit retention controls, and per-workspace deletion.

Model keys arrive through `X-Model-Api-Key` and are not written to the database.
Long-lived bring-your-own-key storage should not be added without envelope
encryption, key rotation, access auditing, and a clear deletion flow.

## Scale path

1. Keep synchronous extraction and analysis while traffic is low.
2. Add a queue for OCR, large documents, and batch analyses.
3. Add Redis only when distributed rate limits, job locks, or short-lived caches
   are actually required.
4. Add managed object storage only for features that require original files.
5. Split services by operating need, not by feature count.

## Open-source access boundary

The public product exposes one free access level. Workspace roles protect data
and collaboration boundaries, not commercial entitlements. The evidence engine,
self-hosting path, data export, application modes, and safety rules remain open
source and are never restricted by account status.
