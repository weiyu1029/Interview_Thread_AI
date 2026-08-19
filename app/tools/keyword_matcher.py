from __future__ import annotations

import re
from collections.abc import Iterable
from dataclasses import asdict, dataclass
from typing import Literal

Priority = Literal["Required", "Core", "Preferred"]
MatchStatus = Literal["Strong", "Partial", "Gap"]


METRIC_RE = re.compile(
    r"(?<!\w)(?:\d+(?:\.\d+)?%|\$\s?\d[\d,.]*|\d{1,3}(?:,\d{3})+|"
    r"\d+\+|\d+\s*(?:hours?|days?|weeks?|months?|users?|customers?|records?|skus?))(?!\w)",
    re.IGNORECASE,
)
ACTION_RE = re.compile(
    r"\b(?:analyzed|automated|built|created|delivered|designed|developed|drove|"
    r"implemented|improved|increased|launched|led|optimized|partnered|reduced|"
    r"scaled|streamlined|validated)\b",
    re.IGNORECASE,
)
REQUIRED_CUES = re.compile(
    r"\b(?:required|must|minimum qualification|need to|proficien|expertise|"
    r"strong command|demonstrated ability)\b",
    re.IGNORECASE,
)
PREFERRED_CUES = re.compile(
    r"\b(?:preferred|nice[- ]to[- ]have|bonus|plus|ideally|desirable)\b",
    re.IGNORECASE,
)
EXPLICIT_TERM_RE = re.compile(
    r"\b(?:experience|proficiency|knowledge|familiarity|expertise|skilled)\s+"
    r"(?:working\s+)?(?:with|in|of)\s+([^.;:]+)",
    re.IGNORECASE,
)


STOP_WORDS = {
    "ability",
    "about",
    "across",
    "also",
    "and",
    "are",
    "business",
    "candidate",
    "company",
    "demonstrated",
    "experience",
    "excellent",
    "familiarity",
    "for",
    "from",
    "have",
    "including",
    "knowledge",
    "minimum",
    "must",
    "our",
    "preferred",
    "proficiency",
    "required",
    "role",
    "skills",
    "strong",
    "team",
    "the",
    "this",
    "with",
    "work",
    "working",
    "years",
    "you",
    "your",
}


