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
  brandTaglineFor,
  copyFor,
  detailFor,
  LANGUAGES,
  localeFromPath,
  localeToPath,
  LocaleCode,
  RTL_LOCALES,
  walkthroughLabelFor,
} from "./i18n";
import { accountCopyFor, openSourceLabelFor } from "./account-copy";
import { BrandMark } from "./BrandMark";
import { faqCopyFor } from "./faq-copy";
import { MobileNav } from "./MobileNav";
import { parseDocuments } from "./document-parser";
import { localizedPath } from "./intl-routing";
import {
  countryLabelFor,
  marketValueFor,
  regionLabelFor,
  timeRangeLabelFor,
} from "./market-localization";
import {
  bestSpeechVoice,
  INTERVIEW_DEPTH_COUNT,
  InterviewPersonaId,
  interviewFlowCopyFor,
  localizedInterviewQuestion,
  localizedPersonaLabel,
  pronunciationTextFor,
  questionOnly,
  speechLocaleFor,
  speechRateFor,
} from "./interview-speech";

type MatchStatus = "Strong evidence" | "Partial evidence" | "Gap";
type Match = {
  keyword: string;
  priority: "Required" | "Core" | "Preferred";
  status: MatchStatus;
  score: number;
  evidence: string;
};
type InterviewTopic = {
  focusLabel: string;
  proofLabel: string;
  gapLabel: string;
  kind: "proof" | "gap" | "fallback";
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
  round: string;
  focus: string;
  pressure: string;
  decision: string;
  answerPattern: string;
  redFlags: string;
  prepChecklist: string[];
  resourceTags: InterviewResourceTag[];
};
type InterviewResourceTag =
  | "behavioral"
  | "coding"
  | "system-design"
  | "frontend"
  | "data-sql"
  | "ml-ai"
  | "security";
