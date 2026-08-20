"use client";

import { useEffect, useState } from "react";
import type { BetaCopy } from "./beta-copy";

type Participant = {
  status: keyof BetaCopy["statusLabels"];
  cohort: string;
  roleFamily: string;
  experienceLevel: string;
  interviewTimeline: string;
  primaryGoal: string;
  researchConsent: boolean;
  productUpdatesConsent: boolean;
};

export function BetaApplication({
  authenticated,
  locale,
  accountHref,
  termsHref,
  privacyHref,
  copy,
}: {
  authenticated: boolean;
  locale: string;
  accountHref: string;
  termsHref: string;
  privacyHref: string;
  copy: BetaCopy;
}) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(authenticated);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    fetch("/api/beta", { headers: { accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error("status");
        return response.json() as Promise<{ participant: Participant | null }>;
      })
      .then((body) => active && setParticipant(body.participant))
      .catch(() => active && setError(copy.error))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [authenticated, copy.error]);

  async function submit(formData: FormData) {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/beta", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          roleFamily: formData.get("roleFamily"),
          experienceLevel: formData.get("experienceLevel"),
          interviewTimeline: formData.get("interviewTimeline"),
          primaryGoal: formData.get("primaryGoal"),
          locale,
          termsAccepted: formData.get("termsAccepted") === "on",
          researchConsent: formData.get("researchConsent") === "on",
          productUpdatesConsent: formData.get("productUpdatesConsent") === "on",
        }),
      });
      if (!response.ok) throw new Error("submit");
      const body = (await response.json()) as { participant: Participant };
      setParticipant(body.participant);
      setEditing(false);
    } catch {
      setError(copy.error);
    } finally {
      setSubmitting(false);
    }
  }

  async function withdraw() {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/beta", { method: "DELETE" });
      if (!response.ok) throw new Error("withdraw");
      const body = (await response.json()) as { participant: Participant };
      setParticipant(body.participant);
    } catch {
      setError(copy.error);
    } finally {
      setSubmitting(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="beta-application-card">
        <h2>{copy.formTitle}</h2>
        <p>{copy.formDescription}</p>
        <a className="button primary" href={accountHref}>{copy.signIn}</a>
      </div>
    );
  }

  if (loading) return <div className="beta-application-card"><p>{copy.loading}</p></div>;

  if (participant && participant.status !== "withdrawn" && !editing) {
    return (
      <div className="beta-application-card beta-status-card">
        <p className="eyebrow">{copy.statusTitle}</p>
        <h2>{copy.statusLabels[participant.status]}</h2>
        <p>{copy.statusHelp}</p>
        <dl>
          <div><dt>{copy.roleFamily}</dt><dd>{optionLabel(copy.roleOptions, participant.roleFamily)}</dd></div>
          <div><dt>{copy.primaryGoal}</dt><dd>{optionLabel(copy.goalOptions, participant.primaryGoal)}</dd></div>
        </dl>
        <div className="beta-form-actions">
          <button className="button secondary" type="button" onClick={() => setEditing(true)}>{copy.reapply}</button>
          <button className="button quiet" type="button" onClick={withdraw} disabled={submitting}>{copy.withdraw}</button>
        </div>
        {error && <p className="form-status error" role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <form className="beta-application-card beta-form" action={submit}>
      <h2>{copy.formTitle}</h2>
      <p>{copy.formDescription}</p>
      <div className="beta-field-grid">
        <SelectField name="roleFamily" label={copy.roleFamily} options={copy.roleOptions} copy={copy} initial={participant?.roleFamily} />
        <SelectField name="experienceLevel" label={copy.experienceLevel} options={copy.experienceOptions} copy={copy} initial={participant?.experienceLevel} />
        <SelectField name="interviewTimeline" label={copy.interviewTimeline} options={copy.timelineOptions} copy={copy} initial={participant?.interviewTimeline} />
        <SelectField name="primaryGoal" label={copy.primaryGoal} options={copy.goalOptions} copy={copy} initial={participant?.primaryGoal} />
      </div>
      <label className="beta-check"><input type="checkbox" name="termsAccepted" required /> <span>{copy.acknowledgement} <a href={termsHref}>Terms</a> · <a href={privacyHref}>Privacy</a></span></label>
      <label className="beta-check"><input type="checkbox" name="researchConsent" defaultChecked={participant?.researchConsent} /> <span>{copy.researchConsent}</span></label>
      <label className="beta-check"><input type="checkbox" name="productUpdatesConsent" defaultChecked={participant?.productUpdatesConsent} /> <span>{copy.updatesConsent}</span></label>
      <button className="button primary" type="submit" disabled={submitting}>{submitting ? copy.saving : copy.submit}</button>
      {error && <p className="form-status error" role="alert">{error}</p>}
    </form>
  );
}

function SelectField({ name, label, options, copy, initial }: { name: string; label: string; options: readonly (readonly [string, string])[]; copy: BetaCopy; initial?: string }) {
  return (
    <label>
      <span>{label}</span>
      <select name={name} required defaultValue={initial || ""}>
        <option value="" disabled>{copy.choose}</option>
        {options.map(([value, text]) => <option value={value} key={value}>{text}</option>)}
      </select>
    </label>
  );
}

function optionLabel(options: readonly (readonly [string, string])[], value: string) {
  return options.find(([key]) => key === value)?.[1] || value;
}
