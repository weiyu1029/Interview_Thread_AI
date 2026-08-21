import { NextResponse } from "next/server";

export const AGENT_DISCOVERY_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json;version=3.1"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</auth.md>; rel="service-doc"; type="text/markdown"',
].join(", ");

export function proxy() {
  const response = NextResponse.next();
  response.headers.append("Link", AGENT_DISCOVERY_LINKS);
  return response;
}

export const config = {
  matcher: ["/", "/:path*"],
};
