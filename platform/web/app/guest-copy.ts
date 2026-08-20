import type { LocaleCode } from "./i18n";

export type GuestAccessCopy = {
  cta: string;
  notice: string;
};

const guestAccessCopy = {
  en: { cta: "Continue without signing in", notice: "Guest mode: your interview history and practice progress will not be saved." },
  ja: { cta: "サインインせずに続ける", notice: "ゲストモード：面接履歴と練習の進捗は保存されません。" },
  ko: { cta: "로그인 없이 계속", notice: "게스트 모드: 면접 기록과 연습 진행 상황이 저장되지 않습니다." },
  "zh-CN": { cta: "不登录，直接使用", notice: "访客模式：面试记录与练习进度不会保存。" },
  "zh-TW": { cta: "不登入，直接使用", notice: "訪客模式：面試紀錄與練習進度不會儲存。" },
  es: { cta: "Continuar sin iniciar sesión", notice: "Modo invitado: el historial de entrevistas y el progreso no se guardarán." },
  fr: { cta: "Continuer sans se connecter", notice: "Mode invité : l’historique des entretiens et la progression ne seront pas enregistrés." },
  de: { cta: "Ohne Anmeldung fortfahren", notice: "Gastmodus: Interviewverlauf und Übungsfortschritt werden nicht gespeichert." },
  "pt-BR": { cta: "Continuar sem entrar", notice: "Modo visitante: o histórico de entrevistas e o progresso não serão salvos." },
  it: { cta: "Continua senza accedere", notice: "Modalità ospite: la cronologia dei colloqui e i progressi non verranno salvati." },
  nl: { cta: "Doorgaan zonder inloggen", notice: "Gastmodus: je interviewgeschiedenis en oefenvoortgang worden niet opgeslagen." },
  pl: { cta: "Kontynuuj bez logowania", notice: "Tryb gościa: historia rozmów i postępy w ćwiczeniach nie zostaną zapisane." },
  tr: { cta: "Giriş yapmadan devam et", notice: "Misafir modu: mülakat geçmişiniz ve çalışma ilerlemeniz kaydedilmez." },
  ru: { cta: "Продолжить без входа", notice: "Гостевой режим: история интервью и прогресс подготовки не сохраняются." },
  uk: { cta: "Продовжити без входу", notice: "Гостьовий режим: історія співбесід і прогрес підготовки не зберігаються." },
  ar: { cta: "المتابعة من دون تسجيل الدخول", notice: "وضع الضيف: لن يُحفظ سجل المقابلات أو تقدّم التدريب." },
  he: { cta: "המשך ללא התחברות", notice: "מצב אורח: היסטוריית הראיונות וההתקדמות בתרגול לא יישמרו." },
  hi: { cta: "साइन इन किए बिना जारी रखें", notice: "अतिथि मोड: आपका इंटरव्यू इतिहास और अभ्यास प्रगति सेव नहीं होगी।" },
  bn: { cta: "সাইন ইন না করে চালিয়ে যান", notice: "অতিথি মোড: সাক্ষাৎকারের ইতিহাস ও অনুশীলনের অগ্রগতি সংরক্ষিত হবে না।" },
  ur: { cta: "سائن اِن کے بغیر جاری رکھیں", notice: "مہمان موڈ: انٹرویو کی تاریخ اور مشق کی پیش رفت محفوظ نہیں ہوگی۔" },
  id: { cta: "Lanjut tanpa masuk", notice: "Mode tamu: riwayat wawancara dan progres latihan tidak akan disimpan." },
  ms: { cta: "Teruskan tanpa log masuk", notice: "Mod tetamu: sejarah temu duga dan kemajuan latihan tidak akan disimpan." },
  th: { cta: "ใช้งานต่อโดยไม่ลงชื่อเข้าใช้", notice: "โหมดผู้เยี่ยมชม: ประวัติการสัมภาษณ์และความคืบหน้าจะไม่ถูกบันทึก" },
  vi: { cta: "Tiếp tục mà không đăng nhập", notice: "Chế độ khách: lịch sử phỏng vấn và tiến độ luyện tập sẽ không được lưu." },
  fil: { cta: "Magpatuloy nang hindi nagsa-sign in", notice: "Guest mode: hindi mase-save ang interview history at practice progress mo." },
  sv: { cta: "Fortsätt utan att logga in", notice: "Gästläge: din intervjuhistorik och övningsprogress sparas inte." },
  no: { cta: "Fortsett uten å logge inn", notice: "Gjestemodus: intervjuhistorikk og øvingsfremgang blir ikke lagret." },
  da: { cta: "Fortsæt uden at logge ind", notice: "Gæstetilstand: interviewhistorik og øvelsesfremskridt gemmes ikke." },
  fi: { cta: "Jatka kirjautumatta", notice: "Vierastila: haastatteluhistoriaa ja harjoittelun edistymistä ei tallenneta." },
  cs: { cta: "Pokračovat bez přihlášení", notice: "Režim hosta: historie pohovorů ani pokrok v procvičování se neuloží." },
  sk: { cta: "Pokračovať bez prihlásenia", notice: "Režim hosťa: história pohovorov ani pokrok v precvičovaní sa neuložia." },
  hu: { cta: "Folytatás bejelentkezés nélkül", notice: "Vendég mód: az interjúelőzmények és a gyakorlási folyamat nem lesznek mentve." },
  ro: { cta: "Continuă fără autentificare", notice: "Mod vizitator: istoricul interviurilor și progresul nu vor fi salvate." },
  el: { cta: "Συνέχεια χωρίς σύνδεση", notice: "Λειτουργία επισκέπτη: το ιστορικό συνεντεύξεων και η πρόοδος δεν αποθηκεύονται." },
  bg: { cta: "Продължете без вход", notice: "Гост режим: историята на интервютата и напредъкът няма да се запазят." },
  hr: { cta: "Nastavi bez prijave", notice: "Način gosta: povijest razgovora i napredak vježbanja neće se spremiti." },
  sr: { cta: "Настави без пријаве", notice: "Режим госта: историја интервјуа и напредак у вежбању неће бити сачувани." },
  sl: { cta: "Nadaljuj brez prijave", notice: "Način za goste: zgodovina razgovorov in napredek vaje se ne bosta shranila." },
  sw: { cta: "Endelea bila kuingia", notice: "Hali ya mgeni: historia ya usaili na maendeleo ya mazoezi hayatahifadhiwa." },
  fa: { cta: "ادامه بدون ورود", notice: "حالت مهمان: سابقه مصاحبه و پیشرفت تمرین ذخیره نمی‌شود." },
} satisfies Record<LocaleCode, GuestAccessCopy>;

export function guestAccessCopyFor(locale: LocaleCode): GuestAccessCopy {
  return guestAccessCopy[locale];
}
