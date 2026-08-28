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

Interview questions use ElevenLabs `eleven_v3` when `ELEVENLABS_API_KEY` and a
natural female interviewer `ELEVENLABS_VOICE_ID` are configured. Keep both in
the server environment; they must never use a `NEXT_PUBLIC_` name or be
included in client code. The speech route accepts only the current question
text and one of the 40 supported locale codes, calls ElevenLabs' streaming
endpoint, validates and buffers at most 5 MiB of provider audio, returns
private no-store audio, and does not persist the generated audio. If
ElevenLabs is unavailable, the
server tries multilingual Azure Dragon HD Omni and then the locale's standard
Azure Neural voice before the client uses a clearly labelled browser/device
fallback. Each cloud attempt is bounded and the complete cloud chain has a
45-second hard deadline. Signed-in requests and guest requests have separate
per-visitor quotas plus a D1-backed global safety cap; guest quota keys are
one-way hashes of Cloudflare's connecting address and are kept only in Worker
memory, never logged or persisted. A separate D1-backed daily character budget
defaults to 50,000 characters and can be lowered with
`TTS_DAILY_CHARACTER_LIMIT`; set a provider-side spending limit as the final
billing guardrail.

Read-aloud sends only the current question text and selected language to
ElevenLabs, or to Azure Speech when a fallback is needed. Because questions are
tailored, that text can include short role, evidence, or gap terms derived from
the resume or job description; it does not include either full document, the
interview answer, transcript, or raw voice recording. Voice recognition
remains a separate capability. Keep the public privacy policy and FAQ aligned
if this data flow changes. InterviewThread does not retain the returned audio,
but provider-side processing and retention still follow the configured
ElevenLabs or Microsoft account settings and provider privacy terms.

## Two-stage interview voice answers

Voice answers show provisional captions from the browser or device while the
candidate speaks. In Voice mode, **Finish answer & continue** ends that turn,
corrects the transcript, scores it, and lets the interview engine either ask an
evidence-aware follow-up or open a new topic. The next question is then spoken
aloud. Text mode keeps the transcript editable and sends it only when the user
presses **Submit answer**. The microphone is never intentionally left open
between turns.

For signed-in users, the completed recording first uses ElevenLabs Scribe v2
when configured, then Azure Speech Fast Transcription as a bounded fallback.
The request contains the recorded answer audio, one of the 40 supported locale
codes, and at most 80 short vocabulary hints derived from the selected role,
resume, and job description. It never sends the full resume or job description
as transcription context. Signed-in Voice mode delivers questions through the
same-origin `/api/interview-dialogue` route using
`eleven_v3_conversational`; failure safely falls back to `/api/speech` and then
the reviewed device voice. Follow-up decisions remain in InterviewThread's
evidence-aware application logic rather than being delegated to the voice
model.

The transcription route is same-origin, sign-in protected, size and media-type
limited, and returns private no-store JSON. InterviewThread does not persist or
log the raw recording. Guest mode remains browser-only, and any unavailable or
failed cloud correction keeps the existing browser/device transcript instead
of clearing the answer.

Resume text, job descriptions, tracker items, and Story Signal alert settings
remain on the device until an authenticated persistence feature explicitly
says otherwise. Submitted product feedback is stored in the Sites D1 database
and every submission has equal priority. Binary formats are parsed by the API
in the self-hosted stack.
