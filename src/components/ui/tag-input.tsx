"use client";

import { X } from "lucide-react";
import { useState } from "react";

export function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-ink-700">{label}</label>
      <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-sm)] border border-black/5 bg-white/70 px-3 py-2 focus-within:border-primary-600/40 focus-within:ring-2 focus-within:ring-primary-600/30">
        {values.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(values.filter((v) => v !== tag))}
              aria-label={`Remove ${tag}`}
              className="rounded-full"
            >
              <X size={13} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={values.length === 0 ? placeholder : undefined}
          className="min-w-[8ch] flex-1 bg-transparent py-1 outline-none placeholder:text-ink-500"
        />
      </div>
    </div>
  );
}
