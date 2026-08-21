import type { LocaleCode } from "./i18n";

export const TTS_MODEL_ID = "azure-standard-neural";
export const TTS_MAX_CHARACTERS = 1_600;

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

const localeKeys = new Set<string>(Object.keys(AZURE_VOICES));

export function isTtsLocale(value: unknown): value is LocaleCode {
  return typeof value === "string" && localeKeys.has(value);
}

export function azureVoiceForLocale(locale: LocaleCode) {
  return AZURE_VOICES[locale].name;
}

export function azureLanguageForLocale(locale: LocaleCode) {
  return AZURE_VOICES[locale].language;
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

function technicalSsml(text: string) {
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

export function buildAzureSpeechRequest({
  text,
  locale,
  apiKey,
  region,
}: {
  text: string;
  locale: LocaleCode;
  apiKey: string;
  region: string;
}) {
  if (!apiKey) throw new Error("Speech configuration is unavailable.");
  if (!/^[a-z0-9-]+$/i.test(region))
    throw new Error("Speech configuration is unavailable.");
  const normalized = normalizeTtsText(text);
  if (!normalized) throw new Error("Speech text is empty.");
  const voice = AZURE_VOICES[locale];
  const body = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voice.language}"><voice name="${voice.name}"><prosody rate="0%">${technicalSsml(normalized)}</prosody></voice></speak>`;

  return {
    url: `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    init: {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/ssml+xml",
        "Ocp-Apim-Subscription-Key": apiKey,
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "InterviewThread",
      },
      body,
    } satisfies RequestInit,
  };
}
