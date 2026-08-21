import {
  buildAzureSpeechRequest,
  isTtsLocale,
  normalizeTtsText,
  TTS_MAX_CHARACTERS,
} from "../../interview-tts.ts";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};

function jsonError(error: string, status: number) {
  return Response.json(
    { error },
    { status, headers: PRIVATE_HEADERS },
  );
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("invalid_origin", 403);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return jsonError("invalid_request", 415);

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("invalid_request", 400);
  }

  const text = payload.text;
  const locale = payload.locale;
  if (
    typeof text !== "string" ||
    text.length > TTS_MAX_CHARACTERS ||
    !isTtsLocale(locale) ||
    !normalizeTtsText(text)
  )
    return jsonError("invalid_request", 400);

  const apiKey = process.env.AZURE_SPEECH_KEY?.trim();
  const region = process.env.AZURE_SPEECH_REGION?.trim();
  if (!apiKey || !region) return jsonError("premium_unavailable", 503);

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
      return jsonError(
        providerResponse.status === 429
          ? "speech_rate_limited"
          : "speech_unavailable",
        providerResponse.status === 429 ? 429 : 502,
      );

    const audio = await providerResponse.arrayBuffer();
    if (!audio.byteLength) return jsonError("speech_unavailable", 502);
    return new Response(audio, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        "Content-Type":
          providerResponse.headers.get("content-type") || "audio/mpeg",
        "Content-Length": String(audio.byteLength),
      },
    });
  } catch {
    return jsonError("speech_unavailable", 503);
  }
}
