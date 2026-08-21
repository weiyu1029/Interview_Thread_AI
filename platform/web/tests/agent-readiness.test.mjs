import assert from "node:assert/strict";
import test from "node:test";

import { GET as getCatalog, HEAD as headCatalog } from "../app/.well-known/api-catalog/route.ts";
import { GET as getAuthDocument } from "../app/auth.md/route.ts";
import { GET as getOpenApi } from "../app/openapi.json/route.ts";

test("API catalog follows the RFC 9727 discovery shape", async () => {
  const response = getCatalog();
  const payload = await response.json();

  assert.match(response.headers.get("content-type") || "", /application\/linkset\+json/);
  assert.match(response.headers.get("content-type") || "", /rfc9727/);
  assert.match(response.headers.get("link") || "", /rel="api-catalog"/);
  assert.equal(Array.isArray(payload.linkset), true);
  assert.equal(payload.linkset[0].anchor, "https://interviewthreadai.com");
  assert.equal(payload.linkset[0]["service-desc"][0].href, "https://interviewthreadai.com/openapi.json");
  assert.equal(payload.linkset[0].item.length, 2);

  const head = headCatalog();
  assert.equal(head.status, 200);
  assert.match(head.headers.get("link") || "", /rel="api-catalog"/);
});

test("OpenAPI document publishes only the intended read-only public endpoints", async () => {
  const response = getOpenApi();
  const payload = await response.json();

  assert.equal(payload.openapi, "3.1.0");
  assert.deepEqual(Object.keys(payload.paths).sort(), ["/api/jobs", "/api/region"]);
  assert.ok(payload.paths["/api/jobs"].get);
  assert.equal(payload.paths["/api/jobs"].post, undefined);
  assert.equal(payload.paths["/api/region"].get.operationId, "getRequestRegion");
});

test("auth.md is explicit about supported and unsupported access", async () => {
  const response = getAuthDocument();
  const body = await response.text();

  assert.match(response.headers.get("content-type") || "", /text\/markdown/);
  assert.match(body, /Google, GitHub, and LinkedIn/);
  assert.match(body, /does not currently issue public API keys/i);
  assert.match(body, /must not attempt to reuse a person's browser cookie/i);
  assert.match(body, /Privacy policy/);
});

test("site headers advertise machine-readable discovery resources", async () => {
  const source = await import("node:fs/promises").then((fs) =>
    fs.readFile(new URL("../proxy.ts", import.meta.url), "utf8"),
  );
  assert.match(source, /rel="api-catalog"/);
  assert.match(source, /rel="service-desc"/);
  assert.match(source, /rel="service-doc"/);
  assert.match(source, /rel="describedby"/);
});
