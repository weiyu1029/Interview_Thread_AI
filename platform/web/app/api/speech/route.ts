import {
  buildAzureSpeechRequest,
  buildAzureStandardSpeechRequest,
  isTtsLocale,
  normalizeTtsText,
  TTS_FALLBACK_MODEL_ID,
  TTS_MAX_CHARACTERS,
  TTS_MODEL_ID,
} from "../../interview-tts.ts";
import { getAppUser } from "../../auth";
import {
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
const MAX_LOCAL_SPEECH_WINDOWS = 5_000;
const speechWindows = new Map<
  string,
  { count: number; resetAt: number }
>();

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

  const apiKey = process.env.AZURE_SPEECH_KEY?.trim();
  const region = process.env.AZURE_SPEECH_REGION?.trim();
  if (!apiKey || !region)
    return reply("premium_unavailable", 503, "degraded", "azure_speech");

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
  } catch {
    return reply("speech_quota_unavailable", 503, "unavailable");
  }

  try {
    const attempts = [
      {
        model: TTS_MODEL_ID,
        request: buildAzureSpeechRequest({ text, locale, apiKey, region }),
      },
      {
        model: TTS_FALLBACK_MODEL_ID,
        request: buildAzureStandardSpeechRequest({
          text,
          locale,
          apiKey,
          region,
        }),
      },
    ];
    let audio: ArrayBuffer | null = null;
    let contentType = "audio/mpeg";
    let selectedModel = TTS_MODEL_ID;
    const providerSignal = AbortSignal.any([
      request.signal,
      AbortSignal.timeout(12_000),
    ]);
    for (const [index, attempt] of attempts.entries()) {
      const providerResponse = await fetch(attempt.request.url, {
        ...attempt.request.init,
        signal: providerSignal,
      });
      if (providerResponse.ok) {
        const candidate = await providerResponse.arrayBuffer();
        if (candidate.byteLength) {
          audio = candidate;
          contentType =
            providerResponse.headers.get("content-type") || "audio/mpeg";
          selectedModel = attempt.model;
          break;
        }
      }
      if (providerResponse.status === 429)
        return reply(
          "speech_rate_limited",
          429,
          "rate_limited",
          "azure_speech",
          {
            "Retry-After":
              providerResponse.headers.get("retry-after") || "60",
          },
        );
      const mayTryStandardFallback =
        index === 0 &&
        [400, 404, 422, 500, 502, 503, 504].includes(
          providerResponse.status,
        );
      if (mayTryStandardFallback)
        await providerResponse.body?.cancel().catch(() => undefined);
      if (!mayTryStandardFallback)
        return reply("speech_unavailable", 502, "error", "azure_speech");
    }
    if (!audio)
      return reply("speech_unavailable", 502, "error", "azure_speech");
    logObservability({
      requestId,
      route: "api_speech",
      outcome: "ok",
      status: 200,
      durationMs: elapsedMilliseconds(startedAt),
      provider: "azure_speech",
      release: process.env.APP_RELEASE,
    });
    return new Response(audio, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        "Content-Type": contentType,
        "Content-Length": String(audio.byteLength),
        "X-InterviewThread-Speech-Model": selectedModel,
        "X-Request-ID": requestId,
      },
    });
  } catch (error) {
    if (request.signal.aborted)
      return reply("request_cancelled", 499, "error", "azure_speech");
    if (
      error instanceof DOMException &&
      ["AbortError", "TimeoutError"].includes(error.name)
    )
      return reply("speech_timeout", 504, "error", "azure_speech");
    return reply("speech_unavailable", 503, "unavailable", "azure_speech");
  }
}
