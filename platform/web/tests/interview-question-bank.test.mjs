import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERVIEW_QUESTION_LENSES,
  INTERVIEW_QUESTION_TRACKS,
  OPEN_INTERVIEW_QUESTIONS as BASE_INTERVIEW_QUESTIONS,
  OPEN_INTERVIEW_QUESTION_SOURCES,
  openInterviewQuestionSource,
  questionsForInterviewLocale,
  questionsForInterviewRole as filterQuestionsForInterviewRole,
} from "../app/interview-question-bank.ts";
import { LANGUAGES } from "../app/i18n.ts";
import { questionBankPolicyCopyFor } from "../app/question-bank-policy-copy.ts";

const OPEN_INTERVIEW_QUESTIONS = await questionsForInterviewLocale("en");

function questionsForInterviewRole(
  persona,
  track,
  depth,
  difficulty,
  lens = "all",
) {
  return filterQuestionsForInterviewRole(
    persona,
    track,
    depth,
    difficulty,
    lens,
    OPEN_INTERVIEW_QUESTIONS,
  );
}

const PERSONAS = [
  "hr",
  "recruiter",
  "hiring-manager",
  "functional-lead",
  "technical",
  "system-design",
  "portfolio",
  "coo",
  "ceo",
  "peer",
  "cross-functional",
  "customer",
  "values",
  "case",
  "panel",
];

const DEPTHS = [0, 1, 2, 3, 4];
const DIFFICULTIES = [1, 2, 3];

function normalized(value) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

