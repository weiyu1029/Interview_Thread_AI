import {
  buildElevenLabsSpeechRequest,
  buildAzureSpeechRequest,
  buildAzureStandardSpeechRequest,
  elevenLabsVoiceIdForLocale,
  isAzureSpeechRegion,
  isElevenLabsVoiceId,
  isTtsLocale,
  normalizeTtsText,
  ttsVoiceProfileHeader,
  TTS_FALLBACK_MODEL_ID,
  TTS_FINAL_CLOUD_FALLBACK_MODEL_ID,
  TTS_MAX_CHARACTERS,
  TTS_MODEL_ID,
} from "../../interview-tts.ts";
import { getAppUser } from "../../auth";
import {
  consumeGlobalSpeechCharacterQuota,
  consumeGlobalSpeechQuota,
  type SpeechQuotaDatabase,
} from "../../speech-quota.ts";
import {
  createRequestId,
  elapsedMilliseconds,
  logObservability,
  type ObservabilityOutcome,
  type ObservabilityProvider,
} from "../../observability.ts";
import {
  hasJsonContentType,
  hasSameOrigin,
  readJsonBody,
  validateContentLength,
} from "../request-security.ts";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};
const MAX_SPEECH_REQUEST_BYTES = 16 * 1024;
const SPEECH_WINDOW_MS = 10 * 60 * 1_000;
const SIGNED_IN_SPEECH_LIMIT = 100;
const GUEST_SPEECH_LIMIT = 30;
const GLOBAL_SPEECH_LIMIT = 300;
const SPEECH_DAILY_WINDOW_MS = 24 * 60 * 60 * 1_000;
const DEFAULT_DAILY_SPEECH_CHARACTER_LIMIT = 50_000;
const MAX_LOCAL_SPEECH_WINDOWS = 5_000;
// v3 is generated from a complete interview question. Give the primary and
// fallback providers enough time to finish a short prompt without causing a
// false fallback, while retaining a hard ceiling for a stalled upstream.
const PROVIDER_ATTEMPT_TIMEOUT_MS = 15_000;
const PROVIDER_TOTAL_TIMEOUT_MS = 45_000;
const MAX_SPEECH_AUDIO_BYTES = 5 * 1024 * 1024;
const speechWindows = new Map<
  string,
  { count: number; resetAt: number }
>();
const localDailySpeechCharacters = new Map<
  number,
  { count: number; resetAt: number }
>();

async function readBoundedProviderAudio(response: Response) {
  const declaredLength = response.headers.get("content-length")?.trim();
  if (declaredLength && /^\d+$/.test(declaredLength)) {
    const declaredBytes = Number(declaredLength);
    if (declaredBytes > MAX_SPEECH_AUDIO_BYTES) {
      await response.body?.cancel().catch(() => undefined);
      return { ok: false as const, reason: "too_large" as const };
    }
  }

  const reader = response.body?.getReader();
  if (!reader) return { ok: false as const, reason: "empty" as const };
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value?.byteLength) continue;
    byteLength += value.byteLength;
    if (byteLength > MAX_SPEECH_AUDIO_BYTES) {
      await reader.cancel("speech_audio_too_large").catch(() => undefined);
      return { ok: false as const, reason: "too_large" as const };
    }
    chunks.push(value);
  }
  if (!byteLength) return { ok: false as const, reason: "empty" as const };

  const audio = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    audio.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true as const, audio };
}

function jsonError(
  error: string,
  status: number,
  requestId: string,
  headers: HeadersInit = {},
) {
  return Response.json(
    { error },
    {
      status,
      headers: { ...PRIVATE_HEADERS, "X-Request-ID": requestId, ...headers },
    },
  );
}

