# GitHub Upload Steps

## 1. Unzip the package

Unzip `CareerProof-Agent-GitHub-Package.zip`.

## 2. Check secrets

Before pushing, verify that `.env` is not included:

```bash
find . -name ".env" -print
```

If a `.env` file exists, delete it or confirm it contains no real key.

## 3. Initialize Git

```bash
git init
git add .
git commit -m "feat: add CareerProof Agent capstone project"
```

## 4. Create GitHub repo

Create a public GitHub repo named:

```text
careerproof-agent
```

Do not initialize it with a README, because this package already includes one.

## 5. Push

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/careerproof-agent.git
git push -u origin main
```

## 6. Kaggle Writeup

Use `docs/kaggle_writeup.md` as the starting point for your Kaggle submission.

Recommended track:

```text
Concierge Agents
```
