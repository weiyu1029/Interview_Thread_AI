import type { LocaleCode } from "./i18n";

export const TTS_MODEL_ID = "eleven_v3";
export const TTS_FALLBACK_MODEL_ID = "azure-dragon-hd-omni";
export const TTS_FINAL_CLOUD_FALLBACK_MODEL_ID = "azure-standard-neural";
export const TTS_MAX_CHARACTERS = 900;
export const TTS_VOICE_PROFILE_VERSION = "itvp1";

const ELEVENLABS_TTS_ENDPOINT = "https://api.elevenlabs.io/v1/text-to-speech";

const ELEVENLABS_LANGUAGE_CODES = {
  en: "en",
  ja: "ja",
  ko: "ko",
  "zh-CN": "zh",
  "zh-TW": "zh",
  es: "es",
  fr: "fr",
  de: "de",
  "pt-BR": "pt",
  it: "it",
  nl: "nl",
  pl: "pl",
  tr: "tr",
  ru: "ru",
  uk: "uk",
  ar: "ar",
  he: "he",
  hi: "hi",
  bn: "bn",
  ur: "ur",
  id: "id",
  ms: "ms",
  th: "th",
  vi: "vi",
  fil: "fil",
  sv: "sv",
  no: "no",
  da: "da",
  fi: "fi",
  cs: "cs",
  sk: "sk",
  hu: "hu",
  ro: "ro",
  el: "el",
  bg: "bg",
  hr: "hr",
  sr: "sr",
  sl: "sl",
  sw: "sw",
  fa: "fa",
} satisfies Record<LocaleCode, string>;

// This Dragon HD voice is English-trained and is intentionally restricted to
// English. Non-English locales must never use it as a fallback.
const AZURE_HD_INTERVIEW_VOICE =
  "en-US-Ava:DragonHDOmniLatestNeural";

type AzureVoice = {
  language: string;
  name: string;
};

const AZURE_VOICES = {
  en: { language: "en-US", name: "en-US-JennyNeural" },
  ja: { language: "ja-JP", name: "ja-JP-NanamiNeural" },
  ko: { language: "ko-KR", name: "ko-KR-SunHiNeural" },
  "zh-CN": { language: "zh-CN", name: "zh-CN-XiaoxiaoNeural" },
  "zh-TW": { language: "zh-TW", name: "zh-TW-HsiaoChenNeural" },
  es: { language: "es-ES", name: "es-ES-ElviraNeural" },
  fr: { language: "fr-FR", name: "fr-FR-DeniseNeural" },
  de: { language: "de-DE", name: "de-DE-KatjaNeural" },
  "pt-BR": { language: "pt-BR", name: "pt-BR-FranciscaNeural" },
  it: { language: "it-IT", name: "it-IT-ElsaNeural" },
  nl: { language: "nl-NL", name: "nl-NL-ColetteNeural" },
  pl: { language: "pl-PL", name: "pl-PL-ZofiaNeural" },
  tr: { language: "tr-TR", name: "tr-TR-EmelNeural" },
  ru: { language: "ru-RU", name: "ru-RU-SvetlanaNeural" },
  uk: { language: "uk-UA", name: "uk-UA-PolinaNeural" },
  ar: { language: "ar-EG", name: "ar-EG-SalmaNeural" },
  he: { language: "he-IL", name: "he-IL-HilaNeural" },
  hi: { language: "hi-IN", name: "hi-IN-SwaraNeural" },
  bn: { language: "bn-IN", name: "bn-IN-TanishaaNeural" },
  ur: { language: "ur-PK", name: "ur-PK-UzmaNeural" },
  id: { language: "id-ID", name: "id-ID-GadisNeural" },
  ms: { language: "ms-MY", name: "ms-MY-YasminNeural" },
  th: { language: "th-TH", name: "th-TH-PremwadeeNeural" },
  vi: { language: "vi-VN", name: "vi-VN-HoaiMyNeural" },
  fil: { language: "fil-PH", name: "fil-PH-BlessicaNeural" },
  sv: { language: "sv-SE", name: "sv-SE-SofieNeural" },
  no: { language: "nb-NO", name: "nb-NO-PernilleNeural" },
  da: { language: "da-DK", name: "da-DK-ChristelNeural" },
  fi: { language: "fi-FI", name: "fi-FI-SelmaNeural" },
  cs: { language: "cs-CZ", name: "cs-CZ-VlastaNeural" },
  sk: { language: "sk-SK", name: "sk-SK-ViktoriaNeural" },
  hu: { language: "hu-HU", name: "hu-HU-NoemiNeural" },
  ro: { language: "ro-RO", name: "ro-RO-AlinaNeural" },
  el: { language: "el-GR", name: "el-GR-AthinaNeural" },
  bg: { language: "bg-BG", name: "bg-BG-KalinaNeural" },
  hr: { language: "hr-HR", name: "hr-HR-GabrijelaNeural" },
  sr: { language: "sr-RS", name: "sr-RS-SophieNeural" },
  sl: { language: "sl-SI", name: "sl-SI-PetraNeural" },
  sw: { language: "sw-KE", name: "sw-KE-ZuriNeural" },
  fa: { language: "fa-IR", name: "fa-IR-DilaraNeural" },
} satisfies Record<LocaleCode, AzureVoice>;

