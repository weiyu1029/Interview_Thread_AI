import { copyFor, LocaleCode } from "./i18n";
import { SEO_PAGES, SeoPageKey, SeoPageSpec } from "./seo-content";

type Headline = Pick<
  SeoPageSpec,
  "navLabel" | "title" | "description" | "primaryCta"
>;

export type SeoUiCopy = {
  howItWorks: string;
  questions: string;
  openWorkspace: string;
  seeHow: string;
  mapTitle: string;
  evidenceLinked: string;
  source: string;
  target: string;
  outcome: string;
  resumeEvidence: string;
  jobRequirements: string;
  interviewStory: string;
  clearerPath: string;
  whyBrand: string;
  accountable: string;
  beforeBegin: string;
  exploreWorkflow: string;
  connectedDecisions: string;
  finalTitle: string;
  openProduct: string;
  repository: string;
};

const REVIEWED_HEADLINES: Partial<
  Record<LocaleCode, Record<SeoPageKey, Headline>>
> = {
  ja: {
    "resume-job-description-match": {
      navLabel: "履歴書とJDのマッチング",
      title: "経験を作り変えずに、履歴書と求人票を照合。",
      description:
        "必須・中核・歓迎要件を分け、各キーワードを面接で説明できる実績に結び付けます。",
      primaryCta: "履歴書とJDを照合",
    },
    "career-story-builder": {
      navLabel: "キャリアストーリー作成",
      title: "証明できる経験から、面接ストーリーを作る。",
      description:
        "履歴書の実績を、状況・判断・行動・測定可能な成果が伝わる職種別ストーリーに整理します。",
      primaryCta: "ストーリーを作成",
    },
    "ai-mock-interview": {
      navLabel: "AI模擬面接",
      title: "本番の意図まで見据えて面接を練習。",
      description:
        "人事、採用責任者、経営層、同僚、ケース面接のAI面接官と、音声またはテキストで練習します。",
      primaryCta: "模擬面接を開始",
    },
    "resume-keyword-analyzer": {
      navLabel: "履歴書キーワード分析",
      title: "重要なキーワードと、その根拠を見つける。",
      description:
        "求人票の必須・中核・歓迎キーワードと同義語を分析し、各一致の根拠となる履歴書の記述を示します。",
      primaryCta: "キーワードを分析",
    },
    "job-match-recommendations": {
      navLabel: "求人レコメンド",
      title: "自分のストーリーで説明できる求人を提案。",
      description:
        "スキル、必須要件の充足、実績の強さ、勤務地、働き方から、世界中の求人を見つけます。",
      primaryCta: "適合する求人を探す",
    },
    "career-market-insights": {
      navLabel: "キャリア市場インサイト",
      title: "キャリア需要の変化を把握。",
      description:
        "地域、職種、業界、期間ごとに求人件数、勢い、地域シェア、需要の変化を確認します。",
      primaryCta: "市場インサイトを見る",
    },
  },
  ko: {
    "resume-job-description-match": {
      navLabel: "이력서–JD 매칭",
      title: "경력을 꾸며내지 않고 이력서와 채용 공고를 매칭하세요.",
      description:
        "필수·핵심·우대 요건을 구분하고 각 키워드를 면접에서 설명할 수 있는 실제 근거와 연결합니다.",
      primaryCta: "이력서와 JD 매칭",
    },
    "career-story-builder": {
      navLabel: "커리어 스토리 빌더",
      title: "증명할 수 있는 경험으로 면접 스토리를 만드세요.",
      description:
        "이력서 성과를 상황, 판단, 행동, 측정 가능한 결과가 담긴 직무별 이야기로 정리합니다.",
      primaryCta: "커리어 스토리 만들기",
    },
    "ai-mock-interview": {
      navLabel: "AI 모의 면접",
      title: "질문 뒤의 의도까지 대비해 연습하세요.",
      description:
        "HR, 채용 관리자, 경영진, 동료, 케이스 면접 역할의 AI 면접관과 음성 또는 텍스트로 연습합니다.",
      primaryCta: "모의 면접 시작",
    },
    "resume-keyword-analyzer": {
      navLabel: "이력서 키워드 분석",
      title: "중요한 키워드와 그 근거를 함께 찾으세요.",
      description:
        "필수·핵심·우대 키워드와 동의어를 분석하고 모든 매칭의 이력서 근거를 보여 줍니다.",
      primaryCta: "키워드 분석",
    },
    "job-match-recommendations": {
      navLabel: "맞춤 채용 추천",
      title: "내 스토리로 설명할 수 있는 일자리를 추천받으세요.",
      description:
        "기술, 필수 요건 충족도, 성과 근거, 지역, 근무 형태를 기준으로 전 세계 직무를 찾습니다.",
      primaryCta: "더 적합한 직무 찾기",
    },
    "career-market-insights": {
      navLabel: "커리어 시장 인사이트",
      title: "커리어 수요가 어디로 움직이는지 확인하세요.",
      description:
        "지역, 직무군, 산업, 기간별 채용 수, 성장세, 지역 비중과 수요 변화를 살펴봅니다.",
      primaryCta: "시장 인사이트 보기",
    },
  },
  "zh-CN": {
    "resume-job-description-match": {
      navLabel: "简历与 JD 匹配",
      title: "在不虚构经历的前提下匹配简历与职位描述。",
      description:
        "区分必要、核心与加分要求，并把每个关键词连接到面试中能够说明的真实证据。",
      primaryCta: "匹配简历与 JD",
    },
    "career-story-builder": {
      navLabel: "职业故事生成器",
      title: "用能够证明的经历打造面试故事。",
      description:
        "把简历成果整理成针对职位的故事，清楚呈现情境、判断、行动与可衡量结果。",
      primaryCta: "创建职业故事",
    },
    "ai-mock-interview": {
      navLabel: "AI 模拟面试",
      title: "针对问题背后的考察重点进行练习。",
      description:
        "通过语音或文字与 HR、招聘经理、高管、未来同事和案例面试官角色练习。",
      primaryCta: "开始模拟面试",
    },
    "resume-keyword-analyzer": {
      navLabel: "简历关键词分析",
      title: "找出真正重要的关键词及其证据。",
      description:
        "分析必要、核心与加分关键词及同义表达，并显示每项匹配对应的简历证据。",
      primaryCta: "分析简历关键词",
    },
    "job-match-recommendations": {
      navLabel: "职位匹配推荐",
      title: "获得你的故事真正能够支撑的职位推荐。",
      description:
        "结合技能、必要条件覆盖、成果证据、地区与工作方式，寻找全球更适合的职位。",
      primaryCta: "寻找更匹配的职位",
    },
    "career-market-insights": {
      navLabel: "职业市场洞察",
      title: "了解职业需求正在流向哪里。",
      description:
        "按地区、职类、行业与时间查看职位数量、增长趋势、区域占比及需求变化。",
      primaryCta: "查看市场洞察",
    },
  },
  "zh-TW": {
    "resume-job-description-match": {
      navLabel: "履歷與 JD 匹配",
      title: "在不虛構經歷的前提下，匹配履歷與職缺描述。",
      description:
        "區分必要、核心與加分要求，並將每個關鍵字連結到面試時能清楚說明的真實證據。",
      primaryCta: "匹配履歷與 JD",
    },
    "career-story-builder": {
      navLabel: "職涯故事建立器",
      title: "用你能證明的經歷，打造面試故事。",
      description:
        "把履歷成果整理成針對職缺的故事，清楚呈現情境、判斷、行動與可衡量成果。",
      primaryCta: "建立職涯故事",
    },
    "ai-mock-interview": {
      navLabel: "AI 模擬面試",
      title: "針對問題背後真正想了解的內容練習。",
      description:
        "透過語音或文字，與 HR、用人主管、高階主管、未來同事與案例面試官角色練習。",
      primaryCta: "開始模擬面試",
    },
    "resume-keyword-analyzer": {
      navLabel: "履歷關鍵字分析",
      title: "找出真正重要的關鍵字，以及背後的證據。",
      description:
        "分析必要、核心與加分關鍵字及同義表達，並顯示每項匹配所對應的履歷證據。",
      primaryCta: "分析履歷關鍵字",
    },
    "job-match-recommendations": {
      navLabel: "職缺匹配推薦",
      title: "獲得你的故事真正能支撐的職缺推薦。",
      description:
        "結合技能、必要條件涵蓋、成果證據、地區與工作方式，尋找全球更適合的職缺。",
      primaryCta: "尋找更匹配的職缺",
    },
    "career-market-insights": {
      navLabel: "職涯市場洞察",
      title: "看見職涯需求正在往哪裡移動。",
      description:
        "依地區、職類、產業與時間查看職缺數量、成長動能、區域占比與需求變化。",
      primaryCta: "查看市場洞察",
    },
  },
  es: {
    "resume-job-description-match": {
      navLabel: "Comparador CV–oferta",
      title: "Compara tu CV con una oferta sin inventar experiencia.",
      description:
        "Separa requisitos obligatorios, centrales y deseables, y vincula cada palabra clave con pruebas que puedas defender en una entrevista.",
      primaryCta: "Comparar CV y oferta",
    },
    "career-story-builder": {
      navLabel: "Creador de historias profesionales",
      title: "Crea historias de entrevista con experiencia demostrable.",
      description:
        "Convierte logros del CV en historias específicas para el puesto con contexto, decisión, acción y resultado medible.",
      primaryCta: "Crear mi historia",
    },
    "ai-mock-interview": {
      navLabel: "Entrevista simulada con IA",
      title: "Practica la intención que hay detrás de cada pregunta.",
      description:
        "Ensaya por voz o texto con entrevistadores IA de RR. HH., responsable de contratación, dirección, equipo y casos.",
      primaryCta: "Iniciar entrevista simulada",
    },
    "resume-keyword-analyzer": {
      navLabel: "Analizador de palabras clave",
      title: "Encuentra las palabras clave importantes y sus pruebas.",
      description:
        "Analiza términos obligatorios, centrales y deseables, reconoce sinónimos y muestra la evidencia exacta del CV.",
      primaryCta: "Analizar palabras clave",
    },
    "job-match-recommendations": {
      navLabel: "Recomendaciones de empleo",
      title: "Recibe empleos que tu historia realmente puede respaldar.",
      description:
        "Encuentra puestos globales según habilidades, requisitos, solidez de pruebas, ubicación y modalidad de trabajo.",
      primaryCta: "Buscar puestos adecuados",
    },
    "career-market-insights": {
      navLabel: "Análisis del mercado laboral",
      title: "Descubre hacia dónde se mueve la demanda profesional.",
      description:
        "Explora vacantes, impulso y cambios de demanda por región, familia profesional, sector y periodo.",
      primaryCta: "Explorar el mercado",
    },
  },
  fr: {
    "resume-job-description-match": {
      navLabel: "Correspondance CV–offre",
      title: "Comparez votre CV à une offre sans inventer d’expérience.",
      description:
        "Distinguez les critères obligatoires, essentiels et souhaités, puis reliez chaque mot-clé à une preuve défendable en entretien.",
      primaryCta: "Comparer le CV et l’offre",
    },
    "career-story-builder": {
      navLabel: "Créateur de récits professionnels",
      title: "Construisez des récits d’entretien à partir d’expériences prouvables.",
      description:
        "Transformez les résultats du CV en récits adaptés au poste, avec contexte, décision, action et résultat mesurable.",
      primaryCta: "Créer mon récit",
    },
    "ai-mock-interview": {
      navLabel: "Entretien simulé par IA",
      title: "Entraînez-vous à répondre à l’intention derrière la question.",
      description:
        "Répétez à l’oral ou à l’écrit avec des recruteurs IA : RH, manager, direction, collègue et étude de cas.",
      primaryCta: "Commencer l’entretien",
    },
    "resume-keyword-analyzer": {
      navLabel: "Analyseur de mots-clés CV",
      title: "Trouvez les mots-clés utiles et les preuves associées.",
      description:
        "Analysez les termes obligatoires, essentiels et souhaités, reconnaissez les synonymes et affichez la preuve exacte du CV.",
      primaryCta: "Analyser les mots-clés",
    },
    "job-match-recommendations": {
      navLabel: "Recommandations d’emploi",
      title: "Recevez des offres que votre histoire peut réellement soutenir.",
      description:
        "Trouvez des postes dans le monde selon les compétences, les critères obligatoires, les preuves, la région et le mode de travail.",
      primaryCta: "Trouver des postes adaptés",
    },
    "career-market-insights": {
      navLabel: "Tendances du marché de l’emploi",
      title: "Voyez où se déplace la demande professionnelle.",
      description:
        "Explorez les offres, la dynamique et l’évolution de la demande par région, métier, secteur et période.",
      primaryCta: "Explorer le marché",
    },
  },
  de: {
    "resume-job-description-match": {
      navLabel: "Lebenslauf–Stellenabgleich",
      title: "Gleiche Lebenslauf und Stellenanzeige ab, ohne Erfahrung zu erfinden.",
      description:
        "Trenne Pflicht-, Kern- und Wunschkriterien und verknüpfe jedes Schlüsselwort mit belegbarer Interview-Erfahrung.",
      primaryCta: "Lebenslauf und Stelle abgleichen",
    },
    "career-story-builder": {
      navLabel: "Karriere-Story-Builder",
      title: "Baue Interviewgeschichten aus Erfahrung, die du belegen kannst.",
      description:
        "Forme Erfolge aus dem Lebenslauf zu rollenspezifischen Geschichten mit Kontext, Entscheidung, Handlung und messbarem Ergebnis.",
      primaryCta: "Karriere-Story erstellen",
    },
    "ai-mock-interview": {
      navLabel: "KI-Probeinterview",
      title: "Übe die Absicht hinter der Interviewfrage.",
      description:
        "Trainiere per Sprache oder Text mit KI-Rollen für HR, Hiring Manager, Führungskraft, Team und Fallstudie.",
      primaryCta: "Probeinterview starten",
    },
    "resume-keyword-analyzer": {
      navLabel: "Lebenslauf-Keyword-Analyse",
      title: "Finde wichtige Schlüsselwörter und die Belege dahinter.",
      description:
        "Analysiere Pflicht-, Kern- und Wunschbegriffe, erkenne Synonyme und zeige den genauen Lebenslaufbeleg für jeden Treffer.",
      primaryCta: "Schlüsselwörter analysieren",
    },
    "job-match-recommendations": {
      navLabel: "Passende Stellenempfehlungen",
      title: "Erhalte Stellen, die deine Geschichte wirklich tragen kann.",
      description:
        "Finde weltweite Rollen anhand von Kompetenzen, Pflichtkriterien, Belegstärke, Standort und Arbeitsform.",
      primaryCta: "Passendere Rollen finden",
    },
    "career-market-insights": {
      navLabel: "Arbeitsmarkt-Insights",
      title: "Erkenne, wohin sich die Karrierenachfrage bewegt.",
      description:
        "Untersuche Stellen, Dynamik und Nachfrage nach Region, Rollenfamilie, Branche und Zeitraum.",
      primaryCta: "Arbeitsmarkt erkunden",
    },
  },
};

