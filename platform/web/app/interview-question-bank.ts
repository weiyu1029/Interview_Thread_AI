import type { InterviewPersonaId } from "./interview-speech";
import type { LocaleCode } from "./i18n";

export type InterviewQuestionTrack =
  | "role-fit"
  | "behavioral"
  | "leadership"
  | "technical"
  | "frontend"
  | "javascript"
  | "system-design"
  | "portfolio"
  | "customer"
  | "case";

export type InterviewQuestionDifficulty = 1 | 2 | 3;

export type InterviewQuestionLens =
  | "evidence"
  | "ownership"
  | "judgment"
  | "pressure"
  | "collaboration"
  | "learning"
  | "stakeholder"
  | "communication"
  | "scale";

export type OpenInterviewQuestionSourceId =
  | "interviewthread"
  | "system-design-primer"
  | "frontend-interview-questions"
  | "javascript-questions"
  | "data-science-interview-questions"
  | "ai-llm-interview-guide"
  | "ai-interview-questions";

export type OpenInterviewQuestionSource = {
  id: OpenInterviewQuestionSourceId;
  name: string;
  href: string;
  license: "MIT" | "CC BY 4.0";
  licenseHref: string;
  note: string;
  sourceCommit?: string;
  attribution?: string;
};

export type OpenInterviewQuestion = {
  id: string;
  persona: InterviewPersonaId;
  track: InterviewQuestionTrack;
  depth: 0 | 1 | 2 | 3 | 4;
  difficulty: InterviewQuestionDifficulty;
  lens?: InterviewQuestionLens;
  sourceId: OpenInterviewQuestionSourceId;
  /**
   * Community prompts are reviewed follow-up probes appended to the
   * evidence-aware, localized role question. Imported questions use this as
   * their complete reviewed prompt.
   */
  prompt?: string;
  topic?: string;
  sourcePath?: string;
  sourceLine?: number;
  sourceCommit?: string;
  sourceMode?: "selected" | "adapted" | "original";
  difficultyMode?: "declared" | "calibrated";
};

export const OPEN_INTERVIEW_QUESTION_SOURCES: readonly OpenInterviewQuestionSource[] = [
  {
    id: "interviewthread",
    name: "InterviewThread Community Question Bank",
    href: "https://github.com/weiyu1029/Interview_Thread_AI",
    license: "MIT",
    licenseHref: "https://github.com/weiyu1029/Interview_Thread_AI/blob/main/LICENSE",
    note: "Original, evidence-grounded questions maintained in this repository.",
  },
  {
    id: "system-design-primer",
    name: "The System Design Primer",
    href: "https://github.com/donnemartin/system-design-primer",
    license: "CC BY 4.0",
    licenseHref:
      "https://github.com/donnemartin/system-design-primer/blob/master/LICENSE.txt",
    note: "System-design prompts adapted with attribution.",
  },
  {
    id: "frontend-interview-questions",
    name: "Front-end Developer Interview Questions",
    href: "https://github.com/h5bp/front-end-developer-interview-questions",
    license: "MIT",
    licenseHref:
      "https://github.com/h5bp/front-end-developer-interview-questions/blob/main/LICENSE.md",
    note: "Front-end prompts selected and lightly adapted for spoken practice.",
  },
  {
    id: "javascript-questions",
    name: "JavaScript Questions",
    href: "https://github.com/lydiahallie/javascript-questions",
    license: "MIT",
    licenseHref:
      "https://github.com/lydiahallie/javascript-questions/blob/master/LICENSE",
    note: "JavaScript concepts adapted into interviewer-style questions.",
  },
  {
    id: "data-science-interview-questions",
    name: "Data Science Interview Questions & Answers",
    href: "https://github.com/ajitsingh98/Data-Science-Interview-Questions-Answers",
    license: "MIT",
    licenseHref:
      "https://github.com/ajitsingh98/Data-Science-Interview-Questions-Answers/blob/main/LICENSE",
    note: "Data-science prompts selected, reviewed, and adapted for spoken practice.",
    sourceCommit: "ffd17a108d7087035568747eafc88c07f5b6bc6c",
    attribution: "Copyright (c) 2022 Ajit Kumar Singh.",
  },
  {
    id: "ai-llm-interview-guide",
    name: "AI & LLM Interview Guide",
    href: "https://github.com/bettyguo/ai-llm-interview-guide",
    license: "CC BY 4.0",
    licenseHref:
      "https://github.com/bettyguo/ai-llm-interview-guide/blob/main/LICENSE",
    note: "AI and LLM prompts adapted with attribution and a change notice.",
    sourceCommit: "4dc2fa6e76e003aef029361cfc4ca44d16696faf",
    attribution:
      "Betty Guo (Dongxin Guo / 郭东欣), llm-interview-prep (https://github.com/bettyguo/llm-interview-prep), University of Hong Kong, 2026. Adapted under CC BY 4.0.",
  },
  {
    id: "ai-interview-questions",
    name: "Landed AI Interview Questions",
    href: "https://github.com/landedjobs/ai-interview-questions",
    license: "MIT",
    licenseHref:
      "https://github.com/landedjobs/ai-interview-questions/blob/main/LICENSE",
    note: "AI, ML, product, and system-design prompts adapted for interview simulation.",
    sourceCommit: "401541b7e89b67686e5eaaa8b9523f1b99f0f096",
    attribution: "Copyright (c) 2026 Landed (b100x).",
  },
] as const;

