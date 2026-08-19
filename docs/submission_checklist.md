# Submission Checklist

## Before uploading to GitHub

- [ ] `.env` is not included
- [ ] `.env.example` is included
- [ ] `.venv` is removed
- [ ] `__pycache__` folders are removed
- [ ] README is complete
- [ ] Kaggle writeup draft is complete
- [ ] Demo image is included
- [ ] Sample outputs are included

## GitHub upload

```bash
git init
git add .
git commit -m "feat: add CareerProof Agent capstone project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/careerproof-agent.git
git push -u origin main
```

## Kaggle submission

- Track: Concierge Agents
- Title: CareerProof Agent
- Subtitle: A personal AI career concierge that turns job descriptions into evidence-based interview strategy.
- Include GitHub link
- Include demo video link if available
- Include the Kaggle writeup content from `docs/kaggle_writeup.md`
