import {
  buildAzureTranscriptionRequest,
  isSttLocale,
  isSupportedInterviewAudioType,
  normalizeSttTranscript,
  sanitizeSpeechVocabulary,
  STT_MAX_AUDIO_BYTES,
  transcriptFromAzureResponse,
} from "../../interview-stt.ts";
import { getAppUser } from "../../auth";
import {
  createRequestId,
  elapsedMilliseconds,
  logObservability,
  type ObservabilityOutcome,
  type ObservabilityProvider,
} from "../../observability.ts";
import { hasSameOrigin as sameOrigin } from "../request-security.ts";

const TRANSCRIPTION_WINDOW_MS = 10 * 60 * 1_000;
const TRANSCRIPTION_WINDOW_LIMIT = 12;
const MAX_MULTIPART_BYTES = STT_MAX_AUDIO_BYTES + 256 * 1024;

const transcriptionWindows = new Map<
  string,
  { count: number; resetAt: number }
>();

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

function rateLimitExceeded(userId: string) {
  const now = Date.now();
  const current = transcriptionWindows.get(userId);
  if (!current || current.resetAt <= now) {
    transcriptionWindows.set(userId, {
      count: 1,
      resetAt: now + TRANSCRIPTION_WINDOW_MS,
    });
    return false;
  }
  current.count += 1;
  return current.count > TRANSCRIPTION_WINDOW_LIMIT;
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

  if (!sameOrigin(request))
    return reply({ error: "invalid_origin" }, 403, "forbidden");
  if (!request.headers.get("content-type")?.includes("multipart/form-data"))
    return reply({ error: "invalid_request" }, 415, "invalid");
  const declaredLength = Number(request.headers.get("content-length") || "0");
  if (
    !Number.isFinite(declaredLength) ||
    declaredLength < 0 ||
    declaredLength > MAX_MULTIPART_BYTES
  )
    return reply({ error: "payload_too_large" }, 413, "invalid");

  const user = await getAppUser();
  if (!user)
    return reply({ error: "sign_in_required" }, 401, "unauthorized");
  if (rateLimitExceeded(user.userId))
    return reply(
      { error: "transcription_rate_limited" },
      429,
      "rate_limited",
    );

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply({ error: "invalid_request" }, 400, "invalid");
  }

  const audio = form.get("audio");
  const locale = form.get("locale");
  const vocabularyValue = form.get("vocabulary");
  if (
    !(audio instanceof Blob) ||
    !audio.size ||
    audio.size > STT_MAX_AUDIO_BYTES ||
    !isSupportedInterviewAudioType(audio.type) ||
    !isSttLocale(locale)
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

  const apiKey = process.env.AZURE_SPEECH_KEY?.trim();
  const endpoint = process.env.AZURE_SPEECH_ENDPOINT?.trim();
  if (!apiKey || !endpoint)
    return reply(
      { error: "premium_unavailable" },
      503,
      "degraded",
      "azure_speech",
    );

  try {
    const providerRequest = buildAzureTranscriptionRequest({
      audio,
      locale,
      vocabulary,
      apiKey,
      endpoint,
    });
    const providerResponse = await fetch(providerRequest.url, {
      ...providerRequest.init,
      signal: AbortSignal.timeout(30_000),
    });
    if (!providerResponse.ok)
      return reply(
        {
          error:
            providerResponse.status === 429
              ? "transcription_rate_limited"
              : "transcription_unavailable",
        },
        providerResponse.status === 429 ? 429 : 502,
        providerResponse.status === 429 ? "rate_limited" : "error",
        "azure_speech",
      );

    const providerPayload = (await providerResponse.json()) as unknown;
    const transcript = normalizeSttTranscript(
      transcriptFromAzureResponse(providerPayload),
      vocabulary,
    );
    if (!transcript)
      return reply({ error: "no_speech" }, 422, "invalid", "azure_speech");
    record("ok", 200, "azure_speech");
    return json({ transcript, locale }, 200, requestId);
  } catch {
    return reply(
      { error: "transcription_unavailable" },
      503,
      "unavailable",
      "azure_speech",
    );
  }
}
