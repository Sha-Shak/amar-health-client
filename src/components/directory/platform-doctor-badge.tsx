import { Crown } from "lucide-react";

// tier2 doctors have a real Amar Health account and are the only ones
// bookable — this golden badge is what sets them apart from the
// bulk-imported/scraped (tier1) directory listings everywhere they appear.
export function PlatformDoctorBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-pill)] bg-gradient-to-r from-amber-400 to-amber-600 px-2 py-0.5 text-[11px] font-semibold text-amber-950 ${className ?? ""}`}
    >
      <Crown size={11} aria-hidden="true" />
      Platform Doctor
    </span>
  );
}
