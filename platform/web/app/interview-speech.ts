import type { LocaleCode } from "./i18n";

export type InterviewPersonaId =
  | "hr"
  | "recruiter"
  | "hiring-manager"
  | "functional-lead"
  | "technical"
  | "system-design"
  | "portfolio"
  | "coo"
  | "ceo"
  | "peer"
  | "cross-functional"
  | "customer"
  | "values"
  | "case"
  | "panel";

export const INTERVIEW_DEPTH_COUNT = 5;

export type InterviewFlowCopy = {
  stages: readonly [string, string, string, string, string];
  nextQuestion: string;
  newTopic: string;
  topic: string;
  step: string;
  you: string;
  autoRead: string;
  languageLocked: string;
};

export const SPEECH_LOCALES: Record<LocaleCode, string> = {
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  "pt-BR": "pt-BR",
  it: "it-IT",
  nl: "nl-NL",
  pl: "pl-PL",
  tr: "tr-TR",
  ru: "ru-RU",
  uk: "uk-UA",
  ar: "ar-SA",
  he: "he-IL",
  hi: "hi-IN",
  bn: "bn-BD",
  ur: "ur-PK",
  id: "id-ID",
  ms: "ms-MY",
  th: "th-TH",
  vi: "vi-VN",
  fil: "fil-PH",
  sv: "sv-SE",
  no: "nb-NO",
  da: "da-DK",
  fi: "fi-FI",
  cs: "cs-CZ",
  sk: "sk-SK",
  hu: "hu-HU",
  ro: "ro-RO",
  el: "el-GR",
  bg: "bg-BG",
  hr: "hr-HR",
  sr: "sr-RS",
  sl: "sl-SI",
  sw: "sw-KE",
  fa: "fa-IR",
};

const PERSONA_LABELS: Partial<
  Record<LocaleCode, Record<InterviewPersonaId, string>>
> = {
  "zh-TW": {
    hr: "人資初談",
    recruiter: "招募顧問",
    "hiring-manager": "用人主管",
    "functional-lead": "職能主管",
    technical: "技術面試官",
    "system-design": "系統設計面試官",
    portfolio: "作品集評審",
    coo: "營運長",
    ceo: "執行長",
    peer: "未來同事",
    "cross-functional": "跨部門合作夥伴",
    customer: "客戶與使用者代表",
    values: "文化與價值觀面試官",
    case: "案例拆解",
    panel: "綜合面試小組",
  },
  "zh-CN": {
    hr: "人力资源初筛",
    recruiter: "招聘顾问",
    "hiring-manager": "招聘经理",
    "functional-lead": "职能负责人",
    technical: "技术面试官",
    "system-design": "系统设计面试官",
    portfolio: "作品集评审",
    coo: "首席运营官",
    ceo: "首席执行官",
    peer: "未来同事",
    "cross-functional": "跨职能合作伙伴",
    customer: "客户与用户代表",
    values: "文化与价值观面试官",
    case: "案例分析",
    panel: "综合面试小组",
  },
  ja: {
    hr: "人事スクリーニング",
    recruiter: "採用担当者",
    "hiring-manager": "採用責任者",
    "functional-lead": "部門責任者",
    technical: "技術面接官",
    "system-design": "システム設計面接官",
    portfolio: "ポートフォリオ審査",
    coo: "COO",
    ceo: "CEO",
    peer: "将来の同僚",
    "cross-functional": "他部門パートナー",
    customer: "顧客・ユーザー代表",
    values: "カルチャー・価値観面接官",
    case: "ケース面接",
    panel: "パネル面接",
  },
  ko: {
    hr: "HR 스크리닝",
    recruiter: "채용 담당자",
    "hiring-manager": "채용 관리자",
    "functional-lead": "직무 책임자",
    technical: "기술 면접관",
    "system-design": "시스템 설계 면접관",
    portfolio: "포트폴리오 리뷰어",
    coo: "COO",
    ceo: "CEO",
    peer: "미래 동료",
    "cross-functional": "협업 부서 파트너",
    customer: "고객·사용자 대표",
    values: "문화·가치관 면접관",
    case: "케이스 분석",
    panel: "패널 면접",
  },
  es: {
    hr: "Filtro de RR. HH.",
    recruiter: "Recruiter",
    "hiring-manager": "Responsable de contratación",
    "functional-lead": "Responsable del área",
    technical: "Entrevistador técnico",
    "system-design": "Entrevista de diseño de sistemas",
    portfolio: "Revisión de portafolio",
    coo: "Dirección de operaciones",
    ceo: "Dirección general",
    peer: "Futuro compañero",
    "cross-functional": "Socio interfuncional",
    customer: "Representante de clientes",
    values: "Entrevista de cultura y valores",
    case: "Resolución de caso",
    panel: "Panel de entrevistas",
  },
  fr: {
    hr: "Présélection RH",
    recruiter: "Recruteur",
    "hiring-manager": "Responsable du recrutement",
    "functional-lead": "Responsable métier",
    technical: "Entretien technique",
    "system-design": "Entretien de conception système",
    portfolio: "Revue de portfolio",
    coo: "Direction des opérations",
    ceo: "Direction générale",
    peer: "Futur collègue",
    "cross-functional": "Partenaire transverse",
    customer: "Représentant client",
    values: "Entretien culture et valeurs",
    case: "Étude de cas",
    panel: "Panel d’entretien",
  },
  de: {
    hr: "HR-Vorgespräch",
    recruiter: "Recruiting-Gespräch",
    "hiring-manager": "Einstellende Führungskraft",
    "functional-lead": "Fachbereichsleitung",
    technical: "Technisches Interview",
    "system-design": "Systemdesign-Interview",
    portfolio: "Portfolio-Review",
    coo: "Betriebsleitung",
    ceo: "Geschäftsführung",
    peer: "Künftige Kollegin oder künftiger Kollege",
    "cross-functional": "Bereichsübergreifende Partnerschaft",
    customer: "Kundenvertretung",
    values: "Kultur- und Werteinterview",
    case: "Fallstudie",
    panel: "Panel-Interview",
  },
};

