export type JobSearchCandidate = {
  id: string;
  title: string;
  company?: string;
  description?: string;
  department?: string;
  region?: string;
  country?: string;
  city?: string;
  workStyle?: string;
  industry?: string;
  employmentType?: string;
  seniority?: string;
  salaryMin?: number;
  salaryMax?: number;
  latitude?: number;
  longitude?: number;
  publishedAt?: string;
  source?: string;
  sourceUrl?: string;
  applyUrl?: string;
  isLive?: boolean;
  storyFit?: number;
  proofCount?: number;
  requiredGapCount?: number;
};

export type JobSearchFilters = {
  roleQuery?: string;
  region?: string;
  country?: string;
  workStyle?: string;
  industry?: string;
  employmentType?: string;
  seniority?: string;
  postedWithinDays?: number;
  minSalary?: number;
  sourceKind?: "all" | "live" | "example";
  requireEvidenceDescription?: boolean;
  sortBy?: "story-fit" | "newest" | "fewest-gaps" | "title";
  now?: string | Date;
};

export const JOB_INDUSTRIES = [
  "All industries",
  "Technology",
  "Financial services",
  "Healthcare",
  "Consumer",
  "Climate & energy",
  "Professional services",
  "Education",
  "Government & public sector",
  "Media & communications",
  "Manufacturing",
  "Retail & e-commerce",
  "Nonprofit & social impact",
  "Other",
] as const;

export const JOB_SEARCH_INDUSTRIES = JOB_INDUSTRIES;

export const EMPLOYMENT_TYPES = [
  "All employment types",
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Temporary",
] as const;

export const SENIORITY_LEVELS = [
  "All experience levels",
  "Internship & entry level",
  "Mid level",
  "Senior",
  "Lead & manager",
  "Executive",
] as const;

const COUNTRY_REGION: Record<string, string> = {
  "United States": "North America",
  Canada: "North America",
  Mexico: "North America",
  "United Kingdom": "Europe",
  Germany: "Europe",
  France: "Europe",
  Netherlands: "Europe",
  Spain: "Europe",
  Japan: "Asia-Pacific",
  "South Korea": "Asia-Pacific",
  Singapore: "Asia-Pacific",
  Taiwan: "Asia-Pacific",
  Australia: "Asia-Pacific",
  India: "Asia-Pacific",
  Brazil: "Latin America",
  Argentina: "Latin America",
  Colombia: "Latin America",
  "United Arab Emirates": "Middle East & Africa",
  "Saudi Arabia": "Middle East & Africa",
  "South Africa": "Middle East & Africa",
  Kenya: "Middle East & Africa",
};

const SEARCH_ALIASES: Record<string, readonly string[]> = {
  ai: ["artificial intelligence", "machine learning", "ml"],
  analyst: ["analytics", "analysis", "insights", "intelligence"],
  analytics: ["analyst", "analysis", "insights", "intelligence"],
  developer: ["engineer", "software"],
  engineer: ["developer", "software"],
  finance: ["financial", "fintech", "banking"],
  healthcare: ["health", "medical", "clinical", "patient"],
  manager: ["management", "lead", "leader"],
  operations: ["operational", "ops"],
  remote: ["distributed", "work from home"],
};

function normalizeText(value: unknown) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#.]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeJobQuery(query: string) {
  return normalizeText(query).split(" ").filter(Boolean);
}

function searchableText(job: JobSearchCandidate) {
  return normalizeText(
    [
      job.title,
      job.company,
      job.description,
      job.department,
      job.industry,
      job.city,
      job.country,
      job.workStyle,
      job.employmentType,
      job.seniority,
    ].join(" "),
  );
}

function tokenMatches(text: string, token: string) {
  if (text.includes(token)) return true;
  return (SEARCH_ALIASES[token] || []).some((alias) => text.includes(alias));
}

function queryScore(job: JobSearchCandidate, tokens: readonly string[]) {
  if (!tokens.length) return 0;
  const title = normalizeText(job.title);
  const company = normalizeText(job.company);
  const department = normalizeText(job.department);
  const description = normalizeText(job.description);
  return tokens.reduce((score, token) => {
    if (tokenMatches(title, token)) return score + 8;
    if (tokenMatches(company, token)) return score + 5;
    if (tokenMatches(department, token)) return score + 3;
    if (tokenMatches(description, token)) return score + 1;
    return score;
  }, 0);
}

