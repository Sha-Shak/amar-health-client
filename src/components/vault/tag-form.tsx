"use client";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import type { DocumentType } from "@/features/vault/types";
import { useState } from "react";

const TYPES: { value: DocumentType; label: string }[] = [
  { value: "prescription", label: "Prescription" },
  { value: "report", label: "Lab Report" },
  { value: "bill", label: "Bill" },
];

export type TagFormValues = {
  type: DocumentType;
  tag: string;
  doctorName: string;
  placeOfTest: string;
  note: string;
  documentDate: string;
};

export function TagForm({
  thumbnailUrl,
  initialType = "prescription",
  isSaving,
  error,
  onSubmit,
}: {
  thumbnailUrl: string;
  initialType?: DocumentType;
  isSaving: boolean;
  error?: string;
  onSubmit: (values: TagFormValues) => void;
}) {
  const [type, setType] = useState<DocumentType>(initialType);
  const [tag, setTag] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [placeOfTest, setPlaceOfTest] = useState("");
  const [note, setNote] = useState("");
  const [documentDate, setDocumentDate] = useState(() => new Date().toISOString().slice(0, 10));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ type, tag, doctorName, placeOfTest, note, documentDate });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm space-y-5 px-5 py-6">
      <div className="mx-auto h-32 w-24 overflow-hidden rounded-[var(--radius-sm)] bg-ink-900 shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbnailUrl} alt="Document preview" className="h-full w-full object-cover" />
      </div>

      <div className="glass-panel space-y-5 p-5">
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`flex-1 rounded-[var(--radius-pill)] px-3 py-2 text-sm font-semibold transition-colors ${
                type === t.value ? "bg-primary-600 text-white" : "bg-white/60 text-ink-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <TextField
          label="Label"
          name="tag"
          placeholder={type === "report" ? "e.g. Blood Test" : type === "bill" ? "e.g. Pharmacy" : "e.g. Diabetes follow-up"}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />

        {type !== "bill" && (
          <TextField
            label="Doctor name"
            name="doctorName"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
          />
        )}

        {type !== "prescription" && (
          <TextField
            label={type === "report" ? "Place of test" : "Place"}
            name="placeOfTest"
            value={placeOfTest}
            onChange={(e) => setPlaceOfTest(e.target.value)}
          />
        )}

        <TextField
          label="Date"
          name="documentDate"
          type="date"
          value={documentDate}
          onChange={(e) => setDocumentDate(e.target.value)}
        />

        <TextField
          label="Note (optional)"
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {error && <p className="text-sm text-coral-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save to Vault"}
        </Button>
      </div>
    </form>
  );
}
