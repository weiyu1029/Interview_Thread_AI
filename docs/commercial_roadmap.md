# Product and Commercial Roadmap

## Stage 1: trustworthy public utility

- Guest evidence matching with no API key
- Broad in-memory document extraction
- Transparent scoring and evidence-linked story scaffolds
- Device-local tracker, copilot, and feedback in the public web experience
- 40-locale interface foundation and open translation contribution workflow
- Basic evidence-ranked global job recommendations with transparent sources
- Manual Story Signal scans, browser alerts, and device-local auto-tracking
- Manual application mode and an explicitly labeled Market Insights preview

Exit criteria: keyword extraction and evidence linking have repeatable tests;
unsupported-claim rate is measured; privacy behavior is documented.

## Stage 2: accounts and permanent history

- Verified accounts and password recovery
- PostgreSQL-backed analyses, tracker items, conversations, and exports
- Explicit retention, delete-account, and data-export controls
- Saved master career profile with version history
- Background document processing and optional OCR
- Permanent job-search preferences, saved recommendations, scheduled Story
  Signal monitoring, and cross-device market alerts

Exit criteria: authorization tests cover every workspace resource; backup and
restore are exercised; deletion is verified end to end.

## Stage 3: collaboration

- Workspace invitations and role-based access
- Shareable evidence packets and reviewer comments
- Activity history and notification preferences
- Team templates for universities, coaches, and outplacement partners

Exit criteria: audit logs, invitation abuse controls, and tenant-isolation tests
are in place.

## Stage 4: paid plans

- Pro plan for higher analysis limits, history, comparison, and advanced exports
- Team plan for shared workspaces, reviewers, governance, and support
- Metered model usage with bring-your-own-key and platform-credit options
- Billing portal, invoices, cancellation, refunds, and grace periods
- Hybrid application preparation with per-application human approval
- Team and Enterprise automation only through audited, allowlisted provider APIs

No safety boundary, export right, or self-hosting capability should be placed
behind a paid plan.

## Quality and business metrics

| Area | Primary metric | Guardrail |
|---|---|---|
| Matching | Required-keyword recall on reviewed fixtures | Evidence precision |
| Stories | Percentage with source-linked action and verified result | Unsupported-claim rate |
| Product | Analysis-to-saved-opportunity rate | Guest completion rate |
| Retention | Weekly users returning to a saved opportunity | Delete/export success |
| AI | Helpful rating by provider and model | Cost, latency, refusal, and hallucination |
| Commercial | Free-to-Pro conversion | Refunds, failed payments, support burden |

## Evaluation program

Create a synthetic, license-safe benchmark across role families, industries,
seniority levels, and English variants. Human reviewers should label JD
requirements, supporting resume evidence, legitimate synonyms, true gaps, and
acceptable story fields. Run the same fixture set across the deterministic
engine and every promoted model. Provider defaults should change only through a
reviewed evaluation result, not anecdotal preference.
