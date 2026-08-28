import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { GET as getQuestionBankMetadata } from "../app/api/question-bank/metadata/route.ts";
import {
  OPEN_INTERVIEW_QUESTION_SOURCES,
  questionsForInterviewLocale,
} from "../app/interview-question-bank.ts";
import { LANGUAGES } from "../app/i18n.ts";
import { QUESTION_BANK_RELEASE_METADATA } from "../app/question-bank-release.ts";

test("publishes auditable metadata for the immutable reviewed release", async () => {
  const metadata = QUESTION_BANK_RELEASE_METADATA;
  assert.match(metadata.releaseId, /^qb-\d{4}-\d{2}-\d{2}\.[a-f0-9]{7}$/);
  assert.ok(Number.isFinite(Date.parse(metadata.publishedAt)));
  assert.ok(Number.isFinite(Date.parse(metadata.sourceCheckedAt)));
  assert.ok(Date.parse(metadata.sourceCheckedAt) <= Date.parse(metadata.publishedAt));

  const english = await questionsForInterviewLocale("en");
  assert.equal(metadata.counts.english, english.length);
  assert.equal(metadata.counts.supportedLocales, LANGUAGES.length);
  for (const [locale] of LANGUAGES) {
    if (locale === "en") continue;
    assert.equal(
      metadata.counts.eachOtherLocale,
      (await questionsForInterviewLocale(locale)).length,
      locale,
    );
  }

  assert.equal(metadata.policy.humanReviewRequired, true);
  assert.equal(metadata.policy.automaticUpstreamPublishing, false);
  assert.equal(metadata.policy.unreviewedRealTimeCrawler, false);
  assert.doesNotMatch(metadata.policy.freshnessClaim, /real[ -]?time/i);
  assert.match(metadata.policy.publishing, /never published automatically/i);
});

test("accounts for every declared source and keeps monitored revisions pinned", () => {
  const ids = metadataSourceIds(QUESTION_BANK_RELEASE_METADATA.sources);
  assert.deepEqual(
    ids,
    OPEN_INTERVIEW_QUESTION_SOURCES.map((source) => source.id).sort(),
  );
  assert.equal(
    QUESTION_BANK_RELEASE_METADATA.sources.reduce(
      (sum, source) => sum + source.records,
      0,
    ),
    QUESTION_BANK_RELEASE_METADATA.counts.english,
  );

  const monitored = QUESTION_BANK_RELEASE_METADATA.sources.filter(
    (source) => source.monitorUpstream,
  );
  assert.ok(monitored.length > 0);
  assert.ok(
    monitored.every(
      (source) =>
        /^[a-f0-9]{40}$/.test(source.approvedRevision || "") &&
        source.reviewMode === "candidate-only",
    ),
  );
});

test("serves public release metadata without caching", async () => {
  const response = await getQuestionBankMetadata();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(
    response.headers.get("x-interviewthread-question-bank-release"),
    QUESTION_BANK_RELEASE_METADATA.releaseId,
  );
  assert.deepEqual(await response.json(), QUESTION_BANK_RELEASE_METADATA);
});

test("shows the reviewed release and source-check time beside the question bank", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /QUESTION_BANK_RELEASE_METADATA\.sourceCheckedAt/);
  assert.match(page, /QUESTION_BANK_RELEASE_METADATA\.releaseId/);
  assert.match(page, /className="question-bank-release"/);
});

function metadataSourceIds(sources) {
  const ids = sources.map((source) => source.id);
  assert.equal(ids.length, new Set(ids).size, "source ids must be unique");
  return ids.sort();
}