const REVIEWED_UI: Partial<Record<LocaleCode, SeoUiCopy>> = {
  ja: {
    howItWorks: "仕組み",
    questions: "よくある質問",
    openWorkspace: "ワークスペースを開く",
    seeHow: "仕組みを見る",
    mapTitle: "キャリアストーリーマップ",
    evidenceLinked: "根拠と連結",
    source: "情報源",
    target: "対象",
    outcome: "成果",
    resumeEvidence: "履歴書の実績",
    jobRequirements: "求人要件",
    interviewStory: "面接ストーリー",
    clearerPath: "経験から機会まで、より明確な道筋。",
    whyBrand: "InterviewThreadを選ぶ理由",
    accountable: "情報源に基づくから、実際に使える。",
    beforeBegin: "始める前に知っておくこと。",
    exploreWorkflow: "キャリアワークフローを見る",
    connectedDecisions: "一つの根拠マップで、六つの判断をつなぐ。",
    finalTitle: "本番の面接でも通用するストーリーを作りましょう。",
    openProduct: "InterviewThreadを開く",
    repository: "オープンソースリポジトリ",
  },
  ko: {
    howItWorks: "작동 방식",
    questions: "자주 묻는 질문",
    openWorkspace: "워크스페이스 열기",
    seeHow: "작동 방식 보기",
    mapTitle: "커리어 스토리 맵",
    evidenceLinked: "근거 연결",
    source: "출처",
    target: "목표",
    outcome: "결과",
    resumeEvidence: "이력서 근거",
    jobRequirements: "직무 요건",
    interviewStory: "면접 스토리",
    clearerPath: "경험에서 기회까지 더 분명한 경로.",
    whyBrand: "InterviewThread을 선택하는 이유",
    accountable: "출처에 책임을 지기 때문에 유용합니다.",
    beforeBegin: "시작하기 전에 알아둘 내용.",
    exploreWorkflow: "커리어 워크플로 살펴보기",
    connectedDecisions: "하나의 근거 맵으로 여섯 가지 결정을 연결합니다.",
    finalTitle: "실제 면접에서도 흔들리지 않는 스토리를 만드세요.",
    openProduct: "InterviewThread 열기",
    repository: "오픈 소스 저장소",
  },
  "zh-CN": {
    howItWorks: "工作方式",
    questions: "常见问题",
    openWorkspace: "打开工作区",
    seeHow: "查看工作方式",
    mapTitle: "职业故事地图",
    evidenceLinked: "证据已关联",
    source: "来源",
    target: "目标",
    outcome: "结果",
    resumeEvidence: "简历证据",
    jobRequirements: "职位要求",
    interviewStory: "面试故事",
    clearerPath: "从经历到机会的清晰路径。",
    whyBrand: "为什么选择 InterviewThread",
    accountable: "因为能够追溯到来源，所以真正实用。",
    beforeBegin: "开始前需要了解的内容。",
    exploreWorkflow: "探索职业工作流",
    connectedDecisions: "一张证据地图，连接六项职业决策。",
    finalTitle: "打造经得起真实面试追问的故事。",
    openProduct: "打开 InterviewThread",
    repository: "开源代码库",
  },
  "zh-TW": {
    howItWorks: "運作方式",
    questions: "常見問題",
    openWorkspace: "開啟工作區",
    seeHow: "查看運作方式",
    mapTitle: "職涯故事地圖",
    evidenceLinked: "已連結證據",
    source: "來源",
    target: "目標",
    outcome: "成果",
    resumeEvidence: "履歷證據",
    jobRequirements: "職缺要求",
    interviewStory: "面試故事",
    clearerPath: "從經歷走向機會的清楚路徑。",
    whyBrand: "為什麼選擇 InterviewThread",
    accountable: "因為能追溯到來源，所以真正實用。",
    beforeBegin: "開始前需要知道的內容。",
    exploreWorkflow: "探索職涯工作流程",
    connectedDecisions: "一張證據地圖，連結六項職涯決策。",
    finalTitle: "打造經得起真實面試追問的故事。",
    openProduct: "開啟 InterviewThread",
    repository: "開源程式碼庫",
  },
  es: {
    howItWorks: "Cómo funciona",
    questions: "Preguntas",
    openWorkspace: "Abrir espacio de trabajo",
    seeHow: "Ver cómo funciona",
    mapTitle: "Mapa de historia profesional",
    evidenceLinked: "Pruebas vinculadas",
    source: "Fuente",
    target: "Objetivo",
    outcome: "Resultado",
    resumeEvidence: "Pruebas del CV",
    jobRequirements: "Requisitos del puesto",
    interviewStory: "Historia de entrevista",
    clearerPath: "Un camino más claro de la experiencia a la oportunidad.",
    whyBrand: "Por qué InterviewThread",
    accountable: "Útil porque responde ante la fuente.",
    beforeBegin: "Qué debes saber antes de empezar.",
    exploreWorkflow: "Explora el proceso profesional",
    connectedDecisions: "Un mapa de pruebas, seis decisiones conectadas.",
    finalTitle: "Crea una historia que resista una entrevista real.",
    openProduct: "Abrir InterviewThread",
    repository: "Repositorio de código abierto",
  },
  fr: {
    howItWorks: "Fonctionnement",
    questions: "Questions",
    openWorkspace: "Ouvrir l’espace de travail",
    seeHow: "Voir le fonctionnement",
    mapTitle: "Carte du récit professionnel",
    evidenceLinked: "Preuves reliées",
    source: "Source",
    target: "Cible",
    outcome: "Résultat",
    resumeEvidence: "Preuves du CV",
    jobRequirements: "Exigences du poste",
    interviewStory: "Récit d’entretien",
    clearerPath: "Un chemin plus clair de l’expérience à l’opportunité.",
    whyBrand: "Pourquoi InterviewThread",
    accountable: "Utile parce que chaque élément reste lié à sa source.",
    beforeBegin: "Ce qu’il faut savoir avant de commencer.",
    exploreWorkflow: "Explorer le parcours professionnel",
    connectedDecisions: "Une carte de preuves, six décisions reliées.",
    finalTitle: "Construisez un récit solide face à un véritable entretien.",
    openProduct: "Ouvrir InterviewThread",
    repository: "Dépôt open source",
  },
  de: {
    howItWorks: "So funktioniert es",
    questions: "Fragen",
    openWorkspace: "Arbeitsbereich öffnen",
    seeHow: "Funktionsweise ansehen",
    mapTitle: "Karriere-Story-Map",
    evidenceLinked: "Belege verknüpft",
    source: "Quelle",
    target: "Ziel",
    outcome: "Ergebnis",
    resumeEvidence: "Lebenslaufbelege",
    jobRequirements: "Stellenanforderungen",
    interviewStory: "Interviewgeschichte",
    clearerPath: "Ein klarerer Weg von Erfahrung zu Chance.",
    whyBrand: "Warum InterviewThread",
    accountable: "Nützlich, weil alles zur Quelle zurückverfolgt wird.",
    beforeBegin: "Was du vor dem Start wissen solltest.",
    exploreWorkflow: "Karriere-Workflow erkunden",
    connectedDecisions: "Eine Belegkarte verbindet sechs Entscheidungen.",
    finalTitle: "Baue eine Geschichte, die einem echten Interview standhält.",
    openProduct: "InterviewThread öffnen",
    repository: "Open-Source-Repository",
  },
};

