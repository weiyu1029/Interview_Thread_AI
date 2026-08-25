import type { LocaleCode } from "./i18n";

export const INFORMATION_PAGE_KEYS = [
  "about",
  "contact",
  "terms",
  "privacy",
] as const;

export type InformationPageKey = (typeof INFORMATION_PAGE_KEYS)[number];

type InformationLabels = {
  heading: string;
  about: string;
  contact: string;
  terms: string;
  privacy: string;
  repository: string;
};

type InformationSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type InformationPageCopy = {
  eyebrow: string;
  title: string;
  description: string;
  updated?: string;
  callout?: string;
  sections: InformationSection[];
};

const informationLabels = {
  en: { heading: "Information", about: "About", contact: "Contact us", terms: "Terms of use", privacy: "Privacy policy", repository: "Open-source repository" },
  ja: { heading: "情報", about: "私たちについて", contact: "お問い合わせ", terms: "利用規約", privacy: "プライバシーポリシー", repository: "オープンソース・リポジトリ" },
  ko: { heading: "안내", about: "소개", contact: "문의하기", terms: "이용약관", privacy: "개인정보 처리방침", repository: "오픈 소스 저장소" },
  "zh-CN": { heading: "信息", about: "关于我们", contact: "联系我们", terms: "服务条款", privacy: "隐私政策", repository: "开源代码库" },
  "zh-TW": { heading: "網站資訊", about: "關於我們", contact: "聯絡我們", terms: "服務條款", privacy: "隱私權政策", repository: "開源程式庫" },
  es: { heading: "Información", about: "Quiénes somos", contact: "Contacto", terms: "Términos de uso", privacy: "Política de privacidad", repository: "Repositorio de código abierto" },
  fr: { heading: "Informations", about: "À propos", contact: "Nous contacter", terms: "Conditions d’utilisation", privacy: "Politique de confidentialité", repository: "Dépôt open source" },
  de: { heading: "Informationen", about: "Über uns", contact: "Kontakt", terms: "Nutzungsbedingungen", privacy: "Datenschutzerklärung", repository: "Open-Source-Repository" },
  "pt-BR": { heading: "Informações", about: "Sobre nós", contact: "Fale conosco", terms: "Termos de uso", privacy: "Política de privacidade", repository: "Repositório de código aberto" },
  it: { heading: "Informazioni", about: "Chi siamo", contact: "Contatti", terms: "Termini di utilizzo", privacy: "Informativa sulla privacy", repository: "Repository open source" },
  nl: { heading: "Informatie", about: "Over ons", contact: "Contact", terms: "Gebruiksvoorwaarden", privacy: "Privacybeleid", repository: "Open-sourcerepository" },
  pl: { heading: "Informacje", about: "O nas", contact: "Kontakt", terms: "Warunki użytkowania", privacy: "Polityka prywatności", repository: "Repozytorium open source" },
  tr: { heading: "Bilgi", about: "Hakkımızda", contact: "İletişim", terms: "Kullanım koşulları", privacy: "Gizlilik politikası", repository: "Açık kaynak deposu" },
  ru: { heading: "Информация", about: "О нас", contact: "Связаться с нами", terms: "Условия использования", privacy: "Политика конфиденциальности", repository: "Репозиторий с открытым кодом" },
  uk: { heading: "Інформація", about: "Про нас", contact: "Зв’язатися з нами", terms: "Умови використання", privacy: "Політика конфіденційності", repository: "Репозиторій з відкритим кодом" },
  ar: { heading: "معلومات", about: "من نحن", contact: "اتصل بنا", terms: "شروط الاستخدام", privacy: "سياسة الخصوصية", repository: "مستودع مفتوح المصدر" },
  he: { heading: "מידע", about: "אודות", contact: "יצירת קשר", terms: "תנאי שימוש", privacy: "מדיניות פרטיות", repository: "מאגר קוד פתוח" },
  hi: { heading: "जानकारी", about: "हमारे बारे में", contact: "संपर्क करें", terms: "उपयोग की शर्तें", privacy: "गोपनीयता नीति", repository: "ओपन-सोर्स रिपॉज़िटरी" },
  bn: { heading: "তথ্য", about: "আমাদের সম্পর্কে", contact: "যোগাযোগ", terms: "ব্যবহারের শর্তাবলি", privacy: "গোপনীয়তা নীতি", repository: "ওপেন-সোর্স রিপোজিটরি" },
  ur: { heading: "معلومات", about: "ہمارے بارے میں", contact: "رابطہ کریں", terms: "استعمال کی شرائط", privacy: "رازداری کی پالیسی", repository: "اوپن سورس ریپوزٹری" },
  id: { heading: "Informasi", about: "Tentang kami", contact: "Hubungi kami", terms: "Ketentuan penggunaan", privacy: "Kebijakan privasi", repository: "Repositori sumber terbuka" },
  ms: { heading: "Maklumat", about: "Tentang kami", contact: "Hubungi kami", terms: "Syarat penggunaan", privacy: "Dasar privasi", repository: "Repositori sumber terbuka" },
  th: { heading: "ข้อมูล", about: "เกี่ยวกับเรา", contact: "ติดต่อเรา", terms: "ข้อกำหนดการใช้งาน", privacy: "นโยบายความเป็นส่วนตัว", repository: "คลังโค้ดโอเพนซอร์ส" },
  vi: { heading: "Thông tin", about: "Về chúng tôi", contact: "Liên hệ", terms: "Điều khoản sử dụng", privacy: "Chính sách quyền riêng tư", repository: "Kho mã nguồn mở" },
  fil: { heading: "Impormasyon", about: "Tungkol sa amin", contact: "Makipag-ugnayan", terms: "Mga tuntunin ng paggamit", privacy: "Patakaran sa privacy", repository: "Open-source repository" },
  sv: { heading: "Information", about: "Om oss", contact: "Kontakta oss", terms: "Användarvillkor", privacy: "Integritetspolicy", repository: "Öppen källkodsrepo" },
  no: { heading: "Informasjon", about: "Om oss", contact: "Kontakt oss", terms: "Bruksvilkår", privacy: "Personvernerklæring", repository: "Åpen kildekode" },
  da: { heading: "Information", about: "Om os", contact: "Kontakt os", terms: "Brugsvilkår", privacy: "Privatlivspolitik", repository: "Open source-repository" },
  fi: { heading: "Tiedot", about: "Tietoa meistä", contact: "Ota yhteyttä", terms: "Käyttöehdot", privacy: "Tietosuojakäytäntö", repository: "Avoimen lähdekoodin repositorio" },
  cs: { heading: "Informace", about: "O nás", contact: "Kontakt", terms: "Podmínky použití", privacy: "Zásady ochrany osobních údajů", repository: "Open-source repozitář" },
  sk: { heading: "Informácie", about: "O nás", contact: "Kontakt", terms: "Podmienky používania", privacy: "Zásady ochrany osobných údajov", repository: "Open-source repozitár" },
  hu: { heading: "Információ", about: "Rólunk", contact: "Kapcsolat", terms: "Felhasználási feltételek", privacy: "Adatvédelmi irányelvek", repository: "Nyílt forráskódú tárhely" },
  ro: { heading: "Informații", about: "Despre noi", contact: "Contact", terms: "Condiții de utilizare", privacy: "Politica de confidențialitate", repository: "Depozit open source" },
  el: { heading: "Πληροφορίες", about: "Σχετικά με εμάς", contact: "Επικοινωνία", terms: "Όροι χρήσης", privacy: "Πολιτική απορρήτου", repository: "Αποθετήριο ανοικτού κώδικα" },
  bg: { heading: "Информация", about: "За нас", contact: "Контакти", terms: "Условия за ползване", privacy: "Политика за поверителност", repository: "Хранилище с отворен код" },
  hr: { heading: "Informacije", about: "O nama", contact: "Kontakt", terms: "Uvjeti korištenja", privacy: "Pravila privatnosti", repository: "Repozitorij otvorenog koda" },
  sr: { heading: "Информације", about: "О нама", contact: "Контакт", terms: "Услови коришћења", privacy: "Политика приватности", repository: "Репозиторијум отвореног кода" },
  sl: { heading: "Informacije", about: "O nas", contact: "Kontakt", terms: "Pogoji uporabe", privacy: "Pravilnik o zasebnosti", repository: "Odprtokodni repozitorij" },
  sw: { heading: "Taarifa", about: "Kuhusu sisi", contact: "Wasiliana nasi", terms: "Masharti ya matumizi", privacy: "Sera ya faragha", repository: "Hazina ya chanzo huria" },
  fa: { heading: "اطلاعات", about: "دربارهٔ ما", contact: "تماس با ما", terms: "شرایط استفاده", privacy: "سیاست حفظ حریم خصوصی", repository: "مخزن متن‌باز" },
} satisfies Record<LocaleCode, InformationLabels>;

