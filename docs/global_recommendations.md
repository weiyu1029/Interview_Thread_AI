# Global Recommendations and Market Insights

CareerProof Global extends evidence matching into job discovery without turning
fluency into a substitute for truth. A recommendation is a ranked comparison
between a licensed or imported job description and candidate-provided evidence.
The system can improve framing, but it cannot manufacture experience.

## Product contract

The recommendation workflow accepts a career profile, optional verified
stories, role and industry interests, country or region, radius, and work-style
preferences. Each result returns:

- a deterministic evidence-match score;
- the strongest matched requirements;
- gaps that still need proof or learning;
- the best source-backed story to lead with;
- data source and listing URL when the provider permits them.

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

## Application modes and commercial boundary

| Mode | Plan | Behavior | Safety boundary |
|---|---|---|---|
| Manual | Community / open source | User reviews, edits, and submits | No automated submission |
| Hybrid | Pro | AI prepares tailored drafts and a queue | Explicit approval for every submission |
| Automatic | Team / Enterprise | Governed workflows through approved employer APIs | Consent, provider allowlist, rate limits, audit log, emergency stop |

The repository does not enable a submission connector by default. Selecting a
mode creates preferences and checks entitlements; it does not send an
application. A future connector must pass legal, privacy, abuse, data-retention,
provider-policy, retry, and user-consent review before it can be enabled.

The open-source boundary includes the canonical evidence engine, locale
resources, basic recommendations, transparent scoring, market-data schema,
manual mode, self-hosting, export, and safety rules. Paid value may include
hosted history, alerts, model credits, approval queues, collaboration,
governance, audited connectors, operational support, and licensed data costs.
