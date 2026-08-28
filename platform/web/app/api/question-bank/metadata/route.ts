import { QUESTION_BANK_RELEASE_METADATA } from "../../../question-bank-release.ts";

export async function GET() {
  return Response.json(QUESTION_BANK_RELEASE_METADATA, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-InterviewThread-Question-Bank-Release":
        QUESTION_BANK_RELEASE_METADATA.releaseId,
    },
  });
}
