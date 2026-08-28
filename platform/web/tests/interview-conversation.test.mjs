import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { decideInterviewTurn } from "../app/interview-conversation.ts";

test("keeps probing answers that do not yet contain defensible evidence", () => {
  assert.deepEqual(
    decideInterviewTurn({
      answer: "I helped the team and it went well.",
      turn: 1,
      evidence: 35,
      outcome: 45,
      structure: 50,
    }),
    { action: "follow-up", reason: "needs-evidence" },
  );
});

test("moves to a new topic after a strong, sufficiently explored answer", () => {
  assert.deepEqual(
    decideInterviewTurn({
      answer:
        "I owned the rollout, compared the baseline with a four-week cohort, reduced processing time by 31%, and documented the remaining limitation for the operations team.",
      turn: 2,
      evidence: 84,
      outcome: 77,
      structure: 73,
    }),
    { action: "new-topic", reason: "topic-covered" },
  );
});

test("uses locale-aware answer length for compact-script interviews", () => {
  assert.deepEqual(
    decideInterviewTurn({
      answer:
        "我負責付款流程改版，先分析失敗紀錄，再和工程與客服共同驗證方案，上線後付款失敗率降低百分之三十一，也記錄了尚未解決的限制。",
      turn: 2,
      evidence: 84,
      outcome: 77,
      structure: 73,
      locale: "zh-TW",
    }),
    { action: "new-topic", reason: "topic-covered" },
  );
});

test("voice interview requires an explicit finish action before submission", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /type InterviewDeliveryMode = "Text" \| "Voice"/);
  assert.match(page, /finishVoiceAnswerAndContinue/);
  assert.match(page, /submitVoiceAnswerOnStopRef\.current = true/);
  assert.match(page, /submitPendingVoiceAnswer\(finalAnswer\)/);
  assert.match(page, /decideVoiceTurnSubmission/);
  assert.match(page, /mergeVoiceTranscript/);
  assert.match(page, /autoReadInterviewQuestions \|\| interviewDeliveryMode === "Voice"/);
  assert.match(page, /changeInterviewDeliveryMode/);
  assert.match(page, /CLOUD_READ_ALOUD_CONSENT_KEY/);
  assert.match(page, /useConversationalVoice/);
  assert.match(page, /"\/api\/interview-dialogue"/);
  assert.match(page, /DIALOGUE_CONSENT_VERSION/);
  assert.match(page, /const chosenQuestion = previewOpenQuestion/);
  assert.match(page, /isRefiningVoice \|\|\s*isSpeaking/s);
  assert.match(
    page,
    /turnDecision\.action === "follow-up" \? answer : ""/,
  );
  assert.match(page, /action === "new-topic"/);
});

test("starting a voice answer cannot record pending interviewer speech", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(
    page,
    /async function startInterviewListening\(mode: VoiceInputMode\) \{[\s\S]*?stopInterviewSpeech\(\);[\s\S]*?type RecognitionAlternative/,
  );
  assert.match(
    page,
    /expectedRequestId !== interviewSpeechRequestIdRef\.current \|\|\s*keepListeningRef\.current \|\|\s*mediaRecorderRef\.current\?\.state === "recording"/,
  );
});

test("the 2,000-plus bank is not rendered as a giant question select", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(
    page,
    /filteredOpenQuestions\.map\(\(question\) => \(\s*<option/s,
  );
  assert.match(page, /className="open-question-advanced"/);
  assert.match(page, /setQuestionShuffleIndex\(\(current\) => current \+ 1\)/);
  assert.match(page, /baselineQuestionsForInterviewLocale/);
  assert.match(page, /questionsForInterviewLocale\(locale\)\.then/);
});
