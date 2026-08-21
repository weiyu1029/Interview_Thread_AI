import type { LocaleCode } from "./i18n";
import { guestAccessCopyFor } from "./guest-copy.ts";

export type AccountCopy = {
  account: string;
  signIn: string;
  signOut: string;
  selected: string;
  noCharge: string;
  privacy: string;
};

export type AccountIntroCopy = {
  title: string;
  description: string;
  accessCta: string;
};

const accountCopy = {
  en: { account: "Account", signIn: "Continue securely", signOut: "Sign out", selected: "Selected plan", noCharge: "Billing is not enabled. No charge today.", privacy: "No immigration documents or payment details are requested." },
  ja: { account: "アカウント", signIn: "安全に続ける", signOut: "ログアウト", selected: "選択したプラン", noCharge: "請求はまだ有効ではありません。本日の請求はありません。", privacy: "移民関連書類や支払い情報は求めません。" },
  ko: { account: "계정", signIn: "안전하게 계속", signOut: "로그아웃", selected: "선택한 요금제", noCharge: "결제가 아직 활성화되지 않았습니다. 오늘 청구되지 않습니다.", privacy: "이민 서류나 결제 정보를 요청하지 않습니다." },
  "zh-CN": { account: "账户", signIn: "安全继续", signOut: "退出登录", selected: "已选方案", noCharge: "付款尚未启用，今天不会收费。", privacy: "我们不会索取移民文件或付款资料。" },
  "zh-TW": { account: "帳號", signIn: "安全地繼續", signOut: "登出", selected: "已選方案", noCharge: "付款尚未啟用，今天不會收費。", privacy: "我們不會要求移民文件或付款資料。" },
  es: { account: "Cuenta", signIn: "Continuar de forma segura", signOut: "Cerrar sesión", selected: "Plan seleccionado", noCharge: "La facturación no está habilitada. Hoy no se realizará ningún cargo.", privacy: "No solicitamos documentos migratorios ni datos de pago." },
  fr: { account: "Compte", signIn: "Continuer en toute sécurité", signOut: "Se déconnecter", selected: "Forfait sélectionné", noCharge: "La facturation n’est pas activée. Aucun débit aujourd’hui.", privacy: "Aucun document d’immigration ni moyen de paiement n’est demandé." },
  de: { account: "Konto", signIn: "Sicher fortfahren", signOut: "Abmelden", selected: "Gewählter Tarif", noCharge: "Die Abrechnung ist nicht aktiviert. Heute erfolgt keine Belastung.", privacy: "Wir fragen weder Einwanderungsunterlagen noch Zahlungsdaten ab." },
  "pt-BR": { account: "Conta", signIn: "Continuar com segurança", signOut: "Sair", selected: "Plano selecionado", noCharge: "A cobrança não está ativada. Nenhum valor será cobrado hoje.", privacy: "Não solicitamos documentos de imigração nem dados de pagamento." },
  it: { account: "Account", signIn: "Continua in sicurezza", signOut: "Esci", selected: "Piano selezionato", noCharge: "La fatturazione non è attiva. Oggi non verrà effettuato alcun addebito.", privacy: "Non richiediamo documenti d’immigrazione né dati di pagamento." },
  nl: { account: "Account", signIn: "Veilig doorgaan", signOut: "Uitloggen", selected: "Gekozen abonnement", noCharge: "Facturering is niet ingeschakeld. Vandaag worden geen kosten berekend.", privacy: "We vragen niet om immigratiedocumenten of betaalgegevens." },
  pl: { account: "Konto", signIn: "Kontynuuj bezpiecznie", signOut: "Wyloguj się", selected: "Wybrany plan", noCharge: "Płatności nie są włączone. Dziś nie zostanie pobrana opłata.", privacy: "Nie prosimy o dokumenty imigracyjne ani dane płatnicze." },
  tr: { account: "Hesap", signIn: "Güvenle devam et", signOut: "Çıkış yap", selected: "Seçilen plan", noCharge: "Faturalandırma etkin değil. Bugün ücret alınmayacak.", privacy: "Göçmenlik belgesi veya ödeme bilgisi istemiyoruz." },
  ru: { account: "Аккаунт", signIn: "Продолжить безопасно", signOut: "Выйти", selected: "Выбранный план", noCharge: "Оплата пока не включена. Сегодня списаний не будет.", privacy: "Мы не запрашиваем иммиграционные документы или платёжные данные." },
  uk: { account: "Обліковий запис", signIn: "Продовжити безпечно", signOut: "Вийти", selected: "Вибраний план", noCharge: "Оплату ще не ввімкнено. Сьогодні списань не буде.", privacy: "Ми не запитуємо імміграційні документи чи платіжні дані." },
  ar: { account: "الحساب", signIn: "المتابعة بأمان", signOut: "تسجيل الخروج", selected: "الخطة المختارة", noCharge: "الفوترة غير مفعّلة. لن يتم تحصيل أي رسوم اليوم.", privacy: "لا نطلب مستندات الهجرة أو بيانات الدفع." },
  he: { account: "חשבון", signIn: "המשך באופן מאובטח", signOut: "יציאה", selected: "התוכנית שנבחרה", noCharge: "החיוב אינו פעיל. לא יתבצע חיוב היום.", privacy: "איננו מבקשים מסמכי הגירה או פרטי תשלום." },
  hi: { account: "खाता", signIn: "सुरक्षित रूप से जारी रखें", signOut: "साइन आउट", selected: "चुनी गई योजना", noCharge: "बिलिंग चालू नहीं है। आज कोई शुल्क नहीं लगेगा।", privacy: "हम आव्रजन दस्तावेज़ या भुगतान विवरण नहीं मांगते।" },
  bn: { account: "অ্যাকাউন্ট", signIn: "নিরাপদে চালিয়ে যান", signOut: "সাইন আউট", selected: "নির্বাচিত পরিকল্পনা", noCharge: "বিলিং চালু নেই। আজ কোনো চার্জ হবে না।", privacy: "আমরা অভিবাসন নথি বা পেমেন্টের তথ্য চাই না।" },
  ur: { account: "اکاؤنٹ", signIn: "محفوظ طریقے سے جاری رکھیں", signOut: "سائن آؤট", selected: "منتخب منصوبہ", noCharge: "بلنگ فعال نہیں ہے۔ آج کوئی رقم وصول نہیں کی جائے گی۔", privacy: "ہم امیگریشن دستاویزات یا ادائیگی کی تفصیلات نہیں مانگتے۔" },
  id: { account: "Akun", signIn: "Lanjutkan dengan aman", signOut: "Keluar", selected: "Paket yang dipilih", noCharge: "Penagihan belum diaktifkan. Tidak ada biaya hari ini.", privacy: "Kami tidak meminta dokumen imigrasi atau detail pembayaran." },
  ms: { account: "Akaun", signIn: "Teruskan dengan selamat", signOut: "Log keluar", selected: "Pelan dipilih", noCharge: "Pengebilan belum diaktifkan. Tiada caj hari ini.", privacy: "Kami tidak meminta dokumen imigresen atau butiran pembayaran." },
  th: { account: "บัญชี", signIn: "ดำเนินการต่ออย่างปลอดภัย", signOut: "ออกจากระบบ", selected: "แผนที่เลือก", noCharge: "ยังไม่เปิดใช้การเรียกเก็บเงิน วันนี้ไม่มีค่าใช้จ่าย", privacy: "เราไม่ขอเอกสารตรวจคนเข้าเมืองหรือข้อมูลการชำระเงิน" },
  vi: { account: "Tài khoản", signIn: "Tiếp tục an toàn", signOut: "Đăng xuất", selected: "Gói đã chọn", noCharge: "Thanh toán chưa được bật. Hôm nay không phát sinh phí.", privacy: "Chúng tôi không yêu cầu giấy tờ nhập cư hoặc thông tin thanh toán." },
  fil: { account: "Account", signIn: "Magpatuloy nang ligtas", signOut: "Mag-sign out", selected: "Napiling plano", noCharge: "Hindi pa naka-enable ang billing. Walang sisingilin ngayon.", privacy: "Hindi kami humihingi ng dokumento sa imigrasyon o detalye ng bayad." },
  sv: { account: "Konto", signIn: "Fortsätt säkert", signOut: "Logga ut", selected: "Vald plan", noCharge: "Fakturering är inte aktiverad. Ingen avgift tas ut i dag.", privacy: "Vi begär inga immigrationshandlingar eller betalningsuppgifter." },
  no: { account: "Konto", signIn: "Fortsett sikkert", signOut: "Logg ut", selected: "Valgt abonnement", noCharge: "Fakturering er ikke aktivert. Du belastes ikke i dag.", privacy: "Vi ber ikke om immigrasjonsdokumenter eller betalingsopplysninger." },
  da: { account: "Konto", signIn: "Fortsæt sikkert", signOut: "Log ud", selected: "Valgt abonnement", noCharge: "Fakturering er ikke aktiveret. Du bliver ikke opkrævet i dag.", privacy: "Vi beder ikke om immigrationsdokumenter eller betalingsoplysninger." },
  fi: { account: "Tili", signIn: "Jatka turvallisesti", signOut: "Kirjaudu ulos", selected: "Valittu tilaus", noCharge: "Laskutus ei ole käytössä. Tänään ei veloiteta.", privacy: "Emme pyydä maahanmuuttoasiakirjoja tai maksutietoja." },
  cs: { account: "Účet", signIn: "Pokračovat bezpečně", signOut: "Odhlásit se", selected: "Vybraný tarif", noCharge: "Fakturace není zapnutá. Dnes nebude nic účtováno.", privacy: "Nevyžadujeme imigrační dokumenty ani platební údaje." },
  sk: { account: "Účet", signIn: "Pokračovať bezpečne", signOut: "Odhlásiť sa", selected: "Vybraný plán", noCharge: "Fakturácia nie je zapnutá. Dnes sa nič neúčtuje.", privacy: "Nevyžadujeme imigračné dokumenty ani platobné údaje." },
  hu: { account: "Fiók", signIn: "Folytatás biztonságosan", signOut: "Kijelentkezés", selected: "Kiválasztott csomag", noCharge: "A számlázás nincs bekapcsolva. Ma nem terheljük meg.", privacy: "Nem kérünk bevándorlási dokumentumokat vagy fizetési adatokat." },
  ro: { account: "Cont", signIn: "Continuă în siguranță", signOut: "Deconectare", selected: "Plan selectat", noCharge: "Facturarea nu este activată. Astăzi nu se percepe nicio taxă.", privacy: "Nu solicităm documente de imigrare sau date de plată." },
  el: { account: "Λογαριασμός", signIn: "Συνέχεια με ασφάλεια", signOut: "Αποσύνδεση", selected: "Επιλεγμένο πρόγραμμα", noCharge: "Η χρέωση δεν είναι ενεργή. Δεν θα υπάρξει χρέωση σήμερα.", privacy: "Δεν ζητάμε έγγραφα μετανάστευσης ή στοιχεία πληρωμής." },
  bg: { account: "Профил", signIn: "Продължете сигурно", signOut: "Изход", selected: "Избран план", noCharge: "Таксуването не е активирано. Днес няма да бъдете таксувани.", privacy: "Не изискваме имиграционни документи или данни за плащане." },
  hr: { account: "Račun", signIn: "Nastavi sigurno", signOut: "Odjava", selected: "Odabrani plan", noCharge: "Naplata nije omogućena. Danas nema terećenja.", privacy: "Ne tražimo imigracijske dokumente ni podatke za plaćanje." },
  sr: { account: "Налог", signIn: "Настави безбедно", signOut: "Одјава", selected: "Изабрани план", noCharge: "Наплата није омогућена. Данас нема задужења.", privacy: "Не тражимо имиграциона документа нити податке за плаћање." },
  sl: { account: "Račun", signIn: "Nadaljuj varno", signOut: "Odjava", selected: "Izbrani paket", noCharge: "Obračunavanje ni omogočeno. Danes ne bo bremenitve.", privacy: "Ne zahtevamo priseljenskih dokumentov ali podatkov za plačilo." },
  sw: { account: "Akaunti", signIn: "Endelea kwa usalama", signOut: "Ondoka", selected: "Mpango uliochaguliwa", noCharge: "Malipo hayajawashwa. Hakuna ada leo.", privacy: "Hatuombi hati za uhamiaji au maelezo ya malipo." },
  fa: { account: "حساب", signIn: "ادامه امن", signOut: "خروج", selected: "طرح انتخاب‌شده", noCharge: "صورتحساب فعال نیست. امروز هزینه‌ای دریافت نمی‌شود.", privacy: "ما مدارک مهاجرت یا اطلاعات پرداخت درخواست نمی‌کنیم." },
} satisfies Record<LocaleCode, AccountCopy>;

