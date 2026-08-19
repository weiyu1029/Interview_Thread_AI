# Aptograph Web

This is the professional guest-first interface for Aptograph. It provides a
working deterministic evidence match, device-local application tracker,
evidence-aware copilot, feedback form, and clear model-provider selection.

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

No resume text, job description, tracker item, or feedback leaves the browser
in the public guest preview. Binary formats are parsed by the API in the
self-hosted stack.