const GENERIC_QUESTIONS: Record<LocaleCode, [string, string, string]> = {
  en: [
    "Walk me through your strongest {proof} example. What problem did you own, what did you decide, and what changed?",
    "What trade-off did you make in that example, and what evidence showed it was the right choice?",
    "How would you apply that experience to this role during your first 90 days while addressing {gap} honestly?",
  ],
  "zh-TW": [
    "請用你最有力的「{proof}」經驗帶我走過一次：你負責什麼問題、做了什麼關鍵判斷，最後帶來什麼改變？",
    "在這個例子裡，你親自做了哪個取捨？當時有哪些證據支持你的選擇？",
    "如果加入這個團隊，你會如何在前九十天運用這段經驗，同時誠實處理「{gap}」這項不足？",
  ],
  "zh-CN": [
    "请用你最有力的“{proof}”经历带我梳理一次：你负责什么问题、做了什么关键判断，最后带来什么变化？",
    "在这个例子里，你亲自做了哪项取舍？当时有哪些证据支持你的选择？",
    "如果加入这个团队，你会如何在前九十天运用这段经验，同时诚实处理“{gap}”这项不足？",
  ],
  ja: [
    "最も強い「{proof}」の事例を説明してください。どの課題を担い、何を判断し、何が変わりましたか？",
    "その事例で、あなた自身が選んだトレードオフは何ですか。正しい判断だと示した根拠は何でしたか？",
    "入社後九十日間でその経験をどう生かし、「{gap}」という不足に誠実に向き合いますか？",
  ],
  ko: [
    "가장 강력한 ‘{proof}’ 사례를 설명해 주세요. 어떤 문제를 맡았고, 무엇을 판단했으며, 무엇이 달라졌나요?",
    "그 사례에서 직접 결정한 절충안은 무엇이며, 그 선택이 옳다는 것을 어떤 근거가 보여 주었나요?",
    "입사 후 첫 구십 일 동안 그 경험을 어떻게 적용하고 ‘{gap}’이라는 부족한 부분을 솔직하게 보완하겠습니까?",
  ],
  es: [
    "Explícame tu ejemplo más sólido de «{proof}». ¿Qué problema asumiste, qué decidiste y qué cambió?",
    "¿Qué decisión difícil o concesión hiciste en ese ejemplo y qué pruebas indicaron que era la opción correcta?",
    "¿Cómo aplicarías esa experiencia durante tus primeros noventa días y abordarías con honestidad la carencia en «{gap}»?",
  ],
  fr: [
    "Présentez-moi votre meilleur exemple de « {proof} ». Quel problème avez-vous pris en charge, quelle décision avez-vous prise et qu’est-ce qui a changé ?",
    "Quel compromis avez-vous personnellement choisi dans cet exemple, et quelles preuves ont montré que c’était la bonne décision ?",
    "Comment appliqueriez-vous cette expérience au cours de vos quatre-vingt-dix premiers jours tout en traitant honnêtement la lacune « {gap} » ?",
  ],
  de: [
    "Führen Sie mich durch Ihr stärkstes Beispiel zu „{proof}“. Welches Problem haben Sie verantwortet, was haben Sie entschieden und was hat sich verändert?",
    "Welchen Zielkonflikt haben Sie in diesem Beispiel selbst entschieden, und welche Belege zeigten, dass die Wahl richtig war?",
    "Wie würden Sie diese Erfahrung in den ersten neunzig Tagen einsetzen und zugleich ehrlich mit der Lücke „{gap}“ umgehen?",
  ],
  "pt-BR": [
    "Conte seu exemplo mais forte de “{proof}”. Qual problema você assumiu, o que decidiu e o que mudou?",
    "Que escolha difícil você fez nesse exemplo e quais evidências mostraram que era a decisão certa?",
    "Como aplicaria essa experiência nos primeiros noventa dias e trataria com honestidade a lacuna em “{gap}”?",
  ],
  it: [
    "Raccontami il tuo esempio più forte di «{proof}». Quale problema hai preso in carico, cosa hai deciso e cosa è cambiato?",
    "Quale compromesso hai scelto personalmente in quell’esempio e quali prove hanno mostrato che era la scelta giusta?",
    "Come applicheresti quell’esperienza nei primi novanta giorni affrontando con sincerità la lacuna «{gap}»?",
  ],
  nl: [
    "Neem me mee in je sterkste voorbeeld van ‘{proof}’. Welk probleem nam je op je, wat besloot je en wat veranderde er?",
    "Welke afweging maakte je zelf in dat voorbeeld en welk bewijs liet zien dat dit de juiste keuze was?",
    "Hoe zou je die ervaring in je eerste negentig dagen toepassen en tegelijk eerlijk omgaan met de leemte ‘{gap}’?",
  ],
  pl: [
    "Opowiedz o swoim najmocniejszym przykładzie dotyczącym „{proof}”. Za jaki problem odpowiadałeś, co zdecydowałeś i co się zmieniło?",
    "Jakiego kompromisu dokonałeś w tym przykładzie i jakie dowody pokazały, że była to właściwa decyzja?",
    "Jak wykorzystasz to doświadczenie w pierwszych dziewięćdziesięciu dniach i uczciwie podejdziesz do luki „{gap}”?",
  ],
  tr: [
    "En güçlü “{proof}” örneğinizi anlatın. Hangi sorumluluğu üstlendiniz, neye karar verdiniz ve ne değişti?",
    "Bu örnekte hangi ödünleşmeye siz karar verdiniz ve bunun doğru seçim olduğunu hangi kanıt gösterdi?",
    "Bu deneyimi ilk doksan günde nasıl uygular ve “{gap}” konusundaki açığınızı dürüstçe nasıl ele alırsınız?",
  ],
  ru: [
    "Расскажите о самом сильном примере, связанном с «{proof}». За какую проблему вы отвечали, что решили и что изменилось?",
    "Какой компромисс вы выбрали в этом примере и какие данные показали, что решение было верным?",
    "Как вы примените этот опыт в первые девяносто дней и честно проработаете пробел в «{gap}»?",
  ],
  uk: [
    "Розкажіть про свій найсильніший приклад, пов’язаний із «{proof}». За яку проблему ви відповідали, що вирішили і що змінилося?",
    "Який компроміс ви обрали в цьому прикладі та які докази показали, що рішення було правильним?",
    "Як ви застосуєте цей досвід у перші дев’яносто днів і чесно опрацюєте прогалину в «{gap}»?",
  ],
  ar: [
    "حدّثني عن أقوى مثال لديك في «{proof}». ما المشكلة التي تولّيت مسؤوليتها، وما القرار الذي اتخذته، وما الذي تغيّر؟",
    "ما المفاضلة التي قررتها بنفسك في هذا المثال، وما الدليل الذي أظهر أن اختيارك كان صحيحًا؟",
    "كيف ستطبّق هذه الخبرة خلال أول تسعين يومًا وتعالج فجوة «{gap}» بصدق؟",
  ],
  he: [
    "ספרו לי על הדוגמה החזקה ביותר שלכם ל־„{proof}”. על איזו בעיה לקחתם אחריות, מה החלטתם ומה השתנה?",
    "איזו פשרה בחרתם בעצמכם בדוגמה הזו, ואילו ראיות הראו שזו הייתה הבחירה הנכונה?",
    "כיצד תיישמו את הניסיון הזה בתשעים הימים הראשונים ותתמודדו בכנות עם הפער ב־„{gap}”?",
  ],
  hi: [
    "‘{proof}’ से जुड़ा अपना सबसे मजबूत उदाहरण बताइए। आपने किस समस्या की ज़िम्मेदारी ली, क्या निर्णय किया और क्या बदला?",
    "उस उदाहरण में आपने कौन-सा समझौता स्वयं चुना और किस प्रमाण ने दिखाया कि वह सही निर्णय था?",
    "पहले नब्बे दिनों में आप उस अनुभव को कैसे लागू करेंगे और ‘{gap}’ की कमी को ईमानदारी से कैसे संभालेंगे?",
  ],
  bn: [
    "‘{proof}’ নিয়ে আপনার সবচেয়ে শক্তিশালী উদাহরণটি বলুন। কোন সমস্যার দায়িত্ব নিয়েছিলেন, কী সিদ্ধান্ত নিয়েছিলেন এবং কী পরিবর্তন হয়েছিল?",
    "সে উদাহরণে আপনি নিজে কোন সমঝোতাটি বেছে নিয়েছিলেন এবং কোন প্রমাণ দেখিয়েছিল যে সিদ্ধান্তটি সঠিক ছিল?",
    "প্রথম নব্বই দিনে সেই অভিজ্ঞতা কীভাবে কাজে লাগাবেন এবং ‘{gap}’ ঘাটতিটি সততার সঙ্গে কীভাবে মোকাবিলা করবেন?",
  ],
  ur: [
    "‘{proof}’ سے متعلق اپنی سب سے مضبوط مثال بیان کریں۔ آپ نے کس مسئلے کی ذمہ داری لی، کیا فیصلہ کیا اور کیا تبدیلی آئی؟",
    "اس مثال میں آپ نے کون سا سمجھوتا خود منتخب کیا اور کس ثبوت نے دکھایا کہ یہ درست فیصلہ تھا؟",
    "پہلے نوے دنوں میں آپ اس تجربے کو کیسے استعمال کریں گے اور ‘{gap}’ کی کمی کو دیانت داری سے کیسے سنبھالیں گے؟",
  ],
  id: [
    "Ceritakan contoh terkuat Anda tentang “{proof}”. Masalah apa yang Anda tangani, keputusan apa yang Anda buat, dan apa yang berubah?",
    "Pilihan sulit apa yang Anda putuskan sendiri dalam contoh itu, dan bukti apa yang menunjukkan bahwa pilihan tersebut tepat?",
    "Bagaimana Anda menerapkan pengalaman itu dalam sembilan puluh hari pertama dan secara jujur menangani kekurangan pada “{gap}”?",
  ],
  ms: [
    "Ceritakan contoh terkuat anda tentang “{proof}”. Masalah apakah yang anda tangani, apakah keputusan anda dan apakah yang berubah?",
    "Pertimbangan sukar apakah yang anda putuskan sendiri dan bukti apakah yang menunjukkan pilihan itu tepat?",
    "Bagaimanakah anda menggunakan pengalaman itu dalam sembilan puluh hari pertama dan menangani jurang “{gap}” secara jujur?",
  ],
  th: [
    "เล่าตัวอย่างที่โดดเด่นที่สุดเกี่ยวกับ “{proof}” ให้ฟังหน่อย คุณรับผิดชอบปัญหาอะไร ตัดสินใจอย่างไร และเกิดการเปลี่ยนแปลงอะไรขึ้น?",
    "ในตัวอย่างนั้น คุณเป็นผู้ตัดสินใจเลือกทางใด และหลักฐานใดแสดงว่าการตัดสินใจนั้นถูกต้อง?",
    "คุณจะนำประสบการณ์นี้มาใช้ในเก้าสิบวันแรก และจัดการช่องว่างด้าน “{gap}” อย่างตรงไปตรงมาได้อย่างไร?",
  ],
  vi: [
    "Hãy trình bày ví dụ thuyết phục nhất của bạn về “{proof}”. Bạn chịu trách nhiệm cho vấn đề nào, đã quyết định điều gì và kết quả thay đổi ra sao?",
    "Trong ví dụ đó, bạn đã tự mình cân nhắc và lựa chọn điều gì, và bằng chứng nào cho thấy đó là quyết định đúng?",
    "Bạn sẽ áp dụng kinh nghiệm ấy trong chín mươi ngày đầu và xử lý trung thực khoảng trống về “{gap}” như thế nào?",
  ],
  fil: [
    "Ikuwento ang pinakamalakas mong halimbawa ng “{proof}”. Anong problema ang inako mo, ano ang ipinasiya mo, at ano ang nagbago?",
    "Anong kompromiso ang ikaw mismo ang nagpasiya sa halimbawang iyon, at anong ebidensiya ang nagpakitang tama ang desisyon?",
    "Paano mo gagamitin ang karanasang iyon sa unang siyamnapung araw at tapat na haharapin ang kakulangan sa “{gap}”?",
  ],
  sv: [
    "Berätta om ditt starkaste exempel på ”{proof}”. Vilket problem tog du ansvar för, vad beslutade du och vad förändrades?",
    "Vilken avvägning gjorde du själv i exemplet och vilka bevis visade att det var rätt val?",
    "Hur skulle du använda erfarenheten under dina första nittio dagar och samtidigt hantera luckan ”{gap}” ärligt?",
  ],
  no: [
    "Fortell om ditt sterkeste eksempel på «{proof}». Hvilket problem tok du ansvar for, hva besluttet du, og hva endret seg?",
    "Hvilken avveining gjorde du selv i eksemplet, og hvilke bevis viste at det var riktig valg?",
    "Hvordan vil du bruke erfaringen de første nitti dagene og samtidig håndtere gapet «{gap}» ærlig?",
  ],
  da: [
    "Fortæl om dit stærkeste eksempel på »{proof}«. Hvilket problem tog du ansvar for, hvad besluttede du, og hvad ændrede sig?",
    "Hvilken afvejning foretog du selv i eksemplet, og hvilke beviser viste, at det var det rigtige valg?",
    "Hvordan vil du bruge erfaringen i de første halvfems dage og samtidig håndtere hullet »{gap}« ærligt?",
  ],
  fi: [
    "Kerro vahvimmasta esimerkistäsi aiheesta ”{proof}”. Mistä ongelmasta otit vastuun, mitä päätit ja mikä muuttui?",
    "Minkä kompromissin valitsit itse tässä esimerkissä ja mikä näyttö osoitti valinnan oikeaksi?",
    "Miten hyödyntäisit kokemusta ensimmäisten yhdeksänkymmenen päivän aikana ja käsittelisit rehellisesti puutetta ”{gap}”?",
  ],
  cs: [
    "Proveďte mě svým nejsilnějším příkladem týkajícím se „{proof}“. Za jaký problém jste převzali odpovědnost, co jste rozhodli a co se změnilo?",
    "Jaký kompromis jste v tomto příkladu zvolili a jaké důkazy ukázaly, že šlo o správné rozhodnutí?",
    "Jak byste tuto zkušenost využili během prvních devadesáti dnů a poctivě řešili mezeru v oblasti „{gap}“?",
  ],
  sk: [
    "Predstavte mi svoj najsilnejší príklad týkajúci sa „{proof}“. Za aký problém ste prevzali zodpovednosť, čo ste rozhodli a čo sa zmenilo?",
    "Aký kompromis ste v tomto príklade zvolili a aké dôkazy ukázali, že to bolo správne rozhodnutie?",
    "Ako by ste túto skúsenosť využili počas prvých deväťdesiatich dní a čestne riešili medzeru v oblasti „{gap}“?",
  ],
  hu: [
    "Mutassa be a legerősebb példáját a(z) „{proof}” területén. Melyik problémáért vállalt felelősséget, mit döntött, és mi változott?",
    "Milyen kompromisszumról döntött személyesen ebben a példában, és milyen bizonyíték mutatta, hogy helyes volt a választás?",
    "Hogyan alkalmazná ezt a tapasztalatot az első kilencven napban, és hogyan kezelné őszintén a(z) „{gap}” hiányosságot?",
  ],
  ro: [
    "Prezentați-mi cel mai puternic exemplu al dumneavoastră privind „{proof}”. Ce problemă v-ați asumat, ce ați decis și ce s-a schimbat?",
    "Ce compromis ați ales personal în acel exemplu și ce dovezi au arătat că decizia a fost corectă?",
    "Cum ați aplica acea experiență în primele nouăzeci de zile și ați aborda sincer lacuna privind „{gap}”?",
  ],
  el: [
    "Περιγράψτε μου το ισχυρότερο παράδειγμά σας σχετικά με το «{proof}». Ποιο πρόβλημα αναλάβατε, τι αποφασίσατε και τι άλλαξε;",
    "Ποιον συμβιβασμό επιλέξατε προσωπικά σε αυτό το παράδειγμα και ποια στοιχεία έδειξαν ότι ήταν η σωστή απόφαση;",
    "Πώς θα εφαρμόζατε αυτή την εμπειρία στις πρώτες ενενήντα ημέρες και θα αντιμετωπίζατε με ειλικρίνεια το κενό στο «{gap}»;",
  ],
  bg: [
    "Разкажете за най-силния си пример, свързан с „{proof}“. За кой проблем поехте отговорност, какво решихте и какво се промени?",
    "Какъв компромис избрахте лично в този пример и какви доказателства показаха, че решението е било правилно?",
    "Как бихте приложили този опит през първите деветдесет дни и бихте разгледали честно пропуска в „{gap}“?",
  ],
  hr: [
    "Provedite me kroz svoj najsnažniji primjer vezan uz „{proof}“. Za koji ste problem preuzeli odgovornost, što ste odlučili i što se promijenilo?",
    "Koji ste kompromis osobno odabrali u tom primjeru i koji su dokazi pokazali da je odluka bila ispravna?",
    "Kako biste to iskustvo primijenili tijekom prvih devedeset dana i iskreno riješili nedostatak u području „{gap}“?",
  ],
  sr: [
    "Опишите свој најјачи пример у вези са „{proof}“. За који сте проблем преузели одговорност, шта сте одлучили и шта се променило?",
    "Који сте компромис лично изабрали у том примеру и који докази су показали да је одлука била исправна?",
    "Како бисте то искуство применили током првих деведесет дана и искрено решили недостатак у области „{gap}“?",
  ],
  sl: [
    "Predstavite svoj najmočnejši primer, povezan z »{proof}«. Za kateri problem ste prevzeli odgovornost, kaj ste se odločili in kaj se je spremenilo?",
    "Kateri kompromis ste v tem primeru izbrali sami in kateri dokazi so pokazali, da je bila odločitev pravilna?",
    "Kako bi to izkušnjo uporabili v prvih devetdesetih dneh in pošteno obravnavali vrzel pri »{gap}«?",
  ],
  sw: [
    "Nieleze mfano wako wenye nguvu zaidi kuhusu “{proof}”. Uliwajibika kwa tatizo gani, uliamua nini, na nini kilibadilika?",
    "Ni uamuzi gani wa uwiano uliofanya mwenyewe katika mfano huo, na ni ushahidi gani ulioonyesha kuwa ulikuwa sahihi?",
    "Utatumiaje uzoefu huo katika siku tisini za kwanza na kushughulikia kwa uaminifu pengo la “{gap}”?",
  ],
  fa: [
    "قوی‌ترین نمونه خود درباره «{proof}» را توضیح دهید. مسئولیت کدام مسئله را بر عهده گرفتید، چه تصمیمی گرفتید و چه چیزی تغییر کرد؟",
    "در آن نمونه شخصاً چه موازنه‌ای را انتخاب کردید و کدام شواهد نشان داد که تصمیم درستی بوده است؟",
    "چگونه این تجربه را در نود روز نخست به کار می‌گیرید و شکاف «{gap}» را صادقانه مدیریت می‌کنید؟",
  ],
};

