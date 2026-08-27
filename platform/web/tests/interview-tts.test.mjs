import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { LANGUAGES } from "../app/i18n.ts";
import { consumeGlobalSpeechQuota } from "../app/speech-quota.ts";
import {
  TTS_MAX_CHARACTERS,
  TTS_MODEL_ID,
  TTS_FALLBACK_MODEL_ID,
  azureStandardVoiceForLocale,
  azureVoiceForLocale,
  buildAzureSpeechRequest,
  buildAzureStandardSpeechRequest,
  isTtsLocale,
  normalizeTtsText,
} from "../app/interview-tts.ts";

const LOCALES = LANGUAGES.map(([locale]) => locale);
const SITE_ORIGIN = "https://interviewthread.example";
let builtWorkerPromise;

function createSpeechQuotaDb(initialCount = 0) {
  const counts = new Map();
  return {
    prepare(sql) {
      let bindings = [];
      const statement = {
        bind(...values) {
          bindings = values;
          return statement;
        },
        async run() {
          if (/DELETE FROM speech_usage_windows/i.test(sql)) {
            const cutoff = Number(bindings[0]);
            for (const key of counts.keys()) {
              if (key < cutoff) counts.delete(key);
            }
          }
          return { success: true };
        },
        async first() {
          if (!/INSERT INTO speech_usage_windows/i.test(sql)) return null;
          const windowStart = Number(bindings[0]);
          const next = (counts.get(windowStart) ?? initialCount) + 1;
          counts.set(windowStart, next);
          return { request_count: next };
        },
      };
      return statement;
    },
  };
}

async function builtWorker() {
  builtWorkerPromise ??= (async () => {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set(
      "interview-tts",
      `${process.pid}-${Date.now()}-${Math.random()}`,
    );
    return (await import(workerUrl.href)).default;
  })();
  return builtWorkerPromise;
}

