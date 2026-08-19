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
  LocaleCode,
  REVIEWED_LOCALES,
  RTL_LOCALES,
} from "./i18n";

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
  | "Copilot"
  | "Feedback";
type ApplicationMode = "Manual" | "Hybrid" | "Automatic";
type BillingMarket = {
  code: string;
  currency: string;
  proMonthly: number;
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
  "Evidence engine",
  "Ollama",
  "LM Studio",
  "vLLM",
  "llama.cpp",
  "LocalAI",
  "Hugging Face",
  "Gemini",
];
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

export default function Home() {
  const [active, setActive] = useState<WorkspaceView>("Analyze");
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [applicationMode, setApplicationMode] =
    useState<ApplicationMode>("Manual");
  const [jd, setJd] = useState(SAMPLE_JD);
  const [resume, setResume] = useState(SAMPLE_RESUME);
  const [matches, setMatches] = useState<Match[]>(() =>
    runMatch(SAMPLE_JD, SAMPLE_RESUME),
  );
  const [provider, setProvider] = useState("Evidence engine");
  const [uploadMessage, setUploadMessage] = useState("");
  const [roleQuery, setRoleQuery] = useState("Product analyst");
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
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [suggestedLocale, setSuggestedLocale] =
    useState<LocaleCode | null>(null);
  const [billingMarketCode, setBillingMarketCode] = useState("US");
  const copy = copyFor(locale);
  const detail = detailFor(locale);
  const preferencesLoaded = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
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
      if (savedLocale && LANGUAGES.some(([code]) => code === savedLocale))
        setLocale(savedLocale);
      else if (
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
      setNotificationPermission(
        "Notification" in window ? Notification.permission : "unsupported",
      );
      preferencesLoaded.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
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

  function chooseLocale(nextLocale: LocaleCode) {
    setLocale(nextLocale);
    setSuggestedLocale(null);
    window.localStorage.setItem("aptograph-locale", nextLocale);
    window.localStorage.setItem("aptograph-language-prompt-dismissed", "true");
  }

  function chooseBillingMarket(nextMarket: string) {
    setBillingMarketCode(nextMarket);
    window.localStorage.setItem("aptograph-billing-market", nextMarket);
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
  async function loadFile(
    event: ChangeEvent<HTMLInputElement>,
    destination: "jd" | "resume",
  ) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const file = files[0];
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (
      [
        "txt",
        "md",
        "csv",
        "json",
        "html",
        "htm",
        "rtf",
        "xml",
        "yaml",
        "yml",
        "log",
        "tex",
      ].includes(extension || "")
    ) {
      const text = await file.text();
      if (destination === "jd") setJd(text);
      else setResume(text);
      setUploadMessage(
        locale === "en"
          ? `${file.name} was loaded immediately. ${files.length > 1 ? `${files.length - 1} additional file(s) are queued for the API parser.` : ""}`.trim()
          : `${file.name} · ${detail.importAny}`,
      );
    } else
      setUploadMessage(
        locale === "en"
          ? `${files.length} file(s) selected. Every format can be selected. Supported documents are parsed now; images, audio, archives, and legacy binaries require configured OCR, transcription, or quarantine adapters.`
          : `${files.length} · ${detail.importAny}. ${detail.sourcePolicy}`,
      );
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
        new Notification("Aptograph Story Signal", {
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
  function askCopilot(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    const gaps = matches
      .filter((item) => item.status === "Gap")
      .map((item) => item.keyword)
      .slice(0, 4);
    const strong = matches
      .filter((item) => item.status === "Strong evidence")
      .map((item) => item.keyword)
      .slice(0, 4);
    const reply = `${copy.recommendations}: ${strong.join(", ") || copy.analyze}. ${copy.feedback}: ${gaps.join(", ") || copy.tracker}. ${copy.heroBody}`;
    setMessages([
      ...messages,
      { role: "user", content: question.trim() },
      { role: "assistant", content: reply },
    ]);
    setQuestion("");
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

  const views: { id: WorkspaceView; label: string }[] = [
    { id: "Analyze", label: copy.analyze },
    { id: "Recommendations", label: copy.recommendations },
    { id: "Market Insights", label: copy.market },
    { id: "Tracker", label: copy.tracker },
    { id: "Copilot", label: copy.copilot },
    { id: "Feedback", label: copy.feedback },
  ];
  const modeMessage =
    locale !== "en"
      ? `${copy.mode}: ${applicationMode === "Manual" ? copy.manual : applicationMode === "Hybrid" ? copy.hybrid : copy.automatic}. ${copy.heroBody}`
      : applicationMode === "Manual"
        ? "Open-source and free. You review every role, edit every document, and submit every application yourself."
        : applicationMode === "Hybrid"
          ? "Pro preview. AI can prepare a tailored draft and queue next steps, but you must approve every submission."
          : "Pro preview. Personal automation is limited to approved employer APIs with consent, rate limits, an audit log, and an emergency stop. Nothing is submitted in this public preview.";
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Aptograph home">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>
            Aptograph <small>Career intelligence</small>
          </span>
        </a>
        <nav className="topnav" aria-label="Primary navigation">
          <a href="#product">{detail.product}</a>
          <a href="#workspace">{detail.workspace}</a>
          <a href="#plans">{detail.plans}</a>
          <a href="https://github.com/weiyu1029/careerproof-agent">
            {detail.source}
          </a>
        </nav>
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
          <small>
            {REVIEWED_LOCALES.has(locale) ? "Reviewed" : "Community beta"}
          </small>
        </label>
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

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Aptograph · Your evidence, mapped to what’s next.</p>
          <h1>{copy.heroTitle}</h1>
          <p className="lede">{copy.heroBody}</p>
          <div className="hero-actions">
            <a className="button primary" href="#workspace">
              {copy.enter}
            </a>
            <button
              className="text-link"
              onClick={() => setActive("Market Insights")}
            >
              {detail.explore}
            </button>
          </div>
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
            <span className="status-pill">{detail.checked}</span>
          </div>
          <div className="score-row">
            <strong>{score}</strong>
            <span>/ 100</span>
          </div>
          <div className="score-bar">
            <i style={{ width: `${score}%` }} />
          </div>
          <div className="metric-grid">
            <div>
              <span>{detail.requiredMatch}</span>
              <b>{requiredScore}%</b>
            </div>
            <div>
              <span>{detail.evidenceCoverage}</span>
              <b>
                {strongCount} / {matches.length}
              </b>
            </div>
            <div>
              <span>{detail.globalMatches}</span>
              <b>{recommendedJobs.length}</b>
            </div>
          </div>
          <p className="insight">
            {locale === "en"
              ? "Recommendations rank role requirements against your source evidence. Gaps stay visible and are never rewritten as experience you do not have."
              : copy.heroBody}
          </p>
        </div>
      </section>

      <section className="control-deck">
        <div>
          <span className="control-label">{copy.mode}</span>
          <div className="mode-switch" role="radiogroup" aria-label={copy.mode}>
            {(["Manual", "Hybrid", "Automatic"] as ApplicationMode[]).map(
              (mode) => (
                <button
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
        </div>
        <p>{modeMessage}</p>
      </section>

      <section className="workspace" id="workspace">
        <aside className="workspace-nav">
          <p className="workspace-label">{detail.workspace}</p>
          {views.map((item) => (
            <button
              className={active === item.id ? "active" : ""}
              key={item.id}
              onClick={() => setActive(item.id)}
            >
              {item.label}
            </button>
          ))}
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
              <div className="input-grid">
                <label>
                  <span>{detail.jobDescription}</span>
                  <textarea
                    value={jd}
                    onChange={(event) => setJd(event.target.value)}
                  />
                  <small className="upload-control">
                    <input
                      type="file"
                      accept="*/*"
                      multiple
                      onChange={(event) => loadFile(event, "jd")}
                    />{" "}
                    {detail.importAny}
                  </small>
                </label>
                <label>
                  <span>{detail.resumeEvidence}</span>
                  <textarea
                    value={resume}
                    onChange={(event) => setResume(event.target.value)}
                  />
                  <small className="upload-control">
                    <input
                      type="file"
                      accept="*/*"
                      multiple
                      onChange={(event) => loadFile(event, "resume")}
                    />{" "}
                    {detail.importAny}
                  </small>
                </label>
              </div>
              {uploadMessage && (
                <p className="notice" role="status">
                  {uploadMessage}
                </p>
              )}
              <div className="action-row">
                <div>
                  <label htmlFor="model">{detail.aiModel}</label>
                  <select
                    id="model"
                    value={provider}
                    onChange={(event) => setProvider(event.target.value)}
                  >
                    {PROVIDERS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <small className="model-note">
                    {locale === "en"
                      ? "The deterministic engine stays canonical. Self-hosters can connect any supported local or compatible model."
                      : copy.heroBody}
                  </small>
                </div>
                <button
                  className="button primary"
                  onClick={() => setMatches(runMatch(jd, resume))}
                >
                  {detail.runMatch}
                </button>
              </div>
              <div className="results-card">
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
                    <p className="eyebrow">Aptograph Story Signal</p>
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
                            onClick={() => saveJob(job)}
                          >
                            {tracker.some((item) => item.id === job.id)
                              ? copy.tracker
                              : detail.saveRole}
                          </button>
                          <button
                            className="button primary"
                            onClick={() => {
                              setJd(job.description);
                              setMatches(runMatch(job.description, resume));
                              setActive("Analyze");
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
                  <span>{detail.product}</span>
                  <input
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder={detail.product}
                  />
                </label>
                <label>
                  <span>{detail.recommendationsTitle}</span>
                  <input
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    placeholder={detail.recommendationsTitle}
                  />
                </label>
                <button className="button primary">{detail.runMatch}</button>
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
                  {provider} ·{" "}
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
                        ? "Aptograph"
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
                  <button className="button primary">{detail.send}</button>
                </div>
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
            {locale === "en"
              ? "Transparent regional estimates. Country and currency can be changed; final currency, tax, and total are confirmed in Stripe Checkout. Pricing never uses your resume, job history, or behavior."
              : copy.worldwide +
                " · " +
                billingMarket.currency +
                " · Stripe Checkout"}
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
              className="button secondary"
              href="https://github.com/weiyu1029/careerproof-agent"
            >
              {detail.source}
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
            <button
              className="button primary"
              onClick={() => setApplicationMode("Automatic")}
            >
              Pro · {copy.automatic}
            </button>
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
            <button
              className="button secondary"
              onClick={() => setApplicationMode("Automatic")}
            >
              Team · {detail.plans}
            </button>
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
            <button className="button secondary">
              Enterprise · {detail.plans}
            </button>
          </article>
        </div>
      </section>
    </main>
  );
}
