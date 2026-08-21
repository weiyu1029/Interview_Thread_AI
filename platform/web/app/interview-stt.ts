import type { LocaleCode } from "./i18n";
import { speechLocaleFor } from "./interview-speech.ts";

export const STT_API_VERSION = "2025-10-15";
export const STT_MAX_AUDIO_BYTES = 12 * 1024 * 1024;
export const STT_MAX_VOCABULARY_TERMS = 80;
export const STT_MAX_VOCABULARY_TERM_CHARACTERS = 32;

const STT_LOCALES = new Set<LocaleCode>([
  "en", "ja", "ko", "zh-CN", "zh-TW", "es", "fr", "de", "pt-BR", "it",
  "nl", "pl", "tr", "ru", "uk", "ar", "he", "hi", "bn", "ur", "id", "ms",
  "th", "vi", "fil", "sv", "no", "da", "fi", "cs", "sk", "hu", "ro", "el",
  "bg", "hr", "sr", "sl", "sw", "fa",
]);

const ALLOWED_AUDIO_TYPES = [
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
];

const AZURE_STT_LOCALE_OVERRIDES: Partial<Record<LocaleCode, string>> = {
  bn: "bn-IN",
  ur: "ur-IN",
};

export function isSttLocale(value: unknown): value is LocaleCode {
  return typeof value === "string" && STT_LOCALES.has(value as LocaleCode);
}

export function isSupportedInterviewAudioType(value: string) {
  const base = value.toLowerCase().split(";")[0].trim();
  return ALLOWED_AUDIO_TYPES.includes(base);
}

export function azureSttLocaleFor(locale: LocaleCode) {
  return AZURE_STT_LOCALE_OVERRIDES[locale] || speechLocaleFor(locale);
}

export function sanitizeSpeechVocabulary(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .filter((term): term is string => typeof term === "string")
    .map((term) =>
      Array.from(term)
        .filter((character) => {
          const code = character.charCodeAt(0);
          return code >= 32 && code !== 127;
        })
        .join("")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(
      (term) =>
        term.length >= 2 &&
        term.length <= STT_MAX_VOCABULARY_TERM_CHARACTERS,
    )
    .filter((term) => {
      const key = term.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, STT_MAX_VOCABULARY_TERMS);
}

export function normalizeSttTranscript(value: string, vocabulary: string[] = []) {
  let transcript = Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  const canonical = new Map(
    sanitizeSpeechVocabulary(vocabulary).map((term) => [
      term.toLocaleLowerCase(),
      term,
    ]),
  );
  const replacements: Array<[RegExp, string]> = [
    [/\bsequel\b/giu, canonical.get("sql") || "SQL"],
    [/\bpower\s+bee\b/giu, canonical.get("power bi") || "Power BI"],
    [/\btableu\b/giu, canonical.get("tableau") || "Tableau"],
    [/\btype\s*script\b/giu, canonical.get("typescript") || "TypeScript"],
    [/\bjava\s*script\b/giu, canonical.get("javascript") || "JavaScript"],
    [/\bpost\s*gres(?:\s*q\s*l)?\b/giu, canonical.get("postgresql") || "PostgreSQL"],
  ];
  for (const [pattern, replacement] of replacements)
    transcript = transcript.replace(pattern, replacement);
  for (const [lower, display] of canonical) {
    if (!/[A-Z+#.]/.test(display)) continue;
    transcript = transcript.replace(
      new RegExp(`\\b${lower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "giu"),
      display,
    );
  }
  return transcript;
}

function validatedEndpoint(endpoint: string) {
  const url = new URL(endpoint.trim());
  const hostname = url.hostname.toLowerCase();
  const isAzureSpeechHost =
    hostname.endsWith(".cognitiveservices.azure.com") ||
    hostname.endsWith(".api.cognitive.microsoft.com");
  if (
    url.protocol !== "https:" ||
    !isAzureSpeechHost ||
    url.username ||
    url.password
  )
    throw new Error("Speech configuration is unavailable.");
  return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
}

export function buildAzureTranscriptionRequest({
  audio,
  locale,
  vocabulary,
  apiKey,
  endpoint,
}: {
  audio: Blob;
  locale: LocaleCode;
  vocabulary: string[];
  apiKey: string;
  endpoint: string;
}) {
  if (!apiKey || !isSttLocale(locale))
    throw new Error("Speech configuration is unavailable.");
  if (
    !audio.size ||
    audio.size > STT_MAX_AUDIO_BYTES ||
    !isSupportedInterviewAudioType(audio.type)
  )
    throw new Error("Interview audio is invalid.");

  const terms = sanitizeSpeechVocabulary(vocabulary);
  const definition: Record<string, unknown> = {
    locales: [azureSttLocaleFor(locale)],
    profanityFilterMode: "None",
  };
  if (terms.length) definition.phraseList = { phrases: terms };

  const form = new FormData();
  form.append("audio", audio, `interview-answer.${audioExtensionFor(audio.type)}`);
  form.append("definition", JSON.stringify(definition));

  return {
    url: `${validatedEndpoint(endpoint)}/speechtotext/transcriptions:transcribe?api-version=${STT_API_VERSION}`,
    init: {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
      },
      body: form,
    } satisfies RequestInit,
  };
}

function audioExtensionFor(contentType: string) {
  const base = contentType.toLowerCase().split(";")[0].trim();
  if (base === "audio/ogg") return "ogg";
  if (base === "audio/mp4") return "m4a";
  if (base === "audio/mpeg") return "mp3";
  if (base === "audio/wav" || base === "audio/x-wav") return "wav";
  return "webm";
}

export function transcriptFromAzureResponse(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const payload = value as {
    combinedPhrases?: Array<{ text?: unknown }>;
    phrases?: Array<{ text?: unknown }>;
  };
  const combined = payload.combinedPhrases
    ?.map((phrase) => (typeof phrase.text === "string" ? phrase.text : ""))
    .filter(Boolean)
    .join(" ")
    .trim();
  if (combined) return combined;
  return (
    payload.phrases
      ?.map((phrase) => (typeof phrase.text === "string" ? phrase.text : ""))
      .filter(Boolean)
      .join(" ")
      .trim() || ""
  );
}
