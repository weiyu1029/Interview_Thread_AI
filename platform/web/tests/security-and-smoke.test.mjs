import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("proxy preserves discovery links and adds production security headers", async () => {
  const source = await readFile(new URL("../proxy.ts", import.meta.url), "utf8");

  assert.match(source, /AGENT_DISCOVERY_LINKS/);
  assert.match(source, /headers\.append\("Link", AGENT_DISCOVERY_LINKS\)/);
  assert.match(source, /X-Content-Type-Options["']:\s*["']nosniff/i);
  assert.match(source, /Content-Security-Policy/);
  assert.match(source, /object-src 'none'; base-uri 'self'; frame-ancestors 'none'/);
  assert.match(source, /Cross-Origin-Opener-Policy["']:\s*["']same-origin-allow-popups/i);
  assert.match(source, /Cross-Origin-Resource-Policy["']:\s*["']same-origin/i);
  assert.match(source, /Referrer-Policy["']:\s*["']strict-origin-when-cross-origin/i);
  assert.match(source, /X-Frame-Options["']:\s*["']DENY/i);
  assert.match(source, /Permissions-Policy/);
  assert.match(source, /microphone=\(self\)/);
  assert.match(source, /NODE_ENV\s*===\s*["']production["']/);
  assert.match(source, /Strict-Transport-Security/);
  assert.match(source, /max-age=31536000; includeSubDomains; preload/);
});

test("production smoke workflow runs every fifteen minutes without credentials", async () => {
  const workflow = await readFile(
    new URL("../../../.github/workflows/production-smoke.yml", import.meta.url),
    "utf8",
  );

  assert.match(workflow, /cron:\s*["']\*\/15 \* \* \* \*["']/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /https:\/\/interviewthreadai\.com/);
  assert.match(workflow, /\/api\/healthz/);
  assert.match(workflow, /\/en/);
  assert.match(workflow, /jq --exit-status/);
  assert.match(workflow, /no-store/);
  assert.doesNotMatch(workflow, /secrets\.|token:|authorization:/i);
});
