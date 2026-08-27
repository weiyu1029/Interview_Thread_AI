import { isElevenLabsVoiceId } from "./interview-tts.ts";
import {
  isSupportedInterviewAudioType,
  STT_MAX_AUDIO_BYTES,
} from "./interview-stt.ts";

export const ELEVENLABS_STS_MODEL_ID = "eleven_multilingual_sts_v2";
export const STS_MAX_AUDIO_BYTES = STT_MAX_AUDIO_BYTES;
export const STS_MAX_OUTPUT_BYTES = 5 * 1024 * 1024;
export const STS_CONSENT_VERSION = "voice-transform-v1";

const ELEVENLABS_STS_ENDPOINT =
  "https://api.elevenlabs.io/v1/speech-to-speech";

export function buildElevenLabsSpeechToSpeechRequest({
  audio,
  apiKey,
  voiceId,
  zeroRetention = false,
}: {
  audio: Blob;
  apiKey: string;
  voiceId: string;
  zeroRetention?: boolean;
}) {
  if (!apiKey || !isElevenLabsVoiceId(voiceId))
    throw new Error("Voice transformation configuration is unavailable.");
  if (
    !audio.size ||
    audio.size > STS_MAX_AUDIO_BYTES ||
    !isSupportedInterviewAudioType(audio.type)
  )
    throw new Error("Interview audio is invalid.");

  const query = new URLSearchParams({ output_format: "mp3_44100_128" });
  // ElevenLabs documents Zero Retention Mode as an Enterprise-only feature.
  // Do not send the flag on other plans, where it would reject the request.
  if (zeroRetention) query.set("enable_logging", "false");
  const form = new FormData();
  form.append("audio", audio, "interview-answer");
  form.append("model_id", ELEVENLABS_STS_MODEL_ID);
  form.append("remove_background_noise", "false");
  form.append("file_format", "other");

  return {
    url: `${ELEVENLABS_STS_ENDPOINT}/${encodeURIComponent(voiceId)}/stream?${query}`,
    init: {
      method: "POST",
      headers: { Accept: "audio/mpeg", "xi-api-key": apiKey },
      body: form,
    } satisfies RequestInit,
  };
}
