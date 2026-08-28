import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, relative, resolve } from "node:path";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const sources = [
  {
    id: "data-science-interview-questions",
    root: args.get("--data-science"),
    commit: "ffd17a108d7087035568747eafc88c07f5b6bc6c",
    parser: "data-science",
  },
  {
    id: "ai-llm-interview-guide",
    root: args.get("--ai-llm"),
    commit: "4dc2fa6e76e003aef029361cfc4ca44d16696faf",
    parser: "ai-llm",
  },
  {
    id: "ai-interview-questions",
    root: args.get("--ai-interview"),
    commit: "401541b7e89b67686e5eaaa8b9523f1b99f0f096",
    parser: "ai-interview",
  },
];

const output = resolve(
  args.get("--output") || "app/open-interview-source-prompts.generated.json",
);

function filesUnder(root) {
  const files = [];
  for (const name of readdirSync(root)) {
    const path = resolve(root, name);
    if (name === ".git") continue;
    if (statSync(path).isDirectory()) files.push(...filesUnder(path));
    else files.push(path);
  }
  return files;
}

function cleanQuestion(value) {
  const cleaned = value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_]/g, "")
    .replace(/^\s*["“]|["”]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return /[.!?。！？]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

function fingerprint(value) {
  return cleanQuestion(value)
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function stableId(sourceId, sourcePath, prompt) {
  const digest = createHash("sha256")
    .update(`${sourceId}\0${sourcePath}\0${fingerprint(prompt)}`)
    .digest("hex")
    .slice(0, 14);
  return `${sourceId}-${digest}`;
}

function difficultyFor(prompt, block = "") {
  const declared = block.match(/\*\*Difficulty(?: per Site)?:\*\*?\s*([^\n]+)/i)?.[1] || "";
  if (/senior|hard|advanced|expert/i.test(declared))
    return { difficulty: 3, difficultyMode: "declared" };
  if (/easy|intro|beginner|fundamental/i.test(declared))
    return { difficulty: 1, difficultyMode: "declared" };
  if (/mid|medium|intermediate/i.test(declared))
    return { difficulty: 2, difficultyMode: "declared" };
  if (/\b(derive|prove|production|at scale|failure mode|trade-?off|design an? end-to-end)\b/i.test(prompt))
    return { difficulty: 3, difficultyMode: "calibrated" };
  if (/^(what is|define|name|list|when is)\b/i.test(prompt))
    return { difficulty: 1, difficultyMode: "calibrated" };
  return { difficulty: 2, difficultyMode: "calibrated" };
}

function classification(sourceId, sourcePath) {
  const path = sourcePath.toLocaleLowerCase("en-US");
  if (/behavioral/.test(path))
    return { persona: "hiring-manager", track: "behavioral" };
  if (/product-and-gtm|case/.test(path))
    return { persona: "case", track: "case" };
  if (/system.design|coding-and-system-design|ml-system-design/.test(path))
    return { persona: "system-design", track: "system-design" };
  if (/frontend/.test(path))
    return { persona: "technical", track: "frontend" };
  return { persona: "technical", track: "technical" };
}

function completeInterviewQuestion(value, sourceId) {
  const candidate = cleanQuestion(value.replace(/^\s*\d+[.)]\s*/, ""));
  if (
    /\?$/.test(candidate) ||
    /^(?:compare|define|derive|describe|design|discuss|evaluate|explain|give|how|implement|list|name|prove|show|state|tell|walk|what|when|where|which|who|why|write|would|can|could|do|does|is|are|should)\b/i.test(candidate)
  )
    return candidate;
  const topic = candidate.replace(/[.!?]+$/, "");
  return sourceId === "data-science-interview-questions"
    ? `Explain ${topic}. How is it used in data science, and what limitation or edge case would you check?`
    : `Explain ${topic}. When would you use it in a production AI system, and what trade-off would you examine first?`;
}

function numberedQuestions(value) {
  return [...value.matchAll(/^\s*\d+[.)]\s+(.+)$/gm)]
    .map((match) => match[1].trim())
    .filter((line) => line.length >= 12 && line.length <= 500)
    .filter(
      (line) =>
        /\?$/.test(line) ||
        /^(?:compare|define|derive|describe|design|discuss|evaluate|explain|give|how|implement|indicate|list|name|prove|show|state|tell|walk|what|when|where|which|who|why|write|would|can|could|do|does|is|are|should)\b/i.test(
          line,
        ),
    );
}

