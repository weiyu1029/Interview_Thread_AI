import releaseMetadata from "./question-bank-release.json" with { type: "json" };

export type QuestionBankReleaseMetadata = typeof releaseMetadata;

/**
 * Public provenance for the currently published, immutable question-bank
 * snapshot. This describes what has already passed the release gate; it is not
 * a claim that unreviewed upstream content is streamed into production.
 */
export const QUESTION_BANK_RELEASE_METADATA: QuestionBankReleaseMetadata =
  releaseMetadata;