# Canonical concepts and spelling variants. Phrase matching uses token boundaries, so
# short skills such as R and AI do not accidentally match "risk" or "retail".
KEYWORD_TAXONOMY: dict[str, dict[str, tuple[str, ...]]] = {
    "Technical": {
        "SQL": ("sql", "structured query language"),
        "Python": ("python", "pandas", "numpy"),
        "R": ("r", "r programming", "rstudio"),
        "Excel": ("excel", "microsoft excel", "pivot table", "power query"),
        "Power BI": ("power bi", "powerbi", "dax"),
        "Tableau": ("tableau",),
        "Looker": ("looker", "lookml"),
        "dbt": ("dbt", "data build tool"),
        "Snowflake": ("snowflake",),
        "BigQuery": ("bigquery", "big query"),
        "Databricks": ("databricks",),
        "Spark": ("apache spark", "pyspark", "spark"),
        "Airflow": ("apache airflow", "airflow"),
        "Kafka": ("apache kafka", "kafka"),
        "AWS": ("aws", "amazon web services", "s3", "redshift", "glue"),
        "GCP": ("gcp", "google cloud platform", "google cloud"),
        "Azure": ("microsoft azure", "azure"),
        "APIs": ("api", "apis", "rest api", "restful api"),
        "Git": ("git", "github", "gitlab", "version control"),
        "Docker": ("docker", "containerization", "containers"),
        "Kubernetes": ("kubernetes", "k8s"),
        "Salesforce": ("salesforce", "sales cloud", "service cloud"),
        "Jira": ("jira", "atlassian"),
    },
    "Data & Analytics": {
        "Data visualization": ("data visualization", "data visualisation", "visualization", "visualisation"),
        "Dashboarding": ("dashboard", "dashboards", "scorecard", "reporting"),
        "Data modeling": ("data modeling", "data modelling", "semantic model", "dimensional model"),
        "ETL / ELT": ("etl", "elt", "data pipeline", "data pipelines", "data transformation"),
        "Data quality": ("data quality", "data validation", "reconciliation", "data accuracy"),
        "Statistics": ("statistics", "statistical analysis", "regression", "hypothesis testing"),
        "Experimentation": ("a/b testing", "a/b test", "ab testing", "experimentation", "experiment design"),
        "Forecasting": ("forecasting", "forecast", "predictive modeling", "predictive modelling"),
        "Root-cause analysis": ("root cause analysis", "root-cause analysis", "rca", "diagnostic analysis"),
        "KPI design": ("kpi", "kpis", "key performance indicator", "metric definition"),
        "Segmentation": ("segmentation", "customer segmentation", "cohort analysis"),
        "Funnel analysis": ("funnel analysis", "conversion funnel", "conversion rate", "activation", "retention"),
    },
    "Product & Delivery": {
        "Requirements gathering": ("requirements gathering", "requirements elicitation", "business requirements", "user stories"),
        "Process improvement": ("process improvement", "process optimization", "process optimisation", "continuous improvement"),
        "Project management": ("project management", "program management", "project delivery"),
        "Agile / Scrum": ("agile", "scrum", "sprint planning", "kanban"),
        "Product analytics": ("product analytics", "feature adoption", "user behavior", "user behaviour"),
        "Roadmapping": ("roadmap", "roadmapping", "product strategy", "prioritization", "prioritisation"),
    },
    "Leadership & Communication": {
        "Stakeholder management": ("stakeholder management", "stakeholder", "stakeholders", "cross-functional"),
        "Executive communication": ("executive communication", "executive presentation", "present to leadership", "storytelling"),
        "Leadership": ("leadership", "people management", "team lead", "mentoring", "coaching"),
        "Client management": ("client management", "client-facing", "customer-facing", "consulting"),
        "Change management": ("change management", "organizational change", "organisational change", "adoption"),
    },
    "AI & Automation": {
        "Machine learning / AI": ("machine learning", "artificial intelligence", "ml", "ai"),
        "Generative AI / LLMs": ("generative ai", "genai", "large language model", "large language models", "llm", "llms"),
        "AI agents": ("ai agent", "ai agents", "agentic", "multi-agent"),
        "MLOps": ("mlops", "model deployment", "model monitoring"),
        "Workflow automation": (
            "workflow automation",
            "process automation",
            "automation",
            "automated workflow",
            "automated",
        ),
        "Human-in-the-loop": ("human-in-the-loop", "human in the loop", "human review"),
    },
    "Risk & Domain": {
        "Risk analysis": ("risk analysis", "risk assessment", "risk management", "credit risk", "fraud risk"),
        "Compliance": ("compliance", "regulatory", "governance", "audit"),
        "Financial analysis": ("financial analysis", "financial modeling", "financial modelling", "profitability"),
        "Operations analytics": ("operations analytics", "operational analytics", "capacity planning", "throughput"),
        "Supply chain": ("supply chain", "inventory", "logistics", "fulfillment", "fulfilment"),
        "Customer analytics": ("customer analytics", "customer insights", "customer journey", "customer behavior", "customer behaviour"),
    },
}


@dataclass(frozen=True)
class KeywordRequirement:
    keyword: str
    category: str
    aliases: tuple[str, ...]
    priority: Priority
    weight: float
    jd_phrases: tuple[str, ...]
    occurrences: int


@dataclass(frozen=True)
class KeywordMatch:
    keyword: str
    category: str
    priority: Priority
    weight: float
    status: MatchStatus
    exact_match: bool
    matched_alias: str | None
    evidence: str
    confidence: int
    recommendation: str


@dataclass(frozen=True)
class KeywordAnalysis:
    overall_score: int
    score_out_of_five: float
    grade: str
    verdict: str
    keyword_coverage: int
    exact_keyword_coverage: int
    evidence_strength: int
    quantified_evidence: int
    matches: tuple[KeywordMatch, ...]
    matched_keywords: tuple[str, ...]
    missing_keywords: tuple[str, ...]
    safe_rewrites: tuple[str, ...]

    def to_dict(self) -> dict:
        return {
            **{key: value for key, value in asdict(self).items() if key != "matches"},
            "matches": [asdict(item) for item in self.matches],
        }


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip())


