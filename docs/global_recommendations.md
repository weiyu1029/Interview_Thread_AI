# Global Recommendations and Market Insights

CareerStoryMap Global extends evidence matching into job discovery without turning
fluency into a substitute for truth. A recommendation is a ranked comparison
between a licensed or imported job description and candidate-provided evidence.
The system can improve framing, but it cannot manufacture experience.

## Product contract

The recommendation workflow accepts a career profile, optional verified
stories, role and industry interests, country or region, radius, and work-style
preferences. Each result returns:

- a deterministic evidence-match score;
- a separate Story Signal score composed of evidence coverage, required-role
  coverage, and outcome strength;
- the strongest matched requirements;
- gaps that still need proof or learning;
- the best source-backed story to lead with;
- data source and listing URL when the provider permits them.

## Proof-qualified alerts

The public Radar is intentionally stricter than ordinary job matching. A role
must clear the user-selected Story Signal threshold, include at least two
source-backed proof signals, and contain no unsupported must-have requirement.
Qualified roles can create an in-app or browser notification and can be added
to the device-local tracker with the triggering story attached. This is an
inspectable rule, not a claim that the product can predict recruiter decisions.

Manual scans and device-local alerts belong to the open core. Scheduled,
cross-device monitoring requires accounts, background workers, durable
preferences, notification consent, delivery controls, and provider-aware rate
limits before it can be offered safely as a hosted open-source capability.

The public web page uses fictional, explicitly labeled product-preview roles.
It must never present example values as live job listings or market totals. The
FastAPI service uses caller-supplied records, imported database records, or the
optional Adzuna adapter when an administrator configures licensed credentials.

## Market data model

`MarketMetric` stores comparable vacancy-count snapshots by provider, date,
country, region, industry, role family, and work style. Growth is calculated
only when at least two like-for-like snapshots exist. Every production view
should show provider, geography, coverage, methodology, and refresh time.

Initial source adapters are intentionally narrow:

- [Adzuna's official API](https://developer.adzuna.com/overview) supplies job
  search, regional vacancy counts, categories, and provider-reported employment
  data when configured with an application ID and key.
- [Lever's official Postings API](https://github.com/lever/postings-api) is a
  future employer-specific connector for published jobs. It is not a global
  search index and should be used only for configured employer sites.
- [ESCO](https://esco.ec.europa.eu/en) is a future multilingual occupation and
  skills taxonomy. It can improve concept normalization, but it is not a live
  vacancy-count source.

Provider coverage is never described as the entire labor market. Scraping that
violates a site's terms, hidden browser automation, and unlicensed data resale
are outside the project boundary.

## Interface languages

The web foundation includes 40 locale choices and right-to-left layout support:

English, Japanese, Korean, Simplified Chinese, Traditional Chinese, Spanish,
French, German, Brazilian Portuguese, Italian, Dutch, Polish, Turkish, Russian,
Ukrainian, Arabic, Hebrew, Hindi, Bengali, Urdu, Indonesian, Malay, Thai,
Vietnamese, Filipino, Swedish, Norwegian, Danish, Finnish, Czech, Slovak,
Hungarian, Romanian, Greek, Bulgarian, Croatian, Serbian, Slovenian, Swahili,
and Persian.

Core navigation, the primary value proposition, global workspace labels, and
application modes are community-maintained locale resources. Generated job and
market content retains its source language unless a configured translation
model is used. Contributions should include native-speaker review and must not
silently translate employer qualifications into different requirements.

## Application modes and safety boundary

| Mode | Access | Behavior | Safety boundary |
|---|---|---|---|
| Manual | Free and open source | User reviews, edits, and submits | No automated submission |
| Hybrid | Free and open source | AI prepares tailored drafts and a queue | Explicit approval for every submission |
| Automatic | Free and open source | Governed workflows through approved employer APIs | Consent, provider allowlist, rate limits, audit log, emergency stop |

The repository does not enable a submission connector by default. Selecting a
mode creates preferences and checks entitlements; it does not send an
application. A future connector must pass legal, privacy, abuse, data-retention,
provider-policy, retry, and user-consent review before it can be enabled.

The open-source boundary includes the canonical evidence engine, locale
resources, recommendations, transparent scoring, market-data schema, all three
application-mode controls, self-hosting, export, collaboration foundations, and
safety rules. Accounts may support durable hosted state, but do not create a
paid entitlement.