const PERSONAS: readonly InterviewPersonaId[] = [
  "hr",
  "recruiter",
  "hiring-manager",
  "functional-lead",
  "technical",
  "system-design",
  "portfolio",
  "coo",
  "ceo",
  "peer",
  "cross-functional",
  "customer",
  "values",
  "case",
  "panel",
];

const PERSONA_TRACK: Record<InterviewPersonaId, InterviewQuestionTrack> = {
  hr: "role-fit",
  recruiter: "role-fit",
  "hiring-manager": "behavioral",
  "functional-lead": "leadership",
  technical: "technical",
  "system-design": "system-design",
  portfolio: "portfolio",
  coo: "leadership",
  ceo: "leadership",
  peer: "behavioral",
  "cross-functional": "behavioral",
  customer: "customer",
  values: "behavioral",
  case: "case",
  panel: "role-fit",
};

export const INTERVIEW_QUESTION_LENSES: readonly InterviewQuestionLens[] = [
  "evidence",
  "ownership",
  "judgment",
  "pressure",
  "collaboration",
  "learning",
  "stakeholder",
  "communication",
  "scale",
];

const COMMUNITY_PROBES: Record<
  InterviewQuestionDifficulty,
  Record<InterviewQuestionLens, string>
> = {
  1: {
    evidence:
      "Which specific detail, artifact, or observable result would let an interviewer verify that claim?",
    ownership:
      "Which part did you personally own, and which part belonged to someone else?",
    judgment:
      "What decision did you make, and what information made that choice reasonable at the time?",
    pressure:
      "What is one honest limitation or uncertainty in this example?",
    collaboration:
      "Who else helped make this outcome possible, and how did you work together?",
    learning:
      "What did this experience teach you that changed how you work now?",
    stakeholder:
      "Who was affected by your work, and how did you understand what they needed?",
    communication:
      "How did you explain the work to someone who did not share your context or expertise?",
    scale:
      "What would you keep the same, and what would you change, if the scope doubled?",
  },
  2: {
    evidence:
      "What was the baseline, what changed, and how did you measure the difference?",
    ownership:
      "Where did your authority end, and how did dependencies or collaborators shape the outcome?",
    judgment:
      "Which alternative did you reject, and what trade-off did you accept by choosing this path?",
    pressure:
      "What was the most likely failure mode, and what did you do to detect or reduce it?",
    collaboration:
      "Where did collaboration become difficult, and what did you do to restore progress without taking over someone else's work?",
    learning:
      "Which assumption proved wrong, how did you discover it, and what did you change because of it?",
    stakeholder:
      "Which stakeholder needs conflicted, and how did you decide whose constraint carried the most weight?",
    communication:
      "What was misunderstood at first, and how did you change the message, medium, or evidence to create alignment?",
    scale:
      "Which part of your approach would fail first at ten times the users, data, or team size, and why?",
  },
  3: {
    evidence:
      "Which part of the claim is least certain, and what evidence would disprove your interpretation?",
    ownership:
      "If a teammate disputed your ownership, what record or observable behavior would resolve the disagreement?",
    judgment:
      "If a key constraint reversed tomorrow, which part of your decision would change first and why?",
    pressure:
      "Assume the interviewer challenges your result as correlation rather than impact. How would you respond without overstating it?",
    collaboration:
      "If a key collaborator described the conflict differently, which evidence would help an interviewer reconcile both accounts?",
    learning:
      "Which lesson might be overfit to this one experience, and how would you test whether it generalizes?",
    stakeholder:
      "If the least powerful stakeholder challenged the outcome, what harm or blind spot might they reveal?",
    communication:
      "Give the same recommendation to an executive, a domain expert, and an affected user. What changes, and what must remain consistent?",
    scale:
      "At one hundred times the scale, which cost, reliability, governance, or organizational constraint becomes the binding limit first?",
  },
};