async function requestBuiltSpeech({
  payload = {
    locale: "en",
    text: "Tell me about your strongest project.",
  },
  origin = SITE_ORIGIN,
  authenticated = true,
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
    headers.set("oai-authenticated-user-id", "tts-test-user");
    headers.set("oai-authenticated-user-email", "tts-test-user@example.com");
  }
  const worker = await builtWorker();
  return worker.fetch(
    new Request(`${SITE_ORIGIN}/api/speech`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function requestParts(built) {
  if (built instanceof Request) {
    return {
      url: built.url,
      method: built.method,
      headers: built.headers,
      body: built.clone().text(),
    };
  }

  assert.ok(built && typeof built === "object", "request builder must return request data");
  const url = String(built.url ?? built.input ?? "");
  const init = built.init ?? built;
  return {
    url,
    method: init.method,
    headers: new Headers(init.headers),
    body: Promise.resolve(String(init.body ?? "")),
  };
}

async function parsedProviderRequest(locale, text = "Explain your strongest SQL example.") {
  const parts = requestParts(
    buildAzureSpeechRequest({
      apiKey: "test-azure-speech-key",
      locale,
      region: "eastus",
      text,
    }),
  );
  const body = await parts.body;
  return { ...parts, body };
}

function restoreEnvironment(previous) {
  for (const [name, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
}

test("builds a bounded Azure Speech request for every supported locale", async () => {
  assert.equal(LOCALES.length, 40);
  assert.equal(TTS_MODEL_ID, "azure-dragon-hd-omni");
  assert.equal(TTS_FALLBACK_MODEL_ID, "azure-standard-neural");
  assert.ok(
    Number.isInteger(TTS_MAX_CHARACTERS) &&
      TTS_MAX_CHARACTERS >= 800 &&
      TTS_MAX_CHARACTERS <= 3_000,
    `provider text limit must be explicit and conservative: ${TTS_MAX_CHARACTERS}`,
  );

  for (const locale of LOCALES) {
    assert.equal(isTtsLocale(locale), true, `${locale} should be accepted`);
    const voice = azureVoiceForLocale(locale);
    assert.equal(typeof voice, "string", locale);
    assert.equal(voice, "en-US-Ava:DragonHDOmniLatestNeural");
    assert.match(azureStandardVoiceForLocale(locale), /Neural$/);
    const request = await parsedProviderRequest(locale);

    assert.equal(
      request.url,
      "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1",
    );
    assert.doesNotMatch(request.url, /test-azure-speech-key/);
    assert.equal(request.method, "POST");
    assert.equal(
      request.headers.get("ocp-apim-subscription-key"),
      "test-azure-speech-key",
    );
    assert.match(request.headers.get("content-type") ?? "", /application\/ssml\+xml/i);
    assert.match(
      request.headers.get("x-microsoft-outputformat") ?? "",
      /mp3|opus|riff|pcm/i,
    );
    assert.match(request.body, /<speak\b/i);
    assert.match(request.body, new RegExp(`name=["']${voice}["']`));
    assert.match(request.body, /DragonHDOmniLatestNeural/);
    assert.match(request.body, /enhancePronunciation=true/);
    assert.match(request.body, /<lang\s+xml:lang=/);
    assert.doesNotMatch(request.body, /<prosody\b/);
    assert.match(request.body, /Explain your strongest/);
  }

  for (const invalid of ["", "en-US", "zh", "xx", "__proto__", null, 42]) {
    assert.equal(isTtsLocale(invalid), false, `${String(invalid)} must be rejected`);
  }
});

test("normalizes and SSML-escapes speech text without reducing a question to an acronym", async () => {
  const source = `## Hiring manager\n\n請用你最有力的 **SQL** 經驗帶我走過一次。\u0000`;
  const normalized = normalizeTtsText(source);

  assert.equal(typeof normalized, "string");
  assert.doesNotMatch(normalized, /[#*]/);
  assert.equal(normalized.includes("\u0000"), false);
  assert.match(normalized, /請用你最有力的/);
  assert.match(normalized, /SQL|S Q L|sequel/i);
  assert.notEqual(normalized.trim().toUpperCase(), "SQL");
  assert.notEqual(normalized.trim().toUpperCase(), "S Q L");

  assert.equal(normalizeTtsText("  Tell   me\nabout\tPython.  "), "Tell me about Python.");
  assert.equal(normalizeTtsText("\u0000\u0007"), "");

  const oversized = normalizeTtsText("a".repeat(20_000));
  assert.ok(oversized.length > 0, "normalization should retain usable text");
  assert.ok(
    oversized.length <= TTS_MAX_CHARACTERS,
    `normalized provider text must be bounded, received ${oversized.length} characters`,
  );

  const request = await parsedProviderRequest(
    "en",
    "Compare C++ & SQL with <API> access, then explain an AWS KPI.",
  );
  assert.doesNotMatch(request.body, /<API>/);
  assert.match(request.body, /&amp;/);
  assert.match(request.body, /&lt;API&gt;/);
  assert.match(
    request.body,
    /<(?:say-as|sub)\b/i,
    "technical terms should receive deterministic pronunciation markup",
  );

  const standard = requestParts(
    buildAzureStandardSpeechRequest({
      apiKey: "test-azure-speech-key",
      locale: "en",
      region: "eastus",
      text: "Tell me about your work.",
    }),
  );
  assert.match(await standard.body, /JennyNeural/);
  assert.match(await standard.body, /<prosody\b/);
  assert.equal(
    standard.headers.get("x-microsoft-outputformat"),
    "audio-48khz-192kbitrate-mono-mp3",
  );
});

test("speech route streams private audio and never exposes provider credentials", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = {
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });

  process.env.AZURE_SPEECH_KEY = "route-test-secret";
  process.env.AZURE_SPEECH_REGION = "eastus";
  let upstream;
  globalThis.fetch = async (input, init) => {
    upstream = { input: String(input), init };
    return new Response(Uint8Array.from([73, 68, 51, 4, 0, 0, 0]), {
      status: 200,
      headers: { "content-type": "audio/mpeg" },
    });
  };

  const response = await requestBuiltSpeech({
    payload: {
      locale: "ja",
      text: "SQL を使った最も強い事例を説明してください。",
    },
  });

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^audio\//);
  assert.match(response.headers.get("cache-control") ?? "", /private/i);
  assert.match(response.headers.get("cache-control") ?? "", /no-store/i);
  assert.ok(Number(response.headers.get("content-length") ?? 1) !== 0);
  assert.equal(
    response.headers.get("x-interviewthread-speech-model"),
    "azure-dragon-hd-omni",
  );
  assert.equal(
    upstream.input,
    "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1",
  );
  assert.equal(
    new Headers(upstream.init.headers).get("ocp-apim-subscription-key"),
    "route-test-secret",
  );
  assert.doesNotMatch(JSON.stringify([...response.headers]), /route-test-secret/);
  assert.doesNotMatch(await response.clone().text(), /route-test-secret/);
});

test("speech route gives a guest natural voice and falls back server-side when HD is unavailable", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = {
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });

  process.env.AZURE_SPEECH_KEY = "route-test-secret";
  process.env.AZURE_SPEECH_REGION = "eastus";
  let fetchCount = 0;
  globalThis.fetch = async (_input, init) => {
    fetchCount += 1;
    const body = String(init?.body || "");
    if (body.includes("DragonHDOmniLatestNeural"))
      return new Response("HD unavailable in this resource", { status: 400 });
    return new Response(Uint8Array.from([73, 68, 51, 4]), {
      status: 200,
      headers: { "content-type": "audio/mpeg" },
    });
  };

  const response = await requestBuiltSpeech({
    authenticated: false,
    extraHeaders: { "cf-connecting-ip": "203.0.113.45" },
    payload: { locale: "zh-TW", text: "請介紹一個你最有把握的專案。" },
  });
  assert.equal(response.status, 200);
  assert.equal(fetchCount, 2);
  assert.equal(
    response.headers.get("x-interviewthread-speech-model"),
    "azure-standard-neural",
  );
});

test("speech route enforces per-visitor and global paid-provider quotas", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = {
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });

  process.env.AZURE_SPEECH_KEY = "route-test-secret";
  process.env.AZURE_SPEECH_REGION = "eastus";
  let fetchCount = 0;
  globalThis.fetch = async () => {
    fetchCount += 1;
    return new Response(Uint8Array.from([73, 68, 51, 4]), {
      status: 200,
      headers: { "content-type": "audio/mpeg" },
    });
  };

  for (let index = 0; index < 30; index += 1) {
    const response = await requestBuiltSpeech({
      authenticated: false,
      extraHeaders: { "cf-connecting-ip": "203.0.113.46" },
    });
    assert.equal(response.status, 200, `guest request ${index + 1}`);
  }
  const visitorLimited = await requestBuiltSpeech({
    authenticated: false,
    extraHeaders: { "cf-connecting-ip": "203.0.113.46" },
  });
  assert.equal(visitorLimited.status, 429);
  assert.equal(visitorLimited.headers.get("retry-after"), "600");
  assert.equal(fetchCount, 30, "a rejected request must not contact Azure");

  const windowMilliseconds = 10 * 60 * 1_000;
  const windowStart =
    Math.floor(Date.now() / windowMilliseconds) * windowMilliseconds;
  const globalLimited = await consumeGlobalSpeechQuota(
    createSpeechQuotaDb(300),
    {
      windowStart,
      windowMilliseconds,
      limit: 300,
    },
  );
  assert.equal(globalLimited, true);
  assert.equal(
    fetchCount,
    30,
    "checking the durable global cap must not contact Azure",
  );
  const firstGlobalRequest = await consumeGlobalSpeechQuota(
    createSpeechQuotaDb(),
    {
      windowStart,
      windowMilliseconds,
      limit: 300,
    },
  );
  assert.equal(firstGlobalRequest, false);
});

test("speech route rejects unsafe payloads before contacting the provider", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = {
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
  };
  let fetchCount = 0;
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });
  process.env.AZURE_SPEECH_KEY = "route-test-secret";
  process.env.AZURE_SPEECH_REGION = "eastus";
  globalThis.fetch = async () => {
    fetchCount += 1;
    return new Response(new Uint8Array([1]), {
      headers: { "content-type": "audio/mpeg" },
    });
  };

  for (const origin of [null, "https://example.com"]) {
    const response = await requestBuiltSpeech({ origin });
    assert.equal(response.status, 403, `origin ${origin ?? "missing"}`);
  }

  const unauthenticated = await requestBuiltSpeech({ authenticated: false });
  assert.equal(unauthenticated.status, 401);
  assert.deepEqual(await unauthenticated.json(), { error: "sign_in_required" });

  const invalidPayloads = [
    {},
    { locale: "en-US", text: "Tell me about yourself." },
    { locale: "en", text: "" },
    { locale: "en", text: 42 },
    { locale: "en", text: "\u0000\u0007" },
    { locale: "en", text: "a".repeat(TTS_MAX_CHARACTERS + 1) },
  ];

  for (const payload of invalidPayloads) {
    const response = await requestBuiltSpeech({ payload });
    assert.equal(response.status, 400, JSON.stringify(payload).slice(0, 100));
    assert.match(response.headers.get("cache-control") ?? "no-store", /no-store/i);
  }

  assert.equal(fetchCount, 0);
});

