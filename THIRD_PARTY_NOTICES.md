# Third-party notices

InterviewThread includes adapted interview-practice prompts from the following open-source projects. The product interface retains source and license links for each imported prompt.

## Prior architectural references

- [`weiyu1029/careerproof-ai-portfolio`](https://github.com/weiyu1029/careerproof-ai-portfolio) — deterministic Evidence Guard concepts, resume parsing, and evidence-first product patterns.
- [`santifer/career-ops`](https://github.com/santifer/career-ops) — human-in-the-loop job-search operations, source-of-truth boundaries, honest gap handling, and the principle that keywords may be reformulated but never fabricated.

InterviewThread implements its own web-oriented architecture and matching engine. Refer to each upstream repository for its license and complete attribution history.

Product research also reviewed Resume Matcher, Reactive Resume, OpenResume, JobSync, and VeriWorkly. No source code or visual assets from those projects are included by this notice. Their product patterns and repository links are listed in `docs/open_source_benchmarks.md`; contributors must review the applicable upstream license before intentionally reusing code or assets.

## The System Design Primer

- Source: https://github.com/donnemartin/system-design-primer
- Copyright: Donne Martin and contributors
- License: Creative Commons Attribution 4.0 International (CC BY 4.0)
- License text: https://github.com/donnemartin/system-design-primer/blob/master/LICENSE.txt
- Changes: prompts were shortened and adapted into interviewer-style questions, and metadata was added for role, stage, and difficulty filtering.

## Front-end Developer Interview Questions

- Source: https://github.com/h5bp/front-end-developer-interview-questions
- Copyright: Contributors of the Front-end Developer Interview Questions
- License: MIT
- License text: https://github.com/h5bp/front-end-developer-interview-questions/blob/main/LICENSE
- Changes: selected topics were lightly adapted into spoken interview prompts and tagged with filtering metadata.

## JavaScript Questions

- Source: https://github.com/lydiahallie/javascript-questions
- Copyright: Lydia Hallie and contributors
- License: MIT
- License text: https://github.com/lydiahallie/javascript-questions/blob/master/LICENSE
- Changes: selected concepts were adapted into open-ended spoken interview prompts and tagged with filtering metadata.

## 30 Seconds of Interviews

- Source: https://github.com/Chalarangelo/30-seconds-of-interviews
- Pinned source commit: `da235b6185721161b7ebc413075b76dc70339ccf`
- Copyright: Copyright (c) 2018 Stefan Feješ and contributors
- License: MIT
- License text: https://github.com/Chalarangelo/30-seconds-of-interviews/blob/master/LICENSE
- Changes: answer material was excluded; 103 question prompts were normalized into a generated TypeScript data module, assigned stable InterviewThread IDs, and tagged with interviewer persona, track, answer stage, and L1–L3 difficulty metadata. The original wording is retained except for surrounding product presentation and localization.
