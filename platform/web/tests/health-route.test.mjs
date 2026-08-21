import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { runHealthCheck } from "../app/health.ts";

test("healthz checks D1 and returns a minimal non-cacheable response", async () => {
  let query = "";
  const logs = [];
  const response = await runHealthCheck(
    {
      prepare(statement) {
        query = statement;
        return { first: async () => ({ ok: 1 }) };
      },
    },
    (entry) => logs.push(entry),
  );

  assert.equal(response.status, 200);
  assert.equal(query, "SELECT 1 AS ok");
  assert.match(response.headers.get("cache-control") || "", /no-store/i);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(
    response.headers.get("x-request-id") || "",
    /^[0-9a-f-]{36}$/i,
  );
  assert.deepEqual(await response.json(), { status: "ok" });
  assert.equal(logs.length, 1);
  assert.deepEqual(
    {
      ...JSON.parse(logs[0]),
      requestId: "[uuid]",
      durationMs: "[bounded]",
    },
    {
      requestId: "[uuid]",
      route: "api_healthz",
      outcome: "ok",
      status: 200,
      durationMs: "[bounded]",
      provider: "d1",
      release: "2026.08-beta.1",
    },
  );
});

test("healthz fails closed without exposing provider or secret details", async () => {
  const logs = [];
  const response = await runHealthCheck(
    {
      prepare() {
        return {
          first: async () => {
            throw new Error(
              "D1 provider failed with AZURE_SPEECH_KEY=private and RESEND_API_KEY=private",
            );
          },
        };
      },
    },
    (entry) => logs.push(entry),
  );

  assert.equal(response.status, 503);
  assert.match(response.headers.get("cache-control") || "", /no-store/i);
  const body = await response.text();
  assert.deepEqual(JSON.parse(body), { status: "unavailable" });
  assert.doesNotMatch(body, /D1|provider|AZURE|RESEND|secret|private/i);
  assert.doesNotMatch(logs.join("\n"), /AZURE|RESEND|secret|private/i);
  assert.equal(JSON.parse(logs[0]).outcome, "unavailable");
});

test("healthz returns 503 when the D1 binding is unavailable", async () => {
  const response = await runHealthCheck(undefined, () => {});

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: "unavailable" });
});

test("health route resolves its Cloudflare binding lazily", async () => {
  const source = await readFile(
    new URL("../app/api/healthz/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /await import\(["']cloudflare:workers["']\)/);
  assert.doesNotMatch(source, /^import\s+.*from\s+["']cloudflare:workers["']/m);
  assert.match(source, /runHealthCheck\(env\.DB\)/);
});
