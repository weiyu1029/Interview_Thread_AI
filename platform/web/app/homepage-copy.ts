import type { LocaleCode } from "./i18n";

export type HomepageCopy = {
  eyebrow: string;
  heroTitle: string;
  description: string;
  primaryCta: string;
  steps: readonly [string, string, string, string];
  trust: readonly [string, string, string];
};

const HOMEPAGE_COPY: Record<LocaleCode, Omit<HomepageCopy, "trust">> = {
  en: {
    eyebrow: "AI mock interview",
    heroTitle: "Ace the interview for the job you want.",
    description:
      "Turn your resume and the job post into truthful interview stories, realistic questions, and a focused practice plan.",
    primaryCta: "Start my mock interview",
    steps: [
      "Upload your resume",
      "Add the job post",
      "Get your interview plan",
      "Practice with AI",
    ],
  },
  ja: {
    eyebrow: "AI模擬面接",
    heroTitle: "志望する仕事の面接に、自信を持って臨もう。",
    description:
      "履歴書と求人票をもとに、事実に沿った回答ストーリー、想定質問、効率的な練習プランを作ります。",
    primaryCta: "模擬面接を始める",
    steps: ["履歴書を追加", "求人票を追加", "面接対策プランを確認", "AIと練習"],
  },
  ko: {
    eyebrow: "AI 모의 면접",
    heroTitle: "원하는 직무의 면접을 자신 있게 준비하세요.",
    description:
      "이력서와 채용 공고를 바탕으로 사실에 근거한 답변 스토리, 예상 질문, 집중 연습 계획을 만듭니다.",
    primaryCta: "모의 면접 시작하기",
    steps: ["이력서 올리기", "채용 공고 추가", "면접 계획 받기", "AI와 연습하기"],
  },
  "zh-CN": {
    eyebrow: "AI 模拟面试",
    heroTitle: "为心仪职位，自信拿下面试。",
    description:
      "根据你的简历与职位描述，生成有真实依据的面试故事、预测问题和清晰的练习计划。",
    primaryCta: "开始模拟面试",
    steps: ["上传简历", "加入职位描述", "获取面试计划", "与 AI 练习"],
  },
  "zh-TW": {
    eyebrow: "AI 模擬面試",
    heroTitle: "為心儀職缺，自信拿下面試。",
    description:
      "根據你的履歷與職缺說明，產生有真實依據的面試故事、預測問題與清楚的練習計畫。",
    primaryCta: "開始模擬面試",
    steps: ["上傳履歷", "加入職缺說明", "取得面試計畫", "與 AI 練習"],
  },
  es: {
    eyebrow: "Entrevista simulada con IA",
    heroTitle: "Domina la entrevista para el trabajo que quieres.",
    description:
      "Convierte tu currículum y la oferta en historias veraces, preguntas realistas y un plan de práctica enfocado.",
    primaryCta: "Empezar mi entrevista simulada",
    steps: ["Sube tu currículum", "Añade la oferta", "Recibe tu plan", "Practica con IA"],
  },
  fr: {
    eyebrow: "Entretien blanc avec IA",
    heroTitle: "Réussissez l’entretien pour le poste que vous visez.",
    description:
      "Transformez votre CV et l’offre en récits sincères, questions réalistes et plan d’entraînement ciblé.",
    primaryCta: "Commencer mon entretien blanc",
    steps: ["Ajoutez votre CV", "Ajoutez l’offre", "Recevez votre plan", "Entraînez-vous avec l’IA"],
  },
  de: {
    eyebrow: "KI-Probeinterview",
    heroTitle: "Meistere das Vorstellungsgespräch für deinen Wunschjob.",
    description:
      "Verwandle Lebenslauf und Stellenanzeige in ehrliche Geschichten, realistische Fragen und einen klaren Übungsplan.",
    primaryCta: "Probeinterview starten",
    steps: ["Lebenslauf hochladen", "Stellenanzeige hinzufügen", "Interviewplan erhalten", "Mit KI üben"],
  },
  "pt-BR": {
    eyebrow: "Entrevista simulada com IA",
    heroTitle: "Prepare-se para conquistar a vaga que você quer.",
    description:
      "Transforme seu currículo e a vaga em histórias verdadeiras, perguntas realistas e um plano de prática objetivo.",
    primaryCta: "Começar entrevista simulada",
    steps: ["Envie seu currículo", "Adicione a vaga", "Receba seu plano", "Pratique com IA"],
  },
  it: {
    eyebrow: "Colloquio simulato con IA",
    heroTitle: "Affronta al meglio il colloquio per il lavoro che desideri.",
    description:
      "Trasforma CV e annuncio in storie veritiere, domande realistiche e un piano di esercitazione mirato.",
    primaryCta: "Inizia il colloquio simulato",
    steps: ["Carica il CV", "Aggiungi l’annuncio", "Ricevi il piano", "Esercitati con l’IA"],
  },
  nl: {
    eyebrow: "AI-oefengesprek",
    heroTitle: "Ga vol vertrouwen het gesprek voor je droombaan in.",
    description:
      "Zet je cv en vacature om in eerlijke verhalen, realistische vragen en een gericht oefenplan.",
    primaryCta: "Start mijn oefengesprek",
    steps: ["Upload je cv", "Voeg de vacature toe", "Ontvang je plan", "Oefen met AI"],
  },
  pl: {
    eyebrow: "Próbna rozmowa z AI",
    heroTitle: "Pewnie podejdź do rozmowy o pracę, na której Ci zależy.",
    description:
      "Zamień CV i ofertę pracy w prawdziwe historie, realistyczne pytania i konkretny plan ćwiczeń.",
    primaryCta: "Rozpocznij próbną rozmowę",
    steps: ["Dodaj CV", "Dodaj ofertę", "Odbierz plan", "Ćwicz z AI"],
  },
  tr: {
    eyebrow: "Yapay zekâ ile deneme mülakatı",
    heroTitle: "İstediğiniz işin mülakatına güvenle girin.",
    description:
      "Özgeçmişinizi ve ilanı gerçek hikâyelere, olası sorulara ve odaklı bir çalışma planına dönüştürün.",
    primaryCta: "Deneme mülakatını başlat",
    steps: ["Özgeçmişini yükle", "İlanı ekle", "Planını al", "Yapay zekâ ile çalış"],
  },
  ru: {
    eyebrow: "Пробное собеседование с ИИ",
    heroTitle: "Уверенно пройдите собеседование на желаемую работу.",
    description:
      "Превратите резюме и вакансию в правдивые истории, реалистичные вопросы и понятный план подготовки.",
    primaryCta: "Начать пробное собеседование",
    steps: ["Загрузите резюме", "Добавьте вакансию", "Получите план", "Практикуйтесь с ИИ"],
  },
  uk: {
    eyebrow: "Пробна співбесіда з ШІ",
    heroTitle: "Упевнено пройдіть співбесіду на бажану роботу.",
    description:
      "Перетворіть резюме й вакансію на правдиві історії, реалістичні запитання та чіткий план підготовки.",
    primaryCta: "Почати пробну співбесіду",
    steps: ["Завантажте резюме", "Додайте вакансію", "Отримайте план", "Практикуйтеся з ШІ"],
  },
  ar: {
    eyebrow: "مقابلة تجريبية بالذكاء الاصطناعي",
    heroTitle: "ادخل مقابلة الوظيفة التي تريدها بثقة.",
    description:
      "حوّل سيرتك الذاتية وإعلان الوظيفة إلى قصص صادقة وأسئلة واقعية وخطة تدريب واضحة.",
    primaryCta: "ابدأ المقابلة التجريبية",
    steps: ["ارفع سيرتك الذاتية", "أضف إعلان الوظيفة", "احصل على خطتك", "تدرّب مع الذكاء الاصطناعي"],
  },
  he: {
    eyebrow: "ראיון מדומה עם בינה מלאכותית",
    heroTitle: "הגיעו בביטחון לראיון לתפקיד שאתם רוצים.",
    description:
      "הפכו את קורות החיים ומודעת המשרה לסיפורים אמיתיים, שאלות מציאותיות ותוכנית תרגול ממוקדת.",
    primaryCta: "התחלת ראיון מדומה",
    steps: ["העלאת קורות חיים", "הוספת מודעת המשרה", "קבלת תוכנית", "תרגול עם בינה מלאכותית"],
  },
  hi: {
    eyebrow: "AI मॉक इंटरव्यू",
    heroTitle: "अपनी पसंद की नौकरी के इंटरव्यू में आत्मविश्वास से जाएँ।",
    description:
      "अपने रिज़्यूमे और जॉब पोस्ट से सच्ची कहानियाँ, वास्तविक प्रश्न और केंद्रित अभ्यास योजना बनाएँ।",
    primaryCta: "मॉक इंटरव्यू शुरू करें",
    steps: ["रिज़्यूमे अपलोड करें", "जॉब पोस्ट जोड़ें", "अपनी योजना पाएँ", "AI के साथ अभ्यास करें"],
  },
  bn: {
    eyebrow: "AI মক ইন্টারভিউ",
    heroTitle: "পছন্দের চাকরির ইন্টারভিউ দিন আত্মবিশ্বাসের সঙ্গে।",
    description:
      "রিজিউমে ও চাকরির বিজ্ঞপ্তি থেকে সত্যভিত্তিক গল্প, বাস্তব প্রশ্ন এবং নির্দিষ্ট অনুশীলন পরিকল্পনা তৈরি করুন।",
    primaryCta: "মক ইন্টারভিউ শুরু করুন",
    steps: ["রিজিউমে আপলোড করুন", "চাকরির বিজ্ঞপ্তি যোগ করুন", "পরিকল্পনা নিন", "AI-এর সঙ্গে অনুশীলন করুন"],
  },
  ur: {
    eyebrow: "AI فرضی انٹرویو",
    heroTitle: "اپنی پسند کی ملازمت کے انٹرویو میں اعتماد سے جائیں۔",
    description:
      "اپنے ریزیومے اور ملازمت کے اشتہار سے سچی کہانیاں، حقیقت پسندانہ سوالات اور واضح مشق کا منصوبہ بنائیں۔",
    primaryCta: "فرضی انٹرویو شروع کریں",
    steps: ["ریزیومے اپ لوڈ کریں", "ملازمت کا اشتہار شامل کریں", "منصوبہ حاصل کریں", "AI کے ساتھ مشق کریں"],
  },
  id: {
    eyebrow: "Simulasi wawancara dengan AI",
    heroTitle: "Hadapi wawancara untuk pekerjaan impian dengan percaya diri.",
    description:
      "Ubah CV dan lowongan menjadi cerita yang jujur, pertanyaan realistis, dan rencana latihan terarah.",
    primaryCta: "Mulai simulasi wawancara",
    steps: ["Unggah CV", "Tambahkan lowongan", "Dapatkan rencana", "Berlatih dengan AI"],
  },
  ms: {
    eyebrow: "Temu duga olok-olok dengan AI",
    heroTitle: "Hadapi temu duga kerja idaman dengan yakin.",
    description:
      "Ubah resume dan iklan kerja kepada cerita benar, soalan realistik dan pelan latihan yang terarah.",
    primaryCta: "Mulakan temu duga olok-olok",
    steps: ["Muat naik resume", "Tambah iklan kerja", "Dapatkan pelan", "Berlatih dengan AI"],
  },
  th: {
    eyebrow: "สัมภาษณ์จำลองด้วย AI",
    heroTitle: "เข้าสัมภาษณ์งานที่ต้องการอย่างมั่นใจ",
    description:
      "เปลี่ยนเรซูเม่และประกาศงานเป็นเรื่องเล่าที่ตรงความจริง คำถามที่สมจริง และแผนฝึกที่ชัดเจน",
    primaryCta: "เริ่มสัมภาษณ์จำลอง",
    steps: ["อัปโหลดเรซูเม่", "เพิ่มประกาศงาน", "รับแผนเตรียมตัว", "ฝึกกับ AI"],
  },
  vi: {
    eyebrow: "Phỏng vấn thử với AI",
    heroTitle: "Tự tin bước vào buổi phỏng vấn cho công việc bạn muốn.",
    description:
      "Biến CV và tin tuyển dụng thành câu chuyện trung thực, câu hỏi thực tế và kế hoạch luyện tập rõ ràng.",
    primaryCta: "Bắt đầu phỏng vấn thử",
    steps: ["Tải CV lên", "Thêm tin tuyển dụng", "Nhận kế hoạch", "Luyện tập với AI"],
  },
  fil: {
    eyebrow: "AI mock interview",
    heroTitle: "Harapin nang may kumpiyansa ang interview para sa trabahong gusto mo.",
    description:
      "Gawing tapat na kuwento, makatotohanang tanong, at malinaw na practice plan ang résumé at job post mo.",
    primaryCta: "Simulan ang mock interview",
    steps: ["I-upload ang résumé", "Idagdag ang job post", "Kunin ang plano", "Magpraktis kasama ang AI"],
  },
  sv: {
    eyebrow: "AI-övningsintervju",
    heroTitle: "Gå tryggt in i intervjun för jobbet du vill ha.",
    description:
      "Gör cv och platsannons till sanna berättelser, realistiska frågor och en tydlig övningsplan.",
    primaryCta: "Starta min övningsintervju",
    steps: ["Ladda upp ditt cv", "Lägg till annonsen", "Få din plan", "Öva med AI"],
  },
  no: {
    eyebrow: "AI-prøveintervju",
    heroTitle: "Gå trygt inn i intervjuet for jobben du ønsker.",
    description:
      "Gjør CV-en og stillingsannonsen om til sanne historier, realistiske spørsmål og en tydelig øvingsplan.",
    primaryCta: "Start prøveintervjuet",
    steps: ["Last opp CV-en", "Legg til stillingen", "Få planen din", "Øv med AI"],
  },
  da: {
    eyebrow: "AI-prøveinterview",
    heroTitle: "Gå sikkert ind til samtalen om jobbet, du ønsker.",
    description:
      "Gør CV og jobopslag til sande historier, realistiske spørgsmål og en fokuseret øveplan.",
    primaryCta: "Start prøveinterviewet",
    steps: ["Upload dit CV", "Tilføj jobopslaget", "Få din plan", "Øv med AI"],
  },
  fi: {
    eyebrow: "Tekoälyavusteinen harjoitushaastattelu",
    heroTitle: "Mene luottavaisin mielin haluamasi työn haastatteluun.",
    description:
      "Muuta ansioluettelosi ja työpaikkailmoitus tosipohjaisiksi tarinoiksi, realistisiksi kysymyksiksi ja selkeäksi harjoitussuunnitelmaksi.",
    primaryCta: "Aloita harjoitushaastattelu",
    steps: ["Lataa ansioluettelo", "Lisää työpaikkailmoitus", "Saat suunnitelman", "Harjoittele tekoälyn kanssa"],
  },
  cs: {
    eyebrow: "Cvičný pohovor s AI",
    heroTitle: "Jděte sebejistě na pohovor o práci, kterou chcete.",
    description:
      "Proměňte životopis a inzerát v pravdivé příběhy, realistické otázky a jasný plán přípravy.",
    primaryCta: "Spustit cvičný pohovor",
    steps: ["Nahrajte životopis", "Přidejte inzerát", "Získejte plán", "Trénujte s AI"],
  },
  sk: {
    eyebrow: "Cvičný pohovor s AI",
    heroTitle: "Choďte sebavedomo na pohovor o prácu, ktorú chcete.",
    description:
      "Premeňte životopis a inzerát na pravdivé príbehy, realistické otázky a jasný plán prípravy.",
    primaryCta: "Spustiť cvičný pohovor",
    steps: ["Nahrajte životopis", "Pridajte inzerát", "Získajte plán", "Trénujte s AI"],
  },
  hu: {
    eyebrow: "AI-próbainterjú",
    heroTitle: "Magabiztosan menj el a kívánt állás interjújára.",
    description:
      "Alakítsd az önéletrajzot és az álláshirdetést valós történetekké, életszerű kérdésekké és célzott gyakorlási tervvé.",
    primaryCta: "Próbainterjú indítása",
    steps: ["Önéletrajz feltöltése", "Álláshirdetés hozzáadása", "Terv megtekintése", "Gyakorlás AI-val"],
  },
  ro: {
    eyebrow: "Interviu simulat cu AI",
    heroTitle: "Intră cu încredere la interviul pentru jobul dorit.",
    description:
      "Transformă CV-ul și anunțul în povești adevărate, întrebări realiste și un plan clar de pregătire.",
    primaryCta: "Începe interviul simulat",
    steps: ["Încarcă CV-ul", "Adaugă anunțul", "Primește planul", "Exersează cu AI"],
  },
  el: {
    eyebrow: "Προσομοίωση συνέντευξης με AI",
    heroTitle: "Μπείτε με αυτοπεποίθηση στη συνέντευξη για τη δουλειά που θέλετε.",
    description:
      "Μετατρέψτε το βιογραφικό και την αγγελία σε αληθινές ιστορίες, ρεαλιστικές ερωτήσεις και σαφές πλάνο εξάσκησης.",
    primaryCta: "Έναρξη προσομοίωσης",
    steps: ["Ανεβάστε το βιογραφικό", "Προσθέστε την αγγελία", "Λάβετε το πλάνο", "Εξασκηθείτε με AI"],
  },
  bg: {
    eyebrow: "Пробно интервю с AI",
    heroTitle: "Влезте уверено в интервюто за желаната работа.",
    description:
      "Превърнете автобиографията и обявата в истински истории, реалистични въпроси и ясен план за подготовка.",
    primaryCta: "Започнете пробно интервю",
    steps: ["Качете автобиография", "Добавете обявата", "Получете план", "Упражнявайте се с AI"],
  },
  hr: {
    eyebrow: "Probni intervju uz AI",
    heroTitle: "Samouvjereno pristupite razgovoru za posao koji želite.",
    description:
      "Pretvorite životopis i oglas u istinite priče, realna pitanja i jasan plan vježbanja.",
    primaryCta: "Pokreni probni intervju",
    steps: ["Prenesite životopis", "Dodajte oglas", "Preuzmite plan", "Vježbajte uz AI"],
  },
  sr: {
    eyebrow: "Пробни интервју уз AI",
    heroTitle: "Самоуверено приступите разговору за посао који желите.",
    description:
      "Претворите биографију и оглас у истините приче, реална питања и јасан план вежбања.",
    primaryCta: "Покрени пробни интервју",
    steps: ["Отпремите биографију", "Додајте оглас", "Преузмите план", "Вежбајте уз AI"],
  },
  sl: {
    eyebrow: "Poskusni razgovor z AI",
    heroTitle: "Samozavestno pojdite na razgovor za želeno delo.",
    description:
      "Spremenite življenjepis in oglas v resnične zgodbe, realna vprašanja in jasen načrt vaje.",
    primaryCta: "Začni poskusni razgovor",
    steps: ["Naložite življenjepis", "Dodajte oglas", "Pridobite načrt", "Vadite z AI"],
  },
  sw: {
    eyebrow: "Usaili wa majaribio kwa AI",
    heroTitle: "Ingia kwa kujiamini kwenye usaili wa kazi unayotaka.",
    description:
      "Geuza wasifu na tangazo la kazi kuwa hadithi za kweli, maswali halisi na mpango wazi wa mazoezi.",
    primaryCta: "Anza usaili wa majaribio",
    steps: ["Pakia wasifu", "Ongeza tangazo la kazi", "Pata mpango", "Fanya mazoezi na AI"],
  },
  fa: {
    eyebrow: "مصاحبهٔ آزمایشی با هوش مصنوعی",
    heroTitle: "با اعتمادبه‌نفس وارد مصاحبهٔ شغل دلخواهتان شوید.",
    description:
      "رزومه و آگهی شغلی را به داستان‌های واقعی، پرسش‌های واقع‌بینانه و برنامهٔ تمرین روشن تبدیل کنید.",
    primaryCta: "شروع مصاحبهٔ آزمایشی",
    steps: ["رزومه را بارگذاری کنید", "آگهی را اضافه کنید", "برنامه را دریافت کنید", "با هوش مصنوعی تمرین کنید"],
  },
};