const accountIntroTitle = {
  en: "Keep your interview preparation in one place.",
  ja: "面接準備をひとつの場所にまとめましょう。",
  ko: "면접 준비를 한곳에서 관리하세요.",
  "zh-CN": "把面试准备集中在一个地方。",
  "zh-TW": "將面試準備集中在同一個地方。",
  es: "Mantén tu preparación para entrevistas en un solo lugar.",
  fr: "Regroupez votre préparation aux entretiens au même endroit.",
  de: "Halte deine Interviewvorbereitung an einem Ort zusammen.",
  "pt-BR": "Mantenha sua preparação para entrevistas em um só lugar.",
  it: "Tieni la preparazione ai colloqui in un unico posto.",
  nl: "Houd je sollicitatievoorbereiding op één plek.",
  pl: "Przygotowanie do rozmowy w jednym miejscu.",
  tr: "Mülakat hazırlığını tek yerde tut.",
  ru: "Храните всю подготовку к собеседованию в одном месте.",
  uk: "Зберігайте всю підготовку до співбесіди в одному місці.",
  ar: "اجمع تحضيرك للمقابلة في مكان واحد.",
  he: "שמרו את ההכנה לראיון במקום אחד.",
  hi: "अपनी इंटरव्यू तैयारी एक ही जगह रखें।",
  bn: "আপনার সাক্ষাৎকারের প্রস্তুতি এক জায়গায় রাখুন।",
  ur: "اپنی انٹرویو تیاری ایک جگہ رکھیں۔",
  id: "Simpan persiapan wawancara di satu tempat.",
  ms: "Simpan persediaan temu duga anda di satu tempat.",
  th: "เก็บการเตรียมสัมภาษณ์ไว้ในที่เดียว",
  vi: "Giữ mọi nội dung chuẩn bị phỏng vấn ở một nơi.",
  fil: "Panatilihin sa iisang lugar ang paghahanda mo sa interview.",
  sv: "Samla dina intervjuförberedelser på ett ställe.",
  no: "Samle intervjuforberedelsene på ett sted.",
  da: "Saml din interviewforberedelse ét sted.",
  fi: "Pidä haastatteluun valmistautuminen yhdessä paikassa.",
  cs: "Mějte přípravu na pohovor na jednom místě.",
  sk: "Majte prípravu na pohovor na jednom mieste.",
  hu: "Tartsd egy helyen az interjúfelkészülésedet.",
  ro: "Păstrează pregătirea pentru interviu într-un singur loc.",
  el: "Κρατήστε την προετοιμασία για τη συνέντευξη σε ένα μέρος.",
  bg: "Поддържайте подготовката си за интервю на едно място.",
  hr: "Držite pripremu za razgovor na jednom mjestu.",
  sr: "Држите припрему за интервју на једном месту.",
  sl: "Pripravo na razgovor imejte na enem mestu.",
  sw: "Weka maandalizi yako ya usaili mahali pamoja.",
  fa: "آمادگی مصاحبه را در یک جا نگه دارید.",
} satisfies Record<LocaleCode, string>;

