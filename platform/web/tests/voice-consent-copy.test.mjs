import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { LANGUAGES } from "../app/i18n.ts";
import { STT_CONSENT_VERSION } from "../app/interview-stt.ts";
import { informationPageCopyFor } from "../app/site-information.ts";
import {
  MICROPHONE_CONSENT_COPY,
  voiceConsentCopyFor,
} from "../app/voice-consent-copy.ts";

const LOCALES = LANGUAGES.map(([locale]) => locale);
const REVIEWED_CONSENT_LOCALES = ["en", "zh-CN", "zh-TW"];
const FIELDS = [
  "title",
  "cloudBody",
  "browserBody",
  "cloudButton",
  "browserButton",
  "typeButton",
  "privacyLink",
  "coachedButton",
  "coachedNotice",
  "coachedReady",
  "coachedUnavailable",
];

function sourceSection(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `missing source marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `missing source marker: ${endMarker}`);
  return source.slice(start, end);
}

test("defines reviewed microphone consent copy and uses English fallback elsewhere", () => {
  assert.equal(LOCALES.length, 40);
  assert.deepEqual(
    Object.keys(MICROPHONE_CONSENT_COPY).sort(),
    [...REVIEWED_CONSENT_LOCALES].sort(),
  );

  for (const locale of REVIEWED_CONSENT_LOCALES) {
    const copy = MICROPHONE_CONSENT_COPY[locale];
    assert.ok(copy, `${locale} copy is missing`);
    assert.deepEqual(Object.keys(copy).sort(), [...FIELDS].sort(), `${locale} fields`);
    for (const field of FIELDS) {
      assert.equal(typeof copy[field], "string", `${locale}.${field} must be a string`);
      assert.ok(copy[field].trim(), `${locale}.${field} must not be empty`);
    }
  }

  for (const locale of LOCALES.filter(
    (locale) => !REVIEWED_CONSENT_LOCALES.includes(locale),
  ))
    assert.deepEqual(
      voiceConsentCopyFor(locale),
      voiceConsentCopyFor("en"),
      `${locale} must use the English consent fallback until reviewed copy exists`,
    );
});

test("cloud consent names the exact transcription providers for every locale", () => {
  for (const locale of LOCALES) {
    const body = voiceConsentCopyFor(locale).cloudBody;
    assert.match(body, /ElevenLabs Scribe/, `${locale} must name ElevenLabs Scribe`);
    assert.match(body, /Microsoft Azure Speech/, `${locale} must name Microsoft Azure Speech`);
  }
});

test("English and Chinese copy precisely disclose InterviewThread audio handling", () => {
  const en = MICROPHONE_CONSENT_COPY.en;
  assert.match(
    en.cloudBody,
    /InterviewThread does not store or log (?:the raw )?audio/i,
  );
  assert.match(en.browserBody, /InterviewThread does not upload or save audio/i);
  assert.match(
    en.coachedNotice,
    /InterviewThread does not (?:save|store or log) (?:it|the (?:recording|audio))/i,
  );

  const simplified = MICROPHONE_CONSENT_COPY["zh-CN"];
  assert.match(simplified.cloudBody, /InterviewThread 不(?:会)?存储或记录(?:原始)?音频/);
  assert.match(simplified.browserBody, /InterviewThread 不会上传或保存音频/);
  assert.match(
    simplified.coachedNotice,
    /InterviewThread 不会(?:保存|存储或记录)(?:录音|当前录音)/,
  );

  const traditional = MICROPHONE_CONSENT_COPY["zh-TW"];
  assert.match(traditional.cloudBody, /InterviewThread 不會儲存或記錄(?:原始)?音訊/);
  assert.match(traditional.browserBody, /InterviewThread 不會上傳或儲存音訊/);
  assert.match(
    traditional.coachedNotice,
    /InterviewThread 不會(?:儲存|儲存或記錄)(?:錄音|目前的錄音)/,
  );
});

test("clearly distinguishes voice-mode submission from reviewable text mode", () => {
  const english = voiceConsentCopyFor("en");
  assert.match(
    english.cloudBody,
    /Voice interview mode[\s\S]*Finish answer & continue[\s\S]*(?:sends|submitted)[\s\S]*(?:score|scored)[\s\S]*(?:follow-up|new topic)/i,
  );
  assert.match(
    english.cloudBody,
    /Text mode[\s\S]*editable[\s\S]*press Send/i,
  );
  assert.match(
    english.browserBody,
    /Finish answer & continue[\s\S]*(?:submits|submitted)[\s\S]*(?:scoring|next question)/i,
  );

  const simplified = voiceConsentCopyFor("zh-CN");
  assert.match(simplified.cloudBody, /完成回答并继续[\s\S]*逐字稿[\s\S]*评分/);
  assert.match(simplified.cloudBody, /文字作答模式[\s\S]*可编辑[\s\S]*发送/);

  const traditional = voiceConsentCopyFor("zh-TW");
  assert.match(traditional.cloudBody, /完成回答並繼續[\s\S]*逐字稿[\s\S]*評分/);
  assert.match(traditional.cloudBody, /文字作答模式[\s\S]*可編輯[\s\S]*傳送/);
});

test("publishes the v3 consent contract and aligned privacy disclosure", () => {
  assert.equal(STT_CONSENT_VERSION, "voice-input-v3");

  const english = informationPageCopyFor("en", "privacy");
  assert.match(
    english.sections.flatMap((section) => section.paragraphs || []).join(" "),
    /Finish answer & continue[\s\S]*submitted[\s\S]*score/i,
  );

  const traditional = informationPageCopyFor("zh-TW", "privacy");
  assert.match(
    traditional.sections.flatMap((section) => section.paragraphs || []).join(" "),
    /完成回答並繼續[\s\S]*逐字稿[\s\S]*評分/,
  );

  const simplified = informationPageCopyFor("zh-CN", "privacy");
  assert.match(simplified.title, /职业证据/);
  assert.match(
    simplified.sections.flatMap((section) => section.paragraphs || []).join(" "),
    /完成回答并继续[\s\S]*逐字稿[\s\S]*评分/,
  );
});

test("voice capture is gated by the voice-consent flow before start and getUserMedia", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const toggle = sourceSection(
    page,
    "function toggleInterviewListening()",
    "async function acceptVoiceInputMode",
  );
  assert.match(toggle, /storedVoiceInputMode\(\)/);
  assert.match(toggle, /if \(!remembered[\s\S]*setVoiceConsentOpen\(true\);[\s\S]*return;/);
  assert.ok(
    toggle.indexOf("setVoiceConsentOpen(true)") <
      toggle.indexOf("startInterviewListening(remembered)"),
    "the consent gate must precede voice start",
  );

  const accept = sourceSection(
    page,
    "async function acceptVoiceInputMode",
    "async function startInterviewListening",
  );
  assert.match(accept, /rememberVoiceInputMode\(permittedMode\)/);
  assert.ok(
    accept.indexOf("setVoiceConsentOpen(false)") <
      accept.indexOf("startInterviewListening(permittedMode)"),
    "only the consent action may continue to voice start",
  );

  const start = sourceSection(
    page,
    "async function startInterviewListening",
    "async function transformRecordedInterviewVoice",
  );
  assert.match(start, /navigator\.mediaDevices\.getUserMedia\(/);
  assert.doesNotMatch(start, /setVoiceConsentOpen\(true\)/);
});

test("transcription route requires the current STT consent version", async () => {
  const route = await readFile(
    new URL("../app/api/transcribe/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /import\s*\{[\s\S]*STT_CONSENT_VERSION[\s\S]*\}\s*from\s*["']\.\.\/\.\.\/interview-stt\.ts["']/);
  assert.match(route, /const consentVersion = parsed\.payload\.get\(["']consent_version["']\)/);
  assert.match(route, /consentVersion\s*!==\s*STT_CONSENT_VERSION/);
});

test("speech-to-speech uses a separate explicit consent modal", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(
    page,
    /const \[voiceTransformConsentOpen, setVoiceTransformConsentOpen\]\s*=\s*useState\(false\)/,
  );
  assert.match(page, /onClick=\{\(\) => setVoiceTransformConsentOpen\(true\)\}/);
  assert.match(page, /\{voiceTransformConsentOpen && \(/);
  assert.match(page, /aria-labelledby="voice-transform-title"/);
  assert.match(page, /aria-describedby="voice-transform-description"/);
  assert.match(page, /onClick=\{\(\) => void transformRecordedInterviewVoice\(\)\}/);

  const transform = sourceSection(
    page,
    "async function transformRecordedInterviewVoice",
    "async function sendFeedback",
  );
  assert.match(transform, /form\.append\(["']consent_version["'], STS_CONSENT_VERSION\)/);
  assert.match(transform, /fetch\(["']\/api\/speech-to-speech["']/);

  const modalStart = page.indexOf("{voiceTransformConsentOpen && (");
  const transformCall = page.indexOf(
    "onClick={() => void transformRecordedInterviewVoice()}",
    modalStart,
  );
  assert.ok(modalStart >= 0 && transformCall > modalStart);
});
