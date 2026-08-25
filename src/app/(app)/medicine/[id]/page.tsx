"use client";

import { medicinesApi } from "@/features/medicines/api";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function MedicineDetailPage() {
  const router = useRouter();
  const id = useParams<{ id: string }>().id;
  const [showClinical, setShowClinical] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["medicines", "detail", id],
    queryFn: () => medicinesApi.getMedicine(id),
  });

  if (isLoading || !data) {
    return <div className="flex flex-1 items-center justify-center text-ink-700">Loading…</div>;
  }

  const { medicine, generic } = data;
  const summary = generic?.patientSummary;
  const clinical = generic?.clinicalDetail;
  const clinicalEntries = clinical
    ? (Object.entries(clinical).filter(([, v]) => v) as [string, string][])
    : [];

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8 pb-8">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="tap-target -ml-2 mb-2 rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>

      <h1 className="text-2xl font-bold">
        {medicine.brandName}
        {medicine.strength ? ` ${medicine.strength}` : ""}
      </h1>
      <p className="mb-5 text-sm text-ink-500">
        {[medicine.genericName, medicine.manufacturerName, medicine.dosageFormName]
          .filter(Boolean)
          .join(" · ")}
      </p>

      {summary && (
        <div className="glass-panel mb-4 space-y-4 p-5">
          <LabelValue label="Indication" value={summary.indication} />
          <LabelValue label="Typical dosage" value={summary.dosage} />
          <LabelValue label="Side effects" value={summary.sideEffects} />
          <LabelValue label="Storage" value={summary.storageConditions} />
        </div>
      )}

      {!generic && data.genericDetailUnavailable && (
        <p className="text-sm text-ink-500">
          Detailed clinical information isn&apos;t available for this medicine yet.
        </p>
      )}

      {clinicalEntries.length > 0 && (
        <div className="glass-panel p-5">
          <button
            type="button"
            onClick={() => setShowClinical((v) => !v)}
            className="flex w-full items-center justify-between"
          >
            <span className="font-semibold">More clinical detail</span>
            <ChevronDown
              size={18}
              className={`text-ink-500 transition-transform ${showClinical ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          {showClinical && (
            <div className="mt-4 space-y-4">
              {clinicalEntries.map(([key, value]) => (
                <LabelValue key={key} label={clinicalFieldLabel(key)} value={value} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LabelValue({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-ink-500">{label}</p>
      <p className="text-sm text-ink-900">{value}</p>
    </div>
  );
}

function clinicalFieldLabel(key: string): string {
  const labels: Record<string, string> = {
    pharmacology: "Pharmacology",
    administration: "Administration",
    interaction: "Interactions",
    contraindications: "Contraindications",
    pregnancyAndLactation: "Pregnancy & Lactation",
    precautions: "Precautions",
    pediatricUsage: "Pediatric Usage",
    overdoseEffects: "Overdose Effects",
    durationOfTreatment: "Duration of Treatment",
    reconstitution: "Reconstitution",
  };
  return labels[key] ?? key;
}
