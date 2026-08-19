from __future__ import annotations


def build_evidence_prompts(candidate_profile: str) -> dict[str, list[str]]:
    """Identify evidence phrases that the LLM should consider when mapping proof."""
    profile = candidate_profile.lower()
    evidence: dict[str, list[str]] = {
        "analytics": [],
        "stakeholder": [],
        "operations": [],
        "business_impact": [],
        "technical_tools": [],
    }

    for phrase in ["dashboard", "report", "analysis", "analytics", "kpi", "power bi"]:
        if phrase in profile:
            evidence["analytics"].append(phrase)

    for phrase in ["stakeholder", "cross-functional", "product", "sales", "legal", "crm"]:
        if phrase in profile:
            evidence["stakeholder"].append(phrase)

    for phrase in ["operations", "process", "automation", "erp", "workflow", "sku"]:
        if phrase in profile:
            evidence["operations"].append(phrase)

    for phrase in ["%", "increase", "decrease", "improve", "reduce", "from", "to"]:
        if phrase in profile:
            evidence["business_impact"].append(phrase)

    for phrase in ["sql", "python", "excel", "tableau", "power bi", "oracle", "salesforce"]:
        if phrase in profile:
            evidence["technical_tools"].append(phrase)

    return evidence
