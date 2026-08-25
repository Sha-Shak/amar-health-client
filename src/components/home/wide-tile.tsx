import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

// A distinct, full-width row style — used for features that don't belong in
// the 2-column photo-tile grid (an odd tile count there leaves a half-empty
// row, which reads as a layout bug rather than a deliberate feature).
export function WideTile({
  href,
  label,
  description,
  icon: Icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="glass-panel tap-target flex w-full items-center gap-3 p-4 transition-transform duration-100 active:scale-[0.98]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral-50 text-coral-600">
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{label}</span>
        <span className="block truncate text-sm text-ink-500">{description}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-ink-500" aria-hidden="true" />
    </Link>
  );
}