const EN_UI: SeoUiCopy = {
  howItWorks: "How it works",
  questions: "Questions",
  openWorkspace: "Open workspace",
  seeHow: "See how it works",
  mapTitle: "Career story map",
  evidenceLinked: "Evidence-linked",
  source: "Source",
  target: "Target",
  outcome: "Outcome",
  resumeEvidence: "Resume evidence",
  jobRequirements: "Job requirements",
  interviewStory: "Interview story",
  clearerPath: "A clearer path from experience to opportunity.",
  whyBrand: "Why InterviewThread",
  accountable: "Useful because it stays accountable to the source.",
  beforeBegin: "What to know before you begin.",
  exploreWorkflow: "Explore the career workflow",
  connectedDecisions: "One evidence map, six connected decisions.",
  finalTitle: "Build a story that can hold up under a real interview.",
  openProduct: "Open InterviewThread",
  repository: "Open-source repository",
};

function featureLabel(key: SeoPageKey, locale: LocaleCode) {
  const core = copyFor(locale);
  if (key === "job-match-recommendations") return core.recommendations;
  if (key === "career-market-insights") return core.market;
  if (key === "career-story-builder" || key === "ai-mock-interview")
    return core.copilot;
  return core.analyze;
}

export function seoUiFor(locale: LocaleCode): SeoUiCopy {
  if (locale === "en") return EN_UI;
  const reviewed = REVIEWED_UI[locale];
  if (reviewed) return reviewed;
  const core = copyFor(locale);
  return {
    howItWorks: core.analyze,
    questions: core.feedback,
    openWorkspace: core.enter,
    seeHow: core.analyze,
    mapTitle: core.heroTitle,
    evidenceLinked: core.feedback,
    source: core.feedback,
    target: core.recommendations,
    outcome: core.tracker,
    resumeEvidence: core.analyze,
    jobRequirements: core.recommendations,
    interviewStory: core.copilot,
    clearerPath: core.heroTitle,
    whyBrand: `InterviewThread · ${core.analyze}`,
    accountable: core.heroBody,
    beforeBegin: core.feedback,
    exploreWorkflow: core.recommendations,
    connectedDecisions: core.heroTitle,
    finalTitle: core.heroTitle,
    openProduct: core.enter,
    repository: core.feedback,
  };
}

