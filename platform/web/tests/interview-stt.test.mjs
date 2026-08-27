import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { LANGUAGES } from "../app/i18n.ts";
import {
  ELEVENLABS_STT_MODEL_ID,
  STT_API_VERSION,
  STT_CONSENT_VERSION,
  STT_MAX_AUDIO_BYTES,
  STT_MAX_VOCABULARY_TERM_CHARACTERS,
  STT_MAX_VOCABULARY_TERMS,
  azureSttLocaleFor,
  buildAzureTranscriptionRequest,
  buildElevenLabsTranscriptionRequest,
  elevenLabsSttLanguageFor,
  hasSupportedInterviewAudioSignature,
  isSttLocale,
  isSupportedInterviewAudioType,
  normalizeSttTranscript,
  sanitizeSpeechVocabulary,
  transcriptFromAzureResponse,
  transcriptFromElevenLabsResponse,
} from "../app/interview-stt.ts";

const LOCALES = LANGUAGES.map(([locale]) => locale);
const SITE_ORIGIN = "https://interviewthread.example";
let builtWorkerPromise;

function signatureFor(type) {
  const base = type.toLowerCase().split(";", 1)[0].trim();
  if (base === "audio/webm") return [0x1a, 0x45, 0xdf, 0xa3];
  if (base === "audio/ogg") return [0x4f, 0x67, 0x67, 0x53];
  if (base === "audio/mp4") return [0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70];
  if (base === "audio/mpeg") return [0x49, 0x44, 0x33, 4];
  if (base === "audio/wav" || base === "audio/x-wav")
    return [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45];
  return [];
}

function testAudio(type = "audio/webm;codecs=opus", size = 32, valid = true) {
  if (size === 0) return new Blob([], { type });
  const bytes = new Uint8Array(size);
  if (valid) bytes.set(signatureFor(type).slice(0, size));
  return new Blob([bytes], { type });
}

function formFromBuiltRequest(built) {
  assert.ok(built && typeof built === "object");
  assert.equal(built.init?.method, "POST");
  assert.ok(built.init?.body instanceof FormData);
  return built.init.body;
}

async function builtWorker() {
  builtWorkerPromise ??= (async () => {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("interview-stt", `${process.pid}-${Date.now()}-${Math.random()}`);
    return (await import(workerUrl.href)).default;
  })();
  return builtWorkerPromise;
}

function transcriptionForm({
  type = "audio/webm",
  size = 32,
  validSignature = true,
  locale = "en",
  vocabulary = ["SQL"],
  consentVersion = STT_CONSENT_VERSION,
} = {}) {
  const form = new FormData();
  form.append("audio", testAudio(type, size, validSignature), "interview-answer");
  form.append("locale", locale);
  form.append("vocabulary", JSON.stringify(vocabulary));
  if (consentVersion !== null) form.append("consent_version", consentVersion);
  return form;
}

