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

Interview questions use server-side Microsoft Azure Speech when both
`AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` are configured. Keep the key in
the server environment; it must never use a `NEXT_PUBLIC_` name or be included
in client code. The speech route accepts only the current question text and one
of the 40 supported locale codes, returns private no-store audio, and does not
persist the generated audio. If either setting is absent or Azure Speech is
unavailable, the client falls back to the browser or device voice.

Read-aloud does not send the resume, job description, interview answer,
transcript, or raw voice recording to Azure Speech. Voice recognition remains a
separate browser capability. Keep the public privacy policy and FAQ aligned if
this data flow changes.

Resume text, job descriptions, tracker items, and Story Signal alert settings
remain on the device until an authenticated persistence feature explicitly
says otherwise. Submitted product feedback is stored in the Sites D1 database
and every submission has equal priority. Binary formats are parsed by the API
in the self-hosted stack.
