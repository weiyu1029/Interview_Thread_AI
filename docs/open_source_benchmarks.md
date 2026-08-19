# Open-Source Product Benchmarks

CareerProof borrows product patterns, not code, from established open-source
career tools. Every upstream license still applies to any code or asset that a
future contributor may intentionally reuse.

| Project | Pattern worth learning from | CareerProof application |
|---|---|---|
| [career-ops](https://github.com/santifer/career-ops) | Career evidence as the source of truth; human confirmation before writes | Canonical evidence boundary and no auto-apply behavior |
| [Resume Matcher](https://github.com/srbhr/Resume-Matcher) | Master resume, role-specific tailoring, keyword highlighting, interview preparation, local and remote models | Evidence matrix, story pack, and provider-agnostic routing |
| [Reactive Resume](https://github.com/AmruthPillai/Reactive-Resume) | Guest-first use, self-hosting, privacy, portable exports, mature contributor experience | Low-friction guest mode and progressive account value |
| [OpenResume](https://github.com/xitanggg/open-resume) | Browser-local parsing and ATS-readable resume design | In-memory parsing and future client-side export work |
| [JobSync](https://github.com/Gsync/jobsync) | Permanent tracker, narrow evidence-aware assistant, explicit write confirmation | Workspace-scoped tracker, analysis-linked chat, and untrusted JD handling |
| [VeriWorkly](https://github.com/VeriWorkly/veriworkly) | Local-first master profile, optional sync, usage controls, extensible API | Progressive persistence, usage events, and account-backed team plan |

## What CareerProof should differentiate

- Keyword results show the exact candidate sentence used as evidence.
- Required, core, and preferred requirements receive different weights.
- Safe wording changes are separated from real experience gaps.
- Interview stories retain explicit missing fields instead of filling them with
  plausible fiction.
- Deterministic results remain available without an API key.
- Any supported model is an optional reasoning layer, not the source of truth.

## Features intentionally deferred

Automatic job application submission, covert scraping, unreviewed resume
rewrites, and opaque "ATS prediction" scores create safety, platform-policy,
and trust risks. CareerProof should instead make the candidate's evidence easier
to inspect, improve, and communicate.

