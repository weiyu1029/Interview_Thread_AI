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

function json(payload: Record<string, unknown>, status = 200) {
  return Response.json(payload, { status, headers: PRIVATE_HEADERS });
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
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
  if (!sameOrigin(request)) return json({ error: "invalid_origin" }, 403);
  if (!request.headers.get("content-type")?.includes("multipart/form-data"))
    return json({ error: "invalid_request" }, 415);
  const declaredLength = Number(request.headers.get("content-length") || "0");
  if (
    !Number.isFinite(declaredLength) ||
    declaredLength < 0 ||
    declaredLength > MAX_MULTIPART_BYTES
  )
    return json({ error: "payload_too_large" }, 413);

  const user = await getAppUser();
  if (!user) return json({ error: "sign_in_required" }, 401);
  if (rateLimitExceeded(user.userId))
    return json({ error: "transcription_rate_limited" }, 429);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "invalid_request" }, 400);
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
    return json({ error: "invalid_request" }, 400);

  let vocabulary: string[] = [];
  if (typeof vocabularyValue === "string" && vocabularyValue) {
    try {
      vocabulary = sanitizeSpeechVocabulary(JSON.parse(vocabularyValue));
    } catch {
      return json({ error: "invalid_request" }, 400);
    }
  }

  const apiKey = process.env.AZURE_SPEECH_KEY?.trim();
  const endpoint = process.env.AZURE_SPEECH_ENDPOINT?.trim();
  if (!apiKey || !endpoint) return json({ error: "premium_unavailable" }, 503);

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
      return json(
        {
          error:
            providerResponse.status === 429
              ? "transcription_rate_limited"
              : "transcription_unavailable",
        },
        providerResponse.status === 429 ? 429 : 502,
      );

    const providerPayload = (await providerResponse.json()) as unknown;
    const transcript = normalizeSttTranscript(
      transcriptFromAzureResponse(providerPayload),
      vocabulary,
    );
    if (!transcript) return json({ error: "no_speech" }, 422);
    return json({ transcript, locale }, 200);
  } catch {
    return json({ error: "transcription_unavailable" }, 503);
  }
}
