from __future__ import annotations


def build_story_pack(keyword_analysis: dict) -> list[dict]:
    candidates = [item for item in keyword_analysis.get("matches", []) if item["status"] != "Gap"][:6]
    stories: list[dict] = []
    for item in candidates:
        evidence = item.get("evidence") or "Evidence not yet supplied"
        stories.append(
            {
                "title": f"Evidence story: {item['keyword']}",
                "priority": item["priority"],
                "source_evidence": evidence,
                "confidence": item["confidence"],
                "framework": {
                    "situation": "Add the business context, scope, and constraint from this verified example.",
                    "task": f"Explain why {item['keyword']} mattered and what outcome you owned.",
                    "action": evidence,
                    "result": "Add a verified metric or observable outcome; do not estimate one.",
                    "reflection": "Explain what you learned and how it applies to the target role.",
                },
                "follow_up_questions": [
                    "What was the baseline before your work?",
                    "Which decision changed because of your contribution?",
                    "Who challenged the approach and how did you respond?",
                ],
            }
        )
    if stories:
        return stories
    return [{
        "title": "Evidence collection required",
        "priority": "Required",
        "source_evidence": "No role-relevant evidence was detected.",
        "confidence": 0,
        "framework": {
            "situation": "Choose a real project with a similar business problem.",
            "task": "State your actual responsibility.",
            "action": "List the steps and tools you personally used.",
            "result": "Add only verified outcomes.",
            "reflection": "Connect the lesson to this role.",
        },
        "follow_up_questions": ["Which real project is closest to this requirement?"],
    }]


def build_model_prompt(
    target_role: str,
    company: str,
    keyword_analysis: dict,
    story_pack: list[dict],
) -> list[dict[str, str]]:
    return [
        {
            "role": "system",
            "content": (
                "You are CareerProof Copilot. Use only the supplied candidate evidence. "
                "Never invent employers, tools, metrics, responsibilities, or results. "
                "Label missing facts as questions. Separate safe phrasing from real gaps."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Create a concise role-readiness brief for {target_role or 'the target role'} at "
                f"{company or 'the target company'}. Use this canonical keyword analysis:\n"
                f"{keyword_analysis}\n\nUse these evidence-linked story scaffolds:\n{story_pack}\n\n"
                "Return: positioning statement, three priority stories, missing proof, and a seven-day plan."
            ),
        },
    ]


def deterministic_copilot_reply(question: str, analysis: dict | None) -> str:
    if not analysis:
        return "Start with an analysis so I can answer from verified role and resume evidence."
    gaps = analysis.get("keyword_analysis", {}).get("missing_keywords", [])[:5]
    stories = analysis.get("story_pack", [])[:3]
    evidence = "; ".join(item.get("source_evidence", "") for item in stories if item.get("source_evidence"))
    gap_text = ", ".join(gaps) or "no major keyword gaps detected"
    return (
        f"Based on the saved evidence, the strongest material is: {evidence or 'not enough evidence yet'}. "
        f"The current gaps are: {gap_text}. For your question — {question.strip()} — build the answer around "
        "one verified example, state your personal action, and add a result only if you can support it."
    )

