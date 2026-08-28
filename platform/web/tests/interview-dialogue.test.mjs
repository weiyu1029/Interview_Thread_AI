import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  DIALOGUE_CONSENT_VERSION,
  DIALOGUE_MAX_CHARACTERS,
  DIALOGUE_MAX_OUTPUT_BYTES,
  ELEVENLABS_DIALOGUE_FALLBACK_MODEL_ID,
  ELEVENLABS_DIALOGUE_MODEL_ID,
  buildElevenLabsDialogueRequest,
} from "../app/interview-dialogue.ts";

const SITE_ORIGIN = "https://interviewthread.example";
const TEST_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
let builtWorkerPromise;

async function builtWorker() {
  builtWorkerPromise ??= (async () => {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set(
      "interview-dialogue",
      `${process.pid}-${Date.now()}-${Math.random()}`,
    );
    return (await import(workerUrl.href)).default;
  })();
  return builtWorkerPromise;
}

async function requestBuiltDialogue({
  payload = {
    locale: "en",
    text: "Tell me about a decision you made with incomplete information.",
    consent_version: DIALOGUE_CONSENT_VERSION,
  },
  origin = SITE_ORIGIN,
  authenticated = true,
  userId = `dialogue-test-${crypto.randomUUID()}`,
  contentType = "application/json",
  extraHeaders = {},
} = {}) {
  const headers = new Headers({
    "content-type": contentType,
    host: "interviewthread.example",
    ...extraHeaders,
  });
  if (origin) headers.set("origin", origin);
  if (authenticated) {
    headers.set("oai-authenticated-user-id", userId);
    headers.set("oai-authenticated-user-email", `${userId}@example.com`);
  }
  const worker = await builtWorker();
  return worker.fetch(
    new Request(`${SITE_ORIGIN}/api/interview-dialogue`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function snapshotEnvironment() {
  return {
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    ELEVENLABS_DIALOGUE_ENABLED: process.env.ELEVENLABS_DIALOGUE_ENABLED,
    ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
    ELEVENLABS_VOICE_IDS_JSON: process.env.ELEVENLABS_VOICE_IDS_JSON,
    ELEVENLABS_ZERO_RETENTION: process.env.ELEVENLABS_ZERO_RETENTION,
  };
}

function restoreEnvironment(previous) {
  for (const [name, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
}

function configureProvider() {
  process.env.ELEVENLABS_DIALOGUE_ENABLED = "true";
  process.env.ELEVENLABS_API_KEY = "route-elevenlabs-secret";
  process.env.ELEVENLABS_VOICE_ID = TEST_VOICE_ID;
  delete process.env.ELEVENLABS_VOICE_IDS_JSON;
  delete process.env.ELEVENLABS_ZERO_RETENTION;
}

test("builds fixed-host ElevenLabs v3 conversational dialogue requests", () => {
  assert.equal(ELEVENLABS_DIALOGUE_MODEL_ID, "eleven_v3_conversational");
  assert.equal(ELEVENLABS_DIALOGUE_FALLBACK_MODEL_ID, "eleven_v3");
  const request = buildElevenLabsDialogueRequest({
    text: "Explain your strongest SQL example.",
    locale: "en",
    apiKey: "unit-test-key",
    voiceId: TEST_VOICE_ID,
  });
  assert.equal(
    request.url,
    "https://api.elevenlabs.io/v1/text-to-dialogue/stream?output_format=mp3_44100_128",
  );
  assert.equal(request.init.method, "POST");
  const headers = new Headers(request.init.headers);
  assert.equal(headers.get("accept"), "audio/mpeg");
  assert.equal(headers.get("content-type"), "application/json");
  assert.equal(headers.get("xi-api-key"), "unit-test-key");
  assert.doesNotMatch(request.url, /unit-test-key/);
  const body = JSON.parse(request.init.body);
  assert.deepEqual(body.inputs, [
    { text: "Explain your strongest S Q L example.", voice_id: TEST_VOICE_ID },
  ]);
  assert.equal(body.model_id, ELEVENLABS_DIALOGUE_MODEL_ID);
  assert.equal(body.language_code, "en");
  assert.equal(body.apply_text_normalization, "auto");

  const fallback = buildElevenLabsDialogueRequest({
    text: "Why this role?",
    locale: "en",
    apiKey: "unit-test-key",
    voiceId: TEST_VOICE_ID,
    model: ELEVENLABS_DIALOGUE_FALLBACK_MODEL_ID,
    zeroRetention: true,
  });
  assert.equal(new URL(fallback.url).searchParams.get("enable_logging"), "false");
  assert.equal(JSON.parse(fallback.init.body).model_id, "eleven_v3");

  for (const invalid of [
    { text: "", locale: "en", apiKey: "key", voiceId: TEST_VOICE_ID },
    { text: "a".repeat(DIALOGUE_MAX_CHARACTERS + 1), locale: "en", apiKey: "key", voiceId: TEST_VOICE_ID },
    { text: "hello", locale: "en", apiKey: "", voiceId: TEST_VOICE_ID },
    { text: "hello", locale: "en", apiKey: "key", voiceId: "../unsafe" },
    { text: "hello", locale: "en", apiKey: "key", voiceId: TEST_VOICE_ID, model: "unsafe-model" },
  ]) {
    assert.throws(() => buildElevenLabsDialogueRequest(invalid));
  }
});

test("dialogue route declares feature gate, auth, consent, quota, and bounded private output", async () => {
  const route = await readFile(
    new URL("../app/api/interview-dialogue/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /hasSameOrigin\(request\)/);
  assert.match(route, /getAppUser\(\)/);
  assert.match(route, /consentVersion\s*!==\s*DIALOGUE_CONSENT_VERSION/);
  assert.match(route, /ELEVENLABS_DIALOGUE_ENABLED/);
  assert.match(route, /consumeGlobalSpeechQuota/);
  assert.match(route, /consumeGlobalSpeechCharacterQuota/);
  assert.match(route, /total\s*>\s*DIALOGUE_MAX_OUTPUT_BYTES/);
  assert.match(route, /private, no-store/);
  assert.match(route, /X-Content-Type-Options/);
  assert.doesNotMatch(route, /console\.(?:log|info|debug)\s*\(/);
});

test("built dialogue route fails closed before provider contact", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = snapshotEnvironment();
  let providerCalls = 0;
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });
  configureProvider();
  globalThis.fetch = async () => {
    providerCalls += 1;
    return new Response(Uint8Array.from([0x49, 0x44, 0x33]), {
      headers: { "content-type": "audio/mpeg" },
    });
  };

  const cases = [
    [await requestBuiltDialogue({ origin: "https://attacker.example" }), 403, "invalid_origin"],
    [await requestBuiltDialogue({ authenticated: false }), 401, "sign_in_required"],
    [await requestBuiltDialogue({ payload: { locale: "en", text: "Hello", consent_version: "old" } }), 400, "invalid_request"],
    [await requestBuiltDialogue({ payload: { locale: "en", text: "Hello" } }), 400, "invalid_request"],
    [await requestBuiltDialogue({ contentType: "text/plain" }), 415, "invalid_request"],
    [await requestBuiltDialogue({ extraHeaders: { "content-length": "20000" } }), 413, "payload_too_large"],
  ];
  for (const [response, status, error] of cases) {
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { error });
    assert.match(response.headers.get("cache-control") ?? "", /private.*no-store/i);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  }
  assert.equal(providerCalls, 0);

  delete process.env.ELEVENLABS_DIALOGUE_ENABLED;
  const disabled = await requestBuiltDialogue();
  assert.equal(disabled.status, 503);
  assert.deepEqual(await disabled.json(), { error: "dialogue_unavailable" });
  assert.equal(providerCalls, 0);
});

test("built dialogue route returns conversational audio with safe response metadata", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = snapshotEnvironment();
  let upstream;
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });
  configureProvider();
  globalThis.fetch = async (input, init) => {
    upstream = { input: String(input), init };
    return new Response(Uint8Array.from([0x49, 0x44, 0x33, 4, 0, 0, 0]), {
      headers: { "content-type": "audio/mpeg" },
    });
  };

  const response = await requestBuiltDialogue();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "audio/mpeg");
  assert.match(response.headers.get("cache-control") ?? "", /private.*no-store/i);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(
    response.headers.get("x-interviewthread-speech-model"),
    ELEVENLABS_DIALOGUE_MODEL_ID,
  );
  assert.equal(response.headers.get("x-interviewthread-speech-fallback"), "none");
  assert.match(
    response.headers.get("x-interviewthread-voice-profile") ?? "",
    /^itvp\d+-\d{2}-b$/,
  );
  assert.notEqual(
    response.headers.get("x-interviewthread-voice-profile"),
    TEST_VOICE_ID,
  );
  assert.equal(
    upstream.input,
    "https://api.elevenlabs.io/v1/text-to-dialogue/stream?output_format=mp3_44100_128",
  );
  assert.equal(new Headers(upstream.init.headers).get("xi-api-key"), "route-elevenlabs-secret");
  const providerBody = JSON.parse(upstream.init.body);
  assert.equal(providerBody.model_id, ELEVENLABS_DIALOGUE_MODEL_ID);
  assert.equal(providerBody.inputs[0].voice_id, TEST_VOICE_ID);
  assert.doesNotMatch(JSON.stringify([...response.headers]), /route-elevenlabs-secret/);
});