test("speech route fails closed when configuration or the provider is unavailable", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = {
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });

  delete process.env.AZURE_SPEECH_KEY;
  delete process.env.AZURE_SPEECH_REGION;
  let fetchCount = 0;
  globalThis.fetch = async () => {
    fetchCount += 1;
    return new Response("provider should not be contacted");
  };

  const missingConfiguration = await requestBuiltSpeech({
    payload: { locale: "en", text: "Tell me about yourself." },
  });
  assert.equal(missingConfiguration.status, 503);
  assert.equal(fetchCount, 0);
  assert.match(missingConfiguration.headers.get("cache-control") ?? "no-store", /no-store/i);
  assert.doesNotMatch(
    await missingConfiguration.text(),
    /AZURE|SPEECH[_ -]?(?:KEY|REGION)|api[_ -]?key/i,
  );

  process.env.AZURE_SPEECH_KEY = "route-test-secret";
  process.env.AZURE_SPEECH_REGION = "eastus";
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ detail: "internal provider detail" }), {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": "15",
      },
    });

  const unavailable = await requestBuiltSpeech({
    payload: { locale: "en", text: "Tell me about yourself." },
  });
  assert.ok([429, 502, 503].includes(unavailable.status));
  assert.match(unavailable.headers.get("cache-control") ?? "no-store", /no-store/i);
  const unavailableBody = await unavailable.text();
  assert.doesNotMatch(unavailableBody, /route-test-secret/);
  assert.doesNotMatch(unavailableBody, /internal provider detail/);
});

