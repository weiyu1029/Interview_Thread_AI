import {
  ELEVENLABS_STS_MODEL_ID,
  STS_CONSENT_VERSION,
  STS_MAX_AUDIO_BYTES,
  STS_MAX_OUTPUT_BYTES,
  buildElevenLabsSpeechToSpeechRequest,
} from "../../interview-sts.ts";
import { hasSupportedInterviewAudioSignature } from "../../interview-stt.ts";
import { isElevenLabsVoiceId } from "../../interview-tts.ts";
import { getAppUser } from "../../auth";
import {
  consumeGlobalSpeechAudioQuota,
  consumeGlobalSpeechQuota,
  type SpeechQuotaDatabase,
} from "../../speech-quota.ts";
import {
  createRequestId,
  elapsedMilliseconds,
  logObservability,
  type ObservabilityOutcome,
} from "../../observability.ts";
import { hasSameOrigin, readMultipartBody } from "../request-security.ts";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};
const MAX_MULTIPART_BYTES = STS_MAX_AUDIO_BYTES + 256 * 1024;
const WINDOW_MS = 10 * 60 * 1_000;
const PER_USER_LIMIT = 3;
const GLOBAL_LIMIT = 40;
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1_000;
const DEFAULT_DAILY_AUDIO_BYTE_LIMIT = 80 * 1024 * 1024;
const windows = new Map<string, { count: number; resetAt: number }>();
const localDailyBytes = new Map<number, number>();

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

function dailyAudioLimit() {
  const configured = Number(process.env.STS_DAILY_AUDIO_BYTE_LIMIT);
  return Number.isSafeInteger(configured) && configured >= 1024 * 1024
    ? Math.min(configured, 2 * 1024 * 1024 * 1024)
    : DEFAULT_DAILY_AUDIO_BYTE_LIMIT;
}

async function durableLimitsExceeded(audioBytes: number) {
  const now = Date.now();
  const requestWindow = Math.floor(now / WINDOW_MS) * WINDOW_MS;
  const dailyWindow = Math.floor(now / DAILY_WINDOW_MS) * DAILY_WINDOW_MS;
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
    return consumeGlobalSpeechAudioQuota(db, {
      operation: "s2s",
      windowStart: dailyWindow,
      windowMilliseconds: DAILY_WINDOW_MS,
      bytes: audioBytes,
      limit: dailyAudioLimit(),
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ERR_UNSUPPORTED_ESM_URL_SCHEME"
    ) {
      const next = (localDailyBytes.get(dailyWindow) || 0) + audioBytes;
      localDailyBytes.clear();
      localDailyBytes.set(dailyWindow, next);
      return localLimitExceeded("global:development", GLOBAL_LIMIT) ||
        next > dailyAudioLimit();
    }
    throw error;
  }
}

async function readBoundedAudio(response: Response) {
  const type = response.headers.get("content-type")?.split(";", 1)[0]?.trim();
  if (!type?.startsWith("audio/")) return null;
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
      if (total > STS_MAX_OUTPUT_BYTES) {
        await reader.cancel("voice_transform_too_large").catch(() => undefined);
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  if (!total) return null;
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
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
      route: "api_speech_to_speech",
      outcome,
      status,
      durationMs: elapsedMilliseconds(startedAt),
      provider: status >= 500 ? "elevenlabs" : "internal",
      release: process.env.APP_RELEASE,
    });
    return json(error, status, requestId);
  };

  if (!hasSameOrigin(request)) return reply("invalid_origin", 403, "forbidden");
  const user = await getAppUser();
  if (!user) return reply("sign_in_required", 401, "unauthorized");
  if (localLimitExceeded(`user:${user.userId}`, PER_USER_LIMIT))
    return reply("voice_transform_rate_limited", 429, "rate_limited");

  const parsed = await readMultipartBody(request, MAX_MULTIPART_BYTES);
  if (!parsed.ok)
    return reply(
      parsed.status === 413 ? "payload_too_large" : "invalid_request",
      parsed.status,
      "invalid",
    );
  const audio = parsed.payload.get("audio");
  const consentVersion = parsed.payload.get("consent_version");
  if (
    !(audio instanceof Blob) ||
    !audio.size ||
    audio.size > STS_MAX_AUDIO_BYTES ||
    consentVersion !== STS_CONSENT_VERSION ||
    !(await hasSupportedInterviewAudioSignature(audio))
  )
    return reply("invalid_request", 400, "invalid");

  if (process.env.ELEVENLABS_STS_ENABLED?.trim().toLowerCase() !== "true")
    return reply("voice_transform_unavailable", 503, "degraded");
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId =
    process.env.ELEVENLABS_STS_VOICE_ID?.trim() ||
    process.env.ELEVENLABS_VOICE_ID?.trim();
  if (!apiKey || !isElevenLabsVoiceId(voiceId))
    return reply("voice_transform_unavailable", 503, "degraded");
  try {
    if (await durableLimitsExceeded(audio.size))
      return reply("voice_transform_rate_limited", 429, "rate_limited");
  } catch {
    return reply("speech_quota_unavailable", 503, "unavailable");
  }

  try {
    const providerRequest = buildElevenLabsSpeechToSpeechRequest({
      audio,
      apiKey,
      voiceId,
      zeroRetention:
        process.env.ELEVENLABS_ZERO_RETENTION?.trim().toLowerCase() === "true",
    });
    const response = await fetch(providerRequest.url, {
      ...providerRequest.init,
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok)
      return reply(
        response.status === 429
          ? "voice_transform_rate_limited"
          : "voice_transform_unavailable",
        response.status === 429 ? 429 : 502,
        response.status === 429 ? "rate_limited" : "error",
      );
    const transformed = await readBoundedAudio(response);
    if (!transformed)
      return reply("voice_transform_unavailable", 502, "error");
    logObservability({
      requestId,
      route: "api_speech_to_speech",
      outcome: "ok",
      status: 200,
      durationMs: elapsedMilliseconds(startedAt),
      provider: "elevenlabs",
      release: process.env.APP_RELEASE,
    });
    return new Response(transformed, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        "Content-Type": "audio/mpeg",
        "X-Request-ID": requestId,
        "X-InterviewThread-Speech-Model": ELEVENLABS_STS_MODEL_ID,
      },
    });
  } catch {
    return reply("voice_transform_unavailable", 503, "unavailable");
  }
}
