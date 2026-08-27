import type { LocaleCode } from "./i18n";

export type SpeechStatusCopy = {
  hdVoice: string;
  deviceFallback: string;
  readyToPlay: string;
};

export const SPEECH_STATUS_COPY: Record<LocaleCode, SpeechStatusCopy> = {
  en: { hdVoice: "InterviewThread HD voice", deviceFallback: "Device voice fallback", readyToPlay: "HD voice ready — tap Read question aloud" },
  ja: { hdVoice: "InterviewThread HD音声", deviceFallback: "端末の代替音声", readyToPlay: "HD音声の準備完了 —「質問を読み上げる」をタップ" },
  ko: { hdVoice: "InterviewThread HD 음성", deviceFallback: "기기 음성으로 대체", readyToPlay: "HD 음성 준비 완료 — ‘질문 읽기’를 누르세요" },
  "zh-CN": { hdVoice: "InterviewThread 高清语音", deviceFallback: "已改用设备语音", readyToPlay: "高清语音已就绪 — 点按“朗读问题”" },
  "zh-TW": { hdVoice: "InterviewThread 高品質語音", deviceFallback: "已改用裝置語音", readyToPlay: "高品質語音已就緒 — 點按「朗讀問題」" },
  es: { hdVoice: "Voz HD de InterviewThread", deviceFallback: "Voz del dispositivo (alternativa)", readyToPlay: "Voz HD lista — toca «Leer la pregunta»" },
  fr: { hdVoice: "Voix HD d’InterviewThread", deviceFallback: "Voix de l’appareil (secours)", readyToPlay: "Voix HD prête — touchez « Lire la question »" },
  de: { hdVoice: "InterviewThread-HD-Stimme", deviceFallback: "Gerätestimme als Ersatz", readyToPlay: "HD-Stimme bereit — tippen Sie auf „Frage vorlesen“" },
  "pt-BR": { hdVoice: "Voz HD do InterviewThread", deviceFallback: "Voz do dispositivo (alternativa)", readyToPlay: "Voz HD pronta — toque em “Ler pergunta”" },
  it: { hdVoice: "Voce HD di InterviewThread", deviceFallback: "Voce del dispositivo (alternativa)", readyToPlay: "Voce HD pronta — tocca «Leggi la domanda»" },
  nl: { hdVoice: "InterviewThread HD-stem", deviceFallback: "Apparaatstem als alternatief", readyToPlay: "HD-stem klaar — tik op ‘Vraag voorlezen’" },
  pl: { hdVoice: "Głos HD InterviewThread", deviceFallback: "Zapasowy głos urządzenia", readyToPlay: "Głos HD gotowy — stuknij „Odczytaj pytanie”" },
  tr: { hdVoice: "InterviewThread HD sesi", deviceFallback: "Cihaz sesiyle devam", readyToPlay: "HD ses hazır — “Soruyu seslendir”e dokunun" },
  ru: { hdVoice: "HD-голос InterviewThread", deviceFallback: "Резервный голос устройства", readyToPlay: "HD-голос готов — нажмите «Озвучить вопрос»" },
  uk: { hdVoice: "HD-голос InterviewThread", deviceFallback: "Резервний голос пристрою", readyToPlay: "HD-голос готовий — натисніть «Озвучити запитання»" },
  ar: { hdVoice: "صوت InterviewThread عالي الدقة", deviceFallback: "الصوت الاحتياطي للجهاز", readyToPlay: "الصوت عالي الدقة جاهز — اضغط «قراءة السؤال»" },
  he: { hdVoice: "קול HD של InterviewThread", deviceFallback: "קול המכשיר כחלופה", readyToPlay: "קול ה־HD מוכן — לחצו על ״הקראת השאלה״" },
  hi: { hdVoice: "InterviewThread HD आवाज़", deviceFallback: "डिवाइस की वैकल्पिक आवाज़", readyToPlay: "HD आवाज़ तैयार है — ‘प्रश्न पढ़ें’ पर टैप करें" },
  bn: { hdVoice: "InterviewThread HD কণ্ঠ", deviceFallback: "ডিভাইসের বিকল্প কণ্ঠ", readyToPlay: "HD কণ্ঠ প্রস্তুত — ‘প্রশ্নটি পড়ুন’ ট্যাপ করুন" },
  ur: { hdVoice: "InterviewThread HD آواز", deviceFallback: "ڈیوائس کی متبادل آواز", readyToPlay: "HD آواز تیار ہے — ’سوال پڑھیں‘ پر ٹیپ کریں" },
  id: { hdVoice: "Suara HD InterviewThread", deviceFallback: "Suara perangkat sebagai cadangan", readyToPlay: "Suara HD siap — ketuk “Bacakan pertanyaan”" },
  ms: { hdVoice: "Suara HD InterviewThread", deviceFallback: "Suara peranti sebagai sandaran", readyToPlay: "Suara HD sedia — ketik “Bacakan soalan”" },
  th: { hdVoice: "เสียง HD ของ InterviewThread", deviceFallback: "ใช้เสียงจากอุปกรณ์แทน", readyToPlay: "เสียง HD พร้อมแล้ว — แตะ “อ่านคำถาม”" },
  vi: { hdVoice: "Giọng HD của InterviewThread", deviceFallback: "Giọng thiết bị dự phòng", readyToPlay: "Giọng HD đã sẵn sàng — nhấn “Đọc câu hỏi”" },
  fil: { hdVoice: "InterviewThread HD na boses", deviceFallback: "Boses ng device bilang fallback", readyToPlay: "Handa na ang HD na boses — i-tap ang “Basahin ang tanong”" },
  sv: { hdVoice: "InterviewThread HD-röst", deviceFallback: "Enhetens röst som reserv", readyToPlay: "HD-rösten är klar — tryck på ”Läs upp frågan”" },
  no: { hdVoice: "InterviewThread HD-stemme", deviceFallback: "Enhetsstemme som reserve", readyToPlay: "HD-stemmen er klar — trykk på «Les opp spørsmålet»" },
  da: { hdVoice: "InterviewThread HD-stemme", deviceFallback: "Enhedsstemme som reserve", readyToPlay: "HD-stemmen er klar — tryk på “Læs spørgsmålet op”" },
  fi: { hdVoice: "InterviewThread HD-ääni", deviceFallback: "Laitteen ääni varalla", readyToPlay: "HD-ääni on valmis — napauta ”Lue kysymys ääneen”" },
  cs: { hdVoice: "HD hlas InterviewThread", deviceFallback: "Náhradní hlas zařízení", readyToPlay: "HD hlas je připraven — klepněte na „Přečíst otázku“" },
  sk: { hdVoice: "HD hlas InterviewThread", deviceFallback: "Náhradný hlas zariadenia", readyToPlay: "HD hlas je pripravený — ťuknite na „Prečítať otázku“" },
  hu: { hdVoice: "InterviewThread HD-hang", deviceFallback: "Eszközhang tartalékként", readyToPlay: "A HD-hang készen áll — koppints a „Kérdés felolvasása” gombra" },
  ro: { hdVoice: "Voce HD InterviewThread", deviceFallback: "Vocea dispozitivului ca rezervă", readyToPlay: "Vocea HD este gata — atinge „Citește întrebarea”" },
  el: { hdVoice: "Φωνή HD του InterviewThread", deviceFallback: "Εφεδρική φωνή συσκευής", readyToPlay: "Η φωνή HD είναι έτοιμη — πατήστε «Ανάγνωση ερώτησης»" },
  bg: { hdVoice: "HD глас на InterviewThread", deviceFallback: "Резервен глас на устройството", readyToPlay: "HD гласът е готов — докоснете „Прочети въпроса“" },
  hr: { hdVoice: "InterviewThread HD glas", deviceFallback: "Glas uređaja kao zamjena", readyToPlay: "HD glas je spreman — dodirnite „Pročitaj pitanje“" },
  sr: { hdVoice: "InterviewThread HD глас", deviceFallback: "Глас уређаја као замена", readyToPlay: "HD глас је спреман — додирните „Прочитај питање“" },
  sl: { hdVoice: "InterviewThread HD-glas", deviceFallback: "Glas naprave kot rezerva", readyToPlay: "HD-glas je pripravljen — tapnite »Preberi vprašanje«" },
  sw: { hdVoice: "Sauti ya HD ya InterviewThread", deviceFallback: "Sauti ya kifaa kama mbadala", readyToPlay: "Sauti ya HD iko tayari — gusa “Soma swali”" },
  fa: { hdVoice: "صدای HD ‏InterviewThread", deviceFallback: "صدای جایگزین دستگاه", readyToPlay: "صدای HD آماده است — روی «خواندن پرسش» بزنید" },
};

export function speechStatusCopyFor(locale: LocaleCode): SpeechStatusCopy {
  return SPEECH_STATUS_COPY[locale] ?? SPEECH_STATUS_COPY.en;
}
