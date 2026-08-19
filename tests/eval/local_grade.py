from __future__ import annotations

import json
from pathlib import Path

DATASET = Path("tests/eval/datasets/basic-dataset.json")
OUT = Path("artifacts/sample_outputs/local_eval_summary.json")


def main() -> None:
    data = json.loads(DATASET.read_text())
    cases = data.get("eval_cases", [])
    results = []
    for case in cases:
        text = case["prompt"]["parts"][0]["text"]
        payload = json.loads(text)
        checks = {
            "has_target_role": bool(payload.get("target_role")),
            "has_job_description": bool(payload.get("job_description")),
            "has_candidate_profile": bool(payload.get("candidate_profile")),
            "has_industry": bool(payload.get("industry")),
        }
        results.append({"case_id": case["eval_case_id"], "checks": checks})

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(results, indent=2))
    print("| case | ready | checks |")
    print("|---|---:|---|")
    for item in results:
        ready = all(item["checks"].values())
        print(f"| {item['case_id']} | {ready} | {item['checks']} |")
    print(f"\nSaved {OUT}")


if __name__ == "__main__":
    main()