async function requestBuiltTranscription({
  form = transcriptionForm(),
  origin = SITE_ORIGIN,
  authenticated = true,
  userId = `stt-test-${crypto.randomUUID()}`,
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
    new Request(`${SITE_ORIGIN}/api/transcribe`, {
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
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_ENDPOINT: process.env.AZURE_SPEECH_ENDPOINT,
  };
}

function restoreEnvironment(previous) {
  for (const [name, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
}

function configureBothProviders() {
  process.env.ELEVENLABS_API_KEY = "route-elevenlabs-secret";
  process.env.AZURE_SPEECH_KEY = "route-azure-secret";
  process.env.AZURE_SPEECH_ENDPOINT = "https://route-test.cognitiveservices.azure.com";
}

test("builds ElevenLabs-primary and Azure-fallback requests for all 40 locales", () => {
  assert.equal(LOCALES.length, 40);
  assert.equal(ELEVENLABS_STT_MODEL_ID, "scribe_v2");
  assert.equal(STT_API_VERSION, "2025-10-15");

  for (const locale of LOCALES) {
    assert.equal(isSttLocale(locale), true, `${locale} should be accepted`);
    const audio = testAudio();
    const elevenLabs = buildElevenLabsTranscriptionRequest({
      audio,
      locale,
      vocabulary: ["SQL", "Power BI", "TypeScript"],
      apiKey: "unit-test-elevenlabs-key",
    });
    assert.equal(elevenLabs.url, "https://api.elevenlabs.io/v1/speech-to-text");
    assert.doesNotMatch(elevenLabs.url, /unit-test-elevenlabs-key/);
    const elevenHeaders = new Headers(elevenLabs.init.headers);
    assert.equal(elevenHeaders.get("xi-api-key"), "unit-test-elevenlabs-key");
    assert.equal(elevenHeaders.get("accept"), "application/json");
    const elevenForm = formFromBuiltRequest(elevenLabs);
    assert.equal(elevenForm.get("model_id"), ELEVENLABS_STT_MODEL_ID);
    assert.equal(elevenForm.get("language_code"), elevenLabsSttLanguageFor(locale));
    assert.deepEqual(elevenForm.getAll("keyterms"), ["SQL", "Power BI", "TypeScript"]);
    assert.ok(elevenForm.get("file") instanceof Blob);

    const azure = buildAzureTranscriptionRequest({
      audio,
      locale,
      vocabulary: ["SQL", "Power BI", "TypeScript"],
      apiKey: "unit-test-azure-key",
      endpoint: "https://interviewthread-speech.cognitiveservices.azure.com/",
    });
    const url = new URL(azure.url);
    assert.equal(url.hostname, "interviewthread-speech.cognitiveservices.azure.com");
    assert.equal(url.pathname, "/speechtotext/transcriptions:transcribe");
    assert.equal(url.searchParams.get("api-version"), STT_API_VERSION);
    assert.doesNotMatch(url.toString(), /unit-test-azure-key/);
    const azureHeaders = new Headers(azure.init.headers);
    assert.equal(azureHeaders.get("ocp-apim-subscription-key"), "unit-test-azure-key");
    const definition = JSON.parse(String(formFromBuiltRequest(azure).get("definition")));
    assert.deepEqual(definition.locales, [azureSttLocaleFor(locale)]);
    assert.deepEqual(definition.phraseList.phrases, ["SQL", "Power BI", "TypeScript"]);
  }

  assert.equal(azureSttLocaleFor("bn"), "bn-IN");
  assert.equal(azureSttLocaleFor("ur"), "ur-IN");
  for (const invalid of ["", "en-US", "zh", "xx", null, 42, {}])
    assert.equal(isSttLocale(invalid), false, String(invalid));
});

test("accepts only bounded audio with a matching supported container signature", async () => {
  for (const type of [
    "audio/webm",
    "audio/webm;codecs=opus",
    "audio/ogg",
    "audio/mp4",
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
  ]) {
    assert.equal(isSupportedInterviewAudioType(type), true, type);
    assert.equal(await hasSupportedInterviewAudioSignature(testAudio(type)), true, `${type} signature`);
    assert.equal(await hasSupportedInterviewAudioSignature(testAudio(type, 32, false)), false, `${type} spoof`);
  }
  for (const type of ["", "application/octet-stream", "video/webm", "text/plain", "audio/aac"]) {
    assert.equal(isSupportedInterviewAudioType(type), false, type);
    assert.equal(await hasSupportedInterviewAudioSignature(testAudio(type)), false, type);
  }

  for (const endpoint of [
    "http://speech.cognitiveservices.azure.com",
    "https://example.com",
    "https://speech.cognitiveservices.azure.com.evil.example",
    "https://user:password@speech.cognitiveservices.azure.com",
    "not a URL",
  ]) {
    assert.throws(() => buildAzureTranscriptionRequest({
      audio: testAudio(),
      locale: "en",
      vocabulary: [],
      apiKey: "unit-test-key",
      endpoint,
    }));
  }

  for (const audio of [
    testAudio("audio/webm", 0),
    testAudio("application/octet-stream"),
    testAudio("audio/webm", STT_MAX_AUDIO_BYTES + 1),
  ]) {
    assert.throws(() => buildElevenLabsTranscriptionRequest({
      audio,
      locale: "en",
      vocabulary: [],
      apiKey: "unit-test-key",
    }), /audio is invalid/i);
  }
});

test("sanitizes phrase hints and restores technical vocabulary casing", () => {
  const noisy = [
    " SQL ", "sql", "Power\u0000 BI", "TypeScript", "x",
    "a".repeat(STT_MAX_VOCABULARY_TERM_CHARACTERS + 1), 42, null,
    ...Array.from({ length: 100 }, (_, index) => `term-${index}`),
  ];
  const sanitized = sanitizeSpeechVocabulary(noisy);
  assert.deepEqual(sanitized.slice(0, 3), ["SQL", "Power BI", "TypeScript"]);
  assert.equal(sanitized.filter((term) => term.toLowerCase() === "sql").length, 1);
  assert.ok(sanitized.length <= STT_MAX_VOCABULARY_TERMS);
  assert.ok(sanitized.every((term) => term.length >= 2 && term.length <= STT_MAX_VOCABULARY_TERM_CHARACTERS));
  assert.equal(
    normalizeSttTranscript(
      " I used sequel, power bee, tableu, type script, java script, and post gres Q L.\u0000 ",
      ["SQL", "Power BI", "Tableau", "TypeScript", "JavaScript", "PostgreSQL"],
    ),
    "I used SQL, Power BI, Tableau, TypeScript, JavaScript, and PostgreSQL.",
  );
});

test("parses only provider transcript fields", () => {
  assert.equal(transcriptFromElevenLabsResponse({ text: "  ElevenLabs transcript.  " }), "ElevenLabs transcript.");
  assert.equal(transcriptFromElevenLabsResponse({ text: 42 }), "");
  assert.equal(
    transcriptFromAzureResponse({ combinedPhrases: [{ text: "First." }, { text: "Second." }], phrases: [{ text: "ignored" }] }),
    "First. Second.",
  );
  assert.equal(
    transcriptFromAzureResponse({ phrases: [{ text: "Fallback one." }, {}, { text: "Fallback two." }] }),
    "Fallback one. Fallback two.",
  );
});

test("transcription route declares consent, signature, quota, and ordered provider controls", async () => {
  const route = await readFile(new URL("../app/api/transcribe/route.ts", import.meta.url), "utf8");
  assert.match(route, /hasSameOrigin\(request\)/);
  assert.match(route, /readMultipartBody\(request, MAX_MULTIPART_BYTES\)/);
  assert.match(route, /consentVersion\s*!==\s*STT_CONSENT_VERSION/);
  assert.match(route, /hasSupportedInterviewAudioSignature\(audio\)/);
  assert.match(route, /getAppUser\(\)/);
  assert.match(route, /consumeGlobalSpeechAudioQuota/);
  assert.match(route, /ELEVENLABS_API_KEY/);
  assert.match(route, /AZURE_SPEECH_KEY/);
  assert.match(route, /attempts\.push[\s\S]*elevenlabs[\s\S]*attempts\.push[\s\S]*azure_speech/);
  assert.match(route, /provider:\s*attempt\.provider/);
  assert.match(route, /AbortSignal\.timeout\(PROVIDER_TIMEOUT_MS\)/);
  assert.match(route, /private, no-store/);
  assert.doesNotMatch(route, /console\.(?:log|info|debug)\s*\(/);
});

test("built transcription route fails closed before contacting a provider", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = snapshotEnvironment();
  let providerCalls = 0;
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });
  configureBothProviders();
  globalThis.fetch = async () => {
    providerCalls += 1;
    return Response.json({ text: "unused" });
  };

  const cases = [
    [await requestBuiltTranscription({ origin: "https://attacker.example" }), 403, "invalid_origin"],
    [await requestBuiltTranscription({ authenticated: false }), 401, "sign_in_required"],
    [await requestBuiltTranscription({ extraHeaders: { "content-length": String(STT_MAX_AUDIO_BYTES + 300_000) } }), 413, "payload_too_large"],
    [await requestBuiltTranscription({ form: transcriptionForm({ type: "application/octet-stream" }) }), 400, "invalid_request"],
    [await requestBuiltTranscription({ form: transcriptionForm({ validSignature: false }) }), 400, "invalid_request"],
    [await requestBuiltTranscription({ form: transcriptionForm({ consentVersion: null }) }), 400, "invalid_request"],
    [await requestBuiltTranscription({ form: transcriptionForm({ consentVersion: "voice-input-v1" }) }), 400, "invalid_request"],
  ];
  for (const [response, status, error] of cases) {
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { error });
    assert.match(response.headers.get("cache-control") ?? "", /private.*no-store/i);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  }
  assert.equal(providerCalls, 0);
});

test("built route uses ElevenLabs first and returns its provider marker", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = snapshotEnvironment();
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });
  configureBothProviders();
  const upstream = [];
  globalThis.fetch = async (input, init) => {
    upstream.push({ input: String(input), init });
    return Response.json({ text: "I used sequel and power bee." });
  };

  const response = await requestBuiltTranscription({ form: transcriptionForm({ vocabulary: ["SQL", "Power BI"] }) });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.clone().json(), {
    transcript: "I used SQL and Power BI.",
    locale: "en",
    provider: "elevenlabs",
  });
  assert.equal(upstream.length, 1);
  assert.equal(upstream[0].input, "https://api.elevenlabs.io/v1/speech-to-text");
  assert.equal(new Headers(upstream[0].init.headers).get("xi-api-key"), "route-elevenlabs-secret");
  assert.equal(upstream[0].init.body.get("model_id"), ELEVENLABS_STT_MODEL_ID);
  assert.deepEqual(upstream[0].init.body.getAll("keyterms"), ["SQL", "Power BI"]);
  assert.doesNotMatch(JSON.stringify([...response.headers]), /route-(?:elevenlabs|azure)-secret/);
  assert.doesNotMatch(await response.text(), /route-(?:elevenlabs|azure)-secret/);
});

