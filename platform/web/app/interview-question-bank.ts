import type { InterviewPersonaId } from "./interview-speech";

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

export type OpenInterviewQuestionSourceId =
  | "interviewthread"
  | "system-design-primer"
  | "frontend-interview-questions"
  | "javascript-questions";

export type OpenInterviewQuestionSource = {
  id: OpenInterviewQuestionSourceId;
  name: string;
  href: string;
  license: "MIT" | "CC BY 4.0";
  licenseHref: string;
  note: string;
};

export type OpenInterviewQuestion = {
  id: string;
  persona: InterviewPersonaId;
  track: InterviewQuestionTrack;
  depth: 0 | 1 | 2 | 3 | 4;
  difficulty: InterviewQuestionDifficulty;
  sourceId: OpenInterviewQuestionSourceId;
  /**
   * Community questions are rendered by questionForInterview so they remain
   * evidence-aware and localized. Imported questions use this reviewed prompt.
   */
  prompt?: string;
  topic?: string;
};

export const OPEN_INTERVIEW_QUESTION_SOURCES: readonly OpenInterviewQuestionSource[] = [
  {
    id: "interviewthread",
    name: "InterviewThread Community Question Bank",
    href: "https://github.com/weiyu1029/careerproof-agent",
    license: "MIT",
    licenseHref: "https://github.com/weiyu1029/careerproof-agent/blob/main/LICENSE",
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
      "https://github.com/h5bp/front-end-developer-interview-questions/blob/main/LICENSE",
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

const DEPTH_DIFFICULTY: readonly InterviewQuestionDifficulty[] = [1, 1, 2, 2, 3];

const COMMUNITY_QUESTIONS: OpenInterviewQuestion[] = PERSONAS.flatMap(
  (persona) =>
    DEPTH_DIFFICULTY.map((difficulty, depth) => ({
      id: `interviewthread-${persona}-${depth + 1}`,
      persona,
      track: PERSONA_TRACK[persona],
      depth: depth as OpenInterviewQuestion["depth"],
      difficulty,
      sourceId: "interviewthread" as const,
    })),
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

export const OPEN_INTERVIEW_QUESTIONS: readonly OpenInterviewQuestion[] = [
  ...COMMUNITY_QUESTIONS,
  ...SYSTEM_DESIGN_QUESTIONS,
  ...FRONTEND_QUESTIONS,
  ...JAVASCRIPT_QUESTIONS,
];

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
) {
  return OPEN_INTERVIEW_QUESTIONS.filter(
    (question) =>
      question.persona === persona &&
      (track === "all" || question.track === track) &&
      (depth === "all" || question.depth === depth) &&
      (difficulty === "all" || question.difficulty === difficulty),
  );
}