test("dialogue route falls back to standard v3 and bounds provider audio", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = snapshotEnvironment();
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });
  configureProvider();
  let providerCalls = 0;
  globalThis.fetch = async (_input, init) => {
    providerCalls += 1;
    const model = JSON.parse(init.body).model_id;
    if (model === ELEVENLABS_DIALOGUE_MODEL_ID)
      return new Response("conversational unavailable", { status: 503 });
    return new Response(Uint8Array.from([0x49, 0x44, 0x33, 4]), {
      headers: { "content-type": "audio/mpeg" },
    });
  };
  const fallback = await requestBuiltDialogue();
  assert.equal(fallback.status, 200);
  assert.equal(providerCalls, 2);
  assert.equal(
    fallback.headers.get("x-interviewthread-speech-model"),
    ELEVENLABS_DIALOGUE_FALLBACK_MODEL_ID,
  );
  assert.equal(
    fallback.headers.get("x-interviewthread-speech-fallback"),
    ELEVENLABS_DIALOGUE_FALLBACK_MODEL_ID,
  );

  globalThis.fetch = async () =>
    new Response(new Uint8Array(DIALOGUE_MAX_OUTPUT_BYTES + 1), {
      headers: { "content-type": "audio/mpeg" },
    });
  const oversized = await requestBuiltDialogue();
  assert.equal(oversized.status, 503);
  assert.deepEqual(await oversized.json(), { error: "dialogue_unavailable" });

  globalThis.fetch = async () =>
    new Response("not audio", { headers: { "content-type": "text/plain" } });
  const invalidType = await requestBuiltDialogue();
  assert.equal(invalidType.status, 503);
  assert.deepEqual(await invalidType.json(), { error: "dialogue_unavailable" });
});