const OWNERSHIP_QUESTIONS: Record<LocaleCode, string> = {
  en: "Which part of that result was directly yours, who else contributed, and where did your responsibility begin and end?",
  ja: "その成果のうち、あなたが直接担った部分はどこですか。ほかに誰が貢献し、あなたの責任範囲はどこまででしたか？",
  ko: "그 성과 중 직접 맡은 부분은 무엇이었고, 누가 함께 기여했으며, 본인의 책임 범위는 어디까지였나요?",
  "zh-CN": "这项成果中，哪些部分由你直接负责？还有谁参与，你的责任边界在哪里？",
  "zh-TW": "這項成果中，哪些部分由你直接負責？還有誰參與，你的責任邊界在哪裡？",
  es: "¿Qué parte del resultado fue directamente tuya, quién más contribuyó y dónde empezaba y terminaba tu responsabilidad?",
  fr: "Quelle part du résultat relevait directement de vous, qui d’autre a contribué et où commençait et finissait votre responsabilité ?",
  de: "Welcher Teil des Ergebnisses lag direkt bei Ihnen, wer trug noch dazu bei und wo begann und endete Ihre Verantwortung?",
  "pt-BR": "Qual parte do resultado foi diretamente sua, quem mais contribuiu e onde começava e terminava sua responsabilidade?",
  it: "Quale parte del risultato dipendeva direttamente da te, chi altro ha contribuito e dove iniziava e finiva la tua responsabilità?",
  nl: "Welk deel van het resultaat was rechtstreeks van jou, wie droeg nog meer bij en waar begon en eindigde jouw verantwoordelijkheid?",
  pl: "Która część wyniku należała bezpośrednio do Ciebie, kto jeszcze miał wkład i gdzie zaczynała się oraz kończyła Twoja odpowiedzialność?",
  tr: "Sonucun hangi kısmı doğrudan size aitti, başka kim katkıda bulundu ve sorumluluğunuz nerede başlayıp bitiyordu?",
  ru: "Какая часть результата зависела непосредственно от вас, кто ещё участвовал и где проходили границы вашей ответственности?",
  uk: "Яка частина результату залежала безпосередньо від вас, хто ще долучався і де проходили межі вашої відповідальності?",
  ar: "أي جزء من النتيجة كان من مسؤوليتك المباشرة، ومن ساهم أيضًا، وأين بدأت مسؤوليتك وانتهت؟",
  he: "איזה חלק מהתוצאה היה באחריותכם הישירה, מי עוד תרם והיכן התחילה והסתיימה האחריות שלכם?",
  hi: "उस परिणाम का कौन-सा हिस्सा सीधे आपकी ज़िम्मेदारी था, और किसने योगदान दिया, तथा आपकी ज़िम्मेदारी की सीमा कहाँ थी?",
  bn: "ফলাফলের কোন অংশটি সরাসরি আপনার ছিল, আর কে অবদান রেখেছিলেন এবং আপনার দায়িত্বের সীমা কোথায় ছিল?",
  ur: "نتیجے کا کون سا حصہ براہ راست آپ کی ذمہ داری تھا، اور کس نے تعاون کیا، اور آپ کی ذمہ داری کی حد کہاں تھی؟",
  id: "Bagian mana dari hasil itu yang langsung menjadi tanggung jawab Anda, siapa lagi yang berkontribusi, dan di mana batas tanggung jawab Anda?",
  ms: "Bahagian manakah daripada hasil itu yang menjadi tanggungjawab langsung anda, siapa lagi yang menyumbang, dan di manakah batas tanggungjawab anda?",
  th: "ผลลัพธ์ส่วนใดเป็นความรับผิดชอบโดยตรงของคุณ ใครมีส่วนร่วมอีก และขอบเขตความรับผิดชอบของคุณอยู่ตรงไหน?",
  vi: "Phần nào của kết quả do bạn trực tiếp chịu trách nhiệm, ai khác đã đóng góp và phạm vi trách nhiệm của bạn bắt đầu và kết thúc ở đâu?",
  fil: "Aling bahagi ng resulta ang direktang pananagutan mo, sino pa ang tumulong, at saan nagsimula at nagtapos ang responsibilidad mo?",
  sv: "Vilken del av resultatet var direkt ditt ansvar, vilka andra bidrog och var började och slutade ditt ansvar?",
  no: "Hvilken del av resultatet var direkte ditt ansvar, hvem andre bidro, og hvor begynte og sluttet ansvaret ditt?",
  da: "Hvilken del af resultatet var direkte dit ansvar, hvem bidrog ellers, og hvor begyndte og sluttede dit ansvar?",
  fi: "Mikä osa tuloksesta oli suoraan sinun vastuullasi, ketkä muut osallistuivat ja mihin vastuusi rajautui?",
  cs: "Která část výsledku byla přímo vaše, kdo další přispěl a kde začínala a končila vaše odpovědnost?",
  sk: "Ktorá časť výsledku bola priamo vaša, kto ďalší prispel a kde sa začínala a končila vaša zodpovednosť?",
  hu: "Az eredmény mely része volt közvetlenül az Ön felelőssége, kik járultak még hozzá, és hol húzódtak a felelőssége határai?",
  ro: "Ce parte a rezultatului v-a aparținut direct, cine a mai contribuit și unde începea și se termina responsabilitatea dumneavoastră?",
  el: "Ποιο μέρος του αποτελέσματος ήταν άμεσα δικό σας, ποιοι άλλοι συνέβαλαν και πού άρχιζε και τελείωνε η ευθύνη σας;",
  bg: "Коя част от резултата беше пряко ваша, кой друг допринесе и къде започваше и свършваше отговорността ви?",
  hr: "Koji je dio rezultata bio izravno vaš, tko je još pridonio i gdje je počinjala i završavala vaša odgovornost?",
  sr: "Који део резултата је био директно ваш, ко је још допринео и где је почињала и завршавала ваша одговорност?",
  sl: "Kateri del rezultata je bil neposredno vaš, kdo je še prispeval in kje se je začela ter končala vaša odgovornost?",
  sw: "Ni sehemu gani ya matokeo iliyokuwa jukumu lako moja kwa moja, nani mwingine alichangia, na mipaka ya jukumu lako ilikuwa wapi?",
  fa: "کدام بخش از نتیجه مستقیماً بر عهده شما بود، چه کسانی دیگر مشارکت داشتند و مرز مسئولیت شما کجا بود؟",
};

