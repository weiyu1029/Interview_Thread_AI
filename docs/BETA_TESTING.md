# InterviewThread Founding Beta Guide

InterviewThread is recruiting a small, diverse group of job seekers and
interview professionals to validate the complete evidence-to-interview workflow
before a wider release.

## Who we are looking for

- students and recent graduates;
- career changers;
- people interviewing in a non-native language;
- candidates with an interview in the next 30 days;
- recruiters, career coaches, hiring managers, and accessibility reviewers.

Apply at [interviewthreadai.com/en/beta](https://interviewthreadai.com/en/beta).

## What to test

Plan for two or three sessions of about 15 minutes each.

1. Add a truthful resume or career-evidence sample and one real job post.
2. Check whether every match and story remains traceable to candidate evidence.
3. Check whether genuine gaps remain visible rather than being rewritten as strengths.
4. Complete one coaching-mode and one realistic-mode mock interview.
5. Test the selected language, voice input, and question playback if available.
6. Repeat the core flow on a second device or browser when practical.

Report the first moment that is inaccurate, repetitive, confusing,
inaccessible, or blocked. Positive feedback is welcome, but specific failure
evidence is more useful than praise.

## What to include in feedback

- the task you were trying to complete;
- the exact step where the problem appeared;
- expected and observed behavior;
- browser, device, locale, and sign-in or guest mode;
- a screenshot with all personal information removed;
- synthetic text that reproduces the issue, when possible.

Use the [private contact form](https://interviewthreadai.com/en/contact) for
account-specific feedback. Use the GitHub `Beta feedback` issue form only with
synthetic data.

## Privacy boundary

The beta application does not ask applicants to submit a resume or job
description. Never publish a real resume, job post tied to a private
application, interview transcript, voice recording, email address, API key, or
other personal information in GitHub Issues, Discussions, tests, or pull
requests.

Guest-mode activity is not saved to an InterviewThread account. Participation
does not authorize model training or publication of candidate data.

## How feedback becomes a release

Maintainers classify reports by user impact:

- **P0** — security, privacy, or data loss;
- **P1** — blocks sign-in, import, evidence mapping, or mock interviews;
- **P2** — materially harms accuracy, language, voice, accessibility, or UX;
- **P3** — suggestion or minor polish.

The weekly beta update follows a simple format:

`You reported → We changed → Please retest`

P0 and P1 regressions are resolved before the cohort expands.
