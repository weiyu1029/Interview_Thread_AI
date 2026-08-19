const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://careerproof-open-source.wy-alicechen.chatgpt.site";

export function GET() {
  const body = `# Aptograph

> Your evidence, mapped to what’s next.

Aptograph is an open-source, evidence-grounded career intelligence platform. It helps people compare resume evidence with job descriptions, find stronger-fit roles from approved employer sources, understand market movement, prepare credible career stories, and track applications.

## Primary pages
- Product: ${siteUrl}/#product
- Workspace: ${siteUrl}/#workspace
- Plans: ${siteUrl}/#plans
- Source code: https://github.com/weiyu1029/careerproof-agent

## Core capabilities
- Resume and job-description keyword evidence analysis
- Global job recommendations with visible source provenance
- Geographic and role-based market insight
- 40-language interface
- Manual, hybrid, and governed automatic application modes

## Data policy
Aptograph uses official employer ATS endpoints, licensed providers, and user-supplied documents. It does not scrape restricted job boards or claim unsupported real-time coverage.
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