// Stable, non-secret identifiers make the selected voice profile auditable in
// response metadata without exposing provider voice IDs. Keep these IDs
// unique and bump TTS_VOICE_PROFILE_VERSION whenever routing or reviewed voice
// selections materially change.
export const TTS_VOICE_PROFILE_IDS = {
  en: "01",
  ja: "02",
  ko: "03",
  "zh-CN": "04",
  "zh-TW": "05",
  es: "06",
  fr: "07",
  de: "08",
  "pt-BR": "09",
  it: "10",
  nl: "11",
  pl: "12",
  tr: "13",
  ru: "14",
  uk: "15",
  ar: "16",
  he: "17",
  hi: "18",
  bn: "19",
  ur: "20",
  id: "21",
  ms: "22",
  th: "23",
  vi: "24",
  fil: "25",
  sv: "26",
  no: "27",
  da: "28",
  fi: "29",
  cs: "30",
  sk: "31",
  hu: "32",
  ro: "33",
  el: "34",
  bg: "35",
  hr: "36",
  sr: "37",
  sl: "38",
  sw: "39",
  fa: "40",
} as const satisfies Record<LocaleCode, string>;

export type TtsVoiceProfileVariant =
  | "elevenlabs-tts"
  | "elevenlabs-dialogue"
  | "azure-hd-en"
  | "azure-native";

const TTS_VOICE_PROFILE_VARIANT_IDS = {
  "elevenlabs-tts": "a",
  "elevenlabs-dialogue": "b",
  "azure-hd-en": "c",
  "azure-native": "d",
} as const satisfies Record<TtsVoiceProfileVariant, string>;

export function ttsVoiceProfileForLocale(locale: LocaleCode) {
  const azure = AZURE_VOICES[locale];
  return {
    version: TTS_VOICE_PROFILE_VERSION,
    profileId: TTS_VOICE_PROFILE_IDS[locale],
    locale,
    elevenLabsLanguage: ELEVENLABS_LANGUAGE_CODES[locale],
    azureLanguage: azure.language,
    azureNativeVoice: azure.name,
    azureHdVoice: locale === "en" ? AZURE_HD_INTERVIEW_VOICE : null,
  } as const;
}

export function ttsVoiceProfileHeader(
  locale: LocaleCode,
  variant: TtsVoiceProfileVariant,
) {
  const profile = ttsVoiceProfileForLocale(locale);
  if (variant === "azure-hd-en" && !profile.azureHdVoice)
    throw new Error("English Azure HD voice cannot be used for this locale.");
  return `${profile.version}-${profile.profileId}-${TTS_VOICE_PROFILE_VARIANT_IDS[variant]}`;
}