test("built route falls back from ElevenLabs to Azure and returns the actual provider", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = snapshotEnvironment();
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });
  configureBothProviders();
  const upstream = [];
  globalThis.fetch = async (input, init) => {
    upstream.push({ input: String(input), init });
    if (upstream.length === 1) return new Response("ElevenLabs unavailable", { status: 503 });
    return Response.json({ combinedPhrases: [{ text: "Azure fallback worked." }] });
  };

  const response = await requestBuiltTranscription();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    transcript: "Azure fallback worked.",
    locale: "en",
    provider: "azure_speech",
  });
  assert.equal(upstream.length, 2);
  assert.equal(upstream[0].input, "https://api.elevenlabs.io/v1/speech-to-text");
  assert.equal(upstream[1].input, `https://route-test.cognitiveservices.azure.com/speechtotext/transcriptions:transcribe?api-version=${STT_API_VERSION}`);
  assert.equal(new Headers(upstream[1].init.headers).get("ocp-apim-subscription-key"), "route-azure-secret");
});

test("built route maps dual-provider failures to safe typed errors", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = snapshotEnvironment();
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });
  configureBothProviders();

  for (const scenario of [
    { provider: async () => new Response("rate limited", { status: 429 }), status: 429, error: "transcription_rate_limited" },
    { provider: async () => new Response("failure", { status: 500 }), status: 503, error: "transcription_unavailable" },
    { provider: async () => { throw new Error("provider network failure"); }, status: 503, error: "transcription_unavailable" },
    {
      provider: async (input) => String(input).includes("elevenlabs")
        ? Response.json({ text: "" })
        : Response.json({ combinedPhrases: [{ text: "" }] }),
      status: 503,
      error: "transcription_unavailable",
    },
  ]) {
    globalThis.fetch = scenario.provider;
    const response = await requestBuiltTranscription();
    assert.equal(response.status, scenario.status);
    assert.deepEqual(await response.json(), { error: scenario.error });
  }

  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.AZURE_SPEECH_KEY;
  delete process.env.AZURE_SPEECH_ENDPOINT;
  let providerCalled = false;
  globalThis.fetch = async () => {
    providerCalled = true;
    return Response.json({});
  };
  const unavailable = await requestBuiltTranscription();
  assert.equal(unavailable.status, 503);
  assert.deepEqual(await unavailable.json(), { error: "premium_unavailable" });
  assert.equal(providerCalled, false);
});
