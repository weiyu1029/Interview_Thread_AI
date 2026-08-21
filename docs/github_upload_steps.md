# GitHub Contribution Workflow

The canonical repository is
[weiyu1029/Interview_Thread_AI](https://github.com/weiyu1029/Interview_Thread_AI).
Do not create a second public repository or upload a ZIP copy of the project.

## 1. Fork and clone

Fork the canonical repository in GitHub, then clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/Interview_Thread_AI.git
cd Interview_Thread_AI
git remote add upstream https://github.com/weiyu1029/Interview_Thread_AI.git
```

## 2. Start from current `main`

```bash
git fetch upstream
git switch -c fix/short-description upstream/main
```

Keep each branch focused on one reviewable problem.

## 3. Protect private data

Never commit `.env` files, credentials, real resumes, interview transcripts,
private job-search records, or other personally identifiable information. Use
synthetic examples in tests, issues, and pull requests.

Review the exact files you intend to publish:

```bash
git status --short
git diff --check
```

Stage explicit paths only. Do not use `git add .` in a mixed worktree.

```bash
git add -- path/to/confirmed-file
git commit -m "fix: describe the user-visible change"
```

## 4. Run the quality gates

```bash
make check
cd platform/web
npm ci
npm run lint
npm run test
```

Also run `./scripts/check-public-brand.sh` for documentation, metadata, or
branding changes.

## 5. Open a pull request

Push the feature branch to your fork and open a pull request against
`weiyu1029/Interview_Thread_AI:main`. Explain the user impact, verification,
privacy implications, and any known limitations. Include before-and-after
screenshots for visible changes.

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the complete contribution and
beta-feedback rules.
