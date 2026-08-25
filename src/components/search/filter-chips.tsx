"use client";

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  allLabel,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  allLabel?: string;
}) {
  return (
    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: "none" }}>
      {allLabel && (
        <Chip label={allLabel} active={value === null} onClick={() => onChange(null)} />
      )}
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          active={value === opt.value}
          onClick={() => onChange(opt.value)}
        />
      ))}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tap-target shrink-0 whitespace-nowrap rounded-[var(--radius-pill)] px-4 text-sm font-medium transition-colors ${
        active ? "bg-primary-600 text-white" : "glass-panel text-ink-700"
      }`}
    >
      {label}
    </button>
  );
}
