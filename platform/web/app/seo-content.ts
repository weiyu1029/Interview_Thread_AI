import type { Metadata } from "next";

export const SEO_PAGE_KEYS = [
  "resume-job-description-match",
  "career-story-builder",
  "ai-mock-interview",
  "resume-keyword-analyzer",
  "job-match-recommendations",
  "career-market-insights",
] as const;

export type SeoPageKey = (typeof SEO_PAGE_KEYS)[number];

export function isSeoPageKey(value: string): value is SeoPageKey {
  return SEO_PAGE_KEYS.includes(value as SeoPageKey);
}

export type SeoPageSpec = {
  path: `/${SeoPageKey}`;
  navLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  summary: string;
  primaryCta: string;
  workspaceView: string;
  metrics: Array<{ value: string; label: string }>;
  steps: Array<{ number: string; title: string; body: string }>;
  benefits: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  keywords: string[];
};

export const SEO_PAGES: Record<SeoPageKey, SeoPageSpec> = {
  "resume-job-description-match": {
    path: "/resume-job-description-match",
    navLabel: "Resume–JD Match",
    eyebrow: "Resume to job description matching",
    title: "Match your resume to a job description without inventing experience.",
    description:
      "Compare your resume with any job description, separate required from preferred keywords, and connect every match to evidence you can defend in an interview.",
    summary:
      "CareerStoryMap turns a vague match score into an evidence map: what the role asks for, where your resume proves it, and which gaps need an honest plan.",
    primaryCta: "Match resume to JD",
    workspaceView: "Analyze",
    metrics: [
      { value: "3 layers", label: "Requirement, evidence, gap" },
      { value: "0", label: "Invented achievements" },
      { value: "40", label: "Interface languages" },
    ],
    steps: [
      {
        number: "01",
        title: "Add the job description",
        body: "Paste the JD or import a document. CareerStoryMap identifies must-haves, core responsibilities, and useful context.",
      },
      {
        number: "02",
        title: "Connect resume evidence",
        body: "Each keyword is linked to a concrete line from your resume instead of being counted as an isolated term.",
      },
      {
        number: "03",
        title: "Turn the map into a story",
        body: "Use the strongest proof in applications and interviews while keeping unsupported requirements visible as gaps.",
      },
    ],
    benefits: [
      {
        title: "Required vs. preferred",
        body: "Prioritize the requirements that can block an application instead of treating every keyword as equal.",
      },
      {
        title: "Evidence-linked scoring",
        body: "A match only becomes useful when you can point to the action, decision, and outcome behind it.",
      },
      {
        title: "Truthful gap handling",
        body: "See what is missing and prepare a credible bridge without rewriting your history.",
      },
    ],
    faqs: [
      {
        question: "What is resume-to-job-description matching?",
        answer:
          "It is a structured comparison between the skills and responsibilities in a job description and the evidence present in a resume. CareerStoryMap also separates required and preferred signals.",
      },
      {
        question: "Does CareerStoryMap rewrite my experience?",
        answer:
          "No. It can help you phrase supported experience more clearly, but it keeps gaps visible and does not create achievements you cannot prove.",
      },
    ],
    keywords: [
      "resume job description match",
      "resume JD matcher",
      "resume match score",
      "job description analyzer",
      "ATS resume matching",
    ],
  },
  "career-story-builder": {
    path: "/career-story-builder",
    navLabel: "Career Story Builder",
    eyebrow: "Evidence-grounded career storytelling",
    title: "Build interview stories from work you can prove.",
    description:
      "Turn resume achievements into concise, role-specific interview stories with a clear situation, decision, action, and measurable result.",
    summary:
      "CareerStoryMap helps you find the strongest story for a role—not the most polished story in isolation—then keeps every claim traceable to your source material.",
    primaryCta: "Build my career story",
    workspaceView: "Analyze",
    metrics: [
      { value: "4 parts", label: "Context, decision, action, result" },
      { value: "1 source", label: "Your real experience" },
      { value: "Role-fit", label: "Story selection" },
    ],
    steps: [
      {
        number: "01",
        title: "Find the proof",
        body: "Identify decisions, constraints, actions, and outcomes already present in your resume or supporting documents.",
      },
      {
        number: "02",
        title: "Choose the right angle",
        body: "Map the proof to the role's priorities so the story answers why this experience matters here.",
      },
      {
        number: "03",
        title: "Practice the delivery",
        body: "Refine the story for different interviewers while preserving the same factual spine.",
      },
    ],
    benefits: [
      {
        title: "A story spine you can remember",
        body: "Use a repeatable structure without sounding memorized or forcing every answer into a generic template.",
      },
      {
        title: "Role-specific emphasis",
        body: "The same project can support a leadership, analytical, operational, or collaboration story depending on the JD.",
      },
      {
        title: "Confidence from evidence",
        body: "Interview confidence grows when each claim has a detail you can explain under follow-up pressure.",
      },
    ],
    faqs: [
      {
        question: "Is this a STAR interview answer generator?",
        answer:
          "It can produce STAR-compatible stories, but it starts with verified evidence and role relevance rather than generating a generic answer from a job title.",
      },
      {
        question: "Can I build different stories for the same experience?",
        answer:
          "Yes. CareerStoryMap can surface different truthful angles while keeping the underlying action and outcome consistent.",
      },
    ],
    keywords: [
      "career story builder",
      "interview story generator",
      "STAR interview answer builder",
      "career storytelling",
      "behavioral interview stories",
    ],
  },
  "ai-mock-interview": {
    path: "/ai-mock-interview",
    navLabel: "AI Mock Interview",
    eyebrow: "Voice and text interview practice",
    title: "Practice the interview behind the interview.",
    description:
      "Rehearse with evidence-grounded AI interviewers for HR screening, hiring manager, executive, peer, and case interview scenarios.",
    summary:
      "CareerStoryMap changes the interviewer, pressure, and follow-up style while checking whether your answer remains relevant, specific, structured, and supportable.",
    primaryCta: "Start a mock interview",
    workspaceView: "Interview Studio",
    metrics: [
      { value: "6", label: "Interviewer personas" },
      { value: "Voice + text", label: "Practice modes" },
      { value: "5 signals", label: "Answer feedback" },
    ],
    steps: [
      {
        number: "01",
        title: "Choose the interviewer",
        body: "Practice HR screening, hiring manager, COO, CEO, future teammate, or case breakdown conversations.",
      },
      {
        number: "02",
        title: "Answer with your evidence",
        body: "Respond by voice or text using the resume and job description already mapped in your workspace.",
      },
      {
        number: "03",
        title: "Improve the weak link",
        body: "Review relevance, evidence, outcome, structure, and confidence—then repeat the question with a sharper story.",
      },
    ],
    benefits: [
      {
        title: "Persona-specific pressure",
        body: "An HR screen tests clarity; a hiring manager probes ownership; an executive looks for judgment and business impact.",
      },
      {
        title: "Evidence before polish",
        body: "Feedback rewards defensible details instead of confident language unsupported by your experience.",
      },
      {
        title: "Coaching or realistic mode",
        body: "Learn with visible guidance, then remove the scaffolding for a more interview-like rehearsal.",
      },
    ],
    faqs: [
      {
        question: "Can I practice an AI mock interview with my own job description?",
        answer:
          "Yes. Add the target JD and your resume first so questions and feedback can focus on that role's actual requirements.",
      },
      {
        question: "Does voice practice upload my audio?",
        answer:
          "The public workspace uses browser speech capabilities when available. The interface explains when a configured model or external service would be involved.",
      },
    ],
    keywords: [
      "AI mock interview",
      "mock interview practice",
      "AI interview coach",
      "voice interview practice",
      "behavioral interview practice",
    ],
  },
  "resume-keyword-analyzer": {
    path: "/resume-keyword-analyzer",
    navLabel: "Keyword Analyzer",
    eyebrow: "Resume keyword analysis with context",
    title: "Find the keywords that matter—and the evidence behind them.",
    description:
      "Analyze required, core, and preferred job keywords, find supported synonyms, and see the exact resume evidence behind every match.",
    summary:
      "CareerStoryMap treats keywords as signals inside a role, not a checklist to stuff into a resume. You see priority, coverage, and proof in one matrix.",
    primaryCta: "Analyze resume keywords",
    workspaceView: "Analyze",
    metrics: [
      { value: "3 tiers", label: "Required, core, preferred" },
      { value: "Synonym-aware", label: "Keyword matching" },
      { value: "Line-level", label: "Evidence traceability" },
    ],
    steps: [
      {
        number: "01",
        title: "Extract role signals",
        body: "Identify tools, domain knowledge, responsibilities, and outcome language from the JD.",
      },
      {
        number: "02",
        title: "Check supported variants",
        body: "Recognize practical synonyms such as dashboards and data visualization without rewarding unrelated keyword repetition.",
      },
      {
        number: "03",
        title: "Strengthen the proof",
        body: "Improve weak resume bullets with clearer actions and results only where your source evidence supports them.",
      },
    ],
    benefits: [
      {
        title: "Priority-aware analysis",
        body: "A repeated preferred tool should not outweigh an unsupported must-have responsibility.",
      },
      {
        title: "Human-readable evidence",
        body: "See the resume line behind the result instead of receiving an unexplained percentage.",
      },
      {
        title: "No keyword stuffing",
        body: "The goal is relevance and clarity for both readers and systems—not artificial repetition.",
      },
    ],
    faqs: [
      {
        question: "Is this an ATS keyword checker?",
        answer:
          "It covers common ATS-oriented keyword analysis, but adds requirement priority, synonym handling, and evidence traceability for human review and interview preparation.",
      },
      {
        question: "Will adding every missing keyword improve my resume?",
        answer:
          "No. Only add language that accurately describes your experience. Unsupported keywords can damage credibility in screening and interviews.",
      },
    ],
    keywords: [
      "resume keyword analyzer",
      "ATS keyword checker",
      "resume keyword scanner",
      "job description keywords",
      "resume skills match",
    ],
  },
  "job-match-recommendations": {
    path: "/job-match-recommendations",
    navLabel: "Job Recommendations",
    eyebrow: "Story-qualified job discovery",
    title: "Get job recommendations your story can actually support.",
    description:
      "Find roles worldwide using skills, must-have coverage, proof strength, location, work style, and the interview story your evidence can carry.",
    summary:
      "CareerStoryMap's Story Signal goes beyond title similarity. It recommends a role only when your evidence supports a credible reason to apply and clearly labels the remaining gaps.",
    primaryCta: "Find stronger-fit roles",
    workspaceView: "Recommendations",
    metrics: [
      { value: "Worldwide", label: "Location scope" },
      { value: "Proof-to-role", label: "Ranking method" },
      { value: "Approved", label: "Employer sources" },
    ],
    steps: [
      {
        number: "01",
        title: "Set the search scope",
        body: "Choose worldwide or regional discovery, work style, role family, industry, and practical constraints.",
      },
      {
        number: "02",
        title: "Rank by story fit",
        body: "Combine must-have coverage, proof count, quantified outcomes, and visible gaps instead of relying on title similarity alone.",
      },
      {
        number: "03",
        title: "Track the right reason",
        body: "Save the job together with its strongest defensible story so your application and interview preparation stay connected.",
      },
    ],
    benefits: [
      {
        title: "A reason, not just a score",
        body: "Every recommendation explains why the role fits now and which experience can anchor the application.",
      },
      {
        title: "Strict alert thresholds",
        body: "Notifications can require zero unsupported must-haves and a minimum strength of measurable evidence.",
      },
      {
        title: "Source provenance",
        body: "Public discovery is designed around official employer ATS endpoints, licensed feeds, and user-provided links.",
      },
    ],
    faqs: [
      {
        question: "How are job recommendations different from a job board?",
        answer:
          "A job board primarily retrieves listings. CareerStoryMap ranks eligible roles by whether your verified experience can support the requirements and a credible interview story.",
      },
      {
        question: "Can I receive alerts for matching roles?",
        answer:
          "Yes. Story Signal can notify and track roles that pass your evidence, gap, and location thresholds when notifications are enabled.",
      },
    ],
    keywords: [
      "AI job recommendations",
      "job match recommendations",
      "career match AI",
      "jobs matching my resume",
      "global job recommendations",
    ],
  },
  "career-market-insights": {
    path: "/career-market-insights",
    navLabel: "Market Insights",
    eyebrow: "Global career market intelligence",
    title: "See where career demand is moving.",
    description:
      "Explore job openings, momentum, regional share, and changing demand across locations, role families, industries, and time periods.",
    summary:
      "CareerStoryMap connects market movement with your own evidence profile, helping you decide where to search, which story to lead with, and what capability to build next.",
    primaryCta: "Explore market insights",
    workspaceView: "Market Insights",
    metrics: [
      { value: "Global", label: "Adjustable geography" },
      { value: "Role + sector", label: "Interactive filters" },
      { value: "Visible", label: "Data provenance" },
    ],
    steps: [
      {
        number: "01",
        title: "Choose a market",
        body: "Move from worldwide context to a country or region and select the role family and industry you care about.",
      },
      {
        number: "02",
        title: "Compare openings and momentum",
        body: "Read current volume alongside recent direction so a large but declining market is not mistaken for accelerating demand.",
      },
      {
        number: "03",
        title: "Connect demand to your evidence",
        body: "Use rising skills and role requirements to refine your search, story portfolio, and learning priorities.",
      },
    ],
    benefits: [
      {
        title: "Adjustable geography",
        body: "Compare worldwide, regional, and country views without presenting one market as universal.",
      },
      {
        title: "Actionable interpretation",
        body: "Translate market movement into search strategy and story selection, not just charts.",
      },
      {
        title: "Honest data status",
        body: "Live, cached, sample, and user-supplied inputs should be distinguishable so decisions reflect data quality.",
      },
    ],
    faqs: [
      {
        question: "Are the job market numbers real time?",
        answer:
          "The interface identifies source and retrieval status. Exact freshness depends on the connected approved provider; sample data is labeled and should not be presented as live market coverage.",
      },
      {
        question: "Can I filter insights by country and career field?",
        answer:
          "Yes. The market workspace supports geography, role family, industry, and time-period filters, subject to source coverage.",
      },
    ],
    keywords: [
      "career market insights",
      "job market trends",
      "global job openings data",
      "career demand by region",
      "job market analytics",
    ],
  },
};

export function metadataFor(key: SeoPageKey): Metadata {
  const page = SEO_PAGES[key];
  return {
    title: page.navLabel,
    description: page.description,
    alternates: { canonical: page.path },
    keywords: page.keywords,
    openGraph: {
      type: "website",
      url: page.path,
      title: `${page.navLabel} | CareerStoryMap`,
      description: page.description,
      images: [],
    },
    twitter: {
      card: "summary",
      title: `${page.navLabel} | CareerStoryMap`,
      description: page.description,
      images: [],
    },
  };
}
