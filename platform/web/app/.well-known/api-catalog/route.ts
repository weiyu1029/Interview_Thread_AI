const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://interviewthreadai.com";
const PROFILE = "https://www.rfc-editor.org/info/rfc9727";
const catalogLink = `</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`;

function catalog() {
  return {
    linkset: [
      {
        anchor: SITE_URL,
        item: [
          {
            href: `${SITE_URL}/api/jobs`,
            type: "application/json",
            title: "Approved employer job-board gateway",
          },
          {
            href: `${SITE_URL}/api/region`,
            type: "application/json",
            title: "Coarse request-region lookup",
          },
        ],
        "service-desc": [
          {
            href: `${SITE_URL}/openapi.json`,
            type: "application/vnd.oai.openapi+json;version=3.1",
          },
        ],
        "service-doc": [
          { href: `${SITE_URL}/llms.txt`, type: "text/plain" },
          { href: `${SITE_URL}/auth.md`, type: "text/markdown" },
        ],
        "service-meta": [
          {
            href: `${SITE_URL}/en/privacy`,
            type: "text/html",
            title: "Privacy policy",
          },
          {
            href: `${SITE_URL}/en/terms`,
            type: "text/html",
            title: "Terms of service",
          },
        ],
      },
    ],
  };
}

const commonHeaders = {
  Link: catalogLink,
  "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
  "Access-Control-Allow-Origin": "*",
};

export function GET() {
  return new Response(JSON.stringify(catalog()), {
    headers: {
      ...commonHeaders,
      "Content-Type": `application/linkset+json; profile="${PROFILE}"`,
    },
  });
}

export function HEAD() {
  return new Response(null, { headers: commonHeaders });
}
