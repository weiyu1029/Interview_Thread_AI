import assert from "node:assert/strict";
import test from "node:test";
import {
  createVoiceTurnSubmissionState,
  decideVoiceTurnSubmission,
  estimateVoiceTextAmount,
  mergeVoiceTranscript,
  settleVoiceTurnSubmission,
} from "../app/interview-voice-turn.ts";

test("claims each voice turn once and rejects duplicate or stale completion events", () => {
  const ready = createVoiceTurnSubmissionState("recording-17");
  const first = decideVoiceTurnSubmission(ready, {
    turnId: "recording-17",
    answer: "  I led the launch and reduced processing time by 31%.  ",
    locale: "en",
  });
  assert.equal(first.shouldSubmit, true);
  assert.equal(first.reason, "claimed");
  assert.equal(
    first.answer,
    "I led the launch and reduced processing time by 31%.",
  );
  assert.deepEqual(first.nextState, {
    turnId: "recording-17",
    phase: "claimed",
  });

  const duplicate = decideVoiceTurnSubmission(first.nextState, {
    turnId: "recording-17",
    answer: first.answer,
    locale: "en",
  });
  assert.equal(duplicate.shouldSubmit, false);
  assert.equal(duplicate.reason, "already-claimed");

  const stale = decideVoiceTurnSubmission(first.nextState, {
    turnId: "recording-16",
    answer: first.answer,
    locale: "en",
  });
  assert.equal(stale.shouldSubmit, false);
  assert.equal(stale.reason, "stale-turn");

  const submitted = settleVoiceTurnSubmission(first.nextState, {
    turnId: "recording-17",
    succeeded: true,
  });
  const afterSuccess = decideVoiceTurnSubmission(submitted, {
    turnId: "recording-17",
    answer: first.answer,
    locale: "en",
  });
  assert.equal(afterSuccess.shouldSubmit, false);
  assert.equal(afterSuccess.reason, "already-submitted");
});

test("does not consume a turn for empty speech and releases failed claims for retry", () => {
  const ready = createVoiceTurnSubmissionState("recording-18");
  const empty = decideVoiceTurnSubmission(ready, {
    turnId: "recording-18",
    answer: " ... ",
    locale: "en",
  });
  assert.equal(empty.shouldSubmit, false);
  assert.equal(empty.reason, "empty-answer");
  assert.equal(empty.nextState, ready);

  const claimed = decideVoiceTurnSubmission(ready, {
    turnId: "recording-18",
    answer: "I owned the migration.",
    locale: "en",
  });
  const retryable = settleVoiceTurnSubmission(claimed.nextState, {
    turnId: "recording-18",
    succeeded: false,
  });
  assert.deepEqual(retryable, { turnId: "recording-18", phase: "ready" });
  assert.equal(
    decideVoiceTurnSubmission(retryable, {
      turnId: "recording-18",
      answer: claimed.answer,
      locale: "en",
    }).shouldSubmit,
    true,
  );
});

test("replaces an English interim prefix with its longer final transcript", () => {
  assert.equal(
    mergeVoiceTranscript("I led", "I led the rollout", "en"),
    "I led the rollout",
  );
  assert.equal(
    mergeVoiceTranscript(
      "I led the migration",
      "the migration and reduced costs",
      "en",
    ),
    "I led the migration and reduced costs",
  );
  assert.equal(
    mergeVoiceTranscript("I led the rollout", "I led", "en"),
    "I led the rollout",
  );
});

test("merges CJK interim/final extensions and suffix overlaps without spaces", () => {
  assert.equal(
    mergeVoiceTranscript("我負責推出", "我負責推出新的支付流程", "zh-TW"),
    "我負責推出新的支付流程",
  );
  assert.equal(
    mergeVoiceTranscript("我分析使用者需求", "需求並重新設計流程", "zh-TW"),
    "我分析使用者需求並重新設計流程",
  );
  assert.equal(
    mergeVoiceTranscript("課題を分析", "分析して改善した", "ja"),
    "課題を分析して改善した",
  );
});

test("keeps unrelated segments and uses a locale-appropriate separator", () => {
  assert.equal(
    mergeVoiceTranscript("I gathered evidence.", "Then I tested it.", "en"),
    "I gathered evidence. Then I tested it.",
  );
  assert.equal(
    mergeVoiceTranscript("我先蒐集證據。", "接著驗證結果。", "zh-TW"),
    "我先蒐集證據。接著驗證結果。",
  );
  assert.equal(
    mergeVoiceTranscript("성과를 정리했습니다.", "팀과 검증했습니다.", "ko"),
    "성과를 정리했습니다. 팀과 검증했습니다.",
  );
});

test("estimates whitespace languages in words and compact scripts in graphemes", () => {
  assert.deepEqual(
    estimateVoiceTextAmount("I owned a cross-functional launch.", "en"),
    { count: 5, unit: "word" },
  );
  assert.deepEqual(estimateVoiceTextAmount("我負責推出新流程。", "zh-TW"), {
    count: 8,
    unit: "grapheme",
  });
  assert.deepEqual(estimateVoiceTextAmount("課題を分析した。", "ja"), {
    count: 7,
    unit: "grapheme",
  });
  assert.deepEqual(estimateVoiceTextAmount("성과를 개선했다.", "ko"), {
    count: 7,
    unit: "grapheme",
  });
  assert.deepEqual(estimateVoiceTextAmount("กำลัง", "th"), {
    count: 3,
    unit: "grapheme",
  });
  assert.deepEqual(estimateVoiceTextAmount("...", "en"), {
    count: 0,
    unit: "word",
  });
});
