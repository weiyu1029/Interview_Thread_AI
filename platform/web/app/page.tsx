"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type MatchStatus = "Strong evidence" | "Partial evidence" | "Gap";
type Match = { keyword: string; priority: "Required" | "Core" | "Preferred"; status: MatchStatus; evidence: string };
type TrackerItem = { id: string; company: string; role: string; status: string };
type ChatMessage = { role: "assistant" | "user"; content: string };

const KEYWORDS: Record<string, string[]> = {
  SQL: ["sql", "structured query language"], Python: ["python", "pandas", "numpy"],
  Excel: ["excel", "pivot table", "power query"], Tableau: ["tableau"],
  "Power BI": ["power bi", "powerbi", "dax"], "Data visualization": ["data visualization", "dashboard", "reporting"],
  Experimentation: ["experiment", "a/b test", "ab test", "hypothesis testing"], Statistics: ["statistics", "regression"],
  "Stakeholder management": ["stakeholder", "cross-functional"], Leadership: ["leadership", "led", "managed"],
  "Project management": ["project management", "program management"], "Product analytics": ["product analytics", "user behavior", "feature adoption"],
  "Machine learning / AI": ["machine learning", "artificial intelligence", "generative ai", "llm"],
  "Process improvement": ["process improvement", "optimization", "automation"],
  "Data quality": ["data quality", "validation", "reconciliation"], APIs: ["api", "apis"],
};

const SAMPLE_JD = "We are looking for a product analyst who can use SQL, design experiments, build stakeholder-ready dashboards, and communicate findings to cross-functional partners. Python is preferred. The analyst will define KPIs and improve product decisions.";
const SAMPLE_RESUME = "Product analyst who built SQL dashboards used by product and operations leaders. Partnered with cross-functional stakeholders to translate customer behavior into decisions and automated a weekly validation workflow, reducing preparation time by 30%.";
const PROVIDERS = ["Evidence engine", "Ollama", "LM Studio", "vLLM", "llama.cpp", "LocalAI", "Hugging Face", "Gemini"];