test("bundles at least 2,000 stable, fully attributed practice records", () => {
  assert.ok(
    OPEN_INTERVIEW_QUESTIONS.length >= 2_000,
    `expected at least 2,000 questions, received ${OPEN_INTERVIEW_QUESTIONS.length}`,
  );

  const questionIds = new Set();
  const usedSourceIds = new Set();

  for (const question of OPEN_INTERVIEW_QUESTIONS) {
    assert.ok(question.id.trim(), "every question needs a stable id");
    assert.ok(
      !questionIds.has(question.id),
      `duplicate question id: ${question.id}`,
    );
    questionIds.add(question.id);

    assert.ok(PERSONAS.includes(question.persona), question.id);
    assert.ok(INTERVIEW_QUESTION_TRACKS.includes(question.track), question.id);
    assert.ok(DEPTHS.includes(question.depth), question.id);
    assert.ok(DIFFICULTIES.includes(question.difficulty), question.id);

    const blueprint = question.prompt?.trim() || question.topic?.trim();
    assert.ok(
      blueprint,
      `${question.id} needs a prompt or topic so its rendered question is auditable`,
    );

    const source = openInterviewQuestionSource(question.sourceId);
    assert.ok(source, `${question.id} references an unknown source`);
    assert.equal(source.id, question.sourceId);
    assert.ok(source.name.trim(), `${source.id} needs a display name`);
    assert.ok(source.note.trim(), `${source.id} needs a provenance note`);
    assert.match(source.href, /^https:\/\//, `${source.id} needs a source URL`);
    assert.match(
      source.licenseHref,
      /^https:\/\//,
      `${source.id} needs a license URL`,
    );
    assert.match(source.license, /^(MIT|CC BY 4\.0)$/);
    usedSourceIds.add(question.sourceId);
  }

  assert.deepEqual(
    [...usedSourceIds].sort(),
    OPEN_INTERVIEW_QUESTION_SOURCES.map((source) => source.id).sort(),
    "every declared source should back at least one bundled question",
  );
});

test("bundles nine stable community lenses and at least 2,025 community questions", () => {
  assert.equal(INTERVIEW_QUESTION_LENSES.length, 9);
  assert.equal(new Set(INTERVIEW_QUESTION_LENSES).size, 9);
  assert.ok(
    INTERVIEW_QUESTION_LENSES.every(
      (lens) => typeof lens === "string" && lens.trim().length > 0,
    ),
  );

  const community = OPEN_INTERVIEW_QUESTIONS.filter(
    (question) => question.sourceId === "interviewthread",
  );
  assert.ok(
    community.length >= 2_025,
    `expected at least 2,025 community questions, received ${community.length}`,
  );
  assert.ok(
    community.every((question) =>
      INTERVIEW_QUESTION_LENSES.includes(question.lens),
    ),
    "every community question needs a supported lens",
  );
});

test("keeps every persona and answer stage usable at L1, L2, and L3", () => {
  for (const persona of PERSONAS) {
    for (const depth of DEPTHS) {
      for (const difficulty of DIFFICULTIES) {
        const matches = questionsForInterviewRole(
          persona,
          "all",
          depth,
          difficulty,
        );
        const expected = OPEN_INTERVIEW_QUESTIONS.filter(
          (question) =>
            question.persona === persona &&
            question.depth === depth &&
            question.difficulty === difficulty,
        );
        assert.deepEqual(
          matches.map((question) => question.id),
          expected.map((question) => question.id),
          `${persona} stage ${depth + 1} L${difficulty} filter is incomplete`,
        );
        assert.ok(
          matches.length > 0,
          `${persona} stage ${depth + 1} has no L${difficulty} questions`,
        );
        assert.ok(
          matches.every(
            (question) =>
              question.persona === persona &&
              question.depth === depth &&
              question.difficulty === difficulty,
          ),
          `${persona} stage ${depth + 1} L${difficulty} returned an invalid row`,
        );

        const communityMatches = matches.filter(
          (question) => question.sourceId === "interviewthread",
        );
        for (const lens of INTERVIEW_QUESTION_LENSES) {
          const lensMatches = questionsForInterviewRole(
            persona,
            "all",
            depth,
            difficulty,
            lens,
          );
          const expectedLensMatches = OPEN_INTERVIEW_QUESTIONS.filter(
            (question) =>
              question.persona === persona &&
              question.depth === depth &&
              question.difficulty === difficulty &&
              question.lens === lens,
          );
          assert.deepEqual(
            lensMatches.map((question) => question.id),
            expectedLensMatches.map((question) => question.id),
            `${persona} stage ${depth + 1} L${difficulty} ${lens} filter is incomplete`,
          );
          assert.ok(
            communityMatches.some((question) => question.lens === lens),
            `${persona} stage ${depth + 1} L${difficulty} has no ${lens} question`,
          );
        }
      }
    }
  }
});

test("does not repeat imported prompts or community question blueprints", () => {
  const importedPrompts = new Map();
  const communityBlueprints = new Map();

  for (const question of OPEN_INTERVIEW_QUESTIONS) {
    if (question.sourceId !== "interviewthread") {
      assert.ok(question.prompt?.trim(), `${question.id} needs a reviewed prompt`);
      const key = normalized(question.prompt);
      assert.ok(
        !importedPrompts.has(key),
        `duplicate imported prompt: ${importedPrompts.get(key)} and ${question.id}`,
      );
      importedPrompts.set(key, question.id);
      continue;
    }

    const focus = question.prompt?.trim() || question.topic?.trim();
    assert.ok(focus, `${question.id} needs a distinct prompt or topic`);
    // Community prompts are localized and evidence-aware at render time. The
    // persona and answer stage shape the sentence, while this focus must keep
    // variants within the same stage from collapsing into the same question.
    const key = normalized(
      `${question.persona}|${question.depth}|${question.difficulty}|${focus}`,
    );
    assert.ok(
      !communityBlueprints.has(key),
      `duplicate community blueprint: ${communityBlueprints.get(key)} and ${question.id}`,
    );
    communityBlueprints.set(key, question.id);
  }
});

test("filtering is deterministic, complete, and does not mutate the bank", () => {
  const before = JSON.stringify(OPEN_INTERVIEW_QUESTIONS);

  for (const persona of PERSONAS) {
    const allForPersona = questionsForInterviewRole(
      persona,
      "all",
      "all",
      "all",
    );
    assert.ok(allForPersona.length > 0, `${persona} has no questions`);

    const repeated = questionsForInterviewRole(
      persona,
      "all",
      "all",
      "all",
    );
    assert.deepEqual(
      repeated.map((question) => question.id),
      allForPersona.map((question) => question.id),
      `${persona} filter order changed between calls`,
    );

    const visibleTracks = new Set(
      allForPersona.map((question) => question.track),
    );
    for (const track of visibleTracks) {
      const matches = questionsForInterviewRole(
        persona,
        track,
        "all",
        "all",
      );
      const expected = OPEN_INTERVIEW_QUESTIONS.filter(
        (question) =>
          question.persona === persona && question.track === track,
      );
      assert.deepEqual(
        matches.map((question) => question.id),
        expected.map((question) => question.id),
        `${persona}/${track} filter is incomplete or unstable`,
      );
      assert.ok(matches.length > 0, `${persona}/${track} is an empty visible filter`);
      assert.ok(
        matches.every(
          (question) =>
            question.persona === persona && question.track === track,
        ),
        `${persona}/${track} leaked another filter value`,
      );
    }
  }

  assert.equal(
    JSON.stringify(OPEN_INTERVIEW_QUESTIONS),
    before,
    "filtering must not mutate question data or ordering",
  );
});

test("keeps imported prompts concrete instead of generic coaching instructions", () => {
  const imported = OPEN_INTERVIEW_QUESTIONS.filter(
    (question) => question.sourceId !== "interviewthread",
  );
  assert.ok(imported.length > 0);
  assert.ok(
    imported.every(
      (question) =>
        question.prompt?.includes("?") || question.prompt?.endsWith("."),
    ),
  );
  assert.ok(
    imported.some((question) =>
      question.prompt?.includes("Design a URL-shortening service"),
    ),
  );
});

test("pins every generated open-source prompt to a reviewed source path and commit", () => {
  const generatedSourceIds = new Set([
    "data-science-interview-questions",
    "ai-llm-interview-guide",
    "ai-interview-questions",
  ]);
  const generated = OPEN_INTERVIEW_QUESTIONS.filter(
    (question) => generatedSourceIds.has(question.sourceId),
  );
  assert.ok(
    generated.length >= 2_000,
    `expected at least 2,000 generated source prompts, received ${generated.length}`,
  );
  assert.ok(
    generated.every((question) => question.sourceMode === "adapted"),
    "generated source prompts must declare that InterviewThread adapted them",
  );
  assert.ok(generated.every((question) => question.sourcePath?.endsWith(".md")));
  assert.ok(
    generated.every(
      (question) => Number.isInteger(question.sourceLine) && question.sourceLine > 0,
    ),
  );
  assert.ok(
    generated.every((question) => /^[a-f0-9]{40}$/.test(question.sourceCommit || "")),
  );
  assert.ok(
    generated.every((question) =>
      ["declared", "calibrated"].includes(question.difficultyMode),
    ),
  );
  assert.ok(
    generated.every(
      (question) =>
        /\?$/.test(question.prompt || "") ||
        /^(?:compare|define|derive|describe|design|discuss|evaluate|explain|give|how|implement|indicate|list|name|prove|show|state|tell|walk|what|when|where|which|who|why|write|would|can|could|do|does|is|are|should)\b/i.test(
          question.prompt || "",
        ),
    ),
    "generated prompts must be complete, speakable interview questions rather than topic fragments",
  );
  assert.ok(
    OPEN_INTERVIEW_QUESTION_SOURCES.filter((source) => source.sourceCommit).every(
      (source) => source.attribution?.trim(),
    ),
  );
});

test("returns the reviewed English source bank only for English", async () => {
  const englishQuestions = await questionsForInterviewLocale("en");
  assert.equal(englishQuestions.length, 4_362);
  assert.deepEqual(englishQuestions, OPEN_INTERVIEW_QUESTIONS);
  assert.equal(BASE_INTERVIEW_QUESTIONS.length, 2_051);

  for (const [locale] of LANGUAGES) {
    if (locale === "en") continue;
    const localizedQuestions = await questionsForInterviewLocale(locale);
    assert.equal(
      localizedQuestions.length,
      2_025,
      `${locale} must not expose unreviewed English open-source prompts`,
    );
    assert.ok(
      localizedQuestions.every(
        (question) => question.sourceId === "interviewthread",
      ),
      `${locale} should only receive the localized InterviewThread matrix`,
    );
  }
});

test("describes the question bank as continuously updated and reviewed in every locale", () => {
  for (const [locale] of LANGUAGES) {
    const copy = questionBankPolicyCopyFor(locale);
    assert.ok(copy.title.trim(), `${locale} needs a question-bank policy title`);
    assert.ok(copy.policy.trim(), `${locale} needs a question-bank policy`);
    assert.match(copy.policy, /InterviewThread/);
  }

  assert.equal(
    questionBankPolicyCopyFor("zh-TW").title,
    "持續更新的受審核題庫",
  );
  assert.match(
    questionBankPolicyCopyFor("zh-TW").policy,
    /不會為了題量犧牲授權、品質或安全性/,
  );
  assert.equal(
    questionBankPolicyCopyFor("en").title,
    "Continuously updated, reviewed question bank",
  );
  assert.match(
    questionBankPolicyCopyFor("en").policy,
    /does not run an unreviewed real-time web crawler/,
  );
});
