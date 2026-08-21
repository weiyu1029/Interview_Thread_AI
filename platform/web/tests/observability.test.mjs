import assert from "node:assert/strict";
import test from "node:test";

import {
  OBSERVABILITY_KEYS,
  createRequestId,
  elapsedMilliseconds,
  logObservability,
  sanitizeObservabilityEvent,
} from "../app/observability.ts";

test("observability accepts only bounded allowlisted fields", () => {
  const requestId = createRequestId();
  const event = sanitizeObservabilityEvent({
    requestId,
    route: "api_healthz",
    outcome: "ok",
    status: 200,
    durationMs: 12.6,
    provider: "d1",
    release: "2026.08-beta.1",
    body: "resume: private career evidence",
    query: "code=oauth-secret&state=private",
    headers: { authorization: "Bearer secret" },
    ip: "192.0.2.1",
    userAgent: "private browser fingerprint",
    email: "candidate@example.com",
    audio: new Uint8Array([1, 2, 3]),
    transcript: "private interview answer",
    error: new Error("provider returned private content"),
  });

  assert.deepEqual(Object.keys(event), OBSERVABILITY_KEYS);
  assert.equal(event.requestId, requestId);
  assert.equal(event.durationMs, 13);
  const serialized = JSON.stringify(event);
  assert.doesNotMatch(
    serialized,
    /resume|oauth-secret|authorization|192\.0\.2\.1|fingerprint|candidate@|interview answer|private content/i,
  );
});

test("observability rejects unsafe values and never forwards extra keys to its sink", () => {
  const entries = [];
  const event = logObservability(
    {
      requestId: "candidate@example.com",
      route: "/api/healthz?token=secret",
      outcome: "private provider detail",
      status: 999,
      durationMs: Number.POSITIVE_INFINITY,
      provider: "https://provider.example/private",
      release: "release with spaces and a secret",
      transcript: "do not log this",
    },
    (entry) => entries.push(entry),
  );

  assert.deepEqual(event, {});
  assert.deepEqual(entries, ["{}"]);
});

test("observability bounds duration and produces UUID request IDs", () => {
  const requestId = createRequestId();
  assert.match(
    requestId,
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
  assert.equal(
    sanitizeObservabilityEvent({ durationMs: 999_999_999 }).durationMs,
    600_000,
  );
  assert.ok(elapsedMilliseconds(Date.now() - 5) >= 0);
});
