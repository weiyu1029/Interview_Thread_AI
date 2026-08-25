import type { LocaleCode } from "./i18n";

export type InterviewSttCopy = {
  listening: string;
  refining: string;
  deviceFallback: string;
  permissionDenied: string;
  unavailable: string;
  privacy: string;
};

const INTERVIEW_STT_COPY = {
  en: {
    listening: "Listening — live transcript",
    refining: "Improving your transcript…",
    deviceFallback: "Cloud refinement is unavailable. Your current answer was kept.",
    permissionDenied: "Allow microphone access, or answer by text.",
    unavailable: "Voice input is not supported here. Answer by text.",
    privacy:
      "Audio is processed only to transcribe this answer and is not stored by InterviewThread.",
  },
  ja: {
    listening: "音声を認識中 — リアルタイム文字起こし",
    refining: "文字起こしを仕上げています…",
    deviceFallback: "クラウド補正を利用できないため、現在の回答を残しました。",
    permissionDenied: "マイクへのアクセスを許可するか、テキストで回答してください。",
    unavailable: "この環境では音声入力を利用できません。テキストで回答してください。",
    privacy:
      "音声はこの回答の文字起こしにのみ使用され、InterviewThread には保存されません。",
  },
  ko: {
    listening: "음성을 듣는 중 — 실시간 받아쓰기",
    refining: "받아쓰기를 다듬는 중…",
    deviceFallback: "클라우드 보정을 사용할 수 없어 현재 답변을 유지했습니다.",
    permissionDenied: "마이크 접근을 허용하거나 텍스트로 답변해 주세요.",
    unavailable: "이 환경에서는 음성 입력을 지원하지 않습니다. 텍스트로 답변해 주세요.",
    privacy:
      "음성은 이 답변을 받아쓰는 데만 처리되며 InterviewThread에 저장되지 않습니다.",
  },
  "zh-CN": {
    listening: "正在聆听 — 实时显示文字",
    refining: "正在优化转写结果…",
    deviceFallback: "云端优化暂时不可用，已保留你当前的回答。",
    permissionDenied: "请允许使用麦克风，或改用文字作答。",
    unavailable: "当前环境不支持语音输入，请改用文字作答。",
    privacy: "音频仅用于转写本次回答，InterviewThread 不会保存音频。",
  },
  "zh-TW": {
    listening: "正在聆聽 — 即時顯示文字",
    refining: "正在優化轉寫結果…",
    deviceFallback: "雲端優化暫時無法使用，已保留你目前的回答。",
    permissionDenied: "請允許使用麥克風，或改用文字作答。",
    unavailable: "目前環境不支援語音輸入，請改用文字作答。",
    privacy: "音訊僅用於轉寫本次回答，InterviewThread 不會儲存音訊。",
  },
  es: {
    listening: "Escuchando — transcripción en directo",
    refining: "Mejorando la transcripción…",
    deviceFallback: "La mejora en la nube no está disponible. Conservamos tu respuesta actual.",
    permissionDenied: "Permite el acceso al micrófono o responde por escrito.",
    unavailable: "La entrada de voz no está disponible aquí. Responde por escrito.",
    privacy:
      "El audio solo se procesa para transcribir esta respuesta y InterviewThread no lo guarda.",
  },
  fr: {
    listening: "Écoute en cours — transcription en direct",
    refining: "Amélioration de la transcription…",
    deviceFallback:
      "L’amélioration dans le cloud est indisponible. Votre réponse actuelle a été conservée.",
    permissionDenied: "Autorisez l’accès au microphone ou répondez par écrit.",
    unavailable: "La saisie vocale n’est pas disponible ici. Répondez par écrit.",
    privacy:
      "L’audio sert uniquement à transcrire cette réponse et n’est pas conservé par InterviewThread.",
  },
  de: {
    listening: "Hört zu — Live-Transkript",
    refining: "Transkript wird verbessert…",
    deviceFallback:
      "Die Cloud-Optimierung ist nicht verfügbar. Ihre aktuelle Antwort wurde beibehalten.",
    permissionDenied: "Erlauben Sie den Mikrofonzugriff oder antworten Sie schriftlich.",
    unavailable: "Spracheingabe wird hier nicht unterstützt. Antworten Sie schriftlich.",
    privacy:
      "Das Audio wird nur zur Transkription dieser Antwort verarbeitet und nicht von InterviewThread gespeichert.",
  },
  "pt-BR": {
    listening: "Ouvindo — transcrição ao vivo",
    refining: "Aprimorando a transcrição…",
    deviceFallback:
      "O aprimoramento na nuvem está indisponível. Sua resposta atual foi mantida.",
    permissionDenied: "Permita o acesso ao microfone ou responda por texto.",
    unavailable: "A entrada por voz não está disponível aqui. Responda por texto.",
    privacy:
      "O áudio é processado apenas para transcrever esta resposta e não é armazenado pelo InterviewThread.",
  },
  it: {
    listening: "In ascolto — trascrizione in tempo reale",
    refining: "Miglioramento della trascrizione…",
    deviceFallback:
      "Il miglioramento nel cloud non è disponibile. La risposta attuale è stata conservata.",
    permissionDenied: "Consenti l’accesso al microfono oppure rispondi per iscritto.",
    unavailable: "L’input vocale non è disponibile qui. Rispondi per iscritto.",
    privacy:
      "L’audio viene elaborato solo per trascrivere questa risposta e non viene archiviato da InterviewThread.",
  },
  nl: {
    listening: "Luisteren — live transcriptie",
    refining: "Transcriptie wordt verbeterd…",
    deviceFallback:
      "Cloudverbetering is niet beschikbaar. Uw huidige antwoord is behouden.",
    permissionDenied: "Sta microfoontoegang toe of antwoord met tekst.",
    unavailable: "Spraakinvoer wordt hier niet ondersteund. Antwoord met tekst.",
    privacy:
      "Audio wordt alleen verwerkt om dit antwoord te transcriberen en niet door InterviewThread opgeslagen.",
  },
  pl: {
    listening: "Słuchanie — transkrypcja na żywo",
    refining: "Ulepszanie transkrypcji…",
    deviceFallback:
      "Ulepszanie w chmurze jest niedostępne. Zachowaliśmy Twoją obecną odpowiedź.",
    permissionDenied: "Zezwól na dostęp do mikrofonu lub odpowiedz tekstowo.",
    unavailable: "Wprowadzanie głosowe nie jest tutaj obsługiwane. Odpowiedz tekstowo.",
    privacy:
      "Dźwięk jest przetwarzany wyłącznie w celu transkrypcji tej odpowiedzi i nie jest przechowywany przez InterviewThread.",
  },
  tr: {
    listening: "Dinleniyor — canlı döküm",
    refining: "Döküm iyileştiriliyor…",
    deviceFallback: "Bulut iyileştirmesi kullanılamıyor. Mevcut yanıtınız korundu.",
    permissionDenied: "Mikrofon erişimine izin verin veya yazılı yanıtlayın.",
    unavailable: "Sesli giriş burada desteklenmiyor. Yazılı yanıtlayın.",
    privacy:
      "Ses yalnızca bu yanıtı yazıya dökmek için işlenir ve InterviewThread tarafından saklanmaz.",
  },
  ru: {
    listening: "Идёт распознавание — текст в реальном времени",
    refining: "Улучшаем расшифровку…",
    deviceFallback: "Облачное улучшение недоступно. Текущий ответ сохранён.",
    permissionDenied: "Разрешите доступ к микрофону или ответьте текстом.",
    unavailable: "Голосовой ввод здесь не поддерживается. Ответьте текстом.",
    privacy:
      "Аудио обрабатывается только для расшифровки этого ответа и не сохраняется InterviewThread.",
  },
  uk: {
    listening: "Триває розпізнавання — текст у реальному часі",
    refining: "Удосконалюємо розшифрування…",
    deviceFallback: "Хмарне вдосконалення недоступне. Поточну відповідь збережено.",
    permissionDenied: "Дозвольте доступ до мікрофона або дайте текстову відповідь.",
    unavailable: "Голосове введення тут не підтримується. Дайте текстову відповідь.",
    privacy:
      "Аудіо обробляється лише для розшифрування цієї відповіді й не зберігається InterviewThread.",
  },
  ar: {
    listening: "جارٍ الاستماع — نسخ مباشر",
    refining: "جارٍ تحسين النص…",
    deviceFallback: "التحسين السحابي غير متاح. تم الاحتفاظ بإجابتك الحالية.",
    permissionDenied: "اسمح بالوصول إلى الميكروفون أو أجب كتابةً.",
    unavailable: "الإدخال الصوتي غير مدعوم هنا. أجب كتابةً.",
    privacy:
      "تتم معالجة الصوت فقط لنسخ هذه الإجابة ولا يحتفظ به InterviewThread.",
  },
  he: {
    listening: "מקשיב — תמלול בזמן אמת",
    refining: "משפר את התמלול…",
    deviceFallback: "השיפור בענן אינו זמין. התשובה הנוכחית נשמרה.",
    permissionDenied: "יש לאפשר גישה למיקרופון או לענות בכתב.",
    unavailable: "קלט קולי אינו נתמך כאן. יש לענות בכתב.",
    privacy:
      "השמע מעובד רק לצורך תמלול התשובה ואינו נשמר על ידי InterviewThread.",
  },
  hi: {
    listening: "सुन रहा है — लाइव ट्रांसक्रिप्ट",
    refining: "ट्रांसक्रिप्ट बेहतर की जा रही है…",
    deviceFallback: "क्लाउड सुधार उपलब्ध नहीं है। आपका मौजूदा उत्तर सुरक्षित रखा गया है।",
    permissionDenied: "माइक्रोफ़ोन की अनुमति दें या लिखकर उत्तर दें।",
    unavailable: "यहाँ वॉइस इनपुट समर्थित नहीं है। लिखकर उत्तर दें।",
    privacy:
      "ऑडियो का उपयोग केवल इस उत्तर को लिखने के लिए होता है और InterviewThread इसे संग्रहीत नहीं करता।",
  },
  bn: {
    listening: "শোনা হচ্ছে — সরাসরি প্রতিলিপি",
    refining: "প্রতিলিপি আরও নির্ভুল করা হচ্ছে…",
    deviceFallback: "ক্লাউড সংশোধন পাওয়া যাচ্ছে না। আপনার বর্তমান উত্তর রাখা হয়েছে।",
    permissionDenied: "মাইক্রোফোন ব্যবহারের অনুমতি দিন অথবা লিখে উত্তর দিন।",
    unavailable: "এখানে ভয়েস ইনপুট সমর্থিত নয়। লিখে উত্তর দিন।",
    privacy:
      "শুধু এই উত্তরটি প্রতিলিপি করতে অডিও প্রক্রিয়া করা হয় এবং InterviewThread এটি সংরক্ষণ করে না।",
  },
  ur: {
    listening: "سنا جا رہا ہے — براہِ راست نقل",
    refining: "نقل کو بہتر کیا جا رہا ہے…",
    deviceFallback: "کلاؤڈ بہتری دستیاب نہیں۔ آپ کا موجودہ جواب محفوظ رکھا گیا ہے۔",
    permissionDenied: "مائیکروفون کی اجازت دیں یا تحریری جواب دیں۔",
    unavailable: "یہاں صوتی ان پٹ دستیاب نہیں۔ تحریری جواب دیں۔",
    privacy:
      "آڈیو صرف اس جواب کو تحریر میں بدلنے کے لیے استعمال ہوتی ہے اور InterviewThread اسے محفوظ نہیں کرتا۔",
  },
  id: {
    listening: "Mendengarkan — transkripsi langsung",
    refining: "Menyempurnakan transkripsi…",
    deviceFallback:
      "Penyempurnaan cloud tidak tersedia. Jawaban Anda saat ini tetap disimpan.",
    permissionDenied: "Izinkan akses mikrofon atau jawab dengan teks.",
    unavailable: "Input suara tidak didukung di sini. Jawab dengan teks.",
    privacy:
      "Audio hanya diproses untuk mentranskripsikan jawaban ini dan tidak disimpan oleh InterviewThread.",
  },
  ms: {
    listening: "Sedang mendengar — transkripsi langsung",
    refining: "Memperhalus transkripsi…",
    deviceFallback:
      "Pemurnian awan tidak tersedia. Jawapan semasa anda telah dikekalkan.",
    permissionDenied: "Benarkan akses mikrofon atau jawab dengan teks.",
    unavailable: "Input suara tidak disokong di sini. Jawab dengan teks.",
    privacy:
      "Audio hanya diproses untuk mentranskripsi jawapan ini dan tidak disimpan oleh InterviewThread.",
  },
  th: {
    listening: "กำลังฟัง — ถอดเสียงแบบเรียลไทม์",
    refining: "กำลังปรับข้อความถอดเสียงให้แม่นยำขึ้น…",
    deviceFallback: "ไม่สามารถปรับแก้ผ่านคลาวด์ได้ ระบบเก็บคำตอบปัจจุบันของคุณไว้แล้ว",
    permissionDenied: "โปรดอนุญาตให้ใช้ไมโครโฟน หรือตอบด้วยข้อความ",
    unavailable: "อุปกรณ์นี้ไม่รองรับการป้อนข้อมูลด้วยเสียง โปรดตอบด้วยข้อความ",
    privacy:
      "เสียงจะถูกประมวลผลเพื่อถอดคำตอบนี้เท่านั้น และ InterviewThread จะไม่จัดเก็บเสียง",
  },
  vi: {
    listening: "Đang nghe — bản chép lời trực tiếp",
    refining: "Đang hoàn thiện bản chép lời…",
    deviceFallback:
      "Không thể tinh chỉnh trên đám mây. Câu trả lời hiện tại của bạn vẫn được giữ nguyên.",
    permissionDenied: "Hãy cho phép truy cập micrô hoặc trả lời bằng văn bản.",
    unavailable: "Thiết bị này không hỗ trợ nhập liệu bằng giọng nói. Hãy trả lời bằng văn bản.",
    privacy:
      "Âm thanh chỉ được xử lý để chép lại câu trả lời này và không được InterviewThread lưu trữ.",
  },
  fil: {
    listening: "Nakikinig — live na transkripsyon",
    refining: "Pinapahusay ang transkripsyon…",
    deviceFallback:
      "Hindi available ang cloud refinement. Napanatili ang kasalukuyan mong sagot.",
    permissionDenied: "Payagan ang access sa mikropono o sumagot gamit ang text.",
    unavailable: "Hindi suportado rito ang voice input. Sumagot gamit ang text.",
    privacy:
      "Pinoproseso lang ang audio para i-transcribe ang sagot na ito at hindi ito sine-save ng InterviewThread.",
  },
  sv: {
    listening: "Lyssnar — direkttranskribering",
    refining: "Förbättrar transkriberingen…",
    deviceFallback: "Molnförbättring är inte tillgänglig. Ditt nuvarande svar behölls.",
    permissionDenied: "Tillåt mikrofonåtkomst eller svara med text.",
    unavailable: "Röstinmatning stöds inte här. Svara med text.",
    privacy:
      "Ljudet behandlas endast för att transkribera detta svar och sparas inte av InterviewThread.",
  },
  no: {
    listening: "Lytter — direktetranskripsjon",
    refining: "Forbedrer transkripsjonen…",
    deviceFallback: "Skyforbedring er ikke tilgjengelig. Det nåværende svaret ditt ble beholdt.",
    permissionDenied: "Tillat mikrofontilgang eller svar med tekst.",
    unavailable: "Taleinndata støttes ikke her. Svar med tekst.",
    privacy:
      "Lyden behandles bare for å transkribere dette svaret og lagres ikke av InterviewThread.",
  },
  da: {
    listening: "Lytter — direkte transskription",
    refining: "Forbedrer transskriptionen…",
    deviceFallback: "Cloudforbedring er ikke tilgængelig. Dit nuværende svar blev bevaret.",
    permissionDenied: "Tillad mikrofonadgang, eller svar med tekst.",
    unavailable: "Stemmeinput understøttes ikke her. Svar med tekst.",
    privacy:
      "Lyden behandles kun for at transskribere dette svar og gemmes ikke af InterviewThread.",
  },
  fi: {
    listening: "Kuunnellaan — reaaliaikainen litterointi",
    refining: "Parannetaan litterointia…",
    deviceFallback: "Pilviparannus ei ole käytettävissä. Nykyinen vastauksesi säilytettiin.",
    permissionDenied: "Salli mikrofonin käyttö tai vastaa kirjoittamalla.",
    unavailable: "Puheensyöttöä ei tueta tässä ympäristössä. Vastaa kirjoittamalla.",
    privacy:
      "Ääntä käsitellään vain tämän vastauksen litterointiin, eikä InterviewThread tallenna sitä.",
  },
  cs: {
    listening: "Poslouchám — živý přepis",
    refining: "Vylepšuji přepis…",
    deviceFallback: "Vylepšení v cloudu není dostupné. Vaše aktuální odpověď byla zachována.",
    permissionDenied: "Povolte přístup k mikrofonu nebo odpovězte textem.",
    unavailable: "Hlasový vstup zde není podporován. Odpovězte textem.",
    privacy:
      "Zvuk se zpracovává pouze pro přepis této odpovědi a InterviewThread jej neukládá.",
  },
  sk: {
    listening: "Počúvam — živý prepis",
    refining: "Vylepšujem prepis…",
    deviceFallback: "Vylepšenie v cloude nie je dostupné. Vaša aktuálna odpoveď bola zachovaná.",
    permissionDenied: "Povoľte prístup k mikrofónu alebo odpovedzte textom.",
    unavailable: "Hlasový vstup tu nie je podporovaný. Odpovedzte textom.",
    privacy:
      "Zvuk sa spracúva iba na prepis tejto odpovede a InterviewThread ho neukladá.",
  },
  hu: {
    listening: "Figyelés — élő átirat",
    refining: "Az átirat pontosítása…",
    deviceFallback: "A felhőalapú pontosítás nem érhető el. A jelenlegi válasza megmaradt.",
    permissionDenied: "Engedélyezze a mikrofon használatát, vagy válaszoljon írásban.",
    unavailable: "A hangbevitel itt nem támogatott. Válaszoljon írásban.",
    privacy:
      "A hang feldolgozása kizárólag e válasz átírásához történik, az InterviewThread nem tárolja.",
  },
  ro: {
    listening: "Ascultare — transcriere în direct",
    refining: "Îmbunătățim transcrierea…",
    deviceFallback:
      "Îmbunătățirea în cloud nu este disponibilă. Răspunsul actual a fost păstrat.",
    permissionDenied: "Permiteți accesul la microfon sau răspundeți în scris.",
    unavailable: "Introducerea vocală nu este acceptată aici. Răspundeți în scris.",
    privacy:
      "Sunetul este procesat doar pentru transcrierea acestui răspuns și nu este stocat de InterviewThread.",
  },
  el: {
    listening: "Ακρόαση — ζωντανή μεταγραφή",
    refining: "Βελτιώνουμε τη μεταγραφή…",
    deviceFallback: "Η βελτίωση στο cloud δεν είναι διαθέσιμη. Η τρέχουσα απάντησή σας διατηρήθηκε.",
    permissionDenied: "Επιτρέψτε την πρόσβαση στο μικρόφωνο ή απαντήστε γραπτώς.",
    unavailable: "Η φωνητική εισαγωγή δεν υποστηρίζεται εδώ. Απαντήστε γραπτώς.",
    privacy:
      "Ο ήχος υποβάλλεται σε επεξεργασία μόνο για τη μεταγραφή αυτής της απάντησης και δεν αποθηκεύεται από το InterviewThread.",
  },
  bg: {
    listening: "Слушане — транскрипция на живо",
    refining: "Подобряваме транскрипцията…",
    deviceFallback: "Облачното подобрение не е достъпно. Текущият ви отговор беше запазен.",
    permissionDenied: "Разрешете достъп до микрофона или отговорете писмено.",
    unavailable: "Гласовото въвеждане не се поддържа тук. Отговорете писмено.",
    privacy:
      "Аудиото се обработва само за транскрипция на този отговор и не се съхранява от InterviewThread.",
  },
  hr: {
    listening: "Slušanje — prijepis uživo",
    refining: "Poboljšavamo prijepis…",
    deviceFallback: "Poboljšanje u oblaku nije dostupno. Vaš trenutačni odgovor je sačuvan.",
    permissionDenied: "Dopustite pristup mikrofonu ili odgovorite tekstom.",
    unavailable: "Glasovni unos ovdje nije podržan. Odgovorite tekstom.",
    privacy:
      "Zvuk se obrađuje samo radi prijepisa ovog odgovora i InterviewThread ga ne pohranjuje.",
  },
  sr: {
    listening: "Слушање — транскрипт уживо",
    refining: "Побољшавамо транскрипт…",
    deviceFallback: "Побољшање у облаку није доступно. Ваш тренутни одговор је сачуван.",
    permissionDenied: "Дозволите приступ микрофону или одговорите текстом.",
    unavailable: "Гласовни унос овде није подржан. Одговорите текстом.",
    privacy:
      "Звук се обрађује само ради транскрипције овог одговора и InterviewThread га не чува.",
  },
  sl: {
    listening: "Poslušanje — prepis v živo",
    refining: "Izboljšujemo prepis…",
    deviceFallback: "Izboljšava v oblaku ni na voljo. Vaš trenutni odgovor je bil ohranjen.",
    permissionDenied: "Dovolite dostop do mikrofona ali odgovorite z besedilom.",
    unavailable: "Glasovni vnos tukaj ni podprt. Odgovorite z besedilom.",
    privacy:
      "Zvok se obdela samo za prepis tega odgovora in ga InterviewThread ne shranjuje.",
  },
  sw: {
    listening: "Inasikiliza — nakala ya moja kwa moja",
    refining: "Inaboresha nakala…",
    deviceFallback: "Uboreshaji wa wingu haupatikani. Jibu lako la sasa limehifadhiwa.",
    permissionDenied: "Ruhusu matumizi ya maikrofoni au jibu kwa maandishi.",
    unavailable: "Uingizaji wa sauti hautumiki hapa. Jibu kwa maandishi.",
    privacy:
      "Sauti huchakatwa tu ili kunakili jibu hili na haihifadhiwi na InterviewThread.",
  },
  fa: {
    listening: "در حال شنیدن — رونوشت زنده",
    refining: "در حال بهبود رونوشت…",
    deviceFallback: "بهبود ابری در دسترس نیست. پاسخ فعلی شما حفظ شد.",
    permissionDenied: "اجازهٔ دسترسی به میکروفون را بدهید یا نوشتاری پاسخ دهید.",
    unavailable: "ورودی صوتی در اینجا پشتیبانی نمی‌شود. نوشتاری پاسخ دهید.",
    privacy:
      "صدا فقط برای رونویسی این پاسخ پردازش می‌شود و InterviewThread آن را ذخیره نمی‌کند.",
  },
} satisfies Record<LocaleCode, InterviewSttCopy>;

export function sttCopyFor(locale: LocaleCode): InterviewSttCopy {
  return INTERVIEW_STT_COPY[locale];
}