function promptsForBlock(source, heading, block) {
  const beforeAnswer = block.split(/<details>|\*\*Short answer\./i)[0];
  if (source.parser === "ai-interview") {
    const quoted = beforeAnswer.match(/^>\s*["“](.+?)["”]\s*$/m)?.[1];
    return [completeInterviewQuestion(quoted || heading, source.id)];
  }
  if (source.parser === "data-science") {
    const prompts = numberedQuestions(
      `${/^\s*\d+[.)]/.test(heading) ? heading : ""}\n${beforeAnswer}`,
    );
    if (prompts.length) return prompts.map((prompt) => completeInterviewQuestion(prompt, source.id));
  }
  return [completeInterviewQuestion(heading, source.id)];
}

function recordsFromHeadings(source, file, pattern) {
  const markdown = readFileSync(file, "utf8");
  const sourcePath = relative(source.root, file).replaceAll("\\", "/");
  const matches = [...markdown.matchAll(pattern)];
  return matches.flatMap((match, headingIndex) => {
    const block = markdown.slice(
      match.index,
      matches[headingIndex + 1]?.index || markdown.length,
    );
    const { persona, track } = classification(source.id, sourcePath);
    const sourceLine = markdown.slice(0, match.index).split("\n").length;
    return promptsForBlock(source, match[1], block).flatMap((prompt, promptIndex) => {
      if (prompt.length < 12 || prompt.length > 500) return [];
      const difficulty = difficultyFor(prompt, block);
      return [{
        id: stableId(source.id, sourcePath, prompt),
        prompt,
        topic: basename(sourcePath, ".md").replaceAll(/[-_]/g, " "),
        persona,
        track,
        depth: (headingIndex + promptIndex) % 5,
        ...difficulty,
        sourceId: source.id,
        sourcePath,
        sourceLine,
        sourceCommit: source.commit,
        sourceMode: "adapted",
      }];
    });
  });
}

function recordsFor(source) {
  const actualCommit = execFileSync("git", ["-C", source.root, "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  if (actualCommit !== source.commit)
    throw new Error(`${source.id} is at ${actualCommit}, expected ${source.commit}`);
  if (source.parser === "data-science") {
    return filesUnder(source.root)
      .filter((file) => file.endsWith(".md") && file !== resolve(source.root, "README.md"))
      .flatMap((file) => recordsFromHeadings(source, file, /^### Q:\s*(.+)$/gm));
  }
  if (source.parser === "ai-llm") {
    return filesUnder(resolve(source.root, "prep"))
      .filter((file) => file.endsWith("questions.md"))
      .flatMap((file) => recordsFromHeadings(source, file, /^### Q:\s*(.+)$/gm));
  }
  return filesUnder(resolve(source.root, "banks"))
    .filter((file) => file.endsWith(".md"))
    .flatMap((file) => recordsFromHeadings(source, file, /^### \d+\.\s*(.+)$/gm));
}

for (const source of sources) {
  if (!source.root) throw new Error(`Missing source checkout for ${source.id}`);
  source.root = resolve(source.root);
}

const seen = new Set();
const records = sources.flatMap(recordsFor).filter((record) => {
  const key = fingerprint(record.prompt);
  if (!key || seen.has(key)) return false;
  seen.add(key);
  return true;
});

if (records.length < 2_000)
  throw new Error(`Expected at least 2,000 licensed questions, extracted ${records.length}`);

writeFileSync(output, `${JSON.stringify(records, null, 2)}\n`);
console.log(`Wrote ${records.length} attributed questions to ${output}`);
