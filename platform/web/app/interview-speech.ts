import { LocaleCode } from "./i18n";

export type InterviewPersonaId =
  | "hr"
  | "hiring-manager"
  | "coo"
  | "ceo"
  | "peer"
  | "case";

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
    "hiring-manager": "用人主管",
    coo: "營運長",
    ceo: "執行長",
    peer: "未來同事",
    case: "案例拆解",
  },
  "zh-CN": {
    hr: "人力资源初筛",
    "hiring-manager": "招聘经理",
    coo: "首席运营官",
    ceo: "首席执行官",
    peer: "未来同事",
    case: "案例分析",
  },
  ja: {
    hr: "人事スクリーニング",
    "hiring-manager": "採用責任者",
    coo: "COO",
    ceo: "CEO",
    peer: "将来の同僚",
    case: "ケース面接",
  },
  ko: {
    hr: "HR 스크리닝",
    "hiring-manager": "채용 관리자",
    coo: "COO",
    ceo: "CEO",
    peer: "미래 동료",
    case: "케이스 분석",
  },
  es: {
    hr: "Filtro de RR. HH.",
    "hiring-manager": "Responsable de contratación",
    coo: "Dirección de operaciones",
    ceo: "Dirección general",
    peer: "Futuro compañero",
    case: "Resolución de caso",
  },
  fr: {
    hr: "Présélection RH",
    "hiring-manager": "Responsable du recrutement",
    coo: "Direction des opérations",
    ceo: "Direction générale",
    peer: "Futur collègue",
    case: "Étude de cas",
  },
  de: {
    hr: "HR-Vorgespräch",
    "hiring-manager": "Einstellende Führungskraft",
    coo: "Betriebsleitung",
    ceo: "Geschäftsführung",
    peer: "Künftige Kollegin oder künftiger Kollege",
    case: "Fallstudie",
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
  const template =
    GENERIC_QUESTIONS[locale][Math.min(turn, GENERIC_QUESTIONS[locale].length - 1)];
  return template
    .replaceAll("{proof}", proofLabel)
    .replaceAll("{gap}", gapLabel);
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
