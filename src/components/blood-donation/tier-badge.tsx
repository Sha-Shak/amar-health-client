import { donorTier } from "@/features/blood-donation/types";
import { Award, Crown, Droplet, Sprout } from "lucide-react";

const ICONS = { sprout: Sprout, droplet: Droplet, award: Award, crown: Crown };

export function TierBadge({ totalDonations, className }: { totalDonations: number; className?: string }) {
  const tier = donorTier(totalDonations);
  const Icon = ICONS[tier.icon];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-coral-50 px-3 py-1 text-sm font-semibold text-coral-700 ${className ?? ""}`}>
      <Icon size={14} aria-hidden="true" />
      {tier.label}
    </span>
  );
}
