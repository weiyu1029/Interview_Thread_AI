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
| Speech | ElevenLabs v3, with Azure Speech and device fallback | provider console + Sites variables |
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
- `ELEVENLABS_VOICE_ID=<reviewed default multilingual voice ID>`
- `ELEVENLABS_VOICE_IDS_JSON=<optional JSON map of InterviewThread locale to reviewed voice ID>`
- `ELEVENLABS_DIALOGUE_ENABLED=true` to enable signed-in Voice-mode question delivery
- `TTS_DAILY_CHARACTER_LIMIT=<global UTC-day character budget; default 50000>`
- `AZURE_SPEECH_REGION=<Azure Speech resource region>`
- `AZURE_SPEECH_ENDPOINT=https://<resource>.cognitiveservices.azure.com`

Encrypted secrets:

- `AUTH_SECRET`
- OAuth client IDs and client secrets for every enabled provider
- `ELEVENLABS_API_KEY` when ElevenLabs read-aloud is enabled
- `AZURE_SPEECH_KEY` when managed speech is enabled
- `RESEND_API_KEY` when background email is enabled

Never print or copy secret values into tickets, chat, logs or CI output.

## Natural read-aloud production configuration

Normal question read-aloud uses this deliberately fixed order:

1. ElevenLabs `eleven_v3` with the locale-specific voice ID when configured.
2. Azure `en-US-Ava:DragonHDOmniLatestNeural` with the requested language.
3. The reviewed Azure standard neural voice for that locale.
4. Browser or device speech, initiated by the client only after the cloud API
   cannot return audio.

Signed-in **Voice interview** mode first sends the current question to
`/api/interview-dialogue`, which uses ElevenLabs
`eleven_v3_conversational` when `ELEVENLABS_DIALOGUE_ENABLED=true`. That route
is for natural question delivery only; it does not receive the candidate's
answer and does not decide the follow-up. Any failure falls back to the normal
read-aloud chain above. Transcript correction remains a separate, consented
request.

`ELEVENLABS_VOICE_ID` is the required English baseline voice. A single voice
does not guarantee native pronunciation in every language, so production must
provide reviewed native voices in `ELEVENLABS_VOICE_IDS_JSON`, for example
`{"en":"<voice-id>","zh-TW":"<voice-id>","ja":"<voice-id>"}`. Only use a
voice after a native or near-native reviewer has approved short, long and
technical InterviewThread prompts. Malformed JSON and unrecognized locale
entries for non-English locales safely fall back to Azure rather than reusing
an English-accented voice.

