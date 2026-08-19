"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  copyFor,
  detailFor,
  LANGUAGES,
  localeFromPath,
  localeToPath,
  LocaleCode,
  RTL_LOCALES,
} from "./i18n";
import { accountCopyFor } from "./account-copy";
import { BrandMark } from "./BrandMark";
import { MobileNav } from "./MobileNav";
import { parseDocuments } from "./document-parser";
import { localizedPath } from "./intl-routing";
import {
  bestSpeechVoice,
  InterviewPersonaId,
  localizedInterviewQuestion,
  localizedPersonaLabel,
  speechLocaleFor,
  speechRateFor,
} from "./interview-speech";
import { SEO_PAGE_KEYS } from "./seo-content";
import { localizedSeoPage } from "./seo-localization";

type MatchStatus = "Strong evidence" | "Partial evidence" | "Gap";
type Match = {
  keyword: string;
  priority: "Required" | "Core" | "Preferred";
  status: MatchStatus;
  evidence: string;
};
type TrackerItem = {
  id: string;
  company: string;
  role: string;
  status: string;
  source?: "Saved" | "Story Signal";
  storyFit?: number;
  story?: string;
  sourceUrl?: string;
  trackedAt?: string;
};
type ChatMessage = { role: "assistant" | "user"; content: string };
type RadarAlert = {
  id: string;
  jobId: string;
  company: string;
  role: string;
  storyFit: number;
  reason: string;
  story: string;
  sourceUrl?: string;
  createdAt: string;
  tracked: boolean;
};
type ApprovedSourceId = "greenhouse" | "lever" | "lever-eu" | "ashby";
type ApprovedSourceMeta = {
  id: ApprovedSourceId;
  name: string;
  docsUrl: string;
  access: string;
  account: string;
  employer: string;
  retrievedAt: string;
  coverage: string;
};
type Job = {
  id: string;
  title: string;
  company: string;
  region: string;
  country: string;
  city: string;
  workStyle: string;
  industry: string;
  description: string;
  department?: string;
  source?: string;
  sourceUrl?: string;
  applyUrl?: string;
  publishedAt?: string;
  compensation?: string;
  isLive?: boolean;
  trend?: number;
  story?: string;
  strengths?: string[];
  gaps?: string[];
};
type RankedJob = Job & {
  match: number;
  storyFit: number;
  requiredCoverage: number;
  outcomeStrength: number;
  proofCount: number;
  requiredGapCount: number;
  alertEligible: boolean;
  alertReason: string;
  whyNow: string;
  story: string;
  strengths: string[];
  gaps: string[];
};
type WorkspaceView =
  | "Analyze"
  | "Recommendations"
  | "Market Insights"
  | "Tracker"
  | "Interview Studio"
  | "Copilot"
  | "Feedback";
type ApplicationMode = "Manual" | "Hybrid" | "Automatic";
type InterviewMode = "Coaching" | "Realistic";
type InterviewScore = {
  relevance: number;
  evidence: number;
  outcome: number;
  structure: number;
  confidence: number;
};
type InterviewPersona = {
  id: InterviewPersonaId;
  label: string;
  focus: string;
  pressure: string;
};
type InterviewCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  role: string;
  style: string;
  coaching: string;
  realistic: string;
  start: string;
  restart: string;
  answer: string;
  placeholder: string;
  send: string;
  speak: string;
  mute: string;
  listen: string;
  listening: string;
  stopListening: string;
  liveTranscript: string;
  speechLanguage: string;
  recognitionConfidence: string;
  noSpeech: string;
  permissionDenied: string;
  unavailable: string;
  scoreTitle: string;
  relevance: string;
  evidence: string;
  outcome: string;
  structure: string;
  confidence: string;
  storySpine: string;
  proof: string;
  gap: string;
  focus: string;
  privacy: string;
  feedbackLead: string;
  improveLead: string;
};
type BillingMarket = {
  code: string;
  currency: string;
  proMonthly: number;
};

const MODE_DISCLOSURES: Partial<
  Record<LocaleCode, Record<ApplicationMode, string>>
> = {
  "zh-TW": {
    Manual: "開源免費。所有職缺、文件與投遞都由你自行檢查及送出。",
    Hybrid: "Pro 功能預覽。AI 可準備客製草稿與下一步，但每次送出前都必須由你核准。",
    Automatic:
      "Pro 功能預覽。目前公開版不會自動投遞；未來僅會透過核准 API，在取得同意、速率限制、稽核紀錄與緊急停止機制下執行。",
  },
  "zh-CN": {
    Manual: "开源免费。所有职位、文件与投递都由你自行检查并提交。",
    Hybrid: "Pro 功能预览。AI 可准备定制草稿和下一步，但每次提交前都必须由你批准。",
    Automatic:
      "Pro 功能预览。目前公开版不会自动投递；未来仅会通过获准 API，在取得同意、速率限制、审计记录与紧急停止机制下执行。",
  },
  ja: {
    Manual: "オープンソースで無料です。求人、書類、応募はすべて自分で確認して送信します。",
    Hybrid: "Pro機能のプレビューです。AIが下書きを準備しますが、送信前に必ず本人の承認が必要です。",
    Automatic:
      "Pro機能のプレビューです。公開版は自動応募を行いません。将来は承認済みAPI、同意、速度制限、監査ログ、緊急停止を備えた場合にのみ実行します。",
  },
  ko: {
    Manual: "오픈 소스 무료 모드입니다. 모든 공고, 문서 및 지원서를 직접 검토하고 제출합니다.",
    Hybrid: "Pro 기능 미리보기입니다. AI가 맞춤 초안을 준비하지만 제출 전에는 항상 사용자의 승인이 필요합니다.",
    Automatic:
      "Pro 기능 미리보기입니다. 공개 버전은 자동 지원하지 않습니다. 향후 승인된 API, 동의, 속도 제한, 감사 로그 및 긴급 중지 기능이 있을 때만 실행합니다.",
  },
  es: {
    Manual: "Código abierto y gratuito. Revisas cada oferta, documento y solicitud antes de enviarla tú mismo.",
    Hybrid: "Vista previa Pro. La IA prepara borradores, pero debes aprobar cada envío.",
    Automatic:
      "Vista previa Pro. La versión pública no envía solicitudes automáticamente; una versión futura requerirá APIs aprobadas, consentimiento, límites, auditoría y parada de emergencia.",
  },
  fr: {
    Manual: "Open source et gratuit. Vous vérifiez chaque offre, document et candidature avant de l’envoyer vous-même.",
    Hybrid: "Aperçu Pro. L’IA prépare les brouillons, mais vous devez approuver chaque envoi.",
    Automatic:
      "Aperçu Pro. La version publique n’envoie aucune candidature automatiquement ; une version future exigera des API approuvées, le consentement, des limites, un journal d’audit et un arrêt d’urgence.",
  },
  de: {
    Manual: "Open Source und kostenlos. Du prüfst jede Stelle, jedes Dokument und sendest jede Bewerbung selbst.",
    Hybrid: "Pro-Vorschau. Die KI bereitet Entwürfe vor, aber du musst jede Übermittlung freigeben.",
    Automatic:
      "Pro-Vorschau. Die öffentliche Version bewirbt sich nicht automatisch; eine spätere Version benötigt freigegebene APIs, Einwilligung, Limits, Audit-Protokoll und Not-Aus.",
  },
};

const MODE_CONTEXT: Partial<Record<LocaleCode, string>> = {
  en: "This setting only controls what happens after you find a suitable role. It does not change your resume–JD analysis.",
  "zh-TW": "這項設定只控制找到適合職缺後，系統要協助到哪一步；不會改變履歷與 JD 的分析結果。",
  "zh-CN": "此设置只控制找到合适职位后，系统协助到哪一步；不会改变简历与 JD 的分析结果。",
  ja: "この設定は適した求人を見つけた後の支援範囲だけを決めます。履歴書と求人票の分析結果は変わりません。",
  ko: "이 설정은 적합한 공고를 찾은 뒤 지원을 어디까지 도울지만 정합니다. 이력서와 JD 분석 결과는 바뀌지 않습니다.",
  es: "Este ajuste solo controla la ayuda después de encontrar un puesto adecuado. No cambia el análisis entre el currículum y la oferta.",
  fr: "Ce réglage contrôle uniquement l’aide après la découverte d’un poste adapté. Il ne modifie pas l’analyse CV–offre.",
  de: "Diese Einstellung steuert nur die Unterstützung nach dem Finden einer passenden Stelle. Sie ändert nicht die Lebenslauf–Stellenanalyse.",
};

const KEYWORDS: Record<string, string[]> = {
  SQL: ["sql", "structured query language"],
  Python: ["python", "pandas", "numpy"],
  Excel: ["excel", "pivot table", "power query"],
  Tableau: ["tableau"],
  "Power BI": ["power bi", "powerbi", "dax"],
  "Data visualization": ["data visualization", "dashboard", "reporting"],
  Experimentation: ["experiment", "a/b test", "ab test", "hypothesis testing"],
  Statistics: ["statistics", "regression"],
  "Stakeholder management": ["stakeholder", "cross-functional"],
  Leadership: ["leadership", "led", "managed"],
  "Project management": ["project management", "program management"],
  "Product analytics": [
    "product analytics",
    "user behavior",
    "feature adoption",
  ],
  "Machine learning / AI": [
    "machine learning",
    "artificial intelligence",
    "generative ai",
    "llm",
  ],
  "Process improvement": ["process improvement", "optimization", "automation"],
  "Data quality": ["data quality", "validation", "reconciliation"],
  APIs: ["api", "apis"],
};

const SAMPLE_JD =
  "We are looking for a product analyst who can use SQL, design experiments, build stakeholder-ready dashboards, and communicate findings to cross-functional partners. Python is preferred. The analyst will define KPIs and improve product decisions.";
const SAMPLE_RESUME =
  "Product analyst who built SQL dashboards used by product and operations leaders. Partnered with cross-functional stakeholders to translate customer behavior into decisions and automated a weekly validation workflow, reducing preparation time by 30%.";
const PROVIDERS = [
  {
    id: "Evidence engine",
    label: "Evidence engine · Built in",
    kind: "built-in",
    endpoint: "",
    model: "",
  },
  {
    id: "Ollama",
    label: "Ollama · Local open models",
    kind: "ollama",
    endpoint: "http://localhost:11434",
    model: "llama3.2",
  },
  {
    id: "LM Studio",
    label: "LM Studio · OpenAI compatible",
    kind: "openai-compatible",
    endpoint: "http://localhost:1234",
    model: "local-model",
  },
  {
    id: "vLLM",
    label: "vLLM · OpenAI compatible",
    kind: "openai-compatible",
    endpoint: "http://localhost:8000",
    model: "local-model",
  },
  {
    id: "llama.cpp",
    label: "llama.cpp · OpenAI compatible",
    kind: "openai-compatible",
    endpoint: "http://localhost:8080",
    model: "local-model",
  },
  {
    id: "LocalAI",
    label: "LocalAI · OpenAI compatible",
    kind: "openai-compatible",
    endpoint: "http://localhost:8080",
    model: "local-model",
  },
  {
    id: "OpenAI-compatible",
    label: "Custom OpenAI-compatible endpoint",
    kind: "openai-compatible",
    endpoint: "http://localhost:8000",
    model: "local-model",
  },
] as const;
const INTERVIEW_PERSONAS: InterviewPersona[] = [
  {
    id: "hr",
    label: "HR screening",
    focus: "Motivation, role fit, concise career narrative",
    pressure: "Warm, time-boxed, and skeptical of vague claims",
  },
  {
    id: "hiring-manager",
    label: "Hiring manager",
    focus: "Role-specific judgment, execution, and measurable outcomes",
    pressure: "Detailed follow-ups on ownership and trade-offs",
  },
  {
    id: "coo",
    label: "COO",
    focus: "Operating leverage, process quality, and cross-functional delivery",
    pressure: "Tests scale, risk, and repeatability",
  },
  {
    id: "ceo",
    label: "CEO",
    focus: "Business impact, strategic clarity, and why you",
    pressure: "Expects a direct point of view and executive brevity",
  },
  {
    id: "peer",
    label: "Future teammate",
    focus: "Collaboration, conflict, feedback, and working style",
    pressure: "Looks for self-awareness and practical partnership",
  },
  {
    id: "case",
    label: "Case breakdown",
    focus: "Problem framing, assumptions, prioritization, and synthesis",
    pressure: "Introduces ambiguity and challenges your reasoning",
  },
];

const INTERVIEW_COPY: Partial<Record<LocaleCode, Partial<InterviewCopy>>> = {
  "zh-TW": {
    eyebrow: "證據導向模擬面試",
    title: "把你的經歷練成面試時說得出口的故事",
    subtitle:
      "面試官只根據履歷、JD 與已辨識的證據追問，不會替你編造經歷。",
    role: "面試官角色",
    style: "練習模式",
    coaching: "教練模式",
    realistic: "真實面試",
    start: "開始模擬面試",
    restart: "重新開始",
    answer: "你的回答",
    placeholder: "輸入回答，或使用語音作答……",
    send: "送出回答",
    speak: "朗讀問題",
    mute: "停止朗讀",
    listen: "語音作答",
    listening: "正在聆聽",
    stopListening: "停止語音輸入",
    liveTranscript: "即時辨識",
    speechLanguage: "語音語言",
    recognitionConfidence: "辨識信心",
    noSpeech: "尚未聽到清楚語音，請靠近麥克風後再試一次。",
    permissionDenied: "請允許瀏覽器使用麥克風，或改用文字作答。",
    unavailable: "此瀏覽器不支援語音輸入，仍可使用文字作答。",
    scoreTitle: "回答訊號",
    relevance: "JD 關聯",
    evidence: "證據",
    outcome: "成果",
    structure: "結構",
    confidence: "自信度",
    storySpine: "故事主軸",
    proof: "可用證據",
    gap: "可能追問",
    focus: "面試官關注",
    privacy: "訪客模式的練習紀錄只留在此裝置。",
    feedbackLead: "目前最強",
    improveLead: "下一步加強",
  },
  "zh-CN": {
    eyebrow: "证据导向模拟面试",
    title: "把你的经历练成面试时讲得出的故事",
    subtitle: "面试官只根据简历、JD 与已识别证据追问，不会替你编造经历。",
    role: "面试官角色",
    style: "练习模式",
    coaching: "教练模式",
    realistic: "真实面试",
    start: "开始模拟面试",
    restart: "重新开始",
    answer: "你的回答",
    placeholder: "输入回答，或使用语音作答……",
    send: "提交回答",
    speak: "朗读问题",
    mute: "停止朗读",
    listen: "语音作答",
    listening: "正在聆听",
    stopListening: "停止语音输入",
    liveTranscript: "实时识别",
    speechLanguage: "语音语言",
    recognitionConfidence: "识别置信度",
    noSpeech: "尚未听到清晰语音，请靠近麦克风后重试。",
    permissionDenied: "请允许浏览器使用麦克风，或改用文字作答。",
    unavailable: "此浏览器不支持语音输入，仍可使用文字作答。",
    scoreTitle: "回答信号",
    relevance: "JD 关联",
    evidence: "证据",
    outcome: "成果",
    structure: "结构",
    confidence: "自信度",
    storySpine: "故事主线",
    proof: "可用证据",
    gap: "可能追问",
    focus: "面试官关注",
    privacy: "访客模式的练习记录只保留在此设备。",
    feedbackLead: "目前最强",
    improveLead: "下一步加强",
  },
  ja: {
    eyebrow: "根拠に基づく模擬面接",
    title: "経験を、自信を持って話せる面接ストーリーへ",
    subtitle: "履歴書と求人票の根拠だけを使い、経験を作り上げずに質問します。",
    role: "面接官",
    style: "練習モード",
    coaching: "コーチング",
    realistic: "本番モード",
    start: "模擬面接を開始",
    restart: "最初からやり直す",
    answer: "回答",
    placeholder: "回答を入力するか、音声で話してください…",
    send: "回答を送信",
    speak: "質問を読み上げる",
    mute: "読み上げを停止",
    listen: "音声で回答",
    listening: "聞き取り中",
    stopListening: "音声入力を停止",
    liveTranscript: "リアルタイム認識",
    speechLanguage: "音声言語",
    recognitionConfidence: "認識信頼度",
    noSpeech: "明瞭な音声を検出できませんでした。マイクに近づいて再度お試しください。",
    permissionDenied: "マイクの使用を許可するか、テキストで回答してください。",
    unavailable: "このブラウザでは音声入力を利用できません。",
    scoreTitle: "回答シグナル",
    relevance: "求人との関連",
    evidence: "根拠",
    outcome: "成果",
    structure: "構成",
    confidence: "自信",
    storySpine: "ストーリーの軸",
    proof: "使える根拠",
    gap: "想定される追問",
    focus: "面接官の視点",
    privacy: "ゲストの練習履歴はこの端末にのみ保存されます。",
    feedbackLead: "現在の強み",
    improveLead: "次に改善する点",
  },
  ko: {
    eyebrow: "근거 기반 모의 면접",
    title: "경험을 자신 있게 말할 수 있는 면접 스토리로 바꾸세요",
    subtitle: "이력서와 JD의 근거만으로 질문하며 경험을 만들어내지 않습니다.",
    role: "면접관 역할",
    style: "연습 모드",
    coaching: "코칭 모드",
    realistic: "실전 모드",
    start: "모의 면접 시작",
    restart: "다시 시작",
    answer: "내 답변",
    placeholder: "답변을 입력하거나 음성으로 말하세요…",
    send: "답변 보내기",
    speak: "질문 읽기",
    mute: "읽기 중지",
    listen: "음성 답변",
    listening: "듣는 중",
    stopListening: "음성 입력 중지",
    liveTranscript: "실시간 인식",
    speechLanguage: "음성 언어",
    recognitionConfidence: "인식 신뢰도",
    noSpeech: "선명한 음성이 감지되지 않았습니다. 마이크에 가까이 말한 뒤 다시 시도하세요.",
    permissionDenied: "브라우저에서 마이크 사용을 허용하거나 텍스트로 답변하세요.",
    unavailable: "이 브라우저에서는 음성 입력을 지원하지 않습니다.",
    scoreTitle: "답변 신호",
    relevance: "JD 연관성",
    evidence: "근거",
    outcome: "성과",
    structure: "구조",
    confidence: "자신감",
    storySpine: "스토리 중심축",
    proof: "사용할 근거",
    gap: "예상 꼬리 질문",
    focus: "면접관 초점",
    privacy: "게스트 연습 기록은 이 기기에만 저장됩니다.",
    feedbackLead: "현재 강점",
    improveLead: "다음 개선점",
  },
};

