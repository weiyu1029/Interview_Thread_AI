import type { LocaleCode } from "./i18n";
import {
  elevenLabsLanguageForLocale,
  isElevenLabsVoiceId,
  normalizeTechnicalTermsForSpeech,
  normalizeTtsText,
  TTS_MAX_CHARACTERS,
} from "./interview-tts.ts";

export const ELEVENLABS_DIALOGUE_MODEL_ID = "eleven_v3_conversational";
export const ELEVENLABS_DIALOGUE_FALLBACK_MODEL_ID = "eleven_v3";
export const DIALOGUE_CONSENT_VERSION = "interviewer-dialogue-v1";
export const DIALOGUE_MAX_CHARACTERS = Math.min(TTS_MAX_CHARACTERS, 2_000);
export const DIALOGUE_MAX_OUTPUT_BYTES = 5 * 1024 * 1024;

const ELEVENLABS_DIALOGUE_ENDPOINT =
  "https://api.elevenlabs.io/v1/text-to-dialogue/stream";
const DIALOGUE_MODELS = new Set([
  ELEVENLABS_DIALOGUE_MODEL_ID,
  ELEVENLABS_DIALOGUE_FALLBACK_MODEL_ID,
]);

export type DialogueModel =
  | typeof ELEVENLABS_DIALOGUE_MODEL_ID
  | typeof ELEVENLABS_DIALOGUE_FALLBACK_MODEL_ID;

/**
 * Builds a fixed-host HTTP Text-to-Dialogue request. The conversational model
 * accepts one registered voice, so this endpoint intentionally sends one
 * interviewer turn per request. A future continuous UI can preserve context
 * without exposing the provider credential to the browser.
 */
export function buildElevenLabsDialogueRequest({
  text,
  locale,
  apiKey,
  voiceId,
  model = ELEVENLABS_DIALOGUE_MODEL_ID,
  zeroRetention = false,
}: {
  text: string;
  locale: LocaleCode;
  apiKey: string;
  voiceId: string;
  model?: DialogueModel;
  zeroRetention?: boolean;
}) {
  if (!apiKey || !isElevenLabsVoiceId(voiceId) || !DIALOGUE_MODELS.has(model))
    throw new Error("Dialogue configuration is unavailable.");
  const normalized = normalizeTtsText(text);
  if (
    text.length > DIALOGUE_MAX_CHARACTERS ||
    !normalized ||
    normalized.length > DIALOGUE_MAX_CHARACTERS
  )
    throw new Error("Dialogue text is invalid.");
  const spokenText = normalizeTechnicalTermsForSpeech(normalized);
  const query = new URLSearchParams({ output_format: "mp3_44100_128" });
  // ElevenLabs documents Zero Retention Mode as an Enterprise-only feature.
  // The flag is sent only when the deployment explicitly enables it.
  if (zeroRetention) query.set("enable_logging", "false");

  return {
    url: `${ELEVENLABS_DIALOGUE_ENDPOINT}?${query}`,
    init: {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        inputs: [{ text: spokenText, voice_id: voiceId }],
        model_id: model,
        language_code: elevenLabsLanguageForLocale(locale),
        seed: 20260827,
        apply_text_normalization: "auto",
      }),
    } satisfies RequestInit,
  };
}