export function ttsVoiceProfileCompleteness(
  expectedLocales: readonly string[],
) {
  const configuredKeys = new Set<string>([
    ...Object.keys(ELEVENLABS_LANGUAGE_CODES),
    ...Object.keys(AZURE_VOICES),
    ...Object.keys(TTS_VOICE_PROFILE_IDS),
  ]);
  const expectedKeys = new Set(expectedLocales);
  const missing = expectedLocales.filter(
    (locale) =>
      !(locale in ELEVENLABS_LANGUAGE_CODES) ||
      !(locale in AZURE_VOICES) ||
      !(locale in TTS_VOICE_PROFILE_IDS),
  );
  const extra = [...configuredKeys].filter((locale) => !expectedKeys.has(locale));
  const profileIds = Object.values(TTS_VOICE_PROFILE_IDS);
  const duplicateProfileIds = profileIds.filter(
    (profileId, index) => profileIds.indexOf(profileId) !== index,
  );
  return {
    version: TTS_VOICE_PROFILE_VERSION,
    expectedCount: expectedLocales.length,
    configuredCount: Object.keys(TTS_VOICE_PROFILE_IDS).length,
    missing,
    extra,
    duplicateProfileIds: [...new Set(duplicateProfileIds)],
    complete:
      expectedLocales.length === 40 &&
      Object.keys(TTS_VOICE_PROFILE_IDS).length === 40 &&
      missing.length === 0 &&
      extra.length === 0 &&
      duplicateProfileIds.length === 0,
  } as const;
}

const localeKeys = new Set<string>(Object.keys(AZURE_VOICES));

export function isTtsLocale(value: unknown): value is LocaleCode {
  return typeof value === "string" && localeKeys.has(value);
}

export function azureVoiceForLocale(locale: LocaleCode) {
  return locale === "en" ? AZURE_HD_INTERVIEW_VOICE : null;
}

export function azureStandardVoiceForLocale(locale: LocaleCode) {
  return AZURE_VOICES[locale].name;
}

export function azureLanguageForLocale(locale: LocaleCode) {
  return AZURE_VOICES[locale].language;
}

export function elevenLabsLanguageForLocale(locale: LocaleCode) {
  return ELEVENLABS_LANGUAGE_CODES[locale];
}

export function isElevenLabsVoiceId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[A-Za-z0-9_-]{8,128}$/.test(value)
  );
}

export function elevenLabsVoiceIdForLocale(
  locale: LocaleCode,
  defaultVoiceId: string | undefined,
  rawLocaleVoiceIds: string | undefined,
) {
  // The default voice is the English baseline only. Reusing an English voice
  // for every locale can leave a strong English accent, so non-English
  // locales require an explicitly selected native voice and otherwise fall
  // through to Azure's locale-specific neural voice.
  const englishFallback = isElevenLabsVoiceId(defaultVoiceId)
    ? defaultVoiceId
    : null;
  if (!rawLocaleVoiceIds) return locale === "en" ? englishFallback : null;
  try {
    const parsed: unknown = JSON.parse(rawLocaleVoiceIds);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return locale === "en" ? englishFallback : null;
    const localeVoiceId = (parsed as Record<string, unknown>)[locale];
    return isElevenLabsVoiceId(localeVoiceId)
      ? localeVoiceId
      : locale === "en"
        ? englishFallback
        : null;
  } catch {
    return locale === "en" ? englishFallback : null;
  }
}

export function isAzureSpeechRegion(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9-]+$/i.test(value);
}

