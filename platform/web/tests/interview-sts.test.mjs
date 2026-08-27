import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  ELEVENLABS_STS_MODEL_ID,
  STS_CONSENT_VERSION,
  STS_MAX_AUDIO_BYTES,
  STS_MAX_OUTPUT_BYTES,
  buildElevenLabsSpeechToSpeechRequest,
} from "../app/interview-sts.ts";

const SITE_ORIGIN = "https://interviewthread.example";
const TEST_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
let builtWorkerPromise;

function testAudio({ size = 32, validSignature = true, type = "audio/webm" } = {}) {
  if (size === 0) return new Blob([], { type });
  const bytes = new Uint8Array(size);
  if (validSignature) bytes.set([0x1a, 0x45, 0xdf, 0xa3].slice(0, size));
  return new Blob([bytes], { type });
}

function transformationForm({
  size = 32,
  validSignature = true,
  type = "audio/webm",
  consentVersion = STS_CONSENT_VERSION,
} = {}) {
  const form = new FormData();
  form.append("audio", testAudio({ size, validSignature, type }), "interview-answer");
  if (consentVersion !== null) form.append("consent_version", consentVersion);
  return form;
}

async function builtWorker() {
  builtWorkerPromise ??= (async () => {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("interview-sts", `${process.pid}-${Date.now()}-${Math.random()}`);
    return (await import(workerUrl.href)).default;
  })();
  return builtWorkerPromise;
}

