"use client";

import { specialtyLabel } from "@/features/directory/types";
import { directoryApi } from "@/features/directory/api";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

// Free-text by design: picking a suggestion sets doctorId (linking the record
// to the real Doctor entry), but typing a name that isn't in the directory and
// never selecting anything just leaves doctorId unset — the reminder/document
// still saves with doctorName alone (doctorId is optional/nullable on both for
// exactly this, Tier 1/unregistered doctors), and nothing gets written back to
// the Doctor collection.
export function DoctorAutocomplete({
  name,
  doctorId,
  onChange,
  label = "Doctor (optional)",
}: {
  name: string;
  doctorId?: string;
  onChange: (value: { name: string; doctorId?: string }) => void;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const debouncedName = useDebouncedValue(name, 300);

  const { data } = useQuery({
    queryKey: ["doctors", "autocomplete", debouncedName],
    queryFn: () => directoryApi.searchDoctors({ q: debouncedName }),
    enabled: debouncedName.trim().length > 0,
  });

  const suggestions = data?.items ?? [];
  const showDropdown = isOpen && debouncedName.trim().length > 0 && suggestions.length > 0;

  return (
    <div className="relative space-y-1.5">
      <label htmlFor="doctorName" className="text-sm font-medium text-ink-700">
        {label}
      </label>
      <input
        id="doctorName"
        name="doctorName"
        value={name}
        onChange={(e) => {
          onChange({ name: e.target.value, doctorId: undefined });
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder="Search by name…"
        autoComplete="off"
        className="w-full rounded-[var(--radius-sm)] border border-primary-400/30 bg-surface-70 px-4 py-3 text-ink-900 placeholder:text-ink-500 outline-none transition-shadow focus:border-primary-600/40 focus:ring-2 focus:ring-primary-600/30"
      />
      {doctorId && (
        <p className="text-xs text-primary-700">Linked to a doctor in our directory</p>
      )}

      {showDropdown && (
        <ul className="glass-panel-strong absolute inset-x-0 top-full z-10 mt-1.5 max-h-56 overflow-y-auto p-1.5">
          {suggestions.map((doctor) => (
            <li key={doctor._id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange({ name: doctor.name, doctorId: doctor._id });
                  setIsOpen(false);
                }}
                className="tap-target flex w-full flex-col items-start rounded-[var(--radius-sm)] px-3 py-2 text-left hover:bg-surface-60"
              >
                <span className="font-medium">{doctor.name}</span>
                {doctor.specialties.length > 0 && (
                  <span className="text-xs text-ink-500">
                    {doctor.specialties.map(specialtyLabel).join(", ")}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
