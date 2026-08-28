import type { LocaleCode } from "./i18n";

export type VoiceTurnSubmissionPhase = "ready" | "claimed" | "submitted";

export type VoiceTurnSubmissionState = Readonly<{
  turnId: string;
  phase: VoiceTurnSubmissionPhase;
}>;

export type VoiceTextAmount = Readonly<{
  count: number;
  unit: "grapheme" | "word";
}>;

export type VoiceTurnSubmissionDecision = Readonly<{
  answer: string;
  amount: VoiceTextAmount;
  nextState: VoiceTurnSubmissionState;
  reason:
    | "claimed"
    | "empty-answer"
    | "stale-turn"
    | "already-claimed"
    | "already-submitted";
  shouldSubmit: boolean;
}>;

const GRAPHEME_AMOUNT_LOCALES = new Set<LocaleCode>([
  "zh-CN",
  "zh-TW",
  "ja",
  "ko",
  "th",
]);

// Korean is measured in graphemes, but its orthography still requires spaces
// between otherwise unrelated recognition segments.
const NO_SPACE_JOIN_LOCALES = new Set<LocaleCode>([
  "zh-CN",
  "zh-TW",
  "ja",
  "th",
]);

const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;
const CONTENT_GRAPHEME_PATTERN = /[\p{L}\p{N}]/u;

type TranscriptUnit = Readonly<{
  end: number;
  key: string;
  start: number;
}>;

function normalizedTurnId(turnId: string) {
  return turnId.trim();
}

function normalizedAnswer(answer: string) {
  return answer.replace(/\s+/gu, " ").trim();
}

function usesGraphemeAmount(locale: LocaleCode) {
  return GRAPHEME_AMOUNT_LOCALES.has(locale);
}

function joinsWithoutSpace(locale: LocaleCode) {
  return NO_SPACE_JOIN_LOCALES.has(locale);
}

function transcriptUnits(text: string, locale: LocaleCode): TranscriptUnit[] {
  if (!usesGraphemeAmount(locale)) {
    return Array.from(text.matchAll(WORD_PATTERN), (match) => ({
      start: match.index,
      end: match.index + match[0].length,
      key: match[0].toLocaleLowerCase(locale),
    }));
  }

  const segmenter = new Intl.Segmenter(locale, { granularity: "grapheme" });
  return Array.from(segmenter.segment(text), (segment) => ({
    start: segment.index,
    end: segment.index + segment.segment.length,
    key: segment.segment.toLocaleLowerCase(locale),
  })).filter((unit) => CONTENT_GRAPHEME_PATTERN.test(unit.key));
}

function sequenceMatchesAt(
  haystack: readonly TranscriptUnit[],
  needle: readonly TranscriptUnit[],
  start: number,
) {
  if (!needle.length || start < 0 || start + needle.length > haystack.length)
    return false;
  return needle.every(
    (unit, index) => haystack[start + index]?.key === unit.key,
  );
}

function sequenceContains(
  haystack: readonly TranscriptUnit[],
  needle: readonly TranscriptUnit[],
) {
  if (!needle.length || needle.length > haystack.length) return false;
  for (let start = 0; start <= haystack.length - needle.length; start += 1) {
    if (sequenceMatchesAt(haystack, needle, start)) return true;
  }
  return false;
}

function longestSuffixPrefixOverlap(
  current: readonly TranscriptUnit[],
  incoming: readonly TranscriptUnit[],
) {
  const maximum = Math.min(current.length, incoming.length);
  for (let length = maximum; length > 0; length -= 1) {
    if (sequenceMatchesAt(current, incoming.slice(0, length), current.length - length))
      return length;
  }
  return 0;
}

/**
 * Starts a new client-owned voice turn. The caller should use a unique turn id
 * for every recording attempt and retain the returned state in a ref.
 */
export function createVoiceTurnSubmissionState(
  turnId: string,
): VoiceTurnSubmissionState {
  return { turnId: normalizedTurnId(turnId), phase: "ready" };
}

/**
 * Atomically claims a voice turn in a pure state transition. Persist nextState
 * before starting asynchronous transcription/model work; repeated events for
 * the same turn will then be rejected as duplicates.
 */
export function decideVoiceTurnSubmission(
  state: VoiceTurnSubmissionState,
  {
    turnId,
    answer,
    locale,
  }: { turnId: string; answer: string; locale: LocaleCode },
): VoiceTurnSubmissionDecision {
  const normalizedId = normalizedTurnId(turnId);
  const normalized = normalizedAnswer(answer);
  const amount = estimateVoiceTextAmount(normalized, locale);
  if (!normalized || amount.count === 0)
    return {
      answer: normalized,
      amount,
      nextState: state,
      reason: "empty-answer",
      shouldSubmit: false,
    };
  if (!normalizedId || normalizedId !== state.turnId)
    return {
      answer: normalized,
      amount,
      nextState: state,
      reason: "stale-turn",
      shouldSubmit: false,
    };
  if (state.phase === "claimed")
    return {
      answer: normalized,
      amount,
      nextState: state,
      reason: "already-claimed",
      shouldSubmit: false,
    };
  if (state.phase === "submitted")
    return {
      answer: normalized,
      amount,
      nextState: state,
      reason: "already-submitted",
      shouldSubmit: false,
    };
  return {
    answer: normalized,
    amount,
    nextState: { ...state, phase: "claimed" },
    reason: "claimed",
    shouldSubmit: true,
  };
}

/** Releases a failed claim for retry, or permanently closes a successful turn. */
export function settleVoiceTurnSubmission(
  state: VoiceTurnSubmissionState,
  { turnId, succeeded }: { turnId: string; succeeded: boolean },
): VoiceTurnSubmissionState {
  if (
    normalizedTurnId(turnId) !== state.turnId ||
    state.phase !== "claimed"
  )
    return state;
  return { ...state, phase: succeeded ? "submitted" : "ready" };
}

/**
 * Merges streaming interim/final transcripts without repeating an interim
 * prefix when the final result extends it. It also handles restarted speech
 * recognizers whose next result overlaps the previous result's suffix.
 */
export function mergeVoiceTranscript(
  current: string,
  incoming: string,
  locale: LocaleCode,
) {
  const left = current.trim();
  const right = incoming.trim();
  if (!left) return right;
  if (!right) return left;

  const leftUnits = transcriptUnits(left, locale);
  const rightUnits = transcriptUnits(right, locale);
  if (!leftUnits.length) return right;
  if (!rightUnits.length) return left;

  if (sequenceContains(rightUnits, leftUnits)) return right;
  if (sequenceContains(leftUnits, rightUnits)) return left;

  const overlap = longestSuffixPrefixOverlap(leftUnits, rightUnits);
  if (overlap > 0) {
    const suffixStart = rightUnits[overlap - 1]?.end ?? 0;
    return `${left}${right.slice(suffixStart)}`.trim();
  }

  return `${left}${joinsWithoutSpace(locale) ? "" : " "}${right}`;
}

/**
 * Reports a locale-appropriate amount without pretending that CJK/Thai text
 * has whitespace-delimited words. Callers can choose separate thresholds for
 * graphemes and words instead of comparing unlike scripts to one character
 * count.
 */
export function estimateVoiceTextAmount(
  text: string,
  locale: LocaleCode,
): VoiceTextAmount {
  const unit = usesGraphemeAmount(locale) ? "grapheme" : "word";
  return { count: transcriptUnits(text, locale).length, unit };
}