export function communityQuestionProbe(
  difficulty: InterviewQuestionDifficulty,
  lens: InterviewQuestionLens,
) {
  return COMMUNITY_PROBES[difficulty][lens];
}

const COMMUNITY_QUESTIONS: OpenInterviewQuestion[] = PERSONAS.flatMap(
  (persona) =>
    ([0, 1, 2, 3, 4] as const).flatMap((depth) =>
      ([1, 2, 3] as const).flatMap((difficulty) =>
        INTERVIEW_QUESTION_LENSES.map((lens) => ({
          id: `interviewthread-${persona}-${depth + 1}-l${difficulty}-${lens}`,
          persona,
          track: PERSONA_TRACK[persona],
          depth,
          difficulty,
          lens,
          sourceId: "interviewthread" as const,
          prompt: communityQuestionProbe(difficulty, lens),
          topic: `${lens} · stage ${depth + 1} · L${difficulty}`,
        })),
      ),
    ),
);

const SYSTEM_DESIGN_QUESTIONS: readonly OpenInterviewQuestion[] = [
  ["url-shortener", "Design a URL-shortening service. Clarify scale and requirements, then explain the data model, API, failure modes, and trade-offs.", "URL-shortening service", 1],
  ["social-feed", "Design a social-media feed and search experience. Explain write and read paths, ranking, fan-out, consistency, and abuse controls.", "social-media feed and search", 3],
  ["web-crawler", "Design a web crawler. Cover crawl policy, URL deduplication, scheduling, politeness, storage, failures, and horizontal scale.", "web crawler", 3],
  ["key-value-store", "Design a distributed key-value store for search infrastructure. State consistency, availability, partitioning, replication, and recovery choices.", "distributed key-value store", 3],
  ["sales-ranking", "Design a sales-ranking feature by category for a large marketplace. Define events, aggregation, freshness, corrections, and query patterns.", "marketplace sales ranking", 2],
  ["million-users", "Design a web application that can grow from its first users to millions. Explain the first architecture and each scaling trigger.", "application scaling to millions of users", 2],
  ["hash-map", "Design a hash map. Explain the API, hashing, collision handling, resizing, complexity, and tests for correctness.", "hash map", 2],
  ["lru-cache", "Design a least-recently-used cache with constant-time get and put operations. Explain the data structures, eviction behavior, and edge cases.", "LRU cache", 2],
  ["chat-server", "Design a chat server. Cover delivery guarantees, ordering, presence, offline messages, fan-out, storage, and reconnect behavior.", "chat server", 3],
  ["parking-lot", "Design the object model for a parking lot. Clarify vehicle and space rules, pricing, entry and exit flows, extensibility, and tests.", "parking-lot object model", 1],
].map(([id, prompt, topic, difficulty], index) => ({
  id: `system-design-primer-${id}`,
  persona: "system-design",
  track: "system-design",
  depth: (index % 5) as OpenInterviewQuestion["depth"],
  difficulty: difficulty as InterviewQuestionDifficulty,
  sourceId: "system-design-primer",
  prompt: prompt as string,
  topic: topic as string,
}));

const FRONTEND_QUESTIONS: readonly OpenInterviewQuestion[] = [
  ["doctype", "What does a document type declaration do, and what can go wrong when it is missing?", "document type declarations", 1],
  ["multilingual-page", "How would you serve a page whose content is available in multiple languages while preserving accessibility and search discoverability?", "multilingual web pages", 2],
  ["data-attributes", "When are HTML data attributes appropriate, and when would another state or data mechanism be safer?", "HTML data attributes", 1],
  ["css-specificity", "Explain CSS specificity using a concrete conflict. How would you fix the conflict without creating a more fragile selector?", "CSS specificity", 2],
  ["layout-performance", "A page feels slow and shifts while loading. How would you measure the problem, isolate the cause, and verify the fix?", "front-end performance and layout shift", 3],
  ["event-delegation", "Explain event delegation. When does it simplify a UI, and which propagation or accessibility issues would you check?", "event delegation", 2],
  ["accessible-component", "How would you make an interactive component usable with a keyboard and screen reader, and how would you test it?", "accessible interactive components", 2],
  ["frontend-testing", "Design a test strategy for a front-end feature. What belongs in unit, integration, end-to-end, visual, and accessibility tests?", "front-end testing", 3],
].map(([id, prompt, topic, difficulty], index) => ({
  id: `frontend-interview-questions-${id}`,
  persona: "technical",
  track: "frontend",
  depth: (index % 5) as OpenInterviewQuestion["depth"],
  difficulty: difficulty as InterviewQuestionDifficulty,
  sourceId: "frontend-interview-questions",
  prompt: prompt as string,
  topic: topic as string,
}));