const EN_INTERVIEW_COPY: InterviewCopy = {
  eyebrow: "Evidence-grounded mock interview",
  title: "Practice the story you will actually tell in the interview",
  subtitle:
    "Your interviewer follows the resume, the JD, and your proof—not a generic question bank and never invented experience.",
  role: "Interviewer role",
  style: "Practice mode",
  coaching: "Coaching",
  realistic: "Realistic",
  start: "Start mock interview",
  restart: "Restart session",
  answer: "Your answer",
  placeholder: "Type your answer or respond by voice…",
  send: "Submit answer",
  speak: "Read question aloud",
  mute: "Stop speaking",
  listen: "Answer by voice",
  listening: "Listening",
  stopListening: "Stop voice input",
  liveTranscript: "Live transcript",
  speechLanguage: "Speech language",
  recognitionConfidence: "Recognition confidence",
  noSpeech: "No clear speech was detected. Move closer to the microphone and try again.",
  permissionDenied: "Allow microphone access in your browser, or answer by text.",
  unavailable: "Voice input is not supported in this browser. You can still type.",
  scoreTitle: "Answer signals",
  relevance: "JD relevance",
  evidence: "Evidence",
  outcome: "Outcome",
  structure: "Structure",
  confidence: "Confidence",
  storySpine: "Story spine",
  proof: "Proof to use",
  gap: "Likely follow-up",
  focus: "Interviewer focus",
  privacy: "Guest practice history stays on this device.",
  feedbackLead: "Strongest signal",
  improveLead: "Strengthen next",
};

function interviewCopyFor(locale: LocaleCode): InterviewCopy {
  return { ...EN_INTERVIEW_COPY, ...(INTERVIEW_COPY[locale] || {}) };
}
const JOB_SOURCE_STATUS = [
  {
    name: "Employer ATS APIs",
    access: "Available now",
    detail: "Greenhouse, Lever, Lever EU, and Ashby published-job APIs",
  },
  {
    name: "Adzuna",
    access: "Key required",
    detail: "Live counts and listings when configured",
  },
  {
    name: "LinkedIn · Indeed · Handshake",
    access: "Partner only",
    detail: "No scraping; official agreement or user-supplied content",
  },
];
const REGIONS = [
  "Worldwide",
  "North America",
  "Europe",
  "Asia-Pacific",
  "Latin America",
  "Middle East & Africa",
];
const INDUSTRIES = [
  "All industries",
  "Technology",
  "Financial services",
  "Healthcare",
  "Consumer",
  "Climate & energy",
  "Professional services",
];
const COUNTRIES: Record<string, string[]> = {
  Worldwide: [
    "All countries",
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Japan",
    "South Korea",
    "Singapore",
    "Taiwan",
    "Brazil",
    "Mexico",
    "United Arab Emirates",
    "South Africa",
  ],
  "North America": ["All countries", "United States", "Canada", "Mexico"],
  Europe: [
    "All countries",
    "United Kingdom",
    "Germany",
    "France",
    "Netherlands",
    "Spain",
  ],
  "Asia-Pacific": [
    "All countries",
    "Japan",
    "South Korea",
    "Singapore",
    "Taiwan",
    "Australia",
    "India",
  ],
  "Latin America": [
    "All countries",
    "Brazil",
    "Mexico",
    "Argentina",
    "Colombia",
  ],
  "Middle East & Africa": [
    "All countries",
    "United Arab Emirates",
    "Saudi Arabia",
    "South Africa",
    "Kenya",
  ],
};

const JOBS: Job[] = [
  {
    id: "northstar-pa",
    title: "Senior Product Analyst",
    company: "Northstar Commerce",
    region: "North America",
    country: "United States",
    city: "New York",
    workStyle: "Hybrid",
    industry: "Consumer",
    trend: 12,
    description:
      "Use SQL and experimentation to understand customer behavior, define product KPIs, build dashboards, and influence cross-functional product decisions.",
    story:
      "Lead with the SQL dashboard and the 30% faster weekly decision workflow.",
    strengths: ["SQL", "Stakeholders", "Dashboards"],
    gaps: ["Experiment design"],
  },
  {
    id: "atlas-bi",
    title: "Business Intelligence Analyst",
    company: "Atlas Health Systems",
    region: "Europe",
    country: "United Kingdom",
    city: "London",
    workStyle: "Remote",
    industry: "Healthcare",
    trend: 8,
    description:
      "Build SQL reporting, validate data quality, automate operational dashboards, and communicate findings to healthcare stakeholders.",
    story:
      "Lead with the automated validation workflow, then quantify decision speed.",
    strengths: ["SQL", "Data quality", "Automation"],
    gaps: ["Healthcare metrics"],
  },
  {
    id: "meridian-product",
    title: "Product Insights Analyst",
    company: "Meridian Labs",
    region: "Asia-Pacific",
    country: "Singapore",
    city: "Singapore",
    workStyle: "Hybrid",
    industry: "Technology",
    trend: 17,
    description:
      "Analyze product adoption with SQL, Python, experimentation and stakeholder-ready data visualization for regional product teams.",
    story:
      "Use the customer behavior example and make your personal decision impact explicit.",
    strengths: ["SQL", "Product insight", "Stakeholders"],
    gaps: ["Python evidence"],
  },
  {
    id: "harbor-ops",
    title: "Operations Analytics Lead",
    company: "Harbor Grid",
    region: "Asia-Pacific",
    country: "Taiwan",
    city: "Taipei",
    workStyle: "On-site",
    industry: "Climate & energy",
    trend: 6,
    description:
      "Lead process improvement, operational reporting, SQL analysis, data validation and cross-functional planning for energy operations.",
    story:
      "Lead with workflow automation and describe how leaders used the result.",
    strengths: ["Automation", "Validation", "Operations"],
    gaps: ["Energy domain"],
  },
  {
    id: "lumen-growth",
    title: "Growth Data Analyst",
    company: "Lumen Finance",
    region: "Latin America",
    country: "Brazil",
    city: "São Paulo",
    workStyle: "Remote",
    industry: "Financial services",
    trend: -3,
    description:
      "Use SQL, experimentation, statistics and dashboards to improve acquisition decisions with product and marketing stakeholders.",
    story:
      "Your cross-functional dashboard story is strongest; add a verified acquisition metric.",
    strengths: ["SQL", "Dashboards", "Collaboration"],
    gaps: ["Statistics"],
  },
  {
    id: "keystone-risk",
    title: "Risk Analytics Consultant",
    company: "Keystone Advisory",
    region: "Middle East & Africa",
    country: "United Arab Emirates",
    city: "Dubai",
    workStyle: "Hybrid",
    industry: "Professional services",
    trend: 4,
    description:
      "Apply SQL, data quality controls, stakeholder management and executive reporting to improve risk decisions across client programs.",
    story:
      "Lead with your validation workflow and the documented time reduction.",
    strengths: ["Validation", "Stakeholders", "Reporting"],
    gaps: ["Risk controls"],
  },
];

const MARKET_BASE = [
  {
    industry: "Technology",
    role: "Data & AI",
    openings: 18400,
    change: 13.2,
    remote: 37,
  },
  {
    industry: "Financial services",
    role: "Analytics",
    openings: 12600,
    change: 6.8,
    remote: 24,
  },
  {
    industry: "Healthcare",
    role: "Operations",
    openings: 10800,
    change: 9.1,
    remote: 18,
  },
  {
    industry: "Consumer",
    role: "Product",
    openings: 9200,
    change: -2.7,
    remote: 29,
  },
  {
    industry: "Climate & energy",
    role: "Operations",
    openings: 7400,
    change: 11.4,
    remote: 16,
  },
  {
    industry: "Professional services",
    role: "Consulting",
    openings: 6800,
    change: -4.3,
    remote: 32,
  },
];
const REGION_FACTORS: Record<string, number> = {
  Worldwide: 1,
  "North America": 0.38,
  Europe: 0.27,
  "Asia-Pacific": 0.25,
  "Latin America": 0.07,
  "Middle East & Africa": 0.06,
};

const BILLING_MARKETS: BillingMarket[] = [
  { code: "US", currency: "USD", proMonthly: 15 },
  { code: "EU", currency: "EUR", proMonthly: 14 },
  { code: "GB", currency: "GBP", proMonthly: 12 },
  { code: "CA", currency: "CAD", proMonthly: 20 },
  { code: "AU", currency: "AUD", proMonthly: 23 },
  { code: "NZ", currency: "NZD", proMonthly: 25 },
  { code: "JP", currency: "JPY", proMonthly: 2200 },
  { code: "KR", currency: "KRW", proMonthly: 20000 },
  { code: "TW", currency: "TWD", proMonthly: 490 },
  { code: "CN", currency: "CNY", proMonthly: 108 },
  { code: "HK", currency: "HKD", proMonthly: 118 },
  { code: "SG", currency: "SGD", proMonthly: 20 },
  { code: "IN", currency: "INR", proMonthly: 999 },
  { code: "BR", currency: "BRL", proMonthly: 59 },
  { code: "MX", currency: "MXN", proMonthly: 229 },
  { code: "CH", currency: "CHF", proMonthly: 14 },
  { code: "SE", currency: "SEK", proMonthly: 159 },
  { code: "NO", currency: "NOK", proMonthly: 165 },
  { code: "DK", currency: "DKK", proMonthly: 105 },
  { code: "PL", currency: "PLN", proMonthly: 59 },
  { code: "CZ", currency: "CZK", proMonthly: 349 },
  { code: "AE", currency: "AED", proMonthly: 55 },
  { code: "ZA", currency: "ZAR", proMonthly: 249 },
  { code: "TH", currency: "THB", proMonthly: 499 },
  { code: "ID", currency: "IDR", proMonthly: 219000 },
  { code: "MY", currency: "MYR", proMonthly: 65 },
  { code: "PH", currency: "PHP", proMonthly: 849 },
  { code: "VN", currency: "VND", proMonthly: 379000 },
];

const EURO_COUNTRIES = new Set([
  "AT",
  "BE",
  "CY",
  "DE",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PT",
  "SI",
  "SK",
]);

const LANGUAGE_MARKETS: Record<string, string> = {
  ja: "JP",
  ko: "KR",
  zh: "CN",
  hi: "IN",
  bn: "IN",
  id: "ID",
  ms: "MY",
  th: "TH",
  vi: "VN",
  fil: "PH",
  sv: "SE",
  no: "NO",
  da: "DK",
  pl: "PL",
  cs: "CZ",
  pt: "BR",
};

const FRIENDLY_PRICE_STEPS: Record<string, number> = {
  JPY: 100,
  KRW: 1000,
  TWD: 10,
  CNY: 5,
  HKD: 10,
  INR: 50,
  BRL: 5,
  MXN: 10,
  SEK: 5,
  NOK: 5,
  DKK: 5,
  PLN: 5,
  CZK: 10,
  ZAR: 10,
  THB: 10,
  IDR: 10000,
  MYR: 5,
  PHP: 50,
  VND: 10000,
};

function includesPhrase(text: string, phrase: string) {
  const escaped = phrase
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s+");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}
function evidenceLine(resume: string, aliases: string[]) {
  return (
    resume
      .split(/\n|(?<=[.!?])\s+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .find((line) => aliases.some((alias) => includesPhrase(line, alias))) ||
    "No source evidence found."
  );
}
function runMatch(jd: string, resume: string): Match[] {
  return Object.entries(KEYWORDS).flatMap(([keyword, aliases]) => {
    if (!aliases.some((alias) => includesPhrase(jd, alias))) return [];
    const sentences = jd.split(/\n|(?<=[.!?])\s+/);
    const required = sentences.some(
      (line) =>
        aliases.some((alias) => includesPhrase(line, alias)) &&
        /required|must|need|looking for/i.test(line),
    );
    const preferred = sentences.some(
      (line) =>
        aliases.some((alias) => includesPhrase(line, alias)) &&
        /preferred|nice to have|bonus|plus/i.test(line),
    );
    const exact = aliases.some((alias) => includesPhrase(resume, alias));
    const partial = keyword
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 3)
      .some((word) => includesPhrase(resume, word));
    return [
      {
        keyword,
        priority: preferred ? "Preferred" : required ? "Required" : "Core",
        status: exact
          ? "Strong evidence"
          : partial
            ? "Partial evidence"
            : "Gap",
        evidence: evidenceLine(resume, aliases),
      },
    ];
  });
}
function scoreMatches(matches: Match[]) {
  if (!matches.length) return 0;
  const weights = { Required: 1.35, Core: 1, Preferred: 0.65 };
  const values = { "Strong evidence": 1, "Partial evidence": 0.55, Gap: 0 };
  const possible = matches.reduce(
    (sum, item) => sum + weights[item.priority],
    0,
  );
  return Math.round(
    (matches.reduce(
      (sum, item) => sum + weights[item.priority] * values[item.status],
      0,
    ) /
      possible) *
      100,
  );
}
function coverageFor(matches: Match[], priority?: Match["priority"]) {
  const filtered = priority
    ? matches.filter((item) => item.priority === priority)
    : matches;
  if (!filtered.length) return scoreMatches(matches);
  const values = { "Strong evidence": 1, "Partial evidence": 0.55, Gap: 0 };
  return Math.round(
    (filtered.reduce((sum, item) => sum + values[item.status], 0) /
      filtered.length) *
      100,
  );
}
function outcomeStrengthFor(matches: Match[]) {
  const evidence = matches
    .filter(
      (item) =>
        item.status !== "Gap" && item.evidence !== "No source evidence found.",
    )
    .map((item) => item.evidence);
  if (!evidence.length) return 0;
  if (
    evidence.some((line) =>
      /\p{N}+(?:[.,]\p{N}+)?\s?%|[$€£¥₹₩]\s?\p{N}|\p{N}+\s?(?:x|倍|hours?|days?|weeks?|months?|users?|customers?)|reduc|increas|grew|saved|improv|accelerat|revenue|adoption|降低|減少|提升|成長|增加|改善|節省|减少|增长|提高|节省|削減|向上|増加|성장|증가|개선|절감|reduj|aument|mejor|ahorr|rédu|amélior|économ|reduzier|steiger|verbesser|eingespart/iu.test(
        line,
      ),
    )
  )
    return 100;
  if (
    evidence.some((line) =>
      /\b(?:built|led|launched|owned|designed|automated|delivered|created|managed|partnered)\b|建立|建置|領導|推出|設計|自動化|交付|管理|合作|领导|发布|自动化|協働|主導|設計した|自動化した|구축|주도|출시|설계|자동화|lider|diseñ|automatiz|dirig|conçu|automatis|livré|geleitet|entwickelt|automatisiert/iu.test(
        line,
      ),
    )
  )
    return 72;
  return 45;
}
function storyFitFor(matches: Match[]) {
  const evidenceCoverage = scoreMatches(matches);
  const requiredCoverage = coverageFor(matches, "Required");
  const outcomeStrength = outcomeStrengthFor(matches);
  return {
    evidenceCoverage,
    requiredCoverage,
    outcomeStrength,
    storyFit: Math.round(
      evidenceCoverage * 0.5 +
        requiredCoverage * 0.3 +
        outcomeStrength * 0.2,
    ),
  };
}

function firstEvidence(matches: Match[]) {
  return matches.find(
    (item) =>
      item.status === "Strong evidence" &&
      item.evidence !== "No source evidence found.",
  );
}

function questionForInterview(
  persona: InterviewPersonaId,
  turn: number,
  matches: Match[],
  locale: LocaleCode,
) {
  const proof = firstEvidence(matches);
  const gap = matches.find((item) => item.status === "Gap");
  const proofLabel = proof?.keyword || "the most relevant achievement on your resume";
  const gapLabel = gap?.keyword || "an unfamiliar part of this role";
  if (locale !== "en")
    return localizedInterviewQuestion(locale, turn, proofLabel, gapLabel);
  const questions: Record<InterviewPersonaId, string[]> = {
    hr: [
      `Give me the two-minute version of your career story, and connect it directly to this role—not just your job titles.`,
      `Why is this role the right next step for you, and what does your ${proofLabel} experience let you contribute immediately?`,
      `What should I understand about ${gapLabel}, and how would you address it without overstating your experience?`,
    ],
    "hiring-manager": [
      `Walk me through your strongest ${proofLabel} example. What problem did you own, what did you decide, and what changed?`,
      `Which trade-off in that example was genuinely yours to make, and what evidence told you it was the right call?`,
      `If you joined this team, how would you apply that proof to the priorities in this job description during your first 90 days?`,
    ],
    coo: [
      `Choose one example where your work improved an operating process. What was unreliable before, and how did the operating rhythm change?`,
      `What did the process depend on besides you, and how did you make the result repeatable across people or teams?`,
      `Where could your approach fail at ten times the scale, and what control would you put in place first?`,
    ],
    ceo: [
      `In ninety seconds, tell me why your evidence makes you unusually useful for this role and this business.`,
      `What business outcome did your strongest example influence, and why did that outcome matter beyond your immediate team?`,
      `What point of view would you bring here that is supported by experience rather than aspiration?`,
    ],
    peer: [
      `Tell me about a time you and a partner disagreed on how to solve a problem. What did you do, and what changed in the working relationship?`,
      `Which part of that result belonged to someone else, and how did you make their contribution more effective?`,
      `What feedback would that teammate give you about how you operate under pressure?`,
    ],
    case: [
      `Case: a key product metric fell 12% in two weeks after a release. Structure how you would diagnose the problem before proposing a fix.`,
      `Assume the decline is concentrated among new users on mobile. Which hypotheses move to the top, and what evidence would separate them?`,
      `You have one analyst and five working days. Prioritize the plan, name the trade-offs, and give me your executive recommendation.`,
    ],
  };
  return questions[persona][Math.min(turn, questions[persona].length - 1)];
}

function questionOnly(content: string) {
  return content.split(/\n\s*\n/).filter(Boolean).at(-1)?.trim() || content;
}

function appendTranscript(current: string, next: string, locale: LocaleCode) {
  if (!current.trim()) return next.trim();
  const separator = ["zh-CN", "zh-TW", "ja", "th"].includes(locale)
    ? ""
    : " ";
  return `${current.trim()}${separator}${next.trim()}`;
}

async function availableSpeechVoices() {
  const current = window.speechSynthesis.getVoices();
  if (current.length) return current;
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener("voiceschanged", finish);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", finish);
    window.setTimeout(finish, 800);
  });
}

