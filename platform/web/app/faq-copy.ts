import type { LocaleCode } from "./i18n";
import { accountIntroCopyFor } from "./account-copy.ts";

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  items: FaqItem[];
};

export type OptionalCareerSourceCopy = {
  label: string;
  note: string;
};

const optionalCareerSourceCopy = {
  en: { label: "Optional", note: "Optional: add LinkedIn, GitHub, a portfolio, personal website, public resume, or another career profile for fuller context. Upload an export or paste the relevant content; a URL alone is never treated as proof." },
  ja: { label: "任意", note: "任意で LinkedIn、GitHub、ポートフォリオ、個人サイト、公開履歴書などを追加すると、より詳しい文脈を提供できます。書き出しデータをアップロードするか関連本文を貼り付けてください。URL だけを根拠にはしません。" },
  ko: { label: "선택 사항", note: "선택 사항으로 LinkedIn, GitHub, 포트폴리오, 개인 웹사이트, 공개 이력서 또는 다른 경력 프로필을 추가하면 맥락을 더 정확히 파악할 수 있습니다. 내보낸 파일을 올리거나 관련 내용을 붙여 넣으세요. URL만으로는 근거로 인정하지 않습니다." },
  "zh-CN": { label: "可选", note: "可选：你还可以添加 LinkedIn、GitHub、作品集、个人网站、公开简历或其他职业主页，让分析获得更完整的背景。请上传导出文件或粘贴相关内容；单独一个网址不会被当作证据。" },
  "zh-TW": { label: "選填", note: "選填：你也可以加入 LinkedIn、GitHub、作品集、個人網站、公開履歷或其他職涯頁面，讓分析取得更完整的背景。請上傳匯出檔或貼上相關內容；單獨一個網址不會被視為證據。" },
  es: { label: "Opcional", note: "Opcional: añade LinkedIn, GitHub, un portafolio, sitio personal, CV público u otro perfil profesional para aportar más contexto. Sube una exportación o pega el contenido relevante; una URL por sí sola no cuenta como evidencia." },
  fr: { label: "Facultatif", note: "Facultatif : ajoutez LinkedIn, GitHub, un portfolio, un site personnel, un CV public ou un autre profil professionnel pour enrichir le contexte. Importez un export ou collez le contenu pertinent ; une URL seule ne constitue jamais une preuve." },
  de: { label: "Optional", note: "Optional: Füge LinkedIn, GitHub, Portfolio, persönliche Website, öffentlichen Lebenslauf oder ein anderes Karriereprofil hinzu, um mehr Kontext zu liefern. Lade einen Export hoch oder füge relevante Inhalte ein; eine URL allein gilt nie als Nachweis." },
  "pt-BR": { label: "Opcional", note: "Opcional: adicione LinkedIn, GitHub, portfólio, site pessoal, currículo público ou outro perfil profissional para oferecer mais contexto. Envie uma exportação ou cole o conteúdo relevante; apenas a URL nunca conta como evidência." },
  it: { label: "Facoltativo", note: "Facoltativo: aggiungi LinkedIn, GitHub, portfolio, sito personale, CV pubblico o un altro profilo professionale per fornire più contesto. Carica un'esportazione o incolla il contenuto rilevante; un URL da solo non vale come prova." },
  nl: { label: "Optioneel", note: "Optioneel: voeg LinkedIn, GitHub, een portfolio, persoonlijke website, openbaar cv of ander loopbaanprofiel toe voor meer context. Upload een export of plak de relevante inhoud; alleen een URL geldt nooit als bewijs." },
  pl: { label: "Opcjonalnie", note: "Opcjonalnie: dodaj LinkedIn, GitHub, portfolio, stronę osobistą, publiczne CV lub inny profil zawodowy, aby dostarczyć więcej kontekstu. Prześlij eksport lub wklej odpowiednią treść; sam adres URL nie jest dowodem." },
  tr: { label: "İsteğe bağlı", note: "İsteğe bağlı: daha fazla bağlam için LinkedIn, GitHub, portföy, kişisel site, herkese açık özgeçmiş veya başka bir kariyer profili ekleyin. Dışa aktarılan dosyayı yükleyin ya da ilgili içeriği yapıştırın; yalnızca URL kanıt sayılmaz." },
  ru: { label: "Необязательно", note: "Необязательно: добавьте LinkedIn, GitHub, портфолио, личный сайт, публичное резюме или другой профессиональный профиль для более полного контекста. Загрузите экспорт или вставьте нужный текст; одна ссылка не считается доказательством." },
  uk: { label: "Необов’язково", note: "Необов’язково: додайте LinkedIn, GitHub, портфоліо, особистий сайт, публічне резюме або інший професійний профіль для повнішого контексту. Завантажте експорт або вставте потрібний текст; саме посилання не є доказом." },
  ar: { label: "اختياري", note: "اختياري: أضف LinkedIn أو GitHub أو معرض الأعمال أو موقعك الشخصي أو سيرتك العامة أو ملفًا مهنيًا آخر لتوفير سياق أدق. ارفع ملف تصدير أو الصق المحتوى ذي الصلة؛ الرابط وحده لا يُعامل كدليل." },
  he: { label: "אופציונלי", note: "אופציונלי: הוסיפו LinkedIn, GitHub, תיק עבודות, אתר אישי, קורות חיים ציבוריים או פרופיל מקצועי אחר להקשר מלא יותר. העלו קובץ ייצוא או הדביקו את התוכן הרלוונטי; כתובת URL לבדה אינה נחשבת ראיה." },
  hi: { label: "वैकल्पिक", note: "वैकल्पिक: अधिक संदर्भ के लिए LinkedIn, GitHub, पोर्टफोलियो, निजी वेबसाइट, सार्वजनिक रिज़्यूमे या कोई अन्य करियर प्रोफ़ाइल जोड़ें। एक्सपोर्ट अपलोड करें या संबंधित सामग्री पेस्ट करें; केवल URL को प्रमाण नहीं माना जाता।" },
  bn: { label: "ঐচ্ছিক", note: "ঐচ্ছিক: আরও পূর্ণ প্রেক্ষাপটের জন্য LinkedIn, GitHub, পোর্টফোলিও, ব্যক্তিগত ওয়েবসাইট, প্রকাশ্য জীবনবৃত্তান্ত বা অন্য পেশাগত প্রোফাইল যোগ করুন। এক্সপোর্ট আপলোড করুন বা প্রাসঙ্গিক লেখা পেস্ট করুন; শুধু URL প্রমাণ হিসেবে গণ্য হয় না।" },
  ur: { label: "اختیاری", note: "اختیاری: مزید مکمل پس منظر کے لیے LinkedIn، GitHub، پورٹ فولیو، ذاتی ویب سائٹ، عوامی ریزیومے یا کوئی اور پیشہ ورانہ پروفائل شامل کریں۔ ایکسپورٹ اپ لوڈ کریں یا متعلقہ متن پیسٹ کریں؛ صرف URL کو ثبوت نہیں سمجھا جاتا۔" },
  id: { label: "Opsional", note: "Opsional: tambahkan LinkedIn, GitHub, portofolio, situs pribadi, resume publik, atau profil karier lain untuk konteks yang lebih lengkap. Unggah hasil ekspor atau tempel konten terkait; URL saja tidak dianggap sebagai bukti." },
  ms: { label: "Pilihan", note: "Pilihan: tambah LinkedIn, GitHub, portfolio, laman peribadi, resume awam atau profil kerjaya lain untuk konteks yang lebih lengkap. Muat naik eksport atau tampal kandungan berkaitan; URL sahaja tidak dianggap sebagai bukti." },
  th: { label: "ไม่บังคับ", note: "ไม่บังคับ: เพิ่ม LinkedIn, GitHub, พอร์ตโฟลิโอ เว็บไซต์ส่วนตัว เรซูเม่สาธารณะ หรือโปรไฟล์อาชีพอื่นเพื่อให้มีบริบทครบขึ้น โปรดอัปโหลดไฟล์ส่งออกหรือวางเนื้อหาที่เกี่ยวข้อง URL เพียงอย่างเดียวจะไม่ถือเป็นหลักฐาน" },
  vi: { label: "Không bắt buộc", note: "Không bắt buộc: thêm LinkedIn, GitHub, portfolio, trang cá nhân, CV công khai hoặc hồ sơ nghề nghiệp khác để có thêm ngữ cảnh. Hãy tải bản xuất dữ liệu hoặc dán nội dung liên quan; chỉ một URL sẽ không được xem là bằng chứng." },
  fil: { label: "Opsyonal", note: "Opsyonal: idagdag ang LinkedIn, GitHub, portfolio, personal na website, pampublikong résumé, o ibang career profile para sa mas kumpletong konteksto. Mag-upload ng export o i-paste ang kaugnay na nilalaman; hindi ituturing na ebidensya ang URL lamang." },
  sv: { label: "Valfritt", note: "Valfritt: lägg till LinkedIn, GitHub, portfolio, personlig webbplats, offentligt CV eller annan karriärprofil för mer sammanhang. Ladda upp en export eller klistra in relevant innehåll; en URL i sig räknas aldrig som bevis." },
  no: { label: "Valgfritt", note: "Valgfritt: legg til LinkedIn, GitHub, portefølje, personlig nettsted, offentlig CV eller en annen karriereprofil for mer sammenheng. Last opp en eksport eller lim inn relevant innhold; en URL alene regnes ikke som bevis." },
  da: { label: "Valgfrit", note: "Valgfrit: tilføj LinkedIn, GitHub, portfolio, personlig hjemmeside, offentligt CV eller en anden karriereprofil for mere kontekst. Upload en eksport eller indsæt relevant indhold; en URL alene tæller ikke som dokumentation." },
  fi: { label: "Valinnainen", note: "Valinnainen: lisää LinkedIn, GitHub, portfolio, henkilökohtainen sivusto, julkinen CV tai muu uraprofiili saadaksesi enemmän taustatietoa. Lataa vientitiedosto tai liitä olennainen sisältö; pelkkää URL-osoitetta ei pidetä näyttönä." },
  cs: { label: "Volitelné", note: "Volitelné: přidejte LinkedIn, GitHub, portfolio, osobní web, veřejný životopis nebo jiný profesní profil pro úplnější kontext. Nahrajte export nebo vložte relevantní obsah; samotná URL se nepovažuje za důkaz." },
  sk: { label: "Voliteľné", note: "Voliteľné: pridajte LinkedIn, GitHub, portfólio, osobnú stránku, verejný životopis alebo iný profesijný profil pre úplnejší kontext. Nahrajte export alebo vložte relevantný obsah; samotná URL sa nepovažuje za dôkaz." },
  hu: { label: "Opcionális", note: "Opcionális: adj hozzá LinkedIn-, GitHub-, portfólió-, személyes weboldal-, nyilvános önéletrajz- vagy más karrierprofilt a teljesebb háttérhez. Tölts fel exportot vagy illeszd be a releváns tartalmat; önmagában egy URL nem számít bizonyítéknak." },
  ro: { label: "Opțional", note: "Opțional: adaugă LinkedIn, GitHub, portofoliu, site personal, CV public sau alt profil profesional pentru mai mult context. Încarcă un export sau lipește conținutul relevant; un URL singur nu este considerat dovadă." },
  el: { label: "Προαιρετικό", note: "Προαιρετικά: προσθέστε LinkedIn, GitHub, portfolio, προσωπική ιστοσελίδα, δημόσιο βιογραφικό ή άλλο επαγγελματικό προφίλ για πληρέστερο πλαίσιο. Ανεβάστε εξαγωγή ή επικολλήστε το σχετικό περιεχόμενο· ένα URL μόνο του δεν θεωρείται απόδειξη." },
  bg: { label: "По избор", note: "По избор: добавете LinkedIn, GitHub, портфолио, личен сайт, публична автобиография или друг професионален профил за повече контекст. Качете експортиран файл или поставете съответното съдържание; самият URL не се счита за доказателство." },
  hr: { label: "Neobavezno", note: "Neobavezno: dodajte LinkedIn, GitHub, portfolio, osobnu stranicu, javni životopis ili drugi profesionalni profil za potpuniji kontekst. Učitajte izvoz ili zalijepite relevantan sadržaj; sama URL adresa ne smatra se dokazom." },
  sr: { label: "Опционо", note: "Опционо: додајте LinkedIn, GitHub, портфолио, лични сајт, јавни резиме или други професионални профил за потпунији контекст. Отпремите извоз или налепите релевантан садржај; сама URL адреса се не сматра доказом." },
  sl: { label: "Izbirno", note: "Izbirno: dodajte LinkedIn, GitHub, portfelj, osebno spletno stran, javni življenjepis ali drug karierni profil za popolnejši kontekst. Naložite izvoz ali prilepite ustrezno vsebino; sam URL se ne šteje kot dokaz." },
  sw: { label: "Hiari", note: "Hiari: ongeza LinkedIn, GitHub, jalada la kazi, tovuti binafsi, wasifu wa umma au profaili nyingine ya taaluma kwa muktadha kamili zaidi. Pakia faili iliyohamishwa au bandika maudhui husika; URL pekee haitahesabiwa kuwa ushahidi." },
  fa: { label: "اختیاری", note: "اختیاری: برای زمینه کامل‌تر LinkedIn، GitHub، نمونه‌کار، وب‌سایت شخصی، رزومه عمومی یا نمایه شغلی دیگری اضافه کنید. فایل خروجی را بارگذاری کنید یا محتوای مرتبط را بچسبانید؛ نشانی URL به‌تنهایی مدرک محسوب نمی‌شود." },
} satisfies Record<LocaleCode, OptionalCareerSourceCopy>;

