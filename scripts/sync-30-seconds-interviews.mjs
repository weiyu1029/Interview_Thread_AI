import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SOURCE_COMMIT = "da235b6185721161b7ebc413075b76dc70339ccf";
const SOURCE_URL = `https://raw.githubusercontent.com/Chalarangelo/30-seconds-of-interviews/${SOURCE_COMMIT}/data/questions.json`;
const OUTPUT_URL = new URL(
  "../platform/web/app/30-seconds-interview-questions.generated.ts",
  import.meta.url,
);

const response = await fetch(SOURCE_URL);
if (!response.ok) {
  throw new Error(`Unable to download ${SOURCE_URL}: ${response.status}`);
}

const rows = await response.json();
if (!Array.isArray(rows) || rows.length !== 103) {
  throw new Error(`Expected 103 reviewed source rows, received ${rows.length}`);
}

const normalized = rows.map((row, index) => {
  if (
    typeof row?.question !== "string" ||
    !row.question.trim() ||
    !Array.isArray(row.tags) ||
    !Number.isInteger(row.expertise)
  ) {
    throw new Error(`Invalid source row at index ${index}`);
  }

  return {
    name:
      typeof row.name === "string" && row.name.trim()
        ? row.name.replace(/\.md$/i, "")
        : `question-${index + 1}`,
    question: row.question.trim(),
    tags: row.tags.filter((tag) => typeof tag === "string" && tag.trim()),
    expertise: Math.max(0, Math.min(2, row.expertise)),
  };
});

const header = `/**
 * Generated from Chalarangelo/30-seconds-of-interviews at commit
 * ${SOURCE_COMMIT}. Do not edit by hand; run:
 *   node scripts/sync-30-seconds-interviews.mjs
 *
 * Upstream license: MIT. See THIRD_PARTY_NOTICES.md.
 */

export type ThirtySecondsInterviewQuestion = {
  name: string;
  question: string;
  tags: readonly string[];
  expertise: number;
};

export const THIRTY_SECONDS_INTERVIEW_QUESTIONS = `;

await writeFile(
  fileURLToPath(OUTPUT_URL),
  `${header}${JSON.stringify(normalized, null, 2)} as const satisfies readonly ThirtySecondsInterviewQuestion[];\n`,
  "utf8",
);

console.log(`Wrote ${normalized.length} questions to ${fileURLToPath(OUTPUT_URL)}`);