async function requestBuiltTransformation({
  form = transformationForm(),
  origin = SITE_ORIGIN,
  authenticated = true,
  userId = `sts-test-${crypto.randomUUID()}`,
  extraHeaders = {},
} = {}) {
  const headers = new Headers({ host: "interviewthread.example", ...extraHeaders });
  if (origin) headers.set("origin", origin);
  if (authenticated) {
    headers.set("oai-authenticated-user-id", userId);
    headers.set("oai-authenticated-user-email", `${userId}@example.com`);
  }
  const worker = await builtWorker();
  return worker.fetch(
    new Request(`${SITE_ORIGIN}/api/speech-to-speech`, {
      method: "POST",
      headers,
      body: form,
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function snapshotEnvironment() {
  return {
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    ELEVENLABS_STS_ENABLED: process.env.ELEVENLABS_STS_ENABLED,
    ELEVENLABS_STS_VOICE_ID: process.env.ELEVENLABS_STS_VOICE_ID,
    ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
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
  process.env.ELEVENLABS_STS_ENABLED = "true";
  process.env.ELEVENLABS_API_KEY = "route-elevenlabs-secret";
  process.env.ELEVENLABS_STS_VOICE_ID = TEST_VOICE_ID;
  delete process.env.ELEVENLABS_VOICE_ID;
  delete process.env.ELEVENLABS_ZERO_RETENTION;
}

test("builds a bounded fixed-host ElevenLabs speech-to-speech request", () => {
  assert.equal(ELEVENLABS_STS_MODEL_ID, "eleven_multilingual_sts_v2");
  const built = buildElevenLabsSpeechToSpeechRequest({
    audio: testAudio(),
    apiKey: "unit-test-elevenlabs-key",
    voiceId: TEST_VOICE_ID,
  });
  assert.equal(
    built.url,
    `https://api.elevenlabs.io/v1/speech-to-speech/${TEST_VOICE_ID}/stream?output_format=mp3_44100_128`,
  );
  assert.doesNotMatch(built.url, /unit-test-elevenlabs-key/);
  assert.equal(built.init.method, "POST");
  const headers = new Headers(built.init.headers);
  assert.equal(headers.get("accept"), "audio/mpeg");
  assert.equal(headers.get("xi-api-key"), "unit-test-elevenlabs-key");
  assert.ok(built.init.body instanceof FormData);
  assert.equal(built.init.body.get("model_id"), ELEVENLABS_STS_MODEL_ID);
  assert.equal(built.init.body.get("remove_background_noise"), "false");
  assert.equal(built.init.body.get("file_format"), "other");
  assert.ok(built.init.body.get("audio") instanceof Blob);

  const zeroRetention = buildElevenLabsSpeechToSpeechRequest({
    audio: testAudio(),
    apiKey: "unit-test-elevenlabs-key",
    voiceId: TEST_VOICE_ID,
    zeroRetention: true,
  });
  assert.equal(new URL(zeroRetention.url).searchParams.get("enable_logging"), "false");

  for (const invalid of [
    { audio: testAudio({ size: 0 }), apiKey: "key", voiceId: TEST_VOICE_ID },
    { audio: testAudio({ size: STS_MAX_AUDIO_BYTES + 1 }), apiKey: "key", voiceId: TEST_VOICE_ID },
    { audio: testAudio({ type: "application/octet-stream" }), apiKey: "key", voiceId: TEST_VOICE_ID },
    { audio: testAudio(), apiKey: "", voiceId: TEST_VOICE_ID },
    { audio: testAudio(), apiKey: "key", voiceId: "../unsafe" },
  ]) {
    assert.throws(() => buildElevenLabsSpeechToSpeechRequest(invalid));
  }
});

test("speech-to-speech route declares authentication, consent, signature, quota, and bounded output", async () => {
  const route = await readFile(
    new URL("../app/api/speech-to-speech/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /hasSameOrigin\(request\)/);
  assert.match(route, /getAppUser\(\)/);
  assert.match(route, /readMultipartBody\(request, MAX_MULTIPART_BYTES\)/);
  assert.match(route, /consentVersion\s*!==\s*STS_CONSENT_VERSION/);
  assert.match(route, /hasSupportedInterviewAudioSignature\(audio\)/);
  assert.match(route, /ELEVENLABS_STS_ENABLED/);
  assert.match(route, /consumeGlobalSpeechAudioQuota/);
  assert.match(route, /total\s*>\s*STS_MAX_OUTPUT_BYTES/);
  assert.match(route, /Content-Type":\s*"audio\/mpeg"/);
  assert.match(route, /private, no-store/);
  assert.doesNotMatch(route, /console\.(?:log|info|debug)\s*\(/);
});

test("built speech-to-speech route fails closed before provider contact", async (t) => {
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
    [await requestBuiltTransformation({ origin: "https://attacker.example" }), 403, "invalid_origin"],
    [await requestBuiltTransformation({ authenticated: false }), 401, "sign_in_required"],
    [await requestBuiltTransformation({ form: transformationForm({ validSignature: false }) }), 400, "invalid_request"],
    [await requestBuiltTransformation({ form: transformationForm({ consentVersion: null }) }), 400, "invalid_request"],
    [await requestBuiltTransformation({ form: transformationForm({ consentVersion: "voice-transform-v0" }) }), 400, "invalid_request"],
    [await requestBuiltTransformation({ extraHeaders: { "content-length": String(STS_MAX_AUDIO_BYTES + 300_000) } }), 413, "payload_too_large"],
  ];
  for (const [response, status, error] of cases) {
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { error });
    assert.match(response.headers.get("cache-control") ?? "", /private.*no-store/i);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  }
  assert.equal(providerCalls, 0);
});

test("built speech-to-speech route returns private bounded audio without exposing credentials", async (t) => {
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

  const response = await requestBuiltTransformation();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "audio/mpeg");
  assert.match(response.headers.get("cache-control") ?? "", /private.*no-store/i);
  assert.equal(response.headers.get("x-interviewthread-speech-model"), ELEVENLABS_STS_MODEL_ID);
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [0x49, 0x44, 0x33, 4, 0, 0, 0]);
  assert.equal(
    upstream.input,
    `https://api.elevenlabs.io/v1/speech-to-speech/${TEST_VOICE_ID}/stream?output_format=mp3_44100_128`,
  );
  assert.equal(new Headers(upstream.init.headers).get("xi-api-key"), "route-elevenlabs-secret");
  assert.equal(upstream.init.body.get("model_id"), ELEVENLABS_STS_MODEL_ID);
  assert.doesNotMatch(JSON.stringify([...response.headers]), /route-elevenlabs-secret/);
});

test("built speech-to-speech route rejects disabled, invalid, and oversized provider responses", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = snapshotEnvironment();
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });
  configureProvider();

  delete process.env.ELEVENLABS_STS_ENABLED;
  let providerCalled = false;
  globalThis.fetch = async () => {
    providerCalled = true;
    return new Response();
  };
  const disabled = await requestBuiltTransformation();
  assert.equal(disabled.status, 503);
  assert.deepEqual(await disabled.json(), { error: "voice_transform_unavailable" });
  assert.equal(providerCalled, false);

  process.env.ELEVENLABS_STS_ENABLED = "true";
  globalThis.fetch = async () => new Response("not audio", {
    headers: { "content-type": "text/plain" },
  });
  const invalidType = await requestBuiltTransformation();
  assert.equal(invalidType.status, 502);
  assert.deepEqual(await invalidType.json(), { error: "voice_transform_unavailable" });

  globalThis.fetch = async () => new Response(new Uint8Array(STS_MAX_OUTPUT_BYTES + 1), {
    headers: { "content-type": "audio/mpeg" },
  });
  const oversized = await requestBuiltTransformation();
  assert.equal(oversized.status, 502);
  assert.deepEqual(await oversized.json(), { error: "voice_transform_unavailable" });

  globalThis.fetch = async () => new Response("rate limited", { status: 429 });
  const rateLimited = await requestBuiltTransformation();
  assert.equal(rateLimited.status, 429);
  assert.deepEqual(await rateLimited.json(), { error: "voice_transform_rate_limited" });
});
