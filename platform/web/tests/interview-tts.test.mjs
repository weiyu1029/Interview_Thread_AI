import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { LANGUAGES } from "../app/i18n.ts";
import {
  consumeGlobalSpeechCharacterQuota,
  consumeGlobalSpeechQuota,
} from "../app/speech-quota.ts";
import {
  TTS_MAX_CHARACTERS,
  TTS_MODEL_ID,
  TTS_FALLBACK_MODEL_ID,
  TTS_FINAL_CLOUD_FALLBACK_MODEL_ID,
  azureStandardVoiceForLocale,
  azureVoiceForLocale,
  buildElevenLabsSpeechRequest,
  buildAzureSpeechRequest,
  buildAzureStandardSpeechRequest,
  elevenLabsLanguageForLocale,
  elevenLabsVoiceIdForLocale,
  isElevenLabsVoiceId,
  isTtsLocale,
  normalizeTechnicalTermsForSpeech,
  normalizeTtsText,
  ttsVoiceProfileCompleteness,
  ttsVoiceProfileForLocale,
  ttsVoiceProfileHeader,
  TTS_VOICE_PROFILE_VERSION,
} from "../app/interview-tts.ts";

const LOCALES = LANGUAGES.map(([locale]) => locale);
const SITE_ORIGIN = "https://interviewthread.example";
const TEST_ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
let builtWorkerPromise;