const HOMEPAGE_TRUST: Record<LocaleCode, HomepageCopy["trust"]> = {
  en: ["Every suggestion links back to your evidence", "Private by default", "No invented achievements"],
  ja: ["あなたの根拠に基づく", "初期設定で非公開", "実績を創作しません"],
  ko: ["내 근거에 기반", "기본값은 비공개", "성과를 지어내지 않음"],
  "zh-CN": ["基于你的真实证据", "默认保护隐私", "不编造任何成就"],
  "zh-TW": ["根據你的真實證據", "預設保護隱私", "不捏造任何成就"],
  es: ["Basado en tus evidencias", "Privado por defecto", "Sin logros inventados"],
  fr: ["Fondé sur vos preuves", "Privé par défaut", "Aucun résultat inventé"],
  de: ["Auf deine Nachweise gestützt", "Standardmäßig privat", "Keine erfundenen Erfolge"],
  "pt-BR": ["Baseado nas suas evidências", "Privado por padrão", "Sem conquistas inventadas"],
  it: ["Basato sulle tue prove", "Privato per impostazione predefinita", "Nessun risultato inventato"],
  nl: ["Gebaseerd op jouw bewijs", "Standaard privé", "Geen verzonnen prestaties"],
  pl: ["Oparte na Twoich dowodach", "Domyślnie prywatne", "Bez zmyślonych osiągnięć"],
  tr: ["Kanıtlarınıza dayanır", "Varsayılan olarak gizli", "Uydurma başarı yok"],
  ru: ["Основано на ваших фактах", "По умолчанию приватно", "Без выдуманных достижений"],
  uk: ["На основі ваших фактів", "Типово приватно", "Без вигаданих досягнень"],
  ar: ["مبنية على أدلتك", "خاصة افتراضيًا", "بلا إنجازات مختلقة"],
  he: ["מבוסס על הראיות שלכם", "פרטי כברירת מחדל", "ללא הישגים מומצאים"],
  hi: ["आपके प्रमाण पर आधारित", "डिफ़ॉल्ट रूप से निजी", "कोई गढ़ी हुई उपलब्धि नहीं"],
  bn: ["আপনার প্রমাণের ভিত্তিতে", "ডিফল্টভাবে ব্যক্তিগত", "কোনো বানানো অর্জন নয়"],
  ur: ["آپ کے ثبوت پر مبنی", "پہلے سے نجی", "کوئی من گھڑت کامیابی نہیں"],
  id: ["Berdasarkan bukti Anda", "Privat secara default", "Tanpa pencapaian rekaan"],
  ms: ["Berdasarkan bukti anda", "Peribadi secara lalai", "Tiada pencapaian rekaan"],
  th: ["อ้างอิงจากหลักฐานของคุณ", "เป็นส่วนตัวโดยค่าเริ่มต้น", "ไม่แต่งเติมความสำเร็จ"],
  vi: ["Dựa trên bằng chứng của bạn", "Riêng tư theo mặc định", "Không bịa thành tích"],
  fil: ["Batay sa sarili mong ebidensya", "Pribado bilang default", "Walang gawa-gawang tagumpay"],
  sv: ["Grundat i dina bevis", "Privat som standard", "Inga påhittade prestationer"],
  no: ["Basert på dokumentasjonen din", "Privat som standard", "Ingen oppdiktede resultater"],
  da: ["Bygger på din dokumentation", "Privat som standard", "Ingen opdigtede resultater"],
  fi: ["Perustuu omiin näyttöihisi", "Oletuksena yksityinen", "Ei keksittyjä saavutuksia"],
  cs: ["Vychází z vašich důkazů", "Ve výchozím nastavení soukromé", "Žádné smyšlené úspěchy"],
  sk: ["Vychádza z vašich dôkazov", "Predvolene súkromné", "Žiadne vymyslené úspechy"],
  hu: ["A saját bizonyítékaidra épül", "Alapértelmezetten privát", "Nincs kitalált eredmény"],
  ro: ["Bazat pe dovezile tale", "Privat în mod implicit", "Fără realizări inventate"],
  el: ["Βασίζεται στα στοιχεία σας", "Ιδιωτικό από προεπιλογή", "Χωρίς επινοημένα επιτεύγματα"],
  bg: ["Основано на вашите доказателства", "Поверително по подразбиране", "Без измислени постижения"],
  hr: ["Temeljeno na vašim dokazima", "Privatno prema zadanim postavkama", "Bez izmišljenih postignuća"],
  sr: ["Засновано на вашим доказима", "Подразумевано приватно", "Без измишљених достигнућа"],
  sl: ["Temelji na vaših dokazih", "Privzeto zasebno", "Brez izmišljenih dosežkov"],
  sw: ["Inategemea ushahidi wako", "Faragha kwa chaguo-msingi", "Hakuna mafanikio ya kubuni"],
  fa: ["بر پایهٔ شواهد شما", "به‌طور پیش‌فرض خصوصی", "بدون دستاورد ساختگی"],
};

export function homepageCopyFor(locale: LocaleCode): HomepageCopy {
  return { ...HOMEPAGE_COPY[locale], trust: HOMEPAGE_TRUST[locale] };
}
