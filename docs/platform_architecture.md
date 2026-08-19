# Platform Architecture

CareerProof uses a progressive architecture: anyone can start without an
account, while people who need permanent history, collaboration, or paid
capacity can move into the account-backed platform without changing the
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
  ├─ feedback and usage events
  └─ plan entitlements
               │
               ▼
PostgreSQL
  ├─ users, workspaces, and memberships
  ├─ analyses and evidence-linked stories
  ├─ tracker items and conversations
  ├─ feedback
  └─ subscriptions and usage events
```

The deterministic evidence result is canonical. A language model can improve
organization and phrasing, but cannot create a supported claim or silently
change the underlying score.

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

## Paid-plan boundary

The database and API already separate plans, subscriptions, usage events, and
workspace roles. Checkout is not enabled. A billing launch additionally needs:

- a billing provider adapter and signed webhook verification;
- idempotent entitlement updates;
- usage reconciliation and visible limits;
- taxes, invoices, cancellation, refund, and failed-payment handling;
- privacy terms and a data-processing inventory;
- support and incident-response processes.

The free evidence engine, self-hosting path, data export, and core safety rules
should remain available regardless of commercial plans.