def _phrase_pattern(phrase: str) -> re.Pattern[str]:
    escaped = re.escape(_normalize(phrase).lower()).replace(r"\ ", r"\s+")
    return re.compile(rf"(?<![A-Za-z0-9]){escaped}(?![A-Za-z0-9])", re.IGNORECASE)


def _contains_phrase(text: str, phrase: str) -> bool:
    return bool(phrase and _phrase_pattern(phrase).search(text))


def _split_evidence(text: str) -> list[str]:
    cleaned = text.replace("•", "\n").replace("▪", "\n").replace("·", "\n")
    chunks: list[str] = []
    for raw_line in cleaned.splitlines():
        line = re.sub(r"^[-*\u2022\s]+", "", raw_line).strip()
        if not line:
            continue
        for piece in re.split(r"(?<=[.!?])\s+(?=[A-Z])", line):
            piece = _normalize(piece)
            if len(piece) >= 12:
                chunks.append(piece)
    if not chunks and cleaned.strip():
        chunks = [_normalize(cleaned)]
    return list(dict.fromkeys(chunks))


def _section_priority(line: str, current: Priority) -> Priority:
    normalized = re.sub(r"[^a-z ]", "", line.lower()).strip()
    if len(normalized) <= 70:
        if any(term in normalized for term in ("preferred", "nice to have", "bonus", "desirable")):
            return "Preferred"
        if any(term in normalized for term in ("requirement", "qualification", "must have", "what you bring")):
            return "Required"
        if any(term in normalized for term in ("responsibilit", "what youll do", "the role", "your impact")):
            return "Core"
    if REQUIRED_CUES.search(line):
        return "Required"
    if PREFERRED_CUES.search(line):
        return "Preferred"
    return current


def _stronger_priority(left: Priority, right: Priority) -> Priority:
    rank = {"Preferred": 1, "Core": 2, "Required": 3}
    return left if rank[left] >= rank[right] else right


def _priority_weight(priority: Priority, occurrences: int) -> float:
    base = {"Required": 1.35, "Core": 1.0, "Preferred": 0.65}[priority]
    return round(base * (1 + min(max(occurrences - 1, 0), 3) * 0.08), 3)


def _term_is_useful(term: str) -> bool:
    words = [word.lower() for word in re.findall(r"[A-Za-z][A-Za-z0-9+#.-]*", term)]
    meaningful = [word for word in words if word not in STOP_WORDS]
    return bool(meaningful) and len(meaningful) <= 5 and not all(word.isdigit() for word in meaningful)


def _extract_explicit_terms(
    lines: list[tuple[str, Priority]],
    mapped_phrases: set[str],
) -> list[KeywordRequirement]:
    found: dict[str, dict[str, object]] = {}
    for line, priority in lines:
        for match in EXPLICIT_TERM_RE.finditer(line):
            tail = re.split(r"\b(?:who|that|while|and the ability|is required)\b", match.group(1), maxsplit=1, flags=re.IGNORECASE)[0]
            for raw_term in re.split(r",|\s+/\s+|\s+and\s+|\s+or\s+", tail, flags=re.IGNORECASE):
                term = re.sub(r"\b(?:at least|minimum of|hands-on|advanced|strong)\b", "", raw_term, flags=re.IGNORECASE)
                term = re.sub(
                    r"\b(?:is|are)?\s*(?:required|preferred|desired)\b.*$",
                    "",
                    term,
                    flags=re.IGNORECASE,
                )
                term = _normalize(term).strip(" -()")
                key = term.lower()
                if not _term_is_useful(term) or any(_contains_phrase(term, phrase) for phrase in mapped_phrases):
                    continue
                if key not in found:
                    found[key] = {"term": term, "priority": priority, "occurrences": 1}
                else:
                    found[key]["priority"] = _stronger_priority(found[key]["priority"], priority)  # type: ignore[arg-type]
                    found[key]["occurrences"] = int(found[key]["occurrences"]) + 1

    requirements: list[KeywordRequirement] = []
    for item in found.values():
        term = str(item["term"])
        priority = item["priority"]  # type: ignore[assignment]
        occurrences = int(item["occurrences"])
        requirements.append(
            KeywordRequirement(
                keyword=term,
                category="Job-specific",
                aliases=(term.lower(),),
                priority=priority,
                weight=_priority_weight(priority, occurrences),
                jd_phrases=(term,),
                occurrences=occurrences,
            )
        )
    return requirements[:8]


