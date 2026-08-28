import licensedSourceQuestions from "./open-interview-source-prompts.generated.json" with { type: "json" };
import type { OpenInterviewQuestion } from "./interview-question-bank";

export const LICENSED_SOURCE_QUESTIONS =
  licensedSourceQuestions as readonly OpenInterviewQuestion[];