function includesPhrase(text: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

function evidenceLine(resume: string, aliases: string[]) {
  const lines = resume.split(/\n|(?<=[.!?])\s+/).map((line) => line.trim()).filter(Boolean);
  return lines.find((line) => aliases.some((alias) => includesPhrase(line, alias))) || "No source evidence found.";
}

function runMatch(jd: string, resume: string): Match[] {
  return Object.entries(KEYWORDS).flatMap(([keyword, aliases]) => {
    const inJd = aliases.some((alias) => includesPhrase(jd, alias));
    if (!inJd) return [];
    const required = jd.split(/\n|(?<=[.!?])\s+/).some((line) => aliases.some((alias) => includesPhrase(line, alias)) && /required|must|need|looking for/i.test(line));
    const preferred = jd.split(/\n|(?<=[.!?])\s+/).some((line) => aliases.some((alias) => includesPhrase(line, alias)) && /preferred|nice to have|bonus|plus/i.test(line));
    const evidence = evidenceLine(resume, aliases);
    const exact = aliases.some((alias) => includesPhrase(resume, alias));
    const conceptWords = keyword.toLowerCase().split(/\W+/).filter((word) => word.length > 3);
    const partial = conceptWords.some((word) => includesPhrase(resume, word));
    return [{ keyword, priority: preferred ? "Preferred" : required ? "Required" : "Core", status: exact ? "Strong evidence" : partial ? "Partial evidence" : "Gap", evidence }];
  });
}

function scoreMatches(matches: Match[]) {
  if (!matches.length) return 0;
  const weights = { Required: 1.35, Core: 1, Preferred: 0.65 };
  const values = { "Strong evidence": 1, "Partial evidence": 0.55, Gap: 0 };
  const possible = matches.reduce((sum, item) => sum + weights[item.priority], 0);
  return Math.round(matches.reduce((sum, item) => sum + weights[item.priority] * values[item.status], 0) / possible * 100);
}

export default function Home() {
  const [active, setActive] = useState("Analyze");
  const [jd, setJd] = useState(SAMPLE_JD);
  const [resume, setResume] = useState(SAMPLE_RESUME);
  const [matches, setMatches] = useState<Match[]>(() => runMatch(SAMPLE_JD, SAMPLE_RESUME));
  const [provider, setProvider] = useState("Evidence engine");
  const [uploadMessage, setUploadMessage] = useState("");
  const [tracker, setTracker] = useState<TrackerItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("careerproof-tracker") || "[]");
    } catch {
      return [];
    }
  });
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: "Ask about your strongest evidence, missing proof, or how to structure an interview story." }]);
  const [question, setQuestion] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const score = useMemo(() => scoreMatches(matches), [matches]);
  const strongCount = matches.filter((item) => item.status === "Strong evidence").length;
  const required = matches.filter((item) => item.priority === "Required");
  const requiredScore = required.length ? Math.round(required.filter((item) => item.status === "Strong evidence").length / required.length * 100) : score;

  function analyze() {
    setMatches(runMatch(jd, resume));
    setActive("Analyze");
  }

  async function loadFile(event: ChangeEvent<HTMLInputElement>, destination: "jd" | "resume") {
    const file = event.target.files?.[0];
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (["txt", "md", "csv", "json", "html", "htm", "rtf"].includes(extension || "")) {
      const text = await file.text();
      if (destination === "jd") setJd(text);
      else setResume(text);
      setUploadMessage(`${file.name} was loaded in this browser.`);
    } else {
      setUploadMessage(`${file.name} is ready for the full API parser. PDF, DOCX, ODT, and XLSX parsing is included in the self-hosted platform.`);
    }
  }

  function addTrackerItem(event: FormEvent) {
    event.preventDefault();
    if (!company.trim() || !role.trim()) return;
    const next = [{ id: crypto.randomUUID(), company: company.trim(), role: role.trim(), status: "Interested" }, ...tracker];
    setTracker(next);
    window.localStorage.setItem("careerproof-tracker", JSON.stringify(next));
    setCompany(""); setRole("");
  }

  function askCopilot(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    const gaps = matches.filter((item) => item.status === "Gap").map((item) => item.keyword).slice(0, 4);
    const strong = matches.filter((item) => item.status === "Strong evidence").map((item) => item.keyword).slice(0, 4);
    const reply = `Your strongest verified signals are ${strong.join(", ") || "not yet clear"}. Current gaps are ${gaps.join(", ") || "limited"}. For this question, anchor the answer in one source sentence, explain your own action, and add a result only when it is verified.`;
    setMessages([...messages, { role: "user", content: question.trim() }, { role: "assistant", content: reply }]);
    setQuestion("");
  }

  function sendFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const existing = JSON.parse(window.localStorage.getItem("careerproof-feedback") || "[]");
    window.localStorage.setItem("careerproof-feedback", JSON.stringify([...existing, Object.fromEntries(data.entries())]));
    setFeedbackSent(true);
    event.currentTarget.reset();
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="CareerProof home"><span className="brand-mark">CP</span><span>CareerProof</span></a>
        <nav className="topnav" aria-label="Primary navigation"><a href="#product">Product</a><a href="#models">Models</a><a href="https://github.com/weiyu1029/careerproof-agent">Open source</a></nav>
        <a className="button secondary" href="#workspace">Open workspace</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Evidence-first career intelligence</p>
          <h1>Turn career evidence into a sharper, more credible application.</h1>
          <p className="lede">Match a resume to any role, understand which keywords matter, and build interview stories without inventing experience.</p>
          <div className="hero-actions"><a className="button primary" href="#workspace">Analyze a role</a><a className="text-link" href="#product">See how it works <span aria-hidden="true">→</span></a></div>
          <div className="trust-row" aria-label="Product principles"><span>Evidence linked</span><span>Privacy aware</span><span>Model flexible</span><span>Open source</span></div>
        </div>
        <div className="hero-panel" aria-label="Current CareerProof score">
          <div className="panel-heading"><span>Role readiness</span><span className="status-pill">Evidence checked</span></div>
          <div className="score-row"><strong>{score}</strong><span>/ 100</span></div>
          <div className="score-bar"><i style={{ width: `${score}%` }} /></div>
          <div className="metric-grid"><div><span>Required match</span><b>{requiredScore}%</b></div><div><span>Evidence coverage</span><b>{strongCount} of {matches.length}</b></div><div><span>Story readiness</span><b>{Math.min(strongCount, 6)} of 6</b></div></div>
          <p className="insight">{matches.some((item) => item.status === "Gap") ? "Close required evidence gaps before optimizing wording." : "The current evidence covers the detected role signals. Verify every metric before applying."}</p>
        </div>
      </section>

      <section className="workspace" id="workspace">
        <aside className="workspace-nav">
          <p className="workspace-label">Workspace</p>
          {["Analyze", "Tracker", "Copilot", "Feedback"].map((item) => <button className={active === item ? "active" : ""} key={item} onClick={() => setActive(item)}>{item}</button>)}
          <div className="workspace-note"><span className="dot" /><div><b>Private by default</b><p>Guest work stays on this device. Accounts are only needed for cloud history and collaboration.</p></div></div>
        </aside>

        <div className="workspace-main">
          {active === "Analyze" && <>
            <div className="section-heading"><div><p className="eyebrow">Analysis workspace</p><h2>Compare your evidence with the role</h2></div><button className="button secondary" onClick={() => { setJd(SAMPLE_JD); setResume(SAMPLE_RESUME); setMatches(runMatch(SAMPLE_JD, SAMPLE_RESUME)); }}>Use sample data</button></div>
            <div className="input-grid">
              <label><span>Job description</span><textarea value={jd} onChange={(event) => setJd(event.target.value)} /><small><input type="file" accept=".pdf,.docx,.odt,.rtf,.txt,.md,.html,.csv,.json,.xlsx" onChange={(event) => loadFile(event, "jd")} /> Import a document</small></label>
              <label><span>Resume or career evidence</span><textarea value={resume} onChange={(event) => setResume(event.target.value)} /><small><input type="file" accept=".pdf,.docx,.odt,.rtf,.txt,.md,.html,.csv,.json,.xlsx" onChange={(event) => loadFile(event, "resume")} /> Import a document</small></label>
            </div>
            {uploadMessage && <p className="notice" role="status">{uploadMessage}</p>}
            <div className="action-row"><div><label htmlFor="model">AI model</label><select id="model" value={provider} onChange={(event) => setProvider(event.target.value)}>{PROVIDERS.map((item) => <option key={item}>{item}</option>)}</select><small className="model-note">The hosted guest preview keeps the evidence engine canonical. Connect the API to activate local or hosted model enrichment.</small></div><button className="button primary" onClick={analyze}>Run evidence match</button></div>
            <div className="results-card"><div className="results-title"><h3>Keyword evidence matrix</h3><span>{matches.length} signals reviewed</span></div><div className="keyword-table">{matches.length ? matches.map((item) => <div className="keyword-row detailed" key={item.keyword}><div><b>{item.keyword}</b><small>{item.evidence}</small></div><span>{item.priority}</span><span className={item.status === "Gap" ? "gap" : "evidence"}>{item.status}</span></div>) : <p className="empty-state">No supported role signals were detected. Add more detail to the job description.</p>}</div></div>
          </>}

          {active === "Tracker" && <>
            <div className="section-heading"><div><p className="eyebrow">Application tracker</p><h2>Keep every opportunity moving</h2></div><span className="status-pill light">Saved on this device</span></div>
            <form className="tracker-form" onSubmit={addTrackerItem}><label><span>Company</span><input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Company name" /></label><label><span>Role</span><input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Target role" /></label><button className="button primary">Add opportunity</button></form>
            <div className="tracker-list">{tracker.length ? tracker.map((item) => <article key={item.id}><div><b>{item.role}</b><p>{item.company}</p></div><select value={item.status} aria-label={`Status for ${item.role}`} onChange={(event) => { const next = tracker.map((row) => row.id === item.id ? { ...row, status: event.target.value } : row); setTracker(next); localStorage.setItem("careerproof-tracker", JSON.stringify(next)); }}><option>Interested</option><option>Preparing</option><option>Applied</option><option>Interviewing</option><option>Offer</option><option>Closed</option></select></article>) : <p className="empty-state">Add a role to create your first application record. The full platform syncs this history to your account.</p>}</div>
          </>}

          {active === "Copilot" && <>
            <div className="section-heading"><div><p className="eyebrow">Career Copilot</p><h2>Ask questions grounded in your evidence</h2></div><span className="status-pill light">{provider}</span></div>
            <div className="chat-panel">{messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}><b>{message.role === "assistant" ? "CareerProof" : "You"}</b><p>{message.content}</p></div>)}</div>
            <form className="chat-form" onSubmit={askCopilot}><label htmlFor="question">Ask about this role</label><div><input id="question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Which story should I lead with in the interview?" /><button className="button primary">Send</button></div></form>
          </>}

          {active === "Feedback" && <>
            <div className="section-heading"><div><p className="eyebrow">Product feedback</p><h2>Help improve CareerProof</h2></div></div>
            <form className="feedback-form" onSubmit={sendFeedback}><label><span>Area</span><select name="category"><option value="accuracy">Analysis accuracy</option><option value="usability">Ease of use</option><option value="model">Model quality</option><option value="feature">Feature request</option><option value="general">General feedback</option></select></label><label><span>Rating</span><select name="rating"><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Fair</option><option value="2">2 — Needs work</option><option value="1">1 — Poor</option></select></label><label className="full"><span>What should we improve?</span><textarea name="message" required placeholder="Tell us what happened and what outcome you expected." /></label><div className="full feedback-actions"><p>{feedbackSent ? "Thank you. Your feedback was saved on this device for the public preview." : "The self-hosted platform sends this to the workspace feedback queue."}</p><button className="button primary">Submit feedback</button></div></form>
          </>}
        </div>
      </section>

      <section className="feature-strip" id="product"><article><span>01</span><h3>Trace every claim</h3><p>Each recommendation links back to source evidence, with gaps kept separate from safe rewrites.</p></article><article><span>02</span><h3>Build stronger stories</h3><p>Generate STAR plus reflection narratives from verified experience, metrics, and role priorities.</p></article><article id="models"><span>03</span><h3>Bring any model</h3><p>Use any chat model exposed by Ollama, LM Studio, vLLM, llama.cpp, LocalAI, Hugging Face, or an approved compatible server.</p></article></section>
    </main>
  );
}
