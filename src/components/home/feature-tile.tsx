import { PhotoSlot } from "@/components/ui/photo-slot";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function FeatureTile({
  href,
  label,
  icon: Icon,
  photo,
  gradient = "from-primary-700 to-ink-900",
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  photo?: string;
  gradient?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block h-32 overflow-hidden rounded-[var(--radius-card)] transition-transform duration-100 active:scale-[0.97]"
    >
      <PhotoSlot alt="" src={photo} gradient={gradient} />
      <div className="glass-on-photo absolute inset-0 flex flex-col items-start rounded-[var(--radius-card)] p-3.5">
        {/* The icon is the hero here, not the label — it owns most of the
            tile's vertical space and is the thing your eye lands on first. */}
        <Icon size={44} strokeWidth={1.6} className="mb-auto" aria-hidden="true" />
        <span className="text-lg font-semibold leading-tight tracking-tight">{label}</span>
      </div>
    </Link>
  );
}
