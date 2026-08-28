export type InterviewTurnAction = "follow-up" | "new-topic";

export type InterviewTurnDecision = {
  action: InterviewTurnAction;
  reason:
    | "needs-evidence"
    | "needs-outcome"
    | "needs-structure"
    | "topic-covered"
    | "stage-complete";
};

export function decideInterviewTurn({
  answer,
  turn,
  evidence,
  outcome,
  structure,
  locale = "en",
}: {
  answer: string;
  turn: number;
  evidence: number;
  outcome: number;
  structure: number;
  locale?: LocaleCode;
}): InterviewTurnDecision {
  const answerAmount = estimateVoiceTextAmount(answer, locale);
  const minimumAnswerAmount = answerAmount.unit === "word" ? 18 : 32;
  if (turn >= 4) return { action: "new-topic", reason: "stage-complete" };
  if (answerAmount.count < minimumAnswerAmount || evidence < 58)
    return { action: "follow-up", reason: "needs-evidence" };
  if (outcome < 58)
    return { action: "follow-up", reason: "needs-outcome" };
  if (structure < 58)
    return { action: "follow-up", reason: "needs-structure" };
  if (turn >= 1 && evidence >= 72 && outcome >= 68 && structure >= 65)
    return { action: "new-topic", reason: "topic-covered" };
  return { action: "follow-up", reason: "needs-evidence" };
}
import type { LocaleCode } from "./i18n";
import { estimateVoiceTextAmount } from "./interview-voice-turn.ts";