test("interview read-aloud has one premium request, one device fallback, and stale-audio guards", () => {
  const pageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.equal(
    (pageSource.match(/fetch\(\s*["'`]\/api\/speech["'`]/g) ?? []).length,
    1,
    "the interview client should make one same-origin premium speech request",
  );
  assert.match(pageSource, /new AbortController\(\)/);
  assert.match(pageSource, /\.abort\(\)/);
  assert.match(pageSource, /new Audio\(|HTMLAudioElement/);
  assert.match(pageSource, /function unlockInterviewAudioContext\(\)/);
  assert.match(pageSource, /decodeAudioData\(/);
  assert.match(pageSource, /createBufferSource\(\)/);
  assert.match(pageSource, /if \(enabled\) void unlockInterviewAudioContext\(\)/);
  assert.match(pageSource, /URL\.createObjectURL\(/);
  assert.match(pageSource, /URL\.revokeObjectURL\(/);
  assert.match(pageSource, /SpeechSynthesisUtterance/);
  assert.match(pageSource, /speechSynthesis\.cancel\(\)/);
  assert.match(
    pageSource,
    /(?:tts|speech)(?:Request|Playback)?(?:Token|Id|Sequence|Generation)/i,
    "a monotonic token/id must prevent stale async audio from playing",
  );
  assert.match(
    pageSource,
    /(?:fallback|device voice|browser voice|speech synthesis)/i,
    "provider failure must fall back to the browser voice",
  );
  assert.match(pageSource, /speechStatusUi\.deviceFallback/);
  assert.match(pageSource, /speechStatusUi\.hdVoice/);
  assert.match(pageSource, /speechStatusUi\.readyToPlay/);
  assert.match(pageSource, /function cancelInterviewVoiceSession\(/);
  assert.match(pageSource, /voiceTranscriptionRequestIdRef\.current \+= 1/);
  assert.match(
    pageSource,
    /function finishRealisticInterview\(\) \{\s*cancelInterviewVoiceSession\(\)/,
  );
  assert.match(
    pageSource,
    /function addNextInterviewQuestion[\s\S]+?cancelInterviewVoiceSession\(\)/,
  );
  assert.match(
    pageSource,
    /recognition\.onresult = \(event\) => \{\s*if \(requestId !== voiceTranscriptionRequestIdRef\.current\) return;/,
  );
  assert.match(pageSource, /restartNotice/);
  assert.match(pageSource, /activeOpenQuestionId/);
  assert.match(
    pageSource,
    /const audioSource = interviewAudioSourceRef\.current;[\s\S]+?audioSource\.disconnect\(\);/,
    "locale and lifecycle cleanup must stop an active Web Audio source",
  );
});
