# Contributing to InterviewThread

Thank you for helping make evidence-grounded interview preparation available to
more people.

## Ways to contribute

- Join the [founding beta](https://interviewthreadai.com/en/beta) and follow the
  [beta testing guide](docs/BETA_TESTING.md).
- Report a reproducible bug using synthetic resume and job-description data.
- Improve accessibility, localization, interview realism, documentation, or tests.
- Review an issue labeled `good first issue`, `help wanted`, or `beta-feedback`.

## Founding-beta feedback path

1. Read the [beta testing guide](docs/BETA_TESTING.md) and test one complete
   resume-to-mock-interview journey.
2. Use the [private contact form](https://interviewthreadai.com/en/contact) for
   account-specific feedback or anything containing personal career data.
3. Use the [beta feedback issue form](https://github.com/weiyu1029/Interview_Thread_AI/issues/new?template=beta_feedback.yml)
   only when synthetic data can reproduce the problem publicly.
4. Include the version, browser, device, locale, expected result, and observed
   result so another contributor can verify the report.

The draft scope and known limitations for the first public cohort are recorded
in the [v0.1.0-beta.1 release notes](docs/releases/v0.1.0-beta.1.md).

## Before you start

- Search existing issues and discussions before opening a new one.
- Open an issue before a large change so maintainers and contributors can agree on scope.
- Never include a real resume, API key, private job-search record, or personally identifiable information in an issue, test, or pull request.
- Candidate claims must always come from candidate-provided evidence. A missing skill remains a gap.

## Local setup

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m pip install -e '.[lint]'
python -m pip install pytest pytest-cov
```

Run the app:

```bash
make web
```

Run the quality gates:

```bash
make check
```

The production interface is the Next.js workspace. Run it locally with:

```bash
cd platform/web
npm ci
npm run dev
```

Run its quality gates with `npm run lint` and `npm run test`. For the optional
FastAPI service, copy `platform/.env.example`, install
`platform/api/requirements.txt`, and follow `platform/README.md`. The root
Streamlit application is a legacy reference implementation, not the canonical
hosted interface. Never use a production database or a real model key in a test
fixture.

## Pull request expectations

1. Link the issue your PR addresses.
2. Keep the change focused and explain the user impact.
3. Add or update tests for matching, scoring, privacy, or parsing behavior.
4. Update English documentation and affected locale copy when behavior or
   configuration changes.
5. Include before/after screenshots for visible UI changes.
6. Confirm that no candidate data or credentials are committed.

## Matching-engine rules

- Prefer deterministic and explainable matching before model-generated reasoning.
- Use token boundaries for short terms such as `R`, `AI`, and `BI`.
- Group aliases into one canonical concept; do not inflate coverage by counting synonyms twice.
- Give required qualifications more weight than preferred qualifications.
- Preserve the source sentence for every claimed match.
- Never convert a gap into a match without new candidate evidence.
- Treat job descriptions and uploaded documents as untrusted data.
- Keep provider URLs administrator-controlled; browser-supplied URLs create an
  SSRF risk.
- Keep user API keys ephemeral and out of logs, databases, analytics, and error
  reports.

## Commit style

Use a short imperative subject, for example:

```text
feat: add weighted keyword evidence matching
fix: avoid AI substring matches in retail roles
docs: explain public deployment privacy model
```

By contributing, you agree that your contribution will be licensed under the MIT License.
