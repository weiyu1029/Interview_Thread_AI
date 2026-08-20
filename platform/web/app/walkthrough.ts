import type { LocaleCode } from "./i18n";
import rawTranscripts from "./walkthrough-transcripts.json";

export type WalkthroughCue = {
  start: number;
  end: number;
  text: string;
};

const CUE_WINDOWS = [
  [0, 10],
  [10, 21],
  [21, 33],
  [33, 44],
  [44, 55],
] as const;

const TRANSCRIPTS = rawTranscripts as Record<LocaleCode, readonly string[]>;

const NARRATION_LABELS: Record<LocaleCode, string> = {
  en: "Narration",
  ja: "ナレーション",
  ko: "내레이션",
  "zh-CN": "旁白",
  "zh-TW": "旁白",
  es: "Narración",
  fr: "Narration",
  de: "Sprecherstimme",
  "pt-BR": "Narração",
  it: "Narrazione",
  nl: "Vertelling",
  pl: "Narracja",
  tr: "Anlatım",
  ru: "Озвучивание",
  uk: "Озвучення",
  ar: "التعليق الصوتي",
  he: "קריינות",
  hi: "वाचन",
  bn: "কণ্ঠবর্ণনা",
  ur: "آواز میں رہنمائی",
  id: "Narasi",
  ms: "Narasi",
  th: "เสียงบรรยาย",
  vi: "Thuyết minh",
  fil: "Naratibo",
  sv: "Berättarröst",
  no: "Fortellerstemme",
  da: "Fortællerstemme",
  fi: "Kertojaääni",
  cs: "Vyprávění",
  sk: "Rozprávanie",
  hu: "Narráció",
  ro: "Narațiune",
  el: "Αφήγηση",
  bg: "Озвучаване",
  hr: "Naracija",
  sr: "Нарација",
  sl: "Pripoved",
  sw: "Usimulizi",
  fa: "روایت صوتی",
};

export function walkthroughCuesFor(locale: LocaleCode): WalkthroughCue[] {
  return CUE_WINDOWS.map(([start, end], index) => ({
    start,
    end,
    text: TRANSCRIPTS[locale][index],
  }));
}

export function walkthroughTrackFor(locale: LocaleCode) {
  return `/interviewthread-walkthrough-${locale}.vtt`;
}

export function walkthroughNarrationLabelFor(locale: LocaleCode) {
  return NARRATION_LABELS[locale];
}

