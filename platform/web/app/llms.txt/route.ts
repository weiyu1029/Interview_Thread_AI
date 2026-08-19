const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://careerstorymap.com";

export function GET() {
  const body = `# CareerStoryMap

> Map your evidence. Own your story.

CareerStoryMap is an open-source, evidence-grounded career intelligence platform. It helps people compare resume evidence with job descriptions, find stronger-fit roles from approved employer sources, understand market movement, prepare credible career stories, and track applications.

## Primary pages
- Product: ${siteUrl}/en/#product
- Workspace: ${siteUrl}/en/#workspace
- Free and open-source access: ${siteUrl}/en/#plans
- Resume and job-description matching: ${siteUrl}/en/resume-job-description-match
- Career story builder: ${siteUrl}/en/career-story-builder
- AI mock interview: ${siteUrl}/en/ai-mock-interview
- Resume keyword analyzer: ${siteUrl}/en/resume-keyword-analyzer
- Job match recommendations: ${siteUrl}/en/job-match-recommendations
- Career market insights: ${siteUrl}/en/career-market-insights
- Source code: https://github.com/weiyu1029/careerproof-agent

## Language editions
Every public page has an indexable, canonical language URL and reciprocal hreflang annotations. Supported URL prefixes are:
/en, /ja, /ko, /zh-cn, /zh-tw, /es, /fr, /de, /pt-br, /it, /nl, /pl, /tr, /ru, /uk, /ar, /he, /hi, /bn, /ur, /id, /ms, /th, /vi, /fil, /sv, /no, /da, /fi, /cs, /sk, /hu, /ro, /el, /bg, /hr, /sr, /sl, /sw, and /fa.

## Core capabilities
- Resume and job-description keyword evidence analysis
- Global job recommendations with visible source provenance
- Proof-to-Role Radar alerts based on evidence, must-have coverage, and quantified outcome strength
- One-click or automatic tracking of proof-qualified roles with the best defensible story attached
- Geographic and role-based market insight
- 40-language interface
- Manual, hybrid, and governed automatic application modes
- Public feedback for everyone through one equal community queue

## Access
- Every public feature is free and open source
- There are no paid tiers, billing flows, or priority support levels
- Accounts may be used for identity and future cross-device persistence, not payment

## Data policy
CareerStoryMap uses official employer ATS endpoints, licensed providers, and user-supplied documents. It does not scrape restricted job boards or claim unsupported real-time coverage.
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
