"use client";

import { useEffect, useState } from "react";

type ActivityType =
  | "analysis_completed"
  | "interview_started"
  | "interview_answered"
  | "tracker_updated"
  | "feedback_submitted";

type ActivityEvent = {
  id: string;
  eventType: ActivityType;
  createdAt: string;
};

export function AccountActivity({
  locale,
  title,
  labels,
}: {
  locale: string;
  title: string;
  labels: Record<ActivityType, string>;
}) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/activity", { headers: { accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) return { events: [] };
        return (await response.json()) as { events?: ActivityEvent[] };
      })
      .then((payload) => {
        if (!cancelled && Array.isArray(payload.events))
          setEvents(payload.events);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!events.length) return null;

  return (
    <section className="account-activity" aria-label={title}>
      <strong>{title}</strong>
      <div className="account-saved-work">
        {events.map((event, index) => (
          <div key={event.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{labels[event.eventType]}</strong>
            <time dateTime={event.createdAt}>
              {new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(event.createdAt))}
            </time>
          </div>
        ))}
      </div>
    </section>
  );
}
