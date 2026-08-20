#!/usr/bin/env bash
set -euo pipefail

output_dir="${1:-/private/tmp/interviewthread-walkthrough-audio}"
mkdir -p "$output_dir"

english=(
  "Prepare for the interview with real evidence."
  "Start with your resume and the job description."
  "Upload a file, or paste real work."
  "Set the real interview stage, time, and duration."
  "Now check strong proof, partial proof, and real gaps."
  "Turn verified evidence into stories you can defend."
  "See likely questions, ranked for this interview."
  "Choose the interviewer role and practice mode."
  "Answer by voice or text."
  "Review specific feedback, then try the next question."
)

traditional_chinese=(
  "用真實證據準備面試。"
  "先加入履歷和職缺描述。"
  "上傳檔案，或貼上真實經驗。"
  "設定面試階段、時間與長度。"
  "先看強項，再看真正缺口。"
  "把證據變成經得起追問的故事。"
  "預測這場面試最可能問的問題。"
  "選擇面試官角色與練習模式。"
  "用語音或文字回答，問題會逐步深入。"
  "看具體回饋，再練下一題。"
)

for index in "${!english[@]}"; do
  number=$(printf "%02d" $((index + 1)))
  say -v Samantha -r 245 -o "$output_dir/$number-en.aiff" "${english[$index]}"
  say -v Meijia -r 230 -o "$output_dir/$number-zh-TW.aiff" "${traditional_chinese[$index]}"
done

echo "Created bilingual narration in $output_dir"