def extract_keyword_requirements(
    job_description: str,
    additional_terms: Iterable[str] = (),
) -> list[KeywordRequirement]:
    """Extract weighted, deduplicated concepts from a job description.

    Required qualifications outrank responsibilities, which outrank preferred
    qualifications. Aliases are grouped into one concept so SQL is not counted
    twice when a JD says both "SQL" and "structured query language".
    """
    raw_lines = [line.strip() for line in job_description.splitlines() if line.strip()]
    if not raw_lines:
        raw_lines = [_normalize(job_description)] if job_description.strip() else []

    lines: list[tuple[str, Priority]] = []
    current: Priority = "Core"
    for line in raw_lines:
        current = _section_priority(line, current)
        line_priority = _section_priority(line, current)
        lines.append((line, line_priority))

    indexed: dict[str, dict[str, object]] = {}
    mapped_phrases: set[str] = set()
    taxonomy = {
        category: dict(concepts)
        for category, concepts in KEYWORD_TAXONOMY.items()
    }
    if additional_terms:
        known_aliases = {
            alias
            for concepts in KEYWORD_TAXONOMY.values()
            for aliases in concepts.values()
            for alias in aliases
        }
        taxonomy["Industry"] = {
            _normalize(term): (_normalize(term).lower(),)
            for term in additional_terms
            if _term_is_useful(_normalize(term))
            and not any(
                _contains_phrase(_normalize(term), alias)
                or _contains_phrase(alias, _normalize(term))
                for alias in known_aliases
            )
        }

    for category, concepts in taxonomy.items():
        for keyword, aliases in concepts.items():
            hits: list[tuple[str, Priority]] = []
            for line, priority in lines:
                for alias in aliases:
                    if _contains_phrase(line, alias):
                        hits.append((alias, priority))
                        mapped_phrases.add(alias)
            if not hits:
                continue
            priority: Priority = "Preferred"
            for _, hit_priority in hits:
                priority = _stronger_priority(priority, hit_priority)
            phrases = tuple(dict.fromkeys(alias for alias, _ in hits))
            indexed[keyword] = {
                "category": category,
                "aliases": aliases,
                "priority": priority,
                "phrases": phrases,
                "occurrences": len(hits),
            }

    requirements = [
        KeywordRequirement(
            keyword=keyword,
            category=str(item["category"]),
            aliases=tuple(item["aliases"]),  # type: ignore[arg-type]
            priority=item["priority"],  # type: ignore[arg-type]
            weight=_priority_weight(item["priority"], int(item["occurrences"])),  # type: ignore[arg-type]
            jd_phrases=tuple(item["phrases"]),  # type: ignore[arg-type]
            occurrences=int(item["occurrences"]),
        )
        for keyword, item in indexed.items()
    ]
    requirements.extend(_extract_explicit_terms(lines, mapped_phrases))
    priority_rank = {"Required": 0, "Core": 1, "Preferred": 2}
    return sorted(
        requirements,
        key=lambda item: (priority_rank[item.priority], -item.weight, item.category, item.keyword.lower()),
    )


def _evidence_score(requirement: KeywordRequirement, sentence: str) -> tuple[float, str | None, bool]:
    matched_aliases = [alias for alias in requirement.aliases if _contains_phrase(sentence, alias)]
    if not matched_aliases:
        return 0.0, None, False
    exact_phrases = [phrase for phrase in requirement.jd_phrases if _contains_phrase(sentence, phrase)]
    score = 4.8 if exact_phrases else 3.8
    score += min(len(matched_aliases) - 1, 2) * 0.5
    score += 1.8 if ACTION_RE.search(sentence) else 0.0
    score += 2.0 if METRIC_RE.search(sentence) else 0.0
    score += 0.7 if len(sentence) >= 60 else 0.0
    return score, matched_aliases[0], bool(exact_phrases)


