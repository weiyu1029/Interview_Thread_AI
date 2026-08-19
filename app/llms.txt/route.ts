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
- Proof-to-Role Radar alerts based on evidence, must-have coverage, and quantified outcome strength
- One-click or automatic tracking of proof-qualified roles with the best defensible story attached
- Geographic and role-based market insight
- 40-language interface
- Manual, hybrid, and governed automatic application modes
- Public feedback for every plan, with priority handling for Team and Enterprise

## Plans
- Community: free and open-source core
- Pro: US$15 per month or US$150 per year base price, with transparent regional currency options
- Team: US$35 per seat per month, or US$29 per seat per month billed annually, with a five-seat minimum
- Enterprise: custom annual agreement starting at US$15,000

## Data policy
Aptograph uses official employer ATS endpoints, licensed providers, and user-supplied documents. It does not scrape restricted job boards or claim unsupported real-time coverage.
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