const OUTCOME_QUESTIONS: Record<LocaleCode, string> = {
  en: "How did you measure the outcome, what changed because of your work, and which claim could a former colleague verify?",
  ja: "成果をどのように測定し、あなたの仕事によって何が変わりましたか。また、元同僚が確認できる主張はどれですか？",
  ko: "성과를 어떻게 측정했고, 본인의 업무로 무엇이 달라졌으며, 이전 동료가 확인해 줄 수 있는 주장은 무엇인가요?",
  "zh-CN": "你如何衡量结果？你的工作带来了什么变化？其中哪项说法可以由前同事验证？",
  "zh-TW": "你如何衡量結果？你的工作帶來了什麼改變？其中哪項說法可以由前同事驗證？",
  es: "¿Cómo mediste el resultado, qué cambió gracias a tu trabajo y qué afirmación podría verificar un antiguo compañero?",
  fr: "Comment avez-vous mesuré le résultat, qu’est-ce qui a changé grâce à votre travail et quelle affirmation un ancien collègue pourrait-il confirmer ?",
  de: "Wie haben Sie das Ergebnis gemessen, was hat sich durch Ihre Arbeit verändert und welche Aussage könnte eine frühere Kollegin oder ein früherer Kollege bestätigen?",
  "pt-BR": "Como você mediu o resultado, o que mudou por causa do seu trabalho e qual afirmação um ex-colega poderia confirmar?",
  it: "Come hai misurato il risultato, cosa è cambiato grazie al tuo lavoro e quale affermazione potrebbe verificare un ex collega?",
  nl: "Hoe heb je het resultaat gemeten, wat veranderde door jouw werk en welke bewering zou een voormalige collega kunnen bevestigen?",
  pl: "Jak zmierzyłeś wynik, co zmieniło się dzięki Twojej pracy i które stwierdzenie mógłby potwierdzić były współpracownik?",
  tr: "Sonucu nasıl ölçtünüz, çalışmanız sayesinde ne değişti ve eski bir çalışma arkadaşınız hangi iddiayı doğrulayabilir?",
  ru: "Как вы измерили результат, что изменилось благодаря вашей работе и какое утверждение мог бы подтвердить бывший коллега?",
  uk: "Як ви виміряли результат, що змінилося завдяки вашій роботі та яке твердження міг би підтвердити колишній колега?",
  ar: "كيف قست النتيجة، وما الذي تغيّر بسبب عملك، وما الادعاء الذي يستطيع زميل سابق التحقق منه؟",
  he: "כיצד מדדתם את התוצאה, מה השתנה בזכות עבודתכם ואיזו טענה עמית לשעבר יכול לאמת?",
  hi: "आपने परिणाम कैसे मापा, आपके काम से क्या बदला और किस दावे की पुष्टि कोई पूर्व सहकर्मी कर सकता है?",
  bn: "আপনি ফলাফল কীভাবে মেপেছিলেন, আপনার কাজের কারণে কী বদলেছিল এবং কোন দাবিটি একজন সাবেক সহকর্মী যাচাই করতে পারবেন?",
  ur: "آپ نے نتیجہ کیسے ناپا، آپ کے کام سے کیا بدلا، اور کس دعوے کی سابق ساتھی تصدیق کر سکتا ہے؟",
  id: "Bagaimana Anda mengukur hasilnya, apa yang berubah karena pekerjaan Anda, dan klaim mana yang dapat diverifikasi oleh mantan rekan kerja?",
  ms: "Bagaimanakah anda mengukur hasilnya, apakah yang berubah kerana kerja anda, dan dakwaan manakah yang boleh disahkan oleh bekas rakan sekerja?",
  th: "คุณวัดผลลัพธ์อย่างไร งานของคุณทำให้เกิดการเปลี่ยนแปลงอะไร และข้อใดที่อดีตเพื่อนร่วมงานสามารถยืนยันได้?",
  vi: "Bạn đo lường kết quả như thế nào, điều gì thay đổi nhờ công việc của bạn và nhận định nào có thể được đồng nghiệp cũ xác minh?",
  fil: "Paano mo sinukat ang resulta, ano ang nagbago dahil sa trabaho mo, at aling pahayag ang mapatutunayan ng dati mong katrabaho?",
  sv: "Hur mätte du resultatet, vad förändrades tack vare ditt arbete och vilket påstående skulle en tidigare kollega kunna bekräfta?",
  no: "Hvordan målte du resultatet, hva endret seg på grunn av arbeidet ditt, og hvilken påstand kunne en tidligere kollega bekrefte?",
  da: "Hvordan målte du resultatet, hvad ændrede sig på grund af dit arbejde, og hvilken påstand kunne en tidligere kollega bekræfte?",
  fi: "Miten mittasit tuloksen, mikä muuttui työsi ansiosta ja minkä väitteen entinen kollega voisi vahvistaa?",
  cs: "Jak jste výsledek měřili, co se díky vaší práci změnilo a které tvrzení by mohl potvrdit bývalý kolega?",
  sk: "Ako ste výsledok merali, čo sa vďaka vašej práci zmenilo a ktoré tvrdenie by mohol potvrdiť bývalý kolega?",
  hu: "Hogyan mérte az eredményt, mi változott a munkája hatására, és mely állítást tudná egy korábbi kollégája igazolni?",
  ro: "Cum ați măsurat rezultatul, ce s-a schimbat datorită muncii dumneavoastră și ce afirmație ar putea verifica un fost coleg?",
  el: "Πώς μετρήσατε το αποτέλεσμα, τι άλλαξε χάρη στη δουλειά σας και ποιον ισχυρισμό θα μπορούσε να επιβεβαιώσει ένας πρώην συνάδελφος;",
  bg: "Как измерихте резултата, какво се промени благодарение на работата ви и кое твърдение би могъл да потвърди бивш колега?",
  hr: "Kako ste mjerili rezultat, što se promijenilo zahvaljujući vašem radu i koju bi tvrdnju mogao potvrditi bivši kolega?",
  sr: "Како сте мерили резултат, шта се променило захваљујући вашем раду и коју би тврдњу могао да потврди бивши колега?",
  sl: "Kako ste izmerili rezultat, kaj se je spremenilo zaradi vašega dela in katero trditev bi lahko potrdil nekdanji sodelavec?",
  sw: "Ulipimaje matokeo, ni nini kilibadilika kwa sababu ya kazi yako, na ni dai gani ambalo mfanyakazi mwenzako wa zamani anaweza kuthibitisha?",
  fa: "نتیجه را چگونه سنجیدید، به‌دلیل کار شما چه چیزی تغییر کرد و کدام ادعا را یک همکار سابق می‌تواند تأیید کند؟",
};

