import type { LocaleCode } from "./i18n";

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
  skipSignIn: string;
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

const accountIntroCopy = {
  en: { title: "Keep your interview preparation in one place.", description: "Sign in to save your evidence map, interview stories, and practice progress. Or continue without an account.", skipSignIn: "Try it without signing in" },
  ja: { title: "面接準備をひとつの場所にまとめましょう。", description: "サインインすると、証拠マップ、面接ストーリー、練習の進捗を保存できます。アカウントなしでも続けられます。", skipSignIn: "サインインせずに試す" },
  ko: { title: "면접 준비를 한곳에서 관리하세요.", description: "로그인하면 증거 맵, 면접 스토리, 연습 진행 상황을 저장할 수 있습니다. 계정 없이도 계속할 수 있습니다.", skipSignIn: "로그인 없이 체험하기" },
  "zh-CN": { title: "把面试准备集中在一个地方。", description: "登录后可保存证据地图、面试故事和练习进度。也可以不登录直接继续。", skipSignIn: "不登录，直接试用" },
  "zh-TW": { title: "將面試準備集中在同一個地方。", description: "登入後可保存證據地圖、面試故事與練習進度；也可以不登入直接繼續。", skipSignIn: "不登入，直接試用" },
  es: { title: "Mantén tu preparación para entrevistas en un solo lugar.", description: "Inicia sesión para guardar tu mapa de evidencias, tus historias y tu progreso. También puedes continuar sin una cuenta.", skipSignIn: "Probar sin iniciar sesión" },
  fr: { title: "Regroupez votre préparation aux entretiens au même endroit.", description: "Connectez-vous pour enregistrer votre carte de preuves, vos récits et vos progrès. Vous pouvez aussi continuer sans compte.", skipSignIn: "Essayer sans se connecter" },
  de: { title: "Halte deine Interviewvorbereitung an einem Ort zusammen.", description: "Melde dich an, um Evidenzkarte, Interviewgeschichten und Übungsfortschritt zu speichern. Du kannst auch ohne Konto fortfahren.", skipSignIn: "Ohne Anmeldung ausprobieren" },
  "pt-BR": { title: "Mantenha sua preparação para entrevistas em um só lugar.", description: "Entre para salvar seu mapa de evidências, suas histórias e seu progresso. Você também pode continuar sem uma conta.", skipSignIn: "Experimentar sem entrar" },
  it: { title: "Tieni la preparazione ai colloqui in un unico posto.", description: "Accedi per salvare la mappa delle prove, le storie e i progressi. Puoi anche continuare senza account.", skipSignIn: "Prova senza accedere" },
  nl: { title: "Houd je sollicitatievoorbereiding op één plek.", description: "Log in om je bewijskaart, verhalen en oefenvoortgang te bewaren. Je kunt ook zonder account doorgaan.", skipSignIn: "Proberen zonder inloggen" },
  pl: { title: "Przygotowanie do rozmowy w jednym miejscu.", description: "Zaloguj się, aby zapisać mapę dowodów, historie i postępy w ćwiczeniach. Możesz też kontynuować bez konta.", skipSignIn: "Wypróbuj bez logowania" },
  tr: { title: "Mülakat hazırlığını tek yerde tut.", description: "Kanıt haritanı, hikâyelerini ve pratik ilerlemeni kaydetmek için giriş yap. Hesap olmadan da devam edebilirsin.", skipSignIn: "Giriş yapmadan dene" },
  ru: { title: "Храните всю подготовку к собеседованию в одном месте.", description: "Войдите, чтобы сохранять карту доказательств, истории и прогресс подготовки. Можно продолжить и без аккаунта.", skipSignIn: "Попробовать без входа" },
  uk: { title: "Зберігайте всю підготовку до співбесіди в одному місці.", description: "Увійдіть, щоб зберігати карту доказів, історії та прогрес. Можна продовжити й без облікового запису.", skipSignIn: "Спробувати без входу" },
  ar: { title: "اجمع تحضيرك للمقابلة في مكان واحد.", description: "سجّل الدخول لحفظ خريطة الأدلة وقصص المقابلة وتقدم التدريب. أو تابع من دون حساب.", skipSignIn: "التجربة دون تسجيل الدخول" },
  he: { title: "שמרו את ההכנה לראיון במקום אחד.", description: "התחברו כדי לשמור את מפת הראיות, הסיפורים והתקדמות התרגול. אפשר גם להמשיך ללא חשבון.", skipSignIn: "נסו ללא התחברות" },
  hi: { title: "अपनी इंटरव्यू तैयारी एक ही जगह रखें।", description: "अपने एविडेंस मैप, कहानियाँ और अभ्यास की प्रगति सेव करने के लिए साइन इन करें। आप बिना खाते के भी जारी रख सकते हैं।", skipSignIn: "बिना साइन इन किए आज़माएँ" },
  bn: { title: "আপনার সাক্ষাৎকারের প্রস্তুতি এক জায়গায় রাখুন।", description: "প্রমাণের মানচিত্র, গল্প ও অনুশীলনের অগ্রগতি সংরক্ষণ করতে সাইন ইন করুন। অ্যাকাউন্ট ছাড়াও চালিয়ে যেতে পারেন।", skipSignIn: "সাইন ইন ছাড়া চেষ্টা করুন" },
  ur: { title: "اپنی انٹرویو تیاری ایک جگہ رکھیں۔", description: "اپنا ثبوتی نقشہ، کہانیاں اور مشق کی پیش رفت محفوظ کرنے کے لیے سائن ان کریں۔ اکاؤنٹ کے بغیر بھی جاری رہ سکتے ہیں۔", skipSignIn: "سائن ان کیے بغیر آزمائیں" },
  id: { title: "Simpan persiapan wawancara di satu tempat.", description: "Masuk untuk menyimpan peta bukti, cerita, dan progres latihan. Anda juga dapat melanjutkan tanpa akun.", skipSignIn: "Coba tanpa masuk" },
  ms: { title: "Simpan persediaan temu duga anda di satu tempat.", description: "Log masuk untuk menyimpan peta bukti, cerita dan kemajuan latihan. Anda juga boleh meneruskan tanpa akaun.", skipSignIn: "Cuba tanpa log masuk" },
  th: { title: "เก็บการเตรียมสัมภาษณ์ไว้ในที่เดียว", description: "ลงชื่อเข้าใช้เพื่อบันทึกแผนที่หลักฐาน เรื่องราว และความคืบหน้าในการฝึก หรือใช้งานต่อโดยไม่ต้องมีบัญชี", skipSignIn: "ทดลองโดยไม่ลงชื่อเข้าใช้" },
  vi: { title: "Giữ mọi nội dung chuẩn bị phỏng vấn ở một nơi.", description: "Đăng nhập để lưu bản đồ bằng chứng, câu chuyện và tiến độ luyện tập. Bạn cũng có thể tiếp tục mà không cần tài khoản.", skipSignIn: "Dùng thử không cần đăng nhập" },
  fil: { title: "Panatilihin sa iisang lugar ang paghahanda mo sa interview.", description: "Mag-sign in para i-save ang evidence map, mga kuwento, at progreso sa practice. Maaari ka ring magpatuloy nang walang account.", skipSignIn: "Subukan nang hindi nagsa-sign in" },
  sv: { title: "Samla dina intervjuförberedelser på ett ställe.", description: "Logga in för att spara din beviskarta, dina berättelser och dina framsteg. Du kan också fortsätta utan konto.", skipSignIn: "Prova utan att logga in" },
  no: { title: "Samle intervjuforberedelsene på ett sted.", description: "Logg inn for å lagre beviskartet, historiene og fremdriften. Du kan også fortsette uten konto.", skipSignIn: "Prøv uten å logge inn" },
  da: { title: "Saml din interviewforberedelse ét sted.", description: "Log ind for at gemme dit evidenskort, dine historier og din fremgang. Du kan også fortsætte uden en konto.", skipSignIn: "Prøv uden at logge ind" },
  fi: { title: "Pidä haastatteluun valmistautuminen yhdessä paikassa.", description: "Kirjaudu sisään tallentaaksesi näyttökartan, tarinat ja harjoittelun edistymisen. Voit jatkaa myös ilman tiliä.", skipSignIn: "Kokeile kirjautumatta" },
  cs: { title: "Mějte přípravu na pohovor na jednom místě.", description: "Přihlaste se a uložte si mapu důkazů, příběhy a pokrok v procvičování. Můžete pokračovat i bez účtu.", skipSignIn: "Vyzkoušet bez přihlášení" },
  sk: { title: "Majte prípravu na pohovor na jednom mieste.", description: "Prihláste sa a uložte si mapu dôkazov, príbehy a pokrok v precvičovaní. Môžete pokračovať aj bez účtu.", skipSignIn: "Vyskúšať bez prihlásenia" },
  hu: { title: "Tartsd egy helyen az interjúfelkészülésedet.", description: "Jelentkezz be a bizonyítéktérkép, a történetek és a gyakorlási eredmények mentéséhez. Fiók nélkül is folytathatod.", skipSignIn: "Kipróbálás bejelentkezés nélkül" },
  ro: { title: "Păstrează pregătirea pentru interviu într-un singur loc.", description: "Conectează-te pentru a salva harta dovezilor, poveștile și progresul. Poți continua și fără cont.", skipSignIn: "Încearcă fără autentificare" },
  el: { title: "Κρατήστε την προετοιμασία για τη συνέντευξη σε ένα μέρος.", description: "Συνδεθείτε για να αποθηκεύσετε τον χάρτη τεκμηρίων, τις ιστορίες και την πρόοδό σας. Μπορείτε να συνεχίσετε και χωρίς λογαριασμό.", skipSignIn: "Δοκιμή χωρίς σύνδεση" },
  bg: { title: "Поддържайте подготовката си за интервю на едно място.", description: "Влезте, за да запазите картата на доказателствата, историите и напредъка си. Можете да продължите и без профил.", skipSignIn: "Опитайте без вход" },
  hr: { title: "Držite pripremu za razgovor na jednom mjestu.", description: "Prijavite se kako biste spremili kartu dokaza, priče i napredak. Možete nastaviti i bez računa.", skipSignIn: "Isprobaj bez prijave" },
  sr: { title: "Држите припрему за интервју на једном месту.", description: "Пријавите се да сачувате мапу доказа, приче и напредак. Можете наставити и без налога.", skipSignIn: "Испробај без пријаве" },
  sl: { title: "Pripravo na razgovor imejte na enem mestu.", description: "Prijavite se, da shranite zemljevid dokazov, zgodbe in napredek. Nadaljujete lahko tudi brez računa.", skipSignIn: "Preizkusi brez prijave" },
  sw: { title: "Weka maandalizi yako ya usaili mahali pamoja.", description: "Ingia ili kuhifadhi ramani ya ushahidi, hadithi na maendeleo ya mazoezi. Unaweza pia kuendelea bila akaunti.", skipSignIn: "Jaribu bila kuingia" },
  fa: { title: "آمادگی مصاحبه را در یک جا نگه دارید.", description: "برای ذخیره نقشه شواهد، داستان‌ها و روند تمرین وارد شوید. بدون حساب هم می‌توانید ادامه دهید.", skipSignIn: "امتحان بدون ورود" },
} satisfies Record<LocaleCode, AccountIntroCopy>;

