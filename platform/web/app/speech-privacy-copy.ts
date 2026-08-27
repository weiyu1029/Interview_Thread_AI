import type { LocaleCode } from "./i18n";

export const CLOUD_READ_ALOUD_CONSENT_KEY =
  "interviewthread-cloud-read-aloud-v1";

const CLOUD_READ_ALOUD_NOTICE = {
  en: "Auto-read sends only the current question and selected language to ElevenLabs. If unavailable, Azure Speech is used. Both providers may retain request data under their policies.",
  ja: "自動読み上げでは、現在の質問文と選択した言語だけを ElevenLabs に送信します。利用できない場合は Azure Speech を使用します。両社は各ポリシーに基づきリクエストデータを保持する場合があります。",
  ko: "자동 읽기는 현재 질문과 선택한 언어만 ElevenLabs로 전송합니다. 사용할 수 없으면 Azure Speech를 사용합니다. 두 제공업체는 각 정책에 따라 요청 데이터를 보관할 수 있습니다.",
  "zh-CN": "自动朗读只会把当前问题和所选语言发送给 ElevenLabs；若无法使用，则改用 Azure Speech。两家服务商都可能依其政策保留请求资料。",
  "zh-TW": "自動朗讀只會把目前問題與所選語言傳送至 ElevenLabs；若無法使用，則改用 Azure Speech。兩家服務商都可能依其政策保留請求資料。",
  es: "La lectura automática solo envía la pregunta actual y el idioma seleccionado a ElevenLabs. Si no está disponible, se usa Azure Speech. Ambos proveedores pueden conservar datos de la solicitud según sus políticas.",
  fr: "La lecture automatique envoie uniquement la question actuelle et la langue choisie à ElevenLabs. En cas d’indisponibilité, Azure Speech est utilisé. Les deux fournisseurs peuvent conserver des données de requête selon leurs politiques.",
  de: "Beim automatischen Vorlesen werden nur die aktuelle Frage und die gewählte Sprache an ElevenLabs gesendet. Ist der Dienst nicht verfügbar, wird Azure Speech verwendet. Beide Anbieter können Anfragedaten gemäß ihren Richtlinien speichern.",
  "pt-BR": "A leitura automática envia somente a pergunta atual e o idioma selecionado à ElevenLabs. Se ela não estiver disponível, o Azure Speech será usado. Ambos os provedores podem reter dados da solicitação conforme suas políticas.",
  it: "La lettura automatica invia a ElevenLabs solo la domanda corrente e la lingua selezionata. Se non è disponibile, viene usato Azure Speech. Entrambi i fornitori possono conservare i dati della richiesta secondo le proprie politiche.",
  nl: "Automatisch voorlezen stuurt alleen de huidige vraag en de gekozen taal naar ElevenLabs. Als die dienst niet beschikbaar is, wordt Azure Speech gebruikt. Beide aanbieders kunnen aanvraaggegevens volgens hun beleid bewaren.",
  pl: "Automatyczne odczytywanie wysyła do ElevenLabs wyłącznie bieżące pytanie i wybrany język. Jeśli usługa jest niedostępna, używany jest Azure Speech. Obaj dostawcy mogą przechowywać dane żądania zgodnie ze swoimi zasadami.",
  tr: "Otomatik okuma yalnızca mevcut soruyu ve seçilen dili ElevenLabs’e gönderir. Kullanılamazsa Azure Speech kullanılır. Her iki sağlayıcı da istek verilerini kendi politikalarına göre saklayabilir.",
  ru: "Авточтение отправляет в ElevenLabs только текущий вопрос и выбранный язык. Если сервис недоступен, используется Azure Speech. Оба поставщика могут хранить данные запроса согласно своим политикам.",
  uk: "Автоматичне озвучення надсилає до ElevenLabs лише поточне запитання й вибрану мову. Якщо сервіс недоступний, використовується Azure Speech. Обидва постачальники можуть зберігати дані запиту відповідно до своїх політик.",
  ar: "ترسل القراءة التلقائية السؤال الحالي واللغة المحددة فقط إلى ElevenLabs. وإذا لم تكن متاحة، تُستخدم Azure Speech. وقد يحتفظ المزودان ببيانات الطلب وفق سياساتهما.",
  he: "הקראה אוטומטית שולחת ל‑ElevenLabs רק את השאלה הנוכחית ואת השפה שנבחרה. אם השירות אינו זמין, נעשה שימוש ב‑Azure Speech. שני הספקים עשויים לשמור נתוני בקשה בהתאם למדיניות שלהם.",
  hi: "ऑटो-रीड केवल मौजूदा प्रश्न और चुनी गई भाषा ElevenLabs को भेजता है। उपलब्ध न होने पर Azure Speech का उपयोग होता है। दोनों प्रदाता अपनी नीतियों के अनुसार अनुरोध डेटा रख सकते हैं।",
  bn: "স্বয়ংক্রিয় পাঠ শুধু বর্তমান প্রশ্ন ও নির্বাচিত ভাষা ElevenLabs-এ পাঠায়। এটি না পাওয়া গেলে Azure Speech ব্যবহার করা হয়। উভয় সেবাদাতা তাদের নীতি অনুযায়ী অনুরোধের তথ্য সংরক্ষণ করতে পারে।",
  ur: "خودکار پڑھائی صرف موجودہ سوال اور منتخب زبان ElevenLabs کو بھیجتی ہے۔ دستیاب نہ ہونے پر Azure Speech استعمال ہوتا ہے۔ دونوں فراہم کنندگان اپنی پالیسیوں کے مطابق درخواست کا ڈیٹا محفوظ کر سکتے ہیں۔",
  id: "Baca otomatis hanya mengirim pertanyaan saat ini dan bahasa pilihan ke ElevenLabs. Jika tidak tersedia, Azure Speech digunakan. Kedua penyedia dapat menyimpan data permintaan sesuai kebijakan mereka.",
  ms: "Bacaan automatik hanya menghantar soalan semasa dan bahasa pilihan kepada ElevenLabs. Jika tidak tersedia, Azure Speech digunakan. Kedua-dua penyedia mungkin menyimpan data permintaan mengikut dasar mereka.",
  th: "การอ่านอัตโนมัติจะส่งเฉพาะคำถามปัจจุบันและภาษาที่เลือกไปยัง ElevenLabs หากใช้ไม่ได้ ระบบจะใช้ Azure Speech ผู้ให้บริการทั้งสองอาจเก็บข้อมูลคำขอตามนโยบายของตน",
  vi: "Tự động đọc chỉ gửi câu hỏi hiện tại và ngôn ngữ đã chọn đến ElevenLabs. Nếu dịch vụ không khả dụng, Azure Speech sẽ được dùng. Cả hai nhà cung cấp có thể lưu dữ liệu yêu cầu theo chính sách của họ.",
  fil: "Ipinapadala lang ng auto-read ang kasalukuyang tanong at napiling wika sa ElevenLabs. Kapag hindi ito available, Azure Speech ang gagamitin. Maaaring panatilihin ng dalawang provider ang request data ayon sa kanilang mga patakaran.",
  sv: "Automatisk uppläsning skickar bara den aktuella frågan och valt språk till ElevenLabs. Om tjänsten inte är tillgänglig används Azure Speech. Båda leverantörerna kan spara begäransdata enligt sina policyer.",
  no: "Automatisk opplesing sender bare det gjeldende spørsmålet og valgt språk til ElevenLabs. Hvis tjenesten ikke er tilgjengelig, brukes Azure Speech. Begge leverandørene kan lagre forespørselsdata i henhold til sine retningslinjer.",
  da: "Automatisk oplæsning sender kun det aktuelle spørgsmål og det valgte sprog til ElevenLabs. Hvis tjenesten ikke er tilgængelig, bruges Azure Speech. Begge udbydere kan gemme anmodningsdata efter deres politikker.",
  fi: "Automaattinen luku lähettää ElevenLabsille vain nykyisen kysymyksen ja valitun kielen. Jos palvelu ei ole käytettävissä, käytetään Azure Speechiä. Molemmat palveluntarjoajat voivat säilyttää pyyntötietoja omien käytäntöjensä mukaisesti.",
  cs: "Automatické čtení odesílá do ElevenLabs pouze aktuální otázku a zvolený jazyk. Pokud služba není dostupná, použije se Azure Speech. Oba poskytovatelé mohou údaje o požadavku uchovávat podle svých zásad.",
  sk: "Automatické čítanie odosiela do ElevenLabs iba aktuálnu otázku a zvolený jazyk. Ak služba nie je dostupná, použije sa Azure Speech. Obaja poskytovatelia môžu údaje o požiadavke uchovávať podľa svojich zásad.",
  hu: "Az automatikus felolvasás csak az aktuális kérdést és a kiválasztott nyelvet küldi el az ElevenLabsnek. Ha nem érhető el, az Azure Speech használatos. Mindkét szolgáltató megőrizheti a kérés adatait a saját szabályzata szerint.",
  ro: "Citirea automată trimite către ElevenLabs numai întrebarea curentă și limba selectată. Dacă serviciul nu este disponibil, se folosește Azure Speech. Ambii furnizori pot păstra datele solicitării conform politicilor lor.",
  el: "Η αυτόματη ανάγνωση στέλνει στο ElevenLabs μόνο την τρέχουσα ερώτηση και την επιλεγμένη γλώσσα. Αν δεν είναι διαθέσιμο, χρησιμοποιείται το Azure Speech. Και οι δύο πάροχοι ενδέχεται να διατηρούν δεδομένα αιτήματος σύμφωνα με τις πολιτικές τους.",
  bg: "Автоматичното прочитане изпраща до ElevenLabs само текущия въпрос и избрания език. Ако услугата не е налична, се използва Azure Speech. И двата доставчика могат да пазят данни за заявката според своите правила.",
  hr: "Automatsko čitanje šalje ElevenLabsu samo trenutačno pitanje i odabrani jezik. Ako usluga nije dostupna, koristi se Azure Speech. Oba pružatelja mogu čuvati podatke zahtjeva prema svojim pravilima.",
  sr: "Аутоматско читање шаље ElevenLabs-у само тренутно питање и изабрани језик. Ако услуга није доступна, користи се Azure Speech. Оба добављача могу чувати податке захтева у складу са својим правилима.",
  sl: "Samodejno branje pošlje ElevenLabs samo trenutno vprašanje in izbrani jezik. Če storitev ni na voljo, se uporabi Azure Speech. Oba ponudnika lahko podatke zahteve hranita skladno s svojimi pravilniki.",
  sw: "Usomaji wa kiotomatiki hutuma swali la sasa na lugha iliyochaguliwa pekee kwa ElevenLabs. Ikiwa haipatikani, Azure Speech hutumika. Watoa huduma wote wawili wanaweza kuhifadhi data ya ombi kulingana na sera zao.",
  fa: "خواندن خودکار فقط پرسش فعلی و زبان انتخاب‌شده را به ElevenLabs می‌فرستد. اگر در دسترس نباشد، Azure Speech استفاده می‌شود. هر دو ارائه‌دهنده ممکن است داده‌های درخواست را طبق سیاست‌های خود نگه دارند.",
} satisfies Record<LocaleCode, string>;

export function cloudReadAloudNoticeFor(locale: LocaleCode) {
  return CLOUD_READ_ALOUD_NOTICE[locale] ?? CLOUD_READ_ALOUD_NOTICE.en;
}