const INTERVIEW_FLOW_COPY: Record<LocaleCode, InterviewFlowCopy> = {
  en: { stages: ["Context", "Ownership", "Decision", "Outcome", "Reflection"], nextQuestion: "Next follow-up", newTopic: "Start a new topic", topic: "Topic", step: "Question", you: "You", autoRead: "Read each new question aloud", languageLocked: "Question and voice are locked to English." },
  ja: { stages: ["背景", "責任", "判断", "成果", "振り返り"], nextQuestion: "次の質問", newTopic: "新しいテーマ", topic: "テーマ", step: "質問", you: "あなた", autoRead: "新しい質問を自動で読み上げる", languageLocked: "質問と音声は日本語に固定されています。" },
  ko: { stages: ["배경", "책임", "판단", "성과", "회고"], nextQuestion: "다음 후속 질문", newTopic: "새 주제 시작", topic: "주제", step: "질문", you: "나", autoRead: "새 질문 자동 읽기", languageLocked: "질문과 음성이 한국어로 고정되었습니다." },
  "zh-CN": { stages: ["背景", "责任", "判断", "结果", "复盘"], nextQuestion: "下一个追问", newTopic: "开始新主题", topic: "主题", step: "问题", you: "你", autoRead: "自动朗读每个新问题", languageLocked: "问题与语音已锁定为简体中文。" },
  "zh-TW": { stages: ["背景", "責任", "判斷", "成果", "反思"], nextQuestion: "下一個追問", newTopic: "開始新主題", topic: "主題", step: "問題", you: "你", autoRead: "自動朗讀每個新問題", languageLocked: "問題與語音已鎖定為繁體中文。" },
  es: { stages: ["Contexto", "Responsabilidad", "Decisión", "Resultado", "Reflexión"], nextQuestion: "Siguiente pregunta", newTopic: "Iniciar otro tema", topic: "Tema", step: "Pregunta", you: "Tú", autoRead: "Leer cada pregunta nueva", languageLocked: "Las preguntas y la voz están configuradas en español." },
  fr: { stages: ["Contexte", "Responsabilité", "Décision", "Résultat", "Réflexion"], nextQuestion: "Question suivante", newTopic: "Nouveau sujet", topic: "Sujet", step: "Question", you: "Vous", autoRead: "Lire chaque nouvelle question", languageLocked: "Les questions et la voix sont réglées en français." },
  de: { stages: ["Kontext", "Verantwortung", "Entscheidung", "Ergebnis", "Reflexion"], nextQuestion: "Nächste Nachfrage", newTopic: "Neues Thema", topic: "Thema", step: "Frage", you: "Sie", autoRead: "Jede neue Frage vorlesen", languageLocked: "Fragen und Stimme sind auf Deutsch eingestellt." },
  "pt-BR": { stages: ["Contexto", "Responsabilidade", "Decisão", "Resultado", "Reflexão"], nextQuestion: "Próxima pergunta", newTopic: "Novo tema", topic: "Tema", step: "Pergunta", you: "Você", autoRead: "Ler cada nova pergunta", languageLocked: "Perguntas e voz estão configuradas em português." },
  it: { stages: ["Contesto", "Responsabilità", "Decisione", "Risultato", "Riflessione"], nextQuestion: "Domanda successiva", newTopic: "Nuovo argomento", topic: "Argomento", step: "Domanda", you: "Tu", autoRead: "Leggi ogni nuova domanda", languageLocked: "Domande e voce sono impostate in italiano." },
  nl: { stages: ["Context", "Eigenaarschap", "Besluit", "Resultaat", "Reflectie"], nextQuestion: "Volgende vraag", newTopic: "Nieuw onderwerp", topic: "Onderwerp", step: "Vraag", you: "Jij", autoRead: "Lees elke nieuwe vraag voor", languageLocked: "Vragen en stem zijn ingesteld op Nederlands." },
  pl: { stages: ["Kontekst", "Odpowiedzialność", "Decyzja", "Wynik", "Refleksja"], nextQuestion: "Następne pytanie", newTopic: "Nowy temat", topic: "Temat", step: "Pytanie", you: "Ty", autoRead: "Czytaj każde nowe pytanie", languageLocked: "Pytania i głos są ustawione na język polski." },
  tr: { stages: ["Bağlam", "Sorumluluk", "Karar", "Sonuç", "Değerlendirme"], nextQuestion: "Sonraki soru", newTopic: "Yeni konu", topic: "Konu", step: "Soru", you: "Siz", autoRead: "Her yeni soruyu seslendir", languageLocked: "Sorular ve ses Türkçe olarak ayarlandı." },
  ru: { stages: ["Контекст", "Ответственность", "Решение", "Результат", "Выводы"], nextQuestion: "Следующий вопрос", newTopic: "Новая тема", topic: "Тема", step: "Вопрос", you: "Вы", autoRead: "Озвучивать каждый новый вопрос", languageLocked: "Вопросы и голос настроены на русский язык." },
  uk: { stages: ["Контекст", "Відповідальність", "Рішення", "Результат", "Висновки"], nextQuestion: "Наступне питання", newTopic: "Нова тема", topic: "Тема", step: "Питання", you: "Ви", autoRead: "Озвучувати кожне нове питання", languageLocked: "Питання й голос налаштовано українською." },
  ar: { stages: ["السياق", "المسؤولية", "القرار", "النتيجة", "التأمل"], nextQuestion: "سؤال المتابعة التالي", newTopic: "موضوع جديد", topic: "الموضوع", step: "السؤال", you: "أنت", autoRead: "قراءة كل سؤال جديد", languageLocked: "تم ضبط الأسئلة والصوت على العربية." },
  he: { stages: ["הקשר", "אחריות", "החלטה", "תוצאה", "למידה"], nextQuestion: "שאלת ההמשך הבאה", newTopic: "נושא חדש", topic: "נושא", step: "שאלה", you: "אתם", autoRead: "להקריא כל שאלה חדשה", languageLocked: "השאלות והקול מוגדרים לעברית." },
  hi: { stages: ["संदर्भ", "ज़िम्मेदारी", "निर्णय", "परिणाम", "चिंतन"], nextQuestion: "अगला प्रश्न", newTopic: "नया विषय", topic: "विषय", step: "प्रश्न", you: "आप", autoRead: "हर नया प्रश्न पढ़ें", languageLocked: "प्रश्न और आवाज़ हिंदी पर सेट हैं।" },
  bn: { stages: ["প্রেক্ষাপট", "দায়িত্ব", "সিদ্ধান্ত", "ফলাফল", "পর্যালোচনা"], nextQuestion: "পরবর্তী প্রশ্ন", newTopic: "নতুন বিষয়", topic: "বিষয়", step: "প্রশ্ন", you: "আপনি", autoRead: "প্রতিটি নতুন প্রশ্ন পড়ুন", languageLocked: "প্রশ্ন ও কণ্ঠ বাংলা ভাষায় নির্ধারিত।" },
  ur: { stages: ["پس منظر", "ذمہ داری", "فیصلہ", "نتیجہ", "غور"], nextQuestion: "اگلا سوال", newTopic: "نیا موضوع", topic: "موضوع", step: "سوال", you: "آپ", autoRead: "ہر نیا سوال پڑھیں", languageLocked: "سوال اور آواز اردو پر مقرر ہیں۔" },
  id: { stages: ["Konteks", "Tanggung jawab", "Keputusan", "Hasil", "Refleksi"], nextQuestion: "Pertanyaan berikutnya", newTopic: "Topik baru", topic: "Topik", step: "Pertanyaan", you: "Anda", autoRead: "Bacakan setiap pertanyaan baru", languageLocked: "Pertanyaan dan suara diatur ke bahasa Indonesia." },
  ms: { stages: ["Konteks", "Tanggungjawab", "Keputusan", "Hasil", "Refleksi"], nextQuestion: "Soalan seterusnya", newTopic: "Topik baharu", topic: "Topik", step: "Soalan", you: "Anda", autoRead: "Bacakan setiap soalan baharu", languageLocked: "Soalan dan suara ditetapkan kepada bahasa Melayu." },
  th: { stages: ["บริบท", "ความรับผิดชอบ", "การตัดสินใจ", "ผลลัพธ์", "การทบทวน"], nextQuestion: "คำถามถัดไป", newTopic: "หัวข้อใหม่", topic: "หัวข้อ", step: "คำถาม", you: "คุณ", autoRead: "อ่านทุกคำถามใหม่", languageLocked: "ตั้งคำถามและเสียงเป็นภาษาไทยแล้ว" },
  vi: { stages: ["Bối cảnh", "Trách nhiệm", "Quyết định", "Kết quả", "Suy ngẫm"], nextQuestion: "Câu hỏi tiếp theo", newTopic: "Chủ đề mới", topic: "Chủ đề", step: "Câu hỏi", you: "Bạn", autoRead: "Đọc mỗi câu hỏi mới", languageLocked: "Câu hỏi và giọng nói được đặt thành tiếng Việt." },
  fil: { stages: ["Konteksto", "Pananagutan", "Desisyon", "Resulta", "Pagninilay"], nextQuestion: "Susunod na tanong", newTopic: "Bagong paksa", topic: "Paksa", step: "Tanong", you: "Ikaw", autoRead: "Basahin ang bawat bagong tanong", languageLocked: "Nakatakda sa Filipino ang mga tanong at boses." },
  sv: { stages: ["Kontext", "Ansvar", "Beslut", "Resultat", "Reflektion"], nextQuestion: "Nästa följdfråga", newTopic: "Nytt ämne", topic: "Ämne", step: "Fråga", you: "Du", autoRead: "Läs upp varje ny fråga", languageLocked: "Frågor och röst är inställda på svenska." },
  no: { stages: ["Kontekst", "Ansvar", "Beslutning", "Resultat", "Refleksjon"], nextQuestion: "Neste spørsmål", newTopic: "Nytt tema", topic: "Tema", step: "Spørsmål", you: "Du", autoRead: "Les opp hvert nytt spørsmål", languageLocked: "Spørsmål og stemme er satt til norsk." },
  da: { stages: ["Kontekst", "Ansvar", "Beslutning", "Resultat", "Refleksion"], nextQuestion: "Næste spørgsmål", newTopic: "Nyt emne", topic: "Emne", step: "Spørgsmål", you: "Du", autoRead: "Læs hvert nyt spørgsmål op", languageLocked: "Spørgsmål og stemme er indstillet til dansk." },
  fi: { stages: ["Konteksti", "Vastuu", "Päätös", "Tulos", "Pohdinta"], nextQuestion: "Seuraava kysymys", newTopic: "Uusi aihe", topic: "Aihe", step: "Kysymys", you: "Sinä", autoRead: "Lue jokainen uusi kysymys", languageLocked: "Kysymykset ja ääni ovat suomeksi." },
  cs: { stages: ["Kontext", "Odpovědnost", "Rozhodnutí", "Výsledek", "Reflexe"], nextQuestion: "Další otázka", newTopic: "Nové téma", topic: "Téma", step: "Otázka", you: "Vy", autoRead: "Přečíst každou novou otázku", languageLocked: "Otázky a hlas jsou nastaveny na češtinu." },
  sk: { stages: ["Kontext", "Zodpovednosť", "Rozhodnutie", "Výsledok", "Reflexia"], nextQuestion: "Ďalšia otázka", newTopic: "Nová téma", topic: "Téma", step: "Otázka", you: "Vy", autoRead: "Prečítať každú novú otázku", languageLocked: "Otázky a hlas sú nastavené na slovenčinu." },
  hu: { stages: ["Kontextus", "Felelősség", "Döntés", "Eredmény", "Reflexió"], nextQuestion: "Következő kérdés", newTopic: "Új téma", topic: "Téma", step: "Kérdés", you: "Ön", autoRead: "Minden új kérdés felolvasása", languageLocked: "A kérdések és a hang magyar nyelvűek." },
  ro: { stages: ["Context", "Responsabilitate", "Decizie", "Rezultat", "Reflecție"], nextQuestion: "Următoarea întrebare", newTopic: "Subiect nou", topic: "Subiect", step: "Întrebare", you: "Dumneavoastră", autoRead: "Citește fiecare întrebare nouă", languageLocked: "Întrebările și vocea sunt setate în română." },
  el: { stages: ["Πλαίσιο", "Ευθύνη", "Απόφαση", "Αποτέλεσμα", "Αναστοχασμός"], nextQuestion: "Επόμενη ερώτηση", newTopic: "Νέο θέμα", topic: "Θέμα", step: "Ερώτηση", you: "Εσείς", autoRead: "Ανάγνωση κάθε νέας ερώτησης", languageLocked: "Οι ερωτήσεις και η φωνή έχουν οριστεί στα ελληνικά." },
  bg: { stages: ["Контекст", "Отговорност", "Решение", "Резултат", "Равносметка"], nextQuestion: "Следващ въпрос", newTopic: "Нова тема", topic: "Тема", step: "Въпрос", you: "Вие", autoRead: "Прочитай всеки нов въпрос", languageLocked: "Въпросите и гласът са зададени на български." },
  hr: { stages: ["Kontekst", "Odgovornost", "Odluka", "Rezultat", "Osvrt"], nextQuestion: "Sljedeće pitanje", newTopic: "Nova tema", topic: "Tema", step: "Pitanje", you: "Vi", autoRead: "Pročitaj svako novo pitanje", languageLocked: "Pitanja i glas postavljeni su na hrvatski." },
  sr: { stages: ["Контекст", "Одговорност", "Одлука", "Резултат", "Осврт"], nextQuestion: "Следеће питање", newTopic: "Нова тема", topic: "Тема", step: "Питање", you: "Ви", autoRead: "Прочитај свако ново питање", languageLocked: "Питања и глас су подешени на српски." },
  sl: { stages: ["Kontekst", "Odgovornost", "Odločitev", "Rezultat", "Razmislek"], nextQuestion: "Naslednje vprašanje", newTopic: "Nova tema", topic: "Tema", step: "Vprašanje", you: "Vi", autoRead: "Preberi vsako novo vprašanje", languageLocked: "Vprašanja in glas so nastavljeni na slovenščino." },
  sw: { stages: ["Muktadha", "Wajibu", "Uamuzi", "Matokeo", "Tafakari"], nextQuestion: "Swali linalofuata", newTopic: "Mada mpya", topic: "Mada", step: "Swali", you: "Wewe", autoRead: "Soma kila swali jipya", languageLocked: "Maswali na sauti vimewekwa kwa Kiswahili." },
  fa: { stages: ["زمینه", "مسئولیت", "تصمیم", "نتیجه", "بازنگری"], nextQuestion: "پرسش بعدی", newTopic: "موضوع جدید", topic: "موضوع", step: "پرسش", you: "شما", autoRead: "خواندن هر پرسش جدید", languageLocked: "پرسش‌ها و صدا روی فارسی تنظیم شده‌اند." },
};