def _match_requirement(
    requirement: KeywordRequirement,
    candidate_profile: str,
    evidence_chunks: list[str],
) -> KeywordMatch:
    ranked = sorted(
        (
            (*_evidence_score(requirement, sentence), sentence)
            for sentence in evidence_chunks
        ),
        key=lambda item: item[0],
        reverse=True,
    )
    best_score, alias, exact, evidence = ranked[0] if ranked else (0.0, None, False, "")
    if not alias:
        return KeywordMatch(
            keyword=requirement.keyword,
            category=requirement.category,
            priority=requirement.priority,
            weight=requirement.weight,
            status="Gap",
            exact_match=False,
            matched_alias=None,
            evidence="No direct evidence found in the candidate input.",
            confidence=12,
            recommendation=(
                f"Do not add {requirement.keyword} unless you can prove it. "
                "Treat it as a learning, project, or portfolio gap."
            ),
        )

    confidence = min(97, round(38 + best_score * 6.2))
    status: MatchStatus = "Strong" if best_score >= 7.0 else "Partial"
    preferred_phrase = requirement.jd_phrases[0] if requirement.jd_phrases else requirement.keyword
    if exact:
        recommendation = "Keep this proof point and add scope, timeframe, and personal contribution if missing."
    else:
        recommendation = (
            f"Safe rewrite: use the JD phrase “{preferred_phrase}” only where it accurately describes this evidence."
        )
    return KeywordMatch(
        keyword=requirement.keyword,
        category=requirement.category,
        priority=requirement.priority,
        weight=requirement.weight,
        status=status,
        exact_match=exact,
        matched_alias=alias,
        evidence=evidence,
        confidence=confidence,
        recommendation=recommendation,
    )


def _grade(score: int) -> tuple[str, str]:
    if score >= 80:
        return "A", "Strong target — proceed with a tailored application after human review."
    if score >= 68:
        return "B", "Competitive target — make focused, evidence-backed edits before applying."
    if score >= 55:
        return "C", "Selective target — close the highest-weight gaps before investing heavily."
    if score >= 40:
        return "D", "Low-evidence target — apply only with a clear strategic reason."
    return "F", "Not recommended without new, verifiable evidence or skill development."


def analyze_keywords(
    job_description: str,
    candidate_profile: str,
    additional_terms: Iterable[str] = (),
) -> KeywordAnalysis:
    """Compare JD concepts with candidate evidence without fabricating claims."""
    requirements = extract_keyword_requirements(job_description, additional_terms)
    evidence_chunks = _split_evidence(candidate_profile)
    matches = tuple(
        _match_requirement(requirement, candidate_profile, evidence_chunks)
        for requirement in requirements
    )
    if not matches:
        return KeywordAnalysis(
            overall_score=0,
            score_out_of_five=0.0,
            grade="F",
            verdict="No reliable job requirements were detected. Add a fuller job description.",
            keyword_coverage=0,
            exact_keyword_coverage=0,
            evidence_strength=0,
            quantified_evidence=0,
            matches=(),
            matched_keywords=(),
            missing_keywords=(),
            safe_rewrites=(),
        )

    total_weight = sum(item.weight for item in matches) or 1.0
    status_value = {"Strong": 1.0, "Partial": 0.72, "Gap": 0.0}
    covered = sum(item.weight * status_value[item.status] for item in matches)
    exact = sum(item.weight for item in matches if item.exact_match)
    matched = [item for item in matches if item.status != "Gap"]
    evidence_strength = (
        round(sum(item.confidence * item.weight for item in matched) / sum(item.weight for item in matched))
        if matched
        else 0
    )
    quantified = [item for item in matched if METRIC_RE.search(item.evidence)]
    quantified_score = round(len(quantified) / len(matched) * 100) if matched else 0
    coverage_score = round(covered / total_weight * 100)
    exact_score = round(exact / total_weight * 100)
    overall = round(coverage_score * 0.58 + evidence_strength * 0.27 + exact_score * 0.15)
    overall = max(0, min(100, overall))
    grade, verdict = _grade(overall)

    return KeywordAnalysis(
        overall_score=overall,
        score_out_of_five=round(overall / 20, 1),
        grade=grade,
        verdict=verdict,
        keyword_coverage=coverage_score,
        exact_keyword_coverage=exact_score,
        evidence_strength=evidence_strength,
        quantified_evidence=quantified_score,
        matches=matches,
        matched_keywords=tuple(item.keyword for item in matched),
        missing_keywords=tuple(item.keyword for item in matches if item.status == "Gap"),
        safe_rewrites=tuple(
            item.recommendation
            for item in matched
            if not item.exact_match and item.recommendation.startswith("Safe rewrite")
        ),
    )
