# InterviewThread Web

This is the professional guest-first interface for InterviewThread. It provides a
working deterministic evidence match, device-local application tracker,
evidence-aware copilot, public feedback form, Story Signal Radar, and clear
model-provider selection.

## Story Signal Radar

The Radar separates defensible story fit from a generic keyword score. Its
transparent score weights evidence coverage (50%), required-qualification
coverage (30%), and quantified outcome strength (20%). A role can trigger an
alert only when it also has at least two proof-backed signals and no unsupported
must-have qualification. Manual scans, in-app alerts, browser notifications,
and device-local auto-tracking are part of the public experience. The tracker
retains the story that caused the alert, so tailoring starts from source
evidence rather than a generated claim.

## Approved live job sources

The Recommendations workspace can read an employer's currently published jobs
through fixed-host, read-only integrations for Greenhouse Job Board, Lever
Postings (global and EU), and Ashby Job Postings. Users can paste an official
employer board URL or its board identifier. The gateway does not accept custom
hosts, scrape career pages, expose internal roles, or submit applications.

Each response includes provider identity, coverage, retrieval time, and the
official posting URL. Live employer-board counts are labeled as a single-board
snapshot and are never presented as a total labor-market estimate. Adzuna
remains available through the licensed FastAPI adapter when deployment
credentials are configured.

```bash
npm install
npm run dev
```

Run `npm run lint` and `npm run test` before contributing. The production Sites
build is Cloudflare Worker-compatible.

## Public accounts

`/[locale]/account` provides free account sign-in with Google, GitHub, and
LinkedIn. Each provider uses Authorization Code flow with PKCE, signed state,
an HttpOnly session cookie, and a D1-backed session whose raw token is never
stored. Existing Sites workspace identity headers remain supported for hosted
workspace sessions, but the public account interface is provider-neutral and
does not send local users to a Sites-owned login route.

Sign-in requests identity-only scopes. Career data is never imported merely
because a user signed in; LinkedIn, GitHub, portfolio, and resume sources remain
separate, explicit evidence choices. Provider access tokens are discarded
after identity lookup. See `../../docs/social_authentication.md` for callback
URLs, required secrets, exact scopes, and local setup.

All public features are free and open source. There are no paid tiers, checkout
flows, or payment details, and no immigration documents are requested.
Account-backed tracker persistence can be connected to the FastAPI/Postgres
service in `../api` after authorization, privacy, retention, and commercial
requirements are approved. Set `NEXT_PUBLIC_CAREERPROOF_API_URL` when integrating
those authenticated routes.

## Neural question read-aloud

Interview questions use the multilingual Azure Dragon HD Omni model when both
`AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` are configured. Keep the key in
the server environment; it must never use a `NEXT_PUBLIC_` name or be included
in client code. The speech route accepts only the current question text and one
of the 40 supported locale codes, returns private no-store audio, and does not
persist the generated audio. If HD Omni is unavailable for the configured
resource, the server tries the locale's Azure Neural voice before the client
uses a clearly labelled browser/device fallback. Signed-in requests and guest
requests have separate per-visitor quotas plus a D1-backed global safety cap;
guest quota keys are one-way hashes of Cloudflare's connecting address and are
kept only in Worker memory, never logged or persisted.

Read-aloud sends only the current question text and selected language to Azure
Speech. Because questions are tailored, that text can include short role,
evidence, or gap terms derived from the resume or job description; it does not
include either full document, the interview answer, transcript, or raw voice
recording. Voice recognition remains a
separate capability. Keep the public privacy policy and FAQ aligned if this
data flow changes.

## Two-stage interview voice answers

Voice answers show provisional captions from the browser or device while the
candidate speaks. For signed-in users, when `AZURE_SPEECH_KEY` and
`AZURE_SPEECH_ENDPOINT` are configured, the completed recording is sent to the
Microsoft Azure Speech Fast Transcription endpoint for a final correction pass.
The request contains the recorded answer audio, one of the 40 supported locale
codes, and at most 80 short vocabulary hints derived from the selected role,
resume, and job description. It never sends the full resume or job description
as transcription context.

The transcription route is same-origin, sign-in protected, size and media-type
limited, and returns private no-store JSON. InterviewThread does not persist or
log the raw recording. The user can edit the final text before submitting it.
Guest mode remains browser-only, and any unavailable or failed cloud correction
keeps the existing browser/device transcript instead of clearing the answer.

Resume text, job descriptions, tracker items, and Story Signal alert settings
remain on the device until an authenticated persistence feature explicitly
says otherwise. Submitted product feedback is stored in the Sites D1 database
and every submission has equal priority. Binary formats are parsed by the API
in the self-hosted stack.