function createSpeechQuotaDb(initialCount = 0, initialCharacterCount = 0) {
  const counts = new Map();
  const characterCounts = new Map();
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
          if (/DELETE FROM speech_character_usage_windows/i.test(sql)) {
            const cutoff = Number(bindings[0]);
            for (const key of characterCounts.keys()) {
              if (key < cutoff) characterCounts.delete(key);
            }
          }
          return { success: true };
        },
        async first() {
          if (/INSERT INTO speech_character_usage_windows/i.test(sql)) {
            const windowStart = Number(bindings[0]);
            const characters = Number(bindings[1]);
            const next =
              (characterCounts.get(windowStart) ?? initialCharacterCount) +
              characters;
            characterCounts.set(windowStart, next);
            return { character_count: next };
          }
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

test("defines complete, auditable, bounded voice profiles for all 40 locales", async () => {
  assert.equal(LOCALES.length, 40);
  assert.equal(TTS_MODEL_ID, "eleven_v3");
  assert.equal(TTS_FALLBACK_MODEL_ID, "azure-dragon-hd-omni");
  assert.equal(TTS_FINAL_CLOUD_FALLBACK_MODEL_ID, "azure-standard-neural");
  assert.equal(TTS_MAX_CHARACTERS, 900);
  assert.match(TTS_VOICE_PROFILE_VERSION, /^itvp\d+$/);
  assert.deepEqual(ttsVoiceProfileCompleteness(LOCALES), {
    version: TTS_VOICE_PROFILE_VERSION,
    expectedCount: 40,
    configuredCount: 40,
    missing: [],
    extra: [],
    duplicateProfileIds: [],
    complete: true,
  });

  for (const locale of LOCALES) {
    assert.equal(isTtsLocale(locale), true, `${locale} should be accepted`);
    const profile = ttsVoiceProfileForLocale(locale);
    assert.equal(profile.locale, locale);
    assert.equal(profile.version, TTS_VOICE_PROFILE_VERSION);
    assert.match(profile.profileId, /^\d{2}$/);
    assert.equal(profile.elevenLabsLanguage, elevenLabsLanguageForLocale(locale));
    assert.equal(profile.azureNativeVoice, azureStandardVoiceForLocale(locale));
    assert.match(
      ttsVoiceProfileHeader(locale, "elevenlabs-tts"),
      /^itvp\d+-\d{2}-a$/,
    );
    assert.match(
      ttsVoiceProfileHeader(locale, "azure-native"),
      /^itvp\d+-\d{2}-d$/,
    );

    const elevenLabs = requestParts(
      buildElevenLabsSpeechRequest({
        apiKey: "test-elevenlabs-key",
        voiceId: TEST_ELEVENLABS_VOICE_ID,
        locale,
        text: "Explain your strongest SQL example.",
      }),
    );
    const elevenLabsBody = JSON.parse(await elevenLabs.body);
    assert.equal(
      elevenLabs.url,
      `https://api.elevenlabs.io/v1/text-to-speech/${TEST_ELEVENLABS_VOICE_ID}/stream?output_format=mp3_44100_128`,
    );
    assert.doesNotMatch(elevenLabs.url, /test-elevenlabs-key/);
    assert.equal(elevenLabs.method, "POST");
    assert.equal(elevenLabs.headers.get("xi-api-key"), "test-elevenlabs-key");
    assert.equal(elevenLabs.headers.get("content-type"), "application/json");
    assert.equal(elevenLabsBody.model_id, "eleven_v3");
    assert.equal(elevenLabsBody.language_code, elevenLabsLanguageForLocale(locale));
    assert.equal(elevenLabsBody.voice_settings.stability, 0.5);
    assert.deepEqual(elevenLabsBody.voice_settings, { stability: 0.5 });
    assert.doesNotMatch(elevenLabsBody.text, /^\[[^\]]+\]/);
    assert.match(
      elevenLabsBody.text,
      locale === "en"
        ? /strongest S Q L example/
        : /strongest SQL example/,
    );
    assert.doesNotMatch(elevenLabsBody.text, /<speak|<voice/i);

    const standard = requestParts(
      buildAzureStandardSpeechRequest({
        apiKey: "test-azure-speech-key",
        locale,
        region: "eastus",
        text: "Explain your strongest SQL example.",
      }),
    );
    const standardBody = await standard.body;

    assert.equal(
      standard.url,
      "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1",
    );
    assert.doesNotMatch(standard.url, /test-azure-speech-key/);
    assert.equal(standard.method, "POST");
    assert.equal(
      standard.headers.get("ocp-apim-subscription-key"),
      "test-azure-speech-key",
    );
    assert.match(standard.headers.get("content-type") ?? "", /application\/ssml\+xml/i);
    assert.match(
      standard.headers.get("x-microsoft-outputformat") ?? "",
      /mp3|opus|riff|pcm/i,
    );
    assert.match(standardBody, /<speak\b/i);
    assert.match(
      standardBody,
      new RegExp(`name=["']${profile.azureNativeVoice}["']`),
    );
    assert.match(standardBody, /<prosody\b/);
    assert.doesNotMatch(standardBody, /en-US-Ava:DragonHDOmniLatestNeural/);

    if (locale === "en") {
      const request = await parsedProviderRequest(locale);
      assert.equal(
        azureVoiceForLocale(locale),
        "en-US-Ava:DragonHDOmniLatestNeural",
      );
      assert.equal(
        profile.azureHdVoice,
        "en-US-Ava:DragonHDOmniLatestNeural",
      );
      assert.match(request.body, /DragonHDOmniLatestNeural/);
      assert.match(request.body, /enhancePronunciation=true/);
      assert.match(request.body, /<lang\s+xml:lang=/);
      assert.doesNotMatch(request.body, /<prosody\b/);
    } else {
      assert.equal(azureVoiceForLocale(locale), null);
      assert.equal(profile.azureHdVoice, null);
      assert.throws(
        () =>
          buildAzureSpeechRequest({
            apiKey: "test-azure-speech-key",
            locale,
            region: "eastus",
            text: "Explain your strongest example.",
          }),
        /English Azure HD voice cannot be used/,
      );
      assert.throws(
        () => ttsVoiceProfileHeader(locale, "azure-hd-en"),
        /English Azure HD voice cannot be used/,
      );
    }
  }

  const simplifiedChinese = ttsVoiceProfileForLocale("zh-CN");
  const traditionalChinese = ttsVoiceProfileForLocale("zh-TW");
  assert.notEqual(simplifiedChinese.profileId, traditionalChinese.profileId);
  assert.equal(simplifiedChinese.azureLanguage, "zh-CN");
  assert.equal(traditionalChinese.azureLanguage, "zh-TW");
  assert.equal(simplifiedChinese.azureNativeVoice, "zh-CN-XiaoxiaoNeural");
  assert.equal(traditionalChinese.azureNativeVoice, "zh-TW-HsiaoChenNeural");
  assert.notEqual(
    ttsVoiceProfileHeader("zh-CN", "azure-native"),
    ttsVoiceProfileHeader("zh-TW", "azure-native"),
  );

  for (const invalid of ["", "en-US", "zh", "xx", "__proto__", null, 42]) {
    assert.equal(isTtsLocale(invalid), false, `${String(invalid)} must be rejected`);
  }
});

