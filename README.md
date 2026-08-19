# CareerStoryMap Web

This is the professional guest-first interface for CareerStoryMap. It provides a
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
build is Cloudflare Worker-compatible. Account-backed persistence is implemented
by the FastAPI service in `../api`; set `NEXT_PUBLIC_CAREERPROOF_API_URL` when
integrating the authenticated routes.

Resume text, job descriptions, tracker items, and Story Signal alert settings
remain on the device in the public guest preview. Submitted product feedback is
stored in the Sites D1 database; Community and Pro use the open queue, while
Team and Enterprise receive priority handling. Binary formats are parsed by the
API in the self-hosted stack.