export function regionForJob(job: JobSearchCandidate) {
  if (job.region && job.region !== "Worldwide") return job.region;
  return COUNTRY_REGION[job.country || ""] || job.region || "Worldwide";
}

export function inferEmploymentType(job: JobSearchCandidate) {
  if (job.employmentType) return job.employmentType;
  const text = normalizeText(`${job.title} ${job.description}`);
  if (/\bintern(ship)?\b/.test(text)) return "Internship";
  if (/\bpart time\b/.test(text)) return "Part-time";
  if (/\b(contract|contractor|freelance|consultant)\b/.test(text)) return "Contract";
  if (/\b(temporary|seasonal|fixed term)\b/.test(text)) return "Temporary";
  if (/\bfull time\b/.test(text)) return "Full-time";
  return "";
}

export function inferSeniority(job: JobSearchCandidate) {
  if (job.seniority) return job.seniority;
  const text = normalizeText(`${job.title} ${job.description}`);
  if (/\b(chief|ceo|cfo|coo|cto|vp|vice president|executive director)\b/.test(text)) {
    return "Executive";
  }
  if (/\b(head|manager|director|lead|principal)\b/.test(text)) {
    return "Lead & manager";
  }
  if (/\b(senior|sr|staff)\b/.test(text)) return "Senior";
  if (/\b(intern|internship|entry level|junior|graduate|new grad|associate)\b/.test(text)) {
    return "Internship & entry level";
  }
  return "";
}

export function inferIndustry(job: JobSearchCandidate) {
  const declared = job.industry || "";
  if (JOB_INDUSTRIES.includes(declared as (typeof JOB_INDUSTRIES)[number])) {
    return declared;
  }
  const text = normalizeText(
    `${declared} ${job.department} ${job.company} ${job.title} ${job.description}`,
  );
  const rules: Array<[string, RegExp]> = [
    ["Financial services", /\b(finance|financial|fintech|bank|banking|insurance|payments|risk)\b/],
    ["Healthcare", /\b(health|healthcare|medical|clinical|patient|hospital|biotech|pharma)\b/],
    ["Climate & energy", /\b(climate|energy|renewable|solar|wind|sustainability|utility|utilities)\b/],
    ["Education", /\b(education|school|university|learning|edtech|student)\b/],
    ["Government & public sector", /\b(government|public sector|civic|municipal|federal|defense)\b/],
    ["Media & communications", /\b(media|advertising|publisher|publishing|communications|entertainment)\b/],
    ["Manufacturing", /\b(manufacturing|industrial|factory|automotive|aerospace|supply chain)\b/],
    ["Retail & e-commerce", /\b(retail|commerce|ecommerce|e commerce|marketplace|merchandising)\b/],
    ["Nonprofit & social impact", /\b(nonprofit|non profit|charity|foundation|social impact|ngo)\b/],
    ["Professional services", /\b(consulting|consultant|advisory|legal|accounting|professional services)\b/],
    ["Consumer", /\b(consumer|food|beverage|travel|hospitality|gaming|fashion)\b/],
    ["Technology", /\b(technology|software|saas|cloud|developer|engineering|cyber|artificial intelligence|machine learning)\b/],
  ];
  return rules.find(([, pattern]) => pattern.test(text))?.[0] || "Other";
}

export function enrichJobSearchMetadata<T extends JobSearchCandidate>(job: T): T {
  return {
    ...job,
    region: regionForJob(job),
    industry: inferIndustry(job),
    employmentType: inferEmploymentType(job) || undefined,
    seniority: inferSeniority(job) || undefined,
  };
}

function canonicalUrl(job: JobSearchCandidate) {
  const raw = job.applyUrl || job.sourceUrl;
  if (!raw) return `id:${job.id}`;
  try {
    const url = new URL(raw);
    url.hash = "";
    url.search = "";
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.toString().toLowerCase();
  } catch {
    return `id:${job.id}`;
  }
}