export function speechLocaleFor(locale: LocaleCode) {
  return SPEECH_LOCALES[locale];
}

export function localizedPersonaLabel(
  locale: LocaleCode,
  persona: InterviewPersonaId,
  englishLabel: string,
) {
  return PERSONA_LABELS[locale]?.[persona] || englishLabel;
}

export function localizedInterviewQuestion(
  locale: LocaleCode,
  turn: number,
  proofLabel: string,
  gapLabel: string,
) {
  const base = GENERIC_QUESTIONS[locale];
  const templates = [
    base[0],
    OWNERSHIP_QUESTIONS[locale],
    base[1],
    OUTCOME_QUESTIONS[locale],
    base[2],
  ];
  const template = templates[Math.min(Math.max(turn, 0), INTERVIEW_DEPTH_COUNT - 1)];
  return template
    .replaceAll("{proof}", proofLabel)
    .replaceAll("{gap}", gapLabel);
}

export function interviewFlowCopyFor(locale: LocaleCode) {
  return INTERVIEW_FLOW_COPY[locale];
}

export function questionOnly(content: string) {
  const blocks = content
    .replaceAll("\r\n", "\n")
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean);
  return (blocks.at(-1) || content).trim();
}

export function pronunciationTextFor(content: string, locale: LocaleCode) {
  const question = questionOnly(content)
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const replacements: Array<[RegExp, string]> = [
    [/\bSQL\b/giu, "S Q L"],
    [/\bAPI\b/giu, "A P I"],
    [/\bKPI\b/giu, "K P I"],
    [/\bCEO\b/giu, "C E O"],
    [/\bCOO\b/giu, "C O O"],
    [/\bHR\b/giu, "H R"],
    [/\bJD\b/giu, locale === "en" ? "job description" : "J D"],
  ];
  return replacements.reduce(
    (spoken, [pattern, replacement]) => spoken.replace(pattern, replacement),
    question,
  );
}

