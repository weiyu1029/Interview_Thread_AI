import {
  DIALOGUE_CONSENT_VERSION,
  DIALOGUE_MAX_CHARACTERS,
  DIALOGUE_MAX_OUTPUT_BYTES,
  ELEVENLABS_DIALOGUE_FALLBACK_MODEL_ID,
  ELEVENLABS_DIALOGUE_MODEL_ID,
  buildElevenLabsDialogueRequest,
  type DialogueModel,
} from "../../interview-dialogue.ts";
import {
  elevenLabsVoiceIdForLocale,
  isElevenLabsVoiceId,
  isTtsLocale,
  normalizeTtsText,
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
const MAX_DIALOGUE_REQUEST_BYTES = 16 * 1024;
const WINDOW_MS = 10 * 60 * 1_000;
const PER_USER_LIMIT = 20;
const GLOBAL_LIMIT = 100;
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1_000;
const DEFAULT_DAILY_CHARACTER_LIMIT = 40_000;
const PROVIDER_ATTEMPT_TIMEOUT_MS = 20_000;
const PROVIDER_TOTAL_TIMEOUT_MS = 40_000;
const windows = new Map<string, { count: number; resetAt: number }>();
const localDailyCharacters = new Map<number, number>();

function json(error: string, status: number, requestId: string) {
  return Response.json(
    { error },
    { status, headers: { ...PRIVATE_HEADERS, "X-Request-ID": requestId } },
  );
}

function localLimitExceeded(key: string, limit: number) {
  const now = Date.now();
  for (const [entryKey, entry] of windows) {
    if (entry.resetAt <= now) windows.delete(entryKey);
  }
  const current = windows.get(key);
  if (!current) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > limit;
}

function dailyCharacterLimit() {
  const configured = Number(process.env.DIALOGUE_DAILY_CHARACTER_LIMIT);
  return Number.isSafeInteger(configured) && configured >= 1_000
    ? Math.min(configured, 2_000_000)
    : DEFAULT_DAILY_CHARACTER_LIMIT;
}

async function durableLimitsExceeded(characters: number) {
  const now = Date.now();
  const requestWindow = Math.floor(now / WINDOW_MS) * WINDOW_MS;
  const dailyWindow = Math.floor(now / DAILY_WINDOW_MS) * DAILY_WINDOW_MS;
  const characterLimit = dailyCharacterLimit();
  try {
    const { env } = await import("cloudflare:workers");
    if (!env.DB) throw new Error("speech_quota_unavailable");
    const db = env.DB as unknown as SpeechQuotaDatabase;
    if (
      await consumeGlobalSpeechQuota(db, {
        windowStart: requestWindow,
        windowMilliseconds: WINDOW_MS,
        limit: GLOBAL_LIMIT,
      })
    )
      return true;
    return consumeGlobalSpeechCharacterQuota(db, {
      windowStart: dailyWindow,
      windowMilliseconds: DAILY_WINDOW_MS,
      characters,
      limit: characterLimit,
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ERR_UNSUPPORTED_ESM_URL_SCHEME"
    ) {
      const next = (localDailyCharacters.get(dailyWindow) || 0) + characters;
      localDailyCharacters.clear();
      localDailyCharacters.set(dailyWindow, next);
      return (
        localLimitExceeded("global:development", GLOBAL_LIMIT) ||
        next > characterLimit
      );
    }
    throw error;
  }
}

async function readBoundedAudio(response: Response) {
  const contentType = response.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  if (
    !contentType ||
    (!contentType.startsWith("audio/") &&
      contentType !== "application/octet-stream")
  )
    return null;
  const declaredLength = response.headers.get("content-length")?.trim();
  if (declaredLength && /^\d+$/.test(declaredLength)) {
    const declaredBytes = Number(declaredLength);
    if (declaredBytes > DIALOGUE_MAX_OUTPUT_BYTES) {
      await response.body?.cancel("dialogue_audio_too_large").catch(() => undefined);
      return null;
    }
  }
  const reader = response.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.byteLength) continue;
      total += value.byteLength;
      if (total > DIALOGUE_MAX_OUTPUT_BYTES) {
        await reader.cancel("dialogue_audio_too_large").catch(() => undefined);
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  if (!total) return null;
  const audio = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    audio.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { audio, contentType };
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = createRequestId();
  const reply = (
    error: string,
    status: number,
    outcome: ObservabilityOutcome,
  ) => {
    logObservability({
      requestId,
      route: "api_interview_dialogue",
      outcome,
      status,
      durationMs: elapsedMilliseconds(startedAt),
      provider: status >= 500 ? "elevenlabs" : "internal",
      release: process.env.APP_RELEASE,
    });
    return json(error, status, requestId);
  };

  if (!hasSameOrigin(request)) return reply("invalid_origin", 403, "forbidden");
  if (!hasJsonContentType(request))
    return reply("invalid_request", 415, "invalid");
  const contentLength = validateContentLength(request, MAX_DIALOGUE_REQUEST_BYTES);
  if (!contentLength.ok)
    return reply(
      contentLength.status === 413 ? "payload_too_large" : "invalid_request",
      contentLength.status,
      "invalid",
    );
  const user = await getAppUser();
  if (!user) return reply("sign_in_required", 401, "unauthorized");
  const body = await readJsonBody<Record<string, unknown>>(
    request,
    MAX_DIALOGUE_REQUEST_BYTES,
  );
  if (!body.ok)
    return reply(
      body.status === 413 ? "payload_too_large" : "invalid_request",
      body.status,
      "invalid",
    );
  const { text, locale, consent_version: consentVersion } = body.payload;
  if (
    typeof text !== "string" ||
    text.length > DIALOGUE_MAX_CHARACTERS ||
    !isTtsLocale(locale) ||
    consentVersion !== DIALOGUE_CONSENT_VERSION ||
    !normalizeTtsText(text)
  )
    return reply("invalid_request", 400, "invalid");
  const normalizedText = normalizeTtsText(text);

  if (process.env.ELEVENLABS_DIALOGUE_ENABLED?.trim().toLowerCase() !== "true")
    return reply("dialogue_unavailable", 503, "degraded");
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = elevenLabsVoiceIdForLocale(
    locale,
    process.env.ELEVENLABS_VOICE_ID?.trim(),
    process.env.ELEVENLABS_VOICE_IDS_JSON?.trim(),
  );
  if (!apiKey || !isElevenLabsVoiceId(voiceId))
    return reply("dialogue_unavailable", 503, "degraded");
  if (localLimitExceeded(`user:${user.userId}`, PER_USER_LIMIT))
    return reply("dialogue_rate_limited", 429, "rate_limited");
  try {
    if (await durableLimitsExceeded(normalizedText.length))
      return reply("dialogue_rate_limited", 429, "rate_limited");
  } catch {
    return reply("speech_quota_unavailable", 503, "unavailable");
  }

  const models: DialogueModel[] = [
    ELEVENLABS_DIALOGUE_MODEL_ID,
    ELEVENLABS_DIALOGUE_FALLBACK_MODEL_ID,
  ];
  const deadline = Date.now() + PROVIDER_TOTAL_TIMEOUT_MS;
  let providerRateLimited = false;
  for (const model of models) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    const attemptStartedAt = Date.now();
    try {
      const providerRequest = buildElevenLabsDialogueRequest({
        text,
        locale,
        apiKey,
        voiceId,
        model,
        zeroRetention:
          process.env.ELEVENLABS_ZERO_RETENTION?.trim().toLowerCase() === "true",
      });
      const providerResponse = await fetch(providerRequest.url, {
        ...providerRequest.init,
        signal: AbortSignal.any([
          request.signal,
          AbortSignal.timeout(
            Math.max(250, Math.min(PROVIDER_ATTEMPT_TIMEOUT_MS, remaining)),
          ),
        ]),
      });
      providerRateLimited ||= providerResponse.status === 429;
      if (providerResponse.ok) {
        const output = await readBoundedAudio(providerResponse);
        if (output) {
          logObservability({
            requestId,
            route: "api_interview_dialogue",
            outcome: "ok",
            status: 200,
            durationMs: elapsedMilliseconds(startedAt),
            provider: "elevenlabs",
            release: process.env.APP_RELEASE,
          });
          return new Response(output.audio, {
            status: 200,
            headers: {
              ...PRIVATE_HEADERS,
              "Content-Type": output.contentType,
              "Content-Length": String(output.audio.byteLength),
              "X-Request-ID": requestId,
              "X-InterviewThread-Speech-Model": model,
              "X-InterviewThread-Speech-Provider": "elevenlabs",
              "X-InterviewThread-Speech-Fallback":
                model === ELEVENLABS_DIALOGUE_MODEL_ID ? "none" : model,
            },
          });
        }
      }
      logObservability({
        requestId,
        route: "api_interview_dialogue",
        outcome: providerResponse.status === 429 ? "rate_limited" : "degraded",
        status: providerResponse.status,
        durationMs: elapsedMilliseconds(attemptStartedAt),
        provider: "elevenlabs",
        release: process.env.APP_RELEASE,
      });
      await providerResponse.body?.cancel().catch(() => undefined);
    } catch (error) {
      if (request.signal.aborted)
        return reply("request_cancelled", 499, "error");
      const timedOut =
        error instanceof DOMException &&
        ["AbortError", "TimeoutError"].includes(error.name);
      logObservability({
        requestId,
        route: "api_interview_dialogue",
        outcome: timedOut ? "timeout" : "degraded",
        status: timedOut ? 504 : 503,
        durationMs: elapsedMilliseconds(attemptStartedAt),
        provider: "elevenlabs",
        release: process.env.APP_RELEASE,
      });
    }
  }
  return reply(
    providerRateLimited ? "dialogue_rate_limited" : "dialogue_unavailable",
    providerRateLimited ? 429 : 503,
    providerRateLimited ? "rate_limited" : "unavailable",
  );
}
