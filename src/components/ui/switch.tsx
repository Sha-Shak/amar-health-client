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
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200 ${
        checked
          ? "border-primary-600 bg-primary-600"
          : "border-ink-500/25 bg-ink-500/15"
      }`}
    >
      {/* Expands the tappable area to the usual 44px touch target without
          affecting the track's own visual size — putting `.tap-target`'s
          min-height directly on the track itself (h-7 = 28px) stretched it to
          44px and turned the pill into a near-square blob instead. */}
      <span className="absolute -inset-2" aria-hidden="true" />
      {/* `left-0` is the base the translate-x values below are measured from —
          without it, the thumb has no defined static position for an
          absolutely-positioned element with no horizontal offset set, so the
          translate landed at an arbitrary spot instead of sliding cleanly
          between the track's two ends. */}
      <span
        className={`absolute left-0 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
