# Open interview question sources

InterviewThread ships a structured interview question bank that can be filtered by interviewer role, question type, answer stage, and difficulty. The bank is intentionally curated rather than described as “every question on the internet.” A public repository is not automatically licensed for reuse, and some interview websites prohibit copying or commercial reuse.

## Bundled sources

| Source | Included use | License |
| --- | --- | --- |
| [InterviewThread Community Question Bank](https://github.com/weiyu1029/careerproof-agent) | 75 original, evidence-grounded role questions | MIT |
| [The System Design Primer](https://github.com/donnemartin/system-design-primer) | 10 attributed and adapted system-design prompts | CC BY 4.0 |
| [Front-end Developer Interview Questions](https://github.com/h5bp/front-end-developer-interview-questions) | 8 selected and adapted front-end prompts | MIT |
| [JavaScript Questions](https://github.com/lydiahallie/javascript-questions) | 8 JavaScript concepts adapted into spoken interview prompts | MIT |

The current bundled bank contains 101 questions. Community questions are dynamically grounded in the user’s resume evidence and job description. Imported prompts remain linked to their source and license in the product interface.

## Contribution rules

New question contributions must include:

1. A stable source URL and repository owner.
2. A recognized license that permits redistribution and adaptation.
3. The source license URL and required attribution.
4. An original or properly adapted prompt; do not copy questions from paid platforms, employer interview loops, or websites without reuse permission.
5. A role, question type, answer stage, and difficulty level.
6. No claim that a company is guaranteed to ask the question.

Add structured records in `platform/web/app/interview-question-bank.ts`, update `THIRD_PARTY_NOTICES.md` when a new external source is bundled, and add tests for filtering and source metadata.

