"use client";

import { Search, X } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="glass-panel flex items-center gap-2 px-4 py-3">
      <Search size={18} className="shrink-0 text-ink-500" aria-hidden="true" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent outline-none placeholder:text-ink-500"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="tap-target shrink-0 rounded-full text-ink-500"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
