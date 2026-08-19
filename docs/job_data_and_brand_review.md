# Job data, automation, domain, and brand review

This document is an implementation policy, not legal advice. Re-check provider
terms and obtain counsel before a commercial launch.

## Approved discovery paths

CareerProof can ingest jobs from sources that explicitly permit programmatic
access, including:

- employer-owned feeds supplied under contract;
- public read-only ATS endpoints such as the
  [Greenhouse Job Board API](https://developers.greenhouse.io/job-board) and
  [Lever Postings API](https://github.com/lever/postings-api);
- licensed labor-market providers such as the existing Adzuna adapter;
- a job description or URL supplied by the user for personal analysis.

Every normalized job must retain its source URL, provider, retrieval time,
coverage statement, and license or permission record. Robots.txt is not a
license. A public webpage is not automatically permission to republish or
commercialize its contents.

## Restricted sources

Do not scrape, crawl, or automate applications on LinkedIn, Indeed, or
Handshake. Use only their official partner/API programs and the exact scopes
granted in writing:

- [LinkedIn User Agreement](https://www.linkedin.com/legal/user-agreement) and
  [API Terms](https://www.linkedin.com/legal/l/api-terms-of-use)
- [Indeed Terms](https://www.indeed.com/legal?hl=en_US) and
  [partner documentation](https://docs.indeed.com/legal-terms/sponsored-jobs-non-ats)
- [Handshake Terms](https://joinhandshake.com/legal/tos/)

Manual, Hybrid, and Automatic describe user control. They never override a
provider's terms. Automatic mode remains disabled for a connector until it has
an approved API, consent, a field-level preview, rate limits, an audit log,
retries, revocation, and an emergency stop.

## Brand and domain gate

The working name should not be treated as cleared for a paid launch. Active
career products already use CareerProof at
[careerproof.app](https://careerproof.app/),
[careerproof.ai](https://careerproof.ai/), and
[careerproof.org](https://www.careerproof.org/about/). The exact slogan
“Evidence that travels.” did not show an obvious competing career product in a
preliminary web check, but that is not a trademark clearance.

Before buying or attaching a custom domain:

1. choose a commercially safer final name;
2. search the [USPTO Trademark Search](https://tmsearch.uspto.gov/) and
   [WIPO Global Brand Database](https://branddb.wipo.int/);
3. obtain legal review in launch markets;
4. register and provide an owned hostname;
5. attach DNS, then submit the domain and sitemap through Google Search Console.

The app already emits canonical metadata, structured data, robots directives,
and a sitemap. Search indexing still depends on a verified production domain,
content quality, crawl timing, and Google; it cannot be guaranteed by code.
