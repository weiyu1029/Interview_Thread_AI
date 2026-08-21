import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

test("uses a guided session builder instead of rendering every question in a select", () => {
  assert.match(page, /className="smart-session-builder"/);
  assert.match(page, /interviewSessionUi\.goal/);
  assert.match(page, /interviewSessionUi\.length/);
  assert.match(page, /interviewSessionUi\.challenge/);
  assert.match(page, /interviewSessionUi\.fineTune/);
  assert.doesNotMatch(page, /filteredOpenQuestions\.map/);
  assert.doesNotMatch(page, /className="open-question-picker"/);
});