const privateActivityNotice = {
  en: "Only you can see your saved activity. We do not collect anonymous resumes, job descriptions, interview transcripts, or voice recordings.",
  ja: "保存した履歴を閲覧できるのは本人だけです。匿名の履歴書、求人票、面接の文字起こし、音声録音は収集しません。",
  ko: "저장된 활동은 본인만 볼 수 있습니다. 익명 사용자의 이력서, 채용 공고, 면접 기록 또는 음성 녹음은 수집하지 않습니다.",
  "zh-CN": "只有你可以查看已保存的活动。我们不会收集匿名访客的履历、职位描述、面试逐字稿或语音录音。",
  "zh-TW": "只有你可以查看已保存的活動。我們不會收集匿名訪客的履歷、職缺描述、面試逐字稿或語音錄音。",
  es: "Solo tú puedes ver tu actividad guardada. No recopilamos currículums, ofertas, transcripciones ni grabaciones de voz de visitantes anónimos.",
  fr: "Vous seul pouvez voir votre activité enregistrée. Nous ne collectons pas les CV, offres, transcriptions ou enregistrements vocaux des visiteurs anonymes.",
  de: "Nur du kannst deine gespeicherten Aktivitäten sehen. Wir erfassen keine anonymen Lebensläufe, Stellenanzeigen, Interviewtranskripte oder Sprachaufnahmen.",
  "pt-BR": "Só você pode ver sua atividade salva. Não coletamos currículos, vagas, transcrições ou gravações de voz de visitantes anônimos.",
  it: "Solo tu puoi vedere le attività salvate. Non raccogliamo CV, annunci, trascrizioni o registrazioni vocali di visitatori anonimi.",
  nl: "Alleen jij kunt je opgeslagen activiteit zien. We verzamelen geen anonieme cv’s, vacatures, interviewtranscripten of spraakopnamen.",
  pl: "Tylko Ty widzisz zapisaną aktywność. Nie zbieramy anonimowych CV, ofert pracy, transkrypcji rozmów ani nagrań głosu.",
  tr: "Kaydedilen etkinliğini yalnızca sen görebilirsin. Anonim ziyaretçilerin özgeçmişlerini, ilanlarını, görüşme dökümlerini veya ses kayıtlarını toplamayız.",
  ru: "Сохранённые действия видите только вы. Мы не собираем анонимные резюме, вакансии, расшифровки интервью или голосовые записи.",
  uk: "Збережені дії бачите лише ви. Ми не збираємо анонімні резюме, вакансії, розшифровки співбесід або голосові записи.",
  ar: "لا يرى نشاطك المحفوظ سواك. لا نجمع سيراً ذاتية أو أوصاف وظائف أو نصوص مقابلات أو تسجيلات صوتية من الزوار المجهولين.",
  he: "רק אתם יכולים לראות את הפעילות השמורה. איננו אוספים קורות חיים, תיאורי משרה, תמלילי ראיונות או הקלטות קול של מבקרים אנונימיים.",
  hi: "आपकी सेव की गई गतिविधि केवल आपको दिखती है। हम गुमनाम विज़िटर के रिज़्यूमे, जॉब विवरण, इंटरव्यू ट्रांसक्रिप्ट या वॉइस रिकॉर्डिंग एकत्र नहीं करते।",
  bn: "শুধু আপনিই সংরক্ষিত কার্যকলাপ দেখতে পারবেন। আমরা বেনামী দর্শকের জীবনবৃত্তান্ত, চাকরির বিবরণ, সাক্ষাৎকারের প্রতিলিপি বা কণ্ঠ রেকর্ডিং সংগ্রহ করি না।",
  ur: "آپ کی محفوظ سرگرمی صرف آپ دیکھ سکتے ہیں۔ ہم گمنام افراد کے ریزیومے، ملازمت کی تفصیل، انٹرویو متن یا آواز کی ریکارڈنگ جمع نہیں کرتے۔",
  id: "Hanya Anda yang dapat melihat aktivitas tersimpan. Kami tidak mengumpulkan CV, lowongan, transkrip wawancara, atau rekaman suara pengunjung anonim.",
  ms: "Hanya anda boleh melihat aktiviti tersimpan. Kami tidak mengumpul resume, iklan kerja, transkrip temu duga atau rakaman suara pelawat tanpa nama.",
  th: "มีเพียงคุณที่ดูประวัติกิจกรรมที่บันทึกไว้ได้ เราไม่เก็บเรซูเม่ รายละเอียดงาน บทถอดเสียงสัมภาษณ์ หรือเสียงบันทึกของผู้เยี่ยมชมที่ไม่ระบุตัวตน",
  vi: "Chỉ bạn mới xem được hoạt động đã lưu. Chúng tôi không thu thập hồ sơ, tin tuyển dụng, bản ghi phỏng vấn hay bản thu âm của khách ẩn danh.",
  fil: "Ikaw lang ang makakakita ng naka-save na aktibidad. Hindi kami nangongolekta ng resume, job post, transcript, o voice recording ng anonymous na bisita.",
  sv: "Bara du kan se din sparade aktivitet. Vi samlar inte in anonyma cv:n, platsannonser, intervjutranskript eller röstinspelningar.",
  no: "Bare du kan se den lagrede aktiviteten. Vi samler ikke inn anonyme CV-er, stillingsannonser, intervjuutskrifter eller taleopptak.",
  da: "Kun du kan se din gemte aktivitet. Vi indsamler ikke anonyme CV’er, jobopslag, interviewudskrifter eller stemmeoptagelser.",
  fi: "Vain sinä näet tallennetun toimintasi. Emme kerää anonyymejä ansioluetteloita, työpaikkailmoituksia, haastattelulitterointeja tai äänitallenteita.",
  cs: "Uloženou aktivitu vidíte pouze vy. Neshromažďujeme anonymní životopisy, nabídky práce, přepisy pohovorů ani hlasové nahrávky.",
  sk: "Uloženú aktivitu vidíte iba vy. Nezhromažďujeme anonymné životopisy, pracovné ponuky, prepisy pohovorov ani hlasové nahrávky.",
  hu: "A mentett tevékenységet csak te láthatod. Nem gyűjtünk névtelen önéletrajzokat, álláshirdetéseket, interjúleiratokat vagy hangfelvételeket.",
  ro: "Doar tu poți vedea activitatea salvată. Nu colectăm CV-uri, anunțuri, transcrieri sau înregistrări vocale ale vizitatorilor anonimi.",
  el: "Μόνο εσείς βλέπετε την αποθηκευμένη δραστηριότητά σας. Δεν συλλέγουμε ανώνυμα βιογραφικά, αγγελίες, απομαγνητοφωνήσεις ή ηχογραφήσεις.",
  bg: "Само вие виждате запазената си активност. Не събираме анонимни автобиографии, обяви, транскрипции или гласови записи.",
  hr: "Samo vi možete vidjeti spremljenu aktivnost. Ne prikupljamo anonimne životopise, oglase, prijepise razgovora ni glasovne snimke.",
  sr: "Само ви можете видети сачувану активност. Не прикупљамо анонимне биографије, огласе, транскрипте интервјуа или гласовне снимке.",
  sl: "Shranjeno dejavnost lahko vidite samo vi. Ne zbiramo anonimnih življenjepisov, oglasov, prepisov razgovorov ali glasovnih posnetkov.",
  sw: "Ni wewe pekee unayeweza kuona shughuli uliyohifadhi. Hatukusanyi wasifu, maelezo ya kazi, nakala za usaili au rekodi za sauti za wageni wasiojulikana.",
  fa: "فقط شما می‌توانید فعالیت ذخیره‌شده خود را ببینید. ما رزومه، شرح شغل، متن مصاحبه یا ضبط صدای بازدیدکنندگان ناشناس را جمع‌آوری نمی‌کنیم.",
} satisfies Record<LocaleCode, string>;

