import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  readJsonBody,
  readMultipartBody,
  validateJsonRequest,
} from "../app/api/request-security.ts";

const SITE_ORIGIN = "https://interviewthreadai.com";
const ROUTES = ["activity", "feedback", "beta", "contact"];

function guardedRequest(headers = {}) {
  return new Request(`${SITE_ORIGIN}/api/write`, {
    method: "POST",
    headers,
    body: "{}",
  });
}

test("JSON request guard requires an explicit same-origin request", () => {
  const missingOrigin = validateJsonRequest(
    guardedRequest({ "content-type": "application/json" }),
    4 * 1024,
  );
  assert.equal(missingOrigin.ok, false);
  assert.equal(missingOrigin.status, 403);

  const crossOrigin = validateJsonRequest(
    guardedRequest({
      "content-type": "application/json",
      origin: "https://attacker.example",
    }),
    4 * 1024,
  );
  assert.equal(crossOrigin.ok, false);
  assert.equal(crossOrigin.status, 403);
});

test("JSON request guard accepts only the application/json media type", () => {
  const wrongMediaType = validateJsonRequest(
    guardedRequest({
      "content-type": "text/plain; application/json",
      origin: SITE_ORIGIN,
    }),
    4 * 1024,
  );
  assert.equal(wrongMediaType.ok, false);
  assert.equal(wrongMediaType.status, 415);

  assert.deepEqual(
    validateJsonRequest(
      guardedRequest({
        "content-type": "application/json; charset=utf-8",
        origin: SITE_ORIGIN,
      }),
      4 * 1024,
    ),
    { ok: true },
  );
});

test("JSON request guard rejects an oversized declared body", () => {
  const oversized = validateJsonRequest(
    guardedRequest({
      "content-type": "application/json",
      "content-length": String(64 * 1024),
      origin: SITE_ORIGIN,
    }),
    32 * 1024,
  );
  assert.equal(oversized.ok, false);
  assert.equal(oversized.status, 413);
});

test("bounded JSON reader rejects oversized actual bodies without Content-Length", async () => {
  const request = new Request(`${SITE_ORIGIN}/api/write`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: SITE_ORIGIN,
    },
    body: JSON.stringify({ message: "a".repeat(4 * 1024) }),
  });
  const result = await readJsonBody(request, 1024);
  assert.equal(result.ok, false);
  assert.equal(result.status, 413);
});

test("bounded multipart reader rejects oversized actual bodies without Content-Length", async () => {
  const request = new Request(`${SITE_ORIGIN}/api/transcribe`, {
    method: "POST",
    headers: {
      "content-type": "multipart/form-data; boundary=interviewthread-test",
      origin: SITE_ORIGIN,
    },
    body: new Uint8Array(4 * 1024),
  });
  assert.equal(request.headers.get("content-length"), null);
  const result = await readMultipartBody(request, 1024);
  assert.equal(result.ok, false);
  assert.equal(result.status, 413);
});

test("bounded JSON reader maps malformed JSON to a client error", async () => {
  const request = new Request(`${SITE_ORIGIN}/api/write`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: SITE_ORIGIN,
    },
    body: "{not-json",
  });
  const result = await readJsonBody(request, 1024);
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test("all JSON write routes guard headers and bound actual bytes before parsing", async () => {
  for (const route of ROUTES) {
    const source = await readFile(
      new URL(`../app/api/${route}/route.ts`, import.meta.url),
      "utf8",
    );
    const postStart = source.indexOf("export async function POST");
    const guard = source.indexOf("validateJsonRequest(request", postStart);
    const boundedRead = source.indexOf("readJsonBody<", postStart);
    const auth = source.indexOf("getAppUser()", postStart);

    assert.ok(postStart >= 0, `${route}: POST handler`);
    assert.ok(guard > postStart, `${route}: shared guard`);
    assert.ok(boundedRead > guard, `${route}: bounded JSON reader`);
    if (auth >= 0)
      assert.ok(auth > guard, `${route}: guard must run before authentication`);
    assert.equal(
      source.indexOf("request.json()", postStart),
      -1,
      `${route}: unbounded request.json must not be used`,
    );
  }
});
