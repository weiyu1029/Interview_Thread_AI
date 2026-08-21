#!/usr/bin/env bash
set -euo pipefail

public_paths=(
  README.md
  CONTRIBUTING.md
  CODE_OF_CONDUCT.md
  GOVERNANCE.md
  SECURITY.md
  LICENSE
  SUPPORT.md
  CHANGELOG.md
  platform/README.md
  docs
  .github
)

retired_pattern='CareerStoryMap Agent|CareerProof|InterviewThread Agent|InterviewThread-agent|careerstorymap\.com|github\.com/weiyu1029/(careerproof-agent|CareerStoryMap-agent)'

if git grep -nI -E "$retired_pattern" -- "${public_paths[@]}" ':!THIRD_PARTY_NOTICES.md'; then
  echo "Retired public brand reference found. Use InterviewThread and the canonical repository URL."
  exit 1
fi

git grep -qF 'InterviewThread' -- README.md CONTRIBUTING.md docs/brand.md
git grep -qF 'https://interviewthreadai.com' -- README.md docs/brand.md
git grep -qF 'https://github.com/weiyu1029/Interview_Thread_AI' -- README.md .github docs

retired_assets=(
  assets/careerproof-hero.png
  platform/web/public/og-careerstorymap.png
)

for retired_asset in "${retired_assets[@]}"; do
  if git ls-files --error-unmatch "$retired_asset" >/dev/null 2>&1; then
    echo "Retired public brand asset found: $retired_asset"
    exit 1
  fi
done

echo "Public InterviewThread brand references are consistent."