const englishPages: Record<InformationPageKey, InformationPageCopy> = {
  about: {
    eyebrow: "Why InterviewThread exists",
    title: "AI should help you explain the truth—not replace it.",
    description:
      "InterviewThread turns a real resume and a real job description into evidence-backed stories and realistic interview practice.",
    callout: "Resume + job post → evidence map → defensible stories → realistic practice",
    sections: [
      {
        title: "Where we started",
        paragraphs: [
          "InterviewThread began after watching new graduates and friends reach for generic AI because they needed fast help with resumes and interviews. The drafts sounded polished, but they often did not sound like the person—or stay close enough to what that person had actually done.",
          "At the same time, job descriptions felt overwhelming. People could not tell which requirements mattered, how their experience mapped to the role, or what a recruiter would challenge. Even after earning an interview, many had nowhere safe to practice, especially people interviewing in a second language.",
        ],
      },
      {
        title: "A different starting point",
        paragraphs: [
          "We start with evidence. The product separates supported strengths from real gaps, helps candidates shape stories they can defend, and asks the follow-up questions that different interviewers are likely to ask. It is designed to make a candidate clearer and more confident without inventing achievements.",
        ],
      },
      {
        title: "What we believe",
        bullets: [
          "Truth before polish: every important claim should trace back to candidate-provided evidence.",
          "Clarity before automation: users should understand why a match, gap, or recommendation appears.",
          "Practice builds confidence: realistic follow-ups matter more than memorizing a perfect script.",
          "Access matters: the core product is open source so the community can inspect and improve it.",
        ],
      },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Contact the right inbox—and keep personal data private.",
    description:
      "Questions, product feedback, partnerships, support, privacy requests, security reports, and open-source contributions each have a clear path.",
    callout: "Never post a resume, interview transcript, password, OAuth token, or API key by email or in a public issue. Use sample content for product reports.",
    sections: [
      {
        title: "Product questions and feedback",
        paragraphs: [
          "Use GitHub Issues for reproducible bugs, accessibility problems, and feature requests. Remove personal data and use sample content before posting.",
        ],
      },
      {
        title: "Privacy, deletion, or security",
        paragraphs: [
          "Use GitHub private vulnerability reporting for a privacy request, account-data deletion request, or security concern. Include the sign-in provider and approximate sign-in date, but never include a password, provider token, API key, or full resume.",
        ],
      },
      {
        title: "Contribute",
        paragraphs: [
          "InterviewThread is maintained in public. Read the contribution guide, propose an issue, or submit a focused pull request in the open-source repository.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Terms of use",
    title: "Terms for the open-source InterviewThread service",
    description:
      "These terms explain acceptable use, account responsibilities, AI limitations, third-party services, and the current community-preview status.",
    updated: "Effective August 20, 2026",
    callout:
      "Community preview: billing is not enabled. These terms are a product-aligned draft and should receive legal review before a paid or incorporated launch.",
    sections: [
      {
        title: "1. Agreement and eligibility",
        paragraphs: [
          "By accessing the hosted InterviewThread service, you agree to these terms. If you do not agree, do not use the service. You must be at least 16, meet the minimum digital-consent age where you live, and have any guardian permission required by local law.",
        ],
      },
      {
        title: "2. What the service does",
        paragraphs: [
          "InterviewThread helps you compare candidate-provided experience with a job description, identify evidence and gaps, prepare truthful interview stories, and practice questions. It does not apply for jobs, contact employers, make hiring decisions, provide legal or immigration advice, or guarantee interviews or employment.",
        ],
      },
      {
        title: "3. Accounts",
        paragraphs: [
          "You may sign in through Google, GitHub, or LinkedIn. You are responsible for protecting your provider account and for activity performed through your session. Tell us promptly through the private contact channel if you suspect unauthorized access.",
        ],
      },
      {
        title: "4. Your content and truthfulness",
        paragraphs: [
          "You keep ownership of the resumes, job descriptions, links, answers, and feedback you provide. You give the service only the limited permission needed to process that content for the features you request. You must have the right to use the content and must not use InterviewThread to fabricate qualifications, achievements, credentials, employment history, or other material facts.",
        ],
      },
      {
        title: "5. Acceptable use",
        bullets: [
          "Do not break the law, infringe rights, impersonate another person, harass others, or upload malware or secrets you are not authorized to share.",
          "Do not bypass security or rate limits, interfere with the service, probe other users’ data, or use automated access that harms the service.",
          "Do not scrape or automate third-party job sites in violation of their rules. Use approved feeds, partner access, or content you are authorized to provide.",
          "Do not use outputs as the sole basis for employment, legal, credit, housing, insurance, or other high-impact decisions about another person.",
        ],
      },
      {
        title: "6. AI and scoring limitations",
        paragraphs: [
          "AI, keyword extraction, speech recognition, job-market data, and scoring can be incomplete or wrong. Scores are preparation aids, not objective measures of employability. Review every suggestion, correct the transcript, verify external information, and keep final control of what you say or submit.",
        ],
      },
      {
        title: "7. Third-party services",
        paragraphs: [
          "OAuth providers, browsers, speech services, model endpoints, job-data sources, and linked practice sites operate under their own terms and privacy policies. InterviewThread does not control their availability or data practices. Connecting a service authorizes only the scope shown in its consent screen.",
        ],
      },
      {
        title: "8. Open source, availability, and changes",
        paragraphs: [
          "The source code is available under the repository’s license. The hosted community service is provided without charge and may change, pause, or stop. Open-source availability does not promise permanent hosting, support, compatibility, or preservation of local browser data.",
        ],
      },
      {
        title: "9. Disclaimers and liability",
        paragraphs: [
          "To the maximum extent permitted by applicable law, the service is provided “as is” and “as available,” without warranties. The maintainers are not liable for lost opportunities, inaccurate output, third-party conduct, lost local data, or indirect or consequential loss. Nothing in these terms excludes rights or liability that cannot legally be excluded.",
        ],
      },
      {
        title: "10. Suspension, updates, and contact",
        paragraphs: [
          "Access may be limited for abuse, security risk, legal requirements, or material breach of these terms. Material changes will be dated on this page. Questions and private requests should use the contact channels linked below. Applicable mandatory consumer and data-protection law continues to apply.",
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Privacy policy",
    title: "Your career evidence should stay under your control.",
    description:
      "This notice describes what the hosted InterviewThread service handles, what stays on your device, why limited account data is stored, and how to request deletion.",
    updated: "Effective August 21, 2026",
    callout:
      "At a glance: no advertising profiles, no sale of personal data, no automatic LinkedIn or GitHub import, and no stored OAuth access tokens.",
    sections: [
      {
        title: "1. Scope and who is responsible",
        paragraphs: [
          "This policy applies to the hosted InterviewThread website and its account, feedback, and activity features. In this community-preview policy, “InterviewThread,” “we,” and “us” mean the maintainers operating the hosted open-source service. Self-hosted deployments and third-party forks are controlled by their own operators and policies.",
        ],
      },
      {
        title: "2. Information that stays on your device",
        paragraphs: [
          "For signed-in use, the workspace may keep resume and career-evidence text, job descriptions, optional source text and URLs, interview answers and transcripts, tracker items, alerts, language preferences, and local-model settings in browser memory or local storage unless a feature clearly says it will send data elsewhere. Guest mode keeps interview work only in the current page session and does not save interview history, practice progress, tracker items, or model settings; language preference may still be remembered. A URL alone is provenance; it is not automatically fetched or treated as evidence.",
        ],
      },
      {
        title: "3. Account information we store",
        paragraphs: [
          "When you choose Google, GitHub, or LinkedIn sign-in, we store the provider name, provider account ID, display name, verified email when available, profile-image URL, and—when GitHub provides them—public username and profile URL. We use this only to create and protect your InterviewThread account and associate your own activity with it.",
          "Provider access and refresh tokens are discarded after the identity response and are not stored. The app does not silently link different providers by matching email and does not automatically import profiles, repositories, contacts, resumes, or posts.",
        ],
      },
      {
        title: "4. Feedback and activity information",
        paragraphs: [
          "If you submit feedback, we store its category, rating, message, locale, status, timestamp, account owner, product version, product surface, and active beta cohort when applicable. For signed-in use, we may store limited event records such as analysis completed, interview started or answered, tracker updated, feedback submitted, and beta application or withdrawal. These records indicate that an action happened; they do not contain the resume, job description, answer transcript, or raw voice recording.",
          "When you use a contact or partnership form, the name, reply-to email, topic, message, locale, and source page you provide are sent through our transactional email provider to the relevant InterviewThread inbox. Do not include passwords, tokens, full resumes, interview transcripts, or other sensitive information in these forms.",
          "If you apply for closed beta, we store your structured role family, experience level, interview timing, primary goal, locale, cohort status, separate research/update choices, and the terms, privacy, and product versions you accepted. We do not ask for a resume or open-ended career history in the beta application. You can withdraw from beta without deleting your account.",
        ],
      },
      {
        title: "5. Voice, local models, job data, and ordinary logs",
        paragraphs: [
          "Voice answers use a two-stage flow. While you speak, the browser or device provides provisional live captions. For signed-in users, when cloud correction is configured and available, InterviewThread temporarily sends the recorded answer audio, selected language, and up to 80 short vocabulary hints drawn from the role, resume, and job description to Microsoft Azure Speech to produce a more accurate final transcript. The vocabulary hints are terms, not the full resume or job description.",
          "InterviewThread does not store raw voice audio or write it to logs. The transcription response is returned with private no-store instructions, and you can review and edit the recognized text before submitting it as an answer. Guest mode remains browser-only. If recording or cloud correction is unavailable or fails, the browser or device transcript remains in the answer box instead of being erased. The browser, operating system, and Microsoft may process voice data under their own policies.",
          "When cloud read-aloud is configured and you ask InterviewThread to read a question, only the current question text and selected language are sent to Microsoft Azure Speech to generate the audio response. This read-aloud request does not include your resume, job description, answer, transcript, or raw voice recording. InterviewThread returns the audio with private no-store instructions and does not save it; if cloud speech is unavailable, the feature falls back to the browser or device voice. Microsoft may process the request under its own privacy terms.",
          "If you connect a local or third-party model endpoint, your browser sends the content shown by that feature to the endpoint you configured. Model settings stay in local storage; review that provider’s terms before sending career data. Requests to approved job sources send the board or search parameters needed to retrieve listings. Hosting and security providers may process standard request information such as IP address, user agent, requested URL, and time.",
        ],
      },
      {
        title: "6. Why we process information",
        bullets: [
          "Provide and secure sign-in, sessions, requested product features, and account-owned history.",
          "Return job data, support speech and user-configured model connections, and remember device preferences.",
          "Receive feedback, understand whether core workflows function, prevent abuse, investigate incidents, and meet legal obligations.",
        ],
      },
      {
        title: "7. Sharing and sales",
        paragraphs: [
          "We use service providers needed to operate the site, including Cloudflare infrastructure and D1, the identity provider you choose, Microsoft Azure Speech when signed-in cloud transcript correction or cloud read-aloud is configured and requested, and a transactional email provider for contact-form delivery. Data also goes to an external endpoint only when you select a feature that requires it. We do not sell personal data, build advertising profiles, share career evidence with employers, or use the service to make employment decisions.",
        ],
      },
      {
        title: "8. Retention and deletion",
        paragraphs: [
          "Guest workspace content is not written to an InterviewThread account or local interview history and is lost when the page session ends. Signed-in local workspace data remains until you clear site data or the browser removes it. OAuth state expires after ten minutes. A signed-in session expires after 30 days; only a hash of the session token is stored. Account identity, feedback, and limited activity records are kept while needed to provide the community service, handle requests, secure the service, or meet legal obligations.",
          "To request access, correction, export, or deletion of hosted account data, use the private contact channel and identify your sign-in provider and approximate sign-in date. Do not send passwords or tokens. You may separately revoke InterviewThread in your provider’s connected-app settings. We will verify the request before acting.",
        ],
      },
      {
        title: "9. Security, international use, and your choices",
        paragraphs: [
          "We use scoped OAuth access, PKCE, signed short-lived state, HttpOnly session cookies, hashed session tokens, transport encryption, and access checks. No online service can promise perfect security. The service may be accessed globally and information handled by providers may be processed in countries with different laws.",
          "Depending on where you live, you may have rights to access, correct, delete, restrict, object, withdraw consent, or receive a copy of personal data, and to complain to a regulator. You can avoid account activity storage by using guest mode, avoid voice input and read-aloud, avoid external models, or clear browser data. Guest interview history and practice progress are not saved.",
        ],
      },
      {
        title: "10. Children, changes, and contact",
        paragraphs: [
          "InterviewThread is designed for job seekers and is not directed to children under 16. We do not knowingly collect their account data. Material policy changes will be dated here and, when required, presented for consent before a new use of data. Use the contact page for product questions and the private channel for privacy or security requests.",
        ],
      },
    ],
  },
};

const traditionalChinesePages: Record<InformationPageKey, InformationPageCopy> = {
  about: {
    eyebrow: "InterviewThread 為何存在",
    title: "AI 應該幫你說清楚真實經驗，而不是替你捏造一個人設。",
    description: "InterviewThread 將真實履歷與真實職缺描述，轉成有證據的故事與貼近職位的面試練習。",
    callout: "履歷＋職缺描述 → 證據地圖 → 可被追問的真實故事 → 實際面試練習",
    sections: [
      {
        title: "我們的出發點",
        paragraphs: [
          "InterviewThread 的起點，是看見許多剛畢業的朋友為了快速完成履歷與準備面試而使用通用 AI。產出的文字很流暢，卻常常不像本人，甚至離本人真正做過的事太遠。",
          "同時，密密麻麻的職缺描述也讓人不知從何開始：哪些條件最重要、自己的經驗能不能對上、招募者會追問什麼，都不容易判斷。即使拿到面試，很多人仍缺少能安心練習的地方；用第二語言面試的人尤其如此。",
        ],
      },
      {
        title: "從證據開始，而不是從漂亮句子開始",
        paragraphs: [
          "我們先區分真正有證據的優勢與仍需補足的缺口，再協助使用者整理能夠誠實回答追問的故事，並依照不同面試官角色練習。目標不是讓每個答案聽起來完美，而是讓使用者更清楚、更有信心，也更能為自己說過的每一句話負責。",
        ],
      },
      {
        title: "我們相信",
        bullets: [
          "真實優先於修飾：重要主張應該能回到使用者提供的證據。",
          "理解優先於自動化：使用者應該知道匹配、缺口與建議為何出現。",
          "信心來自練習：真實追問比背誦一個完美答案更有用。",
          "好的工具應可被檢驗：核心產品免費開源，讓社群能檢查與改進。",
        ],
      },
    ],
  },
  contact: {
    eyebrow: "聯絡我們",
    title: "依照問題選擇正確信箱，也請妥善保護個人資料。",
    description: "一般問題、產品回饋、合作、客服、資料刪除、安全通報與開源貢獻，都有清楚的處理方式。",
    callout: "請勿透過電子郵件或公開 issue 傳送密碼、OAuth token、API key、完整履歷或面試逐字稿；產品問題請改用示範內容。",
    sections: [
      { title: "產品問題與意見回饋", paragraphs: ["可透過 GitHub Issues 回報可重現的錯誤、無障礙問題或功能建議。送出前請移除個人資料並改用示範內容。"] },
      { title: "隱私、刪除或安全問題", paragraphs: ["請使用 GitHub 私人安全通報提出隱私問題、帳號資料刪除或資安疑慮。可提供登入服務與大約登入日期，但請勿提供密碼、provider token、API key 或完整履歷。"] },
      { title: "參與開源", paragraphs: ["InterviewThread 在公開程式庫維護。你可以閱讀貢獻指南、提出 issue，或送出範圍清楚的 pull request。"] },
    ],
  },
  terms: {
    eyebrow: "服務條款",
    title: "InterviewThread 免費開源服務條款",
    description: "本條款說明可接受的使用方式、帳號責任、AI 限制、第三方服務與目前的社群預覽狀態。",
    updated: "生效日期：2026 年 8 月 20 日",
    callout: "社群預覽：目前尚未啟用付款。此版本依照現有產品行為撰寫；在啟用付費或成立正式營運主體前，仍應由合格法律專業人士審閱。",
    sections: [
      { title: "1. 同意與使用資格", paragraphs: ["使用託管版 InterviewThread 即表示你同意本條款；若不同意，請停止使用。你必須年滿 16 歲、符合所在地的最低數位同意年齡，並取得當地法律要求的監護人同意。"] },
      { title: "2. 服務內容", paragraphs: ["InterviewThread 協助比較使用者提供的經驗與職缺描述、辨識證據與缺口、準備真實面試故事並練習問題。它不會代為投遞、聯絡雇主、做出聘僱決策、提供法律或移民建議，也不保證面試或錄取。"] },
      { title: "3. 帳號", paragraphs: ["你可透過 Google、GitHub 或 LinkedIn 登入。你有責任保護第三方帳號與登入工作階段。若懷疑未授權存取，請立即透過私人聯絡管道通知我們。"] },
      { title: "4. 你的內容與真實性", paragraphs: ["你保有履歷、職缺描述、連結、答案與回饋的所有權，並只授予執行你所要求功能的必要處理權限。你必須有權使用相關內容，且不得利用 InterviewThread 捏造資格、成就、證照、經歷或其他重要事實。"] },
      { title: "5. 可接受的使用方式", bullets: ["不得違法、侵害權利、冒充他人、騷擾他人，或上傳惡意程式與未獲授權的機密。", "不得繞過安全或速率限制、干擾服務、探查其他使用者資料，或以有害自動化方式存取服務。", "不得違反第三方規則抓取或自動操作職缺網站；只可使用核准資料源、合作授權或你有權提供的內容。", "不得把輸出作為對他人做出聘僱、法律、信用、住房、保險或其他高影響決策的唯一依據。"] },
      { title: "6. AI 與評分限制", paragraphs: ["AI、關鍵字擷取、語音辨識、市場資料與評分都可能不完整或錯誤。分數只用於準備，不是客觀的就業能力判定。請檢查每個建議、修正逐字稿、驗證外部資料，並保留對最後說法與送出內容的控制。"] },
      { title: "7. 第三方服務", paragraphs: ["OAuth 登入服務、瀏覽器、語音服務、模型端點、職缺資料源與外部練習網站皆受其自身條款與隱私政策約束。InterviewThread 無法控制其可用性或資料作法；連結服務只授權同意畫面所列的範圍。"] },
      { title: "8. 開源、可用性與變更", paragraphs: ["程式碼依程式庫所列授權公開。託管的社群服務目前免費，可能變更、暫停或停止。開源不代表永久託管、支援、相容性或本機瀏覽器資料的永久保存。"] },
      { title: "9. 免責與責任限制", paragraphs: ["在適用法律允許的最大範圍內，本服務按現況與可用狀態提供，不作保證。維護者不對失去的機會、不準確輸出、第三方行為、本機資料遺失或間接與衍生損失負責；法律不得排除的權利與責任不受影響。"] },
      { title: "10. 限制存取、更新與聯絡", paragraphs: ["若有濫用、安全風險、法律要求或重大違約，服務可能限制存取。重大條款變更會更新本頁日期。問題與私人請求請使用下方聯絡管道；強制適用的消費者與資料保護法律仍然有效。"] },
    ],
  },
  privacy: {
    eyebrow: "隱私權政策",
    title: "你的職涯證據應該由你控制。",
    description: "本政策說明託管版 InterviewThread 會處理什麼、哪些資料留在裝置、為何保存有限的帳號資料，以及如何要求刪除。",
    updated: "生效日期：2026 年 8 月 21 日",
    callout: "重點：沒有廣告画像、不販售個人資料、不自動匯入 LinkedIn 或 GitHub，也不保存 OAuth access token。",
    sections: [
      { title: "1. 適用範圍與負責對象", paragraphs: ["本政策適用於託管版 InterviewThread 網站及其帳號、回饋與活動功能。在此社群預覽政策中，「InterviewThread」與「我們」指營運此託管開源服務的維護者。自行架設或第三方 fork 應由各自營運者提供政策。"] },
      { title: "2. 留在你裝置上的資料", paragraphs: ["登入使用時，工作區可能將履歷與職涯證據文字、職缺描述、選填來源文字與網址、面試答案與逐字稿、追蹤項目、提醒、語言偏好與本機模型設定保留在瀏覽器記憶體或 local storage；只有在功能清楚告知要傳送時才會送往外部。訪客模式只在目前頁面工作階段保留面試內容，不會儲存面試紀錄、練習進度、追蹤項目或模型設定；語言偏好仍可能被記住。單一網址只代表來源，不會自動抓取或直接視為證據。"] },
      { title: "3. 我們保存的帳號資料", paragraphs: ["當你選擇 Google、GitHub 或 LinkedIn 登入，我們會保存 provider 名稱、provider account ID、顯示名稱、可取得的已驗證 email、頭像網址，以及 GitHub 提供時的公開使用者名稱與個人頁網址。用途限於建立與保護 InterviewThread 帳號，並把你自己的活動連結到帳號。", "取得身分資料後，provider access token 與 refresh token 會被捨棄且不存入資料庫。系統不會只憑相同 email 默默合併不同 provider，也不會自動匯入個人頁、程式庫、聯絡人、履歷或貼文。"] },
      { title: "4. 回饋、活動與封測申請資料", paragraphs: ["若你主動送出意見回饋，我們會保存分類、評分、訊息、語言、狀態、時間、帳號擁有者、產品版本、功能頁面，以及適用時的封測梯次。登入後也可能保存有限事件，例如完成分析、開始或回答面試、更新追蹤器、送出回饋、申請或退出封測。事件只表示操作曾發生，不包含履歷、職缺描述、答案逐字稿或原始語音。", "當你使用聯絡或合作洽詢表單時，你提供的姓名、回覆信箱、主題、訊息、語言與來源頁面，會透過交易郵件服務商寄送至對應的 InterviewThread 官方信箱。請勿在表單中提供密碼、權杖、完整履歷、面試逐字稿或其他敏感資料。", "若你申請封閉測試，我們會保存結構化的職類、資歷、面試時程、主要需求、語言、梯次狀態、分開選擇的研究／更新同意，以及你接受的條款、隱私與產品版本。封測申請不要求履歷或自由書寫的職涯歷史；你可以退出封測而不刪除帳號。"] },
      { title: "5. 語音、本機模型、職缺資料與一般紀錄", paragraphs: ["語音作答採兩階段流程。說話時，瀏覽器或裝置會先提供即時草稿字幕。已登入且雲端校正已設定並可用時，InterviewThread 會暫時把回答錄音、所選語言，以及從職務、履歷與職缺描述擷取的最多 80 個簡短詞彙提示傳送至 Microsoft Azure Speech，以產生較精準的最終逐字稿；詞彙提示只包含短詞，不包含完整履歷或職缺描述。", "InterviewThread 不保存或記錄原始回答音訊，逐字稿回應採私密且不得快取的設定。你可以在送出答案前檢查並修改辨識文字。訪客模式只使用瀏覽器；若錄音或雲端校正無法使用或失敗，瀏覽器或裝置逐字稿仍會保留在回答欄，不會被清除。瀏覽器、作業系統與 Microsoft 可能依各自政策處理語音資料。", "當雲端朗讀已設定，而你要求 InterviewThread 朗讀問題時，只有目前的問題文字與所選語言會傳送至 Microsoft Azure Speech 以產生音訊回應。朗讀請求不包含履歷、職缺描述、答案、逐字稿或原始語音。InterviewThread 會以私密且不得快取的指示回傳音訊，且不會保存音訊；若雲端語音無法使用，系統會改用瀏覽器或裝置語音。Microsoft 可能依其自身隱私條款處理該請求。", "若你連結本機或第三方模型端點，瀏覽器會把該功能畫面所示內容傳到你設定的端點。模型設定留在 local storage；傳送職涯資料前請查閱該供應商政策。對核准職缺來源的請求會傳送取得職缺所需的看板或搜尋參數。託管與安全供應商可能處理 IP、瀏覽器資訊、請求網址與時間等標準請求資料。"] },
      { title: "6. 處理目的", bullets: ["提供並保護登入、工作階段、你要求的產品功能與帳號活動紀錄。", "取得職缺、支援語音與使用者自行設定的模型連線，並記住裝置偏好。", "接收回饋、確認核心流程是否可用、防止濫用、調查事件並遵守法律義務。"] },
      { title: "7. 分享與販售", paragraphs: ["我們使用營運網站所需的服務商，包括 Cloudflare 基礎設施與 D1、你選擇的身分提供者、在已登入的雲端逐字稿校正或雲端朗讀已設定且由你要求使用時使用的 Microsoft Azure Speech，以及負責寄送聯絡表單的交易郵件服務商。只有當你主動選擇需要外部端點的功能時，資料才會送往該端點。我們不販售個人資料、不建立廣告画像、不把職涯證據分享給雇主，也不使用本服務做出聘僱決策。"] },
      { title: "8. 保存與刪除", paragraphs: ["訪客工作區內容不會寫入 InterviewThread 帳號或本機面試紀錄，頁面工作階段結束後即會遺失。登入後的本機工作區資料則保留到你清除網站資料或瀏覽器移除為止。OAuth state 十分鐘後失效；登入工作階段 30 天後失效，資料庫只保存 session token 的雜湊。帳號身分、回饋與有限活動紀錄只在提供社群服務、處理請求、維護安全或遵守法律所需期間保存。", "如要存取、更正、匯出或刪除託管帳號資料，請透過私人聯絡管道提供登入 provider 與大約登入日期；不要提供密碼或 token。我們會先驗證請求。你也可以在 provider 的已連結應用程式設定中另行撤銷 InterviewThread。"] },
      { title: "9. 安全、跨國使用與你的選擇", paragraphs: ["我們採用最小範圍 OAuth、PKCE、短效簽章 state、HttpOnly session cookie、雜湊 session token、傳輸加密與存取檢查，但任何線上服務都無法保證絕對安全。服務可在全球存取，供應商可能在法律不同的國家處理資訊。", "依所在地不同，你可能有權要求存取、更正、刪除、限制、反對、撤回同意或取得個人資料副本，並向主管機關申訴。你可使用訪客模式避免建立帳號活動紀錄，也可不使用語音輸入與朗讀、不連結外部模型或清除瀏覽器資料；訪客的面試紀錄與練習進度不會儲存。"] },
      { title: "10. 兒童、變更與聯絡", paragraphs: ["InterviewThread 為求職者設計，不以 16 歲以下兒童為對象，也不會在知情情況下收集其帳號資料。重大政策變更會更新本頁日期；若法律要求，在以新方式使用資料前會再次取得同意。產品問題請使用聯絡頁，隱私或安全請求請使用私人管道。"] },
    ],
  },
};

export function informationLabelsFor(locale: LocaleCode): InformationLabels {
  return informationLabels[locale];
}

export function informationPageCopyFor(
  locale: LocaleCode,
  page: InformationPageKey,
): InformationPageCopy {
  return locale === "zh-TW" ? traditionalChinesePages[page] : englishPages[page];
}

export function informationPathSegment(page: InformationPageKey) {
  return page;
}