const freeAccessNotice = {
  en: "All features are free and open source.",
  ja: "すべての機能は無料でオープンソースです。",
  ko: "모든 기능은 무료이며 오픈 소스입니다.",
  "zh-CN": "所有功能均免费开源。",
  "zh-TW": "所有功能皆免費開源。",
  es: "Todas las funciones son gratuitas y de código abierto.",
  fr: "Toutes les fonctionnalités sont gratuites et open source.",
  de: "Alle Funktionen sind kostenlos und Open Source.",
  "pt-BR": "Todos os recursos são gratuitos e de código aberto.",
  it: "Tutte le funzionalità sono gratuite e open source.",
  nl: "Alle functies zijn gratis en open source.",
  pl: "Wszystkie funkcje są bezpłatne i open source.",
  tr: "Tüm özellikler ücretsiz ve açık kaynaklıdır.",
  ru: "Все функции бесплатны и имеют открытый исходный код.",
  uk: "Усі функції безкоштовні та мають відкритий код.",
  ar: "جميع الميزات مجانية ومفتوحة المصدر.",
  he: "כל התכונות חינמיות ובקוד פתוח.",
  hi: "सभी सुविधाएँ निःशुल्क और ओपन सोर्स हैं।",
  bn: "সব ফিচার বিনামূল্যে ও ওপেন সোর্স।",
  ur: "تمام خصوصیات مفت اور اوپن سورس ہیں۔",
  id: "Semua fitur gratis dan bersumber terbuka.",
  ms: "Semua ciri adalah percuma dan sumber terbuka.",
  th: "ทุกฟีเจอร์ใช้งานฟรีและเป็นโอเพนซอร์ส",
  vi: "Mọi tính năng đều miễn phí và mã nguồn mở.",
  fil: "Lahat ng feature ay libre at open source.",
  sv: "Alla funktioner är gratis och har öppen källkod.",
  no: "Alle funksjoner er gratis og har åpen kildekode.",
  da: "Alle funktioner er gratis og open source.",
  fi: "Kaikki ominaisuudet ovat ilmaisia ja avointa lähdekoodia.",
  cs: "Všechny funkce jsou zdarma a s otevřeným zdrojovým kódem.",
  sk: "Všetky funkcie sú bezplatné a s otvoreným zdrojovým kódom.",
  hu: "Minden funkció ingyenes és nyílt forráskódú.",
  ro: "Toate funcțiile sunt gratuite și open source.",
  el: "Όλες οι λειτουργίες είναι δωρεάν και ανοικτού κώδικα.",
  bg: "Всички функции са безплатни и с отворен код.",
  hr: "Sve su značajke besplatne i otvorenog koda.",
  sr: "Све функције су бесплатне и отвореног кода.",
  sl: "Vse funkcije so brezplačne in odprtokodne.",
  sw: "Vipengele vyote ni vya bure na vya chanzo huria.",
  fa: "همه قابلیت‌ها رایگان و متن‌باز هستند.",
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
  return { ...accountCopy[locale], noCharge: freeAccessNotice[locale] };
}

export function accountIntroCopyFor(locale: LocaleCode): AccountIntroCopy {
  return accountIntroCopy[locale];
}

export function openSourceLabelFor(locale: LocaleCode) {
  return openSourceLabel[locale];
}
