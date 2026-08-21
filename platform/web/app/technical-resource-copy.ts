import type { LocaleCode } from "./i18n";

type TechnicalResourceCopy = Readonly<{
  action: string;
  opensNewTab: string;
}>;

const TECHNICAL_RESOURCE_COPY: Record<LocaleCode, TechnicalResourceCopy> = {
  en: { action: "Open practice resource", opensNewTab: "opens in a new tab" },
  ja: { action: "練習リソースを開く", opensNewTab: "新しいタブで開きます" },
  ko: { action: "연습 자료 열기", opensNewTab: "새 탭에서 열림" },
  "zh-CN": { action: "打开练习资源", opensNewTab: "在新标签页中打开" },
  "zh-TW": { action: "開啟練習資源", opensNewTab: "在新分頁開啟" },
  es: { action: "Abrir recurso de práctica", opensNewTab: "se abre en una pestaña nueva" },
  fr: { action: "Ouvrir la ressource d’entraînement", opensNewTab: "s’ouvre dans un nouvel onglet" },
  de: { action: "Übungsressource öffnen", opensNewTab: "wird in einem neuen Tab geöffnet" },
  "pt-BR": { action: "Abrir recurso de prática", opensNewTab: "abre em uma nova guia" },
  it: { action: "Apri la risorsa di esercitazione", opensNewTab: "si apre in una nuova scheda" },
  nl: { action: "Oefenbron openen", opensNewTab: "opent in een nieuw tabblad" },
  pl: { action: "Otwórz materiał do ćwiczeń", opensNewTab: "otwiera się w nowej karcie" },
  tr: { action: "Alıştırma kaynağını aç", opensNewTab: "yeni sekmede açılır" },
  ru: { action: "Открыть материал для практики", opensNewTab: "откроется в новой вкладке" },
  uk: { action: "Відкрити матеріал для практики", opensNewTab: "відкриється в новій вкладці" },
  ar: { action: "فتح مورد التدريب", opensNewTab: "يفتح في علامة تبويب جديدة" },
  he: { action: "פתיחת משאב לתרגול", opensNewTab: "נפתח בכרטיסייה חדשה" },
  hi: { action: "अभ्यास संसाधन खोलें", opensNewTab: "नए टैब में खुलता है" },
  bn: { action: "অনুশীলনের রিসোর্স খুলুন", opensNewTab: "নতুন ট্যাবে খোলে" },
  ur: { action: "مشق کا وسیلہ کھولیں", opensNewTab: "نئے ٹیب میں کھلتا ہے" },
  id: { action: "Buka sumber latihan", opensNewTab: "terbuka di tab baru" },
  ms: { action: "Buka sumber latihan", opensNewTab: "dibuka dalam tab baharu" },
  th: { action: "เปิดแหล่งฝึกฝน", opensNewTab: "เปิดในแท็บใหม่" },
  vi: { action: "Mở tài nguyên luyện tập", opensNewTab: "mở trong thẻ mới" },
  fil: { action: "Buksan ang resource sa pagsasanay", opensNewTab: "magbubukas sa bagong tab" },
  sv: { action: "Öppna övningsresurs", opensNewTab: "öppnas i en ny flik" },
  no: { action: "Åpne øvingsressurs", opensNewTab: "åpnes i en ny fane" },
  da: { action: "Åbn øvelsesressource", opensNewTab: "åbnes i en ny fane" },
  fi: { action: "Avaa harjoittelumateriaali", opensNewTab: "avautuu uuteen välilehteen" },
  cs: { action: "Otevřít materiál k procvičení", opensNewTab: "otevře se na nové kartě" },
  sk: { action: "Otvoriť materiál na precvičenie", opensNewTab: "otvorí sa na novej karte" },
  hu: { action: "Gyakorlóanyag megnyitása", opensNewTab: "új lapon nyílik meg" },
  ro: { action: "Deschide resursa de practică", opensNewTab: "se deschide într-o filă nouă" },
  el: { action: "Άνοιγμα πόρου εξάσκησης", opensNewTab: "ανοίγει σε νέα καρτέλα" },
  bg: { action: "Отваряне на ресурс за упражнение", opensNewTab: "отваря се в нов раздел" },
  hr: { action: "Otvori resurs za vježbu", opensNewTab: "otvara se u novoj kartici" },
  sr: { action: "Отвори ресурс за вежбање", opensNewTab: "отвара се у новој картици" },
  sl: { action: "Odpri vir za vajo", opensNewTab: "odpre se v novem zavihku" },
  sw: { action: "Fungua nyenzo ya mazoezi", opensNewTab: "hufunguka kwenye kichupo kipya" },
  fa: { action: "باز کردن منبع تمرین", opensNewTab: "در زبانهٔ جدید باز می‌شود" },
};

export function technicalResourceCopyFor(locale: LocaleCode) {
  return TECHNICAL_RESOURCE_COPY[locale];
}