test("uses locale-native ElevenLabs voices and never reuses the English default for other locales", () => {
  assert.equal(isElevenLabsVoiceId(TEST_ELEVENLABS_VOICE_ID), true);
  assert.equal(isElevenLabsVoiceId("../unsafe"), false);
  const localeMap = JSON.stringify({
    en: "21m00Tcm4TlvDq8ikWAM",
    "zh-TW": "XB0fDUnXU5powFXDhCwa",
    ja: "../unsafe",
  });
  assert.equal(
    elevenLabsVoiceIdForLocale("en", TEST_ELEVENLABS_VOICE_ID, localeMap),
    "21m00Tcm4TlvDq8ikWAM",
  );
  assert.equal(
    elevenLabsVoiceIdForLocale("zh-TW", TEST_ELEVENLABS_VOICE_ID, localeMap),
    "XB0fDUnXU5powFXDhCwa",
  );
  assert.equal(
    elevenLabsVoiceIdForLocale("ja", TEST_ELEVENLABS_VOICE_ID, localeMap),
    null,
  );
  assert.equal(
    elevenLabsVoiceIdForLocale("en", TEST_ELEVENLABS_VOICE_ID, "not-json"),
    TEST_ELEVENLABS_VOICE_ID,
  );
  assert.equal(
    elevenLabsVoiceIdForLocale("zh-TW", TEST_ELEVENLABS_VOICE_ID, "not-json"),
    null,
  );
  assert.equal(
    elevenLabsVoiceIdForLocale("ja", TEST_ELEVENLABS_VOICE_ID, undefined),
    null,
  );
  assert.equal(
    elevenLabsVoiceIdForLocale("zh-TW", "unsafe", localeMap),
    "XB0fDUnXU5powFXDhCwa",
  );
  assert.equal(
    elevenLabsVoiceIdForLocale("en", "unsafe", localeMap),
    "21m00Tcm4TlvDq8ikWAM",
  );
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
  assert.equal(
    normalizeTechnicalTermsForSpeech("Compare C++, API, SQL, and PostgreSQL."),
    "Compare C plus plus, A P I, S Q L, and PostgreSQL.",
  );
  assert.equal(
    normalizeTechnicalTermsForSpeech("請比較 C++、API、SQL 與 JD。", "zh-TW"),
    "請比較 C++、API、SQL 與 JD。",
  );

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
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
    ELEVENLABS_VOICE_IDS_JSON: process.env.ELEVENLABS_VOICE_IDS_JSON,
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });

  process.env.ELEVENLABS_API_KEY = "route-elevenlabs-secret";
  process.env.ELEVENLABS_VOICE_ID = TEST_ELEVENLABS_VOICE_ID;
  process.env.ELEVENLABS_VOICE_IDS_JSON = JSON.stringify({
    ja: "21m00Tcm4TlvDq8ikWAM",
  });
  process.env.AZURE_SPEECH_KEY = "route-azure-secret";
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
    "eleven_v3",
  );
  assert.equal(
    response.headers.get("x-interviewthread-speech-provider"),
    "elevenlabs",
  );
  assert.equal(
    response.headers.get("x-interviewthread-speech-fallback"),
    "none",
  );
  assert.match(
    response.headers.get("x-interviewthread-voice-profile") ?? "",
    /^itvp\d+-\d{2}-a$/,
  );
  assert.notEqual(
    response.headers.get("x-interviewthread-voice-profile"),
    "21m00Tcm4TlvDq8ikWAM",
  );
  assert.equal(
    upstream.input,
    "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream?output_format=mp3_44100_128",
  );
  assert.equal(
    new Headers(upstream.init.headers).get("xi-api-key"),
    "route-elevenlabs-secret",
  );
  assert.doesNotMatch(JSON.stringify([...response.headers]), /route-(?:elevenlabs|azure)-secret/);
  assert.doesNotMatch(await response.clone().text(), /route-(?:elevenlabs|azure)-secret/);
});

