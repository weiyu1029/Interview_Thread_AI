import {
  STT_CONSENT_VERSION,
  STT_MAX_AUDIO_BYTES,
  STT_MAX_TRANSCRIPT_CHARACTERS,
  buildAzureTranscriptionRequest,
  buildElevenLabsTranscriptionRequest,
  hasSupportedInterviewAudioSignature,
  isSttLocale,
  normalizeSttTranscript,
  sanitizeSpeechVocabulary,
  transcriptFromAzureResponse,
  transcriptFromElevenLabsResponse,
} from "../../interview-stt.ts";
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
  type ObservabilityProvider,
} from "../../observability.ts";
import { hasSameOrigin, readMultipartBody } from "../request-security.ts";

const TRANSCRIPTION_WINDOW_MS = 10 * 60 * 1_000;
const TRANSCRIPTION_WINDOW_LIMIT = 12;
const GLOBAL_TRANSCRIPTION_WINDOW_LIMIT = 120;
const TRANSCRIPTION_DAILY_WINDOW_MS = 24 * 60 * 60 * 1_000;
const DEFAULT_DAILY_TRANSCRIPTION_AUDIO_BYTE_LIMIT = 300 * 1024 * 1024;
const MAX_MULTIPART_BYTES = STT_MAX_AUDIO_BYTES + 256 * 1024;
const PROVIDER_TIMEOUT_MS = 30_000;
const transcriptionWindows = new Map<
  string,
  { count: number; resetAt: number }
>();
const localDailyAudioBytes = new Map<number, number>();

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};

function json(
  payload: Record<string, unknown>,
  status = 200,
  requestId?: string,
) {
  return Response.json(payload, {
    status,
    headers: {
      ...PRIVATE_HEADERS,
      ...(requestId ? { "X-Request-ID": requestId } : {}),
    },
  });
}

function rateLimitExceeded(key: string, limit = TRANSCRIPTION_WINDOW_LIMIT) {
  const now = Date.now();
  for (const [entryKey, entry] of transcriptionWindows) {
    if (entry.resetAt <= now) transcriptionWindows.delete(entryKey);
  }
  const current = transcriptionWindows.get(key);
  if (!current) {
    transcriptionWindows.set(key, {
      count: 1,
      resetAt: now + TRANSCRIPTION_WINDOW_MS,
    });
    return false;
  }
  current.count += 1;
  return current.count > limit;
}

function dailyAudioLimit() {
  const configured = Number(process.env.STT_DAILY_AUDIO_BYTE_LIMIT);
  return Number.isSafeInteger(configured) && configured >= 10 * 1024 * 1024
    ? Math.min(configured, 5 * 1024 * 1024 * 1024)
    : DEFAULT_DAILY_TRANSCRIPTION_AUDIO_BYTE_LIMIT;
}