const JAVASCRIPT_QUESTIONS: readonly OpenInterviewQuestion[] = [
  ["declarations", "Compare var, let, and const. Explain scope, hoisting, reassignment, and the rule you use in production code.", "JavaScript declarations", 1],
  ["event-loop", "Explain the JavaScript event loop. In what order do synchronous code, microtasks, and task-queue callbacks run?", "JavaScript event loop", 2],
  ["this-binding", "How is this resolved for a regular function versus an arrow function, and which bugs can that difference create?", "JavaScript this binding", 2],
  ["prototypes", "Explain JavaScript prototype inheritance. How would you inspect and reason about a property lookup across the chain?", "JavaScript prototypes", 2],
  ["equality", "Compare loose and strict equality in JavaScript. Which coercion cases are risky, and what convention would you enforce?", "JavaScript equality", 1],
  ["copying", "Compare shallow and deep copying in JavaScript. Which nested-data bugs can appear, and how would you choose an approach?", "JavaScript object copying", 2],
  ["promise-errors", "How do errors propagate through a Promise chain and async functions? Show where you would catch, rethrow, and report them.", "Promise error handling", 3],
  ["debounce-throttle", "Compare debouncing and throttling. Choose one for search input and one for scroll handling, then explain testing and cleanup.", "debouncing and throttling", 2],
].map(([id, prompt, topic, difficulty], index) => ({
  id: `javascript-questions-${id}`,
  persona: "technical",
  track: "javascript",
  depth: (index % 5) as OpenInterviewQuestion["depth"],
  difficulty: difficulty as InterviewQuestionDifficulty,
  sourceId: "javascript-questions",
  prompt: prompt as string,
  topic: topic as string,
}));

/**
 * The evidence-aware InterviewThread matrix and the small hand-reviewed bank
 * stay in the initial application bundle. The larger licensed English source
 * bank is loaded only when someone opens the English Interview Studio.
 */
export const OPEN_INTERVIEW_QUESTIONS: readonly OpenInterviewQuestion[] = [
  ...COMMUNITY_QUESTIONS,
  ...SYSTEM_DESIGN_QUESTIONS,
  ...FRONTEND_QUESTIONS,
  ...JAVASCRIPT_QUESTIONS,
];

/**
 * Returns only prompts that are safe to present and read aloud in the active
 * locale. The imported open-source bank is currently reviewed in English;
 * every other locale therefore receives the InterviewThread matrix, whose
 * question text is localized at render time.
 */
export function baselineQuestionsForInterviewLocale(
  locale: LocaleCode,
): readonly OpenInterviewQuestion[] {
  return locale === "en" ? OPEN_INTERVIEW_QUESTIONS : COMMUNITY_QUESTIONS;
}

export async function questionsForInterviewLocale(
  locale: LocaleCode,
): Promise<readonly OpenInterviewQuestion[]> {
  if (locale !== "en") return COMMUNITY_QUESTIONS;
  const { LICENSED_SOURCE_QUESTIONS } = await import(
    "./interview-question-bank-generated.ts"
  );
  return [...OPEN_INTERVIEW_QUESTIONS, ...LICENSED_SOURCE_QUESTIONS];
}

export const INTERVIEW_QUESTION_TRACKS: readonly InterviewQuestionTrack[] = [
  "role-fit",
  "behavioral",
  "leadership",
  "technical",
  "frontend",
  "javascript",
  "system-design",
  "portfolio",
  "customer",
  "case",
];

export function openInterviewQuestionSource(
  sourceId: OpenInterviewQuestionSourceId,
) {
  return OPEN_INTERVIEW_QUESTION_SOURCES.find((source) => source.id === sourceId)!;
}

export function questionsForInterviewRole(
  persona: InterviewPersonaId,
  track: InterviewQuestionTrack | "all",
  depth: OpenInterviewQuestion["depth"] | "all",
  difficulty: InterviewQuestionDifficulty | "all",
  lens: InterviewQuestionLens | "all" = "all",
  questions: readonly OpenInterviewQuestion[] = OPEN_INTERVIEW_QUESTIONS,
) {
  return questions.filter(
    (question) =>
      question.persona === persona &&
      (track === "all" || question.track === track) &&
      (depth === "all" || question.depth === depth) &&
      (difficulty === "all" || question.difficulty === difficulty) &&
      (lens === "all" || question.lens === lens),
  );
}
