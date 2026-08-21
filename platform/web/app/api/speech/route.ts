import {
  buildAzureSpeechRequest,
  isTtsLocale,
  normalizeTtsText,
  TTS_MAX_CHARACTERS,
} from "../../interview-tts.ts";
import { getAppUser } from "../../auth";
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

function jsonError(error: string, status: number, requestId: string) {
  return Response.json(
    { error },
    {
      status,
      headers: { ...PRIVATE_HEADERS, "X-Request-ID": requestId },
    },
  );
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = createRequestId();
  const reply = (
    error: string,
    status: number,
    outcome: ObservabilityOutcome,
    provider: ObservabilityProvider = "internal",
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
    return jsonError(error, status, requestId);
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
  if (!user) return reply("sign_in_required", 401, "unauthorized");

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

  try {
    const providerRequest = buildAzureSpeechRequest({
      text,
      locale,
      apiKey,
      region,
    });
    const providerResponse = await fetch(providerRequest.url, {
      ...providerRequest.init,
      signal: AbortSignal.timeout(10_000),
    });
    if (!providerResponse.ok)
      return reply(
        providerResponse.status === 429
          ? "speech_rate_limited"
          : "speech_unavailable",
        providerResponse.status === 429 ? 429 : 502,
        providerResponse.status === 429 ? "rate_limited" : "error",
        "azure_speech",
      );

    const audio = await providerResponse.arrayBuffer();
    if (!audio.byteLength)
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
        "Content-Type":
          providerResponse.headers.get("content-type") || "audio/mpeg",
        "Content-Length": String(audio.byteLength),
        "X-Request-ID": requestId,
      },
    });
  } catch {
    return reply("speech_unavailable", 503, "unavailable", "azure_speech");
  }
}
