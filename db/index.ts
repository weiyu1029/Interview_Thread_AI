import { env } from "cloudflare:workers";

const createFeedbackTable = `
  CREATE TABLE IF NOT EXISTS feedback_submissions (
    id text PRIMARY KEY NOT NULL,
    category text NOT NULL,
    rating integer NOT NULL,
    message text NOT NULL,
    plan text DEFAULT 'community' NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    locale text DEFAULT 'en' NOT NULL,
    status text DEFAULT 'new' NOT NULL,
    created_at text NOT NULL
  )
`;

const createFeedbackIndex = `
  CREATE INDEX IF NOT EXISTS idx_feedback_priority_created_at
  ON feedback_submissions (priority, created_at)
`;

let feedbackStorageReady: Promise<void> | null = null;

export function ensureFeedbackStorage() {
  if (!env.DB) {
    throw new Error("The CareerStoryMap feedback database is unavailable.");
  }

  if (!feedbackStorageReady) {
    feedbackStorageReady = env.DB
      .batch([
        env.DB.prepare(createFeedbackTable),
        env.DB.prepare(createFeedbackIndex),
      ])
      .then(() => undefined)
      .catch((error) => {
        feedbackStorageReady = null;
        throw error;
      });
  }

  return feedbackStorageReady;
}

export type FeedbackSubmission = {
  id: string;
  category: string;
  rating: number;
  message: string;
  plan: string;
  priority: number;
  locale: string;
  createdAt: string;
};

export async function insertFeedback(submission: FeedbackSubmission) {
  await ensureFeedbackStorage();
  await env.DB.prepare(
    `INSERT INTO feedback_submissions
      (id, category, rating, message, plan, priority, locale, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      submission.id,
      submission.category,
      submission.rating,
      submission.message,
      submission.plan,
      submission.priority,
      submission.locale,
      submission.createdAt,
    )
    .run();
}
