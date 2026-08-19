from __future__ import annotations

from app.tools.job_signals import classify_role_family
from app.tools.keyword_matcher import analyze_keywords, extract_keyword_requirements


def _by_keyword(items):
    return {item.keyword: item for item in items}


def _matches_by_keyword(analysis):
    return {item.keyword: item for item in analysis.matches}


def test_required_keywords_outweigh_preferred_keywords() -> None:
    jd = """
Requirements
SQL and stakeholder management are required.
Preferred qualifications
Tableau is nice-to-have.
"""
    requirements = _by_keyword(extract_keyword_requirements(jd))

    assert requirements["SQL"].priority == "Required"
    assert requirements["Stakeholder management"].priority == "Required"
    assert requirements["Tableau"].priority == "Preferred"
    assert requirements["SQL"].weight > requirements["Tableau"].weight


def test_alias_match_is_safe_rewrite_not_a_gap() -> None:
    jd = "Structured query language and dashboarding are required."
    profile = "Built SQL dashboards that reduced weekly reporting time by 30%."

    analysis = analyze_keywords(jd, profile)
    sql = _matches_by_keyword(analysis)["SQL"]

    assert sql.status == "Strong"
    assert sql.exact_match is False
    assert "Safe rewrite" in sql.recommendation
    assert "SQL" in sql.evidence


def test_missing_keyword_is_never_fabricated() -> None:
    analysis = analyze_keywords(
        "Snowflake expertise is required.",
        "Built Excel reporting workflows and partnered with finance leaders.",
    )
    snowflake = _matches_by_keyword(analysis)["Snowflake"]

    assert snowflake.status == "Gap"
    assert snowflake.evidence == "No direct evidence found in the candidate input."
    assert snowflake.recommendation.startswith("Do not add Snowflake")


def test_short_ai_keyword_does_not_match_retail() -> None:
    jd = "Retail pricing and inventory analysis for store operations."
    requirements = _by_keyword(extract_keyword_requirements(jd))

    assert "Machine learning / AI" not in requirements
    assert classify_role_family(jd) != "AI / Data Product"


def test_quantified_action_evidence_scores_higher() -> None:
    jd = "Python automation and workflow improvement are required."
    quantified = analyze_keywords(
        jd,
        "Automated a Python workflow and reduced processing time by 45%.",
    )
    unquantified = analyze_keywords(
        jd,
        "Python and automation are listed in the technical skills section.",
    )

    assert quantified.evidence_strength > unquantified.evidence_strength
    assert quantified.quantified_evidence > unquantified.quantified_evidence
    assert quantified.overall_score > unquantified.overall_score


def test_explicit_job_specific_term_is_retained() -> None:
    requirements = _by_keyword(
        extract_keyword_requirements("Experience with SAP S/4HANA is required.")
    )

    assert any(keyword.startswith("SAP S/4HANA") for keyword in requirements)


def test_industry_term_does_not_duplicate_taxonomy_concept() -> None:
    requirements = _by_keyword(
        extract_keyword_requirements(
            "Stakeholder communication is required.",
            additional_terms=["stakeholder communication"],
        )
    )

    assert "Stakeholder management" in requirements
    assert "stakeholder communication" not in requirements