export function normalizeTtsText(value: string) {
  const withoutControlCharacters = Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
    })
    .join("");
  return withoutControlCharacters
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^\s)]+(?:\s+[^)]*)?\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/[`*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, TTS_MAX_CHARACTERS)
    .trim();
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const TECHNICAL_TERM_PATTERN =
  /(PostgreSQL|C\+\+|C#|\.NET|\b(?:SQL|API|KPI|CEO|COO|AWS|GCP|ETL|JD|HR|AI|ML|BI)\b)/giu;

const TECHNICAL_ALIASES: Record<string, string> = {
  "c++": "C plus plus",
  "c#": "C sharp",
  ".net": "dot net",
  postgresql: "post gres Q L",
  jd: "job description",
};

const TECHNICAL_PLAIN_TEXT_ALIASES: Record<string, string> = {
  "c++": "C plus plus",
  "c#": "C sharp",
  ".net": "dot net",
  jd: "job description",
};

export function normalizeTechnicalTermsForSpeech(
  text: string,
  locale: LocaleCode = "en",
) {
  // English phonetic aliases such as "C plus plus" and "job description"
  // sound markedly less natural when inserted into another language. Native
  // v3 voices can infer code-switching from the original spelling, so retain
  // the user's localized text outside English.
  if (locale !== "en") return text;
  return text.replace(TECHNICAL_TERM_PATTERN, (term) => {
    const alias = TECHNICAL_PLAIN_TEXT_ALIASES[term.toLowerCase()];
    if (alias) return alias;
    if (/^[A-Z]{2,}$/u.test(term)) return Array.from(term).join(" ");
    return term;
  });
}

function technicalSsml(text: string, locale: LocaleCode) {
  if (locale !== "en") return escapeXml(text);
  return text
    .split(/(<[^>]*>)/g)
    .map((segment) => {
      if (segment.startsWith("<") && segment.endsWith(">"))
        return escapeXml(segment);
      const parts = segment.split(TECHNICAL_TERM_PATTERN);
      return parts
        .map((part, index) => {
          if (index % 2 === 0) return escapeXml(part);
          const key = part.toLowerCase();
          const alias = TECHNICAL_ALIASES[key];
          if (alias)
            return `<sub alias="${escapeXml(alias)}">${escapeXml(part)}</sub>`;
          return `<say-as interpret-as="characters">${escapeXml(part)}</say-as>`;
        })
        .join("");
    })
    .join("");
}

function azureSpeechRequest({
  text,
  locale,
  apiKey,
  region,
  model,
}: {
  text: string;
  locale: LocaleCode;
  apiKey: string;
  region: string;
  model: "hd" | "standard";
}) {
  if (!apiKey) throw new Error("Speech configuration is unavailable.");
  if (!isAzureSpeechRegion(region))
    throw new Error("Speech configuration is unavailable.");
  const normalized = normalizeTtsText(text);
  if (!normalized) throw new Error("Speech text is empty.");
  const voice = AZURE_VOICES[locale];
  const spokenText = technicalSsml(normalized, locale);
  const hdVoice = azureVoiceForLocale(locale);
  if (model === "hd" && !hdVoice)
    throw new Error("English Azure HD voice cannot be used for this locale.");
  const body =
    model === "hd"
      ? `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${voice.language}"><voice name="${hdVoice}" parameters="temperature=0.65;top_p=0.65;top_k=20;cfg_scale=1.4;enhancePronunciation=true"><lang xml:lang="${voice.language}"><p><s>${spokenText}</s></p></lang></voice></speak>`
      : `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voice.language}"><voice name="${voice.name}"><prosody rate="-2%">${spokenText}</prosody></voice></speak>`;

  return {
    url: `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    init: {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/ssml+xml",
        "Ocp-Apim-Subscription-Key": apiKey,
        "X-Microsoft-OutputFormat": "audio-48khz-192kbitrate-mono-mp3",
        "User-Agent": "InterviewThread",
      },
      body,
    } satisfies RequestInit,
  };
}

export function buildElevenLabsSpeechRequest({
  text,
  locale,
  apiKey,
  voiceId,
}: {
  text: string;
  locale: LocaleCode;
  apiKey: string;
  voiceId: string;
}) {
  if (!apiKey || !isElevenLabsVoiceId(voiceId))
    throw new Error("Speech configuration is unavailable.");
  const normalized = normalizeTtsText(text);
  if (!normalized) throw new Error("Speech text is empty.");
  const spokenText = normalizeTechnicalTermsForSpeech(normalized, locale);

  return {
    url: `${ELEVENLABS_TTS_ENDPOINT}/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128`,
    init: {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        // Keep the first release neutral. v3 audio tags can materially change
        // delivery and must be introduced only after voice-by-voice listening
        // tests so a tag is never spoken aloud by an incompatible voice.
        text: spokenText,
        model_id: TTS_MODEL_ID,
        language_code: ELEVENLABS_LANGUAGE_CODES[locale],
        voice_settings: {
          stability: 0.5,
        },
        seed: 20260827,
        apply_text_normalization: "auto",
      }),
    } satisfies RequestInit,
  };
}

export function buildAzureSpeechRequest(input: {
  text: string;
  locale: LocaleCode;
  apiKey: string;
  region: string;
}) {
  return azureSpeechRequest({ ...input, model: "hd" });
}

export function buildAzureStandardSpeechRequest(input: {
  text: string;
  locale: LocaleCode;
  apiKey: string;
  region: string;
}) {
  return azureSpeechRequest({ ...input, model: "standard" });
}
