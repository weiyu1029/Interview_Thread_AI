# InterviewThread

## Track

Concierge Agents

## Project summary

InterviewThread is an open-source, evidence-grounded AI mock interview coach.
It connects a candidate's real resume or career evidence to a real job post,
keeps unsupported claims visible as gaps, and turns supported evidence into
defensible interview stories and role-specific practice.

## Problem

AI tools can generate polished answers, but candidates still struggle to understand what hiring managers truly evaluate and how to prove fit with real experience. Early market research showed repeated pain points around role ambiguity, industry unfamiliarity, weak answer structure, and generic AI output.

## Solution

InterviewThread analyzes candidate-provided evidence and a job description,
then produces:

- an Evidence Map that distinguishes strong proof, partial proof, and genuine gaps;
- evidence-linked interview stories;
- likely role-specific questions and follow-up probes;
- coaching and realistic mock-interview modes;
- a focused preparation plan the candidate can inspect and correct.

## Core insight

Generic AI writes first. InterviewThread verifies first: no source, no claim.

## Technical implementation

The production web experience uses a deterministic evidence engine by default.
Resume and job-post parsing happens in the browser, while optional model and
speech integrations are isolated behind explicit controls and privacy
boundaries. The repository also retains a Google ADK-compatible experiment and
an optional self-hosted FastAPI foundation.

## Industry coverage

InterviewThread includes a multi-industry evidence taxonomy, 40 locale choices,
an open interview question bank, and curated external practice resources. The
product distinguishes original or licensed material from link-only third-party
resources.

## Market research

Founding-beta research focuses on experience-to-story translation,
role-specific practice, mobile and multilingual usability, speech quality, and
the accuracy of evidence and gap classification.

## Evaluation

Automated tests cover evidence matching, privacy redaction, document parsing,
authentication boundaries, localization, question-bank coverage, job-source
normalization, speech fallbacks, and accessible responsive rendering. Human
beta review remains necessary for interview realism and language quality.

## Limitations

InterviewThread is beta software. External job sources are limited to approved
employer ATS feeds, speech quality varies by locale and device, and important
outputs still require candidate review. The product does not scrape restricted
job platforms, auto-submit applications, predict a proprietary ATS score, or
guarantee interview outcomes.

## Future vision

InterviewThread can grow into a maintainable, privacy-conscious interview
practice platform with stronger evidence provenance, native-speaker language
review, transparent evaluation, and carefully governed integrations—without
weakening the rule that every candidate-facing claim must come from evidence.

## Try and contribute

- Product: https://interviewthreadai.com
- Founding beta: https://interviewthreadai.com/en/beta
- Source: https://github.com/weiyu1029/Interview_Thread_AI
