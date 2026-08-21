import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { LANGUAGES } from "../app/i18n.ts";
import {
  STT_API_VERSION,
  STT_MAX_AUDIO_BYTES,
  STT_MAX_VOCABULARY_TERM_CHARACTERS,
  STT_MAX_VOCABULARY_TERMS,
  azureSttLocaleFor,
  buildAzureTranscriptionRequest,
  isSttLocale,
  isSupportedInterviewAudioType,
  normalizeSttTranscript,
  sanitizeSpeechVocabulary,
  transcriptFromAzureResponse,
} from "../app/interview-stt.ts";

const LOCALES = LANGUAGES.map(([locale]) => locale);
let builtWorkerPromise;

function testAudio(type = "audio/webm;codecs=opus", size = 32) {
  return new Blob([new Uint8Array(size)], { type });
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
    workerUrl.searchParams.set(
      "interview-stt",
      `${process.pid}-${Date.now()}-${Math.random()}`,
    );
    return (await import(workerUrl.href)).default;
  })();
  return builtWorkerPromise;
}

function transcriptionForm({
  type = "audio/webm",
  size = 32,
  locale = "en",
  vocabulary = ["SQL"],
} = {}) {
  const form = new FormData();
  form.append("audio", testAudio(type, size), "interview-answer.webm");
  form.append("locale", locale);
  form.append("vocabulary", JSON.stringify(vocabulary));
  return form;
}