const speechPrivacyFaqCopy = {
  en: {
    question: "What is sent when I use Read question aloud?",
    answer: "When cloud read-aloud is configured, only the current question text and selected language are sent to Microsoft Azure Speech. This feature does not send your resume, job description, answer, transcript, or raw voice recording, and InterviewThread does not save the returned audio. If cloud speech is unavailable, it falls back to the browser or device voice.",
  },
  ja: {
    question: "「質問を読み上げる」を使うと、何が送信されますか？",
    answer: "クラウド読み上げが設定されている場合、現在の質問文と選択した言語だけが Microsoft Azure Speech に送信されます。履歴書、求人票、回答、文字起こし、元の音声は送信されず、返された音声を InterviewThread が保存することもありません。クラウド音声が利用できない場合は、ブラウザまたは端末の音声に切り替わります。",
  },
  ko: {
    question: "질문 읽어주기를 사용하면 어떤 정보가 전송되나요?",
    answer: "클라우드 읽어주기가 설정된 경우 현재 질문 텍스트와 선택한 언어만 Microsoft Azure Speech로 전송됩니다. 이 기능은 이력서, 채용 공고, 답변, 전사 내용 또는 원본 음성을 보내지 않으며 InterviewThread는 반환된 오디오를 저장하지 않습니다. 클라우드 음성을 사용할 수 없으면 브라우저 또는 기기 음성으로 전환됩니다.",
  },
  "zh-CN": {
    question: "使用“朗读问题”时会发送哪些资料？",
    answer: "配置云端朗读后，只会把当前问题文字和所选语言发送给 Microsoft Azure Speech。此功能不会发送你的简历、职位描述、回答、逐字稿或原始录音，InterviewThread 也不会保存返回的音频。若云端语音不可用，系统会改用浏览器或设备语音。",
  },
  "zh-TW": {
    question: "使用「朗讀問題」時會傳送哪些資料？",
    answer: "雲端朗讀已設定時，只有目前的問題文字與所選語言會傳送至 Microsoft Azure Speech。此功能不會傳送你的履歷、職缺描述、答案、逐字稿或原始錄音，InterviewThread 也不會保存回傳的音訊。若雲端語音無法使用，系統會改用瀏覽器或裝置語音。",
  },
  es: {
    question: "¿Qué se envía cuando uso Leer pregunta en voz alta?",
    answer: "Cuando la lectura en la nube está configurada, solo se envían a Microsoft Azure Speech el texto de la pregunta actual y el idioma elegido. Esta función no envía tu currículum, oferta, respuesta, transcripción ni grabación de voz, e InterviewThread no guarda el audio devuelto. Si la voz en la nube no está disponible, se usa la voz del navegador o del dispositivo.",
  },
  fr: {
    question: "Qu’est-ce qui est envoyé quand j’utilise Lire la question à voix haute ?",
    answer: "Lorsque la lecture cloud est configurée, seuls le texte de la question actuelle et la langue choisie sont envoyés à Microsoft Azure Speech. Cette fonction n’envoie ni votre CV, ni l’offre, ni votre réponse, ni la transcription, ni l’enregistrement vocal, et InterviewThread ne conserve pas l’audio renvoyé. Si la voix cloud est indisponible, la voix du navigateur ou de l’appareil prend le relais.",
  },
  de: {
    question: "Was wird bei „Frage vorlesen“ gesendet?",
    answer: "Wenn Cloud-Vorlesen eingerichtet ist, werden nur der aktuelle Fragetext und die gewählte Sprache an Microsoft Azure Speech gesendet. Lebenslauf, Stellenanzeige, Antwort, Transkript oder Sprachaufnahme werden dabei nicht gesendet, und InterviewThread speichert das zurückgegebene Audio nicht. Ist Cloud-Sprache nicht verfügbar, wird die Stimme des Browsers oder Geräts verwendet.",
  },
  "pt-BR": {
    question: "O que é enviado ao usar Ler pergunta em voz alta?",
    answer: "Quando a leitura em nuvem está configurada, somente o texto da pergunta atual e o idioma selecionado são enviados ao Microsoft Azure Speech. O recurso não envia currículo, vaga, resposta, transcrição nem gravação de voz, e o InterviewThread não salva o áudio retornado. Se a voz em nuvem não estiver disponível, ele usa a voz do navegador ou do dispositivo.",
  },
  it: {
    question: "Cosa viene inviato quando uso Leggi la domanda ad alta voce?",
    answer: "Quando la lettura cloud è configurata, a Microsoft Azure Speech vengono inviati solo il testo della domanda corrente e la lingua scelta. La funzione non invia CV, annuncio, risposta, trascrizione o registrazione vocale, e InterviewThread non salva l’audio restituito. Se la voce cloud non è disponibile, usa la voce del browser o del dispositivo.",
  },
  nl: {
    question: "Wat wordt verzonden als ik Vraag voorlezen gebruik?",
    answer: "Als voorlezen via de cloud is ingesteld, worden alleen de huidige vraagtekst en de gekozen taal naar Microsoft Azure Speech gestuurd. Je cv, vacature, antwoord, transcript of stemopname worden niet meegestuurd en InterviewThread slaat de ontvangen audio niet op. Als cloudspraak niet beschikbaar is, wordt de stem van de browser of het apparaat gebruikt.",
  },
  pl: {
    question: "Co jest wysyłane, gdy używam opcji Czytaj pytanie na głos?",
    answer: "Gdy skonfigurowano odczyt w chmurze, do Microsoft Azure Speech trafiają tylko tekst bieżącego pytania i wybrany język. Funkcja nie wysyła CV, ogłoszenia, odpowiedzi, transkrypcji ani nagrania głosu, a InterviewThread nie zapisuje zwróconego dźwięku. Jeśli usługa chmurowa jest niedostępna, używany jest głos przeglądarki lub urządzenia.",
  },
  tr: {
    question: "Soruyu sesli oku seçeneğinde hangi bilgiler gönderilir?",
    answer: "Bulut üzerinden sesli okuma yapılandırıldığında Microsoft Azure Speech’e yalnızca geçerli soru metni ve seçilen dil gönderilir. Özgeçmişiniz, iş ilanı, yanıt, döküm veya ham ses kaydı gönderilmez; InterviewThread dönen sesi kaydetmez. Bulut sesi kullanılamazsa tarayıcı ya da cihaz sesi kullanılır.",
  },
  ru: {
    question: "Какие данные отправляются при озвучивании вопроса?",
    answer: "Если настроено облачное озвучивание, в Microsoft Azure Speech отправляются только текст текущего вопроса и выбранный язык. Резюме, вакансия, ответ, расшифровка и исходная запись голоса не отправляются, а InterviewThread не сохраняет полученное аудио. Если облачная речь недоступна, используется голос браузера или устройства.",
  },
  uk: {
    question: "Які дані надсилаються під час озвучення запитання?",
    answer: "Якщо налаштовано хмарне озвучення, до Microsoft Azure Speech надсилаються лише текст поточного запитання та вибрана мова. Резюме, вакансія, відповідь, розшифрування й оригінальний запис голосу не надсилаються, а InterviewThread не зберігає отримане аудіо. Якщо хмарне мовлення недоступне, використовується голос браузера або пристрою.",
  },
  ar: {
    question: "ما البيانات التي تُرسل عند استخدام قراءة السؤال بصوت عالٍ؟",
    answer: "عند إعداد القراءة السحابية، يُرسل إلى Microsoft Azure Speech نص السؤال الحالي واللغة المحددة فقط. لا ترسل هذه الميزة سيرتك الذاتية أو إعلان الوظيفة أو إجابتك أو النص المفرغ أو التسجيل الصوتي الأصلي، ولا يحفظ InterviewThread الصوت الناتج. إذا تعذر الصوت السحابي، يُستخدم صوت المتصفح أو الجهاز.",
  },
  he: {
    question: "אילו נתונים נשלחים כשמשתמשים בהקראת השאלה?",
    answer: "כאשר הקראה בענן מוגדרת, רק טקסט השאלה הנוכחית והשפה שנבחרה נשלחים אל Microsoft Azure Speech. קורות החיים, מודעת התפקיד, התשובה, התמלול והקלטת הקול המקורית אינם נשלחים, ו‑InterviewThread אינו שומר את האודיו שמוחזר. אם שירות הענן אינו זמין, נעשה שימוש בקול של הדפדפן או המכשיר.",
  },
  hi: {
    question: "प्रश्न को ज़ोर से पढ़ें इस्तेमाल करने पर क्या भेजा जाता है?",
    answer: "क्लाउड रीड-अलाउड सेट होने पर केवल मौजूदा प्रश्न का टेक्स्ट और चुनी हुई भाषा Microsoft Azure Speech को भेजी जाती है। आपका रिज़्यूमे, नौकरी विवरण, उत्तर, ट्रांसक्रिप्ट या मूल वॉइस रिकॉर्डिंग नहीं भेजी जाती और InterviewThread लौटे हुए ऑडियो को सहेजता नहीं है। क्लाउड वॉइस उपलब्ध न होने पर ब्राउज़र या डिवाइस की आवाज़ इस्तेमाल होती है।",
  },
  bn: {
    question: "প্রশ্নটি জোরে পড়ুন ব্যবহার করলে কী পাঠানো হয়?",
    answer: "ক্লাউড রিড-অ্যালাউড সেট করা থাকলে শুধু বর্তমান প্রশ্নের লেখা ও নির্বাচিত ভাষা Microsoft Azure Speech-এ পাঠানো হয়। আপনার জীবনবৃত্তান্ত, চাকরির বিবরণ, উত্তর, ট্রান্সক্রিপ্ট বা মূল ভয়েস রেকর্ডিং পাঠানো হয় না এবং InterviewThread ফেরত আসা অডিও সংরক্ষণ করে না। ক্লাউড ভয়েস না থাকলে ব্রাউজার বা ডিভাইসের ভয়েস ব্যবহার করা হয়।",
  },
  ur: {
    question: "سوال بلند آواز سے پڑھنے پر کون سی معلومات بھیجی جاتی ہیں؟",
    answer: "کلاؤڈ ریڈ الاؤڈ ترتیب دیا گیا ہو تو صرف موجودہ سوال کا متن اور منتخب زبان Microsoft Azure Speech کو بھیجی جاتی ہے۔ آپ کا ریزیومے، ملازمت کی تفصیل، جواب، ٹرانسکرپٹ یا اصل آواز کی ریکارڈنگ نہیں بھیجی جاتی اور InterviewThread واپس آنے والی آڈیو محفوظ نہیں کرتا۔ کلاؤڈ آواز دستیاب نہ ہو تو براؤزر یا ڈیوائس کی آواز استعمال ہوتی ہے۔",
  },
  id: {
    question: "Data apa yang dikirim saat memakai Bacakan pertanyaan?",
    answer: "Jika pembacaan cloud dikonfigurasi, hanya teks pertanyaan saat ini dan bahasa pilihan yang dikirim ke Microsoft Azure Speech. Fitur ini tidak mengirim resume, lowongan, jawaban, transkrip, atau rekaman suara asli Anda, dan InterviewThread tidak menyimpan audio yang dikembalikan. Jika suara cloud tidak tersedia, suara browser atau perangkat akan digunakan.",
  },
  ms: {
    question: "Apakah data yang dihantar apabila menggunakan Baca soalan dengan kuat?",
    answer: "Apabila bacaan awan dikonfigurasi, hanya teks soalan semasa dan bahasa pilihan dihantar kepada Microsoft Azure Speech. Ciri ini tidak menghantar resume, iklan kerja, jawapan, transkrip atau rakaman suara asal anda, dan InterviewThread tidak menyimpan audio yang diterima. Jika suara awan tidak tersedia, suara pelayar atau peranti digunakan.",
  },
  th: {
    question: "เมื่อใช้การอ่านคำถามออกเสียง จะส่งข้อมูลอะไรบ้าง?",
    answer: "เมื่อกำหนดค่าการอ่านผ่านคลาวด์แล้ว ระบบจะส่งเฉพาะข้อความคำถามปัจจุบันและภาษาที่เลือกไปยัง Microsoft Azure Speech ฟีเจอร์นี้จะไม่ส่งเรซูเม่ รายละเอียดงาน คำตอบ ข้อความถอดเสียง หรือไฟล์เสียงต้นฉบับ และ InterviewThread จะไม่บันทึกเสียงที่ส่งกลับมา หากเสียงบนคลาวด์ใช้ไม่ได้ ระบบจะใช้เสียงของเบราว์เซอร์หรืออุปกรณ์แทน",
  },
  vi: {
    question: "Dữ liệu nào được gửi khi tôi dùng Đọc câu hỏi thành tiếng?",
    answer: "Khi tính năng đọc trên đám mây được cấu hình, chỉ nội dung câu hỏi hiện tại và ngôn ngữ đã chọn được gửi tới Microsoft Azure Speech. Tính năng này không gửi CV, tin tuyển dụng, câu trả lời, bản chép lời hay bản ghi âm gốc, và InterviewThread không lưu âm thanh trả về. Nếu giọng nói đám mây không khả dụng, hệ thống dùng giọng của trình duyệt hoặc thiết bị.",
  },
  fil: {
    question: "Anong data ang ipinapadala kapag ginamit ko ang Basahin nang malakas ang tanong?",
    answer: "Kapag naka-configure ang cloud read-aloud, ang kasalukuyang tanong at napiling wika lamang ang ipinapadala sa Microsoft Azure Speech. Hindi ipinapadala ang résumé, job post, sagot, transcript, o orihinal na voice recording, at hindi sine-save ng InterviewThread ang ibinalik na audio. Kung hindi available ang cloud voice, boses ng browser o device ang gagamitin.",
  },
  sv: {
    question: "Vad skickas när jag använder Läs frågan högt?",
    answer: "När molnbaserad uppläsning är konfigurerad skickas endast den aktuella frågetexten och valt språk till Microsoft Azure Speech. Ditt CV, jobbannonsen, svaret, transkriberingen eller den ursprungliga röstinspelningen skickas inte, och InterviewThread sparar inte ljudet som returneras. Om molnrösten inte är tillgänglig används webbläsarens eller enhetens röst.",
  },
  no: {
    question: "Hva sendes når jeg bruker Les spørsmålet høyt?",
    answer: "Når skybasert opplesning er konfigurert, sendes bare teksten i det gjeldende spørsmålet og valgt språk til Microsoft Azure Speech. CV-en, stillingsannonsen, svaret, transkripsjonen eller det opprinnelige taleopptaket sendes ikke, og InterviewThread lagrer ikke lyden som returneres. Hvis skytalen ikke er tilgjengelig, brukes stemmen i nettleseren eller enheten.",
  },
  da: {
    question: "Hvad sendes, når jeg bruger Læs spørgsmålet højt?",
    answer: "Når cloudoplæsning er konfigureret, sendes kun den aktuelle spørgsmålstekst og det valgte sprog til Microsoft Azure Speech. Dit CV, jobopslaget, svaret, transskriptionen eller den oprindelige stemmeoptagelse sendes ikke, og InterviewThread gemmer ikke den returnerede lyd. Hvis cloudstemmen ikke er tilgængelig, bruges browserens eller enhedens stemme.",
  },
  fi: {
    question: "Mitä tietoja lähetetään, kun käytän Lue kysymys ääneen -toimintoa?",
    answer: "Kun pilviluenta on määritetty, Microsoft Azure Speechille lähetetään vain nykyisen kysymyksen teksti ja valittu kieli. Ansioluetteloa, työpaikkailmoitusta, vastausta, litterointia tai alkuperäistä äänitallennetta ei lähetetä, eikä InterviewThread tallenna palautettua ääntä. Jos pilvipuhe ei ole käytettävissä, käytetään selaimen tai laitteen ääntä.",
  },
  cs: {
    question: "Co se odesílá při použití funkce Přečíst otázku nahlas?",
    answer: "Když je nastaveno cloudové čtení, do Microsoft Azure Speech se odešle jen text aktuální otázky a zvolený jazyk. Životopis, nabídka práce, odpověď, přepis ani původní hlasová nahrávka se neodesílají a InterviewThread vrácený zvuk neukládá. Pokud cloudový hlas není dostupný, použije se hlas prohlížeče nebo zařízení.",
  },
  sk: {
    question: "Čo sa odosiela pri použití funkcie Prečítať otázku nahlas?",
    answer: "Keď je nastavené cloudové čítanie, do Microsoft Azure Speech sa odošle iba text aktuálnej otázky a zvolený jazyk. Životopis, pracovná ponuka, odpoveď, prepis ani pôvodná hlasová nahrávka sa neodosielajú a InterviewThread vrátený zvuk neukladá. Ak cloudový hlas nie je dostupný, použije sa hlas prehliadača alebo zariadenia.",
  },
  hu: {
    question: "Milyen adat kerül elküldésre a Kérdés felolvasása használatakor?",
    answer: "Ha a felhőalapú felolvasás be van állítva, csak az aktuális kérdés szövege és a kiválasztott nyelv kerül a Microsoft Azure Speech szolgáltatáshoz. Az önéletrajz, az álláshirdetés, a válasz, az átirat és az eredeti hangfelvétel nem kerül elküldésre, az InterviewThread pedig nem menti a visszakapott hangot. Ha a felhőhang nem érhető el, a böngésző vagy az eszköz hangja használatos.",
  },
  ro: {
    question: "Ce date sunt trimise când folosesc Citește întrebarea cu voce tare?",
    answer: "Când citirea din cloud este configurată, doar textul întrebării curente și limba selectată sunt trimise către Microsoft Azure Speech. Funcția nu trimite CV-ul, anunțul, răspunsul, transcrierea sau înregistrarea vocală originală, iar InterviewThread nu salvează sunetul primit. Dacă vocea din cloud nu este disponibilă, este folosită vocea browserului sau a dispozitivului.",
  },
  el: {
    question: "Ποια δεδομένα αποστέλλονται όταν χρησιμοποιώ την εκφώνηση ερώτησης;",
    answer: "Όταν έχει ρυθμιστεί η εκφώνηση μέσω cloud, αποστέλλονται στο Microsoft Azure Speech μόνο το κείμενο της τρέχουσας ερώτησης και η επιλεγμένη γλώσσα. Δεν αποστέλλονται το βιογραφικό, η αγγελία, η απάντηση, η απομαγνητοφώνηση ή η αρχική εγγραφή φωνής και το InterviewThread δεν αποθηκεύει τον ήχο που επιστρέφεται. Αν η φωνή cloud δεν είναι διαθέσιμη, χρησιμοποιείται η φωνή του προγράμματος περιήγησης ή της συσκευής.",
  },
  bg: {
    question: "Какви данни се изпращат при прочитане на въпроса на глас?",
    answer: "Когато е настроено облачно прочитане, към Microsoft Azure Speech се изпращат само текстът на текущия въпрос и избраният език. Автобиографията, обявата, отговорът, транскрипцията и оригиналният гласов запис не се изпращат, а InterviewThread не съхранява получения звук. Ако облачният глас не е наличен, се използва гласът на браузъра или устройството.",
  },
  hr: {
    question: "Koji se podaci šalju pri korištenju opcije Pročitaj pitanje naglas?",
    answer: "Kada je postavljeno čitanje u oblaku, u Microsoft Azure Speech šalju se samo tekst trenutačnog pitanja i odabrani jezik. Životopis, oglas, odgovor, transkript i izvorna glasovna snimka ne šalju se, a InterviewThread ne sprema vraćeni zvuk. Ako glas u oblaku nije dostupan, koristi se glas preglednika ili uređaja.",
  },
  sr: {
    question: "Који подаци се шаљу при коришћењу опције Прочитај питање наглас?",
    answer: "Када је подешено читање у облаку, у Microsoft Azure Speech шаљу се само текст тренутног питања и изабрани језик. Биографија, оглас, одговор, транскрипт и изворни гласовни снимак се не шаљу, а InterviewThread не чува враћени звук. Ако глас у облаку није доступан, користи се глас прегледача или уређаја.",
  },
  sl: {
    question: "Kateri podatki se pošljejo pri uporabi možnosti Preberi vprašanje na glas?",
    answer: "Ko je nastavljeno branje v oblaku, se v Microsoft Azure Speech pošljeta samo besedilo trenutnega vprašanja in izbrani jezik. Življenjepis, oglas, odgovor, prepis in izvirni glasovni posnetek se ne pošljejo, InterviewThread pa prejetega zvoka ne shrani. Če glas v oblaku ni na voljo, se uporabi glas brskalnika ali naprave.",
  },
  sw: {
    question: "Ni data gani hutumwa ninapotumia Soma swali kwa sauti?",
    answer: "Usomaji wa wingu ukiwa umewekwa, maandishi ya swali la sasa na lugha iliyochaguliwa pekee hutumwa kwa Microsoft Azure Speech. Wasifu, tangazo la kazi, jibu, nakala ya mazungumzo au rekodi asili ya sauti haitumwi, na InterviewThread haihifadhi sauti inayorudishwa. Sauti ya wingu isipatikane, sauti ya kivinjari au kifaa hutumika.",
  },
  fa: {
    question: "هنگام استفاده از خواندن سؤال با صدای بلند چه داده‌ای ارسال می‌شود؟",
    answer: "وقتی خواندن ابری تنظیم شده باشد، فقط متن سؤال فعلی و زبان انتخاب‌شده به Microsoft Azure Speech فرستاده می‌شود. رزومه، آگهی شغل، پاسخ، متن پیاده‌شده یا فایل اصلی صدا ارسال نمی‌شود و InterviewThread صدای بازگشتی را ذخیره نمی‌کند. اگر صدای ابری در دسترس نباشد، صدای مرورگر یا دستگاه استفاده می‌شود.",
  },
} satisfies Record<LocaleCode, FaqItem>;

