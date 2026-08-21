const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://interviewthreadai.com";

export function GET() {
  const body = `# InterviewThread

> Find the thread. Own the interview.

InterviewThread is a free, open-source AI mock interview product. Upload a real resume and job description to get truthful stories, realistic questions, and role-specific feedback without invented achievements.

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
- Source code: https://github.com/weiyu1029/Interview_Thread_AI

## Language editions
Every public page has an indexable, canonical language URL and reciprocal hreflang annotations. Supported URL prefixes are:
/en, /ja, /ko, /zh-cn, /zh-tw, /es, /fr, /de, /pt-br, /it, /nl, /pl, /tr, /ru, /uk, /ar, /he, /hi, /bn, /ur, /id, /ms, /th, /vi, /fil, /sv, /no, /da, /fi, /cs, /sk, /hu, /ro, /el, /bg, /hr, /sr, /sl, /sw, and /fa.

## Core capabilities
- Three strongest role-match proofs linked to source evidence
- Three real evidence or capability gaps
- Three to five defensible interview stories
- Ten likely role-specific follow-up questions
- One focused 30-minute interview preparation plan
- Evidence-grounded voice and text mock interviews

## Secondary workspace tools
- Global job recommendations with visible source provenance
- Geographic and role-based market insight
- Application tracking, model selection, and public feedback
- Localized public pages and interface support

## Access
- Every public feature is free and open source
- There are no paid tiers, billing flows, or priority support levels
- Accounts may be used for identity and future cross-device persistence, not payment

## Data policy
InterviewThread uses official employer ATS endpoints, licensed providers, and user-supplied documents. It does not scrape restricted job boards or claim unsupported real-time coverage.
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
