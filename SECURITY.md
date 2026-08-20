# Security Policy

## Supported versions

Security fixes are applied to the latest release on the default branch.

## Reporting a vulnerability

Please use GitHub private vulnerability reporting for this repository. Do not open a public issue for a vulnerability that could expose resumes, API keys, uploaded documents, or deployment secrets.

Include:

- affected version or commit;
- reproducible steps;
- expected and observed behavior;
- potential impact;
- a suggested mitigation, if available.

Maintainers will acknowledge a complete report within seven days and will coordinate disclosure after a fix is available.

## Deployment responsibilities

- Never commit `.env`, `secrets.toml`, API keys, or real candidate data.
- Prefer session-only bring-your-own-key access for public deployments.
- Add rate limiting and request-size limits before operating a high-traffic hosted service.
- Review the privacy terms of every configured model provider.
- Treat job descriptions and uploaded files as untrusted input.
- Keep Streamlit, document parsers, and model SDKs updated.

CareerStoryMap does not submit applications, send messages, or make employment decisions.

