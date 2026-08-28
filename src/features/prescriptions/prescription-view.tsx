"use client";

import { format } from "date-fns";
import { BellRing, ExternalLink, FileText, Printer, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { dosePattern, medDisplayName, plainSig } from "./sig";
import type { PatientPrescription } from "./types";

const MEAL_EN: Record<string, string> = {
  before_meal: "before food",
  after_meal: "after food",
  with_meal: "with food",
  none: "any time",
};

function refText(ref: unknown, key = "name"): string | undefined {
  return ref && typeof ref === "object" && key in ref
    ? String((ref as Record<string, unknown>)[key])
    : undefined;
}

export function PrescriptionView({
  p,
  lang = "en",
}: {
  p: PatientPrescription;
  lang?: "en" | "bn";
}) {
  const [showPdf, setShowPdf] = useState(false);
  const meds = p.medicines ?? [];
  const hasSlotMeds = meds.some(
    (m) => (m.doseSchedule?.morning ?? 0) + (m.doseSchedule?.afternoon ?? 0) + (m.doseSchedule?.night ?? 0) > 0,
  );

  const symptoms = (p.symptoms?.items ?? [])
    .map((i) => refText(i.symptomId) ?? i.freeText)
    .filter(Boolean) as string[];
  const findings = (p.examinationFindings?.items ?? [])
    .map((i) => refText(i.findingId) ?? i.freeText)
    .filter(Boolean) as string[];
  const tests = (p.testsRecommended ?? []).map((t) => ({
    name: refText(t.testId, "test_name") ?? t.freeTextName ?? "Test",
    notes: t.notes,
  }));
  const d = p.doctorId;
  const issued = p.finalizedAt ?? p.createdAt;
  const followUp =
    p.followUp?.relativeDescription ||
    (p.followUp?.date ? format(new Date(p.followUp.date), "d MMM yyyy") : undefined);

  return (
    <div className="rx-paper space-y-4 rounded-2xl p-3">
      {/* doctor header */}
      <div className="glass-panel space-y-1 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <Stethoscope size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-ink-900">{d?.name}</p>
            <p className="truncate text-xs text-ink-500">
              {[d?.degrees?.join(", "), d?.specialties?.join(", ")].filter(Boolean).join(" · ")}
              {d?.registrationNumber ? ` · BM&DC ${d.registrationNumber}` : ""}
            </p>
          </div>
        </div>
        {p.chamberSnapshot?.name && (
          <p className="text-xs text-ink-500">
            {[p.chamberSnapshot.name, p.chamberSnapshot.hospitalName, p.chamberSnapshot.address]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        <p className="text-xs text-ink-500">Issued {format(new Date(issued), "d MMM yyyy")}</p>
        <p className="pt-1 text-[11px] font-medium uppercase tracking-wide text-primary-700">
          Electronically generated prescription
        </p>
      </div>

      {(symptoms.length > 0 || findings.length > 0 || p.diagnosis) && (
        <div className="glass-panel space-y-2 p-4 text-sm">
          {symptoms.length > 0 && (
            <p>
              <span className="text-ink-500">Complaints: </span>
              {symptoms.join(", ")}
            </p>
          )}
          {findings.length > 0 && (
            <p>
              <span className="text-ink-500">On examination: </span>
              {findings.join(", ")}
            </p>
          )}
          {p.diagnosis && (
            <p>
              <span className="text-ink-500">Diagnosis: </span>
              <span className="font-medium text-ink-900">{p.diagnosis}</span>
            </p>
          )}
        </div>
      )}

      {/* medicines */}
      {meds.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">Medicines</h2>
            {hasSlotMeds && (
              <Link
                href="/reminders"
                className="flex items-center gap-1 text-xs font-medium text-primary-700"
              >
                <BellRing size={13} aria-hidden="true" /> In your reminders
              </Link>
            )}
          </div>

          <ul className="space-y-2">
            {meds.map((m, i) => {
              const info = medDisplayName(m);
              return (
                <li key={i} className="glass-panel space-y-1 p-3">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold text-ink-900">
                      {i + 1}. {info.name}
                    </span>
                    {info.strength && <span className="text-xs text-ink-500">{info.strength}</span>}
                    {info.generic && <span className="text-xs text-ink-500">· {info.generic}</span>}
                  </div>
                  <p className="text-sm text-ink-800">{plainSig(m, lang)}</p>
                  {lang === "bn" && (
                    <p className="text-xs text-ink-500">{plainSig(m, "en")}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-0.5 text-[11px] text-ink-500">
                    <span className="rounded-full bg-surface-60 px-2 py-0.5 font-mono">
                      {dosePattern(m.doseSchedule, lang)}
                    </span>
                    <span className="rounded-full bg-surface-60 px-2 py-0.5">
                      {MEAL_EN[m.mealTiming] ?? m.mealTiming}
                    </span>
                    {m.quantity ? (
                      <span className="rounded-full bg-surface-60 px-2 py-0.5">Qty {m.quantity}</span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
          {p.medicinesNotes && (
            <p className="glass-panel p-3 text-xs text-ink-700">{p.medicinesNotes}</p>
          )}
        </div>
      )}

      {tests.length > 0 && (
        <div className="glass-panel space-y-1 p-4 text-sm">
          <h2 className="text-sm font-semibold text-ink-900">Tests advised</h2>
          <ul className="list-disc pl-5 text-ink-800">
            {tests.map((t, i) => (
              <li key={i}>
                {t.name}
                {t.notes ? <span className="text-ink-500"> ({t.notes})</span> : null}
              </li>
            ))}
          </ul>
          {p.testsNotes && <p className="text-xs text-ink-500">{p.testsNotes}</p>}
        </div>
      )}

      {(followUp || p.followUp?.instructions || p.additionalNotes) && (
        <div className="glass-panel space-y-1 p-4 text-sm">
          {followUp && (
            <p>
              <span className="text-ink-500">Follow-up: </span>
              {followUp}
              {p.followUp?.instructions ? ` — ${p.followUp.instructions}` : ""}
            </p>
          )}
          {p.additionalNotes && (
            <p>
              <span className="text-ink-500">Advice: </span>
              {p.additionalNotes}
            </p>
          )}
        </div>
      )}

      {p.pdfUrl && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPdf((v) => !v)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-600 py-3 text-sm font-semibold text-white"
            >
              <Printer size={16} aria-hidden="true" />
              {showPdf ? "Hide print version" : "Print version"}
            </button>
            <a
              href={p.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open print version in a new tab"
              className="flex items-center justify-center rounded-full border border-primary-400/40 px-4 text-primary-700"
            >
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          </div>
          {showPdf && (
            <div className="overflow-hidden rounded-[var(--radius-md)] border border-primary-400/20 bg-white">
              <iframe
                src={`${p.pdfUrl}#toolbar=0&navpanes=0`}
                title="Prescription — print version"
                className="h-[70vh] w-full"
              />
              <p className="px-3 py-2 text-center text-[11px] text-ink-500">
                Not showing?{" "}
                <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-700 underline">
                  Open it in a new tab
                </a>
                .
              </p>
            </div>
          )}
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-400">
        <FileText size={12} aria-hidden="true" />
        A finalized prescription can&apos;t be changed. A correction is a new prescription.
      </p>
    </div>
  );
}
