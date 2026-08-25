import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { LANGUAGES } from "../app/i18n.ts";
import {
  TTS_MAX_CHARACTERS,
  TTS_MODEL_ID,
  azureVoiceForLocale,
  buildAzureSpeechRequest,
  isTtsLocale,
  normalizeTtsText,
} from "../app/interview-tts.ts";

const LOCALES = LANGUAGES.map(([locale]) => locale);
const SITE_ORIGIN = "https://interviewthread.example";
let builtWorkerPromise;

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
  assert.equal(TTS_MODEL_ID, "azure-standard-neural");
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
    assert.match(
      voice,
      /^[a-z]{2,3}-[A-Z]{2,4}-.+Neural$/,
      `${locale} must map to a named Azure neural voice`,
    );
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
});
