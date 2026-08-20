import assert from "node:assert/strict";
import test from "node:test";
import {
  OPEN_INTERVIEW_QUESTIONS,
  OPEN_INTERVIEW_QUESTION_SOURCES,
  openInterviewQuestionSource,
  questionsForInterviewRole,
} from "../app/interview-question-bank.ts";

test("bundles a substantial, attributed open interview question bank", () => {
  assert.equal(OPEN_INTERVIEW_QUESTIONS.length, 101);
  assert.equal(OPEN_INTERVIEW_QUESTION_SOURCES.length, 4);
  for (const question of OPEN_INTERVIEW_QUESTIONS) {
    const source = openInterviewQuestionSource(question.sourceId);
    assert.ok(source.href.startsWith("https://github.com/"));
    assert.match(source.license, /^(MIT|CC BY 4\.0)$/);
    assert.ok(question.difficulty >= 1 && question.difficulty <= 3);
    assert.ok(question.depth >= 0 && question.depth <= 4);
  }
});

test("filters questions by role, type, answer stage, and difficulty", () => {
  const systemDesign = questionsForInterviewRole(
    "system-design",
    "system-design",
    "all",
    "all",
  );
  assert.equal(systemDesign.length, 15);
  assert.ok(
    systemDesign.some((question) =>
      question.id.includes("system-design-primer-url-shortener"),
    ),
  );

  const advanced = questionsForInterviewRole(
    "technical",
    "technical",
    "all",
    3,
  );
  assert.ok(advanced.length > 0);
  assert.ok(advanced.every((question) => question.difficulty === 3));

  const frontend = questionsForInterviewRole(
    "technical",
    "frontend",
    "all",
    "all",
  );
  assert.equal(frontend.length, 8);
  assert.ok(
    frontend.every(
      (question) => question.sourceId === "frontend-interview-questions",
    ),
  );

  const context = questionsForInterviewRole(
    "hiring-manager",
    "all",
    0,
    "all",
  );
  assert.equal(context.length, 1);
  assert.equal(context[0].id, "interviewthread-hiring-manager-1");
});

test("keeps imported prompts concrete instead of generic coaching instructions", () => {
  const imported = OPEN_INTERVIEW_QUESTIONS.filter(
    (question) => question.sourceId !== "interviewthread",
  );
  assert.equal(imported.length, 26);
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