test("speech route rejects oversized provider audio before and during buffered streaming", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = {
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
    ELEVENLABS_VOICE_IDS_JSON: process.env.ELEVENLABS_VOICE_IDS_JSON,
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });

  process.env.ELEVENLABS_API_KEY = "route-elevenlabs-secret";
  process.env.ELEVENLABS_VOICE_ID = TEST_ELEVENLABS_VOICE_ID;
  process.env.ELEVENLABS_VOICE_IDS_JSON = JSON.stringify({
    "zh-TW": "XB0fDUnXU5powFXDhCwa",
  });
  process.env.AZURE_SPEECH_KEY = "route-azure-secret";
  process.env.AZURE_SPEECH_REGION = "eastus";

  let fetchCount = 0;
  globalThis.fetch = async (input) => {
    fetchCount += 1;
    if (String(input).includes("api.elevenlabs.io")) {
      return new Response(Uint8Array.from([73, 68, 51]), {
        status: 200,
        headers: {
          "content-type": "audio/mpeg",
          "content-length": String(5 * 1024 * 1024 + 1),
        },
      });
    }
    return new Response(Uint8Array.from([73, 68, 51, 4]), {
      status: 200,
      headers: { "content-type": "audio/mpeg" },
    });
  };

  const declaredOversized = await requestBuiltSpeech({
    payload: { locale: "en", text: "Tell me about your strongest result." },
  });
  assert.equal(declaredOversized.status, 200);
  assert.equal(fetchCount, 2, "an oversized primary response should use Azure");
  assert.equal(
    declaredOversized.headers.get("x-interviewthread-speech-fallback"),
    "azure-dragon-hd-omni",
  );

  delete process.env.AZURE_SPEECH_KEY;
  delete process.env.AZURE_SPEECH_REGION;
  globalThis.fetch = async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(3 * 1024 * 1024));
        controller.enqueue(new Uint8Array(3 * 1024 * 1024));
        controller.close();
      },
    });
    return new Response(stream, {
      status: 200,
      headers: { "content-type": "audio/mpeg" },
    });
  };

  const streamedOversized = await requestBuiltSpeech({
    payload: { locale: "zh-TW", text: "請介紹一個你最有把握的專案。" },
  });
  assert.equal(streamedOversized.status, 502);
  assert.equal(
    streamedOversized.headers.get("x-interviewthread-speech-error"),
    "provider_audio_too_large",
  );
  assert.equal(
    streamedOversized.headers.get("x-interviewthread-speech-fallback"),
    "device",
  );
  assert.deepEqual(await streamedOversized.json(), {
    error: "speech_audio_too_large",
  });
});

test("guest non-English speech uses locale-native Azure when no reviewed ElevenLabs voice exists", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = {
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
    ELEVENLABS_VOICE_IDS_JSON: process.env.ELEVENLABS_VOICE_IDS_JSON,
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });

  process.env.ELEVENLABS_API_KEY = "route-elevenlabs-secret";
  process.env.ELEVENLABS_VOICE_ID = TEST_ELEVENLABS_VOICE_ID;
  delete process.env.ELEVENLABS_VOICE_IDS_JSON;
  process.env.AZURE_SPEECH_KEY = "route-azure-secret";
  process.env.AZURE_SPEECH_REGION = "eastus";
  let fetchCount = 0;
  globalThis.fetch = async (input, init) => {
    fetchCount += 1;
    if (String(input).includes("api.elevenlabs.io"))
      return new Response("ElevenLabs unavailable", { status: 503 });
    assert.match(String(init?.body || ""), /zh-TW-HsiaoChenNeural/);
    assert.doesNotMatch(
      String(init?.body || ""),
      /en-US-Ava:DragonHDOmniLatestNeural/,
    );
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
  assert.equal(
    fetchCount,
    1,
    "a non-English locale without an ElevenLabs locale override must start with Azure's locale-native voice",
  );
  assert.equal(
    response.headers.get("x-interviewthread-speech-model"),
    "azure-standard-neural",
  );
  assert.equal(
    response.headers.get("x-interviewthread-speech-provider"),
    "azure_speech",
  );
  assert.equal(
    response.headers.get("x-interviewthread-speech-fallback"),
    "azure-standard-neural",
  );
  assert.match(
    response.headers.get("x-interviewthread-voice-profile") ?? "",
    /^itvp\d+-05-d$/,
  );
});