type InterviewResource = {
  name: string;
  href: string;
  tags: InterviewResourceTag[];
  access: string;
  bestFor: string;
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
const MODE_DISCLOSURES: Partial<
  Record<LocaleCode, Record<ApplicationMode, string>>
> = {
  "zh-TW": {
    Manual: "開源免費。所有職缺、文件與投遞都由你自行檢查及送出。",
    Hybrid: "開源免費。AI 可準備客製草稿與下一步，但每次送出前都必須由你核准。",
    Automatic:
      "開源免費。目前公開版不會自動投遞；未來僅會透過核准 API，在取得同意、速率限制、稽核紀錄與緊急停止機制下執行。",
  },
  "zh-CN": {
    Manual: "开源免费。所有职位、文件与投递都由你自行检查并提交。",
    Hybrid: "免费开源。AI 可准备定制草稿和下一步，但每次提交前都必须由你批准。",
    Automatic:
      "免费开源。目前公开版不会自动投递；未来仅会通过获准 API，在取得同意、速率限制、审计记录与紧急停止机制下执行。",
  },
  ja: {
    Manual: "オープンソースで無料です。求人、書類、応募はすべて自分で確認して送信します。",
    Hybrid: "無料のオープンソース機能です。AIが下書きを準備しますが、送信前に必ず本人の承認が必要です。",
    Automatic:
      "無料のオープンソース機能です。公開版は自動応募を行いません。将来は承認済みAPI、同意、速度制限、監査ログ、緊急停止を備えた場合にのみ実行します。",
  },
  ko: {
    Manual: "오픈 소스 무료 모드입니다. 모든 공고, 문서 및 지원서를 직접 검토하고 제출합니다.",
    Hybrid: "무료 오픈 소스 기능입니다. AI가 맞춤 초안을 준비하지만 제출 전에는 항상 사용자의 승인이 필요합니다.",
    Automatic:
      "무료 오픈 소스 기능입니다. 공개 버전은 자동 지원하지 않습니다. 향후 승인된 API, 동의, 속도 제한, 감사 로그 및 긴급 중지 기능이 있을 때만 실행합니다.",
  },
  es: {
    Manual: "Código abierto y gratuito. Revisas cada oferta, documento y solicitud antes de enviarla tú mismo.",
    Hybrid: "Gratis y de código abierto. La IA prepara borradores, pero debes aprobar cada envío.",
    Automatic:
      "Gratis y de código abierto. La versión pública no envía solicitudes automáticamente; una versión futura requerirá APIs aprobadas, consentimiento, límites, auditoría y parada de emergencia.",
  },
  fr: {
    Manual: "Open source et gratuit. Vous vérifiez chaque offre, document et candidature avant de l’envoyer vous-même.",
    Hybrid: "Gratuit et open source. L’IA prépare les brouillons, mais vous devez approuver chaque envoi.",
    Automatic:
      "Gratuit et open source. La version publique n’envoie aucune candidature automatiquement ; une version future exigera des API approuvées, le consentement, des limites, un journal d’audit et un arrêt d’urgence.",
  },
  de: {
    Manual: "Open Source und kostenlos. Du prüfst jede Stelle, jedes Dokument und sendest jede Bewerbung selbst.",
    Hybrid: "Kostenlos und Open Source. Die KI bereitet Entwürfe vor, aber du musst jede Übermittlung freigeben.",
    Automatic:
      "Kostenlos und Open Source. Die öffentliche Version bewirbt sich nicht automatisch; eine spätere Version benötigt freigegebene APIs, Einwilligung, Limits, Audit-Protokoll und Not-Aus.",
  },
};

const MODE_CONTEXT: Partial<Record<LocaleCode, string>> = {
  en: "This setting only controls what happens after you find a suitable role. It does not change your resume and job-post match.",
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
const OUTCOME_EVIDENCE_PATTERN =
  /\p{N}+(?:[.,]\p{N}+)?\s?%|[$€£¥₹₩]\s?\p{N}|\p{N}+\s?(?:x|倍|hours?|days?|weeks?|months?|users?|customers?)|reduc|increas|grew|saved|improv|accelerat|revenue|adoption|降低|減少|提升|成長|增加|改善|節省|减少|增长|提高|节省|削減|向上|増加|성장|증가|개선|절감|reduj|aument|mejor|ahorr|rédu|amélior|économ|reduzier|steiger|verbesser|eingespart/iu;
const ACTION_EVIDENCE_PATTERN =
  /\b(?:built|led|launched|owned|designed|automated|delivered|created|managed|partnered)\b|建立|建置|領導|推出|設計|自動化|交付|管理|合作|领导|发布|自动化|協働|主導|設計した|自動化した|구축|주도|출시|설계|자동화|lider|diseñ|automatiz|dirig|conçu|automatis|livré|geleitet|entwickelt|automatisiert/iu;
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

type InterviewStageId =
  | "recruiter-screen"
  | "hiring-manager"
  | "technical"
  | "case-portfolio"
  | "panel"
  | "final-executive";

type InterviewStageConfig = {
  id: InterviewStageId;
  label: string;
  personas: InterviewPersonaId[];
};

const INTERVIEW_STAGE_CONFIGS: InterviewStageConfig[] = [
  {
    id: "recruiter-screen",
    label: "Recruiter or HR screen",
    personas: ["hr", "recruiter", "hiring-manager", "values", "panel"],
  },
  {
    id: "hiring-manager",
    label: "Hiring manager interview",
    personas: [
      "hiring-manager",
      "functional-lead",
      "peer",
      "cross-functional",
      "panel",
    ],
  },
  {
    id: "technical",
    label: "Technical round",
    personas: [
      "technical",
      "system-design",
      "functional-lead",
      "hiring-manager",
      "peer",
    ],
  },
  {
    id: "case-portfolio",
    label: "Case or portfolio round",
    personas: ["case", "portfolio", "customer", "functional-lead", "panel"],
  },
  {
    id: "panel",
    label: "Panel interview",
    personas: [
      "panel",
      "hiring-manager",
      "peer",
      "cross-functional",
      "technical",
    ],
  },
  {
    id: "final-executive",
    label: "Final or executive round",
    personas: ["ceo", "coo", "values", "hiring-manager", "panel"],
  },
];

const INTERVIEW_PERSONAS: InterviewPersona[] = [
  {
    id: "hr",
    label: "HR screening",
    round: "Qualification and logistics",
    focus: "Baseline qualifications, motivation, career narrative, availability, and constraints",
    pressure: "Warm and time-boxed; checks whether your claims and expectations match the role",
    decision: "Should this candidate advance to the hiring team?",
    answerPattern: "Give a 60–90 second fit summary, then support each must-have with one proof point.",
    redFlags: "Long autobiography, unclear motivation, unsupported requirements, or avoidable logistics surprises.",
    prepChecklist: ["Must-have qualification map", "Why this role now", "Career transition explanation", "Availability and work authorization facts"],
    resourceTags: ["behavioral"],
  },
  {
    id: "recruiter",
    label: "Recruiter",
    round: "Market fit and process readiness",
    focus: "Search-fit keywords, level, scope, compensation alignment, and a clean candidate narrative",
    pressure: "Compares you with the active candidate pool and tests whether your story is easy to represent",
    decision: "Can I credibly present this candidate to the client or hiring manager?",
    answerPattern: "Lead with target role, relevant scope, strongest proof, and a concise reason for the move.",
    redFlags: "Undefined target, title inflation, compensation surprises, or a story that changes under follow-up.",
    prepChecklist: ["Target-title sentence", "Scope and seniority examples", "Compensation range research", "Three recruiter-ready proof bullets"],
    resourceTags: ["behavioral"],
  },
  {
    id: "hiring-manager",
    label: "Hiring manager",
    round: "Behavioral and role execution",
    focus: "Role-specific judgment, execution, and measurable outcomes",
    pressure: "Detailed follow-ups on ownership and trade-offs",
    decision: "Can this person solve the problems my team actually owns?",
    answerPattern: "Use STAR-L: situation, task, your action, measurable result, and what you learned.",
    redFlags: "Team-only language, missing decisions, polished stories without numbers, or no reflection.",
    prepChecklist: ["Three JD-linked STAR stories", "Ownership boundaries", "Trade-off and failure story", "First-90-day hypothesis"],
    resourceTags: ["behavioral"],
  },
  {
    id: "functional-lead",
    label: "Functional leader",
    round: "Craft depth and operating judgment",
    focus: "Domain depth, standards, prioritization, quality bar, and how you develop the function",
    pressure: "Tests whether your expertise transfers beyond one familiar project or tool",
    decision: "Will this person raise the quality and judgment of the function?",
    answerPattern: "Explain your principle, show one applied example, name the trade-off, then generalize the lesson.",
    redFlags: "Tool memorization, no quality standard, weak prioritization, or expertise that cannot be taught.",
    prepChecklist: ["Core operating principles", "Quality-bar example", "Prioritization framework", "How you coach or document decisions"],
    resourceTags: ["behavioral"],
  },
  {
    id: "technical",
    label: "Technical interviewer",
    round: "Coding, SQL, debugging, or technical fundamentals",
    focus: "Problem decomposition, correctness, testing, complexity, debugging, and communication",
    pressure: "Changes constraints and expects you to think aloud instead of jumping to a memorized answer",
    decision: "Can this candidate reason clearly and produce reliable technical work under constraints?",
    answerPattern: "Clarify, state assumptions, propose a simple solution, test it, analyze trade-offs, then improve it.",
    redFlags: "Silent coding, premature optimization, no test cases, bluffing, or ignoring edge cases.",
    prepChecklist: ["Language and environment check", "Core data structures or SQL patterns", "Think-aloud practice", "Testing and complexity checklist"],
    resourceTags: ["coding", "data-sql", "frontend"],
  },
  {
    id: "system-design",
    label: "System design interviewer",
    round: "Architecture and scalability",
    focus: "Requirements, scale, APIs, data model, reliability, observability, security, and trade-offs",
    pressure: "Adds traffic, failure, privacy, and cost constraints while testing whether you lead the conversation",
    decision: "Can this candidate design and explain a resilient system at the expected level?",
    answerPattern: "Clarify requirements, estimate scale, draw the high-level design, deep-dive, then test failure modes.",
    redFlags: "Architecture before requirements, buzzword stacking, no numbers, or no failure and trade-off analysis.",
    prepChecklist: ["Requirements questions", "Back-of-envelope estimates", "Core component trade-offs", "Reliability and observability review"],
    resourceTags: ["system-design", "ml-ai", "security"],
  },
  {
    id: "portfolio",
    label: "Portfolio reviewer",
    round: "Work sample and presentation",
    focus: "Problem selection, process, artifacts, decisions, quality, impact, and honest attribution",
    pressure: "Interrupts the polished walkthrough to test what you actually did and why",
    decision: "Does the work demonstrate the craft and judgment required for this role?",
    answerPattern: "Start with the problem and constraint, show two pivotal decisions, then prove the outcome and your contribution.",
    redFlags: "Pretty output without reasoning, confidential details, unclear ownership, or no evidence of iteration.",
    prepChecklist: ["Two-minute overview", "Three decision artifacts", "Before-and-after evidence", "Confidentiality-safe backup detail"],
    resourceTags: ["frontend", "behavioral"],
  },
  {
    id: "coo",
    label: "COO",
    round: "Operations and scale",
    focus: "Operating leverage, process quality, and cross-functional delivery",
    pressure: "Tests scale, risk, and repeatability",
    decision: "Can this person make the organization more reliable as complexity grows?",
    answerPattern: "Show the broken operating system, your intervention, adoption controls, and the audited result.",
    redFlags: "Heroics instead of systems, no controls, fragile handoffs, or results that depend on one person.",
    prepChecklist: ["Process map", "Operating metric", "Risk and control example", "Scale and repeatability story"],
    resourceTags: ["behavioral", "system-design"],
  },
  {
    id: "ceo",
    label: "CEO",
    round: "Strategy and executive judgment",
    focus: "Business impact, strategic clarity, and why you",
    pressure: "Expects a direct point of view and executive brevity",
    decision: "Will this person create disproportionate value and make sound decisions with limited context?",
    answerPattern: "State your point of view first, support it with one business proof, then name the risk and next move.",
    redFlags: "Feature-level detail without business relevance, weak opinions, inflated impact, or long answers.",
    prepChecklist: ["Company thesis", "One high-leverage proof", "Contrarian but defensible view", "Executive 30-second answer"],
    resourceTags: ["behavioral"],
  },
  {
    id: "peer",
    label: "Future teammate",
    round: "Collaboration and working style",
    focus: "Collaboration, conflict, feedback, and working style",
    pressure: "Looks for self-awareness and practical partnership",
    decision: "Would I trust this person in the difficult, ordinary parts of the work?",
    answerPattern: "Describe the tension honestly, your behavior, the other person’s contribution, and what changed afterward.",
    redFlags: "Blaming, claiming all credit, fake conflict, or no evidence that feedback changed behavior.",
    prepChecklist: ["Conflict story", "Feedback received", "How you unblock others", "Working-style preferences"],
    resourceTags: ["behavioral"],
  },
  {
    id: "cross-functional",
    label: "Cross-functional partner",
    round: "Influence without authority",
    focus: "Stakeholder empathy, alignment, negotiation, decision records, and durable handoffs",
    pressure: "Introduces competing incentives and incomplete authority",
    decision: "Can this person move shared work forward without creating organizational debt?",
    answerPattern: "Map incentives, show the disagreement, explain your influence mechanism, and prove the shared outcome.",
    redFlags: "Escalation as the first tool, one-sided empathy, missing decision owners, or weak follow-through.",
    prepChecklist: ["Stakeholder map", "Influence story", "Decision-document example", "Difficult handoff and recovery"],
    resourceTags: ["behavioral"],
  },
  {
    id: "customer",
    label: "Customer or user representative",
    round: "Customer judgment and communication",
    focus: "Problem discovery, user empathy, expectation setting, clarity, and response to difficult feedback",
    pressure: "Challenges assumptions and asks you to explain complex work without internal jargon",
    decision: "Will this person earn trust and solve the right customer problem?",
    answerPattern: "Name the user problem, show how you learned it, explain the decision plainly, and close the feedback loop.",
    redFlags: "Solution-first thinking, jargon, dismissing feedback, or promising what the team cannot deliver.",
    prepChecklist: ["Customer discovery story", "Plain-language explanation", "Expectation reset example", "Feedback-to-roadmap proof"],
    resourceTags: ["behavioral"],
  },
  {
    id: "values",
    label: "Culture and values interviewer",
    round: "Values, learning, and ethics",
    focus: "Behavior under pressure, learning velocity, integrity, inclusion, and consistency with stated values",
    pressure: "Asks for counterexamples and what you did when the right action was inconvenient",
    decision: "Do this candidate’s repeated behaviors match the organization’s values?",
    answerPattern: "Choose a real tension, name the value at stake, show the costly action, and explain the lasting behavior change.",
    redFlags: "Abstract values, perfect-hero stories, no cost or tension, or answers optimized to please the interviewer.",
    prepChecklist: ["Failure and learning story", "Ethical tension", "Inclusion in action", "Value you challenged constructively"],
    resourceTags: ["behavioral"],
  },
  {
    id: "case",
    label: "Case breakdown",
    round: "Structured problem solving",
    focus: "Problem framing, assumptions, prioritization, and synthesis",
    pressure: "Introduces ambiguity and challenges your reasoning",
    decision: "Can this candidate structure ambiguity and reach an evidence-based recommendation?",
    answerPattern: "Restate the objective, structure the problem, prioritize hypotheses, analyze evidence, and synthesize a decision.",
    redFlags: "Analysis before objective, hidden assumptions, no prioritization, or a conclusion disconnected from evidence.",
    prepChecklist: ["Clarifying questions", "Issue tree", "Mental-math checks", "One-minute recommendation"],
    resourceTags: ["data-sql", "behavioral"],
  },
  {
    id: "panel",
    label: "Interview panel",
    round: "Cross-round consistency",
    focus: "Consistency across qualification, craft, collaboration, strategy, and evidence",
    pressure: "Switches perspectives quickly and checks whether your core story remains coherent",
    decision: "Does the complete evidence support a confident, aligned hire decision?",
    answerPattern: "Answer the named stakeholder directly, keep the same facts, and adjust only the level and angle.",
    redFlags: "Contradictory scope, changing numbers, overfitting to each interviewer, or defensive follow-ups.",
    prepChecklist: ["One-page evidence map", "Consistent numbers and ownership", "Short and deep answer versions", "Questions for each panelist"],
    resourceTags: ["behavioral", "coding", "system-design"],
  },
];

const TECHNICAL_RESOURCES: InterviewResource[] = [
  {
    name: "LeetCode Explore",
    href: "https://leetcode.com/explore/",
    tags: ["coding"],
    access: "External platform · free and paid content",
    bestFor: "Algorithms, data structures, and timed coding patterns",
  },
  {
    name: "Exercism",
    href: "https://exercism.org/tracks",
    tags: ["coding"],
    access: "Open source · free",
    bestFor: "Language fluency, tests, and mentor feedback",
  },
  {
    name: "freeCodeCamp Coding Interview Prep",
    href: "https://www.freecodecamp.org/learn/coding-interview-prep/",
    tags: ["coding", "frontend"],
    access: "Open-source curriculum · free",
    bestFor: "Algorithms, projects, and progressive practice",
  },
  {
    name: "System Design Primer",
    href: "https://github.com/donnemartin/system-design-primer",
    tags: ["system-design"],
    access: "Open source · CC BY 4.0",
    bestFor: "Scalability, trade-offs, design questions, and sample solutions",
  },
  {
    name: "Tech Interview Handbook",
    href: "https://github.com/yangshun/tech-interview-handbook",
    tags: ["behavioral", "coding"],
    access: "Open source · free",
    bestFor: "Study plans, coding rounds, behavioral preparation, and checklists",
  },
  {
    name: "Front End Interview Handbook",
    href: "https://github.com/yangshun/front-end-interview-handbook",
    tags: ["frontend", "system-design"],
    access: "Open source · free",
    bestFor: "HTML, CSS, JavaScript, browser knowledge, and front-end design",
  },
  {
    name: "SQL Murder Mystery",
    href: "https://github.com/NUKnightLab/sql-mysteries",
    tags: ["data-sql"],
    access: "Open source · MIT and CC BY-SA 4.0",
    bestFor: "SQL joins, filtering, investigation, and query reasoning",
  },
  {
    name: "Machine Learning Systems Design",
    href: "https://github.com/chiphuyen/machine-learning-systems-design",
    tags: ["ml-ai", "system-design"],
    access: "Open repository · community answers",
    bestFor: "ML problem framing, data, evaluation, serving, and trade-offs",
  },
  {
    name: "OWASP NodeGoat",
    href: "https://github.com/OWASP/NodeGoat",
    tags: ["security"],
    access: "Open source · Apache-2.0",
    bestFor: "Web security risks, exploitation, remediation, and secure design",
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
    "Your interviewer follows your resume, the job post, and your proof—not a generic question bank or invented experience.",
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
  relevance: "Job relevance",
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
    const partialTerms = keyword
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 3);
    const partial = partialTerms.some((word) => includesPhrase(resume, word));
    const evidence = evidenceLine(resume, [...aliases, ...partialTerms]);
    const score = Math.min(
      100,
      (exact ? 65 : partial ? 45 : 0) +
        (exact || partial
          ? ACTION_EVIDENCE_PATTERN.test(evidence)
            ? 15
            : 0
          : 0) +
        (exact || partial
          ? OUTCOME_EVIDENCE_PATTERN.test(evidence)
            ? 20
            : 0
          : 0),
    );
    return [
      {
        keyword,
        priority: preferred ? "Preferred" : required ? "Required" : "Core",
        status:
          score >= 80
            ? "Strong evidence"
            : score >= 45
              ? "Partial evidence"
              : "Gap",
        score,
        evidence,
      },
    ];
  });
}
function scoreMatches(matches: Match[]) {
  if (!matches.length) return 0;
  const weights = { Required: 1.35, Core: 1, Preferred: 0.65 };
  const possible = matches.reduce(
    (sum, item) => sum + weights[item.priority],
    0,
  );
  return Math.round(
    (matches.reduce(
      (sum, item) => sum + weights[item.priority] * (item.score / 100),
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
  return Math.round(
    filtered.reduce((sum, item) => sum + item.score, 0) / filtered.length,
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
    evidence.some((line) => OUTCOME_EVIDENCE_PATTERN.test(line))
  )
    return 100;
  if (
    evidence.some((line) => ACTION_EVIDENCE_PATTERN.test(line))
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

function interviewTopicsFor(
  matches: Match[],
  locale: LocaleCode,
): InterviewTopic[] {
  const proofs = matches.filter(
    (item) =>
      item.status !== "Gap" && item.evidence !== "No source evidence found.",
  );
  const gaps = matches.filter((item) => item.status === "Gap");
  const fallbackProof =
    proofs[0]?.keyword ||
    (locale === "zh-TW"
      ? "最相關的履歷經驗"
      : locale === "zh-CN"
        ? "最相关的简历经历"
        : "your most relevant resume experience");
  const fallbackGap =
    gaps[0]?.keyword ||
    (locale === "zh-TW"
      ? "這個職位尚未證明的要求"
      : locale === "zh-CN"
        ? "这个职位尚未证明的要求"
        : "an unproven requirement in this role");
  const topics: InterviewTopic[] = [
    ...proofs.map((proof, index) => ({
      focusLabel: proof.keyword,
      proofLabel: proof.keyword,
      gapLabel: gaps[index % Math.max(1, gaps.length)]?.keyword || fallbackGap,
      kind: "proof" as const,
    })),
    ...gaps.map((gap, index) => ({
      focusLabel: gap.keyword,
      proofLabel:
        proofs[index % Math.max(1, proofs.length)]?.keyword || fallbackProof,
      gapLabel: gap.keyword,
      kind: "gap" as const,
    })),
  ];
  if (topics.length) return topics;
  return interviewFlowCopyFor(locale).stages.map((stage) => ({
    focusLabel: stage,
    proofLabel: fallbackProof,
    gapLabel: fallbackGap,
    kind: "fallback" as const,
  }));
}

function gapTopicOpening(
  locale: LocaleCode,
  proofLabel: string,
  gapLabel: string,
) {
  if (locale === "zh-TW")
    return `這份 JD 要求「${gapLabel}」，但履歷裡還沒有直接證據。請誠實說明你會如何補足，並指出最接近的「${proofLabel}」經驗。`;
  if (locale === "zh-CN")
    return `这份 JD 要求“${gapLabel}”，但简历里还没有直接证据。请诚实说明你会如何补足，并指出最接近的“${proofLabel}”经历。`;
  if (locale === "en")
    return `This job description calls for ${gapLabel}, but your resume does not show direct evidence yet. How would you address that honestly, and which ${proofLabel} experience is the closest bridge?`;
  return localizedInterviewQuestion(locale, 4, proofLabel, gapLabel);
}

function questionForInterview(
  persona: InterviewPersonaId,
  turn: number,
  matches: Match[],
  locale: LocaleCode,
  topicIndex = 0,
  previousAnswer = "",
) {
  const topics = interviewTopicsFor(matches, locale);
  const topic = topics[topicIndex % topics.length];
  const proofLabel = topic.proofLabel;
  const gapLabel = topic.gapLabel;
  let question = "";
  if (topic.kind === "gap" && turn === 0)
    question = gapTopicOpening(locale, proofLabel, gapLabel);
  else if (locale !== "en")
    question = localizedInterviewQuestion(locale, turn, proofLabel, gapLabel);
  const questions: Record<InterviewPersonaId, string[]> = {
    hr: [
      `Give me the 90-second version of your background. Which two requirements in this job description are you already qualified to handle?`,
      `Which must-have qualification is best supported by your ${proofLabel} experience, and what exactly proves it?`,
      `Why this role, why this company, and why now—not simply why you want to leave your current situation?`,
      `What practical constraint should we discuss now: location, timing, work authorization, travel, or compensation expectations?`,
      `The resume does not yet prove ${gapLabel}. How would you explain that gap honestly without talking yourself out of the role?`,
    ],
    recruiter: [
      `What exact role are you targeting, at what level, and what evidence makes that target credible?`,
      `If I presented you to a hiring manager in three sentences, which ${proofLabel} result must I include?`,
      `Walk me through the scope behind your titles: team size, stakeholders, decision authority, and business scale.`,
      `What compensation range and work arrangement are you targeting, and what information would change that answer?`,
      `What concern is a recruiter most likely to hear about your profile, and what verifiable evidence addresses it?`,
    ],
    "hiring-manager": [
      `Walk me through your strongest ${proofLabel} example. What problem did you own, what did you decide, and what changed?`,
      `Which part of that result was directly yours, who else contributed, and where did your ownership end?`,
      `Which trade-off in that example was genuinely yours to make, and what evidence told you it was the right call?`,
      `How did you measure the outcome, and which claim could a former colleague verify?`,
      `If you joined this team, how would you apply that proof to the priorities in this job description during your first 90 days?`,
    ],
    "functional-lead": [
      `What principle guides your strongest ${proofLabel} work, and where did you learn that principle the hard way?`,
      `Show me how you set the quality bar in that example. What would have counted as unacceptable work?`,
      `Which competing priorities did you reject, and how did you defend that decision to the team?`,
      `How did you review the work, detect weak reasoning, and improve the function rather than only the deliverable?`,
      `What part of ${gapLabel} would you need to learn, and how would you reach our quality bar quickly?`,
    ],
    technical: [
      `Before solving anything, clarify the inputs, outputs, constraints, and edge cases you would confirm for a ${proofLabel}-related task.`,
      `Talk me through the simplest correct approach first. What would you implement, query, or test before optimizing it?`,
      `Now assume the data volume or traffic is ten times larger. What breaks, and how would you measure the bottleneck?`,
      `Give me three test cases—including one failure case—and explain what each test proves.`,
      `You are stuck after twenty minutes. How do you debug systematically, communicate progress, and decide when to ask for help?`,
    ],
    "system-design": [
      `Design a system related to ${proofLabel}. Start by asking the requirements and scale questions you need before drawing components.`,
      `State your traffic, storage, latency, availability, and consistency assumptions. Which estimate most affects the design?`,
      `Describe the high-level architecture and data flow. Why did you choose each boundary, API, and storage model?`,
      `One dependency fails and traffic triples. How does the system degrade, recover, and tell operators what happened?`,
      `Where are the security, privacy, cost, and observability trade-offs, and what would you change in version two?`,
    ],
    portfolio: [
      `Choose one work sample that best proves ${proofLabel}. What user or business problem existed before you touched it?`,
      `Which two decisions in the work were genuinely yours, and what alternatives did you reject?`,
      `Show the messy middle: what changed after research, review, testing, or failed attempts?`,
      `What evidence shows the work succeeded, and which result can another person verify?`,
      `If you rebuilt this work with what you know now, what would you change and why?`,
    ],
    coo: [
      `Choose one example where your work improved an operating process. What was unreliable before, and how did the operating rhythm change?`,
      `What did you personally own in that operating change, and which dependencies were controlled by other people?`,
      `What did the process depend on besides you, and how did you make the result repeatable across people or teams?`,
      `Which operating metric moved, how was it measured, and what evidence would survive an audit?`,
      `Where could your approach fail at ten times the scale, and what control would you put in place first?`,
    ],
    ceo: [
      `In ninety seconds, tell me why your evidence makes you unusually useful for this role and this business.`,
      `Which part of that value did you create personally, and which part came from the team or the market?`,
      `What business outcome did your strongest example influence, and why did that outcome matter beyond your immediate team?`,
      `What is the most defensible number behind that outcome, and who could verify it?`,
      `What point of view would you bring here that is supported by experience rather than aspiration?`,
    ],
    peer: [
      `Tell me about a time you and a partner disagreed on how to solve a problem. What did you do, and what changed in the working relationship?`,
      `What did you own in that collaboration, and what did your partner own?`,
      `Which part of that result belonged to someone else, and how did you make their contribution more effective?`,
      `What observable result showed that the partnership improved rather than simply becoming more agreeable?`,
      `What feedback would that teammate give you about how you operate under pressure?`,
    ],
    "cross-functional": [
      `Tell me about a project where teams wanted different outcomes. How did you map the incentives before proposing a solution?`,
      `What authority did you not have, and which influence mechanism actually moved the decision?`,
      `Which stakeholder disagreed most strongly, and what evidence or trade-off changed the conversation?`,
      `How did you record the decision, assign ownership, and prevent the handoff from failing later?`,
      `What would those partners say you made easier—and what would they ask you to improve?`,
    ],
    customer: [
      `Describe the customer problem behind your strongest ${proofLabel} example without using internal jargon.`,
      `How did you know the stated request was—or was not—the underlying user need?`,
      `Tell me about difficult customer feedback you initially disagreed with. What did you do next?`,
      `How did you set expectations when the team could not deliver everything the customer wanted?`,
      `Which customer signal changed your decision, and how did you close the loop with the people affected?`,
    ],
    values: [
      `Tell me about a time doing the right thing made the work slower, harder, or less popular. What did you choose?`,
      `Describe a meaningful failure. What part was yours, and what behavior changed afterward?`,
      `When did someone with less authority change your mind, and how did you create room for that?`,
      `Which company value is hardest to practice under pressure, and what evidence shows how you handle that tension?`,
      `Tell me about a value you challenged constructively rather than simply agreeing with it.`,
    ],
    case: [
      `Case: a key product metric fell 12% in two weeks after a release. Structure how you would diagnose the problem before proposing a fix.`,
      `Which part of the diagnosis would you own directly, and what would you delegate to product, engineering, or analytics partners?`,
      `Assume the decline is concentrated among new users on mobile. Which hypotheses move to the top, and what evidence would separate them?`,
      `Define the decision metric, the comparison you would trust, and the threshold that would change your recommendation.`,
      `You have one analyst and five working days. Prioritize the plan, name the trade-offs, and give me your executive recommendation.`,
    ],
    panel: [
      `Give us the two-minute through-line connecting your background, ${proofLabel}, and the problems in this role.`,
      `From a hiring manager’s perspective, what did you own; from a teammate’s perspective, how did you work?`,
      `Now answer technically: which decision was hardest, what alternatives existed, and what evidence chose the path?`,
      `Now answer as an executive: what changed for the business, and what is the most defensible number?`,
      `Across this panel, what concern have we not asked about—and what honest evidence should shape our final decision?`,
    ],
  };
  if (!question)
    question = questions[persona][
      Math.min(Math.max(turn, 0), INTERVIEW_DEPTH_COUNT - 1)
    ];
  if (previousAnswer.trim())
    question = naturalInterviewFollowUp(
      question,
      previousAnswer,
      persona,
      turn,
      locale,
    );
  const topicLabel = interviewFlowCopyFor(locale).topic;
  return `${topicLabel} ${topicIndex + 1} · ${topic.focusLabel}\n\n${question}`;
}

function answerAnchor(answer: string, locale: LocaleCode) {
  const cleaned = answer.replace(/\s+/g, " ").trim();
  if (["zh-CN", "zh-TW", "ja", "th"].includes(locale))
    return cleaned.slice(0, 28);
  return cleaned.split(" ").slice(0, 10).join(" ");
}

function naturalInterviewFollowUp(
  plannedQuestion: string,
  answer: string,
  persona: InterviewPersonaId,
  turn: number,
  locale: LocaleCode,
) {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const anchor = answerAnchor(answer, locale);
  const hasOwnership =
    /\b(?:I|my|mine)\b|我|本人|제가|내가|私|yo\b|je\b|ich\b/iu.test(answer);
  const hasOutcome =
    /\p{N}+(?:[.,]\p{N}+)?\s?%|\b(?:increased|reduced|saved|grew|improved|result|outcome)\b|提升|降低|減少|增加|改善|成果|結果|성과|결과|向上|削減/iu.test(
      answer,
    );
  const isTechnical = ["technical", "system-design", "case"].includes(persona);

  if (locale === "zh-TW") {
    if (words.length < 10)
      return `你剛才提到「${anchor}」。請先把情境說具體：你面對什麼限制、親自做了什麼？`;
    if (!hasOwnership)
      return `你剛才多次使用團隊語氣。具體來說，哪個決定與行動是你本人負責的？`;
    if (turn >= 3 && !hasOutcome)
      return `你說明了做法，但還沒有結果。最後改變了什麼，如何衡量，誰可以驗證？`;
    if (isTechnical)
      return `你剛才提到「${anchor}」。${plannedQuestion}`;
    return `我想沿著你剛才提到的「${anchor}」追問：${plannedQuestion}`;
  }
  if (locale === "zh-CN") {
    if (words.length < 10)
      return `你刚才提到“${anchor}”。请先把情境说具体：你面对什么限制、亲自做了什么？`;
    if (!hasOwnership)
      return `你刚才多次使用团队语气。具体来说，哪个决定与行动是你本人负责的？`;
    if (turn >= 3 && !hasOutcome)
      return `你说明了做法，但还没有结果。最后改变了什么，如何衡量，谁可以验证？`;
    return `我想沿着你刚才提到的“${anchor}”追问：${plannedQuestion}`;
  }
  if (locale === "en") {
    if (words.length < 18)
      return `You said “${anchor}.” Make that concrete: what constraint were you facing, and what did you personally do?`;
    if (!hasOwnership)
      return `You have described the team’s work. What decision and action were specifically yours, and where did your ownership end?`;
    if (turn >= 3 && !hasOutcome)
      return `I understand the approach, but not the result yet. What changed, how did you measure it, and who could verify it?`;
    return `You mentioned “${anchor}.” ${plannedQuestion}`;
  }
  return plannedQuestion;
}

function appendTranscript(current: string, next: string, locale: LocaleCode) {
  if (!current.trim()) return next.trim();
  const normalizedCurrent = current.toLocaleLowerCase().replace(/\s+/g, " ").trim();
  const normalizedNext = next.toLocaleLowerCase().replace(/\s+/g, " ").trim();
  if (
    normalizedCurrent === normalizedNext ||
    normalizedCurrent.endsWith(normalizedNext)
  )
    return current;
  const separator = ["zh-CN", "zh-TW", "ja", "th"].includes(locale)
    ? ""
    : " ";
  return `${current.trim()}${separator}${next.trim()}`;
}

function speechVocabularyFor(
  jd: string,
  resume: string,
  matches: Match[],
  persona: InterviewPersonaId,
) {
  const role = INTERVIEW_PERSONAS.find((item) => item.id === persona);
  const preferred = [
    ...matches.map((item) => item.keyword),
    role?.label || "",
    "SQL",
    "API",
    "KPI",
    "Power BI",
    "Tableau",
    "Python",
    "JavaScript",
    "TypeScript",
  ];
  const sourceTerms = `${jd}\n${resume}`.match(
    /\b[A-Za-z][A-Za-z0-9.+#/-]{1,28}\b/g,
  ) || [];
  const stopWords = new Set([
    "about", "after", "again", "also", "and", "are", "because", "been",
    "being", "but", "can", "could", "each", "for", "from", "have", "into",
    "more", "most", "other", "our", "that", "the", "their", "then", "this",
    "through", "using", "what", "when", "where", "which", "with", "would", "your",
  ]);
  const seen = new Set<string>();
  return [...preferred, ...sourceTerms]
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && term.length <= 32)
    .filter((term) => !stopWords.has(term.toLowerCase()))
    .filter((term) => {
      const key = term.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 60);
}

function normalizeSpeechTranscript(transcript: string, vocabulary: string[]) {
  let normalized = transcript.replace(/\s+/g, " ").trim();
  const canonical = new Map(vocabulary.map((term) => [term.toLowerCase(), term]));
  const replacements: Array<[RegExp, string]> = [
    [/\bsequel\b/giu, canonical.get("sql") || "SQL"],
    [/\bpower\s+bee\b/giu, canonical.get("power bi") || "Power BI"],
    [/\btableu\b/giu, canonical.get("tableau") || "Tableau"],
    [/\btype\s*script\b/giu, canonical.get("typescript") || "TypeScript"],
    [/\bjava\s*script\b/giu, canonical.get("javascript") || "JavaScript"],
  ];
  for (const [pattern, replacement] of replacements)
    normalized = normalized.replace(pattern, replacement);
  for (const [lower, display] of canonical) {
    if (!/[A-Z+#.]/.test(display)) continue;
    normalized = normalized.replace(
      new RegExp(`\\b${lower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "giu"),
      display,
    );
  }
  return normalized;
}

function recognitionAlternativeScore(
  alternative: { transcript: string; confidence?: number },
  vocabulary: string[],
) {
  const transcript = alternative.transcript.toLowerCase();
  const vocabularyMatches = vocabulary.filter((term) =>
    transcript.includes(term.toLowerCase()),
  ).length;
  return (alternative.confidence || 0) * 100 + vocabularyMatches * 7;
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

function scoringGuideFor(locale: LocaleCode) {
  if (locale === "zh-TW")
    return {
      eyebrow: "評分與判斷標準",
      title: "這是證據覆蓋率估算，不是 ATS 錄取或淘汰分數",
      intro: "系統只根據你提供的履歷與 JD 判斷；沒有找到證據，不代表你沒有能力。",
      overall: "整體證據覆蓋率",
      keywordEvidence: "關鍵字與履歷證據",
      score: "分數",
      priority: "JD 優先級",
      classification: "分類",
      strong: "證據充分",
      partial: "部分證據",
      gap: "證據缺口",
      strongRule: "直接相關，且包含具體行動或可量化結果。",
      partialRule: "有相關技能或字詞，但責任、情境或結果不夠完整。",
      gapRule: "履歷中沒有找到可支持此要求的內容。",
      formula: "單項：相關字詞 45–65 分＋具體行動 15 分＋可量化結果 20 分。整體分數依 JD 優先級加權。",
      priorityLabels: { Required: "必要條件 · 1.35×", Core: "核心條件 · 1.0×", Preferred: "加分條件 · 0.65×" },
      statusLabels: { "Strong evidence": "證據充分", "Partial evidence": "部分證據", Gap: "證據缺口" },
    };
  if (locale === "zh-CN")
    return {
      eyebrow: "评分与判断标准",
      title: "这是证据覆盖率估算，不是 ATS 录取或淘汰分数",
      intro: "系统只根据你提供的简历与 JD 判断；没有找到证据，不代表你没有能力。",
      overall: "整体证据覆盖率",
      keywordEvidence: "关键词与简历证据",
      score: "分数",
      priority: "JD 优先级",
      classification: "分类",
      strong: "证据充分",
      partial: "部分证据",
      gap: "证据缺口",
      strongRule: "直接相关，并包含具体行动或可量化结果。",
      partialRule: "有相关技能或词语，但责任、情境或结果不够完整。",
      gapRule: "简历中没有找到可支持此要求的内容。",
      formula: "单项：相关词语 45–65 分＋具体行动 15 分＋可量化结果 20 分。整体分数按 JD 优先级加权。",
      priorityLabels: { Required: "必要条件 · 1.35×", Core: "核心条件 · 1.0×", Preferred: "加分条件 · 0.65×" },
      statusLabels: { "Strong evidence": "证据充分", "Partial evidence": "部分证据", Gap: "证据缺口" },
    };
  return {
    eyebrow: "Scoring and classification",
    title: "This shows how much of the job post your resume can support—not whether you will pass an ATS",
    intro: "The score only uses the resume and job description you provide. Missing evidence does not mean missing ability.",
    overall: "Resume support",
    keywordEvidence: "Keyword and resume evidence",
    score: "Score",
    priority: "Importance in the job post",
    classification: "Classification",
    strong: "Strong evidence",
    partial: "Partial evidence",
    gap: "Evidence gap",
    strongRule: "Directly relevant, with a concrete action or measurable result.",
    partialRule: "A related skill appears, but ownership, context, or results are incomplete.",
    gapRule: "No resume content was found that supports this requirement.",
    formula: "Each requirement scores up to 100: related experience provides the base score, then clear actions and measurable results add support. More important job requirements count more in the overall result.",
    priorityLabels: { Required: "Required · 1.35×", Core: "Core · 1.0×", Preferred: "Preferred · 0.65×" },
    statusLabels: { "Strong evidence": "Strong evidence", "Partial evidence": "Partial evidence", Gap: "Evidence gap" },
  };
}

function interviewStudioUiFor(locale: LocaleCode) {
  if (locale === "zh-TW")
    return {
      round: "面試關卡",
      decision: "這位面試官要做的決定",
      answerPattern: "最有力的回答方式",
      avoid: "常見扣分點",
      prep: "進入這關前先準備",
      resources: "Technical Round 練習資源",
      resourcesIntro: "依目前面試角色推薦；開啟外部網站前，請自行確認帳號、價格與隱私條款。",
      vocabulary: "語音專有名詞強化",
      vocabularyNote: "辨識會優先考慮履歷、JD 與此關卡的詞彙；文字仍可在送出前編輯。",
      thinking: "面試官正在準備追問…",
    };
  if (locale === "zh-CN")
    return {
      round: "面试关卡",
      decision: "这位面试官要做的决定",
      answerPattern: "最有力的回答方式",
      avoid: "常见扣分点",
      prep: "进入这关前先准备",
      resources: "Technical Round 练习资源",
      resourcesIntro: "按当前面试角色推荐；打开外部网站前，请自行确认账号、价格与隐私条款。",
      vocabulary: "语音专业词汇增强",
      vocabularyNote: "识别会优先考虑简历、JD 与本关词汇；文字仍可在发送前编辑。",
      thinking: "面试官正在准备追问…",
    };
  return {
    round: "Interview round",
    decision: "Decision this interviewer owns",
    answerPattern: "Strong answer pattern",
    avoid: "Common red flags",
    prep: "Prepare before this round",
    resources: "Technical-round practice",
    resourcesIntro: "Selected for this interviewer. External sites have their own accounts, pricing, privacy, and terms.",
    vocabulary: "Speech vocabulary boost",
    vocabularyNote: "Recognition prioritizes terms from your resume, the job post, and this interview type. You can edit the transcript before sending.",
    thinking: "The interviewer is preparing a follow-up…",
  };
}

function interviewScheduleUiFor(locale: LocaleCode) {
  if (locale === "zh-TW")
    return {
      title: "補充面試資訊（可略過）",
      intro: "知道多少填多少；日期、時長與面試類型會讓練習題目更貼近實際情況。",
      date: "日期",
      time: "時間",
      duration: "長度",
      stage: "面試類型",
      minutes: "分鐘",
      estimated: "預估現場問題",
      prepare: "建議準備問題",
      likely: "高機率",
      probable: "可能追問",
      possible: "延伸準備",
      unscheduled: "尚未設定日期",
      methodology: "依面試時長、面試關卡、JD 必要條件、履歷證據與缺口排序；這是準備用估算，不代表雇主的實際題庫。",
    };
  if (locale === "zh-CN")
    return {
      title: "补充面试信息（可跳过）",
      intro: "知道多少填多少；日期、时长和面试类型会让练习题目更贴近实际情况。",
      date: "日期",
      time: "时间",
      duration: "时长",
      stage: "面试类型",
      minutes: "分钟",
      estimated: "预计现场问题",
      prepare: "建议准备问题",
      likely: "高概率",
      probable: "可能追问",
      possible: "延伸准备",
      unscheduled: "尚未设置日期",
      methodology: "按面试时长、面试关卡、JD 必要条件、简历证据与缺口排序；这是准备估算，不代表雇主的实际题库。",
    };
  return {
    title: "Tell us about the interview (optional)",
    intro: "Choose the date, length, and interview type. Skip anything you do not know.",
    date: "Date",
    time: "Time",
    duration: "Length",
    stage: "Interview type",
    minutes: "minutes",
    estimated: "Likely questions in the interview",
    prepare: "Questions we will prepare",
    likely: "Most likely",
    probable: "Likely follow-up",
    possible: "Extended preparation",
    unscheduled: "Date not scheduled",
    methodology: "We use the job post, your resume, the interview type, and the time available. This is a practice plan—not the employer’s exact question list.",
  };
}

function localizedInterviewStageLabel(
  locale: LocaleCode,
  stage: InterviewStageConfig,
) {
  const labels: Partial<Record<LocaleCode, Record<InterviewStageId, string>>> = {
    "zh-TW": {
      "recruiter-screen": "招募顧問或 HR 初談",
      "hiring-manager": "用人主管面試",
      technical: "技術面試",
      "case-portfolio": "案例或作品集面試",
      panel: "綜合面試小組",
      "final-executive": "最終或高階主管面試",
    },
    "zh-CN": {
      "recruiter-screen": "招聘顾问或 HR 初筛",
      "hiring-manager": "招聘经理面试",
      technical: "技术面试",
      "case-portfolio": "案例或作品集面试",
      panel: "综合面试小组",
      "final-executive": "最终或高管面试",
    },
  };
  return labels[locale]?.[stage.id] || stage.label;
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
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewDuration, setInterviewDuration] = useState(45);
  const [interviewStage, setInterviewStage] =
    useState<InterviewStageId>("hiring-manager");
  const [exampleLoaded, setExampleLoaded] = useState(false);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
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
  const [interviewTopicIndex, setInterviewTopicIndex] = useState(0);
  const [autoReadInterviewQuestions, setAutoReadInterviewQuestions] =
    useState(false);
  const [interviewScores, setInterviewScores] =
    useState<InterviewScore | null>(null);
  const [interviewThinking, setInterviewThinking] = useState(false);
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
  const copy = copyFor(locale);
  const detail = detailFor(locale);
  const accountLabels = accountCopyFor(locale);
  const openSourceLabel = openSourceLabelFor(locale);
  const interview = interviewCopyFor(locale);
  const interviewFlow = interviewFlowCopyFor(locale);
  const interviewStudioUi = interviewStudioUiFor(locale);
  const interviewScheduleUi = interviewScheduleUiFor(locale);
  const faq = faqCopyFor(locale);
  const scoring = scoringGuideFor(locale);
  const selectedProvider =
    PROVIDERS.find((item) => item.id === provider) || PROVIDERS[0];
  const preferencesLoaded = useRef(false);
  const speechRecognitionRef = useRef<{
    start: () => void;
    stop: () => void;
  } | null>(null);
  const keepListeningRef = useRef(false);
  const interviewLocaleRef = useRef(locale);
  const lastFinalSpeechRef = useRef({ text: "", at: 0 });
  const speechRestartCountRef = useRef(0);
  const speechVocabulary = useMemo(
    () => speechVocabularyFor(jd, resume, matches, interviewPersona),
    [interviewPersona, jd, matches, resume],
  );

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
            version?: number;
            persona?: InterviewPersonaId;
            mode?: InterviewMode;
            messages?: ChatMessage[];
            turn?: number;
            topicIndex?: number;
            autoRead?: boolean;
            scores?: InterviewScore | null;
            locale?: LocaleCode;
          };
          if (INTERVIEW_PERSONAS.some((item) => item.id === session.persona))
            setInterviewPersona(session.persona as InterviewPersonaId);
          if (session.mode === "Coaching" || session.mode === "Realistic")
            setInterviewMode(session.mode);
          if (
            session.version === 2 &&
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
            if (Number.isInteger(session.topicIndex))
              setInterviewTopicIndex(Math.max(0, session.topicIndex || 0));
            if (typeof session.autoRead === "boolean")
              setAutoReadInterviewQuestions(session.autoRead);
            if (session.scores) setInterviewScores(session.scores);
          } else {
            window.localStorage.removeItem("aptograph-interview-session");
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
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
    keepListeningRef.current = false;
    speechRecognitionRef.current?.stop();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (interviewLocaleRef.current !== locale) {
      setInterviewMessages([]);
      setInterviewAnswer("");
      setInterviewTurn(0);
      setInterviewTopicIndex(0);
      setInterviewScores(null);
      setVoiceInterim("");
      setRecognitionConfidence(null);
      setIsListening(false);
      setIsSpeaking(false);
      setVoiceMessage(interviewFlowCopyFor(locale).languageLocked);
    }
    interviewLocaleRef.current = locale;
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
        version: 2,
        persona: interviewPersona,
        mode: interviewMode,
        messages: interviewMessages.slice(-12),
        turn: interviewTurn,
        topicIndex: interviewTopicIndex,
        autoRead: autoReadInterviewQuestions,
        scores: interviewScores,
        locale,
      }),
    );
  }, [
    autoReadInterviewQuestions,
    interviewMessages,
    interviewMode,
    interviewPersona,
    interviewScores,
    interviewTopicIndex,
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

  useEffect(() => {
    if (!walkthroughOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setWalkthroughOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [walkthroughOpen]);

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

  function loadProofPackExample(openAfterLoading = false) {
    const exampleDate = new Date();
    exampleDate.setDate(exampleDate.getDate() + 7);
    const dateValue = [
      exampleDate.getFullYear(),
      String(exampleDate.getMonth() + 1).padStart(2, "0"),
      String(exampleDate.getDate()).padStart(2, "0"),
    ].join("-");
    setJd(SAMPLE_JD);
    setResume(SAMPLE_RESUME);
    setInterviewDate(dateValue);
    setInterviewTime("10:00");
    setInterviewDuration(45);
    setInterviewStage("hiring-manager");
    setMatches(runMatch(SAMPLE_JD, SAMPLE_RESUME));
    setExampleLoaded(true);
    if (openAfterLoading) openWorkspace("Analyze");
  }

  const strongCount = matches.filter(
    (item) => item.status === "Strong evidence",
  ).length;
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
    const prompt = `You are InterviewThread, an evidence-grounded career coach. Compare the resume evidence with the job description. Never invent experience. Return concise plain text with exactly three headings: BEST STORY, PROOF TO QUOTE, GAPS TO ADDRESS.\n\nJOB DESCRIPTION\n${jd.slice(0, 10_000)}\n\nRESUME EVIDENCE\n${resume.slice(0, 10_000)}`;
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
        new Notification("InterviewThread Story Signal", {
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
          `You are InterviewThread, an evidence-grounded career copilot. Answer the user's question in ${LANGUAGES.find(([code]) => code === locale)?.[1] || "English"}. Never invent experience. Ground the answer in the resume and JD, clearly label any gap, and give wording the candidate can truthfully say.\n\nQUESTION\n${userQuestion}\n\nJOB DESCRIPTION\n${jd.slice(0, 8_000)}\n\nRESUME EVIDENCE\n${resume.slice(0, 8_000)}`,
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
    const opening = questionForInterview(interviewPersona, 0, matches, locale, 0);
    setInterviewMessages([{ role: "assistant", content: opening }]);
    setInterviewTurn(0);
    setInterviewTopicIndex(0);
    setInterviewScores(null);
    setInterviewAnswer("");
    setVoiceMessage(interviewFlow.languageLocked);
    setVoiceInterim("");
    setRecognitionConfidence(null);
    setIsListening(false);
    setIsSpeaking(false);
  }

  function nextInterviewCoordinates(forceNewTopic = false) {
    if (forceNewTopic || interviewTurn >= INTERVIEW_DEPTH_COUNT - 1) {
      const topicCount = interviewTopicsFor(matches, locale).length;
      return {
        turn: 0,
        topicIndex: (interviewTopicIndex + 1) % topicCount,
      };
    }
    return { turn: interviewTurn + 1, topicIndex: interviewTopicIndex };
  }

  function addNextInterviewQuestion(forceNewTopic = false) {
    if (!interviewMessages.length) {
      startInterview();
      return;
    }
    keepListeningRef.current = false;
    speechRecognitionRef.current?.stop();
    const next = nextInterviewCoordinates(forceNewTopic);
    const nextQuestion = questionForInterview(
      interviewPersona,
      next.turn,
      matches,
      locale,
      next.topicIndex,
    );
    setInterviewMessages((current) => [
      ...current,
      { role: "assistant", content: nextQuestion },
    ]);
    setInterviewTurn(next.turn);
    setInterviewTopicIndex(next.topicIndex);
    setInterviewAnswer("");
    setVoiceInterim("");
    setRecognitionConfidence(null);
    setIsListening(false);
    if (autoReadInterviewQuestions)
      window.setTimeout(() => void speakInterviewQuestion(nextQuestion), 0);
  }

  async function modelInterviewFollowUp(
    answer: string,
    next: { turn: number; topicIndex: number },
    fallbackQuestion: string,
  ) {
    if (
      selectedProvider.kind === "built-in" ||
      !modelEndpoint.trim() ||
      !modelName.trim()
    )
      return fallbackQuestion;
    const persona =
      INTERVIEW_PERSONAS.find((item) => item.id === interviewPersona) ||
      INTERVIEW_PERSONAS[0];
    const topic = interviewTopicsFor(matches, locale)[next.topicIndex];
    const priorQuestions = interviewMessages
      .filter((message) => message.role === "assistant")
      .map((message) => questionOnly(message.content))
      .slice(-5)
      .join("\n- ");
    const language =
      LANGUAGES.find(([code]) => code === locale)?.[1] || "English";
    const prompt = `Act as a real ${persona.label}, not a coach and not an AI assistant. Your hiring decision is: ${persona.decision}\nYour focus: ${persona.focus}\nYour pressure style: ${persona.pressure}\n\nAsk exactly ONE concise, natural follow-up question in ${language}. Refer to a specific detail from the candidate's latest answer. Probe the weakest missing evidence from this role's perspective. Do not praise, summarize, score, give advice, use headings, say "as an AI", or invent facts. Do not repeat any earlier question. Keep the question under 34 words when the language uses spaces.\n\nLATEST ANSWER\n${answer.slice(0, 3_500)}\n\nCURRENT TOPIC\n${topic?.focusLabel || "role evidence"}\n\nEARLIER QUESTIONS\n- ${priorQuestions || "None"}\n\nJOB DESCRIPTION\n${jd.slice(0, 5_000)}\n\nRESUME EVIDENCE\n${resume.slice(0, 5_000)}`;
    const response = await requestConfiguredModel(prompt);
    const naturalQuestion = response
      .replace(/^(?:question|follow-up|interviewer)\s*:\s*/i, "")
      .replace(/^["“]|["”]$/g, "")
      .trim();
    if (!naturalQuestion || /as an ai/i.test(naturalQuestion))
      return fallbackQuestion;
    const topicLabel = interviewFlowCopyFor(locale).topic;
    return `${topicLabel} ${next.topicIndex + 1} · ${topic?.focusLabel || "Role evidence"}\n\n${naturalQuestion.slice(0, 500)}`;
  }

  async function submitInterviewAnswer(event: FormEvent) {
    event.preventDefault();
    const answer = interviewAnswer.trim();
    if (!answer || !interviewMessages.length || interviewThinking) return;
    keepListeningRef.current = false;
    speechRecognitionRef.current?.stop();
    const scores = scoreInterviewAnswer(answer, matches);
    const next = nextInterviewCoordinates();
    const fallbackQuestion = questionForInterview(
      interviewPersona,
      next.turn,
      matches,
      locale,
      next.topicIndex,
      answer,
    );
    const feedback = interviewFeedback(scores, interview, interviewMode);
    setInterviewMessages((current) => [
      ...current,
      { role: "user", content: answer },
    ]);
    setInterviewScores(scores);
    setInterviewTurn(next.turn);
    setInterviewTopicIndex(next.topicIndex);
    setInterviewAnswer("");
    setVoiceMessage("");
    setVoiceInterim("");
    setRecognitionConfidence(null);
    setIsListening(false);
    setInterviewThinking(true);
    let nextQuestion = fallbackQuestion;
    try {
      nextQuestion = await modelInterviewFollowUp(
        answer,
        next,
        fallbackQuestion,
      );
    } catch {
      nextQuestion = fallbackQuestion;
    } finally {
      setInterviewThinking(false);
    }
    setInterviewMessages((current) => [
      ...current,
      {
        role: "assistant",
        content:
          interviewMode === "Coaching"
            ? `${feedback}\n\n${nextQuestion}`
            : nextQuestion,
      },
    ]);
    if (autoReadInterviewQuestions)
      window.setTimeout(() => void speakInterviewQuestion(nextQuestion), 0);
  }

  async function speakInterviewQuestion(content: string) {
    if (!("speechSynthesis" in window)) {
      setVoiceMessage(interview.unavailable);
      return;
    }
    const speechLocale = speechLocaleFor(locale);
    const utterance = new SpeechSynthesisUtterance(
      pronunciationTextFor(content, locale),
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
      `${interviewFlow.languageLocked} ${interview.speechLanguage}: ${speechLocale}${voice ? ` · ${voice.name}` : " · system voice"}`,
    );
  }

  async function speakLatestInterviewQuestion() {
    if (!interviewMessages.length) {
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
    if (latest) await speakInterviewQuestion(questionOnly(latest.content));
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
      phrases?: Array<{ phrase: string; boost?: number }>;
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
    type RecognitionPhraseConstructor = new (
      phrase: string,
      boost?: number,
    ) => { phrase: string; boost?: number };
    const voiceWindow = window as typeof window & {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
      SpeechRecognitionPhrase?: RecognitionPhraseConstructor;
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
    recognition.maxAlternatives = 5;
    const Phrase = voiceWindow.SpeechRecognitionPhrase;
    if (Phrase) {
      try {
        recognition.phrases = speechVocabulary
          .slice(0, 30)
          .map((phrase) => new Phrase(phrase, 7));
      } catch {
        // Contextual phrase bias is progressive enhancement.
      }
    }
    recognition.onresult = (event) => {
      const finalSegments: string[] = [];
      const interimSegments: string[] = [];
      const confidences: number[] = [];
      const startIndex = event.resultIndex || 0;
      for (let index = startIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const alternatives = Array.from(result).sort(
          (left, right) =>
            recognitionAlternativeScore(right, speechVocabulary) -
            recognitionAlternativeScore(left, speechVocabulary),
        );
        const best = alternatives[0];
        const transcript = best?.transcript
          ? normalizeSpeechTranscript(best.transcript, speechVocabulary)
          : "";
        if (!transcript) continue;
        if (typeof best.confidence === "number" && best.confidence > 0)
          confidences.push(best.confidence);
        if (result.isFinal) finalSegments.push(transcript);
        else interimSegments.push(transcript);
      }
      const finalText = finalSegments.join(
        ["zh-CN", "zh-TW", "ja", "th"].includes(locale) ? "" : " ",
      );
      if (finalText) {
        const now = Date.now();
        const fingerprint = finalText.toLocaleLowerCase().replace(/\s+/g, " ");
        if (
          fingerprint !== lastFinalSpeechRef.current.text ||
          now - lastFinalSpeechRef.current.at > 4_000
        ) {
          setInterviewAnswer((current) =>
            appendTranscript(current, finalText, locale),
          );
          lastFinalSpeechRef.current = { text: fingerprint, at: now };
        }
        speechRestartCountRef.current = 0;
      }
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
        const delay = Math.min(
          1_500,
          200 + speechRestartCountRef.current * 180,
        );
        speechRestartCountRef.current += 1;
        window.setTimeout(() => {
          if (!keepListeningRef.current) return;
          try {
            recognition.start();
          } catch {
            keepListeningRef.current = false;
            setIsListening(false);
          }
        }, delay);
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
    lastFinalSpeechRef.current = { text: "", at: 0 };
    speechRestartCountRef.current = 0;
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
    {
      id: "Analyze",
      label: locale === "en" ? "Interview plan" : copy.analyze,
      description:
        locale === "en"
          ? "Resume + job post → proof, gaps, stories, and practice questions"
          : detail.compare,
    },
    {
      id: "Interview Studio",
      label: locale === "en" ? "Mock Interview" : copy.interview,
      description: interview.title,
    },
  ];
  const supportViews: {
    id: WorkspaceView;
    label: string;
    description: string;
  }[] = [
    {
      id: "Recommendations",
      label: copy.recommendations,
      description: detail.recommendationsTitle,
    },
    { id: "Tracker", label: copy.tracker, description: detail.trackerTitle },
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
      : flowIndex === -1
        ? flowViews[0]
        : null;
  const nextView =
    flowIndex >= 0 && flowIndex < flowViews.length - 1
      ? flowViews[flowIndex + 1]
      : active === "Interview Studio"
        ? flowViews[0]
        : flowViews[1];
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
        ? "Open-source and free. AI can prepare a tailored draft and queue next steps, but you must approve every submission."
        : "Open-source and free. Nothing is submitted automatically in this public version. A future release will require approved employer APIs, consent, rate limits, an audit log, and an emergency stop.");
  const modeContext = MODE_CONTEXT[locale] || MODE_CONTEXT.en;
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
  const selectedInterviewResources = TECHNICAL_RESOURCES.filter((resource) =>
    resource.tags.some((tag) =>
      selectedInterviewPersonaBase.resourceTags.includes(tag),
    ),
  ).slice(0, 5);
  const interviewProofs = matches.filter(
    (item) =>
      item.status !== "Gap" && item.evidence !== "No source evidence found.",
  );
  const interviewGaps = matches.filter((item) => item.status === "Gap");
  const interviewTopics = interviewTopicsFor(matches, locale);
  const currentInterviewTopic =
    interviewTopics[interviewTopicIndex % interviewTopics.length];
  const nextInterviewTopic =
    interviewTopics[(interviewTopicIndex + 1) % interviewTopics.length];
  const nextInterviewStage =
    interviewFlow.stages[
      interviewTurn >= INTERVIEW_DEPTH_COUNT - 1 ? 0 : interviewTurn + 1
    ];
  const interviewProof =
    interviewProofs.find(
      (item) => item.keyword === currentInterviewTopic.proofLabel,
    ) || firstEvidence(matches);
  const interviewGap = interviewGaps.find(
    (item) => item.keyword === currentInterviewTopic.gapLabel,
  );
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
  const landingTitle =
    locale === "en"
      ? "Practice the interview for the job you want."
      : copy.heroTitle;
  const landingSubtitle =
    locale === "en"
      ? "Upload your resume and the job description. Get truthful stories, realistic questions, and role-specific feedback—without made-up achievements."
      : copy.heroBody;
  const landingPrimaryCta =
    locale === "en" ? "Start my free mock interview" : detail.runMatch;
  const landingSecondaryCta = walkthroughLabelFor(locale);
  const analysisCta =
    locale === "en"
      ? exampleLoaded
        ? "Show this example"
        : "Create my interview plan"
      : landingPrimaryCta;
  const proofPackFlow =
    locale === "en"
      ? [
          "Upload your resume",
          "Add the job post",
          "Get your interview plan",
          "Practice with AI",
        ]
      : [
          `${detail.resumeEvidence} + ${detail.jobDescription}`,
          detail.matrix,
          `3 · ${detail.bestStory}`,
          copy.interview,
        ];
  const strongestProofs = matches
    .filter(
      (item) =>
        item.status !== "Gap" && item.evidence !== "No source evidence found.",
    )
    .sort((a, b) => {
      const rank = { "Strong evidence": 2, "Partial evidence": 1, Gap: 0 };
      return rank[b.status] - rank[a.status];
    })
    .slice(0, 3);
  const realGaps = matches
    .filter((item) => item.status === "Gap")
    .slice(0, 3);
  const defensibleStories = strongestProofs.slice(0, 5);
  const selectedInterviewStage =
    INTERVIEW_STAGE_CONFIGS.find((item) => item.id === interviewStage) ||
    INTERVIEW_STAGE_CONFIGS[1];
  const estimatedLiveQuestionCount = Math.max(
    4,
    Math.round(interviewDuration / 5) + 1,
  );
  const predictedPreparationCount = Math.min(
    30,
    Math.max(12, estimatedLiveQuestionCount * 2),
  );
  const likelyInterviewQuestions = (() => {
    const questions: Array<{
      persona: string;
      likelihood: string;
      question: string;
    }> = [];
    const seen = new Set<string>();
    const attempts = predictedPreparationCount * 4;
    for (let index = 0; index < attempts; index += 1) {
      const personaIndex =
        Math.floor(index / INTERVIEW_DEPTH_COUNT) %
        selectedInterviewStage.personas.length;
      const personaId = selectedInterviewStage.personas[personaIndex];
      const turn = index % INTERVIEW_DEPTH_COUNT;
      const topicIndex = Math.floor(
        index /
          (INTERVIEW_DEPTH_COUNT * selectedInterviewStage.personas.length),
      );
      const question = questionOnly(
        questionForInterview(
          personaId,
          turn,
          matches,
          locale,
          topicIndex,
        ),
      );
      const fingerprint = `${personaId}:${question.toLocaleLowerCase()}`;
      if (seen.has(fingerprint)) continue;
      seen.add(fingerprint);
      const persona =
        INTERVIEW_PERSONAS.find((item) => item.id === personaId) ||
        INTERVIEW_PERSONAS[0];
      const rank = questions.length;
      questions.push({
        persona: localizedPersonaLabel(locale, persona.id, persona.label),
        likelihood:
          rank < estimatedLiveQuestionCount
            ? interviewScheduleUi.likely
            : rank < estimatedLiveQuestionCount * 2
              ? interviewScheduleUi.probable
              : interviewScheduleUi.possible,
        question,
      });
      if (questions.length >= predictedPreparationCount) break;
    }
    return questions;
  })();
  const scheduledInterviewLabel = interviewDate
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        ...(interviewTime ? { timeStyle: "short" as const } : {}),
      }).format(
        new Date(`${interviewDate}T${interviewTime || "12:00"}:00`),
      )
    : interviewScheduleUi.unscheduled;
  const interviewTimingSummary = `${scheduledInterviewLabel} · ${localizedInterviewStageLabel(locale, selectedInterviewStage)} · ${interviewDuration} ${interviewScheduleUi.minutes}`;
  const prepPlan = [
    { time: "0–5", label: proofPackFlow[1] },
    { time: "5–15", label: proofPackFlow[2] },
    { time: "15–25", label: proofPackFlow[3] },
    {
      time: "25–30",
      label: locale === "en" ? "Gap review and final notes" : detail.evidenceCoverage,
    },
  ];
  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }).replace(/</g, "\\u003c");

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="InterviewThread home">
          <BrandMark />
          <span>
            InterviewThread <small>{brandTaglineFor(locale)}</small>
          </span>
        </a>
        <nav className="topnav" aria-label="Primary navigation">
          <a href="#product">
            {locale === "en" ? "How it works" : detail.product}
          </a>
          <a
            href="#workspace"
            onClick={(event) => {
              event.preventDefault();
              openWorkspace("Analyze");
            }}
          >
            {locale === "en" ? "Start practicing" : detail.workspace}
          </a>
          <a href="#questions">{locale === "en" ? "FAQ" : faq.eyebrow}</a>
          <a href="#plans">{openSourceLabel}</a>
        </nav>
        <label className="locale-control">
          <span>{copy.language}</span>
          <select
            aria-label={copy.language}
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
        <a
          className="account-link"
          href={localizedPath(locale, "account")}
        >
          {accountLabels.account}
        </a>
        <MobileNav
          label={detail.product}
          items={[
            {
              label: locale === "en" ? "How it works" : detail.product,
              href: "#product",
            },
            {
              label:
                locale === "en" ? "Start practicing" : detail.workspace,
              href: `${localizedPath(locale)}?view=Analyze#workspace`,
            },
            { label: locale === "en" ? "FAQ" : faq.eyebrow, href: "#questions" },
            { label: openSourceLabel, href: "#plans" },
            {
              label: accountLabels.account,
              href: localizedPath(locale, "account"),
            },
            {
              label: "GitHub",
              href: "https://github.com/weiyu1029/careerproof-agent",
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
        {landingPrimaryCta}
      </a>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">
            {locale === "en" ? "Free AI mock interview practice" : detail.evidenceWorkspace}
          </p>
          <h1>{landingTitle}</h1>
          <p className="lede">{landingSubtitle}</p>
          <div className="hero-actions">
            <a
              className="button primary hero-primary-action"
              href="#workspace"
              onClick={(event) => {
                event.preventDefault();
                openWorkspace("Analyze");
              }}
            >
              {landingPrimaryCta}
            </a>
            <button
              className="button secondary"
              type="button"
              onClick={() => setWalkthroughOpen(true)}
            >
              {landingSecondaryCta}
            </button>
          </div>
          <ol className="journey-strip" aria-label={landingPrimaryCta}>
            {proofPackFlow.map((item, index) => (
              <li key={item}>
                <span>{index + 1}</span>
                <b>{item}</b>
              </li>
            ))}
          </ol>
          <div className="trust-row">
            <span>
              {locale === "en"
                ? "Every suggestion links back to your evidence"
                : detail.evidenceLinked}
            </span>
            <span>{detail.privateTitle}</span>
            <span>
              {locale === "en" ? "No invented achievements" : detail.matchedEvidence}
            </span>
          </div>
        </div>
      </section>

      {walkthroughOpen && (
        <div
          className="walkthrough-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setWalkthroughOpen(false);
          }}
        >
          <section
            className="walkthrough-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="walkthrough-title"
          >
            <button
              className="walkthrough-close"
              type="button"
              aria-label="Close 60-second walkthrough"
              onClick={() => setWalkthroughOpen(false)}
            >
              ×
            </button>
            <div className="walkthrough-heading">
              <p className="eyebrow">{landingSecondaryCta}</p>
              <h2 id="walkthrough-title">
                {locale === "en"
                  ? "From two documents to confident interview practice"
                  : landingTitle}
              </h2>
              <p>{landingSubtitle}</p>
            </div>
            <video
              className="walkthrough-video"
              controls
              autoPlay
              playsInline
              preload="metadata"
              poster="/interviewthread-walkthrough-poster.png"
            >
              <source
                src="/interviewthread-60-second-walkthrough.mp4"
                type="video/mp4"
              />
              <track
                kind="captions"
                src="/interviewthread-walkthrough-en.vtt"
                srcLang="en"
                label="English"
                default
              />
              Your browser does not support HTML video.
            </video>
            <ol className="walkthrough-steps" aria-label={landingSecondaryCta}>
              {proofPackFlow.map((item, index) => (
                <li key={item}>
                  <span>{index + 1}</span>
                  <b>{item}</b>
                </li>
              ))}
            </ol>
            <button
              className="button primary walkthrough-start"
              type="button"
              onClick={() => {
                setWalkthroughOpen(false);
                openWorkspace("Analyze");
              }}
            >
              {landingPrimaryCta}
            </button>
          </section>
        </div>
      )}

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
                  ? "Guest work stays on this device. Accounts can support free history and collaboration without changing the open-source license."
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
                onClick={() => loadProofPackExample(true)}
              >
                {detail.sample}
              </button>
            </div>
          )}
          {active === "Analyze" && (
            <>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    {locale === "en"
                      ? exampleLoaded
                        ? "For example"
                        : "Start here"
                      : detail.evidenceWorkspace}
                  </p>
                  <h2>
                    {locale === "en"
                      ? exampleLoaded
                        ? "See how one resume becomes interview practice"
                        : "Add your resume and the job post"
                      : detail.compare}
                  </h2>
                  <p>
                    {locale === "en"
                      ? exampleLoaded
                        ? "This is sample data, not your information. We show what the candidate can prove, what is still missing, and which answer they should practice next."
                        : "That is all we need. Interview details are optional, and we never add experience you did not provide."
                      : copy.heroBody}
                  </p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => loadProofPackExample()}
                >
                  {locale === "en" ? "Try a filled-in example" : detail.sample}
                </button>
              </div>
              {exampleLoaded && locale === "en" && (
                <aside className="example-tour" role="note">
                  <div className="example-tour-heading">
                    <span>For example</span>
                    <div>
                      <b>Product Analyst applying to a new role</b>
                      <p>
                        One sample resume and one sample job description become a
                        clear, truthful interview plan.
                      </p>
                    </div>
                  </div>
                  <div className="example-value-strip" aria-label="Example result preview">
                    <div>
                      <span>1 · The job asks for</span>
                      <b>SQL, dashboards, experiments, and KPI ownership</b>
                    </div>
                    <div>
                      <span>2 · The resume proves</span>
                      <b>SQL dashboards and 30% less preparation time</b>
                    </div>
                    <div>
                      <span>3 · The real gaps</span>
                      <b>Experiments, Python, and KPI ownership are not proven yet</b>
                    </div>
                    <div>
                      <span>4 · Practice this story</span>
                      <b>How the candidate automated a weekly validation workflow</b>
                    </div>
                  </div>
                </aside>
              )}
              <ol className="workspace-progress" aria-label={landingPrimaryCta}>
                {proofPackFlow.map((item, index) => {
                  const inputsReady = Boolean(resume.trim() && jd.trim());
                  const className =
                    index === 0
                      ? inputsReady
                        ? "complete"
                        : "current"
                      : index < 3 && matches.length
                        ? "complete"
                        : index === 1 && inputsReady
                          ? "current"
                          : index === 3 && matches.length
                            ? "current"
                            : "";
                  return (
                    <li className={className} key={item}>
                      <span>{index + 1}</span>
                      <b>{item}</b>
                    </li>
                  );
                })}
              </ol>
              <div className="input-grid">
                <div className="document-field guided-card">
                  <div className="guided-card-heading">
                    <span>1</span>
                    <label htmlFor="resume-text">
                      {locale === "en"
                        ? exampleLoaded
                          ? "For example: what this candidate has actually done"
                          : "Add your resume"
                        : detail.resumeEvidence}
                    </label>
                    {resume.trim() && (
                      <small>
                        {locale === "en"
                          ? exampleLoaded
                            ? "Example"
                            : "Ready"
                          : detail.checked}
                      </small>
                    )}
                  </div>
                  {locale === "en" && (
                    <p className="guided-card-explainer">
                      {exampleLoaded
                        ? "The product only uses experience it can find in this text."
                        : "Upload a file or paste your resume. We only use the experience you provide."}
                    </p>
                  )}
                  <textarea
                    id="resume-text"
                    value={resume}
                    onChange={(event) => {
                      setResume(event.target.value);
                      setExampleLoaded(false);
                    }}
                    placeholder={detail.resumeEvidence}
                  />
                  <label className="upload-control" htmlFor="resume-file">
                    <input
                      id="resume-file"
                      type="file"
                      accept="*/*"
                      multiple
                      onChange={(event) => {
                        setExampleLoaded(false);
                        loadFile(event, "resume");
                      }}
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
                    <label htmlFor="jd-text">
                      {locale === "en"
                        ? exampleLoaded
                          ? "For example: what this employer is looking for"
                          : "Add the job post"
                        : detail.jobDescription}
                    </label>
                    {jd.trim() && (
                      <small>
                        {locale === "en"
                          ? exampleLoaded
                            ? "Example"
                            : "Ready"
                          : detail.checked}
                      </small>
                    )}
                  </div>
                  {locale === "en" && (
                    <p className="guided-card-explainer">
                      {exampleLoaded
                        ? "We turn these requirements into strengths, gaps, stories, and interview questions."
                        : "Upload or paste the full job post so the practice matches this role."}
                    </p>
                  )}
                  <textarea
                    id="jd-text"
                    value={jd}
                    onChange={(event) => {
                      setJd(event.target.value);
                      setExampleLoaded(false);
                    }}
                    placeholder={detail.jobDescription}
                  />
                  <label className="upload-control" htmlFor="jd-file">
                    <input
                      id="jd-file"
                      type="file"
                      accept="*/*"
                      multiple
                      onChange={(event) => {
                        setExampleLoaded(false);
                        loadFile(event, "jd");
                      }}
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
              <fieldset className="proof-context-field interview-schedule-field">
                <legend>{interviewScheduleUi.title}</legend>
                <p>{interviewScheduleUi.intro}</p>
                <div className="interview-schedule-grid">
                  <label>
                    <span>{interviewScheduleUi.date}</span>
                    <input
                      type="date"
                      value={interviewDate}
                      onChange={(event) => setInterviewDate(event.target.value)}
                    />
                  </label>
                  <label>
                    <span>{interviewScheduleUi.time}</span>
                    <input
                      type="time"
                      value={interviewTime}
                      onChange={(event) => setInterviewTime(event.target.value)}
                    />
                  </label>
                  <label>
                    <span>{interviewScheduleUi.duration}</span>
                    <select
                      value={interviewDuration}
                      onChange={(event) =>
                        setInterviewDuration(Number(event.target.value))
                      }
                    >
                      {[15, 30, 45, 60, 90].map((minutes) => (
                        <option value={minutes} key={minutes}>
                          {minutes} {interviewScheduleUi.minutes}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>{interviewScheduleUi.stage}</span>
                    <select
                      value={interviewStage}
                      onChange={(event) =>
                        setInterviewStage(event.target.value as InterviewStageId)
                      }
                    >
                      {INTERVIEW_STAGE_CONFIGS.map((stage) => (
                        <option value={stage.id} key={stage.id}>
                          {localizedInterviewStageLabel(locale, stage)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="interview-schedule-estimate" role="status">
                  <span>{interviewTimingSummary}</span>
                  <b>
                    {interviewScheduleUi.estimated}: {estimatedLiveQuestionCount}
                  </b>
                  <b>
                    {interviewScheduleUi.prepare}: {predictedPreparationCount}
                  </b>
                </div>
              </fieldset>
              {uploadMessage && (
                <p className="notice" role="status">
                  {uploadMessage}
                </p>
              )}
              <div className="analysis-primary-action">
                <div>
                  <span>3</span>
                  <b>
                    {analysisCta}
                  </b>
                  <small>
                    {locale === "en"
                      ? exampleLoaded
                        ? "See the matches, missing proof, practice stories, and likely questions"
                        : "See what matches, what is missing, and what to practice"
                      : detail.matrix}
                  </small>
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
                  {modelRunning
                    ? locale === "en"
                      ? "Building your plan…"
                      : "Running…"
                    : analysisCta}
                </button>
              </div>
              <details className="advanced-settings">
                <summary>
                  {locale === "en" ? "Optional: use your own AI model" : detail.aiModel}
                </summary>
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
                    The basic match runs on this device. Connect a model only if
                    you want extra story coaching.
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
              {matches.length > 0 && (
              <div className="results-card" id="analysis-results">
                <details className="scoring-details">
                  <summary>
                    {locale === "en" ? "How this score works" : scoring.eyebrow}
                  </summary>
                <section className="scoring-guide" aria-labelledby="scoring-guide-title">
                  <div className="scoring-guide-heading">
                    <div>
                      <p className="eyebrow">{scoring.eyebrow}</p>
                      <h3 id="scoring-guide-title">{scoring.title}</h3>
                      <p>{scoring.intro}</p>
                    </div>
                    <div className="coverage-score">
                      <span>{scoring.overall}</span>
                      <strong>{matches.length ? scoreMatches(matches) : "—"}</strong>
                      <small>/100</small>
                    </div>
                  </div>
                  <div className="score-band-grid">
                    <article className="strong">
                      <span>80–100</span>
                      <b>{scoring.strong}</b>
                      <p>{scoring.strongRule}</p>
                    </article>
                    <article className="partial">
                      <span>45–79</span>
                      <b>{scoring.partial}</b>
                      <p>{scoring.partialRule}</p>
                    </article>
                    <article className="gap">
                      <span>0–44</span>
                      <b>{scoring.gap}</b>
                      <p>{scoring.gapRule}</p>
                    </article>
                  </div>
                  <div className="priority-weights" aria-label={scoring.priority}>
                    <span>{scoring.priorityLabels.Required}</span>
                    <span>{scoring.priorityLabels.Core}</span>
                    <span>{scoring.priorityLabels.Preferred}</span>
                  </div>
                  <p className="score-formula">{scoring.formula}</p>
                </section>
                </details>
                <div className="results-title">
                  <h3>
                    {locale === "en"
                      ? "What the job asks for—and what your resume proves"
                      : detail.matrix}
                  </h3>
                  <span>
                    {locale === "en"
                      ? `${matches.length} job requirements checked`
                      : `${matches.length} ${detail.signalsReviewed}`}
                  </span>
                </div>
                <div className="keyword-table">
                  <div className="keyword-table-header" aria-hidden="true">
                    <span>{locale === "en" ? "Job requirement and your proof" : scoring.keywordEvidence}</span>
                    <span>{locale === "en" ? "Match" : scoring.score}</span>
                    <span>{locale === "en" ? "Importance" : scoring.priority}</span>
                    <span>{locale === "en" ? "Result" : scoring.classification}</span>
                  </div>
                  {matches.map((item) => (
                      <div className="keyword-row detailed" key={item.keyword}>
                        <div>
                          <b>{item.keyword}</b>
                          <small>{item.evidence}</small>
                        </div>
                        <span className="keyword-score">{item.score}/100</span>
                        <span>{scoring.priorityLabels[item.priority]}</span>
                        <span
                          className={item.status === "Gap" ? "gap" : "evidence"}
                        >
                          {scoring.statusLabels[item.status]}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
              )}
              {matches.length > 0 && (
                <section className="interview-proof-pack" aria-labelledby="proof-pack-title">
                  <div className="proof-pack-result-heading">
                    <div>
                      <p className="eyebrow">
                        {locale === "en" ? "Your result" : detail.results}
                      </p>
                      <h3 id="proof-pack-title">
                        {locale === "en" ? "Your interview prep plan" : detail.results}
                      </h3>
                    </div>
                    <span>{interviewTimingSummary}</span>
                  </div>
                  <div className="proof-pack-result-grid">
                    <article>
                      <div className="proof-pack-result-label">
                        <span>01</span>
                        <h4>
                          {locale === "en"
                            ? "What you can prove"
                            : detail.matchedEvidence}
                        </h4>
                      </div>
                      {strongestProofs.length ? (
                        <ol>
                          {strongestProofs.map((item) => (
                            <li key={item.keyword}>
                              <b>{item.keyword}</b>
                              <p>{item.evidence}</p>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="proof-pack-empty">
                          {locale === "en"
                            ? "No supporting experience was found yet. Add more detail to your resume rather than inventing a claim."
                            : detail.evidenceCoverage}
                        </p>
                      )}
                    </article>
                    <article>
                      <div className="proof-pack-result-label">
                        <span>02</span>
                        <h4>
                          {locale === "en" ? "What is missing" : detail.evidenceCoverage}
                        </h4>
                      </div>
                      {realGaps.length ? (
                        <ol>
                          {realGaps.map((item) => (
                            <li key={item.keyword}>
                              <b>{item.keyword}</b>
                              <p>
                                {locale === "en"
                                  ? "The job post asks for this, but the resume does not provide supporting experience."
                                  : detail.sourcePolicy}
                              </p>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="proof-pack-empty">
                          {locale === "en"
                            ? "Every requirement we found in this job post has some support in the resume."
                            : detail.checked}
                        </p>
                      )}
                    </article>
                    <article className="proof-pack-stories">
                      <div className="proof-pack-result-label">
                        <span>03</span>
                        <h4>
                          {locale === "en"
                            ? "Stories to practice"
                            : detail.bestStory}
                        </h4>
                      </div>
                      <ol>
                        {defensibleStories.map((item, index) => (
                          <li key={item.keyword}>
                            <b>
                              {locale === "en" ? `Story ${index + 1}` : `${index + 1}`} ·{" "}
                              {item.keyword}
                            </b>
                            <p>{item.evidence}</p>
                            <small>
                              {locale === "en"
                                ? "Prepare the context, your decision, your action, and the measurable outcome."
                                : interview.storySpine}
                            </small>
                          </li>
                        ))}
                      </ol>
                    </article>
                    <article className="proof-pack-followups">
                      <div className="proof-pack-result-label">
                        <span>04</span>
                        <h4>
                          {likelyInterviewQuestions.length} {interviewScheduleUi.prepare.toLocaleLowerCase()}
                        </h4>
                      </div>
                      <ol>
                        {likelyInterviewQuestions.map((item, index) => (
                          <li key={`${item.persona}-${index}-${item.question}`}>
                            <span>{String(index + 1).padStart(2, "0")}</span>
                            <div>
                              <small>{item.likelihood}</small>
                              <b>{item.persona}</b>
                              <p>{item.question}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                      <p className="question-prediction-note">
                        {interviewScheduleUi.methodology}
                      </p>
                    </article>
                    <article className="proof-pack-plan">
                      <div className="proof-pack-result-label">
                        <span>05</span>
                        <h4>
                          {locale === "en"
                            ? `30-minute preparation for a ${interviewDuration}-minute interview`
                            : locale === "zh-TW"
                              ? `30 分鐘準備計畫 · ${interviewDuration} 分鐘面試`
                              : locale === "zh-CN"
                                ? `30 分钟准备计划 · ${interviewDuration} 分钟面试`
                            : detail.readiness}
                        </h4>
                      </div>
                      <ol>
                        {prepPlan.map((item) => (
                          <li key={item.time}>
                            <span>{item.time} min</span>
                            <b>{item.label}</b>
                          </li>
                        ))}
                      </ol>
                      <button
                        className="button primary"
                        type="button"
                        onClick={() => openWorkspace("Interview Studio")}
                      >
                        {locale === "en" ? "Start mock interview" : copy.interview}
                      </button>
                    </article>
                  </div>
                  <p className="proof-pack-integrity">
                    {locale === "en"
                      ? "Everything above comes from your resume and this job post. Missing proof stays visible instead of being invented."
                      : detail.sourcePolicy}
                  </p>
                </section>
              )}
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
                <span className="status-pill light">InterviewThread ProofLoop</span>
              </div>

              <div className="interview-setup">
                <label>
                  <span>{interview.role}</span>
                  <select
                    value={interviewPersona}
                    disabled={interviewThinking}
                    onChange={(event) => {
                      setInterviewPersona(
                        event.target.value as InterviewPersonaId,
                      );
                      setInterviewMessages([]);
                      setInterviewTurn(0);
                      setInterviewTopicIndex(0);
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
                          disabled={interviewThinking}
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
                  disabled={interviewThinking}
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

              <section
                className="interview-role-playbook"
                aria-labelledby="interview-role-playbook-title"
              >
                <div className="interview-role-playbook-heading">
                  <div>
                    <p className="eyebrow">{interviewStudioUi.round}</p>
                    <h3 id="interview-role-playbook-title">
                      {selectedInterviewPersona.round}
                    </h3>
                  </div>
                  <span className="status-pill light">
                    {selectedInterviewPersona.label}
                  </span>
                </div>
                <div className="interview-role-guide-grid">
                  <article>
                    <span>{interviewStudioUi.decision}</span>
                    <p>{selectedInterviewPersona.decision}</p>
                  </article>
                  <article>
                    <span>{interviewStudioUi.answerPattern}</span>
                    <p>{selectedInterviewPersona.answerPattern}</p>
                  </article>
                  <article className="warning">
                    <span>{interviewStudioUi.avoid}</span>
                    <p>{selectedInterviewPersona.redFlags}</p>
                  </article>
                </div>
                <div className="interview-prep-checklist">
                  <b>{interviewStudioUi.prep}</b>
                  <ul>
                    {selectedInterviewPersona.prepChecklist.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section
                className="technical-round-library"
                aria-labelledby="technical-round-library-title"
              >
                <div className="technical-round-library-heading">
                  <div>
                    <p className="eyebrow">{interviewStudioUi.resources}</p>
                    <h3 id="technical-round-library-title">
                      {selectedInterviewPersona.label}
                    </h3>
                  </div>
                  <p>{interviewStudioUi.resourcesIntro}</p>
                </div>
                <div className="technical-resource-grid">
                  {selectedInterviewResources.map((resource) => (
                    <a
                      className="technical-resource-card"
                      href={resource.href}
                      target="_blank"
                      rel="noreferrer"
                      key={resource.name}
                    >
                      <span>{resource.access}</span>
                      <b>{resource.name}</b>
                      <p>{resource.bestFor}</p>
                      <small>Open practice resource ↗</small>
                    </a>
                  ))}
                </div>
              </section>

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
                      disabled={!interviewMessages.length || interviewThinking}
                      aria-pressed={isSpeaking}
                    >
                      {isSpeaking ? interview.mute : interview.speak}
                    </button>
                  </div>
                  <div className="interview-progress-wrap">
                    <div className="interview-progress-heading">
                      <b>
                        {interviewFlow.topic}{" "}
                        {(interviewTopicIndex % interviewTopics.length) + 1} /{" "}
                        {interviewTopics.length} ·{" "}
                        {currentInterviewTopic.focusLabel}
                      </b>
                      <span>
                        {interviewFlow.step} {interviewTurn + 1} /{" "}
                        {INTERVIEW_DEPTH_COUNT}
                      </span>
                    </div>
                    <ol className="interview-progress" aria-label={interview.storySpine}>
                      {interviewFlow.stages.map((stage, index) => (
                        <li
                          className={
                            index === interviewTurn
                              ? "current"
                              : index < interviewTurn
                                ? "complete"
                                : ""
                          }
                          aria-current={index === interviewTurn ? "step" : undefined}
                          key={stage}
                        >
                          <i>{index + 1}</i>
                          <span>{stage}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="interview-question-controls">
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => addNextInterviewQuestion(false)}
                        disabled={!interviewMessages.length || interviewThinking}
                      >
                        {interviewFlow.nextQuestion} · {nextInterviewStage}
                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => addNextInterviewQuestion(true)}
                        disabled={!interviewMessages.length || interviewThinking}
                      >
                        {interviewFlow.newTopic} ·{" "}
                        {nextInterviewTopic.focusLabel}
                      </button>
                    </div>
                  </div>
                  <div className="interview-transcript" aria-live="polite">
                    {interviewMessages.length ? (
                      <>
                        {interviewMessages.map((message, index) => (
                          <div
                            className={`interview-message ${message.role}`}
                            key={`${message.role}-${index}`}
                          >
                            <b>
                              {message.role === "assistant"
                                ? selectedInterviewPersona.label
                                : interviewFlow.you}
                            </b>
                            <p>{message.content}</p>
                          </div>
                        ))}
                        {interviewThinking && (
                          <div className="interview-message assistant pending">
                            <b>{selectedInterviewPersona.label}</b>
                            <p>{interviewStudioUi.thinking}</p>
                          </div>
                        )}
                      </>
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
                      disabled={!interviewMessages.length || interviewThinking}
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
                        disabled={!interviewMessages.length || interviewThinking}
                        aria-pressed={isListening}
                      >
                        {isListening
                          ? interview.stopListening
                          : interview.listen}
                      </button>
                      <button
                        className="button primary"
                        disabled={
                          !interviewMessages.length ||
                          !interviewAnswer.trim() ||
                          interviewThinking
                        }
                      >
                        {interviewThinking
                          ? interviewStudioUi.thinking
                          : interview.send}
                      </button>
                    </div>
                    <small className="voice-disclosure">
                      {voiceMessage ||
                        `${interviewFlow.languageLocked} ${interview.privacy} ${interview.speechLanguage}: ${speechLocaleFor(locale)}.`}
                    </small>
                    <div className="speech-vocabulary">
                      <b>{interviewStudioUi.vocabulary}</b>
                      <div>
                        {speechVocabulary.slice(0, 10).map((term) => (
                          <span key={term}>{term}</span>
                        ))}
                      </div>
                      <small>{interviewStudioUi.vocabularyNote}</small>
                    </div>
                    <label className="auto-read-toggle">
                      <input
                        type="checkbox"
                        checked={autoReadInterviewQuestions}
                        onChange={(event) =>
                          setAutoReadInterviewQuestions(event.target.checked)
                        }
                      />
                      <span>{interviewFlow.autoRead}</span>
                    </label>
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
                      InterviewThread rewards a specific decision, verifiable action,
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
                        <small>{openSourceLabel}</small>
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
                        {item === "Worldwide"
                          ? copy.worldwide
                          : regionLabelFor(locale, item)}
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
                        {item === "All countries"
                          ? detail.country
                          : countryLabelFor(locale, item)}
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
                        {item === "All industries"
                          ? detail.industry
                          : marketValueFor(locale, item)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <section className="story-radar" aria-labelledby="story-radar-title">
                <div className="story-radar-heading">
                  <div>
                    <p className="eyebrow">InterviewThread Story Signal</p>
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
                      "Scanning is free and open source. Scheduled cross-device monitoring will require an account and background delivery infrastructure."}
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
                              {job.city}, {countryLabelFor(locale, job.country)} ·{" "}
                              {job.workStyle} · {marketValueFor(locale, job.industry)}
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
                  {detail.providerPreview}
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
                      <b>{marketValueFor(locale, source.name)}</b>
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
                        {item === "Worldwide"
                          ? copy.worldwide
                          : regionLabelFor(locale, item)}
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
                        {item === "All countries"
                          ? detail.country
                          : countryLabelFor(locale, item)}
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
                        {item === "All industries"
                          ? detail.industry
                          : marketValueFor(locale, item)}
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
                        <option key={item} value={item}>
                          {marketValueFor(locale, item)}
                        </option>
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
                    {[
                      "Last 30 days",
                      "Last 3 months",
                      "Last 6 months",
                      "Last 12 months",
                    ].map((item) => (
                      <option key={item} value={item}>
                        {timeRangeLabelFor(locale, item)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="market-kpis">
                <article>
                  <span>
                    {detail.exampleOpenings}
                  </span>
                  <b>{compactNumber(totalOpenings, locale)}</b>
                  <small>
                    {sourceMeta?.employer ||
                      (country === "All countries"
                        ? copy.worldwide
                        : countryLabelFor(locale, country))}
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
                    {weightedChange === null
                      ? detail.exampleSnapshot
                      : timeRangeLabelFor(locale, timeRange)}
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
                    <span>{timeRangeLabelFor(locale, timeRange)}</span>
                  </div>
                  <div className="bar-chart">
                    {marketRows.map((item) => (
                      <div
                        className="bar-row"
                        key={`${item.industry}-${item.role}`}
                      >
                        <div>
                          <b>{marketValueFor(locale, item.industry)}</b>
                          <span>{marketValueFor(locale, item.role)}</span>
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
                          <span>{marketValueFor(locale, item.industry)}</span>
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
                        ? "InterviewThread"
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
                    : `${modelStatus} If the local model is unavailable, InterviewThread returns an evidence-engine fallback and labels the failure.`}
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
                        ? "Feedback is open to everyone"
                        : copy.feedback}
                    </b>
                    <p>
                      {locale === "en"
                        ? "Every submission enters the same community queue with equal priority."
                        : copy.heroBody}
                    </p>
                  </div>
                  <strong>{openSourceLabel} · {locale === "zh-TW" ? "免費" : "Free"}</strong>
                </div>
                <input name="plan" type="hidden" value="community" />
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
          <p className="eyebrow">
            {locale === "en" ? "Why this exists" : detail.product}
          </p>
          <h2>
            {locale === "en"
              ? "Generic AI can write fast. It cannot know what is true about you."
              : copy.heroTitle}
          </h2>
          {locale === "en" && (
            <p className="principles-intro">
              Job descriptions can feel overwhelming, and generic AI drafts often
              sound inaccurate or unlike you. We help you understand the role,
              use only your real experience, and practice until you feel ready—
              especially when interviewing in a second language.
            </p>
          )}
        </div>
        <div className="principle-grid">
          <article>
            <span>01</span>
            <h3>{locale === "en" ? "Stay truthful" : detail.matchedEvidence}</h3>
            <p>
              {locale === "en"
                ? "Turn your real resume into stronger answers without inventing skills, results, or experience."
                : copy.heroBody}
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>{locale === "en" ? "Understand the job" : detail.evidenceCoverage}</h3>
            <p>
              {locale === "en"
                ? "Translate a complicated job description into the evidence, gaps, and questions that matter most."
                : copy.heroBody}
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>{locale === "en" ? "Practice with confidence" : copy.interview}</h3>
            <p>
              {locale === "en"
                ? "Rehearse realistic follow-up questions and get feedback grounded in the role and your own story."
                : interview.subtitle}
            </p>
          </article>
        </div>
      </section>
      <section className="home-faq" id="questions" aria-labelledby="faq-title">
        <div className="home-faq-grid">
          <div className="home-faq-heading">
            <p className="eyebrow">{faq.eyebrow}</p>
            <h2 id="faq-title">{faq.title}</h2>
            <p>{faq.intro}</p>
          </div>
          <div className="home-faq-list">
            {faq.items.map((item, index) => (
              <details key={item.question} open={index === 0}>
                <summary>
                  <span className="home-faq-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item.question}</span>
                  <span className="home-faq-toggle" aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqSchema }}
        />
      </section>
      <section className="plans" id="plans">
        <div className="plans-heading">
          <p className="eyebrow">{openSourceLabel}</p>
          <h2>{accountLabels.noCharge}</h2>
        </div>
        <div className="plan-grid open-source-plan">
          <article className="featured">
            <span>{openSourceLabel}</span>
            <h3>{openSourceLabel}</h3>
            <p className="price">{accountLabels.noCharge}</p>
            <ul>
              <li>{locale === "en" ? "Resume and job-post match" : detail.matrix}</li>
              <li>{locale === "en" ? "What is supported and what is missing" : detail.evidenceCoverage}</li>
              <li>{locale === "en" ? "3–5 stories grounded in your resume" : detail.bestStory}</li>
              <li>{locale === "en" ? "10 questions tailored to the role" : interview.focus}</li>
              <li>{locale === "en" ? "30-minute preparation plan" : detail.readiness}</li>
              <li>{locale === "en" ? "Evidence-grounded mock interview" : copy.interview}</li>
            </ul>
            <a
              className="button primary"
              href={localizedPath(locale, "account")}
            >
              {accountLabels.signIn}
            </a>
          </article>
        </div>
      </section>
    </main>
  );
}