function compareRichness(left: JobSearchCandidate, right: JobSearchCandidate) {
  const leftDescription = normalizeText(left.description).length;
  const rightDescription = normalizeText(right.description).length;
  if (leftDescription !== rightDescription) return leftDescription - rightDescription;
  const rightMetadata = [
    right.department,
    right.employmentType,
    right.seniority,
    right.salaryMin,
    right.salaryMax,
    right.country,
    right.city,
    right.applyUrl,
  ].filter((value) => value !== undefined && value !== "").length;
  const leftMetadata = [
    left.department,
    left.employmentType,
    left.seniority,
    left.salaryMin,
    left.salaryMax,
    left.country,
    left.city,
    left.applyUrl,
  ].filter((value) => value !== undefined && value !== "").length;
  if (leftMetadata !== rightMetadata) return leftMetadata - rightMetadata;
  return publishedTime(left) - publishedTime(right);
}

function deduplicateJobs<T extends JobSearchCandidate>(jobs: readonly T[]) {
  const deduplicated = new Map<string, T>();
  jobs.forEach((job) => {
    const key = canonicalUrl(job);
    const existing = deduplicated.get(key);
    if (!existing || compareRichness(job, existing) > 0) deduplicated.set(key, job);
  });
  return [...deduplicated.values()];
}

function isAll(value: string | undefined) {
  return !value || value.startsWith("All ") || value === "Worldwide";
}

function publishedTime(job: JobSearchCandidate) {
  return Date.parse(job.publishedAt || "") || 0;
}

export function jobSearchCapabilities(jobs: readonly JobSearchCandidate[]) {
  return {
    employmentType: jobs.some((job) => Boolean(job.employmentType)),
    seniority: jobs.some((job) => Boolean(job.seniority)),
    datePosted: jobs.some((job) => Boolean(job.publishedAt && publishedTime(job))),
    salary: jobs.some((job) => Number.isFinite(job.salaryMin) || Number.isFinite(job.salaryMax)),
    radius: jobs.some(
      (job) => Number.isFinite(job.latitude) && Number.isFinite(job.longitude),
    ),
  };
}

export function filterAndRankJobs<T extends JobSearchCandidate>(
  jobs: readonly T[],
  filters: JobSearchFilters = {},
): T[] {
  const tokens = tokenizeJobQuery(filters.roleQuery || "");
  const now = new Date(filters.now || Date.now()).getTime();
  const cutoff = filters.postedWithinDays
    ? now - filters.postedWithinDays * 24 * 60 * 60 * 1_000
    : 0;

  const filtered = deduplicateJobs(jobs)
    .filter((job) => !filters.requireEvidenceDescription || Boolean(normalizeText(job.description)))
    .filter((job) => tokens.every((token) => tokenMatches(searchableText(job), token)))
    .filter((job) => isAll(filters.region) || regionForJob(job) === filters.region)
    .filter((job) => isAll(filters.country) || job.country === filters.country)
    .filter((job) => isAll(filters.workStyle) || job.workStyle === filters.workStyle)
    .filter((job) => isAll(filters.industry) || inferIndustry(job) === filters.industry)
    .filter(
      (job) =>
        isAll(filters.employmentType) ||
        inferEmploymentType(job) === filters.employmentType,
    )
    .filter((job) => isAll(filters.seniority) || inferSeniority(job) === filters.seniority)
    .filter((job) => !cutoff || publishedTime(job) >= cutoff)
    .filter((job) => !filters.minSalary || (job.salaryMin || 0) >= filters.minSalary)
    .filter((job) => {
      if (!filters.sourceKind || filters.sourceKind === "all") return true;
      return filters.sourceKind === "live" ? Boolean(job.isLive) : !job.isLive;
    });

  return filtered.sort((left, right) => {
    if (tokens.length) {
      const relevance = queryScore(right, tokens) - queryScore(left, tokens);
      if (relevance) return relevance;
    }
    if (filters.sortBy === "newest") {
      const newest = publishedTime(right) - publishedTime(left);
      if (newest) return newest;
    } else if (filters.sortBy === "fewest-gaps") {
      const gaps = (left.requiredGapCount || 0) - (right.requiredGapCount || 0);
      if (gaps) return gaps;
    } else if (filters.sortBy === "title") {
      const title = left.title.localeCompare(right.title);
      if (title) return title;
    }
    const fit = (right.storyFit || 0) - (left.storyFit || 0);
    if (fit) return fit;
    const gaps = (left.requiredGapCount || 0) - (right.requiredGapCount || 0);
    if (gaps) return gaps;
    const proofs = (right.proofCount || 0) - (left.proofCount || 0);
    if (proofs) return proofs;
    const newest = publishedTime(right) - publishedTime(left);
    if (newest) return newest;
    return left.title.localeCompare(right.title);
  });
}
