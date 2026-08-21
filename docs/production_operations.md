# Production Operations

This runbook covers the Cloudflare-hosted InterviewThread production system at
`https://interviewthreadai.com`.

## Ownership map

| Layer | Production service | Source of truth |
|---|---|---|
| DNS, TLS, WAF, edge controls | Cloudflare | Cloudflare zone settings |
| Frontend and backend | Cloudflare Sites Worker | `platform/web` |
| Relational storage | Cloudflare D1 | reviewed migrations and D1 backups |
| OAuth | Google, GitHub, LinkedIn | provider console + encrypted Sites variables |
| Speech | Azure Speech | encrypted Sites variables |
| Website email | Resend | verified sending subdomain + encrypted Sites key |
| Source and CI | GitHub | protected `main` branch |

`platform/api` is not in the public production request path.

## Required production configuration

Non-secret values:

- `APP_BASE_URL=https://interviewthreadai.com`
- `NEXT_PUBLIC_SITE_URL=https://interviewthreadai.com`
- `APP_RELEASE=<reviewed Git SHA or immutable release ID>`
- `ADMIN_EMAILS=<comma-separated exact operator addresses>`
- `EMAIL_FROM=InterviewThread Website <notifications@send.interviewthreadai.com>`
- `EMAIL_FEEDBACK_TO=feedback@interviewthreadai.com`
- `EMAIL_PARTNERSHIPS_TO=partnerships@interviewthreadai.com`

Encrypted secrets:

- `AUTH_SECRET`
- OAuth client IDs and client secrets for every enabled provider
- `AZURE_SPEECH_KEY` when managed speech is enabled
- `RESEND_API_KEY` when background email is enabled

Never print or copy secret values into tickets, chat, logs or CI output.

## Release checklist

1. Review the exact Git diff and confirm it contains no secrets or unrelated
   database changes.
2. Run lint, the full web build and test suite, Python checks and dependency
   audit.
3. Push without force to a feature branch and wait for protected-branch CI.
4. Merge through the protected branch. Do not weaken branch protection.
5. Build the exact reviewed `main` commit and save an immutable Sites version.
6. Deploy that saved version without rerunning historical database migrations.
7. Verify `/en`, `/en/account`, `/api/healthz`, security headers and operator
   access. Confirm a non-operator cannot open the dashboard.
8. Watch Worker errors and health checks after release.

## Alert and incident sequence

Treat health-check failure, repeated OAuth failure, a provider error spike or a
privacy/security report as an incident.

1. Record the first failing release ID and UTC time.
2. Check the public health endpoint and privacy-safe Worker logs.
3. Determine whether the fault is edge, Worker, D1 or an outbound provider.
4. Disable only the affected optional provider or feature when possible.
5. Roll back to the last known-good immutable Sites version when core use is
   affected. Do not run a compensating schema change during rollback.
6. Verify recovery from an unauthenticated browser and a signed-in test account.
7. Document impact, root cause, corrective action and the test that prevents
   recurrence. Never paste user content into the incident record.

## Data recovery

- D1 is the only production relational source of truth.
- Before any schema change, verify a recent restorable backup or export and test
  the migration against a non-production database.
- Prefer additive, backward-compatible changes. Application rollback must not
  depend on destructive down-migrations.
- Resume files, audio and transcripts are intentionally not retained as
  observability data and therefore are not part of backup recovery.

## Privacy-safe monitoring

Allowed fields are random request ID, bounded route/outcome/provider enums,
HTTP status, duration and release ID. Do not log URLs with query strings,
headers, IP addresses, user agents, account identifiers, email addresses,
uploaded evidence, messages, audio, transcripts or raw provider errors.

The private operator dashboard may show aggregate account, event, beta and
feedback counts. It must not become a content browser.
