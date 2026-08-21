import { NextResponse } from "next/server";

export const AGENT_DISCOVERY_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json;version=3.1"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</auth.md>; rel="service-doc"; type="text/markdown"',
].join(", ");

export const SECURITY_HEADERS = {
  "Content-Security-Policy":
    "object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": [
    "accelerometer=()",
    "browsing-topics=()",
    "camera=()",
    "geolocation=()",
    "gyroscope=()",
    "magnetometer=()",
    "microphone=(self)",
    "payment=()",
    "usb=()",
  ].join(", "),
} as const;

export const PRODUCTION_HSTS =
  "max-age=31536000; includeSubDomains; preload";

export function proxy() {
  const response = NextResponse.next();
  response.headers.append("Link", AGENT_DISCOVERY_LINKS);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", PRODUCTION_HSTS);
  }
  return response;
}

export const config = {
  matcher: ["/", "/:path*"],
};