export function localizedSeoPage(
  key: SeoPageKey,
  locale: LocaleCode,
): SeoPageSpec {
  const base = SEO_PAGES[key];
  if (locale === "en") return base;
  const core = copyFor(locale);
  const label = featureLabel(key, locale);
  const reviewed = REVIEWED_HEADLINES[locale]?.[key];
  const navLabel = reviewed?.navLabel || label;
  const title = reviewed?.title || `${navLabel} — ${core.heroTitle}`;
  const description = reviewed?.description || core.heroBody;
  const primaryCta = reviewed?.primaryCta || label;
  return {
    ...base,
    navLabel,
    eyebrow: navLabel,
    title,
    description,
    summary: description,
    primaryCta,
    metrics: [
      { value: "3", label: `${core.analyze} · ${core.feedback}` },
      { value: "0", label: core.feedback },
      { value: "40", label: core.language },
    ],
    steps: [
      { number: "01", title: core.analyze, body: description },
      { number: "02", title: core.recommendations, body: core.heroBody },
      { number: "03", title: core.copilot, body: description },
    ],
    benefits: [
      { title: core.analyze, body: description },
      { title: core.market, body: core.heroBody },
      { title: core.tracker, body: description },
    ],
    faqs: [
      { question: `${core.feedback}: ${navLabel}`, answer: description },
      { question: `InterviewThread · ${core.analyze}`, answer: core.heroBody },
    ],
    keywords: [navLabel, title, core.recommendations, core.market],
  };
}
