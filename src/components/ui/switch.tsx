"use client";

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-primary-600" : "bg-black/15"
      }`}
    >
      {/* Expands the tappable area to the usual 44px touch target without
          affecting the track's own visual size — putting `.tap-target`'s
          min-height directly on the track itself (h-7 = 28px) stretched it to
          44px and turned the pill into a near-square blob instead. */}
      <span className="absolute -inset-2" aria-hidden="true" />
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
