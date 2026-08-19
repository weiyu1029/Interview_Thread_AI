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
};
type ChatMessage = { role: "assistant" | "user"; content: string };
type WorkspaceView =
  | "Analyze"
  | "Recommendations"
  | "Market Insights"
  | "Tracker"
  | "Copilot"
  | "Feedback";
type ApplicationMode = "Manual" | "Hybrid" | "Automatic";

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
    name: "Employer ATS feeds",
    access: "Live-ready",
    detail: "Greenhouse, Lever, licensed employer feeds",
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

const JOBS = [
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
function compactNumber(value: number, locale: LocaleCode = "en") {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
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
  const [tracker, setTracker] = useState<TrackerItem[]>([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const copy = copyFor(locale);
  const detail = detailFor(locale);
  const preferencesLoaded = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedLocale = window.localStorage.getItem(
        "careerproof-locale",
      ) as LocaleCode | null;
      const savedTracker = window.localStorage.getItem("careerproof-tracker");
      if (savedLocale && LANGUAGES.some(([code]) => code === savedLocale))
        setLocale(savedLocale);
      if (savedTracker) {
        try {
          setTracker(JSON.parse(savedTracker));
        } catch {
          setTracker([]);
        }
      }
      preferencesLoaded.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
    if (preferencesLoaded.current)
      window.localStorage.setItem("careerproof-locale", locale);
  }, [locale]);

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
  const recommendedJobs = useMemo(
    () =>
      JOBS.filter((job) => region === "Worldwide" || job.region === region)
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
        .map((job) => ({
          ...job,
          match: scoreMatches(runMatch(job.description, resume)),
        }))
        .sort((a, b) => b.match - a.match),
    [country, industry, region, resume, roleQuery, workStyle],
  );
  const marketRows = useMemo(() => {
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
  }, [country, industry, region, roleFamily]);
  const totalOpenings = marketRows.reduce(
    (sum, item) => sum + item.openings,
    0,
  );
  const weightedChange = marketRows.length
    ? marketRows.reduce((sum, item) => sum + item.change * item.openings, 0) /
      Math.max(totalOpenings, 1)
    : 0;
  const remoteShare = marketRows.length
    ? marketRows.reduce((sum, item) => sum + item.remote, 0) / marketRows.length
    : 0;
  const maxOpenings = Math.max(...marketRows.map((item) => item.openings), 1);

  function updateRegion(next: string) {
    setRegion(next);
    setCountry("All countries");
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
        `${file.name} was loaded immediately. ${files.length > 1 ? `${files.length - 1} additional file(s) are queued for the API parser.` : ""}`.trim(),
      );
    } else
      setUploadMessage(
        `${files.length} file(s) selected. This preview accepts every format; document, spreadsheet, slide, image, email, and archive extraction is validated by the self-hosted parser before use.`,
      );
  }
  function persistTracker(next: TrackerItem[]) {
    setTracker(next);
    window.localStorage.setItem("careerproof-tracker", JSON.stringify(next));
  }
  function saveJob(job: (typeof JOBS)[number]) {
    if (!tracker.some((item) => item.id === job.id))
      persistTracker([
        {
          id: job.id,
          company: job.company,
          role: job.title,
          status: "Interested",
        },
        ...tracker,
      ]);
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
  function sendFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const existing = JSON.parse(
      window.localStorage.getItem("careerproof-feedback") || "[]",
    );
    window.localStorage.setItem(
      "careerproof-feedback",
      JSON.stringify([...existing, Object.fromEntries(data.entries())]),
    );
    setFeedbackSent(true);
    event.currentTarget.reset();
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="CareerProof Global home">
          <span className="brand-mark">CP</span>
          <span>
            CareerProof <small>Global</small>
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
            onChange={(event) => setLocale(event.target.value as LocaleCode)}
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

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">CareerProof Global · Evidence that travels.</p>
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
                  {detail.exampleSnapshot}
                </span>
              </div>
              <p className="data-disclosure">
                {locale === "en"
                  ? "This public preview uses labeled example openings. Connect the Adzuna adapter or another licensed provider for live listings."
                  : detail.sourcePolicy}
              </p>
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
                        <strong>{job.match}</strong>
                        <span>{detail.requiredMatch}</span>
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
                          </div>
                          <span
                            className={
                              job.trend >= 0 ? "trend up" : "trend down"
                            }
                          >
                            {job.trend >= 0 ? "+" : ""}
                            {job.trend}% {copy.market}
                          </span>
                        </div>
                        <div className="story-callout">
                          <span>{detail.bestStory}</span>
                          <p>
                            {locale === "en"
                              ? job.story
                              : `${detail.bestStory}: ${job.strengths.join(", ")}`}
                          </p>
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
                  {detail.providerPreview}
                </span>
              </div>
              <p className="data-disclosure">
                <b>{detail.exampleSnapshot}.</b>{" "}
                {locale === "en"
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
                  <span>{detail.exampleOpenings}</span>
                  <b>{compactNumber(totalOpenings, locale)}</b>
                  <small>
                    {country === "All countries" ? copy.worldwide : country}
                  </small>
                </article>
                <article>
                  <span>{detail.momentum}</span>
                  <b className={weightedChange >= 0 ? "positive" : "negative"}>
                    {weightedChange >= 0 ? "+" : ""}
                    {weightedChange.toFixed(1)}%
                  </b>
                  <small>{detail.timeRange}</small>
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
                      <p>{detail.sourcePolicy}</p>
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
                      <div>
                        <b>{item.role}</b>
                        <p>{item.company}</p>
                      </div>
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
                        ? "CareerProof"
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
                <label className="full">
                  <span>{detail.feedbackTitle}</span>
                  <textarea
                    name="message"
                    required
                    placeholder={detail.feedbackTitle}
                  />
                </label>
                <div className="full feedback-actions">
                  <p>{feedbackSent ? copy.heroBody : detail.privateTitle}</p>
                  <button className="button primary">
                    {detail.submitFeedback}
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
            <p className="price">{detail.plans}</p>
            <ul>
              <li>{detail.privateTitle}</li>
              <li>{detail.assistantTitle}</li>
              <li>
                {copy.manual} · {copy.hybrid} · {copy.automatic}
              </li>
              <li>{copy.tracker}</li>
              <li>{detail.aiModel}</li>
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
            <h3>Team · Enterprise</h3>
            <p className="price">{detail.plans}</p>
            <ul>
              <li>{detail.workspace}</li>
              <li>{copy.automatic}</li>
              <li>{detail.checked}</li>
              <li>{copy.market}</li>
              <li>{copy.feedback}</li>
            </ul>
            <button
              className="button secondary"
              onClick={() => setApplicationMode("Automatic")}
            >
              {copy.automatic}
            </button>
          </article>
        </div>
      </section>
    </main>
  );
}
