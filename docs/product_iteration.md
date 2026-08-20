# InterviewThread product iteration system

InterviewThread is developed as one measurable product lifecycle, not as disconnected feature launches. Closed beta is an opt-in safety and learning stage between internal validation and wider release.

## Product promise

Turn a real resume and a real job description into evidence-linked interview preparation without inventing achievements. Every release must preserve that promise.

## Lifecycle

| Stage | Audience | Purpose | Exit decision |
| --- | --- | --- | --- |
| Problem discovery | 5–8 target users per segment | Validate the job-to-be-done and candidates' language | A repeated, urgent problem with a testable workflow |
| Internal alpha | Maintainers and invited reviewers | Remove broken paths, privacy mistakes, and obvious model failures | No known critical blocker in the core flow |
| Closed beta | 20–40 consented participants per cohort | Test accuracy, comprehension, speech, accessibility, and retention | All release gates pass for the cohort |
| Public beta | 100–300 users in staged rollout | Confirm reliability and support load at larger scale | Stable metrics for two release cycles |
| General availability | Wider public | Operate a reliable, documented open-source product | Continuous monitoring and reversible releases |

Access expands by explicit cohort status (`applied`, `invited`, `active`, `paused`, `withdrawn`). Applying never silently enrolls a person, and withdrawing stops future beta contact.

## Closed-beta cohort design

Recruit across role families, experience levels, interview timelines, languages, non-native speakers, and accessibility needs. Do not fill a cohort only with friends or technically advanced users. Avoid collecting free-text career history in the application; resumes and job descriptions belong only in the user-controlled product workflow.

Participants should complete two or three sessions:

1. Create an evidence map from a real resume and job description.
2. Review the strongest evidence and true gaps.
3. Practice a coaching-mode and realistic-mode interview.
4. Report the first confusing, inaccurate, repetitive, inaccessible, or blocked moment.

## Release gates

These are operational targets, not claims of impossible “100%” accuracy:

- zero invented achievements in the human-audited golden evaluation set;
- at least 95% of generated factual claims trace to source evidence;
- fewer than 2% repeated interview questions in tested sessions;
- at least 90% successful completion of the core resume-to-interview flow;
- no open severity-0 or severity-1 privacy, security, deletion, accessibility, or data-loss issue;
- rollback and recovery checks complete;
- reviewed behavior for all 40 interface locales, with additional speech acceptance tests for core launch languages.

Speech quality must be measured by language, device, noise condition, and career vocabulary. A single global “accuracy” percentage is not meaningful.

## Weekly product loop

1. **Observe** — connect feedback to product version, surface, cohort, locale, and severity.
2. **Triage** — prioritize fabricated claims, privacy failures, blocked tasks, accessibility failures, and data loss before polish.
3. **Form a hypothesis** — name the user problem and expected measurable change.
4. **Ship reversibly** — use a small cohort or feature flag and retain a rollback path.
5. **Evaluate** — run automated regression tests, the golden evidence set, and human review.
6. **Graduate, revise, or roll back** — expand only when the release gates pass.
7. **Document** — update the changelog, known limitations, model/version record, and contributor issue.

## Feedback severity

- **S0 — Stop:** exposed private data, destructive data loss, account takeover, or unsafe automated action.
- **S1 — Critical:** invented achievement, materially misleading career claim, broken deletion, or inaccessible core flow.
- **S2 — Major:** blocked workflow, repeated questions, wrong locale, or serious speech failure.
- **S3 — Minor:** unclear copy, visual inconsistency, or non-blocking friction.

## Data and consent boundaries

- Beta application data is stored separately from resume and job-description content.
- Store the terms, privacy, and product versions accepted with each application.
- Optional research contact and product updates require separate consent.
- Feedback is tagged server-side with the product version and active beta cohort.
- Do not use applications, resumes, or interview responses to train a public model without a separate, explicit opt-in.
- A participant can withdraw from beta without deleting their account; account/data deletion remains a separate privacy right.

## What is not automated yet

Cohort promotion and release approval remain maintainer-controlled until an authenticated admin console, audit log, and operator identity are implemented. This prevents an unreviewed model or public endpoint from granting access to itself.