test("non-English Azure failure never attempts the English Ava Dragon voice", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = {
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
    ELEVENLABS_VOICE_IDS_JSON: process.env.ELEVENLABS_VOICE_IDS_JSON,
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });

  process.env.ELEVENLABS_API_KEY = "route-elevenlabs-secret";
  process.env.ELEVENLABS_VOICE_ID = TEST_ELEVENLABS_VOICE_ID;
  delete process.env.ELEVENLABS_VOICE_IDS_JSON;
  process.env.AZURE_SPEECH_KEY = "route-azure-secret";
  process.env.AZURE_SPEECH_REGION = "eastus";
  const providerBodies = [];
  globalThis.fetch = async (_input, init) => {
    providerBodies.push(String(init?.body || ""));
    return new Response("native voice unavailable", { status: 503 });
  };

  const response = await requestBuiltSpeech({
    payload: { locale: "zh-TW", text: "請介紹一個你最有把握的專案。" },
  });
  assert.equal(response.status, 503);
  assert.equal(providerBodies.length, 1);
  assert.match(providerBodies[0], /zh-TW-HsiaoChenNeural/);
  assert.doesNotMatch(
    providerBodies.join("\n"),
    /en-US-Ava:DragonHDOmniLatestNeural/,
  );
  assert.equal(
    response.headers.get("x-interviewthread-speech-fallback"),
    "device",
  );
});

test("speech route enforces per-visitor and global paid-provider quotas", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = {
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
    ELEVENLABS_VOICE_IDS_JSON: process.env.ELEVENLABS_VOICE_IDS_JSON,
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });

  process.env.ELEVENLABS_API_KEY = "route-elevenlabs-secret";
  process.env.ELEVENLABS_VOICE_ID = TEST_ELEVENLABS_VOICE_ID;
  delete process.env.ELEVENLABS_VOICE_IDS_JSON;
  delete process.env.AZURE_SPEECH_KEY;
  delete process.env.AZURE_SPEECH_REGION;
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
  assert.equal(fetchCount, 30, "a rejected request must not contact a paid provider");

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
    "checking the durable global cap must not contact a paid provider",
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

  const dailyWindowMilliseconds = 24 * 60 * 60 * 1_000;
  const dailyWindowStart =
    Math.floor(Date.now() / dailyWindowMilliseconds) * dailyWindowMilliseconds;
  assert.equal(
    await consumeGlobalSpeechCharacterQuota(
      createSpeechQuotaDb(0, 49_900),
      {
        windowStart: dailyWindowStart,
        windowMilliseconds: dailyWindowMilliseconds,
        characters: 100,
        limit: 50_000,
      },
    ),
    false,
  );
  assert.equal(
    await consumeGlobalSpeechCharacterQuota(
      createSpeechQuotaDb(0, 49_901),
      {
        windowStart: dailyWindowStart,
        windowMilliseconds: dailyWindowMilliseconds,
        characters: 100,
        limit: 50_000,
      },
    ),
    true,
  );
});