Create the ElevenLabs key at
[API Keys](https://elevenlabs.io/app/developers/api-keys). Restrict it to
text-to-speech, set the smallest practical provider credit limit, and keep it
in the encrypted Sites secret `ELEVENLABS_API_KEY`. Choose and audition voices
in the [Voice Library](https://elevenlabs.io/app/voice-library). Do not expose
the key in a `NEXT_PUBLIC_*` variable, a browser request, a source file or a
deployment transcript.

The application enforces a second cost boundary in D1. It counts normalized
characters in `speech_character_usage_windows` before any provider call and
returns HTTP 429 after `TTS_DAILY_CHARACTER_LIMIT` is reached. The value must
remain lower than the provider account's affordable daily allowance. Its
accepted range is 1,000–5,000,000 characters; an absent or invalid value uses
50,000. Keep the provider-side credit limit enabled because the application
limit is defense in depth, not a billing guarantee. The existing ten-minute
request limits also remain in force: 30 per guest, 100 per signed-in user and
300 globally.

Azure is an independent fallback and also powers transcript correction. Keep
`AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` and `AZURE_SPEECH_ENDPOINT`
configured even when ElevenLabs is healthy. If neither cloud provider is
configured, the endpoint returns a private, non-cacheable 503 and tells the
client to use device speech.

### Provider privacy and retention

Read-aloud sends the normalized current question and selected language to
ElevenLabs. If it fails, the same limited question may be sent to Microsoft.
It does not send the complete resume, complete job description, answer audio
or transcript as part of the read-aloud request. Tailored question text can,
however, contain short role, evidence or gap terms derived from user-supplied
materials and must be treated as user data.

The Worker does not store generated audio and returns `private, no-store`, but
that response header does not control provider-side retention. ElevenLabs and
Microsoft process and may retain requests according to the account settings,
plan and their current privacy terms. Do not claim zero retention unless it is
enabled for the actual production account and verified. Any provider or
retention change requires a privacy-page review before deployment.

### Sites configuration sequence

1. Record the current deployed Sites version and environment revision so both
   code and configuration can be restored independently.
2. Save the non-secret voice IDs, optional locale map, Azure region/endpoint
   and daily character cap as Sites configuration values.
3. Save `ELEVENLABS_API_KEY` and `AZURE_SPEECH_KEY` as encrypted Sites
   secrets. Enter secrets directly in the trusted configuration UI or secret
   command; never paste them into chat or a shell history.
4. Set `APP_RELEASE` to the exact reviewed Git SHA.
5. Build that SHA, save an immutable Sites version and deploy it. Do not run a
   database migration for this release; the quota tables are created
   idempotently by the application.
6. Run the canary below before announcing availability.

### Speech canary and acceptance gate

Run the canary from the public origin. Use neutral test text rather than a real
resume or interview answer:

```sh
curl -sS -D /tmp/interviewthread-speech.headers \
  -o /tmp/interviewthread-speech.mp3 \
  -X POST https://interviewthreadai.com/api/speech \
  -H 'Origin: https://interviewthreadai.com' \
  -H 'Content-Type: application/json' \
  --data '{"text":"Tell me about a project where you made a difficult technical decision.","locale":"en"}'
```

The response must be HTTP 200, playable audio, `private, no-store`, and include
these safe diagnostic headers:

- `X-InterviewThread-Speech-Provider: elevenlabs`
- `X-InterviewThread-Speech-Model: eleven_v3`
- `X-InterviewThread-Speech-Fallback: none`
- `X-Request-ID: <random UUID>`

Repeat with English, Traditional Chinese, Japanese and one right-to-left
language, then with a short prompt, a long prompt and a prompt containing role
and technical terminology. A native or near-native reviewer must approve
pronunciation, pacing, sentence stress and lack of truncation. Also verify the
manual read button, automatic question read-aloud, replay/cancel behavior and
device fallback on both mobile and desktop. Provider-failure tests belong in a
non-production environment; do not intentionally invalidate a production key.

For the first 15 minutes after deployment, watch the structured `api_speech`
events by release. The accepted log fields are provider, outcome, status,
duration, request ID and release only. A normal primary response records
`provider=elevenlabs`, `outcome=ok`, `status=200`; Azure responses identify
`provider=azure_speech`. Do not log prompt text, locale-derived career content,
audio, headers, account identifiers or raw provider errors.

### Speech rollback and provider isolation

- If ElevenLabs is degraded but Azure succeeds, remove or disable only the
  ElevenLabs secret through a reviewed Sites environment revision. Re-run the
  canary and confirm `azure_speech` with `azure-dragon-hd-omni`; the feature can
  remain available while the primary provider is investigated.
- If the Azure HD attempt fails, the same request automatically tries the
  locale's Azure standard neural voice. If all cloud attempts fail, the client
  uses device speech and the API reports a bounded error/fallback header.
- If the release causes errors, privacy regression, unbounded spend, broken
  playback or incorrect language selection, deploy the previously recorded
  immutable Sites version and restore its matching environment revision.
  Rolling back code alone does not roll back secrets or configuration.
- After rollback, repeat the public-origin canary, verify the account page and
  check that the D1 health endpoint remains healthy. Preserve only safe request
  IDs and aggregate metrics for the incident review.

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