const openSourceLabel = {
  en: "Open source", ja: "オープンソース", ko: "오픈 소스",
  "zh-CN": "开源", "zh-TW": "開源", es: "Código abierto",
  fr: "Open source", de: "Open Source", "pt-BR": "Código aberto",
  it: "Open source", nl: "Open source", pl: "Open source",
  tr: "Açık kaynak", ru: "Открытый код", uk: "Відкритий код",
  ar: "مفتوح المصدر", he: "קוד פתוח", hi: "ओपन सोर्स",
  bn: "ওপেন সোর্স", ur: "اوپن سورس", id: "Sumber terbuka",
  ms: "Sumber terbuka", th: "โอเพนซอร์ส", vi: "Mã nguồn mở",
  fil: "Open source", sv: "Öppen källkod", no: "Åpen kildekode",
  da: "Open source", fi: "Avoin lähdekoodi", cs: "Otevřený zdrojový kód",
  sk: "Otvorený zdrojový kód", hu: "Nyílt forráskód", ro: "Open source",
  el: "Ανοικτός κώδικας", bg: "Отворен код", hr: "Otvoreni kod",
  sr: "Отворени код", sl: "Odprta koda", sw: "Chanzo huria", fa: "متن‌باز",
} satisfies Record<LocaleCode, string>;

export function accountCopyFor(locale: LocaleCode): AccountCopy {
  return {
    ...accountCopy[locale],
    noCharge: openSourceLabel[locale],
    privacy: privateActivityNotice[locale],
  };
}

export function accountIntroCopyFor(locale: LocaleCode): AccountIntroCopy {
  return {
    title: accountIntroTitle[locale],
    description: guestAccessCopyFor(locale).notice,
    accessCta: accountCopy[locale].signIn,
  };
}

export function openSourceLabelFor(locale: LocaleCode) {
  return openSourceLabel[locale];
}
