import type { LocaleCode } from "./i18n";

export type AccountCopy = {
  account: string;
  signIn: string;
  signOut: string;
  selected: string;
  noCharge: string;
  privacy: string;
};

const accountCopy = {
  en: { account: "Account", signIn: "Continue with ChatGPT", signOut: "Sign out", selected: "Selected plan", noCharge: "Billing is not enabled. No charge today.", privacy: "No immigration documents or payment details are requested." },
  ja: { account: "アカウント", signIn: "ChatGPTで続ける", signOut: "ログアウト", selected: "選択したプラン", noCharge: "請求はまだ有効ではありません。本日の請求はありません。", privacy: "移民関連書類や支払い情報は求めません。" },
  ko: { account: "계정", signIn: "ChatGPT로 계속", signOut: "로그아웃", selected: "선택한 요금제", noCharge: "결제가 아직 활성화되지 않았습니다. 오늘 청구되지 않습니다.", privacy: "이민 서류나 결제 정보를 요청하지 않습니다." },
  "zh-CN": { account: "账户", signIn: "使用 ChatGPT 继续", signOut: "退出登录", selected: "已选方案", noCharge: "付款尚未启用，今天不会收费。", privacy: "我们不会索取移民文件或付款资料。" },
  "zh-TW": { account: "帳號", signIn: "使用 ChatGPT 繼續", signOut: "登出", selected: "已選方案", noCharge: "付款尚未啟用，今天不會收費。", privacy: "我們不會要求移民文件或付款資料。" },
  es: { account: "Cuenta", signIn: "Continuar con ChatGPT", signOut: "Cerrar sesión", selected: "Plan seleccionado", noCharge: "La facturación no está habilitada. Hoy no se realizará ningún cargo.", privacy: "No solicitamos documentos migratorios ni datos de pago." },
  fr: { account: "Compte", signIn: "Continuer avec ChatGPT", signOut: "Se déconnecter", selected: "Forfait sélectionné", noCharge: "La facturation n’est pas activée. Aucun débit aujourd’hui.", privacy: "Aucun document d’immigration ni moyen de paiement n’est demandé." },
  de: { account: "Konto", signIn: "Mit ChatGPT fortfahren", signOut: "Abmelden", selected: "Gewählter Tarif", noCharge: "Die Abrechnung ist nicht aktiviert. Heute erfolgt keine Belastung.", privacy: "Wir fragen weder Einwanderungsunterlagen noch Zahlungsdaten ab." },
  "pt-BR": { account: "Conta", signIn: "Continuar com o ChatGPT", signOut: "Sair", selected: "Plano selecionado", noCharge: "A cobrança não está ativada. Nenhum valor será cobrado hoje.", privacy: "Não solicitamos documentos de imigração nem dados de pagamento." },
  it: { account: "Account", signIn: "Continua con ChatGPT", signOut: "Esci", selected: "Piano selezionato", noCharge: "La fatturazione non è attiva. Oggi non verrà effettuato alcun addebito.", privacy: "Non richiediamo documenti d’immigrazione né dati di pagamento." },
  nl: { account: "Account", signIn: "Doorgaan met ChatGPT", signOut: "Uitloggen", selected: "Gekozen abonnement", noCharge: "Facturering is niet ingeschakeld. Vandaag worden geen kosten berekend.", privacy: "We vragen niet om immigratiedocumenten of betaalgegevens." },
  pl: { account: "Konto", signIn: "Kontynuuj z ChatGPT", signOut: "Wyloguj się", selected: "Wybrany plan", noCharge: "Płatności nie są włączone. Dziś nie zostanie pobrana opłata.", privacy: "Nie prosimy o dokumenty imigracyjne ani dane płatnicze." },
  tr: { account: "Hesap", signIn: "ChatGPT ile devam et", signOut: "Çıkış yap", selected: "Seçilen plan", noCharge: "Faturalandırma etkin değil. Bugün ücret alınmayacak.", privacy: "Göçmenlik belgesi veya ödeme bilgisi istemiyoruz." },
  ru: { account: "Аккаунт", signIn: "Продолжить с ChatGPT", signOut: "Выйти", selected: "Выбранный план", noCharge: "Оплата пока не включена. Сегодня списаний не будет.", privacy: "Мы не запрашиваем иммиграционные документы или платёжные данные." },
  uk: { account: "Обліковий запис", signIn: "Продовжити з ChatGPT", signOut: "Вийти", selected: "Вибраний план", noCharge: "Оплату ще не ввімкнено. Сьогодні списань не буде.", privacy: "Ми не запитуємо імміграційні документи чи платіжні дані." },
  ar: { account: "الحساب", signIn: "المتابعة باستخدام ChatGPT", signOut: "تسجيل الخروج", selected: "الخطة المختارة", noCharge: "الفوترة غير مفعّلة. لن يتم تحصيل أي رسوم اليوم.", privacy: "لا نطلب مستندات الهجرة أو بيانات الدفع." },
  he: { account: "חשבון", signIn: "המשך עם ChatGPT", signOut: "יציאה", selected: "התוכנית שנבחרה", noCharge: "החיוב אינו פעיל. לא יתבצע חיוב היום.", privacy: "איננו מבקשים מסמכי הגירה או פרטי תשלום." },
  hi: { account: "खाता", signIn: "ChatGPT के साथ जारी रखें", signOut: "साइन आउट", selected: "चुनी गई योजना", noCharge: "बिलिंग चालू नहीं है। आज कोई शुल्क नहीं लगेगा।", privacy: "हम आव्रजन दस्तावेज़ या भुगतान विवरण नहीं मांगते।" },
  bn: { account: "অ্যাকাউন্ট", signIn: "ChatGPT দিয়ে চালিয়ে যান", signOut: "সাইন আউট", selected: "নির্বাচিত পরিকল্পনা", noCharge: "বিলিং চালু নেই। আজ কোনো চার্জ হবে না।", privacy: "আমরা অভিবাসন নথি বা পেমেন্টের তথ্য চাই না।" },
  ur: { account: "اکاؤنٹ", signIn: "ChatGPT کے ساتھ جاری رکھیں", signOut: "سائن آؤٹ", selected: "منتخب منصوبہ", noCharge: "بلنگ فعال نہیں ہے۔ آج کوئی رقم وصول نہیں کی جائے گی۔", privacy: "ہم امیگریشن دستاویزات یا ادائیگی کی تفصیلات نہیں مانگتے۔" },
  id: { account: "Akun", signIn: "Lanjutkan dengan ChatGPT", signOut: "Keluar", selected: "Paket yang dipilih", noCharge: "Penagihan belum diaktifkan. Tidak ada biaya hari ini.", privacy: "Kami tidak meminta dokumen imigrasi atau detail pembayaran." },
  ms: { account: "Akaun", signIn: "Teruskan dengan ChatGPT", signOut: "Log keluar", selected: "Pelan dipilih", noCharge: "Pengebilan belum diaktifkan. Tiada caj hari ini.", privacy: "Kami tidak meminta dokumen imigresen atau butiran pembayaran." },
  th: { account: "บัญชี", signIn: "ดำเนินการต่อด้วย ChatGPT", signOut: "ออกจากระบบ", selected: "แผนที่เลือก", noCharge: "ยังไม่เปิดใช้การเรียกเก็บเงิน วันนี้ไม่มีค่าใช้จ่าย", privacy: "เราไม่ขอเอกสารตรวจคนเข้าเมืองหรือข้อมูลการชำระเงิน" },
  vi: { account: "Tài khoản", signIn: "Tiếp tục với ChatGPT", signOut: "Đăng xuất", selected: "Gói đã chọn", noCharge: "Thanh toán chưa được bật. Hôm nay không phát sinh phí.", privacy: "Chúng tôi không yêu cầu giấy tờ nhập cư hoặc thông tin thanh toán." },
  fil: { account: "Account", signIn: "Magpatuloy gamit ang ChatGPT", signOut: "Mag-sign out", selected: "Napiling plano", noCharge: "Hindi pa naka-enable ang billing. Walang sisingilin ngayon.", privacy: "Hindi kami humihingi ng dokumento sa imigrasyon o detalye ng bayad." },
  sv: { account: "Konto", signIn: "Fortsätt med ChatGPT", signOut: "Logga ut", selected: "Vald plan", noCharge: "Fakturering är inte aktiverad. Ingen avgift tas ut i dag.", privacy: "Vi begär inga immigrationshandlingar eller betalningsuppgifter." },
  no: { account: "Konto", signIn: "Fortsett med ChatGPT", signOut: "Logg ut", selected: "Valgt abonnement", noCharge: "Fakturering er ikke aktivert. Du belastes ikke i dag.", privacy: "Vi ber ikke om immigrasjonsdokumenter eller betalingsopplysninger." },
  da: { account: "Konto", signIn: "Fortsæt med ChatGPT", signOut: "Log ud", selected: "Valgt abonnement", noCharge: "Fakturering er ikke aktiveret. Du bliver ikke opkrævet i dag.", privacy: "Vi beder ikke om immigrationsdokumenter eller betalingsoplysninger." },
  fi: { account: "Tili", signIn: "Jatka ChatGPT:llä", signOut: "Kirjaudu ulos", selected: "Valittu tilaus", noCharge: "Laskutus ei ole käytössä. Tänään ei veloiteta.", privacy: "Emme pyydä maahanmuuttoasiakirjoja tai maksutietoja." },
  cs: { account: "Účet", signIn: "Pokračovat s ChatGPT", signOut: "Odhlásit se", selected: "Vybraný tarif", noCharge: "Fakturace není zapnutá. Dnes nebude nic účtováno.", privacy: "Nevyžadujeme imigrační dokumenty ani platební údaje." },
  sk: { account: "Účet", signIn: "Pokračovať s ChatGPT", signOut: "Odhlásiť sa", selected: "Vybraný plán", noCharge: "Fakturácia nie je zapnutá. Dnes sa nič neúčtuje.", privacy: "Nevyžadujeme imigračné dokumenty ani platobné údaje." },
  hu: { account: "Fiók", signIn: "Folytatás ChatGPT-vel", signOut: "Kijelentkezés", selected: "Kiválasztott csomag", noCharge: "A számlázás nincs bekapcsolva. Ma nem terheljük meg.", privacy: "Nem kérünk bevándorlási dokumentumokat vagy fizetési adatokat." },
  ro: { account: "Cont", signIn: "Continuă cu ChatGPT", signOut: "Deconectare", selected: "Plan selectat", noCharge: "Facturarea nu este activată. Astăzi nu se percepe nicio taxă.", privacy: "Nu solicităm documente de imigrare sau date de plată." },
  el: { account: "Λογαριασμός", signIn: "Συνέχεια με ChatGPT", signOut: "Αποσύνδεση", selected: "Επιλεγμένο πρόγραμμα", noCharge: "Η χρέωση δεν είναι ενεργή. Δεν θα υπάρξει χρέωση σήμερα.", privacy: "Δεν ζητάμε έγγραφα μετανάστευσης ή στοιχεία πληρωμής." },
  bg: { account: "Профил", signIn: "Продължете с ChatGPT", signOut: "Изход", selected: "Избран план", noCharge: "Таксуването не е активирано. Днес няма да бъдете таксувани.", privacy: "Не изискваме имиграционни документи или данни за плащане." },
  hr: { account: "Račun", signIn: "Nastavi uz ChatGPT", signOut: "Odjava", selected: "Odabrani plan", noCharge: "Naplata nije omogućena. Danas nema terećenja.", privacy: "Ne tražimo imigracijske dokumente ni podatke za plaćanje." },
  sr: { account: "Налог", signIn: "Наставите уз ChatGPT", signOut: "Одјава", selected: "Изабрани план", noCharge: "Наплата није омогућена. Данас нема задужења.", privacy: "Не тражимо имиграциона документа нити податке за плаћање." },
  sl: { account: "Račun", signIn: "Nadaljuj s ChatGPT", signOut: "Odjava", selected: "Izbrani paket", noCharge: "Obračunavanje ni omogočeno. Danes ne bo bremenitve.", privacy: "Ne zahtevamo priseljenskih dokumentov ali podatkov za plačilo." },
  sw: { account: "Akaunti", signIn: "Endelea na ChatGPT", signOut: "Ondoka", selected: "Mpango uliochaguliwa", noCharge: "Malipo hayajawashwa. Hakuna ada leo.", privacy: "Hatuombi hati za uhamiaji au maelezo ya malipo." },
  fa: { account: "حساب", signIn: "ادامه با ChatGPT", signOut: "خروج", selected: "طرح انتخاب‌شده", noCharge: "صورتحساب فعال نیست. امروز هزینه‌ای دریافت نمی‌شود.", privacy: "ما مدارک مهاجرت یا اطلاعات پرداخت درخواست نمی‌کنیم." },
} satisfies Record<LocaleCode, AccountCopy>;

export function accountCopyFor(locale: LocaleCode): AccountCopy {
  return accountCopy[locale];
}