function scoreInterviewAnswer(answer: string, matches: Match[]): InterviewScore {
  const normalized = answer.toLowerCase();
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const relevantSignals = matches.filter(
    (item) =>
      item.status !== "Gap" &&
      includesPhrase(normalized, item.keyword.toLowerCase()),
  ).length;
  const evidenceLanguage =
    /\b(?:built|led|owned|designed|launched|automated|analyzed|decided|partnered|delivered|created|managed|implemented|tested)\b|建立|建置|領導|主導|設計|推出|自動化|分析|決定|合作|交付|负责|主导|设计|自动化|分析|협업|주도|구축|분석|설계|実施|設計|分析|主導/iu.test(
      answer,
    );
  const outcomeLanguage =
    /\p{N}+(?:[.,]\p{N}+)?\s?%|[$€£¥₹₩]\s?\p{N}|\b(?:reduced|increased|grew|saved|improved|accelerated|revenue|adoption|retention|hours?|days?|users?|customers?)\b|降低|減少|提升|成長|增加|改善|節省|减少|增长|提高|节省|성과|증가|개선|절감|向上|削減|増加/iu.test(
      answer,
    );
  const structureSignals = [
    /\b(?:situation|context|problem|challenge)\b|情境|背景|問題|挑战|상황|문제|課題/iu,
    /\b(?:task|goal|objective|responsible)\b|任務|目標|负责|과제|목표|役割/iu,
    /\b(?:action|first|then|because|decided)\b|行動|首先|接著|因為|決定|먼저|결정|行動/iu,
    /\b(?:result|impact|outcome|learned)\b|結果|影響|成果|學到|结果|影响|배운|결과|成果/iu,
  ].filter((pattern) => pattern.test(answer)).length;
  const hedgeCount = (
    normalized.match(/\b(?:maybe|perhaps|i think|sort of|kind of|probably)\b/g) || []
  ).length;
  const relevance = Math.min(96, 48 + relevantSignals * 16 + (words.length > 45 ? 10 : 0));
  const evidence = Math.min(96, 46 + (evidenceLanguage ? 27 : 0) + (relevantSignals ? 14 : 0));
  const outcome = Math.min(98, 42 + (outcomeLanguage ? 42 : 0) + (words.length > 70 ? 7 : 0));
  const structure = Math.min(96, 44 + structureSignals * 12 + (words.length >= 55 ? 7 : 0));
  const confidence = Math.max(
    35,
    Math.min(95, 58 + (words.length >= 35 ? 16 : 0) - hedgeCount * 8),
  );
  return { relevance, evidence, outcome, structure, confidence };
}

function interviewFeedback(
  scores: InterviewScore,
  labels: InterviewCopy,
  mode: InterviewMode,
) {
  const entries = [
    [labels.relevance, scores.relevance],
    [labels.evidence, scores.evidence],
    [labels.outcome, scores.outcome],
    [labels.structure, scores.structure],
    [labels.confidence, scores.confidence],
  ] as const;
  const strongest = [...entries].sort((a, b) => b[1] - a[1])[0];
  const weakest = [...entries].sort((a, b) => a[1] - b[1])[0];
  if (mode === "Realistic")
    return `${labels.feedbackLead}: ${strongest[0]} ${strongest[1]}/100. ${labels.improveLead}: ${weakest[0]} ${weakest[1]}/100.`;
  return `${labels.feedbackLead}: ${strongest[0]} (${strongest[1]}/100). ${labels.improveLead}: add one specific decision, one measurable outcome, and a clearer link back to the JD to raise ${weakest[0].toLowerCase()}.`;
}
function compactNumber(value: number, locale: LocaleCode = "en") {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function preferredLocale(languages: readonly string[]) {
  for (const rawLanguage of languages) {
    const normalized = rawLanguage.replace("_", "-");
    const exact = LANGUAGES.find(
      ([code]) => code.toLowerCase() === normalized.toLowerCase(),
    );
    if (exact) return exact[0];
    const base = normalized.split("-")[0].toLowerCase();
    if (base === "zh")
      return /hant|tw|hk|mo/i.test(normalized) ? "zh-TW" : "zh-CN";
    const related = LANGUAGES.find(([code]) => code.split("-")[0] === base);
    if (related) return related[0];
  }
  return "en";
}

function marketForCountry(countryCode: string | null) {
  if (!countryCode) return "US";
  const normalized = countryCode.toUpperCase();
  if (EURO_COUNTRIES.has(normalized)) return "EU";
  return BILLING_MARKETS.some((market) => market.code === normalized)
    ? normalized
    : "US";
}

function marketForLanguage(language: string) {
  const normalized = language.replace("_", "-");
  const region = normalized.split("-")[1]?.toUpperCase();
  if (region) return marketForCountry(region);
  return LANGUAGE_MARKETS[normalized.split("-")[0].toLowerCase()] || "US";
}

function friendlyPrice(value: number, currency: string) {
  const step = FRIENDLY_PRICE_STEPS[currency] || 1;
  return Math.round(value / step) * step;
}

function formatPrice(value: number, currency: string, locale: LocaleCode) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatBillingUnit(locale: LocaleCode, unit: "month" | "year") {
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit,
    unitDisplay: "long",
    maximumFractionDigits: 0,
  }).format(1);
}

