# Legal and privacy launch checklist

This document is an implementation checklist, not legal advice. The public
Terms of Use and Privacy Policy are aligned with the current InterviewThread
code and data boundary as of August 20, 2026. A qualified lawyer should review
them before billing, enterprise accounts, employer-facing features, or a formal
company launch.

## Official requirements consulted

- [Google OAuth 2.0 Policies](https://developers.google.com/identity/protocols/oauth2/policies)
  require a public homepage on a verified domain with readily available terms
  and privacy links.
- [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)
  requires accurate, comprehensive disclosures covering access, use, storage,
  sharing, and deletion of Google user data.
- [LinkedIn API Terms](https://www.linkedin.com/legal/l/api-terms-of-use)
  require a readily available user agreement and privacy policy, accurate data
  disclosures, consent, withdrawal, and a user-directed deletion path.
- [GitHub OAuth best practices](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/best-practices-for-creating-an-oauth-app)
  recommend minimal scopes, secure credentials, breach planning, and data
  deletion support.
- [FTC business guidance](https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business)
  recommends collecting only necessary data, protecting it, defining retention,
  and disposing of it when the business need ends.
- [ICO right-to-be-informed guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/)
  lists the identity, purposes, sharing, retention, rights, and complaint details
  expected in a transparent privacy notice.

## Before public OAuth review

1. Replace the community-maintainer description with the legal operator's full
   name and business address where required.
2. Create a private support email on the verified domain, such as
   `privacy@your-domain`, and add it to Contact and Privacy. Do not rely only on
   GitHub private reporting for a commercial launch.
3. Decide and document a retention schedule and deletion-response target for
   account identity, feedback, activity events, hosting logs, and backups.
4. Confirm Cloudflare D1 location, log retention, processor terms, and any data
   processing agreement needed for the target markets.
5. Register the exact public Terms and Privacy URLs in Google, GitHub, and
   LinkedIn developer consoles. Request only the documented identity scopes.
6. Verify the deletion process end-to-end, including account rows, sessions,
   feedback ownership, activity events, backups, and provider authorization.
7. Add consent and policy-version records before materially expanding data use.
8. Run accessibility, security, and policy-link checks on every supported
   language route.
9. Review the closed-beta notice, cohort criteria, consent wording, and
   retention schedule with qualified counsel before recruiting participants.

## Product changes that require a policy update

- storing resumes, job descriptions, interview transcripts, or voice audio on
  the server;
- sending career evidence to a hosted AI model by default;
- analytics, advertising, cookies beyond essential sign-in, or geolocation;
- automatic profile import, employer sharing, job application automation, or
  employment-decision features;
- subscriptions, team accounts, enterprise workspaces, or payment processing;
- retention, subprocessors, legal operator, or contact-channel changes.