test("speech route rejects unsafe payloads before contacting the provider", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = {
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
    ELEVENLABS_VOICE_IDS_JSON: process.env.ELEVENLABS_VOICE_IDS_JSON,
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
  };
  let fetchCount = 0;
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });
  process.env.ELEVENLABS_API_KEY = "route-elevenlabs-secret";
  process.env.ELEVENLABS_VOICE_ID = TEST_ELEVENLABS_VOICE_ID;
  delete process.env.ELEVENLABS_VOICE_IDS_JSON;
  delete process.env.AZURE_SPEECH_KEY;
  delete process.env.AZURE_SPEECH_REGION;
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
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
    ELEVENLABS_VOICE_IDS_JSON: process.env.ELEVENLABS_VOICE_IDS_JSON,
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });

  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.ELEVENLABS_VOICE_ID;
  delete process.env.ELEVENLABS_VOICE_IDS_JSON;
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
    /AZURE|ELEVENLABS|SPEECH[_ -]?(?:KEY|REGION)|api[_ -]?key|voice[_ -]?id/i,
  );

  process.env.ELEVENLABS_API_KEY = "route-elevenlabs-secret";
  process.env.ELEVENLABS_VOICE_ID = TEST_ELEVENLABS_VOICE_ID;
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
  assert.equal(
    unavailable.headers.get("x-interviewthread-speech-fallback"),
    "device",
  );
  assert.equal(
    unavailable.headers.get("x-interviewthread-speech-error"),
    "provider_unavailable",
  );
  const unavailableBody = await unavailable.text();
  assert.doesNotMatch(unavailableBody, /route-elevenlabs-secret/);
  assert.doesNotMatch(unavailableBody, /internal provider detail/);
});

test("speech route labels a provider timeout and hands off to device voice", async (t) => {
  const originalFetch = globalThis.fetch;
  const previous = {
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
    ELEVENLABS_VOICE_IDS_JSON: process.env.ELEVENLABS_VOICE_IDS_JSON,
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    restoreEnvironment(previous);
  });

  process.env.ELEVENLABS_API_KEY = "route-elevenlabs-secret";
  process.env.ELEVENLABS_VOICE_ID = TEST_ELEVENLABS_VOICE_ID;
  delete process.env.ELEVENLABS_VOICE_IDS_JSON;
  delete process.env.AZURE_SPEECH_KEY;
  delete process.env.AZURE_SPEECH_REGION;
  globalThis.fetch = async () => {
    throw new DOMException("provider timed out", "TimeoutError");
  };

  const response = await requestBuiltSpeech({
    payload: { locale: "en", text: "Tell me about your strongest result." },
  });
  assert.equal(response.status, 504);
  assert.equal(
    response.headers.get("x-interviewthread-speech-error"),
    "provider_timeout",
  );
  assert.equal(
    response.headers.get("x-interviewthread-speech-fallback"),
    "device",
  );
  assert.deepEqual(await response.json(), { error: "speech_timeout" });
});

test("read-aloud provider disclosure and browser labels match the production chain", () => {
  const pageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const statusSource = readFileSync(
    new URL("../app/interview-speech-status-copy.ts", import.meta.url),
    "utf8",
  );
  const faqSource = readFileSync(new URL("../app/faq-copy.ts", import.meta.url), "utf8");
  const informationSource = readFileSync(
    new URL("../app/site-information.ts", import.meta.url),
    "utf8",
  );
  const routeSource = readFileSync(
    new URL("../app/api/speech/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(statusSource, /ElevenLabs v3/);
  assert.match(statusSource, /Azure Dragon HD Omni/);
  assert.match(pageSource, /speechModelDisplayName/);
  assert.doesNotMatch(pageSource, /ELEVENLABS_(?:API_KEY|VOICE_ID)/);
  assert.match(routeSource, /process\.env\.ELEVENLABS_API_KEY/);
  assert.match(routeSource, /process\.env\.ELEVENLABS_VOICE_ID/);
  assert.match(faqSource, /ElevenLabs \/ Microsoft Azure Speech/);
  assert.match(informationSource, /sent to ElevenLabs to generate the primary audio response/);
  assert.match(informationSource, /Microsoft Azure Speech as a fallback/);
  assert.match(informationSource, /不會保存音訊/);
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
  assert.match(pageSource, /CLOUD_READ_ALOUD_CONSENT_KEY/);
  assert.match(pageSource, /window\.confirm\(/);
  assert.match(pageSource, /void unlockInterviewAudioContext\(\)/);
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