async function durableQuotaExceeded(audioBytes: number) {
  const now = Date.now();
  const requestWindow =
    Math.floor(now / TRANSCRIPTION_WINDOW_MS) * TRANSCRIPTION_WINDOW_MS;
  const dailyWindow =
    Math.floor(now / TRANSCRIPTION_DAILY_WINDOW_MS) *
    TRANSCRIPTION_DAILY_WINDOW_MS;
  try {
    const { env } = await import("cloudflare:workers");
    if (!env.DB) throw new Error("speech_quota_unavailable");
    const db = env.DB as unknown as SpeechQuotaDatabase;
    if (
      await consumeGlobalSpeechQuota(db, {
        windowStart: requestWindow,
        windowMilliseconds: TRANSCRIPTION_WINDOW_MS,
        limit: GLOBAL_TRANSCRIPTION_WINDOW_LIMIT,
      })
    )
      return true;
    return consumeGlobalSpeechAudioQuota(db, {
      operation: "stt",
      windowStart: dailyWindow,
      windowMilliseconds: TRANSCRIPTION_DAILY_WINDOW_MS,
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
      const next = (localDailyAudioBytes.get(dailyWindow) || 0) + audioBytes;
      localDailyAudioBytes.clear();
      localDailyAudioBytes.set(dailyWindow, next);
      return (
        rateLimitExceeded(
          "global:development",
          GLOBAL_TRANSCRIPTION_WINDOW_LIMIT,
        ) || next > dailyAudioLimit()
      );
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = createRequestId();
  const record = (
    outcome: ObservabilityOutcome,
    status: number,
    provider: ObservabilityProvider = "internal",
  ) =>
    logObservability({
      requestId,
      route: "api_transcribe",
      outcome,
      status,
      durationMs: elapsedMilliseconds(startedAt),
      provider,
      release: process.env.APP_RELEASE,
    });
  const reply = (
    payload: Record<string, unknown>,
    status: number,
    outcome: ObservabilityOutcome,
    provider: ObservabilityProvider = "internal",
  ) => {
    record(outcome, status, provider);
    return json(payload, status, requestId);
  };

  if (!hasSameOrigin(request))
    return reply({ error: "invalid_origin" }, 403, "forbidden");
  const user = await getAppUser();
  if (!user)
    return reply({ error: "sign_in_required" }, 401, "unauthorized");
  if (rateLimitExceeded(`user:${user.userId}`))
    return reply(
      { error: "transcription_rate_limited" },
      429,
      "rate_limited",
    );

  const parsed = await readMultipartBody(request, MAX_MULTIPART_BYTES);
  if (!parsed.ok)
    return reply(
      { error: parsed.status === 413 ? "payload_too_large" : "invalid_request" },
      parsed.status,
      "invalid",
    );
  const audio = parsed.payload.get("audio");
  const locale = parsed.payload.get("locale");
  const vocabularyValue = parsed.payload.get("vocabulary");
  const consentVersion = parsed.payload.get("consent_version");
  if (
    !(audio instanceof Blob) ||
    !audio.size ||
    audio.size > STT_MAX_AUDIO_BYTES ||
    !isSttLocale(locale) ||
    consentVersion !== STT_CONSENT_VERSION ||
    !(await hasSupportedInterviewAudioSignature(audio))
  )
    return reply({ error: "invalid_request" }, 400, "invalid");

  let vocabulary: string[] = [];
  if (typeof vocabularyValue === "string" && vocabularyValue) {
    try {
      vocabulary = sanitizeSpeechVocabulary(JSON.parse(vocabularyValue));
    } catch {
      return reply({ error: "invalid_request" }, 400, "invalid");
    }
  }
  try {
    if (await durableQuotaExceeded(audio.size))
      return reply(
        { error: "transcription_rate_limited" },
        429,
        "rate_limited",
      );
  } catch {
    return reply(
      { error: "speech_quota_unavailable" },
      503,
      "unavailable",
    );
  }

  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const azureApiKey = process.env.AZURE_SPEECH_KEY?.trim();
  const azureEndpoint = process.env.AZURE_SPEECH_ENDPOINT?.trim();
  const attempts: Array<{
    provider: "elevenlabs" | "azure_speech";
    request: { url: string; init: RequestInit };
    transcript: (payload: unknown) => string;
  }> = [];
  if (elevenLabsApiKey)
    attempts.push({
      provider: "elevenlabs",
      request: buildElevenLabsTranscriptionRequest({
        audio,
        locale,
        vocabulary,
        apiKey: elevenLabsApiKey,
      }),
      transcript: transcriptFromElevenLabsResponse,
    });
  if (azureApiKey && azureEndpoint)
    attempts.push({
      provider: "azure_speech",
      request: buildAzureTranscriptionRequest({
        audio,
        locale,
        vocabulary,
        apiKey: azureApiKey,
        endpoint: azureEndpoint,
      }),
      transcript: transcriptFromAzureResponse,
    });
  if (!attempts.length)
    return reply({ error: "premium_unavailable" }, 503, "degraded");

  let everyAttemptRateLimited = true;
  let lastProvider: "elevenlabs" | "azure_speech" = attempts[0].provider;
  for (const attempt of attempts) {
    lastProvider = attempt.provider;
    try {
      const providerResponse = await fetch(attempt.request.url, {
        ...attempt.request.init,
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      });
      if (!providerResponse.ok) {
        everyAttemptRateLimited &&= providerResponse.status === 429;
        continue;
      }
      everyAttemptRateLimited = false;
      const providerPayload = (await providerResponse.json()) as unknown;
      const transcript = normalizeSttTranscript(
        attempt.transcript(providerPayload),
        vocabulary,
      )
        .slice(0, STT_MAX_TRANSCRIPT_CHARACTERS)
        .trim();
      if (!transcript) continue;
      record("ok", 200, attempt.provider);
      return json(
        { transcript, locale, provider: attempt.provider },
        200,
        requestId,
      );
    } catch {
      everyAttemptRateLimited = false;
    }
  }
  if (everyAttemptRateLimited)
    return reply(
      { error: "transcription_rate_limited" },
      429,
      "rate_limited",
      lastProvider,
    );
  return reply(
    { error: "transcription_unavailable" },
    503,
    "unavailable",
    lastProvider,
  );
}