const voiceAnswerPrivacyFaqCopy = {
  en: {
    question: "What is sent when I answer by voice?",
    answer: "Live draft captions use your browser or device. For signed-in users, when cloud correction is available, the recorded answer audio, selected language, and up to 80 short vocabulary hints from the role, resume, and job description are sent temporarily to Microsoft Azure Speech for a final transcript. InterviewThread does not store or log the raw audio, returns the result with private no-store instructions, and lets you edit the text before submitting. Guest mode stays browser-only. If cloud correction fails, your device transcript remains in the answer box.",
  },
  ja: {
    question: "音声で回答すると、何が送信されますか？",
    answer: "入力中の下書き字幕にはブラウザまたは端末の音声認識を使います。ログイン中でクラウド補正が利用できる場合は、回答音声、選択言語、職種・履歴書・求人票から抽出した最大80個の短い語彙ヒントを、一時的に Microsoft Azure Speech へ送って最終文字起こしを作成します。InterviewThread は元の音声を保存・記録せず、結果には非公開・保存禁止の指示を付け、送信前に文字を編集できます。ゲストモードはブラウザ内だけで動作し、クラウド補正に失敗しても端末の文字起こしは回答欄に残ります。",
  },
  ko: {
    question: "음성으로 답변하면 어떤 정보가 전송되나요?",
    answer: "말하는 동안의 초안 자막은 브라우저 또는 기기 음성 인식을 사용합니다. 로그인한 상태에서 클라우드 보정이 가능하면 답변 녹음, 선택한 언어, 직무·이력서·채용 공고에서 가져온 짧은 어휘 힌트 최대 80개를 최종 전사를 위해 Microsoft Azure Speech에 일시적으로 보냅니다. InterviewThread는 원본 오디오를 저장하거나 로그에 남기지 않으며 결과를 비공개·저장 금지로 반환하고 제출 전에 텍스트를 수정할 수 있게 합니다. 게스트 모드는 브라우저에서만 작동하며, 클라우드 보정에 실패해도 기기 전사는 답변 상자에 남습니다.",
  },
  "zh-CN": {
    question: "使用语音作答时会发送哪些资料？",
    answer: "说话时的即时草稿字幕由浏览器或设备识别。已登录且云端校正可用时，回答录音、所选语言，以及从职位、简历和职位描述中提取的最多 80 个简短词汇提示，会临时发送给 Microsoft Azure Speech 生成最终逐字稿。InterviewThread 不保存或记录原始音频，响应采用私密、禁止缓存设置，你可在提交前编辑文字。访客模式只使用浏览器；若云端校正失败，设备逐字稿仍会保留在回答框中。",
  },
  "zh-TW": {
    question: "使用語音作答時會傳送哪些資料？",
    answer: "說話時的即時草稿字幕由瀏覽器或裝置辨識。已登入且雲端校正可用時，回答錄音、所選語言，以及從職務、履歷與職缺描述擷取的最多 80 個簡短詞彙提示，會暫時傳送至 Microsoft Azure Speech 產生最終逐字稿。InterviewThread 不保存或記錄原始音訊，回應採私密且不得快取的設定，你可在送出前編輯文字。訪客模式只使用瀏覽器；若雲端校正失敗，裝置逐字稿仍會保留在回答欄。",
  },
  es: {
    question: "¿Qué se envía cuando respondo por voz?",
    answer: "Los subtítulos provisionales en directo usan el navegador o el dispositivo. Si has iniciado sesión y la corrección en la nube está disponible, el audio de tu respuesta, el idioma elegido y hasta 80 pistas breves de vocabulario del puesto, el CV y la descripción se envían temporalmente a Microsoft Azure Speech para obtener la transcripción final. InterviewThread no guarda ni registra el audio original; devuelve el resultado como privado y sin almacenamiento, y puedes editarlo antes de enviarlo. El modo invitado funciona solo en el navegador. Si falla la corrección, se conserva la transcripción del dispositivo.",
  },
  fr: {
    question: "Qu’est-ce qui est envoyé lorsque je réponds à l’oral ?",
    answer: "Les sous-titres provisoires en direct utilisent le navigateur ou l’appareil. Si vous êtes connecté et que la correction cloud est disponible, l’audio de votre réponse, la langue choisie et jusqu’à 80 courts indices de vocabulaire issus du poste, du CV et de l’offre sont envoyés temporairement à Microsoft Azure Speech pour produire la transcription finale. InterviewThread ne conserve ni ne journalise l’audio brut, renvoie le résultat en mode privé sans stockage et vous laisse corriger le texte avant envoi. Le mode invité reste uniquement dans le navigateur. En cas d’échec, la transcription de l’appareil est conservée.",
  },
  de: {
    question: "Welche Daten werden bei einer Sprachantwort gesendet?",
    answer: "Die vorläufigen Live-Untertitel verwenden den Browser oder das Gerät. Wenn Sie angemeldet sind und die Cloud-Korrektur verfügbar ist, werden die Antwortaufnahme, die gewählte Sprache und bis zu 80 kurze Vokabelhinweise aus Rolle, Lebenslauf und Stellenbeschreibung vorübergehend an Microsoft Azure Speech gesendet, um das endgültige Transkript zu erstellen. InterviewThread speichert oder protokolliert das Roh-Audio nicht, liefert das Ergebnis privat und ohne Speicherung zurück und lässt Sie den Text vor dem Senden bearbeiten. Im Gastmodus bleibt alles im Browser. Bei einem Cloud-Fehler bleibt das Geräte-Transkript erhalten.",
  },
  "pt-BR": {
    question: "O que é enviado quando respondo por voz?",
    answer: "As legendas provisórias ao vivo usam o navegador ou o dispositivo. Para usuários conectados, quando a correção na nuvem está disponível, o áudio da resposta, o idioma escolhido e até 80 dicas curtas de vocabulário da função, do currículo e da vaga são enviados temporariamente ao Microsoft Azure Speech para gerar a transcrição final. O InterviewThread não salva nem registra o áudio bruto, retorna o resultado de forma privada e sem armazenamento e permite editar o texto antes do envio. O modo visitante usa apenas o navegador. Se a correção falhar, a transcrição do dispositivo permanece.",
  },
  it: {
    question: "Cosa viene inviato quando rispondo a voce?",
    answer: "I sottotitoli provvisori in tempo reale usano il browser o il dispositivo. Se hai effettuato l’accesso e la correzione cloud è disponibile, l’audio della risposta, la lingua scelta e fino a 80 brevi suggerimenti di vocabolario ricavati da ruolo, CV e annuncio vengono inviati temporaneamente a Microsoft Azure Speech per creare la trascrizione finale. InterviewThread non salva né registra l’audio originale, restituisce il risultato in modalità privata senza memorizzazione e consente di modificare il testo prima dell’invio. La modalità ospite resta nel browser. Se la correzione fallisce, la trascrizione del dispositivo rimane.",
  },
  nl: {
    question: "Wat wordt verzonden wanneer ik met mijn stem antwoord?",
    answer: "Voorlopige live-ondertiteling gebruikt je browser of apparaat. Als je bent ingelogd en cloudcorrectie beschikbaar is, worden de opname van je antwoord, de gekozen taal en maximaal 80 korte woordenschat-hints uit de rol, het cv en de vacature tijdelijk naar Microsoft Azure Speech gestuurd voor het definitieve transcript. InterviewThread bewaart of logt de ruwe audio niet, retourneert het resultaat privé en zonder opslag en laat je de tekst voor verzending bewerken. Gastmodus blijft in de browser. Als cloudcorrectie mislukt, blijft het apparaattranscript staan.",
  },
  pl: {
    question: "Co jest wysyłane, gdy odpowiadam głosowo?",
    answer: "Wstępne napisy na żywo korzystają z przeglądarki lub urządzenia. Gdy użytkownik jest zalogowany i korekta w chmurze jest dostępna, nagranie odpowiedzi, wybrany język i maksymalnie 80 krótkich podpowiedzi słownikowych z roli, CV i ogłoszenia są tymczasowo wysyłane do Microsoft Azure Speech w celu utworzenia końcowej transkrypcji. InterviewThread nie zapisuje ani nie rejestruje surowego dźwięku, zwraca wynik prywatnie bez zapisu i pozwala edytować tekst przed wysłaniem. Tryb gościa działa tylko w przeglądarce. W razie błędu transkrypcja urządzenia pozostaje.",
  },
  tr: {
    question: "Sesli yanıt verdiğimde hangi bilgiler gönderilir?",
    answer: "Canlı taslak altyazılar tarayıcıyı veya cihazı kullanır. Oturum açtıysanız ve bulut düzeltmesi kullanılabiliyorsa yanıt kaydı, seçilen dil ve rol, özgeçmiş ile iş ilanından alınan en fazla 80 kısa terim ipucu son döküm için geçici olarak Microsoft Azure Speech’e gönderilir. InterviewThread ham sesi saklamaz veya günlüğe kaydetmez; sonucu özel ve kaydedilemez olarak döndürür ve göndermeden önce metni düzenlemenize izin verir. Misafir modu yalnızca tarayıcıda çalışır. Bulut düzeltmesi başarısız olursa cihaz dökümü korunur.",
  },
  ru: {
    question: "Какие данные отправляются при голосовом ответе?",
    answer: "Черновые субтитры в реальном времени создаются браузером или устройством. Для вошедших пользователей, когда доступна облачная коррекция, запись ответа, выбранный язык и до 80 коротких словарных подсказок из роли, резюме и вакансии временно отправляются в Microsoft Azure Speech для итоговой расшифровки. InterviewThread не хранит и не журналирует исходное аудио, возвращает результат конфиденциально без сохранения и позволяет исправить текст до отправки. Гостевой режим работает только в браузере. При сбое облака расшифровка устройства сохраняется.",
  },
  uk: {
    question: "Які дані надсилаються, коли я відповідаю голосом?",
    answer: "Чернеткові субтитри наживо створює браузер або пристрій. Для користувачів, які ввійшли, коли доступне хмарне виправлення, запис відповіді, вибрана мова й до 80 коротких словникових підказок із ролі, резюме та вакансії тимчасово надсилаються до Microsoft Azure Speech для остаточної транскрипції. InterviewThread не зберігає й не журналює сире аудіо, повертає результат приватно без збереження та дає відредагувати текст. Гостьовий режим працює лише в браузері. У разі збою транскрипція пристрою лишається.",
  },
  ar: {
    question: "ما البيانات التي تُرسل عندما أجيب بالصوت؟",
    answer: "تستخدم المسودة الفورية للنص المتصفح أو الجهاز. للمستخدم المسجّل، وعند توفر التصحيح السحابي، يُرسل تسجيل الإجابة واللغة المختارة وما يصل إلى 80 تلميحًا قصيرًا للمصطلحات من الدور والسيرة والوصف الوظيفي مؤقتًا إلى Microsoft Azure Speech لإنتاج النص النهائي. لا يخزّن InterviewThread الصوت الخام ولا يسجّله في السجلات، ويعيد النتيجة بصورة خاصة ومن دون تخزين، ويمكنك تعديل النص قبل إرساله. وضع الضيف يعمل في المتصفح فقط، وإذا فشل التصحيح يبقى نص الجهاز محفوظًا.",
  },
  he: {
    question: "אילו נתונים נשלחים כשאני עונה בקול?",
    answer: "כתוביות הטיוטה בזמן אמת משתמשות בדפדפן או במכשיר. למשתמשים מחוברים, כאשר תיקון בענן זמין, הקלטת התשובה, השפה שנבחרה ועד 80 רמזי מונחים קצרים מהתפקיד, מקורות החיים ומתיאור המשרה נשלחים זמנית ל‑Microsoft Azure Speech ליצירת התמלול הסופי. InterviewThread אינו שומר או רושם את האודיו הגולמי, מחזיר את התוצאה באופן פרטי וללא אחסון ומאפשר לערוך את הטקסט לפני השליחה. מצב אורח נשאר בדפדפן בלבד. אם התיקון נכשל, תמלול המכשיר נשמר.",
  },
  hi: {
    question: "आवाज़ से उत्तर देने पर क्या भेजा जाता है?",
    answer: "बोलते समय शुरुआती कैप्शन आपके ब्राउज़र या डिवाइस से बनते हैं। साइन इन होने और क्लाउड सुधार उपलब्ध होने पर उत्तर का ऑडियो, चुनी हुई भाषा और भूमिका, रिज़्यूमे व नौकरी विवरण से अधिकतम 80 छोटे शब्द-संकेत अंतिम ट्रांसक्रिप्ट के लिए अस्थायी रूप से Microsoft Azure Speech को भेजे जाते हैं। InterviewThread मूल ऑडियो को सहेजता या लॉग नहीं करता, परिणाम को निजी और नो-स्टोर रूप में लौटाता है और भेजने से पहले टेक्स्ट बदलने देता है। गेस्ट मोड केवल ब्राउज़र पर रहता है। क्लाउड विफल होने पर डिवाइस ट्रांसक्रिप्ट सुरक्षित रहता है।",
  },
  bn: {
    question: "ভয়েসে উত্তর দিলে কী পাঠানো হয়?",
    answer: "কথা বলার সময় প্রাথমিক ক্যাপশন ব্রাউজার বা ডিভাইস তৈরি করে। সাইন ইন করা থাকলে এবং ক্লাউড সংশোধন পাওয়া গেলে, উত্তরটির অডিও, নির্বাচিত ভাষা এবং ভূমিকা, জীবনবৃত্তান্ত ও চাকরির বিবরণ থেকে সর্বোচ্চ ৮০টি ছোট শব্দ-ইঙ্গিত চূড়ান্ত ট্রান্সক্রিপ্টের জন্য সাময়িকভাবে Microsoft Azure Speech-এ পাঠানো হয়। InterviewThread কাঁচা অডিও সংরক্ষণ বা লগ করে না, ফল ব্যক্তিগত ও নো-স্টোর হিসেবে ফেরত দেয় এবং পাঠানোর আগে লেখা সম্পাদনা করা যায়। অতিথি মোড শুধু ব্রাউজারে কাজ করে। ক্লাউড ব্যর্থ হলেও ডিভাইসের লেখা থেকে যায়।",
  },
  ur: {
    question: "آواز سے جواب دینے پر کیا معلومات بھیجی جاتی ہیں؟",
    answer: "بولتے وقت ابتدائی کیپشن براؤزر یا ڈیوائس بناتا ہے۔ سائن ان ہونے اور کلاؤڈ درستگی دستیاب ہونے پر جواب کی آڈیو، منتخب زبان اور کردار، ریزیومے اور ملازمت کی تفصیل سے زیادہ سے زیادہ 80 مختصر اصطلاحی اشارے حتمی ٹرانسکرپٹ کے لیے عارضی طور پر Microsoft Azure Speech کو بھیجے جاتے ہیں۔ InterviewThread خام آڈیو محفوظ یا لاگ نہیں کرتا، نتیجہ نجی اور نو اسٹور طور پر واپس کرتا ہے اور بھیجنے سے پہلے متن میں ترمیم کی جا سکتی ہے۔ گیسٹ موڈ صرف براؤزر میں رہتا ہے۔ کلاؤڈ ناکام ہو تو ڈیوائس کا ٹرانسکرپٹ برقرار رہتا ہے۔",
  },
  id: {
    question: "Data apa yang dikirim saat saya menjawab dengan suara?",
    answer: "Teks sementara secara langsung menggunakan browser atau perangkat. Untuk pengguna yang masuk, saat koreksi cloud tersedia, audio jawaban, bahasa pilihan, dan hingga 80 petunjuk kosakata singkat dari peran, resume, dan lowongan dikirim sementara ke Microsoft Azure Speech untuk transkrip akhir. InterviewThread tidak menyimpan atau mencatat audio mentah, mengembalikan hasil secara privat tanpa penyimpanan, dan memungkinkan Anda mengedit teks sebelum dikirim. Mode tamu hanya menggunakan browser. Jika koreksi cloud gagal, transkrip perangkat tetap tersedia.",
  },
  ms: {
    question: "Apakah data yang dihantar apabila saya menjawab dengan suara?",
    answer: "Sari kata draf secara langsung menggunakan pelayar atau peranti. Bagi pengguna yang telah log masuk, apabila pembetulan awan tersedia, audio jawapan, bahasa pilihan dan sehingga 80 petunjuk istilah ringkas daripada peranan, resume dan iklan kerja dihantar sementara kepada Microsoft Azure Speech untuk transkrip akhir. InterviewThread tidak menyimpan atau merekod audio mentah, mengembalikan hasil secara peribadi tanpa storan dan membolehkan anda menyunting teks sebelum dihantar. Mod tetamu hanya menggunakan pelayar. Jika pembetulan gagal, transkrip peranti dikekalkan.",
  },
  th: {
    question: "เมื่อฉันตอบด้วยเสียง ระบบจะส่งข้อมูลอะไรบ้าง?",
    answer: "คำบรรยายฉบับร่างแบบสดใช้การรู้จำของเบราว์เซอร์หรืออุปกรณ์ สำหรับผู้ใช้ที่ลงชื่อเข้าใช้ เมื่อใช้การแก้ไขผ่านคลาวด์ได้ ระบบจะส่งเสียงคำตอบ ภาษาที่เลือก และคำใบ้ศัพท์สั้น ๆ สูงสุด 80 รายการจากบทบาท เรซูเม่ และรายละเอียดงานไปยัง Microsoft Azure Speech ชั่วคราวเพื่อสร้างข้อความถอดเสียงฉบับสุดท้าย InterviewThread ไม่บันทึกหรือเก็บล็อกเสียงดิบ ส่งผลลัพธ์กลับแบบส่วนตัวและห้ามแคช และให้คุณแก้ไขข้อความก่อนส่ง โหมดผู้เยี่ยมชมใช้เฉพาะเบราว์เซอร์ หากคลาวด์ล้มเหลว ข้อความจากอุปกรณ์จะยังอยู่",
  },
  vi: {
    question: "Dữ liệu nào được gửi khi tôi trả lời bằng giọng nói?",
    answer: "Phụ đề nháp trực tiếp dùng trình duyệt hoặc thiết bị. Với người dùng đã đăng nhập, khi hiệu chỉnh trên đám mây khả dụng, âm thanh câu trả lời, ngôn ngữ đã chọn và tối đa 80 gợi ý thuật ngữ ngắn từ vai trò, CV và tin tuyển dụng được gửi tạm thời tới Microsoft Azure Speech để tạo bản chép lời cuối. InterviewThread không lưu hay ghi nhật ký âm thanh gốc, trả kết quả ở chế độ riêng tư không lưu trữ và cho phép sửa văn bản trước khi gửi. Chế độ khách chỉ dùng trình duyệt. Nếu hiệu chỉnh thất bại, bản chép lời của thiết bị vẫn được giữ lại.",
  },
  fil: {
    question: "Anong data ang ipinapadala kapag sumasagot ako gamit ang boses?",
    answer: "Ginagamit ng live draft captions ang browser o device. Para sa naka-sign in na user, kapag available ang cloud correction, pansamantalang ipinapadala sa Microsoft Azure Speech ang audio ng sagot, napiling wika, at hanggang 80 maiikling vocabulary hint mula sa role, résumé, at job post para sa final transcript. Hindi sine-save o nilo-log ng InterviewThread ang raw audio, pribado at no-store ang tugon, at maaari mong i-edit ang text bago isumite. Browser-only ang guest mode. Kapag pumalya ang cloud correction, mananatili ang transcript ng device.",
  },
  sv: {
    question: "Vad skickas när jag svarar med rösten?",
    answer: "Preliminära livetexter använder webbläsaren eller enheten. För inloggade användare skickas, när molnkorrigering finns, svarsljudet, valt språk och upp till 80 korta ordledtrådar från rollen, CV:t och jobbannonsen tillfälligt till Microsoft Azure Speech för den slutliga transkriberingen. InterviewThread sparar eller loggar inte råljudet, returnerar resultatet privat utan lagring och låter dig redigera texten före inlämning. Gästläget stannar i webbläsaren. Om korrigeringen misslyckas behålls enhetens transkript.",
  },
  no: {
    question: "Hva sendes når jeg svarer med stemmen?",
    answer: "Foreløpige direktetekster bruker nettleseren eller enheten. For innloggede brukere sendes, når skykorrigering er tilgjengelig, lydopptaket av svaret, valgt språk og opptil 80 korte ordtips fra rollen, CV-en og stillingsannonsen midlertidig til Microsoft Azure Speech for den endelige transkripsjonen. InterviewThread lagrer eller logger ikke rålyden, returnerer resultatet privat uten lagring og lar deg redigere teksten før innsending. Gjeste­modus bruker bare nettleseren. Hvis korrigeringen mislykkes, beholdes enhetens transkripsjon.",
  },
  da: {
    question: "Hvad sendes, når jeg svarer med stemmen?",
    answer: "Foreløbige live-undertekster bruger browseren eller enheden. For brugere, der er logget ind, sendes svarlyden, det valgte sprog og op til 80 korte ordtips fra rollen, CV’et og jobopslaget midlertidigt til Microsoft Azure Speech for den endelige transskription, når cloudkorrektion er tilgængelig. InterviewThread gemmer eller logger ikke rå lyd, returnerer resultatet privat uden lagring og lader dig redigere teksten før indsendelse. Gæstetilstand bruger kun browseren. Hvis korrektionen fejler, bevares enhedens transskription.",
  },
  fi: {
    question: "Mitä tietoja lähetetään, kun vastaan puheella?",
    answer: "Alustavat live-tekstitykset käyttävät selainta tai laitetta. Kun kirjautuneelle käyttäjälle on saatavilla pilvikorjaus, vastauksen ääni, valittu kieli ja enintään 80 lyhyttä sanastovihjettä roolista, ansioluettelosta ja työpaikkailmoituksesta lähetetään tilapäisesti Microsoft Azure Speechille lopullista litterointia varten. InterviewThread ei tallenna tai lokita raakaa ääntä, palauttaa tuloksen yksityisesti ilman tallennusta ja antaa muokata tekstiä ennen lähettämistä. Vierastila toimii vain selaimessa. Jos korjaus epäonnistuu, laitteen litterointi säilyy.",
  },
  cs: {
    question: "Co se odesílá, když odpovídám hlasem?",
    answer: "Průběžný pracovní přepis používá prohlížeč nebo zařízení. U přihlášených uživatelů se při dostupné cloudové opravě do Microsoft Azure Speech dočasně odešle zvuk odpovědi, zvolený jazyk a až 80 krátkých slovníkových nápověd z role, životopisu a nabídky práce pro vytvoření konečného přepisu. InterviewThread surový zvuk neukládá ani nezapisuje do protokolů, výsledek vrací soukromě bez ukládání a umožní text upravit. Režim hosta zůstává v prohlížeči. Při selhání zůstane přepis zařízení zachován.",
  },
  sk: {
    question: "Čo sa odosiela, keď odpovedám hlasom?",
    answer: "Priebežný pracovný prepis používa prehliadač alebo zariadenie. Prihláseným používateľom sa pri dostupnej cloudovej oprave do Microsoft Azure Speech dočasne odošle zvuk odpovede, zvolený jazyk a najviac 80 krátkych slovníkových pomôcok z roly, životopisu a pracovnej ponuky na vytvorenie konečného prepisu. InterviewThread surový zvuk neukladá ani nezapisuje do protokolov, výsledok vracia súkromne bez uloženia a umožní text upraviť. Režim hosťa zostáva v prehliadači. Pri zlyhaní zostane prepis zariadenia zachovaný.",
  },
  hu: {
    question: "Milyen adat kerül elküldésre, amikor hanggal válaszolok?",
    answer: "Az élő piszkozatfeliratok a böngészőt vagy az eszközt használják. Bejelentkezett felhasználóknál, ha elérhető a felhős javítás, a válasz hangja, a kiválasztott nyelv, valamint a szerepkörből, önéletrajzból és álláshirdetésből származó legfeljebb 80 rövid szókincssegéd ideiglenesen a Microsoft Azure Speechhez kerül a végleges átirathoz. Az InterviewThread nem tárolja és nem naplózza a nyers hangot, az eredményt privát, nem tárolható válaszként adja vissza, és beküldés előtt szerkeszthető. A vendég mód csak a böngészőt használja. Hiba esetén az eszköz átirata megmarad.",
  },
  ro: {
    question: "Ce date sunt trimise când răspund vocal?",
    answer: "Subtitrările provizorii în direct folosesc browserul sau dispozitivul. Pentru utilizatorii autentificați, când corectarea în cloud este disponibilă, sunetul răspunsului, limba aleasă și până la 80 de indicii scurte de vocabular din rol, CV și anunț sunt trimise temporar către Microsoft Azure Speech pentru transcrierea finală. InterviewThread nu stochează și nu înregistrează în jurnale sunetul brut, returnează rezultatul privat fără stocare și permite editarea textului înainte de trimitere. Modul vizitator rămâne în browser. Dacă corectarea eșuează, transcrierea dispozitivului se păstrează.",
  },
  el: {
    question: "Ποια δεδομένα αποστέλλονται όταν απαντώ με φωνή;",
    answer: "Οι προσωρινοί ζωντανοί υπότιτλοι χρησιμοποιούν το πρόγραμμα περιήγησης ή τη συσκευή. Για συνδεδεμένους χρήστες, όταν είναι διαθέσιμη η διόρθωση cloud, ο ήχος της απάντησης, η επιλεγμένη γλώσσα και έως 80 σύντομες υποδείξεις όρων από τον ρόλο, το βιογραφικό και την αγγελία αποστέλλονται προσωρινά στο Microsoft Azure Speech για την τελική απομαγνητοφώνηση. Το InterviewThread δεν αποθηκεύει ούτε καταγράφει τον αρχικό ήχο, επιστρέφει το αποτέλεσμα ιδιωτικά χωρίς αποθήκευση και επιτρέπει επεξεργασία πριν την υποβολή. Η λειτουργία επισκέπτη μένει στον browser. Σε αποτυχία διατηρείται η απομαγνητοφώνηση της συσκευής.",
  },
  bg: {
    question: "Какви данни се изпращат, когато отговарям с глас?",
    answer: "Предварителните субтитри на живо използват браузъра или устройството. За влезли потребители, когато е налична облачна корекция, звукът на отговора, избраният език и до 80 кратки терминологични подсказки от ролята, автобиографията и обявата временно се изпращат към Microsoft Azure Speech за окончателния препис. InterviewThread не съхранява и не записва в дневници необработения звук, връща резултата частно без съхранение и позволява редакция преди изпращане. Гост режимът остава в браузъра. При неуспех преписът на устройството се запазва.",
  },
  hr: {
    question: "Koji se podaci šalju kada odgovaram glasom?",
    answer: "Privremeni titlovi uživo koriste preglednik ili uređaj. Za prijavljene korisnike, kada je dostupno ispravljanje u oblaku, zvuk odgovora, odabrani jezik i do 80 kratkih pojmovnih smjernica iz uloge, životopisa i oglasa privremeno se šalju u Microsoft Azure Speech radi konačnog prijepisa. InterviewThread ne sprema ni ne bilježi izvorni zvuk, rezultat vraća privatno bez pohrane i omogućuje uređivanje prije slanja. Gostujući način ostaje u pregledniku. Ako ispravak ne uspije, prijepis uređaja ostaje.",
  },
  sr: {
    question: "Који подаци се шаљу када одговарам гласом?",
    answer: "Привремени титлови уживо користе прегледач или уређај. За пријављене кориснике, када је доступна исправка у облаку, звук одговора, изабрани језик и до 80 кратких појмовних смерница из улоге, биографије и огласа привремено се шаљу у Microsoft Azure Speech ради коначног преписа. InterviewThread не чува нити бележи изворни звук, резултат враћа приватно без складиштења и омогућава уређивање пре слања. Гост режим остаје у прегледачу. Ако исправка не успе, препис уређаја остаје.",
  },
  sl: {
    question: "Kateri podatki se pošljejo, ko odgovorim z glasom?",
    answer: "Začasni podnapisi v živo uporabljajo brskalnik ali napravo. Pri prijavljenih uporabnikih se, ko je na voljo popravek v oblaku, zvok odgovora, izbrani jezik in do 80 kratkih izraznih namigov iz vloge, življenjepisa in oglasa začasno pošljejo v Microsoft Azure Speech za končni prepis. InterviewThread surovega zvoka ne shrani ali beleži, rezultat vrne zasebno brez shranjevanja in omogoča urejanje pred oddajo. Gostujoči način ostane v brskalniku. Če popravek ne uspe, prepis naprave ostane.",
  },
  sw: {
    question: "Ni data gani hutumwa ninapojibu kwa sauti?",
    answer: "Manukuu ya rasimu ya moja kwa moja hutumia kivinjari au kifaa. Kwa mtumiaji aliyeingia, urekebishaji wa wingu ukiwepo, sauti ya jibu, lugha iliyochaguliwa na hadi vidokezo 80 vifupi vya msamiati kutoka nafasi, wasifu na tangazo la kazi hutumwa kwa muda kwa Microsoft Azure Speech ili kutengeneza nakala ya mwisho. InterviewThread haihifadhi wala kuweka kumbukumbu ya sauti ghafi, hurudisha matokeo kwa faragha bila kuhifadhi na hukuruhusu kuhariri kabla ya kutuma. Hali ya mgeni hutumia kivinjari pekee. Urekebishaji ukishindwa, nakala ya kifaa hubaki.",
  },
  fa: {
    question: "هنگام پاسخ صوتی چه داده‌ای ارسال می‌شود؟",
    answer: "زیرنویس پیش‌نویس زنده از مرورگر یا دستگاه استفاده می‌کند. برای کاربر واردشده، اگر اصلاح ابری در دسترس باشد، صدای پاسخ، زبان انتخابی و حداکثر ۸۰ راهنمای کوتاه واژگان از نقش، رزومه و آگهی شغلی به‌طور موقت برای متن نهایی به Microsoft Azure Speech فرستاده می‌شود. InterviewThread صدای خام را ذخیره یا ثبت نمی‌کند، نتیجه را خصوصی و بدون ذخیره برمی‌گرداند و امکان ویرایش متن پیش از ارسال را می‌دهد. حالت مهمان فقط در مرورگر است. اگر اصلاح ابری ناموفق باشد، متن دستگاه باقی می‌ماند.",
  },
} satisfies Record<LocaleCode, FaqItem>;

