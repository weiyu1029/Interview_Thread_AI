import assert from "node:assert/strict";
import test from "node:test";
import {
  buildInterviewSession,
  INTERVIEW_QUESTION_LENSES,
  INTERVIEW_QUESTION_TRACKS,
  OPEN_INTERVIEW_QUESTIONS,
  OPEN_INTERVIEW_QUESTION_SOURCES,
  openInterviewQuestionSource,
  questionsForInterviewRole,
} from "../app/interview-question-bank.ts";

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

test("bundles at least 1,000 unique, fully attributed interview questions", () => {
  assert.ok(
    OPEN_INTERVIEW_QUESTIONS.length >= 1_000,
    `expected at least 1,000 questions, received ${OPEN_INTERVIEW_QUESTIONS.length}`,
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

test("bundles four stable community lenses and at least 900 community questions", () => {
  assert.equal(INTERVIEW_QUESTION_LENSES.length, 4);
  assert.equal(new Set(INTERVIEW_QUESTION_LENSES).size, 4);
  assert.ok(
    INTERVIEW_QUESTION_LENSES.every(
      (lens) => typeof lens === "string" && lens.trim().length > 0,
    ),
  );

  const community = OPEN_INTERVIEW_QUESTIONS.filter(
    (question) => question.sourceId === "interviewthread",
  );
  assert.ok(
    community.length >= 900,
    `expected at least 900 community questions, received ${community.length}`,
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
        Boolean(question.prompt?.trim()) &&
        (question.prompt?.includes("?") ||
          question.prompt?.endsWith(".") ||
          /^(?:briefly|create|implement|using|write|design|explain|compare)\b/i.test(
            question.prompt || "",
          )),
    ),
  );
  assert.ok(
    imported.some((question) =>
      question.prompt?.includes("Design a URL-shortening service"),
    ),
  );
});

test("imports all 103 pinned MIT questions from 30 Seconds of Interviews", () => {
  const imported = OPEN_INTERVIEW_QUESTIONS.filter(
    (question) => question.sourceId === "30-seconds-interviews",
  );
  assert.equal(imported.length, 103);
  assert.ok(imported.every((question) => question.persona === "technical"));
  assert.ok(
    imported.every((question) =>
      ["technical", "frontend", "javascript"].includes(question.track),
    ),
  );
});

test("builds deterministic, balanced sessions without duplicate questions", () => {
  const config = {
    persona: "hiring-manager",
    goal: "recommended",
    size: 10,
    difficultyMode: "adaptive",
    seed: 91,
  };
  const first = buildInterviewSession(config);
  const repeated = buildInterviewSession(config);
  const different = buildInterviewSession({ ...config, seed: 92 });

  assert.equal(first.questionIds.length, 10);
  assert.equal(new Set(first.questionIds).size, 10);
  assert.deepEqual(repeated.questionIds, first.questionIds);
  assert.notDeepEqual(different.questionIds, first.questionIds);
  assert.ok(first.coverage.depths.length >= 3);
  assert.deepEqual(first.coverage.difficulties, [1, 2, 3]);
});

test("avoids recent questions and safely broadens an overly narrow preference", () => {
  const first = buildInterviewSession({
    persona: "technical",
    goal: "technical",
    size: 15,
    difficultyMode: "adaptive",
    track: "frontend",
    lens: "pressure",
    seed: 7,
  });
  assert.equal(first.questionIds.length, 15);
  assert.equal(first.usedFallback, true);

  const next = buildInterviewSession({
    persona: "technical",
    goal: "technical",
    size: 15,
    difficultyMode: "adaptive",
    track: "frontend",
    lens: "pressure",
    seed: 8,
    recentlyPracticedIds: first.questionIds,
  });
  assert.equal(next.questionIds.length, 15);
  assert.equal(
    next.questionIds.some((id) => first.questionIds.includes(id)),
    false,
  );
});