async function requestBuiltTranscription({
  form = transcriptionForm(),
  origin = "https://interviewthread.example",
  authenticated = true,
  userId = `stt-test-${crypto.randomUUID()}`,
  extraHeaders = {},
} = {}) {
  const headers = new Headers({
    origin,
    host: "interviewthread.example",
    ...extraHeaders,
  });
  if (authenticated) {
    headers.set("oai-authenticated-user-id", userId);
    headers.set("oai-authenticated-user-email", `${userId}@example.com`);
  }
  const worker = await builtWorker();
  return worker.fetch(
    new Request("https://interviewthread.example/api/transcribe", {
      method: "POST",
      headers,
      body: form,
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function restoreEnvironment(previous) {
  for (const [name, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
}

test("builds a private Azure fast-transcription request for all 40 locales", () => {
  assert.equal(LOCALES.length, 40);
  assert.equal(STT_API_VERSION, "2025-10-15");

  for (const locale of LOCALES) {
    assert.equal(isSttLocale(locale), true, `${locale} should be accepted`);
    const built = buildAzureTranscriptionRequest({
      audio: testAudio(),
      locale,
      vocabulary: ["SQL", "Power BI", "TypeScript"],
      apiKey: "unit-test-speech-key",
      endpoint: "https://interviewthread-speech.cognitiveservices.azure.com/",
    });

    const url = new URL(built.url);
    assert.equal(url.protocol, "https:");
    assert.equal(
      url.hostname,
      "interviewthread-speech.cognitiveservices.azure.com",
    );
    assert.equal(
      url.pathname,
      "/speechtotext/transcriptions:transcribe",
    );
    assert.equal(url.searchParams.get("api-version"), STT_API_VERSION);
    assert.equal(url.toString().includes("unit-test-speech-key"), false);

    const headers = new Headers(built.init.headers);
    assert.equal(headers.get("accept"), "application/json");
    assert.equal(
      headers.get("ocp-apim-subscription-key"),
      "unit-test-speech-key",
    );

    const form = formFromBuiltRequest(built);
    const audio = form.get("audio");
    assert.ok(audio instanceof Blob);
    assert.equal(audio.type, "audio/webm;codecs=opus");
    assert.equal(audio.size, 32);
    assert.match(audio.name, /\.webm$/);

    const definition = JSON.parse(String(form.get("definition")));
    assert.deepEqual(definition.locales, [azureSttLocaleFor(locale)]);
    assert.equal(definition.profanityFilterMode, "None");
    assert.deepEqual(definition.phraseList.phrases, [
      "SQL",
      "Power BI",
      "TypeScript",
    ]);
  }

  assert.equal(azureSttLocaleFor("bn"), "bn-IN");
  assert.equal(azureSttLocaleFor("ur"), "ur-IN");

  for (const invalid of ["", "en-US", "zh", "xx", null, 42, {}]) {
    assert.equal(isSttLocale(invalid), false, String(invalid));
  }
});

test("accepts only bounded interview audio and locks provider hosts", () => {
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
  }
  for (const type of [
    "",
    "application/octet-stream",
    "video/webm",
    "text/plain",
    "audio/aac",
  ]) {
    assert.equal(isSupportedInterviewAudioType(type), false, type);
  }

  for (const endpoint of [
    "http://speech.cognitiveservices.azure.com",
    "https://example.com",
    "https://speech.cognitiveservices.azure.com.evil.example",
    "https://user:password@speech.cognitiveservices.azure.com",
    "not a URL",
  ]) {
    assert.throws(
      () =>
        buildAzureTranscriptionRequest({
          audio: testAudio(),
          locale: "en",
          vocabulary: [],
          apiKey: "unit-test-speech-key",
          endpoint,
        }),
      endpoint,
    );
  }

  const regionalEndpoint = buildAzureTranscriptionRequest({
    audio: testAudio(),
    locale: "en",
    vocabulary: [],
    apiKey: "unit-test-speech-key",
    endpoint: "https://westus.api.cognitive.microsoft.com/",
  });
  assert.equal(
    new URL(regionalEndpoint.url).hostname,
    "westus.api.cognitive.microsoft.com",
  );

  for (const audio of [
    testAudio("audio/webm", 0),
    testAudio("application/octet-stream"),
    testAudio("audio/webm", STT_MAX_AUDIO_BYTES + 1),
  ]) {
    assert.throws(
      () =>
        buildAzureTranscriptionRequest({
          audio,
          locale: "en",
          vocabulary: [],
          apiKey: "unit-test-speech-key",
          endpoint: "https://speech.cognitiveservices.azure.com",
        }),
      /audio is invalid/i,
    );
  }
});

test("sanitizes phrase hints and restores technical vocabulary casing", () => {
  const noisy = [
    " SQL ",
    "sql",
    "Power\u0000 BI",
    "TypeScript",
    "x",
    "a".repeat(STT_MAX_VOCABULARY_TERM_CHARACTERS + 1),
    42,
    null,
    ...Array.from({ length: 100 }, (_, index) => `term-${index}`),
  ];
  const sanitized = sanitizeSpeechVocabulary(noisy);
  assert.equal(sanitized[0], "SQL");
  assert.equal(sanitized[1], "Power BI");
  assert.equal(sanitized[2], "TypeScript");
  assert.equal(sanitized.filter((term) => term.toLowerCase() === "sql").length, 1);
  assert.ok(sanitized.length <= STT_MAX_VOCABULARY_TERMS);
  assert.ok(
    sanitized.every(
      (term) =>
        term.length >= 2 && term.length <= STT_MAX_VOCABULARY_TERM_CHARACTERS,
    ),
  );

  assert.equal(
    normalizeSttTranscript(
      "  I used sequel, power bee, tableu, type script, java script, and post gres Q L.\u0000 ",
      ["SQL", "Power BI", "Tableau", "TypeScript", "JavaScript", "PostgreSQL"],
    ),
    "I used SQL, Power BI, Tableau, TypeScript, JavaScript, and PostgreSQL.",
  );
  assert.equal(
    normalizeSttTranscript("we shipped with sql and typescript", ["SQL", "TypeScript"]),
    "we shipped with SQL and TypeScript",
  );
  assert.equal(normalizeSttTranscript("  one\n\t two   three  "), "one two three");
  assert.equal(normalizeSttTranscript("\u0000\u0007"), "");
});

test("prefers Azure combined display text and falls back to phrase text", () => {
  assert.equal(
    transcriptFromAzureResponse({
      combinedPhrases: [{ text: "First sentence." }, { text: "Second sentence." }],
      phrases: [{ text: "ignored" }],
    }),
    "First sentence. Second sentence.",
  );
  assert.equal(
    transcriptFromAzureResponse({
      combinedPhrases: [{ text: "" }],
      phrases: [{ text: "Fallback one." }, {}, { text: "Fallback two." }],
    }),
    "Fallback one. Fallback two.",
  );
  for (const invalid of [null, "text", 42, {}, { phrases: [{}] }]) {
    assert.equal(transcriptFromAzureResponse(invalid), "");
  }
});

test("transcription route fails closed before the Azure provider is contacted", async () => {
  const route = await readFile(
    new URL("../app/api/transcribe/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(route, /sameOrigin\(request\)/);
  assert.match(route, /multipart\/form-data/);
  assert.match(route, /content-length/);
  assert.match(route, /payload_too_large/);
  assert.match(route, /STT_MAX_AUDIO_BYTES/);
  assert.match(route, /isSupportedInterviewAudioType\(audio\.type\)/);
  assert.match(route, /isSttLocale\(locale\)/);
  assert.match(route, /sanitizeSpeechVocabulary/);
  assert.match(route, /getAppUser\(\)/);
  assert.match(route, /sign_in_required/);
  assert.match(route, /TRANSCRIPTION_WINDOW_LIMIT/);
  assert.match(route, /rateLimitExceeded\(user\.userId\)/);
  assert.match(route, /AZURE_SPEECH_KEY/);
  assert.match(route, /AZURE_SPEECH_ENDPOINT/);
  assert.match(route, /AbortSignal\.timeout\(30_000\)/);
  assert.match(route, /providerResponse\.status === 429/);
  assert.match(route, /transcription_rate_limited/);
  assert.match(route, /transcription_unavailable/);
  assert.match(route, /premium_unavailable/);
  assert.match(route, /no_speech/);
  assert.match(route, /private, no-store/);
  assert.doesNotMatch(route, /console\.(?:log|info|debug)\s*\(/);
});

test("built transcription route requires same-origin authentication and bounded audio", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = {
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_ENDPOINT: process.env.AZURE_SPEECH_ENDPOINT,
  };
  let providerCalls = 0;
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });
  process.env.AZURE_SPEECH_KEY = "route-test-secret";
  process.env.AZURE_SPEECH_ENDPOINT =
    "https://route-test.cognitiveservices.azure.com";
  globalThis.fetch = async () => {
    providerCalls += 1;
    return Response.json({ combinedPhrases: [{ text: "unused" }] });
  };

  const invalidOrigin = await requestBuiltTranscription({
    origin: "https://attacker.example",
  });
  assert.equal(invalidOrigin.status, 403);
  assert.deepEqual(await invalidOrigin.json(), { error: "invalid_origin" });

  const unauthenticated = await requestBuiltTranscription({ authenticated: false });
  assert.equal(unauthenticated.status, 401);
  assert.deepEqual(await unauthenticated.json(), { error: "sign_in_required" });

  const oversizedDeclared = await requestBuiltTranscription({
    extraHeaders: { "content-length": String(STT_MAX_AUDIO_BYTES + 300_000) },
  });
  assert.equal(oversizedDeclared.status, 413);
  assert.deepEqual(await oversizedDeclared.json(), { error: "payload_too_large" });

  const invalidMime = await requestBuiltTranscription({
    form: transcriptionForm({ type: "application/octet-stream" }),
  });
  assert.equal(invalidMime.status, 400);
  assert.deepEqual(await invalidMime.json(), { error: "invalid_request" });

  const invalidLocale = await requestBuiltTranscription({
    form: transcriptionForm({ locale: "en-US" }),
  });
  assert.equal(invalidLocale.status, 400);
  assert.deepEqual(await invalidLocale.json(), { error: "invalid_request" });

  assert.equal(providerCalls, 0);
  for (const response of [
    invalidOrigin,
    unauthenticated,
    oversizedDeclared,
    invalidMime,
    invalidLocale,
  ]) {
    assert.match(response.headers.get("cache-control") ?? "", /private/i);
    assert.match(response.headers.get("cache-control") ?? "", /no-store/i);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  }
});

test("built transcription route returns a corrected display transcript without exposing credentials", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = {
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_ENDPOINT: process.env.AZURE_SPEECH_ENDPOINT,
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });
  process.env.AZURE_SPEECH_KEY = "route-test-secret";
  process.env.AZURE_SPEECH_ENDPOINT =
    "https://route-test.cognitiveservices.azure.com";

  let upstream;
  globalThis.fetch = async (input, init) => {
    upstream = { input: String(input), init };
    return Response.json({
      combinedPhrases: [{ text: "I used sequel and power bee." }],
    });
  };

  const response = await requestBuiltTranscription({
    form: transcriptionForm({ vocabulary: ["SQL", "Power BI"] }),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.clone().json(), {
    transcript: "I used SQL and Power BI.",
    locale: "en",
  });
  assert.equal(
    upstream.input,
    `https://route-test.cognitiveservices.azure.com/speechtotext/transcriptions:transcribe?api-version=${STT_API_VERSION}`,
  );
  const upstreamHeaders = new Headers(upstream.init.headers);
  assert.equal(
    upstreamHeaders.get("ocp-apim-subscription-key"),
    "route-test-secret",
  );
  const definition = JSON.parse(String(upstream.init.body.get("definition")));
  assert.deepEqual(definition.locales, ["en-US"]);
  assert.deepEqual(definition.phraseList.phrases, ["SQL", "Power BI"]);
  assert.doesNotMatch(JSON.stringify([...response.headers]), /route-test-secret/);
  assert.doesNotMatch(await response.text(), /route-test-secret/);
});

test("built transcription route maps Azure provider failures to safe typed errors", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = {
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_ENDPOINT: process.env.AZURE_SPEECH_ENDPOINT,
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });
  process.env.AZURE_SPEECH_KEY = "route-test-secret";
  process.env.AZURE_SPEECH_ENDPOINT =
    "https://route-test.cognitiveservices.azure.com";

  const cases = [
    {
      provider: async () => new Response("rate limited", { status: 429 }),
      status: 429,
      error: "transcription_rate_limited",
    },
    {
      provider: async () => new Response("failure", { status: 500 }),
      status: 502,
      error: "transcription_unavailable",
    },
    {
      provider: async () => {
        throw new Error("provider network failure");
      },
      status: 503,
      error: "transcription_unavailable",
    },
    {
      provider: async () => Response.json({ combinedPhrases: [{ text: "" }] }),
      status: 422,
      error: "no_speech",
    },
  ];

  for (const scenario of cases) {
    globalThis.fetch = scenario.provider;
    const response = await requestBuiltTranscription();
    assert.equal(response.status, scenario.status);
    assert.deepEqual(await response.json(), { error: scenario.error });
    assert.match(response.headers.get("cache-control") ?? "", /no-store/i);
  }

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

test("two-stage voice lifecycle preserves live text and protects manual edits", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /webkitSpeechRecognition/);
  assert.match(page, /recognition\.interimResults\s*=\s*true/);
  assert.match(page, /recognition\.maxAlternatives\s*=\s*5/);
  assert.match(page, /navigator\.mediaDevices\.getUserMedia/);
  assert.match(page, /new MediaRecorder\(/);
  assert.match(page, /echoCancellation:\s*true/);
  assert.match(page, /noiseSuppression:\s*true/);
  assert.match(page, /autoGainControl:\s*true/);
  assert.match(page, /fetch\("\/api\/transcribe"/);
  assert.match(page, /form\.append\("locale",\s*locale\)/);
  assert.match(page, /form\.append\("vocabulary"/);
  assert.match(page, /voiceBrowserTranscriptRef\.current/);
  assert.match(page, /currentAnswer\s*===\s*browserDraft\.trim\(\)/);
  assert.match(page, /currentAnswer\s*===\s*baseAnswer\.trim\(\)/);
  assert.match(page, /voiceTranscriptionAbortRef\.current\?\.abort\(\)/);
  assert.match(page, /voiceTranscriptionRequestIdRef\.current/);
  assert.match(page, /stopInterviewMediaStream/);
  assert.match(page, /voiceRecordingTimerRef/);
  assert.match(page, /speechRestartTimerRef/);
  assert.match(page, /audio\.size\s*>\s*STT_MAX_AUDIO_BYTES/);

  assert.match(
    page,
    /voiceBrowserTranscriptRef\.current\s*=\s*appendTranscript\(/,
    "browser final segments must accumulate separately for safe cloud replacement",
  );
  assert.match(
    page,
    /interviewAnswerRef\.current\s*=\s*nextAnswer/,
    "the ref used by the no-overwrite guard must stay synchronized",
  );
  assert.match(
    page,
    /speechRestartTimerRef\.current\s*=\s*window\.setTimeout/,
    "recognition restart timers must be cancellable",
  );
  assert.match(
    page,
    /disabled=\{[\s\S]{0,260}isRefiningVoice/,
    "answer controls should not submit while the final transcript is being refined",
  );
  assert.doesNotMatch(
    page,
    /recognitionConfidence\}\s*%/,
    "browser confidence must not be presented as a comparable accuracy score",
  );
});