export default function Home({
  initialLocale,
}: {
  initialLocale?: LocaleCode;
} = {}) {
  const [active, setActive] = useState<WorkspaceView>("Analyze");
  const [locale, setLocale] = useState<LocaleCode>(initialLocale || "en");
  const [applicationMode, setApplicationMode] =
    useState<ApplicationMode>("Manual");
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [provider, setProvider] = useState("Evidence engine");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadingDestination, setUploadingDestination] = useState<
    "jd" | "resume" | null
  >(null);
  const [modelEndpoint, setModelEndpoint] = useState("");
  const [modelName, setModelName] = useState("");
  const [modelStatus, setModelStatus] = useState(
    "Built-in evidence matching is ready on this device.",
  );
  const [modelInsight, setModelInsight] = useState("");
  const [modelRunning, setModelRunning] = useState(false);
  const [roleQuery, setRoleQuery] = useState("");
  const [region, setRegion] = useState("Worldwide");
  const [country, setCountry] = useState("All countries");
  const [radius, setRadius] = useState("Worldwide");
  const [workStyle, setWorkStyle] = useState("All work styles");
  const [industry, setIndustry] = useState("All industries");
  const [roleFamily, setRoleFamily] = useState("All role families");
  const [timeRange, setTimeRange] = useState("Last 30 days");
  const [approvedSource, setApprovedSource] =
    useState<ApprovedSourceId>("greenhouse");
  const [sourceReference, setSourceReference] = useState("");
  const [sourceJobs, setSourceJobs] = useState<Job[] | null>(null);
  const [sourceMeta, setSourceMeta] = useState<ApprovedSourceMeta | null>(null);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState("");
  const [tracker, setTracker] = useState<TrackerItem[]>([]);
  const [radarThreshold, setRadarThreshold] = useState(78);
  const [autoTrackRadar, setAutoTrackRadar] = useState(true);
  const [browserAlerts, setBrowserAlerts] = useState(true);
  const [radarAlerts, setRadarAlerts] = useState<RadarAlert[]>([]);
  const [radarMessage, setRadarMessage] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported" | "unknown"
  >("unknown");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [copilotRunning, setCopilotRunning] = useState(false);
  const [interviewPersona, setInterviewPersona] =
    useState<InterviewPersonaId>("hiring-manager");
  const [interviewMode, setInterviewMode] =
    useState<InterviewMode>("Coaching");
  const [interviewMessages, setInterviewMessages] = useState<ChatMessage[]>([]);
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [interviewTurn, setInterviewTurn] = useState(0);
  const [interviewScores, setInterviewScores] =
    useState<InterviewScore | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [voiceInterim, setVoiceInterim] = useState("");
  const [recognitionConfidence, setRecognitionConfidence] = useState<
    number | null
  >(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [suggestedLocale, setSuggestedLocale] =
    useState<LocaleCode | null>(null);
  const [billingMarketCode, setBillingMarketCode] = useState("US");
  const copy = copyFor(locale);
  const detail = detailFor(locale);
  const accountLabels = accountCopyFor(locale);
  const interview = interviewCopyFor(locale);
  const selectedProvider =
    PROVIDERS.find((item) => item.id === provider) || PROVIDERS[0];
  const preferencesLoaded = useRef(false);
  const speechRecognitionRef = useRef<{
    start: () => void;
    stop: () => void;
  } | null>(null);
  const keepListeningRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const requestedView = new URLSearchParams(window.location.search).get(
        "view",
      );
      if (
        requestedView &&
        [
          "Analyze",
          "Recommendations",
          "Market Insights",
          "Tracker",
          "Interview Studio",
          "Copilot",
          "Feedback",
        ].includes(requestedView)
      ) {
        setActive(requestedView as WorkspaceView);
      }
      const savedLocale = (window.localStorage.getItem("aptograph-locale") ||
        window.localStorage.getItem("careerproof-locale")) as LocaleCode | null;
      const savedTracker =
        window.localStorage.getItem("aptograph-tracker") ||
        window.localStorage.getItem("careerproof-tracker");
      const savedBillingMarket = window.localStorage.getItem(
        "aptograph-billing-market",
      );
      const savedRadarSettings = window.localStorage.getItem(
        "aptograph-story-radar-settings",
      );
      const savedRadarAlerts = window.localStorage.getItem(
        "aptograph-story-radar-alerts",
      );
      const savedInterview = window.localStorage.getItem(
        "aptograph-interview-session",
      );
      const savedModelSettings = window.localStorage.getItem(
        "aptograph-model-settings",
      );
      if (
        !initialLocale &&
        savedLocale &&
        LANGUAGES.some(([code]) => code === savedLocale)
      )
        setLocale(savedLocale);
      else if (
        !initialLocale &&
        !window.localStorage.getItem("aptograph-language-prompt-dismissed")
      ) {
        const detectedLocale = preferredLocale(navigator.languages);
        if (detectedLocale !== "en") setSuggestedLocale(detectedLocale);
      }
      if (
        savedBillingMarket &&
        BILLING_MARKETS.some((market) => market.code === savedBillingMarket)
      )
        setBillingMarketCode(savedBillingMarket);
      else setBillingMarketCode(marketForLanguage(navigator.language));
      if (savedTracker) {
        try {
          setTracker(JSON.parse(savedTracker));
        } catch {
          setTracker([]);
        }
      }
      if (savedRadarSettings) {
        try {
          const settings = JSON.parse(savedRadarSettings) as {
            threshold?: number;
            autoTrack?: boolean;
            browserAlerts?: boolean;
          };
          if (
            Number.isInteger(settings.threshold) &&
            Number(settings.threshold) >= 65 &&
            Number(settings.threshold) <= 90
          )
            setRadarThreshold(Number(settings.threshold));
          if (typeof settings.autoTrack === "boolean")
            setAutoTrackRadar(settings.autoTrack);
          if (typeof settings.browserAlerts === "boolean")
            setBrowserAlerts(settings.browserAlerts);
        } catch {
          window.localStorage.removeItem("aptograph-story-radar-settings");
        }
      }
      if (savedRadarAlerts) {
        try {
          setRadarAlerts(JSON.parse(savedRadarAlerts));
        } catch {
          window.localStorage.removeItem("aptograph-story-radar-alerts");
        }
      }
      if (savedInterview) {
        try {
          const session = JSON.parse(savedInterview) as {
            persona?: InterviewPersonaId;
            mode?: InterviewMode;
            messages?: ChatMessage[];
            turn?: number;
            scores?: InterviewScore | null;
            locale?: LocaleCode;
          };
          if (INTERVIEW_PERSONAS.some((item) => item.id === session.persona))
            setInterviewPersona(session.persona as InterviewPersonaId);
          if (session.mode === "Coaching" || session.mode === "Realistic")
            setInterviewMode(session.mode);
          if (
            session.locale ===
              (initialLocale ||
                (savedLocale &&
                LANGUAGES.some(([code]) => code === savedLocale)
                  ? savedLocale
                  : "en")) &&
            Array.isArray(session.messages)
          ) {
            setInterviewMessages(session.messages);
            if (Number.isInteger(session.turn))
              setInterviewTurn(session.turn || 0);
            if (session.scores) setInterviewScores(session.scores);
          }
        } catch {
          window.localStorage.removeItem("aptograph-interview-session");
        }
      }
      if (savedModelSettings) {
        try {
          const settings = JSON.parse(savedModelSettings) as {
            provider?: string;
            endpoint?: string;
            model?: string;
          };
          if (PROVIDERS.some((item) => item.id === settings.provider))
            setProvider(settings.provider || "Evidence engine");
          if (settings.endpoint) setModelEndpoint(settings.endpoint);
          if (settings.model) setModelName(settings.model);
        } catch {
          window.localStorage.removeItem("aptograph-model-settings");
        }
      }
      setNotificationPermission(
        "Notification" in window ? Notification.permission : "unsupported",
      );
      preferencesLoaded.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialLocale]);
  useEffect(() => {
    if (window.localStorage.getItem("aptograph-billing-market")) return;
    const controller = new AbortController();
    fetch("/api/region", { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { country?: string | null }) => {
        if (data.country) setBillingMarketCode(marketForCountry(data.country));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
    keepListeningRef.current = false;
    speechRecognitionRef.current?.stop();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (preferencesLoaded.current)
      window.localStorage.setItem("aptograph-locale", locale);
  }, [locale]);

  useEffect(() => {
    if (!preferencesLoaded.current) return;
    window.localStorage.setItem(
      "aptograph-story-radar-settings",
      JSON.stringify({
        threshold: radarThreshold,
        autoTrack: autoTrackRadar,
        browserAlerts,
      }),
    );
  }, [autoTrackRadar, browserAlerts, radarThreshold]);

  useEffect(() => {
    if (!preferencesLoaded.current) return;
    window.localStorage.setItem(
      "aptograph-interview-session",
      JSON.stringify({
        persona: interviewPersona,
        mode: interviewMode,
        messages: interviewMessages.slice(-12),
        turn: interviewTurn,
        scores: interviewScores,
        locale,
      }),
    );
  }, [
    interviewMessages,
    interviewMode,
    interviewPersona,
    interviewScores,
    interviewTurn,
    locale,
  ]);

  useEffect(() => {
    if (!preferencesLoaded.current) return;
    window.localStorage.setItem(
      "aptograph-model-settings",
      JSON.stringify({ provider, endpoint: modelEndpoint, model: modelName }),
    );
  }, [modelEndpoint, modelName, provider]);

  useEffect(
    () => () => {
      keepListeningRef.current = false;
      speechRecognitionRef.current?.stop();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [],
  );

  function chooseLocale(nextLocale: LocaleCode) {
    setLocale(nextLocale);
    setSuggestedLocale(null);
    window.localStorage.setItem("aptograph-locale", nextLocale);
    window.localStorage.setItem("aptograph-language-prompt-dismissed", "true");
    const segments = window.location.pathname.split("/").filter(Boolean);
    const currentPathLocale = segments[0]
      ? localeFromPath(segments[0])
      : null;
    const remaining = currentPathLocale ? segments.slice(1) : segments;
    const nextPath = `/${[localeToPath(nextLocale), ...remaining].join("/")}`;
    window.location.assign(
      `${nextPath}${window.location.search}${window.location.hash}`,
    );
  }

  function chooseBillingMarket(nextMarket: string) {
    setBillingMarketCode(nextMarket);
    window.localStorage.setItem("aptograph-billing-market", nextMarket);
  }

  function openWorkspace(
    nextView: WorkspaceView,
    nextMode?: ApplicationMode,
  ) {
    if (nextMode) setApplicationMode(nextMode);
    setActive(nextView);
    window.history.pushState(null, "", "#workspace");
    window.requestAnimationFrame(() => {
      document.getElementById("workspace")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  const score = useMemo(() => scoreMatches(matches), [matches]);
  const strongCount = matches.filter(
    (item) => item.status === "Strong evidence",
  ).length;
  const required = matches.filter((item) => item.priority === "Required");
  const requiredScore = required.length
    ? Math.round(
        (required.filter((item) => item.status === "Strong evidence").length /
          required.length) *
          100,
      )
    : score;
  const recommendedJobs = useMemo<RankedJob[]>(
    () =>
      (sourceJobs || JOBS)
        .filter((job) => region === "Worldwide" || job.region === region)
        .filter((job) => country === "All countries" || job.country === country)
        .filter(
          (job) =>
            workStyle === "All work styles" || job.workStyle === workStyle,
        )
        .filter(
          (job) => industry === "All industries" || job.industry === industry,
        )
        .filter(
          (job) =>
            !roleQuery.trim() ||
            `${job.title} ${job.description}`
              .toLowerCase()
              .includes(
                roleQuery
                  .trim()
                  .toLowerCase()
                  .replace("product analyst", "product"),
              ),
        )
        .map((job) => {
          const evidence = runMatch(job.description, resume);
          const fit = storyFitFor(evidence);
          const supported = evidence
            .filter((item) => item.status !== "Gap")
            .map((item) => item.keyword)
            .slice(0, 5);
          const gaps = evidence
            .filter((item) => item.status === "Gap")
            .map((item) => item.keyword)
            .slice(0, 5);
          const proof = evidence.filter(
            (item) =>
              item.status === "Strong evidence" &&
              item.evidence !== "No source evidence found.",
          );
          const storyEvidence =
            proof.find((item) => outcomeStrengthFor([item]) === 100) || proof[0];
          const requiredGapCount = evidence.filter(
            (item) => item.priority === "Required" && item.status === "Gap",
          ).length;
          const alertEligible =
            fit.storyFit >= radarThreshold &&
            proof.length >= 2 &&
            requiredGapCount === 0;
          return {
            ...job,
            trend: job.trend || 0,
            match: fit.evidenceCoverage,
            storyFit: fit.storyFit,
            requiredCoverage: fit.requiredCoverage,
            outcomeStrength: fit.outcomeStrength,
            proofCount: proof.length,
            requiredGapCount,
            alertEligible,
            alertReason: `${proof.length} proof-backed signals · ${requiredGapCount} unsupported must-haves · ${fit.outcomeStrength}% outcome strength`,
            whyNow: job.isLive
              ? `New from ${job.source || "an approved employer source"}; your evidence supports ${proof.length} of its strongest signals.`
              : `${job.trend && job.trend > 0 ? `Demand signal +${job.trend}%` : "Current demand signal"}; your profile carries ${proof.length} defensible proof points.`,
            strengths: job.isLive ? supported : job.strengths || supported,
            gaps: job.isLive ? gaps : job.gaps || gaps,
            story: job.isLive
              ? storyEvidence?.evidence ||
                "Add a verified result that supports the strongest matched requirement."
              : job.story || "Add a verified story before tailoring this role.",
          };
        })
        .sort((a, b) => b.storyFit - a.storyFit),
    [
      country,
      industry,
      radarThreshold,
      region,
      resume,
      roleQuery,
      sourceJobs,
      workStyle,
    ],
  );
  const proofQualifiedJobs = recommendedJobs.filter(
    (job) => job.alertEligible,
  );
  const marketRows = useMemo(() => {
    if (sourceJobs) {
      const filtered = sourceJobs
        .filter((job) => country === "All countries" || job.country === country)
        .filter(
          (job) =>
            industry === "All industries" || job.industry === industry,
        );
      const grouped = new Map<string, Job[]>();
      filtered.forEach((job) => {
        const group = job.department || job.industry || "Other";
        grouped.set(group, [...(grouped.get(group) || []), job]);
      });
      return [...grouped.entries()].map(([group, jobs]) => ({
        industry: group,
        role: "Published roles",
        openings: jobs.length,
        change: 0,
        remote: Math.round(
          (jobs.filter((job) => job.workStyle === "Remote").length /
            Math.max(jobs.length, 1)) *
            100,
        ),
      }));
    }
    const factor =
      (REGION_FACTORS[region] || 1) * (country === "All countries" ? 1 : 0.24);
    const countryShift =
      country === "All countries" ? 0 : ((country.length % 5) - 2) * 0.7;
    return MARKET_BASE.filter(
      (item) => industry === "All industries" || item.industry === industry,
    )
      .filter(
        (item) =>
          roleFamily === "All role families" || item.role === roleFamily,
      )
      .map((item) => ({
        ...item,
        openings: Math.round(item.openings * factor),
        change: Number((item.change + countryShift).toFixed(1)),
      }));
  }, [country, industry, region, roleFamily, sourceJobs]);
  const totalOpenings = marketRows.reduce(
    (sum, item) => sum + item.openings,
    0,
  );
  const weightedChange = marketRows.length && !sourceJobs
    ? marketRows.reduce((sum, item) => sum + item.change * item.openings, 0) /
      Math.max(totalOpenings, 1)
    : null;
  const remoteShare = marketRows.length
    ? marketRows.reduce((sum, item) => sum + item.remote, 0) / marketRows.length
    : 0;
  const maxOpenings = Math.max(...marketRows.map((item) => item.openings), 1);

  function updateRegion(next: string) {
    setRegion(next);
    setCountry("All countries");
  }
  async function connectApprovedSource(event: FormEvent) {
    event.preventDefault();
    if (!sourceReference.trim()) return;
    setSourceLoading(true);
    setSourceError("");
    try {
      const params = new URLSearchParams({
        provider: approvedSource,
        reference: sourceReference.trim(),
      });
      const response = await fetch(`/api/jobs?${params.toString()}`);
      const payload = (await response.json()) as {
        error?: string;
        source?: ApprovedSourceMeta;
        jobs?: Job[];
      };
      if (!response.ok || !payload.source || !payload.jobs) {
        throw new Error(payload.error || "The approved source could not be loaded.");
      }
      setSourceMeta(payload.source);
      setSourceJobs(payload.jobs.map((job) => ({ ...job, isLive: true })));
    } catch (error) {
      setSourceMeta(null);
      setSourceJobs(null);
      setSourceError(
        error instanceof Error ? error.message : "The approved source could not be loaded.",
      );
    } finally {
      setSourceLoading(false);
    }
  }
  function useExampleJobs() {
    setSourceJobs(null);
    setSourceMeta(null);
    setSourceError("");
  }
  function selectProvider(nextProvider: string) {
    const definition =
      PROVIDERS.find((item) => item.id === nextProvider) || PROVIDERS[0];
    setProvider(definition.id);
    setModelEndpoint(definition.endpoint);
    setModelName(definition.model);
    setModelInsight("");
    setModelStatus(
      definition.kind === "built-in"
        ? "Built-in evidence matching is ready on this device."
        : "Enter the local endpoint and loaded model name, then test the connection.",
    );
  }

  function modelUrl(path: string) {
    const base = modelEndpoint.trim().replace(/\/$/, "");
    if (selectedProvider.kind === "ollama") return `${base}${path}`;
    const normalized = base.endsWith("/v1") ? base : `${base}/v1`;
    return `${normalized}${path}`;
  }

  async function testModelConnection() {
    if (selectedProvider.kind === "built-in") {
      setModelStatus("Built-in evidence matching is ready on this device.");
      return;
    }
    if (!modelEndpoint.trim()) {
      setModelStatus("Enter a local endpoint first.");
      return;
    }
    setModelRunning(true);
    setModelStatus("Testing the local connection…");
    try {
      const response = await fetch(
        selectedProvider.kind === "ollama"
          ? modelUrl("/api/tags")
          : modelUrl("/models"),
        { signal: AbortSignal.timeout(7_000) },
      );
      if (!response.ok) throw new Error(`The endpoint returned ${response.status}.`);
      const payload = (await response.json()) as {
        models?: Array<{ name?: string; id?: string }>;
        data?: Array<{ id?: string }>;
      };
      const models =
        payload.models?.map((item) => item.name || item.id || "").filter(Boolean) ||
        payload.data?.map((item) => item.id || "").filter(Boolean) ||
        [];
      if (models.length && (!modelName.trim() || modelName === "local-model"))
        setModelName(models[0]);
      setModelStatus(
        `Connected locally. ${models.length ? `${models.length} model${models.length === 1 ? "" : "s"} available.` : "The endpoint responded successfully."}`,
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Connection failed.";
      setModelStatus(
        `Could not connect: ${reason} Confirm the server is running and allows this site's origin through CORS.`,
      );
    } finally {
      setModelRunning(false);
    }
  }

  async function requestConfiguredModel(prompt: string) {
    const response = await fetch(
      selectedProvider.kind === "ollama"
        ? modelUrl("/api/chat")
        : modelUrl("/chat/completions"),
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          selectedProvider.kind === "ollama"
            ? {
                model: modelName.trim(),
                messages: [{ role: "user", content: prompt }],
                stream: false,
              }
            : {
                model: modelName.trim(),
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                stream: false,
              },
        ),
        signal: AbortSignal.timeout(60_000),
      },
    );
    const payload = (await response.json()) as {
      error?: { message?: string } | string;
      message?: { content?: string };
      choices?: Array<{ message?: { content?: string } }>;
    };
    if (!response.ok)
      throw new Error(
        typeof payload.error === "string"
          ? payload.error
          : payload.error?.message || `The model returned ${response.status}.`,
      );
    const content =
      payload.message?.content || payload.choices?.[0]?.message?.content || "";
    if (!content.trim()) throw new Error("The model returned an empty response.");
    return content.trim();
  }

  async function runModelAnalysis() {
    const nextMatches = runMatch(jd, resume);
    setMatches(nextMatches);
    setModelInsight("");
    if (selectedProvider.kind === "built-in") {
      const fit = storyFitFor(nextMatches);
      const proof = firstEvidence(nextMatches);
      setModelStatus("Completed on this device with the deterministic evidence engine.");
      setModelInsight(
        proof
          ? `Lead with ${proof.keyword}: ${proof.evidence} Story fit is ${fit.storyFit}/100; unsupported requirements remain visible as gaps.`
          : "No proof-backed story was found yet. Add a concrete action and measurable result to the resume evidence.",
      );
      return;
    }
    if (!modelEndpoint.trim() || !modelName.trim()) {
      setModelStatus(
        "The evidence matrix ran locally. To add model coaching, enter a local endpoint and the exact loaded model name.",
      );
      return;
    }

    setModelRunning(true);
    setModelStatus(`Running ${modelName.trim()} on your configured endpoint…`);
    const prompt = `You are CareerStoryMap, an evidence-grounded career coach. Compare the resume evidence with the job description. Never invent experience. Return concise plain text with exactly three headings: BEST STORY, PROOF TO QUOTE, GAPS TO ADDRESS.\n\nJOB DESCRIPTION\n${jd.slice(0, 10_000)}\n\nRESUME EVIDENCE\n${resume.slice(0, 10_000)}`;
    try {
      const content = await requestConfiguredModel(prompt);
      setModelInsight(content.trim());
      setModelStatus(
        `${modelName.trim()} completed. Keyword evidence remains deterministic; the model adds story coaching only.`,
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Model request failed.";
      setModelStatus(
        `The evidence matrix completed locally, but ${provider} coaching failed: ${reason}`,
      );
    } finally {
      setModelRunning(false);
    }
  }

  async function loadFile(
    event: ChangeEvent<HTMLInputElement>,
    destination: "jd" | "resume",
  ) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploadingDestination(destination);
    setUploadMessage(
      locale === "en" ? `Reading ${files.length} file(s) on this device…` : detail.importAny,
    );
    try {
      const { documents, errors } = await parseDocuments(files);
      if (documents.length) {
        const text = documents
          .map((document) =>
            documents.length === 1
              ? document.text
              : `--- ${document.name} · ${document.kind} ---\n${document.text}`,
          )
          .join("\n\n");
        if (destination === "jd") setJd(text);
        else setResume(text);
      }
      setUploadMessage(
        [
          documents.length
            ? `${documents.length} file${documents.length === 1 ? "" : "s"} loaded locally: ${documents.map((document) => `${document.name} (${document.kind})`).join(", ")}.`
            : "No readable document was loaded.",
          ...errors,
        ].join(" "),
      );
    } finally {
      setUploadingDestination(null);
      event.target.value = "";
    }
  }
  function persistTracker(next: TrackerItem[]) {
    setTracker(next);
    window.localStorage.setItem("aptograph-tracker", JSON.stringify(next));
  }
  function persistRadarAlerts(next: RadarAlert[]) {
    setRadarAlerts(next);
    window.localStorage.setItem(
      "aptograph-story-radar-alerts",
      JSON.stringify(next),
    );
  }
  function saveJob(job: RankedJob, source: TrackerItem["source"] = "Saved") {
    if (!tracker.some((item) => item.id === job.id))
      persistTracker([
        {
          id: job.id,
          company: job.company,
          role: job.title,
          status: "Interested",
          source,
          storyFit: job.storyFit,
          story: job.story,
          sourceUrl: job.sourceUrl,
          trackedAt: new Date().toISOString(),
        },
        ...tracker,
      ]);
  }
  function trackRadarAlert(alert: RadarAlert) {
    if (!tracker.some((item) => item.id === alert.jobId))
      persistTracker([
        {
          id: alert.jobId,
          company: alert.company,
          role: alert.role,
          status: "Interested",
          source: "Story Signal",
          storyFit: alert.storyFit,
          story: alert.story,
          sourceUrl: alert.sourceUrl,
          trackedAt: new Date().toISOString(),
        },
        ...tracker,
      ]);
    persistRadarAlerts(
      radarAlerts.map((item) =>
        item.id === alert.id ? { ...item, tracked: true } : item,
      ),
    );
  }
  async function scanStoryRadar() {
    const existingJobIds = new Set(radarAlerts.map((alert) => alert.jobId));
    const trackerIds = new Set(tracker.map((item) => item.id));
    const newlyQualified = proofQualifiedJobs.filter(
      (job) => !existingJobIds.has(job.id),
    );
    const createdAt = new Date().toISOString();

    if (autoTrackRadar) {
      const trackerAdditions = proofQualifiedJobs
        .filter((job) => !trackerIds.has(job.id))
        .map((job) => ({
          id: job.id,
          company: job.company,
          role: job.title,
          status: "Interested",
          source: "Story Signal" as const,
          storyFit: job.storyFit,
          story: job.story,
          sourceUrl: job.sourceUrl,
          trackedAt: createdAt,
        }));
      if (trackerAdditions.length)
        persistTracker([...trackerAdditions, ...tracker]);
    }

    const qualifiedAlerts = proofQualifiedJobs.map((job) => {
      const existing = radarAlerts.find((alert) => alert.jobId === job.id);
      return {
        id: existing?.id || crypto.randomUUID(),
        jobId: job.id,
        company: job.company,
        role: job.title,
        storyFit: job.storyFit,
        reason: job.alertReason,
        story: job.story,
        sourceUrl: job.sourceUrl,
        createdAt: existing?.createdAt || createdAt,
        tracked:
          autoTrackRadar || trackerIds.has(job.id) || Boolean(existing?.tracked),
      };
    });
    const qualifiedIds = new Set(qualifiedAlerts.map((alert) => alert.jobId));
    persistRadarAlerts([
      ...qualifiedAlerts,
      ...radarAlerts.filter((alert) => !qualifiedIds.has(alert.jobId)),
    ].slice(0, 24));

    let permission = notificationPermission;
    if (browserAlerts && "Notification" in window) {
      if (Notification.permission === "default")
        permission = await Notification.requestPermission();
      else permission = Notification.permission;
      setNotificationPermission(permission);
      const top = newlyQualified[0];
      if (permission === "granted" && top)
        new Notification("CareerStoryMap Story Signal", {
          body: `${top.storyFit}% story fit · ${top.title} at ${top.company}. ${top.proofCount} proof-backed signals.`,
          tag: `aptograph-${top.id}`,
        });
    }

    setRadarMessage(
      proofQualifiedJobs.length
        ? `${proofQualifiedJobs.length} proof-qualified role${proofQualifiedJobs.length === 1 ? "" : "s"} found${autoTrackRadar ? " and added to your tracker" : ""}.`
        : `No role cleared the ${radarThreshold}% story-fit threshold with two proof signals and zero unsupported must-haves.`,
    );
  }
  function addTrackerItem(event: FormEvent) {
    event.preventDefault();
    if (!company.trim() || !role.trim()) return;
    persistTracker([
      {
        id: crypto.randomUUID(),
        company: company.trim(),
        role: role.trim(),
        status: "Interested",
      },
      ...tracker,
    ]);
    setCompany("");
    setRole("");
  }
  async function askCopilot(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    const userQuestion = question.trim();
    const gaps = matches
      .filter((item) => item.status === "Gap")
      .map((item) => item.keyword)
      .slice(0, 4);
    const strong = matches
      .filter((item) => item.status === "Strong evidence")
      .map((item) => item.keyword)
      .slice(0, 4);
    const proof = firstEvidence(matches);
    const fallbackReply =
      locale === "zh-TW"
        ? `你可以先說：「我適合這個職位，因為我已經用 ${strong.join("、") || "相關能力"} 解決過相近問題。」接著引用這項證據：${proof?.evidence || "補上一個你親自採取行動並帶來成果的例子。"} 最後主動說明仍需補足的部分：${gaps.join("、") || "目前沒有明顯必要條件缺口"}。`
        : `Lead with this claim: “I fit this role because I have already used ${strong.join(", ") || "relevant evidence"} to solve a similar problem.” Then quote this proof: ${proof?.evidence || "add one example with your action and outcome."} Address these gaps directly: ${gaps.join(", ") || "no clear must-have gaps"}.`;
    setMessages((current) => [
      ...current,
      { role: "user", content: userQuestion },
    ]);
    setQuestion("");
    setCopilotRunning(true);
    try {
      let reply = fallbackReply;
      if (
        selectedProvider.kind !== "built-in" &&
        modelEndpoint.trim() &&
        modelName.trim()
      ) {
        reply = await requestConfiguredModel(
          `You are CareerStoryMap, an evidence-grounded career copilot. Answer the user's question in ${LANGUAGES.find(([code]) => code === locale)?.[1] || "English"}. Never invent experience. Ground the answer in the resume and JD, clearly label any gap, and give wording the candidate can truthfully say.\n\nQUESTION\n${userQuestion}\n\nJOB DESCRIPTION\n${jd.slice(0, 8_000)}\n\nRESUME EVIDENCE\n${resume.slice(0, 8_000)}`,
        );
      }
      setMessages((current) => [
        ...current,
        { role: "assistant", content: reply },
      ]);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Model request failed.";
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `${fallbackReply}\n\nLocal model note: ${reason}`,
        },
      ]);
    } finally {
      setCopilotRunning(false);
    }
  }

  function startInterview() {
    keepListeningRef.current = false;
    speechRecognitionRef.current?.stop();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    const opening = questionForInterview(interviewPersona, 0, matches, locale);
    setInterviewMessages([{ role: "assistant", content: opening }]);
    setInterviewTurn(0);
    setInterviewScores(null);
    setInterviewAnswer("");
    setVoiceMessage("");
    setVoiceInterim("");
    setRecognitionConfidence(null);
    setIsListening(false);
    setIsSpeaking(false);
  }

  function submitInterviewAnswer(event: FormEvent) {
    event.preventDefault();
    const answer = interviewAnswer.trim();
    if (!answer || !interviewMessages.length) return;
    keepListeningRef.current = false;
    speechRecognitionRef.current?.stop();
    const scores = scoreInterviewAnswer(answer, matches);
    const nextTurn = interviewTurn + 1;
    const nextQuestion = questionForInterview(
      interviewPersona,
      nextTurn,
      matches,
      locale,
    );
    const feedback = interviewFeedback(scores, interview, interviewMode);
    setInterviewMessages((current) => [
      ...current,
      { role: "user", content: answer },
      {
        role: "assistant",
        content:
          interviewMode === "Coaching"
            ? `${feedback}\n\n${nextQuestion}`
            : nextQuestion,
      },
    ]);
    setInterviewScores(scores);
    setInterviewTurn(nextTurn);
    setInterviewAnswer("");
    setVoiceMessage("");
    setVoiceInterim("");
    setRecognitionConfidence(null);
    setIsListening(false);
  }

  async function speakLatestInterviewQuestion() {
    if (!("speechSynthesis" in window) || !interviewMessages.length) {
      setVoiceMessage(interview.unavailable);
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const latest = [...interviewMessages]
      .reverse()
      .find((message) => message.role === "assistant");
    if (!latest) return;
    const speechLocale = speechLocaleFor(locale);
    const utterance = new SpeechSynthesisUtterance(
      questionOnly(latest.content),
    );
    utterance.lang = speechLocale;
    utterance.rate = speechRateFor(
      locale,
      interviewMode === "Realistic",
    );
    utterance.pitch = 1;
    utterance.volume = 1;
    const voice = bestSpeechVoice(await availableSpeechVoices(), locale);
    if (voice) utterance.voice = voice;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setVoiceMessage(interview.unavailable);
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setVoiceMessage(
      `${interview.speechLanguage}: ${speechLocale}${voice ? ` · ${voice.name}` : ""}`,
    );
  }

  function toggleInterviewListening() {
    type RecognitionAlternative = {
      transcript: string;
      confidence?: number;
    };
    type RecognitionResult = ArrayLike<RecognitionAlternative> & {
      isFinal?: boolean;
    };
    type BrowserRecognition = {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      maxAlternatives: number;
      start: () => void;
      stop: () => void;
      onresult:
        | ((event: {
            resultIndex?: number;
            results: ArrayLike<RecognitionResult>;
          }) => void)
        | null;
      onend: (() => void) | null;
      onerror: ((event: { error?: string }) => void) | null;
    };
    type RecognitionConstructor = new () => BrowserRecognition;
    const voiceWindow = window as typeof window & {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    };
    const Recognition =
      voiceWindow.SpeechRecognition || voiceWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceMessage(interview.unavailable);
      return;
    }
    if (isListening) {
      keepListeningRef.current = false;
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      setVoiceInterim("");
      return;
    }
    const recognition = new Recognition();
    const speechLocale = speechLocaleFor(locale);
    recognition.lang = speechLocale;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.onresult = (event) => {
      const finalSegments: string[] = [];
      const interimSegments: string[] = [];
      const confidences: number[] = [];
      const startIndex = event.resultIndex || 0;
      for (let index = startIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const alternatives = Array.from(result).sort(
          (left, right) => (right.confidence || 0) - (left.confidence || 0),
        );
        const best = alternatives[0];
        const transcript = best?.transcript?.trim();
        if (!transcript) continue;
        if (typeof best.confidence === "number" && best.confidence > 0)
          confidences.push(best.confidence);
        if (result.isFinal) finalSegments.push(transcript);
        else interimSegments.push(transcript);
      }
      const finalText = finalSegments.join(
        ["zh-CN", "zh-TW", "ja", "th"].includes(locale) ? "" : " ",
      );
      if (finalText)
        setInterviewAnswer((current) =>
          appendTranscript(current, finalText, locale),
        );
      setVoiceInterim(
        interimSegments.join(
          ["zh-CN", "zh-TW", "ja", "th"].includes(locale) ? "" : " ",
        ),
      );
      if (confidences.length)
        setRecognitionConfidence(
          Math.round(
            (confidences.reduce((sum, value) => sum + value, 0) /
              confidences.length) *
              100,
          ),
        );
    };
    recognition.onend = () => {
      if (keepListeningRef.current) {
        window.setTimeout(() => {
          if (!keepListeningRef.current) return;
          try {
            recognition.start();
          } catch {
            keepListeningRef.current = false;
            setIsListening(false);
          }
        }, 250);
      } else {
        setIsListening(false);
      }
    };
    recognition.onerror = (event) => {
      const error = event.error || "";
      if (["not-allowed", "service-not-allowed"].includes(error)) {
        keepListeningRef.current = false;
        setVoiceMessage(interview.permissionDenied);
      } else if (error === "no-speech") {
        setVoiceMessage(interview.noSpeech);
      } else if (error !== "aborted") {
        setVoiceMessage(interview.unavailable);
      }
      if (error !== "no-speech") setIsListening(false);
    };
    speechRecognitionRef.current = recognition;
    keepListeningRef.current = true;
    try {
      recognition.start();
      setIsListening(true);
      setVoiceInterim("");
      setRecognitionConfidence(null);
      setVoiceMessage(`${interview.speechLanguage}: ${speechLocale}`);
    } catch {
      keepListeningRef.current = false;
      setIsListening(false);
      setVoiceMessage(interview.unavailable);
    }
  }
  async function sendFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedbackSubmitting(true);
    setFeedbackError("");
    const data = new FormData(event.currentTarget);
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(data.entries()),
          rating: Number(data.get("rating")),
          locale,
        }),
      });
      if (!response.ok) throw new Error("Feedback submission failed");
      setFeedbackSent(true);
      form.reset();
    } catch {
      setFeedbackError(
        locale === "en"
          ? "Your feedback was not sent. Please try again."
          : copy.heroBody,
      );
    } finally {
      setFeedbackSubmitting(false);
    }
  }

  const flowViews: {
    id: WorkspaceView;
    label: string;
    description: string;
  }[] = [
    { id: "Analyze", label: copy.analyze, description: detail.compare },
    {
      id: "Recommendations",
      label: copy.recommendations,
      description: detail.recommendationsTitle,
    },
    { id: "Tracker", label: copy.tracker, description: detail.trackerTitle },
    {
      id: "Interview Studio",
      label: copy.interview,
      description: interview.title,
    },
  ];
  const supportViews: {
    id: WorkspaceView;
    label: string;
    description: string;
  }[] = [
    {
      id: "Market Insights",
      label: copy.market,
      description: detail.marketTitle,
    },
    { id: "Copilot", label: copy.copilot, description: detail.assistantTitle },
    { id: "Feedback", label: copy.feedback, description: detail.feedbackTitle },
  ];
  const views = [...flowViews, ...supportViews];
  const activeView = views.find((item) => item.id === active) || flowViews[0];
  const flowIndex = flowViews.findIndex((item) => item.id === active);
  const previousView =
    flowIndex > 0
      ? flowViews[flowIndex - 1]
      : active === "Market Insights" || active === "Copilot"
        ? flowViews[0]
        : active === "Feedback"
          ? flowViews[2]
          : null;
  const nextView =
    flowIndex >= 0 && flowIndex < flowViews.length - 1
      ? flowViews[flowIndex + 1]
      : active === "Interview Studio"
        ? flowViews[1]
        : active === "Market Insights"
          ? flowViews[1]
          : active === "Copilot"
            ? flowViews[3]
            : flowViews[0];
  const needsEvidence =
    !resume.trim() &&
    ["Recommendations", "Tracker", "Interview Studio", "Copilot"].includes(
      active,
    );
  const modeMessage =
    MODE_DISCLOSURES[locale]?.[applicationMode] ||
    (applicationMode === "Manual"
      ? "Open-source and free. You review every role, edit every document, and submit every application yourself."
      : applicationMode === "Hybrid"
        ? "Pro preview. AI can prepare a tailored draft and queue next steps, but you must approve every submission."
        : "Pro preview. Nothing is submitted automatically in this public version. A future release will require approved employer APIs, consent, rate limits, an audit log, and an emergency stop.");
  const modeContext = MODE_CONTEXT[locale] || MODE_CONTEXT.en;
  const billingMarket =
    BILLING_MARKETS.find((market) => market.code === billingMarketCode) ||
    BILLING_MARKETS[0];
  const proMonthly = billingMarket.proMonthly;
  const teamMonthly = friendlyPrice(
    proMonthly * (35 / 15),
    billingMarket.currency,
  );
  const teamAnnualMonthly = friendlyPrice(
    proMonthly * (29 / 15),
    billingMarket.currency,
  );
  const enterpriseAnnual = friendlyPrice(
    proMonthly * 1000,
    billingMarket.currency,
  );
  const regionNames = new Intl.DisplayNames([locale], { type: "region" });
  const suggestedLanguageName = suggestedLocale
    ? LANGUAGES.find(([code]) => code === suggestedLocale)?.[1]
    : null;
  const selectedInterviewPersonaBase =
    INTERVIEW_PERSONAS.find((item) => item.id === interviewPersona) ||
    INTERVIEW_PERSONAS[1];
  const selectedInterviewPersona = {
    ...selectedInterviewPersonaBase,
    label: localizedPersonaLabel(
      locale,
      selectedInterviewPersonaBase.id,
      selectedInterviewPersonaBase.label,
    ),
  };
  const interviewProof = firstEvidence(matches);
  const interviewGap = matches.find((item) => item.status === "Gap");
  const interviewAverage = interviewScores
    ? Math.round(
        (interviewScores.relevance +
          interviewScores.evidence +
          interviewScores.outcome +
          interviewScores.structure +
          interviewScores.confidence) /
          5,
      )
    : null;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="CareerStoryMap home">
          <BrandMark />
          <span>
            CareerStoryMap <small>Evidence to opportunity</small>
          </span>
        </a>
        <nav className="topnav" aria-label="Primary navigation">
          <a href="#product">{detail.product}</a>
          <a
            href="#workspace"
            onClick={(event) => {
              event.preventDefault();
              openWorkspace("Analyze");
            }}
          >
            {detail.workspace}
          </a>
          <a href="#career-tools">Career tools</a>
          <a href="#plans">{detail.plans}</a>
          <a href="https://github.com/weiyu1029/CareerStoryMap-agent">
            {detail.source}
          </a>
        </nav>
        <a
          className="account-link"
          href={`${localizedPath(locale, "account")}?plan=community`}
        >
          {accountLabels.account}
        </a>
        <label className="locale-control">
          <span>{copy.language}</span>
          <select
            value={locale}
            onChange={(event) =>
              chooseLocale(event.target.value as LocaleCode)
            }
          >
            {LANGUAGES.map(([code, name]) => (
              <option value={code} key={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <MobileNav
          label={detail.product}
          items={[
            { label: detail.product, href: "#product" },
            {
              label: detail.workspace,
              href: `${localizedPath(locale)}?view=Analyze#workspace`,
            },
            { label: detail.explore, href: "#career-tools" },
            { label: detail.plans, href: "#plans" },
            {
              label: accountLabels.account,
              href: `${localizedPath(locale, "account")}?plan=community`,
            },
            {
              label: detail.source,
              href: "https://github.com/weiyu1029/CareerStoryMap-agent",
              external: true,
            },
          ]}
        />
      </header>

      {suggestedLocale && suggestedLanguageName && (
        <aside className="language-suggestion" aria-live="polite">
          <div>
            <b>
              {copyFor(suggestedLocale).language}: {suggestedLanguageName}?
            </b>
            <p>{copyFor(suggestedLocale).heroTitle}</p>
          </div>
          <button
            className="button primary"
            onClick={() => chooseLocale(suggestedLocale)}
          >
            {suggestedLanguageName}
          </button>
          <button
            className="button secondary"
            onClick={() => {
              setSuggestedLocale(null);
              window.localStorage.setItem(
                "aptograph-language-prompt-dismissed",
                "true",
              );
            }}
          >
            English
          </button>
        </aside>
      )}

      <a className="skip-link" href="#workspace">
        {copy.analyze}: {detail.resumeEvidence} + {detail.jobDescription}
      </a>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">CareerStoryMap · Map your evidence. Own your story.</p>
          <h1>{copy.heroTitle}</h1>
          <p className="lede">{copy.heroBody}</p>
          <div className="hero-actions">
            <a
              className="button primary hero-primary-action"
              href="#workspace"
              onClick={(event) => {
                event.preventDefault();
                openWorkspace("Analyze");
              }}
            >
              {copy.analyze}: {detail.resumeEvidence} + {detail.jobDescription}
            </a>
            <button
              className="button secondary"
              type="button"
              onClick={() => {
                setJd(SAMPLE_JD);
                setResume(SAMPLE_RESUME);
                setMatches(runMatch(SAMPLE_JD, SAMPLE_RESUME));
                openWorkspace("Analyze");
              }}
            >
              {detail.sample}
            </button>
          </div>
          <ol className="journey-strip" aria-label={detail.workspace}>
            {flowViews.map((item, index) => (
              <li key={item.id}>
                <span>{index + 1}</span>
                <b>{item.label}</b>
              </li>
            ))}
          </ol>
          <div className="trust-row">
            <span>{detail.evidenceLinked}</span>
            <span>{detail.globalDiscovery}</span>
            <span>{detail.languageCount}</span>
            <span>{detail.openCore}</span>
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-heading">
            <span>{detail.readiness}</span>
            <span className="status-pill">
              {matches.length ? detail.checked : detail.exampleSnapshot}
            </span>
          </div>
          <div className="score-row">
            <strong>{matches.length ? score : "—"}</strong>
            <span>/ 100</span>
          </div>
          <div className="score-bar">
            <i style={{ width: `${matches.length ? score : 0}%` }} />
          </div>
          <div className="metric-grid">
            <div>
              <span>{detail.requiredMatch}</span>
              <b>{matches.length ? `${requiredScore}%` : "—"}</b>
            </div>
            <div>
              <span>{detail.evidenceCoverage}</span>
              <b>
                {matches.length ? `${strongCount} / ${matches.length}` : "—"}
              </b>
            </div>
            <div>
              <span>{detail.globalMatches}</span>
              <b>{recommendedJobs.length}</b>
            </div>
          </div>
          <p className="insight">
            {locale === "en"
              ? "Every interview story stays traceable to your resume evidence and the JD. CareerStoryMap trains what you can prove, then pressures the gaps without inventing experience."
              : copy.heroBody}
          </p>
        </div>
      </section>

      <section className="workspace" id="workspace">
        <aside className="workspace-nav">
          <p className="workspace-label">{detail.workspace}</p>
          <label className="workspace-nav-mobile">
            <span>
              {flowIndex >= 0
                ? `${flowIndex + 1} / ${flowViews.length}`
                : detail.explore}
            </span>
            <select
              value={active}
              onChange={(event) =>
                openWorkspace(event.target.value as WorkspaceView)
              }
            >
              <optgroup label={detail.workspace}>
                {flowViews.map((item, index) => (
                  <option value={item.id} key={item.id}>
                    {index + 1}. {item.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label={detail.explore}>
                {supportViews.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <div className="workspace-nav-group">
            {flowViews.map((item, index) => (
              <button
                type="button"
                className={active === item.id ? "active" : ""}
                key={item.id}
                onClick={() => openWorkspace(item.id)}
                aria-current={active === item.id ? "step" : undefined}
              >
                <span>{index + 1}</span>
                <div>
                  <b>{item.label}</b>
                  <small>{item.description}</small>
                </div>
              </button>
            ))}
          </div>
          <p className="workspace-label workspace-support-label">
            {detail.explore}
          </p>
          <div className="workspace-nav-group support">
            {supportViews.map((item) => (
              <button
                type="button"
                className={active === item.id ? "active" : ""}
                key={item.id}
                onClick={() => openWorkspace(item.id)}
              >
                <span aria-hidden="true">·</span>
                <div>
                  <b>{item.label}</b>
                </div>
              </button>
            ))}
          </div>
          <div className="workspace-note">
            <span className="dot" />
            <div>
              <b>{detail.privateTitle}</b>
              <p>
                {locale === "en"
                  ? "Guest work stays on this device. Accounts are for cloud history, collaboration, and paid workflows."
                  : copy.heroBody}
              </p>
            </div>
          </div>
        </aside>
        <div className="workspace-main">
          <div className="workspace-context">
            <div className="workspace-context-index">
              {flowIndex >= 0 ? `${flowIndex + 1}/${flowViews.length}` : "·"}
            </div>
            <div>
              <span>{flowIndex >= 0 ? detail.workspace : detail.explore}</span>
              <b>{activeView.label}</b>
              <p>{activeView.description}</p>
            </div>
          </div>
          {needsEvidence && (
            <div className="workflow-prerequisite" role="note">
              <div>
                <b>{detail.resumeEvidence}</b>
                <p>{detail.compare}</p>
              </div>
              <button
                type="button"
                className="button secondary"
                onClick={() => openWorkspace("Analyze")}
              >
                {copy.analyze}
              </button>
              <button
                type="button"
                className="button primary"
                onClick={() => {
                  setJd(SAMPLE_JD);
                  setResume(SAMPLE_RESUME);
                  setMatches(runMatch(SAMPLE_JD, SAMPLE_RESUME));
                  openWorkspace("Analyze");
                }}
              >
                {detail.sample}
              </button>
            </div>
          )}
          {active === "Analyze" && (
            <>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{detail.evidenceWorkspace}</p>
                  <h2>{detail.compare}</h2>
                </div>
                <button
                  className="button secondary"
                  onClick={() => {
                    setJd(SAMPLE_JD);
                    setResume(SAMPLE_RESUME);
                    setMatches(runMatch(SAMPLE_JD, SAMPLE_RESUME));
                  }}
                >
                  {detail.sample}
                </button>
              </div>
              <ol className="workspace-progress" aria-label={detail.workspace}>
                <li className={resume.trim() ? "complete" : "current"}>
                  <span>1</span>
                  <b>{detail.resumeEvidence}</b>
                </li>
                <li className={jd.trim() ? "complete" : resume.trim() ? "current" : ""}>
                  <span>2</span>
                  <b>{detail.jobDescription}</b>
                </li>
                <li className={resume.trim() && jd.trim() ? "current" : ""}>
                  <span>3</span>
                  <b>{detail.runMatch}</b>
                </li>
              </ol>
              <div className="input-grid">
                <div className="document-field guided-card">
                  <div className="guided-card-heading">
                    <span>1</span>
                    <label htmlFor="resume-text">{detail.resumeEvidence}</label>
                    {resume.trim() && <small>{detail.checked}</small>}
                  </div>
                  <textarea
                    id="resume-text"
                    value={resume}
                    onChange={(event) => setResume(event.target.value)}
                    placeholder={detail.resumeEvidence}
                  />
                  <label className="upload-control" htmlFor="resume-file">
                    <input
                      id="resume-file"
                      type="file"
                      accept="*/*"
                      multiple
                      onChange={(event) => loadFile(event, "resume")}
                    />
                    <span>
                      {uploadingDestination === "resume"
                        ? "Reading files…"
                        : detail.importAny}
                    </span>
                    <small>PDF · DOCX · PPTX · XLSX · ODF · EPUB · text</small>
                  </label>
                </div>
                <div className="document-field guided-card">
                  <div className="guided-card-heading">
                    <span>2</span>
                    <label htmlFor="jd-text">{detail.jobDescription}</label>
                    {jd.trim() && <small>{detail.checked}</small>}
                  </div>
                  <textarea
                    id="jd-text"
                    value={jd}
                    onChange={(event) => setJd(event.target.value)}
                    placeholder={detail.jobDescription}
                  />
                  <label className="upload-control" htmlFor="jd-file">
                    <input
                      id="jd-file"
                      type="file"
                      accept="*/*"
                      multiple
                      onChange={(event) => loadFile(event, "jd")}
                    />
                    <span>
                      {uploadingDestination === "jd"
                        ? "Reading files…"
                        : detail.importAny}
                    </span>
                    <small>PDF · DOCX · PPTX · XLSX · ODF · EPUB · text</small>
                  </label>
                </div>
              </div>
              {uploadMessage && (
                <p className="notice" role="status">
                  {uploadMessage}
                </p>
              )}
              <div className="analysis-primary-action">
                <div>
                  <span>3</span>
                  <b>{detail.runMatch}</b>
                  <small>{detail.matrix}</small>
                </div>
                <button
                  className="button primary"
                  onClick={async () => {
                    await runModelAnalysis();
                    window.requestAnimationFrame(() => {
                      document.getElementById("analysis-results")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    });
                  }}
                  disabled={modelRunning || !jd.trim() || !resume.trim()}
                >
                  {modelRunning ? "Running…" : detail.runMatch}
                </button>
              </div>
              <details className="advanced-settings">
                <summary>{detail.aiModel}</summary>
                <div className="action-row">
                <div>
                  <label htmlFor="model">{detail.aiModel}</label>
                  <select
                    id="model"
                    value={provider}
                    onChange={(event) => selectProvider(event.target.value)}
                  >
                    {PROVIDERS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <small className="model-note">
                    The evidence matrix always runs locally. Optional models add
                    story coaching through an endpoint you control.
                  </small>
                </div>
                </div>
                {selectedProvider.kind !== "built-in" && (
                  <section className="model-connection" aria-label="Local model connection">
                    <div className="model-connection-fields">
                      <label>
                        <span>Local endpoint</span>
                        <input
                          value={modelEndpoint}
                          onChange={(event) => setModelEndpoint(event.target.value)}
                          placeholder={selectedProvider.endpoint}
                          inputMode="url"
                        />
                      </label>
                      <label>
                        <span>Loaded model name</span>
                        <input
                          value={modelName}
                          onChange={(event) => setModelName(event.target.value)}
                          placeholder={selectedProvider.model}
                        />
                      </label>
                      <button
                        className="button secondary"
                        type="button"
                        onClick={testModelConnection}
                        disabled={modelRunning}
                      >
                        Test connection
                      </button>
                    </div>
                    <p>
                      Direct local connection; no API key is requested or stored.
                      Ollama may require <code>OLLAMA_ORIGINS</code>. Other servers
                      must allow this site through CORS.
                    </p>
                  </section>
                )}
                <div className="model-result" role="status">
                  <div>
                    <span>{selectedProvider.label}</span>
                    <b>{modelStatus}</b>
                  </div>
                  {modelInsight && <p>{modelInsight}</p>}
                </div>
              </details>
              <div className="results-card" id="analysis-results">
                <div className="results-title">
                  <h3>{detail.matrix}</h3>
                  <span>
                    {matches.length} {detail.signalsReviewed}
                  </span>
                </div>
                <div className="keyword-table">
                  {matches.length ? (
                    matches.map((item) => (
                      <div className="keyword-row detailed" key={item.keyword}>
                        <div>
                          <b>{item.keyword}</b>
                          <small>{item.evidence}</small>
                        </div>
                        <span>{item.priority}</span>
                        <span
                          className={item.status === "Gap" ? "gap" : "evidence"}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">{detail.matrix}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {active === "Interview Studio" && (
            <>
              <div className="section-heading interview-heading">
                <div>
                  <p className="eyebrow">{interview.eyebrow}</p>
                  <h2>{interview.title}</h2>
                  <p>{interview.subtitle}</p>
                </div>
                <span className="status-pill light">CareerStoryMap ProofLoop</span>
              </div>

              <div className="interview-setup">
                <label>
                  <span>{interview.role}</span>
                  <select
                    value={interviewPersona}
                    onChange={(event) => {
                      setInterviewPersona(
                        event.target.value as InterviewPersonaId,
                      );
                      setInterviewMessages([]);
                      setInterviewScores(null);
                    }}
                  >
                  {INTERVIEW_PERSONAS.map((persona) => (
                    <option value={persona.id} key={persona.id}>
                      {localizedPersonaLabel(locale, persona.id, persona.label)}
                    </option>
                  ))}
                  </select>
                </label>
                <fieldset>
                  <legend>{interview.style}</legend>
                  <div className="interview-mode" role="radiogroup">
                    {(["Coaching", "Realistic"] as InterviewMode[]).map(
                      (mode) => (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={interviewMode === mode}
                          className={interviewMode === mode ? "active" : ""}
                          key={mode}
                          onClick={() => setInterviewMode(mode)}
                        >
                          {mode === "Coaching"
                            ? interview.coaching
                            : interview.realistic}
                        </button>
                      ),
                    )}
                  </div>
                </fieldset>
                <button
                  type="button"
                  className="button primary"
                  onClick={startInterview}
                >
                  {interviewMessages.length ? interview.restart : interview.start}
                </button>
              </div>

              <div className="interview-brief" aria-label={interview.storySpine}>
                <article>
                  <span>{interview.focus}</span>
                  <b>{selectedInterviewPersona.focus}</b>
                  <small>{selectedInterviewPersona.pressure}</small>
                </article>
                <article>
                  <span>{interview.proof}</span>
                  <b>{interviewProof?.keyword || "Run evidence match first"}</b>
                  <small>
                    {interviewProof?.evidence ||
                      "A specific action and measurable outcome will anchor your answer."}
                  </small>
                </article>
                <article>
                  <span>{interview.gap}</span>
                  <b>{interviewGap?.keyword || "Depth and trade-offs"}</b>
                  <small>
                    {interviewGap
                      ? "Address honestly; bridge with adjacent proof instead of inventing experience."
                      : "Expect the interviewer to test ownership, decisions, and limits."}
                  </small>
                </article>
              </div>

              <div className="interview-stage">
                <section className="interview-room" aria-label="Mock interview transcript">
                  <div className="interview-room-bar">
                    <div>
                      <span className="interviewer-avatar" aria-hidden="true">
                        {selectedInterviewPersona.label
                          .split(/\s+/)
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <div>
                        <b>{selectedInterviewPersona.label}</b>
                        <small>
                          {interviewMode === "Coaching"
                            ? interview.coaching
                            : interview.realistic}
                        </small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="voice-button"
                      onClick={speakLatestInterviewQuestion}
                      disabled={!interviewMessages.length}
                      aria-pressed={isSpeaking}
                    >
                      {isSpeaking ? interview.mute : interview.speak}
                    </button>
                  </div>
                  <div className="interview-transcript" aria-live="polite">
                    {interviewMessages.length ? (
                      interviewMessages.map((message, index) => (
                        <div
                          className={`interview-message ${message.role}`}
                          key={`${message.role}-${index}`}
                        >
                          <b>
                            {message.role === "assistant"
                              ? selectedInterviewPersona.label
                              : "You"}
                          </b>
                          <p>{message.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="interview-empty">
                        <b>{interview.storySpine}</b>
                        <p>{interview.subtitle}</p>
                        <button
                          type="button"
                          className="button primary"
                          onClick={startInterview}
                        >
                          {interview.start}
                        </button>
                      </div>
                    )}
                  </div>
                  <form
                    className="interview-answer-form"
                    onSubmit={submitInterviewAnswer}
                  >
                    <label htmlFor="interview-answer">{interview.answer}</label>
                    <textarea
                      id="interview-answer"
                      value={interviewAnswer}
                      onChange={(event) => setInterviewAnswer(event.target.value)}
                      placeholder={interview.placeholder}
                      disabled={!interviewMessages.length}
                    />
                    {(isListening || voiceInterim) && (
                      <div className="voice-live-transcript" role="status">
                        <span>
                          {interview.liveTranscript} · {interview.listening}
                        </span>
                        <p>{voiceInterim || "…"}</p>
                        {recognitionConfidence !== null && (
                          <b>
                            {interview.recognitionConfidence} {recognitionConfidence}%
                          </b>
                        )}
                      </div>
                    )}
                    <div className="interview-answer-actions">
                      <button
                        type="button"
                        className={`button secondary ${isListening ? "listening" : ""}`}
                        onClick={toggleInterviewListening}
                        disabled={!interviewMessages.length}
                        aria-pressed={isListening}
                      >
                        {isListening
                          ? interview.stopListening
                          : interview.listen}
                      </button>
                      <button
                        className="button primary"
                        disabled={!interviewMessages.length || !interviewAnswer.trim()}
                      >
                        {interview.send}
                      </button>
                    </div>
                    <small className="voice-disclosure">
                      {voiceMessage ||
                        `${interview.privacy} ${interview.speechLanguage}: ${speechLocaleFor(locale)}.`}
                    </small>
                  </form>
                </section>

                <aside className="answer-scorecard">
                  <div className="scorecard-heading">
                    <div>
                      <span>{interview.scoreTitle}</span>
                      <b>{interviewAverage === null ? "—" : interviewAverage}</b>
                    </div>
                    <small>{interviewAverage === null ? "Ready" : "/ 100"}</small>
                  </div>
                  {(
                    [
                      ["relevance", interview.relevance],
                      ["evidence", interview.evidence],
                      ["outcome", interview.outcome],
                      ["structure", interview.structure],
                      ["confidence", interview.confidence],
                    ] as const
                  ).map(([key, label]) => {
                    const value = interviewScores?.[key] || 0;
                    return (
                      <div className="answer-signal" key={key}>
                        <div>
                          <span>{label}</span>
                          <b>{interviewScores ? value : "—"}</b>
                        </div>
                        <i>
                          <span style={{ width: `${value}%` }} />
                        </i>
                      </div>
                    );
                  })}
                  <div className="scorecard-note">
                    <b>Evidence before polish</b>
                    <p>
                      CareerStoryMap rewards a specific decision, verifiable action,
                      measurable outcome, and explicit link to this JD. Fluency
                      alone cannot create a high score.
                    </p>
                  </div>
                </aside>
              </div>
            </>
          )}

          {active === "Recommendations" && (
            <>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{copy.recommendations}</p>
                  <h2>{detail.recommendationsTitle}</h2>
                </div>
                <span className="status-pill light">
                  {sourceMeta ? "Live employer feed" : detail.exampleSnapshot}
                </span>
              </div>
              <section
                className="application-assistance"
                aria-labelledby="application-assistance-title"
              >
                <div className="application-assistance-heading">
                  <div>
                    <p className="eyebrow">{copy.recommendations}</p>
                    <h3 id="application-assistance-title">{copy.mode}</h3>
                    <p>{modeContext}</p>
                  </div>
                  <span className="status-pill light">
                    {applicationMode === "Manual"
                      ? copy.manual
                      : applicationMode === "Hybrid"
                        ? copy.hybrid
                        : copy.automatic}
                  </span>
                </div>
                <div className="mode-switch" role="radiogroup" aria-label={copy.mode}>
                  {(["Manual", "Hybrid", "Automatic"] as ApplicationMode[]).map(
                    (mode) => (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={applicationMode === mode}
                        className={applicationMode === mode ? "active" : ""}
                        key={mode}
                        onClick={() => setApplicationMode(mode)}
                      >
                        <span>
                          {mode === "Manual"
                            ? copy.manual
                            : mode === "Hybrid"
                              ? copy.hybrid
                              : copy.automatic}
                        </span>
                        <small>{mode === "Manual" ? "Free" : "Pro"}</small>
                      </button>
                    ),
                  )}
                </div>
                <p className="application-assistance-note">{modeMessage}</p>
              </section>
              <p className="data-disclosure">
                {sourceMeta
                  ? `${sourceMeta.coverage}. Retrieved ${new Date(sourceMeta.retrievedAt).toLocaleString(locale)}.`
                  : locale === "en"
                    ? "Example openings are labeled. Connect an employer's official public ATS board below for current published roles."
                    : detail.sourcePolicy}
              </p>
              <section className="source-connector" aria-labelledby="approved-source-title">
                <div className="source-connector-heading">
                  <div>
                    <p className="eyebrow">Approved data source</p>
                    <h3 id="approved-source-title">Connect an employer job board</h3>
                    <p>
                      Read-only access to published jobs through documented Greenhouse,
                      Lever, and Ashby APIs. No page scraping and no automatic application.
                    </p>
                  </div>
                  {sourceMeta && (
                    <button className="text-link" type="button" onClick={useExampleJobs}>
                      Disconnect
                    </button>
                  )}
                </div>
                <form className="source-connector-form" onSubmit={connectApprovedSource}>
                  <label>
                    <span>Provider</span>
                    <select
                      value={approvedSource}
                      onChange={(event) =>
                        setApprovedSource(event.target.value as ApprovedSourceId)
                      }
                    >
                      <option value="greenhouse">Greenhouse</option>
                      <option value="lever">Lever</option>
                      <option value="lever-eu">Lever EU</option>
                      <option value="ashby">Ashby</option>
                    </select>
                  </label>
                  <label className="source-reference">
                    <span>Employer careers URL or board identifier</span>
                    <input
                      value={sourceReference}
                      onChange={(event) => setSourceReference(event.target.value)}
                      placeholder="https://boards.greenhouse.io/company"
                      inputMode="url"
                      required
                    />
                  </label>
                  <button className="button primary" disabled={sourceLoading}>
                    {sourceLoading ? "Connecting…" : "Load published jobs"}
                  </button>
                </form>
                {sourceError && (
                  <p className="source-message error" role="alert">
                    {sourceError}
                  </p>
                )}
                {sourceMeta && (
                  <div className="source-message connected" role="status">
                    <div>
                      <b>{sourceMeta.employer}</b>
                      <span>
                        {sourceJobs?.length || 0} published roles · {sourceMeta.name}
                      </span>
                    </div>
                    <a href={sourceMeta.docsUrl} target="_blank" rel="noreferrer">
                      Official API policy
                    </a>
                  </div>
                )}
              </section>
              <div className="filter-grid recommendation-filters">
                <label className="wide">
                  <span>{detail.roleOrSkill}</span>
                  <input
                    value={roleQuery}
                    onChange={(event) => setRoleQuery(event.target.value)}
                    placeholder="Product analyst, SQL, healthcare"
                  />
                </label>
                <label>
                  <span>{detail.region}</span>
                  <select
                    value={region}
                    onChange={(event) => updateRegion(event.target.value)}
                  >
                    {REGIONS.map((item) => (
                      <option key={item} value={item}>
                        {item === "Worldwide" ? copy.worldwide : item}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{detail.country}</span>
                  <select
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                  >
                    {COUNTRIES[region].map((item) => (
                      <option key={item} value={item}>
                        {item === "All countries" ? detail.country : item}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{detail.radius}</span>
                  <select
                    value={radius}
                    onChange={(event) => setRadius(event.target.value)}
                  >
                    <option value="Worldwide">{copy.worldwide}</option>
                    <option>25 km</option>
                    <option>50 km</option>
                    <option>100 km</option>
                    <option>250 km</option>
                  </select>
                </label>
                <label>
                  <span>{detail.workStyle}</span>
                  <select
                    value={workStyle}
                    onChange={(event) => setWorkStyle(event.target.value)}
                  >
                    <option value="All work styles">{detail.workStyle}</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>On-site</option>
                  </select>
                </label>
                <label>
                  <span>{detail.industry}</span>
                  <select
                    value={industry}
                    onChange={(event) => setIndustry(event.target.value)}
                  >
                    {INDUSTRIES.map((item) => (
                      <option key={item} value={item}>
                        {item === "All industries" ? detail.industry : item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <section className="story-radar" aria-labelledby="story-radar-title">
                <div className="story-radar-heading">
                  <div>
                    <p className="eyebrow">CareerStoryMap Story Signal</p>
                    <h3 id="story-radar-title">Proof-to-Role Radar</h3>
                    <p>
                      Alerts only when your evidence can carry a credible story—not
                      when a title or keyword merely matches.
                    </p>
                  </div>
                  <span className="radar-distinction">Evidence-qualified</span>
                </div>
                <div className="radar-method">
                  <div>
                    <span>Evidence coverage</span>
                    <b>50%</b>
                  </div>
                  <div>
                    <span>Must-have coverage</span>
                    <b>30%</b>
                  </div>
                  <div>
                    <span>Outcome strength</span>
                    <b>20%</b>
                  </div>
                  <p>
                    A notification also requires at least two proof-backed signals
                    and zero unsupported must-haves.
                  </p>
                </div>
                <div className="radar-controls">
                  <label className="radar-threshold">
                    <span>Minimum story fit</span>
                    <input
                      type="range"
                      min="65"
                      max="90"
                      step="1"
                      value={radarThreshold}
                      onChange={(event) =>
                        setRadarThreshold(Number(event.target.value))
                      }
                    />
                    <b>{radarThreshold}%</b>
                  </label>
                  <label className="radar-toggle">
                    <input
                      type="checkbox"
                      checked={autoTrackRadar}
                      onChange={(event) => setAutoTrackRadar(event.target.checked)}
                    />
                    <span>Auto-track proof-qualified roles</span>
                  </label>
                  <label className="radar-toggle">
                    <input
                      type="checkbox"
                      checked={browserAlerts}
                      onChange={(event) => setBrowserAlerts(event.target.checked)}
                    />
                    <span>Browser notification</span>
                  </label>
                  <button
                    className="button primary"
                    type="button"
                    onClick={scanStoryRadar}
                  >
                    Scan proof-qualified roles
                  </button>
                </div>
                <div className="radar-status" role="status">
                  <div>
                    <span>Qualified now</span>
                    <b>{proofQualifiedJobs.length}</b>
                  </div>
                  <div>
                    <span>Highest story fit</span>
                    <b>{recommendedJobs[0]?.storyFit || 0}%</b>
                  </div>
                  <div>
                    <span>Notification access</span>
                    <b>
                      {notificationPermission === "granted"
                        ? "Enabled"
                        : notificationPermission === "denied"
                          ? "Blocked"
                          : notificationPermission === "unsupported"
                            ? "In-app only"
                            : "On request"}
                    </b>
                  </div>
                  <p>
                    {radarMessage ||
                      "Manual scanning is open to everyone. Scheduled cross-device monitoring can become a Pro service when accounts launch."}
                  </p>
                </div>
                {radarAlerts.length > 0 && (
                  <div className="radar-alerts">
                    <div className="radar-alerts-title">
                      <b>Story Signal alerts</b>
                      <span>{radarAlerts.length} retained on this device</span>
                    </div>
                    {radarAlerts.slice(0, 3).map((alert) => (
                      <article key={alert.id}>
                        <strong>{alert.storyFit}%</strong>
                        <div>
                          <b>{alert.role}</b>
                          <span>{alert.company} · {alert.reason}</span>
                          <p>{alert.story}</p>
                        </div>
                        <button
                          className="button secondary"
                          type="button"
                          disabled={alert.tracked}
                          onClick={() => trackRadarAlert(alert)}
                        >
                          {alert.tracked ? "Tracked" : "Track role"}
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>
              <div className="recommendation-summary">
                <div>
                  <span>{detail.evidenceProfile}</span>
                  <b>
                    {strongCount} {detail.signalsReviewed}
                  </b>
                </div>
                <div>
                  <span>{detail.searchScope}</span>
                  <b>
                    {country === "All countries" ? region : country} · {radius}
                  </b>
                </div>
                <div>
                  <span>{detail.results}</span>
                  <b>
                    {recommendedJobs.length} {copy.recommendations}
                  </b>
                </div>
              </div>
              <div className="job-list">
                {recommendedJobs.length ? (
                  recommendedJobs.map((job) => (
                    <article className="job-card" key={job.id}>
                      <div className="job-score">
                        <strong>{job.storyFit}</strong>
                        <span>Story fit</span>
                        <small>{job.match}% evidence</small>
                      </div>
                      <div className="job-body">
                        <div className="job-heading">
                          <div>
                            <p>{job.company}</p>
                            <h3>{job.title}</h3>
                            <span>
                              {job.city}, {job.country} · {job.workStyle} ·{" "}
                              {job.industry}
                            </span>
                            {job.source && (
                              <small className="job-provenance">
                                {job.isLive ? "Live" : "Example"} · {job.source}
                                {job.publishedAt
                                  ? ` · ${new Date(job.publishedAt).toLocaleDateString(locale)}`
                                  : ""}
                              </small>
                            )}
                          </div>
                          <div className="job-badges">
                            {job.alertEligible && (
                              <span className="proof-qualified">
                                Proof-qualified
                              </span>
                            )}
                            {job.isLive ? (
                              <span className="trend live">Published</span>
                            ) : (
                              <span
                                className={
                                  (job.trend || 0) >= 0
                                    ? "trend up"
                                    : "trend down"
                                }
                              >
                                {(job.trend || 0) >= 0 ? "+" : ""}
                                {job.trend || 0}% {copy.market}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="story-callout">
                          <span>{detail.bestStory}</span>
                          <p>
                            {locale === "en"
                              ? job.story
                              : `${detail.bestStory}: ${job.strengths.join(", ")}`}
                          </p>
                          <small>{job.whyNow}</small>
                        </div>
                        <div className="story-fit-breakdown">
                          <div>
                            <span>Evidence</span>
                            <b>{job.match}%</b>
                          </div>
                          <div>
                            <span>Must-haves</span>
                            <b>{job.requiredCoverage}%</b>
                          </div>
                          <div>
                            <span>Outcomes</span>
                            <b>{job.outcomeStrength}%</b>
                          </div>
                          <p>{job.alertReason}</p>
                        </div>
                        <div className="job-signals">
                          <div>
                            <span>{detail.matchedEvidence}</span>
                            {job.strengths.map((item) => (
                              <b key={item}>{item}</b>
                            ))}
                          </div>
                          <div className="gap-signals">
                            <span>{detail.verifyClose}</span>
                            {job.gaps.map((item) => (
                              <b key={item}>{item}</b>
                            ))}
                          </div>
                        </div>
                        <div className="job-actions">
                          {job.sourceUrl && (
                            <a
                              className="text-link source-link"
                              href={job.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View official posting
                            </a>
                          )}
                          <button
                            className="button secondary"
                            disabled={tracker.some((item) => item.id === job.id)}
                            onClick={() => saveJob(job)}
                          >
                            {tracker.some((item) => item.id === job.id)
                              ? locale === "en"
                                ? "Tracked"
                                : copy.tracker
                              : detail.saveRole}
                          </button>
                          <button
                            className="button primary"
                            onClick={() => {
                              setJd(job.description);
                              setMatches(runMatch(job.description, resume));
                              openWorkspace("Analyze");
                            }}
                          >
                            {detail.analyzeRole}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="empty-state framed">{copy.heroBody}</p>
                )}
              </div>
            </>
          )}

          {active === "Market Insights" && (
            <>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{copy.market}</p>
                  <h2>{detail.marketTitle}</h2>
                </div>
                <span className="status-pill light">
                  {sourceMeta ? "Live employer snapshot" : detail.providerPreview}
                </span>
              </div>
              <p className="data-disclosure">
                <b>{sourceMeta ? sourceMeta.name : detail.exampleSnapshot}.</b>{" "}
                {sourceMeta
                  ? `This view covers ${sourceMeta.employer}'s published board only. It is not a total labor-market estimate; historical change needs comparable saved snapshots.`
                  : locale === "en"
                    ? "These values demonstrate the interaction and are not live labor-market totals. Production replaces them with source, coverage, methodology, retrieval time, and comparable snapshots."
                    : detail.sourcePolicy}
              </p>
              <div className="source-grid">
                {JOB_SOURCE_STATUS.map((source) => (
                  <article key={source.name}>
                    <div>
                      <b>{source.name}</b>
                      <span>
                        {locale === "en" ? source.detail : detail.sourcePolicy}
                      </span>
                    </div>
                    <small>
                      {locale === "en" ? source.access : detail.providerPreview}
                    </small>
                  </article>
                ))}
              </div>
              <div className="filter-grid market-filters">
                <label>
                  <span>{detail.region}</span>
                  <select
                    value={region}
                    onChange={(event) => updateRegion(event.target.value)}
                  >
                    {REGIONS.map((item) => (
                      <option key={item} value={item}>
                        {item === "Worldwide" ? copy.worldwide : item}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{detail.country}</span>
                  <select
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                  >
                    {COUNTRIES[region].map((item) => (
                      <option key={item} value={item}>
                        {item === "All countries" ? detail.country : item}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{detail.industry}</span>
                  <select
                    value={industry}
                    onChange={(event) => setIndustry(event.target.value)}
                  >
                    {INDUSTRIES.map((item) => (
                      <option key={item} value={item}>
                        {item === "All industries" ? detail.industry : item}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{detail.roleFamily}</span>
                  <select
                    value={roleFamily}
                    onChange={(event) => setRoleFamily(event.target.value)}
                  >
                    <option value="All role families">
                      {detail.roleFamily}
                    </option>
                    {[...new Set(MARKET_BASE.map((item) => item.role))].map(
                      (item) => (
                        <option key={item}>{item}</option>
                      ),
                    )}
                  </select>
                </label>
                <label>
                  <span>{detail.timeRange}</span>
                  <select
                    value={timeRange}
                    onChange={(event) => setTimeRange(event.target.value)}
                  >
                    <option value="Last 30 days">{detail.timeRange}</option>
                    <option>Last 3 months</option>
                    <option>Last 6 months</option>
                    <option>Last 12 months</option>
                  </select>
                </label>
              </div>
              <div className="market-kpis">
                <article>
                  <span>
                    {sourceMeta ? "Published openings" : detail.exampleOpenings}
                  </span>
                  <b>{compactNumber(totalOpenings, locale)}</b>
                  <small>
                    {sourceMeta?.employer ||
                      (country === "All countries" ? copy.worldwide : country)}
                  </small>
                </article>
                <article>
                  <span>{detail.momentum}</span>
                  {weightedChange === null ? (
                    <b>—</b>
                  ) : (
                    <b className={weightedChange >= 0 ? "positive" : "negative"}>
                      {weightedChange >= 0 ? "+" : ""}
                      {weightedChange.toFixed(1)}%
                    </b>
                  )}
                  <small>
                    {weightedChange === null ? "Needs a prior snapshot" : detail.timeRange}
                  </small>
                </article>
                <article>
                  <span>{detail.remoteShare}</span>
                  <b>{remoteShare.toFixed(0)}%</b>
                  <small>{detail.results}</small>
                </article>
                <article>
                  <span>{detail.coverage}</span>
                  <b>{marketRows.length}</b>
                  <small>{detail.coverage}</small>
                </article>
              </div>
              <div className="market-layout">
                <section className="chart-card">
                  <div className="chart-heading">
                    <div>
                      <h3>{detail.openingsByIndustry}</h3>
                      <p>
                        {sourceMeta
                          ? `${sourceMeta.coverage} · retrieved ${new Date(sourceMeta.retrievedAt).toLocaleString(locale)}`
                          : detail.sourcePolicy}
                      </p>
                    </div>
                    <span>{detail.timeRange}</span>
                  </div>
                  <div className="bar-chart">
                    {marketRows.map((item) => (
                      <div
                        className="bar-row"
                        key={`${item.industry}-${item.role}`}
                      >
                        <div>
                          <b>{item.industry}</b>
                          <span>{item.role}</span>
                        </div>
                        <div className="bar-track">
                          <i
                            style={{
                              width: `${Math.max(8, (item.openings / maxOpenings) * 100)}%`,
                            }}
                          />
                        </div>
                        <strong>
                          {totalOpenings
                            ? ((item.openings / totalOpenings) * 100).toFixed(1)
                            : "0.0"}
                          %
                        </strong>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="ratio-card">
                  <div
                    className="donut"
                    style={{
                      background: `conic-gradient(var(--accent) 0 ${remoteShare}%, var(--accent-soft) ${remoteShare}% 100%)`,
                    }}
                  >
                    <div>
                      <b>{remoteShare.toFixed(0)}%</b>
                      <span>{detail.remoteShare}</span>
                    </div>
                  </div>
                  <h3>{detail.demandDirection}</h3>
                  <div className="ratio-list">
                    {marketRows
                      .slice()
                      .sort((a, b) => b.change - a.change)
                      .map((item) => (
                        <article key={item.industry}>
                          <span>{item.industry}</span>
                          <b
                            className={
                              item.change >= 0 ? "positive" : "negative"
                            }
                          >
                            {item.change >= 0 ? "+" : ""}
                            {item.change}%
                          </b>
                        </article>
                      ))}
                  </div>
                  <small>{detail.liveNote}</small>
                </section>
              </div>
            </>
          )}

          {active === "Tracker" && (
            <>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{copy.tracker}</p>
                  <h2>{detail.trackerTitle}</h2>
                </div>
                <span className="status-pill light">{detail.privateTitle}</span>
              </div>
              <form className="tracker-form" onSubmit={addTrackerItem}>
                <label>
                  <span>{locale === "en" ? "Company" : detail.product}</span>
                  <input
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder={locale === "en" ? "Company" : detail.product}
                    required
                  />
                </label>
                <label>
                  <span>{locale === "en" ? "Role" : detail.recommendationsTitle}</span>
                  <input
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    placeholder={locale === "en" ? "Role" : detail.recommendationsTitle}
                    required
                  />
                </label>
                <button
                  className="button primary"
                  disabled={!company.trim() || !role.trim()}
                >
                  {locale === "en" ? "Add to tracker" : copy.tracker}
                </button>
              </form>
              <div className="tracker-list">
                {tracker.length ? (
                  tracker.map((item) => (
                    <article key={item.id}>
                      <div className="tracker-role">
                        <b>{item.role}</b>
                        <p>
                          {item.company}
                          {item.source ? ` · ${item.source}` : ""}
                          {item.storyFit ? ` · ${item.storyFit}% story fit` : ""}
                        </p>
                        {item.story && (
                          <small className="tracker-story">{item.story}</small>
                        )}
                      </div>
                      <div className="tracker-actions">
                        {item.sourceUrl && (
                          <a
                            className="text-link"
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Official posting
                          </a>
                        )}
                        <select
                          value={item.status}
                          aria-label={`Status for ${item.role}`}
                          onChange={(event) =>
                            persistTracker(
                              tracker.map((row) =>
                                row.id === item.id
                                  ? { ...row, status: event.target.value }
                                  : row,
                              ),
                            )
                          }
                        >
                          <option>Interested</option>
                          <option>Preparing</option>
                          <option>Applied</option>
                          <option>Interviewing</option>
                          <option>Offer</option>
                          <option>Closed</option>
                        </select>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="empty-state">{copy.heroBody}</p>
                )}
              </div>
            </>
          )}

          {active === "Copilot" && (
            <>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{copy.copilot}</p>
                  <h2>{detail.assistantTitle}</h2>
                </div>
                <span className="status-pill light">
                  {selectedProvider.kind === "built-in"
                    ? "Evidence engine"
                    : `${provider} · ${modelName || "not configured"}`} ·{" "}
                  {LANGUAGES.find(([code]) => code === locale)?.[1]}
                </span>
              </div>
              <div className="chat-context">
                <span>{detail.evidenceWorkspace}</span>
                <b>
                  {strongCount} {detail.signalsReviewed} ·{" "}
                  {matches.filter((item) => item.status === "Gap").length}{" "}
                  {copy.feedback} · {recommendedJobs.length}{" "}
                  {copy.recommendations}
                </b>
              </div>
              <div className="chat-panel">
                {(messages.length
                  ? messages
                  : [{ role: "assistant" as const, content: copy.heroBody }]
                ).map((message, index) => (
                  <div
                    className={`chat-message ${message.role}`}
                    key={`${message.role}-${index}`}
                  >
                    <b>
                      {message.role === "assistant"
                        ? "CareerStoryMap"
                        : detail.privateTitle}
                    </b>
                    <p>{message.content}</p>
                  </div>
                ))}
              </div>
              <form className="chat-form" onSubmit={askCopilot}>
                <label htmlFor="question">{detail.assistantTitle}</label>
                <div>
                  <input
                    id="question"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder={detail.compare}
                  />
                  <button
                    className="button primary"
                    disabled={copilotRunning || !question.trim()}
                  >
                    {copilotRunning ? "Working…" : detail.send}
                  </button>
                </div>
                <small className="model-note">
                  {selectedProvider.kind === "built-in"
                    ? "Evidence-grounded local guidance."
                    : `${modelStatus} If the local model is unavailable, CareerStoryMap returns an evidence-engine fallback and labels the failure.`}
                </small>
              </form>
            </>
          )}

          {active === "Feedback" && (
            <>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{copy.feedback}</p>
                  <h2>{detail.feedbackTitle}</h2>
                </div>
              </div>
              <form className="feedback-form" onSubmit={sendFeedback}>
                <div className="feedback-access full">
                  <div>
                    <b>
                      {locale === "en"
                        ? "Feedback is open to every plan"
                        : copy.feedback}
                    </b>
                    <p>
                      {locale === "en"
                        ? "Community and Pro use the open queue. Team is prioritized. Enterprise receives the highest priority and a one-business-day acknowledgement target."
                        : copy.heroBody}
                    </p>
                  </div>
                  <ol>
                    <li>
                      <span>Community · Pro</span>
                      <strong>Open queue</strong>
                    </li>
                    <li className="priority">
                      <span>Team</span>
                      <strong>Priority</strong>
                    </li>
                    <li className="highest">
                      <span>Enterprise</span>
                      <strong>Highest priority</strong>
                    </li>
                  </ol>
                </div>
                <label>
                  <span>{detail.plans}</span>
                  <select name="plan">
                    <option value="community">Community</option>
                    <option value="pro">Pro</option>
                    <option value="team">Team · Priority</option>
                    <option value="enterprise">
                      Enterprise · Highest priority
                    </option>
                  </select>
                </label>
                <label>
                  <span>{detail.product}</span>
                  <select name="category">
                    <option value="accuracy">{copy.recommendations}</option>
                    <option value="market">{copy.market}</option>
                    <option value="usability">{detail.workspace}</option>
                    <option value="language">{copy.language}</option>
                    <option value="feature">{detail.product}</option>
                  </select>
                </label>
                <label>
                  <span>{detail.checked}</span>
                  <select name="rating">
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                </label>
                <label className="feedback-honeypot" aria-hidden="true">
                  <span>Website</span>
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
                <label className="full">
                  <span>{detail.feedbackTitle}</span>
                  <textarea
                    name="message"
                    required
                    placeholder={detail.feedbackTitle}
                  />
                </label>
                <div className="full feedback-actions">
                  <p role="status">
                    {feedbackError ||
                      (feedbackSent
                        ? locale === "en"
                          ? "Thank you. Your feedback is now in the product queue."
                          : copy.feedback
                        : locale === "en"
                          ? "No account is required to submit feedback."
                          : detail.privateTitle)}
                  </p>
                  <button
                    className="button primary"
                    disabled={feedbackSubmitting}
                  >
                    {feedbackSubmitting
                      ? locale === "en"
                        ? "Sending…"
                        : copy.feedback
                      : detail.submitFeedback}
                  </button>
                </div>
              </form>
            </>
          )}
          <footer className="workspace-next-step">
            <div>
              <span>
                {flowIndex >= 0
                  ? `${flowIndex + 1} / ${flowViews.length}`
                  : detail.explore}
              </span>
              <b>{nextView.description}</b>
            </div>
            <nav aria-label={detail.workspace}>
              {previousView && (
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => openWorkspace(previousView.id)}
                >
                  ← {previousView.label}
                </button>
              )}
              <button
                type="button"
                className="button primary"
                onClick={() => openWorkspace(nextView.id)}
              >
                {nextView.label} →
              </button>
            </nav>
          </footer>
        </div>
      </section>

      <section className="principles" id="product">
        <div>
          <p className="eyebrow">{detail.product}</p>
          <h2>
            {locale === "en"
              ? "A global career platform without a credibility shortcut"
              : copy.heroTitle}
          </h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>01</span>
            <h3>{detail.recommendationsTitle}</h3>
            <p>
              {locale === "en"
                ? "Rank roles by the requirements your real stories can support, then surface gaps before generating polished language."
                : copy.heroBody}
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>{detail.marketTitle}</h3>
            <p>
              {locale === "en"
                ? "Filter openings and momentum by region, country, role family, industry, and time period with visible data provenance."
                : copy.heroBody}
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>{copy.mode}</h3>
            <p>
              {locale === "en"
                ? "Manual stays open. Paid assistance adds human approval. Automatic workflows require approved APIs, limits, consent, and an audit trail."
                : modeMessage}
            </p>
          </article>
        </div>
      </section>
      <section className="seo-hub" id="career-tools">
        <div className="seo-hub-heading">
          <p className="eyebrow">CareerStoryMap guides</p>
          <h2>Start with the career decision in front of you.</h2>
          <p>
            Six focused tools connect resume evidence, job requirements,
            interview confidence, role discovery, and market direction.
          </p>
        </div>
        <div className="seo-hub-grid">
          {SEO_PAGE_KEYS.map((pageKey, index) => {
            const page = localizedSeoPage(pageKey, locale);
            return (
            <a href={localizedPath(locale, page.path)} key={page.path}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{page.navLabel}</h3>
              <p>{page.description}</p>
              <small>{locale === "en" ? "Explore guide" : copy.enter}</small>
            </a>
            );
          })}
        </div>
      </section>
      <section className="plans" id="plans">
        <div className="plans-heading">
          <p className="eyebrow">{detail.source}</p>
          <h2>
            {locale === "en"
              ? "Open where trust matters. Paid where ongoing operations create value."
              : copy.heroTitle}
          </h2>
        </div>
        <div className="pricing-controls">
          <label>
            <span>{copy.worldwide}</span>
            <select
              value={billingMarket.code}
              onChange={(event) => chooseBillingMarket(event.target.value)}
            >
              {BILLING_MARKETS.map((market) => (
                <option value={market.code} key={market.code}>
                  {regionNames.of(market.code) || market.code} · {market.currency}
                </option>
              ))}
            </select>
          </label>
          <p>
            {locale === "zh-TW"
              ? `目前僅為區域價格預估（${billingMarket.currency}）；公開預覽版尚未啟用付款與結帳。價格不會依履歷、求職紀錄或使用行為調整。`
              : locale === "zh-CN"
                ? `目前仅为区域价格预估（${billingMarket.currency}）；公开预览版尚未启用付款与结账。价格不会依据简历、求职记录或使用行为调整。`
                : `Regional price estimate in ${billingMarket.currency}. Billing and checkout are not enabled in this public preview. Pricing never uses your resume, job history, or behavior.`}
          </p>
        </div>
        <div className="plan-grid">
          <article>
            <span>{detail.source}</span>
            <h3>Community</h3>
            <p className="price">Free</p>
            <ul>
              <li>{detail.matrix}</li>
              <li>{detail.languageCount}</li>
              <li>{detail.recommendationsTitle}</li>
              <li>{copy.manual}</li>
              <li>{copy.tracker}</li>
              <li>{copy.feedback} · Open queue</li>
            </ul>
            <a
              className="button primary"
              href={`${localizedPath(locale, "account")}?plan=community`}
            >
              {accountLabels.signIn}
            </a>
          </article>
          <article className="featured">
            <span>{detail.privateTitle}</span>
            <h3>Pro</h3>
            <p className="price">
              <strong>
                {formatPrice(proMonthly, billingMarket.currency, locale)}
              </strong>
              <small>/ {formatBillingUnit(locale, "month")}</small>
            </p>
            <p className="price-note">
              {formatPrice(proMonthly * 10, billingMarket.currency, locale)} /{" "}
              {formatBillingUnit(locale, "year")} · US$15 base
            </p>
            <ul>
              <li>{detail.privateTitle}</li>
              <li>{detail.assistantTitle}</li>
              <li>
                {copy.manual} · {copy.hybrid} · {copy.automatic}
              </li>
              <li>{copy.tracker}</li>
              <li>{detail.aiModel}</li>
              <li>{copy.feedback} · Open queue</li>
            </ul>
            <a
              className="button primary"
              href={`${localizedPath(locale, "account")}?plan=pro`}
            >
              Pro · {accountLabels.signIn}
            </a>
          </article>
          <article>
            <span>{detail.workspace}</span>
            <h3>Team</h3>
            <p className="price">
              <strong>
                {formatPrice(teamMonthly, billingMarket.currency, locale)}
              </strong>
              <small>/ {formatBillingUnit(locale, "month")} · 5+</small>
            </p>
            <p className="price-note">
              {formatPrice(
                teamAnnualMonthly,
                billingMarket.currency,
                locale,
              )} × 12 · 5+ seats
            </p>
            <ul>
              <li>{detail.workspace}</li>
              <li>{copy.tracker}</li>
              <li>{copy.feedback} · Priority</li>
              <li>{copy.automatic}</li>
              <li>{detail.checked}</li>
              <li>{copy.market}</li>
            </ul>
            <a
              className="button secondary"
              href={`${localizedPath(locale, "account")}?plan=team`}
            >
              Team · {accountLabels.signIn}
            </a>
          </article>
          <article>
            <span>SSO · SLA · API</span>
            <h3>Enterprise</h3>
            <p className="price">
              <strong>
                ≥ {formatPrice(enterpriseAnnual, billingMarket.currency, locale)}
              </strong>
              <small>/ {formatBillingUnit(locale, "year")}</small>
            </p>
            <p className="price-note">Annual agreement · custom scope</p>
            <ul>
              <li>SSO · SCIM · audit log</li>
              <li>Private models · data controls</li>
              <li>API · SLA · onboarding</li>
              <li>{copy.feedback} · Highest priority</li>
              <li>{copy.market} · {detail.workspace}</li>
              <li>{detail.checked}</li>
            </ul>
            <button className="button secondary" disabled>
              Enterprise · {locale === "zh-TW" ? "尚未開放" : "Not yet available"}
            </button>
          </article>
        </div>
      </section>
    </main>
  );
}
