# Contributing to CareerProof Agent

Thank you for helping make evidence-grounded career tools available to more people.

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

For the account-backed platform, copy `platform/.env.example`, install
`platform/api/requirements.txt`, and run the web and API checks described in
`platform/README.md`. Never use a production database or a real model key in a
test fixture.

## Pull request expectations

1. Link the issue your PR addresses.
2. Keep the change focused and explain the user impact.
3. Add or update tests for matching, scoring, privacy, or parsing behavior.
4. Update English documentation when behavior or configuration changes.
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
