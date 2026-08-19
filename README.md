# CareerProof Web

This is the professional guest-first interface for CareerProof. It provides a
working deterministic evidence match, device-local application tracker,
evidence-aware copilot, feedback form, and clear model-provider selection.

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