function rateLimitExceeded(key: string, limit: number) {
  const now = Date.now();
  const current = speechWindows.get(key);
  if (!current || current.resetAt <= now) {
    for (const [entryKey, entry] of speechWindows) {
      if (entry.resetAt <= now) speechWindows.delete(entryKey);
    }
    while (speechWindows.size >= MAX_LOCAL_SPEECH_WINDOWS) {
      const oldestKey = speechWindows.keys().next().value as string | undefined;
      if (!oldestKey) break;
      speechWindows.delete(oldestKey);
    }
    speechWindows.set(key, { count: 1, resetAt: now + SPEECH_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > limit;
}

async function guestRateKey(request: Request) {
  const address = request.headers.get("cf-connecting-ip")?.trim();
  if (!address) return null;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`interviewthread-speech:${address}`),
  );
  return `guest:${Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")}`;
}

async function globalSpeechLimitExceeded(windowStart: number) {
  try {
    const { env } = await import("cloudflare:workers");
    if (!env.DB)
      throw new Error("The InterviewThread speech quota is unavailable.");
    return consumeGlobalSpeechQuota(env.DB as unknown as SpeechQuotaDatabase, {
      windowStart,
      windowMilliseconds: SPEECH_WINDOW_MS,
      limit: GLOBAL_SPEECH_LIMIT,
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ERR_UNSUPPORTED_ESM_URL_SCHEME"
    )
      return rateLimitExceeded("global:development", GLOBAL_SPEECH_LIMIT);
    throw error;
  }
}

function dailySpeechCharacterLimit() {
  const configured = Number(process.env.TTS_DAILY_CHARACTER_LIMIT);
  return Number.isInteger(configured) && configured >= 1_000
    ? Math.min(configured, 5_000_000)
    : DEFAULT_DAILY_SPEECH_CHARACTER_LIMIT;
}

function localDailySpeechCharacterLimitExceeded(
  windowStart: number,
  characters: number,
  limit: number,
) {
  const current = localDailySpeechCharacters.get(windowStart);
  const next = (current?.count || 0) + characters;
  localDailySpeechCharacters.set(windowStart, {
    count: next,
    resetAt: windowStart + SPEECH_DAILY_WINDOW_MS,
  });
  for (const [key, entry] of localDailySpeechCharacters) {
    if (entry.resetAt <= Date.now()) localDailySpeechCharacters.delete(key);
  }
  return next > limit;
}

async function globalDailySpeechCharacterLimitExceeded(
  windowStart: number,
  characters: number,
) {
  const limit = dailySpeechCharacterLimit();
  try {
    const { env } = await import("cloudflare:workers");
    if (!env.DB)
      throw new Error("The InterviewThread speech quota is unavailable.");
    return consumeGlobalSpeechCharacterQuota(
      env.DB as unknown as SpeechQuotaDatabase,
      {
        windowStart,
        windowMilliseconds: SPEECH_DAILY_WINDOW_MS,
        characters,
        limit,
      },
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ERR_UNSUPPORTED_ESM_URL_SCHEME"
    )
      return localDailySpeechCharacterLimitExceeded(
        windowStart,
        characters,
        limit,
      );
    throw error;
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = createRequestId();
  const reply = (
    error: string,
    status: number,
    outcome: ObservabilityOutcome,
    provider: ObservabilityProvider = "internal",
    headers: HeadersInit = {},
  ) => {
    logObservability({
      requestId,
      route: "api_speech",
      outcome,
      status,
      durationMs: elapsedMilliseconds(startedAt),
      provider,
      release: process.env.APP_RELEASE,
    });
    return jsonError(error, status, requestId, headers);
  };

  if (!hasSameOrigin(request)) return reply("invalid_origin", 403, "forbidden");
  if (!hasJsonContentType(request))
    return reply("invalid_request", 415, "invalid");
  const contentLength = validateContentLength(
    request,
    MAX_SPEECH_REQUEST_BYTES,
  );
  if (!contentLength.ok)
    return reply(
      contentLength.status === 413 ? "payload_too_large" : "invalid_request",
      contentLength.status,
      "invalid",
    );

  const user = await getAppUser();
  const body = await readJsonBody<Record<string, unknown>>(
    request,
    MAX_SPEECH_REQUEST_BYTES,
  );
  if (!body.ok)
    return reply(
      body.status === 413 ? "payload_too_large" : "invalid_request",
      body.status,
      "invalid",
    );
  const payload = body.payload;

  const text = payload.text;
  const locale = payload.locale;
  if (
    typeof text !== "string" ||
    text.length > TTS_MAX_CHARACTERS ||
    !isTtsLocale(locale) ||
    !normalizeTtsText(text)
  )
    return reply("invalid_request", 400, "invalid");
  const normalizedText = normalizeTtsText(text);

  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const elevenLabsVoiceId = elevenLabsVoiceIdForLocale(
    locale,
    process.env.ELEVENLABS_VOICE_ID?.trim(),
    process.env.ELEVENLABS_VOICE_IDS_JSON?.trim(),
  );
  const azureApiKey = process.env.AZURE_SPEECH_KEY?.trim();
  const azureRegion = process.env.AZURE_SPEECH_REGION?.trim();
  const elevenLabsConfigured = Boolean(
    elevenLabsApiKey && isElevenLabsVoiceId(elevenLabsVoiceId),
  );
  const azureConfigured = Boolean(
    azureApiKey && isAzureSpeechRegion(azureRegion),
  );
  if (!elevenLabsConfigured && !azureConfigured)
    return reply("premium_unavailable", 503, "degraded", "internal", {
      "X-InterviewThread-Speech-Error": "provider_not_configured",
      "X-InterviewThread-Speech-Fallback": "device",
    });

  const limiterKey = user
    ? `user:${user.userId}`
    : await guestRateKey(request);
  if (!limiterKey)
    return reply("sign_in_required", 401, "unauthorized");
  const retryAfter = String(Math.ceil(SPEECH_WINDOW_MS / 1_000));
  if (
    rateLimitExceeded(
      limiterKey,
      user ? SIGNED_IN_SPEECH_LIMIT : GUEST_SPEECH_LIMIT,
    )
  )
    return reply("speech_rate_limited", 429, "rate_limited", "internal", {
      "Retry-After": retryAfter,
    });
  try {
    const windowStart =
      Math.floor(Date.now() / SPEECH_WINDOW_MS) * SPEECH_WINDOW_MS;
    if (
      await globalSpeechLimitExceeded(windowStart)
    )
      return reply("speech_rate_limited", 429, "rate_limited", "internal", {
        "Retry-After": retryAfter,
      });
    const dailyWindowStart =
      Math.floor(Date.now() / SPEECH_DAILY_WINDOW_MS) * SPEECH_DAILY_WINDOW_MS;
    if (
      await globalDailySpeechCharacterLimitExceeded(
        dailyWindowStart,
        normalizedText.length,
      )
    )
      return reply(
        "speech_daily_limit_reached",
        429,
        "rate_limited",
        "internal",
        {
          "Retry-After": String(
            Math.max(
              1,
              Math.ceil(
                (dailyWindowStart + SPEECH_DAILY_WINDOW_MS - Date.now()) /
                  1_000,
              ),
            ),
          ),
          "X-InterviewThread-Speech-Error": "daily_character_limit",
          "X-InterviewThread-Speech-Fallback": "device",
        },
      );
  } catch {
    return reply("speech_quota_unavailable", 503, "unavailable");
  }

  try {
    const attempts: Array<{
      model: string;
      provider: "elevenlabs" | "azure_speech";
      fallback: "none" | "azure-dragon-hd-omni" | "azure-standard-neural";
      voiceProfile: string;
      request: ReturnType<
        | typeof buildElevenLabsSpeechRequest
        | typeof buildAzureSpeechRequest
        | typeof buildAzureStandardSpeechRequest
      >;
    }> = [];
    if (elevenLabsConfigured) {
      attempts.push({
        model: TTS_MODEL_ID,
        provider: "elevenlabs",
        fallback: "none",
        voiceProfile: ttsVoiceProfileHeader(locale, "elevenlabs-tts"),
        request: buildElevenLabsSpeechRequest({
          text,
          locale,
          apiKey: elevenLabsApiKey!,
          voiceId: elevenLabsVoiceId!,
        }),
      });
    }
    if (azureConfigured) {
      const azureNativeAttempt = {
        model: TTS_FINAL_CLOUD_FALLBACK_MODEL_ID,
        provider: "azure_speech" as const,
        fallback: "azure-standard-neural" as const,
        voiceProfile: ttsVoiceProfileHeader(locale, "azure-native"),
        request: buildAzureStandardSpeechRequest({
          text,
          locale,
          apiKey: azureApiKey!,
          region: azureRegion!,
        }),
      };
      if (locale === "en") {
        attempts.push({
          model: TTS_FALLBACK_MODEL_ID,
          provider: "azure_speech",
          fallback: "azure-dragon-hd-omni",
          voiceProfile: ttsVoiceProfileHeader(locale, "azure-hd-en"),
          request: buildAzureSpeechRequest({
            text,
            locale,
            apiKey: azureApiKey!,
            region: azureRegion!,
          }),
        });
      }
      // Non-English locales receive only their exact locale-native Azure
      // voice. The English-trained Ava Dragon voice is never constructed for
      // them, even after the native provider attempt fails.
      attempts.push(azureNativeAttempt);
    }

    const providerDeadline = Date.now() + PROVIDER_TOTAL_TIMEOUT_MS;
    let anyProviderTimedOut = false;
    let anyProviderAudioTooLarge = false;
    let lastProvider: "elevenlabs" | "azure_speech" = elevenLabsConfigured
      ? "elevenlabs"
      : "azure_speech";
    for (const attempt of attempts) {
      lastProvider = attempt.provider;
      const remainingMilliseconds = providerDeadline - Date.now();
      if (remainingMilliseconds <= 0) {
        anyProviderTimedOut = true;
        break;
      }
      const attemptStartedAt = Date.now();
      const providerSignal = AbortSignal.any([
        request.signal,
        AbortSignal.timeout(
          Math.max(
            250,
            Math.min(PROVIDER_ATTEMPT_TIMEOUT_MS, remainingMilliseconds),
          ),
        ),
      ]);
      try {
        const providerResponse = await fetch(attempt.request.url, {
          ...attempt.request.init,
          signal: providerSignal,
        });
        const contentType =
          providerResponse.headers.get("content-type") || "";
        if (
          providerResponse.ok &&
          (contentType.startsWith("audio/") ||
            contentType === "application/octet-stream")
        ) {
          const audioResult = await readBoundedProviderAudio(providerResponse);
          if (!audioResult.ok && audioResult.reason === "too_large") {
            anyProviderAudioTooLarge = true;
            logObservability({
              requestId,
              route: "api_speech",
              outcome: "degraded",
              status: 502,
              durationMs: elapsedMilliseconds(attemptStartedAt),
              provider: attempt.provider,
              release: process.env.APP_RELEASE,
            });
            continue;
          }
          if (audioResult.ok) {
            const audio = audioResult.audio;
            logObservability({
              requestId,
              route: "api_speech",
              outcome: "ok",
              status: 200,
              durationMs: elapsedMilliseconds(startedAt),
              provider: attempt.provider,
              release: process.env.APP_RELEASE,
            });
            return new Response(audio, {
              status: 200,
              headers: {
                ...PRIVATE_HEADERS,
                "Content-Type": contentType || "audio/mpeg",
                "Content-Length": String(audio.byteLength),
                "X-InterviewThread-Speech-Model": attempt.model,
                "X-InterviewThread-Speech-Provider": attempt.provider,
                "X-InterviewThread-Speech-Fallback": attempt.fallback,
                "X-InterviewThread-Speech-Locale": locale,
                "X-InterviewThread-Voice-Profile": attempt.voiceProfile,
                "X-Request-ID": requestId,
              },
            });
          }
        }
        logObservability({
          requestId,
          route: "api_speech",
          outcome:
            providerResponse.status === 429 ? "rate_limited" : "degraded",
          status: providerResponse.status,
          durationMs: elapsedMilliseconds(attemptStartedAt),
          provider: attempt.provider,
          release: process.env.APP_RELEASE,
        });
        await providerResponse.body?.cancel().catch(() => undefined);
      } catch (error) {
        if (request.signal.aborted)
          return reply("request_cancelled", 499, "error", attempt.provider, {
            "X-InterviewThread-Speech-Error": "request_cancelled",
            "X-InterviewThread-Speech-Fallback": "device",
          });
        const timedOut =
          error instanceof DOMException &&
          ["AbortError", "TimeoutError"].includes(error.name);
        anyProviderTimedOut ||= timedOut;
        logObservability({
          requestId,
          route: "api_speech",
          outcome: timedOut ? "timeout" : "degraded",
          status: timedOut ? 504 : 503,
          durationMs: elapsedMilliseconds(attemptStartedAt),
          provider: attempt.provider,
          release: process.env.APP_RELEASE,
        });
      }
    }

    return reply(
      anyProviderTimedOut
        ? "speech_timeout"
        : anyProviderAudioTooLarge
          ? "speech_audio_too_large"
          : "speech_unavailable",
      anyProviderTimedOut ? 504 : anyProviderAudioTooLarge ? 502 : 503,
      anyProviderTimedOut ? "timeout" : "unavailable",
      lastProvider,
      {
        "X-InterviewThread-Speech-Error": anyProviderTimedOut
          ? "provider_timeout"
          : anyProviderAudioTooLarge
            ? "provider_audio_too_large"
            : "provider_unavailable",
        "X-InterviewThread-Speech-Fallback": "device",
      },
    );
  } catch (error) {
    if (request.signal.aborted)
      return reply("request_cancelled", 499, "error", "internal", {
        "X-InterviewThread-Speech-Error": "request_cancelled",
        "X-InterviewThread-Speech-Fallback": "device",
      });
    if (
      error instanceof DOMException &&
      ["AbortError", "TimeoutError"].includes(error.name)
    )
      return reply("speech_timeout", 504, "timeout", "internal", {
        "X-InterviewThread-Speech-Error": "provider_timeout",
        "X-InterviewThread-Speech-Fallback": "device",
      });
    return reply("speech_unavailable", 503, "unavailable", "internal", {
      "X-InterviewThread-Speech-Error": "provider_unavailable",
      "X-InterviewThread-Speech-Fallback": "device",
    });
  }
}
