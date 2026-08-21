# Open interview question sources

InterviewThread ships a structured, auditable interview question bank rather than claiming to include “every question on the internet.” The current bank contains **926 questions**:

- **900 original InterviewThread questions** generated from a complete `15 personas × 5 answer stages × 3 difficulty levels × 4 lenses` matrix.
- **26 attributed adaptations** from three license-compatible open-source projects.

Every bundled question has a stable ID, filtering metadata, and a source record. Original questions are grounded in the user’s resume evidence and job description at render time. Adapted questions retain their upstream source and license links in the product interface.

## Original InterviewThread matrix

The 900 original records cover every combination below, so no persona, stage, difficulty, or lens selection is empty.

### 15 interviewer personas

| Persona ID | Interview perspective |
| --- | --- |
| `hr` | HR screening and employment-context fit |
| `recruiter` | Qualifications, motivation, and role fit |
| `hiring-manager` | Delivery, behavior, ownership, and role readiness |
| `functional-lead` | Functional depth, standards, and team contribution |
| `technical` | Technical fundamentals, implementation, testing, and trade-offs |
| `system-design` | Architecture, scale, reliability, and system trade-offs |
| `portfolio` | Portfolio evidence, decisions, craft, and measurable impact |
| `coo` | Operating judgment, execution, risk, and cross-functional systems |
| `ceo` | Strategy, mission, leverage, and executive judgment |
| `peer` | Collaboration, communication, conflict, and working style |
| `cross-functional` | Influence without authority and dependency management |
| `customer` | Customer understanding, trust, outcomes, and service judgment |
| `values` | Integrity, values, learning, and culture contribution |
| `case` | Structured analysis, assumptions, recommendations, and cases |
| `panel` | Concise synthesis across role fit, evidence, and judgment |

### Five answer stages

1. **Context** — establish the situation, problem, constraints, and stakes.
2. **Ownership** — separate the candidate’s personal responsibility from collaborators and dependencies.
3. **Decision** — explain the options, evidence, trade-offs, and reasoning behind the choice.
4. **Outcome** — state what changed, how it was measured, and what can be verified.
5. **Reflection** — identify limitations, lessons, and what the candidate would transfer or change next time.

### Difficulty levels

- **L1 · Foundation:** asks for a clear, direct, evidence-based explanation. It tests whether the candidate can identify a real example, personal contribution, decision, result, or honest limitation without unnecessary ambiguity.
- **L2 · Depth:** probes the baseline, measurement, authority boundary, dependencies, rejected alternatives, accepted trade-offs, and likely failure modes. It tests whether the story survives normal hiring-manager follow-up.
- **L3 · Pressure:** challenges uncertainty and attribution. It can ask what would disprove the claim, how disputed ownership would be resolved, what changes if a key constraint reverses, or how the candidate would answer a causality challenge without overstating impact.

Difficulty is independent of seniority. A new graduate can receive an L3 pressure question about a school project, while an executive can receive an L1 context question.

### Four question lenses

- **Evidence:** asks for a specific detail, artifact, baseline, metric, observable result, or disconfirming evidence that makes the claim auditable.
- **Ownership:** establishes what the candidate personally did, where their authority ended, and how collaborators or dependencies affected the outcome.
- **Judgment:** examines the decision, information available at the time, alternatives considered, trade-offs accepted, and how changed constraints would affect the choice.
- **Pressure:** tests limitations, uncertainty, failure modes, risk controls, attribution, and whether the candidate can defend the story without inventing or exaggerating evidence.

## Bundled sources

| Source | Included use | License |
| --- | --- | --- |
| [InterviewThread Community Question Bank](https://github.com/weiyu1029/Interview_Thread_AI) | 900 original, evidence-grounded questions covering the full matrix above | MIT |
| [The System Design Primer](https://github.com/donnemartin/system-design-primer) | 10 attributed and adapted system-design prompts | [CC BY 4.0](https://github.com/donnemartin/system-design-primer/blob/master/LICENSE.txt) |
| [Front-end Developer Interview Questions](https://github.com/h5bp/front-end-developer-interview-questions) | 8 selected and adapted front-end prompts | [MIT](https://github.com/h5bp/front-end-developer-interview-questions/blob/main/LICENSE.md) |
| [JavaScript Questions](https://github.com/lydiahallie/javascript-questions) | 8 JavaScript concepts adapted into spoken interview prompts | [MIT](https://github.com/lydiahallie/javascript-questions/blob/master/LICENSE) |

The three external projects contribute **26 attributed adaptations**, bringing the bundled total to **926 questions**. Their upstream licenses continue to apply to those adaptations; they are not relicensed merely because InterviewThread’s original question bank and application code use MIT.

## Linked-only and excluded sources

InterviewThread does **not** copy questions from proprietary platforms, paid preparation products, employer interview loops, or repositories whose reuse terms are missing or unclear. This includes sites such as LeetCode, HackerRank, Glassdoor, and similar commercial question libraries. When useful, the product may provide a normal external practice link, but the linked page’s questions, answers, and assets are not bundled, mirrored, scraped, or presented as InterviewThread content.

The same rule applies to public GitHub repositories without a verified redistribution license and to aggregators that merely link to third-party material: public visibility is not permission to copy. Copyleft or share-alike sources are also linked only unless maintainers deliberately introduce a separately licensed module after compatibility review.

## Contribution rules

New question contributions must include:

1. A stable source URL and repository owner.
2. A recognized license that permits redistribution and adaptation.
3. The source license URL, required copyright notice, and attribution.
4. An original or properly adapted prompt; do not copy questions from paid platforms, employer interview loops, or websites without reuse permission.
5. A persona, question track, answer stage, difficulty level, and—when applicable—one of the four supported lenses.
6. No claim that a company is guaranteed to ask the question.
7. No personal data, confidential interview-loop material, or content obtained in violation of an NDA or website terms.

Add structured records in `platform/web/app/interview-question-bank.ts`, update `THIRD_PARTY_NOTICES.md` when a new external source is bundled, and add tests for count, uniqueness, filtering coverage, and source metadata.