// The fourth FAQ answer is injected by faqCopyFor from the single localized
// account-access policy, so account requirements cannot drift across surfaces.
const faqCopy = {
  en: {
    eyebrow: "Frequently asked questions",
    title: "Simple answers before you start.",
    intro: "What you need, what InterviewThread does, and what always stays under your control.",
    items: [
      { question: "Will InterviewThread invent achievements for me?", answer: "No. Every suggestion must trace back to evidence you provide. Missing proof stays visible as a real gap." },
      { question: "What do I need to get started?", answer: "One real resume and one real job description are enough. Adding your interview date or application stage makes the preparation plan more useful." },
      { question: "Is the match result an ATS score?", answer: "No. It maps each important requirement to strong, partial, or missing evidence instead of claiming one universal ATS score." },
{ question: "Do I need an account?", answer: "" },
      { question: "Which documents can I import, and are they private?", answer: "Common PDF, DOCX, PPTX, XLSX, text, and OpenDocument files are parsed in your browser by default. Scans or legacy files may need OCR or conversion first." },
      { question: "Does InterviewThread apply to jobs automatically?", answer: "No. The public open-source version never submits an application for you. You review and control every action." },
      { question: "Can I use it worldwide and in my language?", answer: "The interface supports 40 languages and worldwide filters. Live job and market coverage depends on approved sources available for each region." },
    ],
  },
  ja: {
    eyebrow: "よくある質問",
    title: "プルーフパックを作る前に、疑問を解消しましょう。",
    intro: "InterviewThread が現在できること、利用者が管理できること、現在の制限を明確に説明します。",
    items: [
      { question: "InterviewThread は実績を作り上げますか？", answer: "いいえ。すべての提案は、あなたが提供した根拠に結び付きます。根拠がない部分は実際のギャップとして表示されます。" },
      { question: "始めるには何が必要ですか？", answer: "実際の履歴書と求人票が1つずつあれば始められます。面接日や応募段階を加えると、準備計画がさらに役立ちます。" },
      { question: "マッチ結果は ATS スコアですか？", answer: "いいえ。単一の万能スコアではなく、重要な要件ごとに根拠が強い、一部ある、ないを示します。" },
      { question: "アカウントは必要ですか？", answer: "" },
      { question: "どの書類を読み込めますか？プライバシーは守られますか？", answer: "一般的な PDF、DOCX、PPTX、XLSX、テキスト、OpenDocument は通常ブラウザ内で解析されます。スキャンや古い形式は OCR または変換が必要な場合があります。" },
      { question: "求人へ自動応募しますか？", answer: "いいえ。公開オープンソース版が代理で応募を送信することはありません。すべての操作をあなたが確認して管理します。" },
      { question: "世界中で自分の言語を使えますか？", answer: "画面は40言語と世界各地の絞り込みに対応しています。求人と市場データの範囲は、地域ごとに利用可能な承認済みデータ源によります。" },
    ],
  },
  ko: {
    eyebrow: "자주 묻는 질문",
    title: "증거 팩을 만들기 전에 궁금증을 해결하세요.",
    intro: "InterviewThread이 현재 제공하는 기능, 사용자가 통제하는 부분, 현재의 한계를 명확히 설명합니다.",
    items: [
      { question: "InterviewThread이 제 성과를 지어내나요?", answer: "아니요. 모든 제안은 사용자가 제공한 근거로 이어져야 합니다. 근거가 없으면 실제 공백으로 표시됩니다." },
      { question: "시작하려면 무엇이 필요한가요?", answer: "실제 이력서 한 부와 실제 JD 한 개면 충분합니다. 면접일이나 지원 단계를 추가하면 준비 계획이 더 유용해집니다." },
      { question: "매칭 결과가 ATS 점수인가요?", answer: "아니요. 하나의 보편적 점수를 주장하지 않고, 중요 요건별로 근거가 강함·부분적·없음을 보여 줍니다." },
      { question: "계정이 필요한가요?", answer: "" },
      { question: "어떤 문서를 가져올 수 있고 비공개인가요?", answer: "일반적인 PDF, DOCX, PPTX, XLSX, 텍스트, OpenDocument 파일은 기본적으로 브라우저에서 처리됩니다. 스캔본이나 구형 파일은 OCR 또는 변환이 필요할 수 있습니다." },
      { question: "채용 공고에 자동 지원하나요?", answer: "아니요. 공개 오픈 소스 버전은 지원서를 대신 제출하지 않습니다. 모든 작업은 사용자가 검토하고 통제합니다." },
      { question: "전 세계에서 제 언어로 사용할 수 있나요?", answer: "인터페이스는 40개 언어와 전 세계 필터를 지원합니다. 실시간 채용 및 시장 범위는 지역별 승인 데이터 소스에 따라 달라집니다." },
    ],
  },
  "zh-CN": {
    eyebrow: "常见问题",
    title: "建立面试证据包之前，先把问题弄清楚。",
    intro: "说明 InterviewThread 目前能做什么、哪些操作由你控制，以及现阶段的限制。",
    items: [
      { question: "InterviewThread 会替我编造成就吗？", answer: "不会。每项建议都必须能追溯到你提供的证据；缺少证据的部分会保留为真实缺口。" },
      { question: "开始使用需要准备什么？", answer: "一份真实简历和一份真实 JD 就够了。加入面试日期或申请阶段，会让准备计划更有帮助。" },
      { question: "匹配结果就是 ATS 分数吗？", answer: "不是。它不会声称存在通用 ATS 分数，而是逐项显示重要要求的证据是充分、部分还是缺失。" },
      { question: "一定要注册账户吗？", answer: "" },
      { question: "可以导入哪些文件？资料是否私密？", answer: "常见 PDF、DOCX、PPTX、XLSX、文本和 OpenDocument 文件默认在浏览器中解析。扫描件或旧格式可能需要先做 OCR 或转换。" },
      { question: "InterviewThread 会自动投递职位吗？", answer: "不会。公开开源版本不会替你提交申请；每一步都由你审核和控制。" },
      { question: "可以在全球使用并切换语言吗？", answer: "界面支持40种语言和全球地区筛选。实时职位与市场覆盖取决于各地区可用的核准数据源。" },
    ],
  },
  "zh-TW": {
    eyebrow: "常見問題",
    title: "建立面試證據包之前，先把疑問說清楚。",
    intro: "說明 InterviewThread 現在能做什麼、哪些操作由你掌控，以及目前的限制。",
    items: [
      { question: "InterviewThread 會替我捏造經歷或成就嗎？", answer: "不會。每一項建議都必須能追溯到你提供的證據；缺少證據的部分會保留為真實缺口。" },
      { question: "開始使用需要準備什麼？", answer: "一份真實履歷與一份真實 JD 就足夠。加入面試日期或申請階段，會讓準備計畫更實用。" },
      { question: "匹配結果就是 ATS 分數嗎？", answer: "不是。它不會宣稱存在通用 ATS 分數，而是逐項顯示重要要求的證據是充分、部分或缺少。" },
      { question: "一定要註冊帳號嗎？", answer: "" },
      { question: "可以匯入哪些檔案？資料是否私密？", answer: "常見 PDF、DOCX、PPTX、XLSX、文字與 OpenDocument 檔案預設在瀏覽器內解析。掃描檔或舊格式可能要先做 OCR 或轉換。" },
      { question: "InterviewThread 會自動投遞職缺嗎？", answer: "不會。公開開源版本不會替你送出申請；每一步都由你審核與控制。" },
      { question: "可以在全球使用並切換語言嗎？", answer: "介面支援40種語言與全球地區篩選。即時職缺及市場涵蓋範圍取決於各地可用的核准資料源。" },
    ],
  },
  es: {
    eyebrow: "Preguntas frecuentes",
    title: "Respuestas claras antes de crear tu paquete de evidencias.",
    intro: "Qué hace InterviewThread hoy, qué controlas tú y cuáles son los límites actuales.",
    items: [
      { question: "¿InterviewThread inventará logros por mí?", answer: "No. Cada sugerencia debe vincularse con pruebas que tú aportes. Lo que no tenga respaldo seguirá visible como una brecha real." },
      { question: "¿Qué necesito para empezar?", answer: "Basta con un currículum real y una oferta real. Añadir la fecha de entrevista o la etapa de candidatura mejora el plan de preparación." },
      { question: "¿El resultado es una puntuación ATS?", answer: "No. En lugar de prometer una puntuación ATS universal, muestra si cada requisito importante tiene pruebas sólidas, parciales o inexistentes." },
      { question: "¿Necesito una cuenta?", answer: "" },
      { question: "¿Qué documentos puedo importar y son privados?", answer: "Los archivos PDF, DOCX, PPTX, XLSX, texto y OpenDocument habituales se procesan por defecto en tu navegador. Los escaneos o formatos antiguos pueden necesitar OCR o conversión." },
      { question: "¿InterviewThread solicita empleos automáticamente?", answer: "No. La versión pública y abierta nunca envía una candidatura por ti. Tú revisas y controlas cada acción." },
      { question: "¿Puedo usarlo en todo el mundo y en mi idioma?", answer: "La interfaz admite 40 idiomas y filtros globales. La cobertura de empleos y mercado depende de las fuentes aprobadas disponibles en cada región." },
    ],
  },
  fr: {
    eyebrow: "Questions fréquentes",
    title: "Des réponses claires avant de créer votre dossier de preuves.",
    intro: "Ce que InterviewThread fait aujourd’hui, ce que vous contrôlez et les limites actuelles.",
    items: [
      { question: "InterviewThread invente-t-il des réalisations ?", answer: "Non. Chaque suggestion doit renvoyer aux preuves que vous fournissez. Une preuve absente reste visible comme une véritable lacune." },
      { question: "De quoi ai-je besoin pour commencer ?", answer: "Un vrai CV et une vraie offre suffisent. La date d’entretien ou l’étape de candidature rend le plan de préparation plus utile." },
      { question: "Le résultat correspond-il à un score ATS ?", answer: "Non. Il indique, exigence par exigence, si la preuve est forte, partielle ou absente au lieu de prétendre fournir un score ATS universel." },
      { question: "Ai-je besoin d’un compte ?", answer: "" },
      { question: "Quels documents puis-je importer et sont-ils privés ?", answer: "Les fichiers PDF, DOCX, PPTX, XLSX, texte et OpenDocument courants sont traités par défaut dans votre navigateur. Les scans ou anciens formats peuvent nécessiter un OCR ou une conversion." },
      { question: "InterviewThread postule-t-il automatiquement ?", answer: "Non. La version publique open source n’envoie jamais de candidature à votre place. Vous contrôlez chaque action." },
      { question: "Puis-je l’utiliser partout et dans ma langue ?", answer: "L’interface prend en charge 40 langues et des filtres mondiaux. La couverture en direct dépend des sources approuvées disponibles dans chaque région." },
    ],
  },
  de: {
    eyebrow: "Häufige Fragen",
    title: "Klare Antworten, bevor du dein Nachweispaket erstellst.",
    intro: "Was InterviewThread heute kann, was du kontrollierst und wo die aktuellen Grenzen liegen.",
    items: [
      { question: "Erfindet InterviewThread Erfolge für mich?", answer: "Nein. Jeder Vorschlag muss auf deinen Nachweisen beruhen. Fehlende Belege bleiben als echte Lücke sichtbar." },
      { question: "Was brauche ich zum Start?", answer: "Ein echter Lebenslauf und eine echte Stellenbeschreibung reichen aus. Interviewdatum oder Bewerbungsphase verbessern den Vorbereitungsplan." },
      { question: "Ist das Ergebnis ein ATS-Score?", answer: "Nein. Statt eines angeblich universellen ATS-Scores zeigt es pro wichtiger Anforderung starke, teilweise oder fehlende Nachweise." },
      { question: "Brauche ich ein Konto?", answer: "" },
      { question: "Welche Dokumente kann ich importieren und sind sie privat?", answer: "Übliche PDF-, DOCX-, PPTX-, XLSX-, Text- und OpenDocument-Dateien werden standardmäßig im Browser verarbeitet. Scans oder alte Formate benötigen eventuell OCR oder Konvertierung." },
      { question: "Bewirbt sich InterviewThread automatisch?", answer: "Nein. Die öffentliche Open-Source-Version sendet niemals Bewerbungen für dich ab. Du prüfst und steuerst jede Aktion." },
      { question: "Kann ich es weltweit und in meiner Sprache nutzen?", answer: "Die Oberfläche unterstützt 40 Sprachen und weltweite Filter. Live-Stellen und Marktabdeckung hängen von regional verfügbaren, genehmigten Quellen ab." },
    ],
  },
  "pt-BR": {
    eyebrow: "Perguntas frequentes",
    title: "Respostas claras antes de criar seu pacote de evidências.",
    intro: "O que o InterviewThread faz hoje, o que fica sob seu controle e quais são os limites atuais.",
    items: [
      { question: "O InterviewThread inventa conquistas para mim?", answer: "Não. Toda sugestão precisa apontar para evidências fornecidas por você. O que não tiver comprovação continua visível como lacuna real." },
      { question: "Do que preciso para começar?", answer: "Um currículo real e uma descrição de vaga real são suficientes. A data da entrevista ou a etapa da candidatura melhora o plano de preparação." },
      { question: "O resultado é uma pontuação de ATS?", answer: "Não. Em vez de prometer uma pontuação universal, ele mostra evidência forte, parcial ou ausente para cada requisito importante." },
      { question: "Preciso de uma conta?", answer: "" },
      { question: "Quais documentos posso importar e eles são privados?", answer: "PDF, DOCX, PPTX, XLSX, texto e OpenDocument comuns são processados no navegador por padrão. Digitalizações ou formatos antigos podem exigir OCR ou conversão." },
      { question: "O InterviewThread se candidata automaticamente?", answer: "Não. A versão pública de código aberto nunca envia uma candidatura por você. Você revisa e controla cada ação." },
      { question: "Posso usar no mundo todo e no meu idioma?", answer: "A interface oferece 40 idiomas e filtros globais. A cobertura ao vivo depende das fontes aprovadas disponíveis em cada região." },
    ],
  },
  it: {
    eyebrow: "Domande frequenti",
    title: "Risposte chiare prima di creare il tuo pacchetto di prove.",
    intro: "Cosa fa oggi InterviewThread, cosa controlli tu e quali sono i limiti attuali.",
    items: [
      { question: "InterviewThread inventa risultati per me?", answer: "No. Ogni suggerimento deve risalire alle prove che fornisci. Ciò che non è dimostrato resta visibile come una lacuna reale." },
      { question: "Di cosa ho bisogno per iniziare?", answer: "Bastano un curriculum reale e una descrizione di lavoro reale. Data del colloquio o fase della candidatura migliorano il piano." },
      { question: "Il risultato è un punteggio ATS?", answer: "No. Mostra prove forti, parziali o mancanti per ogni requisito importante, senza promettere un punteggio ATS universale." },
      { question: "Serve un account?", answer: "" },
      { question: "Quali documenti posso importare e sono privati?", answer: "I comuni PDF, DOCX, PPTX, XLSX, file di testo e OpenDocument vengono elaborati nel browser. Scansioni o vecchi formati possono richiedere OCR o conversione." },
      { question: "InterviewThread invia candidature automaticamente?", answer: "No. La versione pubblica open source non invia mai candidature al posto tuo. Ogni azione resta sotto il tuo controllo." },
      { question: "Posso usarlo ovunque e nella mia lingua?", answer: "L’interfaccia supporta 40 lingue e filtri globali. La copertura in tempo reale dipende dalle fonti approvate disponibili per regione." },
    ],
  },
  nl: {
    eyebrow: "Veelgestelde vragen",
    title: "Duidelijke antwoorden voordat je je bewijspakket maakt.",
    intro: "Wat InterviewThread nu doet, wat jij beheert en waar de huidige grenzen liggen.",
    items: [
      { question: "Verzint InterviewThread prestaties voor mij?", answer: "Nee. Elke suggestie moet teruggaan op bewijs dat jij aanlevert. Ontbrekend bewijs blijft zichtbaar als een echte leemte." },
      { question: "Wat heb ik nodig om te beginnen?", answer: "Eén echt cv en één echte vacaturetekst zijn genoeg. Een interviewdatum of sollicitatiefase maakt het plan nuttiger." },
      { question: "Is het resultaat een ATS-score?", answer: "Nee. Het toont per belangrijke eis sterk, gedeeltelijk of ontbrekend bewijs, in plaats van één universele ATS-score te beloven." },
      { question: "Heb ik een account nodig?", answer: "" },
      { question: "Welke documenten kan ik importeren en zijn ze privé?", answer: "Gangbare PDF-, DOCX-, PPTX-, XLSX-, tekst- en OpenDocument-bestanden worden standaard in je browser verwerkt. Scans of oude formaten kunnen OCR of conversie vereisen." },
      { question: "Solliciteert InterviewThread automatisch?", answer: "Nee. De openbare open-sourceversie verstuurt nooit een sollicitatie voor je. Jij controleert elke actie." },
      { question: "Kan ik het wereldwijd en in mijn taal gebruiken?", answer: "De interface ondersteunt 40 talen en wereldwijde filters. Live dekking hangt af van goedgekeurde bronnen per regio." },
    ],
  },
  pl: {
    eyebrow: "Najczęstsze pytania",
    title: "Jasne odpowiedzi przed utworzeniem pakietu dowodów.",
    intro: "Co InterviewThread robi dziś, co pozostaje pod Twoją kontrolą i jakie są obecne ograniczenia.",
    items: [
      { question: "Czy InterviewThread wymyśla moje osiągnięcia?", answer: "Nie. Każda sugestia musi prowadzić do dostarczonych przez Ciebie dowodów. Brak dowodu pozostaje widoczny jako prawdziwa luka." },
      { question: "Czego potrzebuję na początek?", answer: "Wystarczy prawdziwe CV i prawdziwy opis stanowiska. Data rozmowy lub etap rekrutacji ulepsza plan przygotowań." },
      { question: "Czy wynik dopasowania to wynik ATS?", answer: "Nie. Pokazuje mocne, częściowe lub brakujące dowody dla każdego wymagania zamiast obiecywać jeden uniwersalny wynik ATS." },
      { question: "Czy potrzebuję konta?", answer: "" },
      { question: "Jakie dokumenty mogę importować i czy są prywatne?", answer: "Typowe pliki PDF, DOCX, PPTX, XLSX, tekstowe i OpenDocument są domyślnie przetwarzane w przeglądarce. Skany lub stare formaty mogą wymagać OCR albo konwersji." },
      { question: "Czy InterviewThread automatycznie wysyła aplikacje?", answer: "Nie. Publiczna wersja open source nigdy nie wysyła aplikacji za Ciebie. Każde działanie kontrolujesz samodzielnie." },
      { question: "Czy mogę używać go globalnie i w swoim języku?", answer: "Interfejs obsługuje 40 języków i filtry światowe. Dostępność danych na żywo zależy od zatwierdzonych źródeł w regionie." },
    ],
  },
  tr: {
    eyebrow: "Sık sorulan sorular",
    title: "Kanıt paketini oluşturmadan önce net yanıtlar.",
    intro: "InterviewThread’in bugün yaptıkları, sizin kontrolünüzde kalanlar ve mevcut sınırlar.",
    items: [
      { question: "InterviewThread benim için başarı uydurur mu?", answer: "Hayır. Her öneri sağladığınız kanıta dayanmalıdır. Desteklenmeyen noktalar gerçek boşluk olarak görünür kalır." },
      { question: "Başlamak için neye ihtiyacım var?", answer: "Gerçek bir özgeçmiş ve gerçek bir iş ilanı yeterlidir. Mülakat tarihi veya başvuru aşaması hazırlık planını geliştirir." },
      { question: "Eşleşme sonucu bir ATS puanı mı?", answer: "Hayır. Evrensel bir ATS puanı iddia etmek yerine her önemli gereklilik için güçlü, kısmi veya eksik kanıtı gösterir." },
      { question: "Hesap gerekli mi?", answer: "" },
      { question: "Hangi belgeleri içe aktarabilirim ve bunlar gizli mi?", answer: "Yaygın PDF, DOCX, PPTX, XLSX, metin ve OpenDocument dosyaları varsayılan olarak tarayıcıda işlenir. Taramalar veya eski biçimler OCR ya da dönüşüm gerektirebilir." },
      { question: "InterviewThread otomatik başvuru yapar mı?", answer: "Hayır. Herkese açık sürüm sizin yerinize başvuru göndermez. Her işlemi siz inceler ve kontrol edersiniz." },
      { question: "Dünya çapında ve kendi dilimde kullanabilir miyim?", answer: "Arayüz 40 dili ve küresel filtreleri destekler. Canlı kapsam, her bölgedeki onaylı kaynaklara bağlıdır." },
    ],
  },
  ru: {
    eyebrow: "Частые вопросы",
    title: "Чёткие ответы до создания пакета доказательств.",
    intro: "Что InterviewThread умеет сейчас, что контролируете вы и каковы текущие ограничения.",
    items: [
      { question: "InterviewThread будет придумывать мои достижения?", answer: "Нет. Каждое предложение должно опираться на предоставленные вами доказательства. Неподтверждённое остаётся видимым как реальный пробел." },
      { question: "Что нужно для начала?", answer: "Достаточно настоящего резюме и описания вакансии. Дата интервью или этап заявки сделают план полезнее." },
      { question: "Результат соответствия — это балл ATS?", answer: "Нет. Вместо универсального балла система показывает сильные, частичные или отсутствующие доказательства по каждому важному требованию." },
      { question: "Нужна ли учётная запись?", answer: "" },
      { question: "Какие документы можно импортировать и приватны ли они?", answer: "Обычные PDF, DOCX, PPTX, XLSX, текстовые и OpenDocument-файлы по умолчанию обрабатываются в браузере. Для сканов и старых форматов может понадобиться OCR или конвертация." },
      { question: "InterviewThread подаёт заявки автоматически?", answer: "Нет. Публичная открытая версия никогда не отправляет заявку за вас. Каждое действие проверяете и контролируете вы." },
      { question: "Можно использовать сервис по всему миру и на моём языке?", answer: "Интерфейс поддерживает 40 языков и глобальные фильтры. Покрытие зависит от одобренных источников в каждом регионе." },
    ],
  },
  uk: {
    eyebrow: "Поширені запитання",
    title: "Чіткі відповіді перед створенням пакета доказів.",
    intro: "Що InterviewThread уміє зараз, що контролюєте ви та які є обмеження.",
    items: [
      { question: "InterviewThread вигадуватиме мої досягнення?", answer: "Ні. Кожна порада має спиратися на надані вами докази. Непідтверджене залишається видимим як справжня прогалина." },
      { question: "Що потрібно для початку?", answer: "Достатньо справжнього резюме й опису вакансії. Дата співбесіди або етап заявки покращать план підготовки." },
      { question: "Результат відповідності — це бал ATS?", answer: "Ні. Замість універсального бала система показує сильні, часткові або відсутні докази для кожної важливої вимоги." },
      { question: "Чи потрібен обліковий запис?", answer: "" },
      { question: "Які документи можна імпортувати та чи вони приватні?", answer: "Звичайні PDF, DOCX, PPTX, XLSX, текстові й OpenDocument-файли типово обробляються у браузері. Сканам або старим форматам може знадобитися OCR чи конвертація." },
      { question: "InterviewThread подає заявки автоматично?", answer: "Ні. Публічна відкрита версія ніколи не надсилає заявку замість вас. Ви контролюєте кожну дію." },
      { question: "Можна користуватися в усьому світі й моєю мовою?", answer: "Інтерфейс підтримує 40 мов і глобальні фільтри. Покриття залежить від схвалених джерел у кожному регіоні." },
    ],
  },
  ar: {
    eyebrow: "الأسئلة الشائعة",
    title: "إجابات واضحة قبل بناء حزمة الأدلة.",
    intro: "ما الذي يقدمه InterviewThread اليوم، وما الذي يبقى تحت سيطرتك، وما حدوده الحالية.",
    items: [
      { question: "هل يختلق InterviewThread إنجازات لي؟", answer: "لا. يجب أن يرتبط كل اقتراح بدليل تقدمه أنت. ويظل ما لا تدعمه الأدلة ظاهرًا كفجوة حقيقية." },
      { question: "ماذا أحتاج للبدء؟", answer: "تكفي سيرة ذاتية حقيقية ووصف وظيفي حقيقي. وتزيد فائدة الخطة عند إضافة موعد المقابلة أو مرحلة التقديم." },
      { question: "هل نتيجة المطابقة هي درجة ATS؟", answer: "لا. بدل الادعاء بوجود درجة عالمية، تعرض قوة الدليل أو جزئيته أو غيابه لكل متطلب مهم." },
      { question: "هل أحتاج إلى حساب؟", answer: "" },
      { question: "ما الملفات التي يمكن استيرادها وهل تبقى خاصة؟", answer: "تُعالج ملفات PDF وDOCX وPPTX وXLSX والنص وOpenDocument الشائعة في متصفحك افتراضيًا. وقد تحتاج الملفات الممسوحة أو القديمة إلى OCR أو تحويل." },
      { question: "هل يقدّم InterviewThread للوظائف تلقائيًا؟", answer: "لا. النسخة العامة المفتوحة لا ترسل أي طلب نيابة عنك. أنت تراجع وتتحكم في كل خطوة." },
      { question: "هل يمكن استخدامه عالميًا وبلغتي؟", answer: "تدعم الواجهة 40 لغة ومرشحات عالمية. وتعتمد التغطية الحية على المصادر المعتمدة المتاحة لكل منطقة." },
    ],
  },
  he: {
    eyebrow: "שאלות נפוצות",
    title: "תשובות ברורות לפני בניית חבילת ההוכחות.",
    intro: "מה InterviewThread עושה היום, מה נשאר בשליטתכם ומהן המגבלות הנוכחיות.",
    items: [
      { question: "האם InterviewThread ממציא הישגים?", answer: "לא. כל הצעה חייבת להישען על ראיות שסיפקתם. מה שאינו נתמך נשאר מוצג כפער אמיתי." },
      { question: "מה צריך כדי להתחיל?", answer: "מספיקים קורות חיים אמיתיים ותיאור משרה אמיתי. תאריך ראיון או שלב הגשה משפרים את תוכנית ההכנה." },
      { question: "האם תוצאת ההתאמה היא ציון ATS?", answer: "לא. במקום להבטיח ציון אוניברסלי, היא מציגה ראיות חזקות, חלקיות או חסרות לכל דרישה חשובה." },
      { question: "האם צריך חשבון?", answer: "" },
      { question: "אילו מסמכים אפשר לייבא והאם הם פרטיים?", answer: "קובצי PDF, DOCX, PPTX, XLSX, טקסט ו-OpenDocument נפוצים מעובדים כברירת מחדל בדפדפן. סריקות או פורמטים ישנים עשויים לדרוש OCR או המרה." },
      { question: "האם InterviewThread מגיש מועמדות אוטומטית?", answer: "לא. הגרסה הציבורית לעולם אינה שולחת מועמדות במקומכם. אתם בודקים ושולטים בכל פעולה." },
      { question: "אפשר להשתמש בו בעולם ובשפה שלי?", answer: "הממשק תומך ב-40 שפות ובמסננים עולמיים. הכיסוי החי תלוי במקורות מאושרים הזמינים בכל אזור." },
    ],
  },
  hi: {
    eyebrow: "अक्सर पूछे जाने वाले प्रश्न",
    title: "अपना एविडेंस पैक बनाने से पहले स्पष्ट उत्तर।",
    intro: "InterviewThread आज क्या करता है, क्या आपके नियंत्रण में रहता है और इसकी मौजूदा सीमाएँ क्या हैं।",
    items: [
      { question: "क्या InterviewThread मेरी उपलब्धियाँ गढ़ेगा?", answer: "नहीं। हर सुझाव आपके दिए प्रमाण से जुड़ा होना चाहिए। बिना प्रमाण वाली बात वास्तविक कमी के रूप में दिखाई देती है।" },
      { question: "शुरू करने के लिए क्या चाहिए?", answer: "एक वास्तविक रिज़्यूमे और एक वास्तविक JD पर्याप्त हैं। इंटरव्यू की तारीख या आवेदन चरण जोड़ने से तैयारी योजना बेहतर होती है।" },
      { question: "क्या मैच परिणाम ATS स्कोर है?", answer: "नहीं। यह एक सार्वभौमिक स्कोर का दावा नहीं करता, बल्कि हर महत्वपूर्ण आवश्यकता के लिए मजबूत, आंशिक या गायब प्रमाण दिखाता है।" },
      { question: "क्या मुझे खाता चाहिए?", answer: "" },
      { question: "कौन से दस्तावेज़ आयात कर सकता हूँ और क्या वे निजी हैं?", answer: "सामान्य PDF, DOCX, PPTX, XLSX, टेक्स्ट और OpenDocument फ़ाइलें डिफ़ॉल्ट रूप से ब्राउज़र में संसाधित होती हैं। स्कैन या पुराने प्रारूप को OCR या रूपांतरण चाहिए हो सकता है।" },
      { question: "क्या InterviewThread अपने आप आवेदन करता है?", answer: "नहीं। सार्वजनिक ओपन-सोर्स संस्करण आपकी ओर से आवेदन नहीं भेजता। हर कार्रवाई पर आपका नियंत्रण रहता है।" },
      { question: "क्या इसे दुनिया भर में अपनी भाषा में उपयोग कर सकता हूँ?", answer: "इंटरफ़ेस 40 भाषाओं और वैश्विक फ़िल्टर का समर्थन करता है। लाइव कवरेज हर क्षेत्र के स्वीकृत स्रोतों पर निर्भर है।" },
    ],
  },
  bn: {
    eyebrow: "সাধারণ প্রশ্ন",
    title: "প্রমাণের প্যাক তৈরির আগে পরিষ্কার উত্তর।",
    intro: "InterviewThread এখন কী করে, কী আপনার নিয়ন্ত্রণে থাকে এবং বর্তমান সীমা কোথায়।",
    items: [
      { question: "InterviewThread কি আমার অর্জন বানিয়ে দেবে?", answer: "না। প্রতিটি পরামর্শ আপনার দেওয়া প্রমাণের সঙ্গে যুক্ত থাকতে হবে। প্রমাণ না থাকলে সেটি প্রকৃত ঘাটতি হিসেবেই দেখা যাবে।" },
      { question: "শুরু করতে কী লাগবে?", answer: "একটি বাস্তব জীবনবৃত্তান্ত ও একটি বাস্তব চাকরির বিবরণ যথেষ্ট। সাক্ষাৎকারের তারিখ বা আবেদনের ধাপ যোগ করলে পরিকল্পনা আরও কার্যকর হয়।" },
      { question: "ম্যাচ ফল কি ATS স্কোর?", answer: "না। একক সার্বজনীন স্কোরের বদলে প্রতিটি গুরুত্বপূর্ণ চাহিদার জন্য শক্তিশালী, আংশিক বা অনুপস্থিত প্রমাণ দেখায়।" },
      { question: "অ্যাকাউন্ট কি দরকার?", answer: "" },
      { question: "কোন নথি আনা যায় এবং সেগুলো কি ব্যক্তিগত?", answer: "সাধারণ PDF, DOCX, PPTX, XLSX, টেক্সট ও OpenDocument ফাইল ডিফল্টভাবে ব্রাউজারে প্রক্রিয়াকৃত হয়। স্ক্যান বা পুরোনো ফাইলে OCR বা রূপান্তর লাগতে পারে।" },
      { question: "InterviewThread কি নিজে আবেদন করে?", answer: "না। প্রকাশ্য ওপেন-সোর্স সংস্করণ আপনার হয়ে আবেদন পাঠায় না। প্রতিটি পদক্ষেপ আপনি নিয়ন্ত্রণ করেন।" },
      { question: "বিশ্বজুড়ে নিজের ভাষায় ব্যবহার করা যায়?", answer: "ইন্টারফেস ৪০টি ভাষা ও বৈশ্বিক ফিল্টার সমর্থন করে। লাইভ কভারেজ অঞ্চলভিত্তিক অনুমোদিত উৎসের ওপর নির্ভর করে।" },
    ],
  },
  ur: {
    eyebrow: "اکثر پوچھے گئے سوالات",
    title: "ثبوتی پیک بنانے سے پہلے واضح جوابات۔",
    intro: "InterviewThread آج کیا کرتا ہے، کیا آپ کے اختیار میں رہتا ہے اور موجودہ حدود کیا ہیں۔",
    items: [
      { question: "کیا InterviewThread میری کامیابیاں گھڑے گا؟", answer: "نہیں۔ ہر تجویز آپ کے فراہم کردہ ثبوت سے جڑی ہونی چاہیے۔ بغیر ثبوت کی بات حقیقی خلا کے طور پر دکھائی جاتی ہے۔" },
      { question: "شروع کرنے کے لیے کیا چاہیے؟", answer: "ایک حقیقی ریزیومے اور ایک حقیقی JD کافی ہیں۔ انٹرویو کی تاریخ یا درخواست کا مرحلہ شامل کرنے سے تیاری بہتر ہوتی ہے۔" },
      { question: "کیا میچ نتیجہ ATS اسکور ہے؟", answer: "نہیں۔ ایک عالمی اسکور کے بجائے یہ ہر اہم ضرورت کے لیے مضبوط، جزوی یا غائب ثبوت دکھاتا ہے۔" },
      { question: "کیا اکاؤنٹ ضروری ہے؟", answer: "" },
      { question: "کون سی دستاویزات درآمد ہو سکتی ہیں اور کیا وہ نجی ہیں؟", answer: "عام PDF، DOCX، PPTX، XLSX، متن اور OpenDocument فائلیں عموماً براؤزر میں پراسیس ہوتی ہیں۔ اسکین یا پرانے فارمیٹ کو OCR یا تبدیلی درکار ہو سکتی ہے۔" },
      { question: "کیا InterviewThread خودکار درخواست بھیجتا ہے؟", answer: "نہیں۔ عوامی اوپن سورس ورژن آپ کی طرف سے درخواست جمع نہیں کرتا۔ ہر قدم آپ کے اختیار میں ہے۔" },
      { question: "کیا اسے دنیا بھر میں اپنی زبان میں استعمال کر سکتا ہوں؟", answer: "انٹرفیس 40 زبانوں اور عالمی فلٹرز کی حمایت کرتا ہے۔ لائیو کوریج ہر خطے کے منظور شدہ ذرائع پر منحصر ہے۔" },
    ],
  },
  id: {
    eyebrow: "Pertanyaan umum",
    title: "Jawaban jelas sebelum membuat paket bukti Anda.",
    intro: "Apa yang dilakukan InterviewThread saat ini, apa yang Anda kendalikan, dan batasannya.",
    items: [
      { question: "Apakah InterviewThread mengarang pencapaian saya?", answer: "Tidak. Setiap saran harus terhubung ke bukti yang Anda berikan. Bukti yang tidak ada tetap terlihat sebagai kesenjangan nyata." },
      { question: "Apa yang saya perlukan untuk mulai?", answer: "Satu resume nyata dan satu deskripsi pekerjaan nyata sudah cukup. Tanggal wawancara atau tahap lamaran membuat rencana lebih berguna." },
      { question: "Apakah hasil kecocokan merupakan skor ATS?", answer: "Tidak. Hasil ini menunjukkan bukti kuat, sebagian, atau tidak ada untuk setiap persyaratan penting, bukan mengklaim satu skor ATS universal." },
      { question: "Apakah saya perlu akun?", answer: "" },
      { question: "Dokumen apa yang dapat diimpor dan apakah tetap privat?", answer: "PDF, DOCX, PPTX, XLSX, teks, dan OpenDocument umum diproses di browser secara default. Hasil pindai atau format lama mungkin memerlukan OCR atau konversi." },
      { question: "Apakah InterviewThread melamar otomatis?", answer: "Tidak. Versi publik tidak pernah mengirim lamaran untuk Anda. Anda meninjau dan mengendalikan setiap tindakan." },
      { question: "Dapatkah saya menggunakannya di seluruh dunia dan dalam bahasa saya?", answer: "Antarmuka mendukung 40 bahasa dan filter global. Cakupan langsung bergantung pada sumber yang disetujui di tiap wilayah." },
    ],
  },
  ms: {
    eyebrow: "Soalan lazim",
    title: "Jawapan jelas sebelum membina pek bukti anda.",
    intro: "Apa yang dilakukan InterviewThread hari ini, perkara yang anda kawal dan batas semasa.",
    items: [
      { question: "Adakah InterviewThread mereka-reka pencapaian saya?", answer: "Tidak. Setiap cadangan mesti berpaut pada bukti yang anda berikan. Bukti yang tiada kekal sebagai jurang sebenar." },
      { question: "Apakah yang diperlukan untuk bermula?", answer: "Satu resume sebenar dan satu huraian kerja sebenar sudah mencukupi. Tarikh temu duga atau peringkat permohonan menambah baik pelan." },
      { question: "Adakah hasil padanan ialah skor ATS?", answer: "Tidak. Ia menunjukkan bukti kuat, separa atau tiada bagi setiap keperluan penting, bukan mendakwa satu skor ATS sejagat." },
      { question: "Adakah saya perlukan akaun?", answer: "" },
      { question: "Dokumen apa boleh diimport dan adakah ia peribadi?", answer: "PDF, DOCX, PPTX, XLSX, teks dan OpenDocument lazim diproses dalam pelayar secara lalai. Imbasan atau format lama mungkin memerlukan OCR atau penukaran." },
      { question: "Adakah InterviewThread memohon secara automatik?", answer: "Tidak. Versi awam tidak pernah menghantar permohonan bagi pihak anda. Anda menyemak dan mengawal setiap tindakan." },
      { question: "Boleh digunakan di seluruh dunia dan dalam bahasa saya?", answer: "Antara muka menyokong 40 bahasa dan penapis global. Liputan langsung bergantung pada sumber diluluskan mengikut wilayah." },
    ],
  },
  th: {
    eyebrow: "คำถามที่พบบ่อย",
    title: "คำตอบที่ชัดเจนก่อนสร้างชุดหลักฐานของคุณ",
    intro: "InterviewThread ทำอะไรได้ในวันนี้ สิ่งใดอยู่ในการควบคุมของคุณ และข้อจำกัดปัจจุบัน",
    items: [
      { question: "InterviewThread จะสร้างผลงานที่ไม่จริงให้ฉันหรือไม่", answer: "ไม่ ทุกคำแนะนำต้องเชื่อมกลับไปยังหลักฐานที่คุณให้ ส่วนที่ไม่มีหลักฐานจะยังแสดงเป็นช่องว่างจริง" },
      { question: "ต้องใช้อะไรในการเริ่มต้น", answer: "เรซูเม่จริงหนึ่งฉบับและ JD จริงหนึ่งรายการก็เพียงพอ การเพิ่มวันสัมภาษณ์หรือขั้นตอนสมัครจะช่วยให้แผนมีประโยชน์ขึ้น" },
      { question: "ผลการจับคู่คือคะแนน ATS หรือไม่", answer: "ไม่ ระบบจะแสดงหลักฐานที่แข็งแรง บางส่วน หรือขาดหายสำหรับแต่ละข้อกำหนด แทนการอ้างคะแนน ATS แบบเดียว" },
      { question: "จำเป็นต้องมีบัญชีหรือไม่", answer: "" },
      { question: "นำเข้าไฟล์อะไรได้บ้างและข้อมูลเป็นส่วนตัวหรือไม่", answer: "ไฟล์ PDF, DOCX, PPTX, XLSX, ข้อความ และ OpenDocument ทั่วไปจะประมวลผลในเบราว์เซอร์โดยค่าเริ่มต้น ไฟล์สแกนหรือเก่าอาจต้อง OCR หรือแปลงก่อน" },
      { question: "InterviewThread สมัครงานให้อัตโนมัติหรือไม่", answer: "ไม่ เวอร์ชันสาธารณะจะไม่ส่งใบสมัครแทนคุณ คุณตรวจสอบและควบคุมทุกการทำงาน" },
      { question: "ใช้ได้ทั่วโลกและในภาษาของฉันหรือไม่", answer: "อินเทอร์เฟซรองรับ 40 ภาษาและตัวกรองทั่วโลก ความครอบคลุมแบบสดขึ้นอยู่กับแหล่งข้อมูลที่ได้รับอนุมัติในแต่ละภูมิภาค" },
    ],
  },
  vi: {
    eyebrow: "Câu hỏi thường gặp",
    title: "Câu trả lời rõ ràng trước khi tạo bộ bằng chứng.",
    intro: "InterviewThread hiện làm được gì, điều gì do bạn kiểm soát và các giới hạn hiện tại.",
    items: [
      { question: "InterviewThread có bịa thành tích cho tôi không?", answer: "Không. Mọi gợi ý phải liên kết với bằng chứng bạn cung cấp. Phần không có bằng chứng vẫn được hiển thị là khoảng trống thật." },
      { question: "Tôi cần gì để bắt đầu?", answer: "Một CV thật và một JD thật là đủ. Ngày phỏng vấn hoặc giai đoạn ứng tuyển giúp kế hoạch chuẩn bị hữu ích hơn." },
      { question: "Kết quả đối chiếu có phải điểm ATS không?", answer: "Không. Hệ thống hiển thị bằng chứng mạnh, một phần hoặc thiếu cho từng yêu cầu quan trọng thay vì tuyên bố một điểm ATS chung." },
      { question: "Tôi có cần tài khoản không?", answer: "" },
      { question: "Có thể nhập tài liệu nào và chúng có riêng tư không?", answer: "PDF, DOCX, PPTX, XLSX, văn bản và OpenDocument thông dụng được xử lý trong trình duyệt theo mặc định. Bản quét hoặc định dạng cũ có thể cần OCR hoặc chuyển đổi." },
      { question: "InterviewThread có tự động ứng tuyển không?", answer: "Không. Phiên bản công khai không bao giờ gửi đơn thay bạn. Bạn xem xét và kiểm soát mọi hành động." },
      { question: "Có thể dùng trên toàn cầu và bằng ngôn ngữ của tôi không?", answer: "Giao diện hỗ trợ 40 ngôn ngữ và bộ lọc toàn cầu. Phạm vi trực tiếp phụ thuộc vào nguồn được phê duyệt ở từng khu vực." },
    ],
  },
  fil: {
    eyebrow: "Mga madalas itanong",
    title: "Malinaw na sagot bago buuin ang iyong evidence pack.",
    intro: "Ano ang ginagawa ng InterviewThread ngayon, ano ang kontrolado mo, at ang kasalukuyang limitasyon.",
    items: [
      { question: "Gagawa ba ang InterviewThread ng pekeng achievement?", answer: "Hindi. Dapat nakaugnay ang bawat mungkahi sa ebidensiyang ibinigay mo. Ang walang suporta ay mananatiling tunay na gap." },
      { question: "Ano ang kailangan para magsimula?", answer: "Sapat na ang isang totoong resume at isang totoong JD. Mas magiging kapaki-pakinabang ang plano kapag idinagdag ang petsa ng interview o yugto ng application." },
      { question: "ATS score ba ang match result?", answer: "Hindi. Ipinapakita nito ang malakas, bahagya, o nawawalang ebidensiya sa bawat mahalagang requirement sa halip na mangakong may iisang ATS score." },
      { question: "Kailangan ko ba ng account?", answer: "" },
      { question: "Anong dokumento ang mai-import at pribado ba ang mga ito?", answer: "Ang karaniwang PDF, DOCX, PPTX, XLSX, text, at OpenDocument ay pinoproseso sa browser bilang default. Maaaring kailangan ng OCR o conversion ang scan at lumang format." },
      { question: "Awtomatikong nag-a-apply ba ang InterviewThread?", answer: "Hindi. Hindi nagsusumite ng application para sa iyo ang pampublikong bersyon. Ikaw ang sumusuri at kumokontrol sa bawat aksyon." },
      { question: "Magagamit ba ito sa buong mundo at sa wika ko?", answer: "Sinusuportahan ng interface ang 40 wika at global na filter. Nakadepende ang live coverage sa aprubadong source sa bawat rehiyon." },
    ],
  },
  sv: {
    eyebrow: "Vanliga frågor",
    title: "Tydliga svar innan du bygger ditt bevispaket.",
    intro: "Vad InterviewThread gör i dag, vad du styr och vilka begränsningar som finns.",
    items: [
      { question: "Hittar InterviewThread på prestationer åt mig?", answer: "Nej. Varje förslag måste kunna kopplas till bevis du lämnar. Det som saknar stöd visas som en verklig lucka." },
      { question: "Vad behöver jag för att börja?", answer: "Ett riktigt cv och en riktig jobbannons räcker. Intervjudatum eller ansökningssteg gör planen mer användbar." },
      { question: "Är matchningsresultatet ett ATS-värde?", answer: "Nej. Det visar starka, delvisa eller saknade bevis för varje viktigt krav i stället för att lova ett universellt ATS-värde." },
      { question: "Behöver jag ett konto?", answer: "" },
      { question: "Vilka dokument kan jag importera och är de privata?", answer: "Vanliga PDF-, DOCX-, PPTX-, XLSX-, text- och OpenDocument-filer bearbetas normalt i webbläsaren. Skanningar eller äldre format kan kräva OCR eller konvertering." },
      { question: "Söker InterviewThread jobb automatiskt?", answer: "Nej. Den offentliga versionen skickar aldrig en ansökan åt dig. Du granskar och styr varje åtgärd." },
      { question: "Kan jag använda det globalt och på mitt språk?", answer: "Gränssnittet stöder 40 språk och globala filter. Livetäckning beror på godkända källor i varje region." },
    ],
  },
  no: {
    eyebrow: "Vanlige spørsmål",
    title: "Klare svar før du bygger bevispakken din.",
    intro: "Hva InterviewThread gjør i dag, hva du styrer og hvilke begrensninger som finnes.",
    items: [
      { question: "Finner InterviewThread på prestasjoner for meg?", answer: "Nei. Hvert forslag må knyttes til bevis du gir. Det som mangler støtte, vises som et reelt gap." },
      { question: "Hva trenger jeg for å starte?", answer: "En ekte CV og en ekte stillingsbeskrivelse er nok. Intervjudato eller søknadsfase gjør planen mer nyttig." },
      { question: "Er resultatet en ATS-poengsum?", answer: "Nei. Det viser sterke, delvise eller manglende bevis for hvert viktig krav i stedet for å love én universell ATS-poengsum." },
      { question: "Trenger jeg en konto?", answer: "" },
      { question: "Hvilke dokumenter kan jeg importere, og er de private?", answer: "Vanlige PDF-, DOCX-, PPTX-, XLSX-, tekst- og OpenDocument-filer behandles som standard i nettleseren. Skanninger eller eldre formater kan kreve OCR eller konvertering." },
      { question: "Søker InterviewThread automatisk på jobber?", answer: "Nei. Den offentlige versjonen sender aldri en søknad for deg. Du gjennomgår og styrer hver handling." },
      { question: "Kan jeg bruke det globalt og på språket mitt?", answer: "Grensesnittet støtter 40 språk og globale filtre. Livedekning avhenger av godkjente kilder i hver region." },
    ],
  },
  da: {
    eyebrow: "Ofte stillede spørgsmål",
    title: "Klare svar, før du bygger din evidenspakke.",
    intro: "Hvad InterviewThread gør i dag, hvad du styrer, og hvor de nuværende grænser går.",
    items: [
      { question: "Opfinder InterviewThread resultater for mig?", answer: "Nej. Hvert forslag skal kunne føres tilbage til den evidens, du giver. Det, der mangler støtte, vises som et reelt hul." },
      { question: "Hvad skal jeg bruge for at begynde?", answer: "Et rigtigt CV og en rigtig jobbeskrivelse er nok. Interviewdato eller ansøgningsfase gør planen mere nyttig." },
      { question: "Er matchresultatet en ATS-score?", answer: "Nej. Det viser stærk, delvis eller manglende evidens for hvert vigtigt krav i stedet for at love én universel ATS-score." },
      { question: "Skal jeg have en konto?", answer: "" },
      { question: "Hvilke dokumenter kan jeg importere, og er de private?", answer: "Almindelige PDF-, DOCX-, PPTX-, XLSX-, tekst- og OpenDocument-filer behandles som standard i browseren. Scanninger eller ældre formater kan kræve OCR eller konvertering." },
      { question: "Søger InterviewThread automatisk job?", answer: "Nej. Den offentlige version sender aldrig en ansøgning for dig. Du gennemgår og styrer alle handlinger." },
      { question: "Kan jeg bruge det globalt og på mit sprog?", answer: "Brugerfladen understøtter 40 sprog og globale filtre. Livedækning afhænger af godkendte kilder i hver region." },
    ],
  },
  fi: {
    eyebrow: "Usein kysytyt kysymykset",
    title: "Selkeät vastaukset ennen näyttöpaketin rakentamista.",
    intro: "Mitä InterviewThread tekee nyt, mitä sinä hallitset ja mitkä ovat nykyiset rajat.",
    items: [
      { question: "Keksiikö InterviewThread saavutuksia puolestani?", answer: "Ei. Jokaisen ehdotuksen täytyy perustua antamaasi näyttöön. Ilman tukea jäävä asia näkyy aitona puutteena." },
      { question: "Mitä tarvitsen aloittamiseen?", answer: "Yksi todellinen CV ja yksi todellinen työpaikkailmoitus riittävät. Haastattelupäivä tai hakuvaihe parantaa suunnitelmaa." },
      { question: "Onko vastaavuustulos ATS-pistemäärä?", answer: "Ei. Se näyttää vahvan, osittaisen tai puuttuvan näytön jokaiselle tärkeälle vaatimukselle eikä lupaa yhtä yleistä ATS-pistemäärää." },
      { question: "Tarvitsenko tilin?", answer: "" },
      { question: "Mitä asiakirjoja voin tuoda ja ovatko ne yksityisiä?", answer: "Tavalliset PDF-, DOCX-, PPTX-, XLSX-, teksti- ja OpenDocument-tiedostot käsitellään oletuksena selaimessa. Skannaukset tai vanhat muodot voivat vaatia OCR:n tai muunnoksen." },
      { question: "Hakeeko InterviewThread töitä automaattisesti?", answer: "Ei. Julkinen versio ei koskaan lähetä hakemusta puolestasi. Tarkistat ja hallitset jokaisen toiminnon." },
      { question: "Voinko käyttää sitä maailmanlaajuisesti omalla kielelläni?", answer: "Käyttöliittymä tukee 40 kieltä ja maailmanlaajuisia suodattimia. Reaaliaikainen kattavuus riippuu alueen hyväksytyistä lähteistä." },
    ],
  },
  cs: {
    eyebrow: "Časté dotazy",
    title: "Jasné odpovědi před vytvořením balíčku důkazů.",
    intro: "Co InterviewThread umí dnes, co ovládáte vy a kde jsou současné limity.",
    items: [
      { question: "Vymyslí InterviewThread moje úspěchy?", answer: "Ne. Každý návrh musí vycházet z důkazů, které poskytnete. Nepodložené části zůstanou viditelné jako skutečná mezera." },
      { question: "Co potřebuji na začátek?", answer: "Stačí skutečný životopis a skutečný popis práce. Datum pohovoru nebo fáze žádosti plán zpřesní." },
      { question: "Je výsledek shody skóre ATS?", answer: "Ne. Ukazuje silné, částečné nebo chybějící důkazy pro každý důležitý požadavek místo slibu univerzálního skóre ATS." },
      { question: "Potřebuji účet?", answer: "" },
      { question: "Jaké dokumenty lze importovat a jsou soukromé?", answer: "Běžné PDF, DOCX, PPTX, XLSX, textové a OpenDocument soubory se zpracují v prohlížeči. Skeny nebo staré formáty mohou vyžadovat OCR či převod." },
      { question: "Podává InterviewThread žádosti automaticky?", answer: "Ne. Veřejná verze nikdy neodešle žádost za vás. Každou akci kontrolujete vy." },
      { question: "Lze jej používat celosvětově a v mém jazyce?", answer: "Rozhraní podporuje 40 jazyků a globální filtry. Živé pokrytí závisí na schválených zdrojích v regionu." },
    ],
  },
  sk: {
    eyebrow: "Časté otázky",
    title: "Jasné odpovede pred vytvorením balíka dôkazov.",
    intro: "Čo InterviewThread dokáže dnes, čo ovládate vy a aké sú súčasné limity.",
    items: [
      { question: "Vymyslí InterviewThread moje úspechy?", answer: "Nie. Každý návrh musí vychádzať z dôkazov, ktoré poskytnete. Nepodložené časti zostanú viditeľné ako skutočná medzera." },
      { question: "Čo potrebujem na začiatok?", answer: "Stačí skutočný životopis a skutočný opis práce. Dátum pohovoru alebo fáza žiadosti plán spresnia." },
      { question: "Je výsledok zhody skóre ATS?", answer: "Nie. Zobrazuje silné, čiastočné alebo chýbajúce dôkazy ku každej požiadavke namiesto sľubu jedného univerzálneho skóre ATS." },
      { question: "Potrebujem účet?", answer: "" },
      { question: "Aké dokumenty môžem importovať a sú súkromné?", answer: "Bežné PDF, DOCX, PPTX, XLSX, textové a OpenDocument súbory sa spracujú v prehliadači. Skeny alebo staré formáty môžu vyžadovať OCR či konverziu." },
      { question: "Podáva InterviewThread žiadosti automaticky?", answer: "Nie. Verejná verzia nikdy neodošle žiadosť za vás. Každý krok kontrolujete vy." },
      { question: "Dá sa používať celosvetovo a v mojom jazyku?", answer: "Rozhranie podporuje 40 jazykov a globálne filtre. Živé pokrytie závisí od schválených zdrojov v regióne." },
    ],
  },
  hu: {
    eyebrow: "Gyakori kérdések",
    title: "Egyértelmű válaszok a bizonyítékcsomag elkészítése előtt.",
    intro: "Mit tesz ma a InterviewThread, mi marad az Ön kezében, és mik a jelenlegi korlátok.",
    items: [
      { question: "Kitalál eredményeket helyettem a InterviewThread?", answer: "Nem. Minden javaslatnak az Ön által megadott bizonyítékra kell támaszkodnia. A nem igazolt rész valódi hiányként látható marad." },
      { question: "Mire van szükségem a kezdéshez?", answer: "Egy valódi önéletrajz és egy valódi állásleírás elég. Az interjú dátuma vagy a jelentkezési szakasz javítja a tervet." },
      { question: "A találati eredmény ATS-pontszám?", answer: "Nem. Minden fontos követelménynél erős, részleges vagy hiányzó bizonyítékot mutat, nem pedig egyetlen univerzális ATS-pontot ígér." },
      { question: "Szükségem van fiókra?", answer: "" },
      { question: "Milyen dokumentumokat importálhatok, és privátak maradnak?", answer: "A szokásos PDF, DOCX, PPTX, XLSX, szöveg és OpenDocument fájlok alapból a böngészőben kerülnek feldolgozásra. A szkennelt vagy régi formátumok OCR-t vagy átalakítást igényelhetnek." },
      { question: "A InterviewThread automatikusan pályáz?", answer: "Nem. A nyilvános verzió soha nem küld jelentkezést Ön helyett. Minden lépést Ön ellenőriz." },
      { question: "Világszerte és a saját nyelvemen is használhatom?", answer: "A felület 40 nyelvet és globális szűrőket támogat. Az élő lefedettség a régiónként jóváhagyott forrásoktól függ." },
    ],
  },
  ro: {
    eyebrow: "Întrebări frecvente",
    title: "Răspunsuri clare înainte de a crea pachetul de dovezi.",
    intro: "Ce face InterviewThread astăzi, ce controlați dvs. și care sunt limitele actuale.",
    items: [
      { question: "InterviewThread inventează realizări pentru mine?", answer: "Nu. Fiecare sugestie trebuie să se lege de dovezile oferite de dvs. Ce nu are suport rămâne vizibil ca o lacună reală." },
      { question: "De ce am nevoie pentru a începe?", answer: "Un CV real și o descriere reală a postului sunt suficiente. Data interviului sau etapa candidaturii îmbunătățesc planul." },
      { question: "Rezultatul potrivirii este un scor ATS?", answer: "Nu. Arată dovezi puternice, parțiale sau lipsă pentru fiecare cerință importantă, fără a promite un scor ATS universal." },
      { question: "Am nevoie de un cont?", answer: "" },
      { question: "Ce documente pot importa și rămân private?", answer: "Fișierele PDF, DOCX, PPTX, XLSX, text și OpenDocument obișnuite sunt procesate implicit în browser. Scanările sau formatele vechi pot necesita OCR ori conversie." },
      { question: "InterviewThread aplică automat la joburi?", answer: "Nu. Versiunea publică nu trimite niciodată o candidatură în locul dvs. Dvs. controlați fiecare acțiune." },
      { question: "Îl pot folosi oriunde și în limba mea?", answer: "Interfața acceptă 40 de limbi și filtre globale. Acoperirea live depinde de sursele aprobate din fiecare regiune." },
    ],
  },
  el: {
    eyebrow: "Συχνές ερωτήσεις",
    title: "Καθαρές απαντήσεις πριν δημιουργήσετε το πακέτο τεκμηρίων.",
    intro: "Τι κάνει σήμερα το InterviewThread, τι ελέγχετε εσείς και ποια είναι τα τρέχοντα όρια.",
    items: [
      { question: "Το InterviewThread επινοεί επιτεύγματα για μένα;", answer: "Όχι. Κάθε πρόταση πρέπει να συνδέεται με στοιχεία που παρέχετε. Ό,τι δεν τεκμηριώνεται παραμένει ορατό ως πραγματικό κενό." },
      { question: "Τι χρειάζομαι για να ξεκινήσω;", answer: "Αρκούν ένα πραγματικό βιογραφικό και μια πραγματική περιγραφή θέσης. Η ημερομηνία συνέντευξης ή το στάδιο αίτησης βελτιώνει το πλάνο." },
      { question: "Το αποτέλεσμα αντιστοίχισης είναι βαθμός ATS;", answer: "Όχι. Δείχνει ισχυρά, μερικά ή ελλιπή στοιχεία για κάθε σημαντική απαίτηση αντί να υπόσχεται έναν καθολικό βαθμό ATS." },
      { question: "Χρειάζομαι λογαριασμό;", answer: "" },
      { question: "Ποια έγγραφα εισάγονται και παραμένουν ιδιωτικά;", answer: "Συνήθη PDF, DOCX, PPTX, XLSX, κείμενα και OpenDocument επεξεργάζονται στον φυλλομετρητή. Σαρώσεις ή παλιές μορφές μπορεί να χρειάζονται OCR ή μετατροπή." },
      { question: "Το InterviewThread κάνει αυτόματες αιτήσεις;", answer: "Όχι. Η δημόσια έκδοση δεν υποβάλλει ποτέ αίτηση για εσάς. Εσείς ελέγχετε κάθε ενέργεια." },
      { question: "Μπορώ να το χρησιμοποιώ παγκοσμίως και στη γλώσσα μου;", answer: "Η διεπαφή υποστηρίζει 40 γλώσσες και παγκόσμια φίλτρα. Η ζωντανή κάλυψη εξαρτάται από εγκεκριμένες πηγές ανά περιοχή." },
    ],
  },
  bg: {
    eyebrow: "Често задавани въпроси",
    title: "Ясни отговори преди създаването на пакет с доказателства.",
    intro: "Какво прави InterviewThread днес, какво контролирате вие и какви са текущите ограничения.",
    items: [
      { question: "InterviewThread измисля ли постижения вместо мен?", answer: "Не. Всяко предложение трябва да води до предоставено от вас доказателство. Неподкрепеното остава видимо като реална липса." },
      { question: "Какво ми трябва за начало?", answer: "Достатъчни са реално CV и реална обява. Датата на интервюто или етапът на кандидатурата подобряват плана." },
      { question: "Резултатът от съвпадението ATS оценка ли е?", answer: "Не. Той показва силни, частични или липсващи доказателства за всяко важно изискване, а не обещава универсална ATS оценка." },
      { question: "Нужен ли ми е профил?", answer: "" },
      { question: "Какви документи мога да импортирам и лични ли са?", answer: "Обичайни PDF, DOCX, PPTX, XLSX, текст и OpenDocument файлове се обработват в браузъра. Сканирани или стари формати може да изискват OCR или конвертиране." },
      { question: "InterviewThread кандидатства ли автоматично?", answer: "Не. Публичната версия никога не изпраща кандидатура вместо вас. Вие контролирате всяко действие." },
      { question: "Мога ли да го използвам по света и на моя език?", answer: "Интерфейсът поддържа 40 езика и глобални филтри. Покритието на живо зависи от одобрени източници във всеки регион." },
    ],
  },
  hr: {
    eyebrow: "Česta pitanja",
    title: "Jasni odgovori prije izrade paketa dokaza.",
    intro: "Što InterviewThread radi danas, što vi kontrolirate i koja su trenutačna ograničenja.",
    items: [
      { question: "Izmišlja li InterviewThread moja postignuća?", answer: "Ne. Svaki prijedlog mora se povezati s dokazom koji ste dali. Nepotkrijepljeno ostaje vidljivo kao stvarni nedostatak." },
      { question: "Što trebam za početak?", answer: "Dovoljni su stvarni životopis i stvarni opis posla. Datum razgovora ili faza prijave poboljšavaju plan." },
      { question: "Je li rezultat podudaranja ATS ocjena?", answer: "Ne. Prikazuje snažan, djelomičan ili nedostajući dokaz za svaki važan zahtjev, bez obećanja univerzalne ATS ocjene." },
      { question: "Trebam li račun?", answer: "" },
      { question: "Koje dokumente mogu uvesti i ostaju li privatni?", answer: "Uobičajeni PDF, DOCX, PPTX, XLSX, tekst i OpenDocument obrađuju se u pregledniku. Skenovi ili stari formati mogu zahtijevati OCR ili pretvorbu." },
      { question: "Prijavljuje li InterviewThread poslove automatski?", answer: "Ne. Javna verzija nikada ne šalje prijavu umjesto vas. Vi pregledavate i kontrolirate svaku radnju." },
      { question: "Mogu li ga koristiti globalno i na svom jeziku?", answer: "Sučelje podržava 40 jezika i globalne filtre. Pokrivenost uživo ovisi o odobrenim izvorima po regiji." },
    ],
  },
  sr: {
    eyebrow: "Честа питања",
    title: "Јасни одговори пре израде пакета доказа.",
    intro: "Шта InterviewThread ради данас, шта ви контролишете и која су тренутна ограничења.",
    items: [
      { question: "Да ли InterviewThread измишља моја достигнућа?", answer: "Не. Сваки предлог мора бити повезан са доказом који сте дали. Непоткрепљено остаје видљиво као стварни недостатак." },
      { question: "Шта ми треба за почетак?", answer: "Довољни су стварни резиме и стварни опис посла. Датум интервјуа или фаза пријаве побољшавају план." },
      { question: "Да ли је резултат подударања ATS оцена?", answer: "Не. Приказује јак, делимичан или недостајући доказ за сваки важан захтев, без обећања универзалне ATS оцене." },
      { question: "Да ли ми треба налог?", answer: "" },
      { question: "Које документе могу да увезем и да ли су приватни?", answer: "Уобичајени PDF, DOCX, PPTX, XLSX, текст и OpenDocument обрађују се у прегледачу. Скенирани или стари формати могу захтевати OCR или конверзију." },
      { question: "Да ли InterviewThread аутоматски шаље пријаве?", answer: "Не. Јавна верзија никада не шаље пријаву уместо вас. Ви контролишете сваку радњу." },
      { question: "Могу ли да га користим глобално и на свом језику?", answer: "Интерфејс подржава 40 језика и глобалне филтере. Покривеност уживо зависи од одобрених извора по региону." },
    ],
  },
  sl: {
    eyebrow: "Pogosta vprašanja",
    title: "Jasni odgovori pred izdelavo paketa dokazov.",
    intro: "Kaj InterviewThread počne danes, kaj nadzirate vi in katere so trenutne omejitve.",
    items: [
      { question: "Ali InterviewThread izmišlja moje dosežke?", answer: "Ne. Vsak predlog mora izhajati iz dokaza, ki ga zagotovite. Nepodprto ostane vidno kot resnična vrzel." },
      { question: "Kaj potrebujem za začetek?", answer: "Dovolj sta resničen življenjepis in resničen opis dela. Datum razgovora ali faza prijave izboljšata načrt." },
      { question: "Je rezultat ujemanja ocena ATS?", answer: "Ne. Prikaže močne, delne ali manjkajoče dokaze za vsako pomembno zahtevo, namesto da bi obljubljal eno univerzalno oceno ATS." },
      { question: "Ali potrebujem račun?", answer: "" },
      { question: "Katere dokumente lahko uvozim in ali so zasebni?", answer: "Običajni PDF, DOCX, PPTX, XLSX, besedilo in OpenDocument se privzeto obdelajo v brskalniku. Skeni ali stari formati lahko zahtevajo OCR ali pretvorbo." },
      { question: "Ali InterviewThread samodejno pošilja prijave?", answer: "Ne. Javna različica nikoli ne odda prijave namesto vas. Vsako dejanje nadzirate vi." },
      { question: "Ali ga lahko uporabljam globalno in v svojem jeziku?", answer: "Vmesnik podpira 40 jezikov in globalne filtre. Pokritost v živo je odvisna od odobrenih virov po regiji." },
    ],
  },
  sw: {
    eyebrow: "Maswali yanayoulizwa mara kwa mara",
    title: "Majibu wazi kabla ya kujenga kifurushi chako cha ushahidi.",
    intro: "InterviewThread inafanya nini leo, nini kinasalia chini ya udhibiti wako, na mipaka ya sasa.",
    items: [
      { question: "Je, InterviewThread itatunga mafanikio yangu?", answer: "Hapana. Kila pendekezo lazima liunganishwe na ushahidi unaotoa. Kisicho na ushahidi kitaendelea kuonekana kama pengo halisi." },
      { question: "Nahitaji nini ili kuanza?", answer: "Wasifu halisi mmoja na maelezo halisi ya kazi yanatosha. Tarehe ya usaili au hatua ya ombi huongeza ubora wa mpango." },
      { question: "Je, matokeo ya ulinganisho ni alama ya ATS?", answer: "Hapana. Huonyesha ushahidi imara, wa sehemu au unaokosekana kwa kila hitaji muhimu badala ya kudai alama moja ya ATS." },
      { question: "Je, nahitaji akaunti?", answer: "" },
      { question: "Ni nyaraka zipi ninaweza kuleta na je ni za faragha?", answer: "PDF, DOCX, PPTX, XLSX, maandishi na OpenDocument za kawaida huchakatwa kwenye kivinjari kwa chaguo-msingi. Skani au miundo ya zamani inaweza kuhitaji OCR au ubadilishaji." },
      { question: "Je, InterviewThread hutuma maombi kiotomatiki?", answer: "Hapana. Toleo la umma halitumii ombi kwa niaba yako. Unakagua na kudhibiti kila hatua." },
      { question: "Naweza kuitumia duniani kote na kwa lugha yangu?", answer: "Kiolesura kinaunga mkono lugha 40 na vichujio vya kimataifa. Ufikaji wa moja kwa moja hutegemea vyanzo vilivyoidhinishwa katika kila eneo." },
    ],
  },
  fa: {
    eyebrow: "پرسش‌های متداول",
    title: "پاسخ‌های روشن پیش از ساخت بسته شواهد.",
    intro: "InterviewThread امروز چه می‌کند، چه چیزهایی در کنترل شماست و محدودیت‌های فعلی چیست.",
    items: [
      { question: "آیا InterviewThread دستاوردی برای من می‌سازد؟", answer: "خیر. هر پیشنهاد باید به مدرکی که شما ارائه می‌کنید متصل باشد. موارد بدون مدرک به‌عنوان شکاف واقعی دیده می‌شوند." },
      { question: "برای شروع به چه چیزی نیاز دارم؟", answer: "یک رزومه واقعی و یک شرح شغل واقعی کافی است. تاریخ مصاحبه یا مرحله درخواست، برنامه را مفیدتر می‌کند." },
      { question: "آیا نتیجه تطبیق همان امتیاز ATS است؟", answer: "خیر. به‌جای ادعای یک امتیاز عمومی، برای هر نیاز مهم شواهد قوی، جزئی یا مفقود را نشان می‌دهد." },
      { question: "آیا به حساب نیاز دارم؟", answer: "" },
      { question: "چه اسنادی را می‌توان وارد کرد و آیا خصوصی می‌مانند؟", answer: "فایل‌های رایج PDF، DOCX، PPTX، XLSX، متن و OpenDocument به‌طور پیش‌فرض در مرورگر پردازش می‌شوند. اسکن‌ها یا قالب‌های قدیمی ممکن است به OCR یا تبدیل نیاز داشته باشند." },
      { question: "آیا InterviewThread خودکار درخواست می‌فرستد؟", answer: "خیر. نسخه عمومی هیچ درخواست شغلی را به‌جای شما ارسال نمی‌کند. هر اقدام زیر نظر شماست." },
      { question: "آیا می‌توانم در سراسر جهان و به زبان خودم استفاده کنم؟", answer: "رابط از ۴۰ زبان و فیلترهای جهانی پشتیبانی می‌کند. پوشش زنده به منابع تأییدشده هر منطقه بستگی دارد." },
    ],
  },
} satisfies Record<LocaleCode, FaqCopy>;

export function faqCopyFor(locale: LocaleCode): FaqCopy {
  const copy = faqCopy[locale];
  return {
    ...copy,
    items: [
      ...copy.items.map((item, index) =>
        index === 1
          ? {
              ...item,
              answer: `${item.answer} ${optionalCareerSourceCopy[locale].note}`,
            }
          : index === 3
            ? { ...item, answer: accountIntroCopyFor(locale).description }
            : item,
      ),
      speechPrivacyFaqCopy[locale],
      voiceAnswerPrivacyFaqCopy[locale],
    ],
  };
}

export function optionalCareerSourceCopyFor(locale: LocaleCode) {
  return optionalCareerSourceCopy[locale];
}