export function bestSpeechVoice(
  voices: readonly SpeechSynthesisVoice[],
  locale: LocaleCode,
) {
  const target = speechLocaleFor(locale).toLowerCase();
  const base = target.split("-")[0];
  const preferredRegion = target.split("-")[1] || "";
  const qualityPattern = /premium|enhanced|natural|neural|studio|online/i;
  const noveltyPattern = /whisper|bells|trinoids|bad news|good news|zarvox/i;

  return [...voices]
    .map((voice) => {
      const language = voice.lang.replace("_", "-").toLowerCase();
      const voiceBase = language.split("-")[0];
      const voiceRegion = language.split("-")[1] || "";
      let score = 0;
      if (language === target) score += 120;
      else if (voiceBase === base) score += 75;
      if (voiceRegion && voiceRegion === preferredRegion) score += 18;
      if (qualityPattern.test(voice.name)) score += 24;
      if (voice.default) score += 4;
      if (noveltyPattern.test(voice.name)) score -= 100;
      return { voice, score };
    })
    .filter(({ score }) => score >= 70)
    .sort((a, b) => b.score - a.score)[0]?.voice;
}

export function speechRateFor(locale: LocaleCode, realistic: boolean) {
  const base = ["ja", "ko", "zh-CN", "zh-TW", "th", "vi"].includes(locale)
    ? 0.9
    : 0.96;
  return realistic ? Math.min(1.02, base + 0.06) : base;
}
