import { cn } from "@/lib/cn";
import { PhotoSlot } from "@/components/ui/photo-slot";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function FeatureTile({
  href,
  label,
  icon: Icon,
  photo,
  gradient = "from-primary-700 to-ink-900",
  className,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  photo?: string;
  gradient?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block h-32 overflow-hidden rounded-[var(--radius-card)] transition-transform duration-100 active:scale-[0.97]",
        className,
      )}
    >
      {/* Actual rendered width is ~166px (2-col grid in a max-w-sm page) — the
          default "100vw" would ask for a viewport-width image for a tile a
          fraction of that size. */}
      <PhotoSlot alt="" src={photo} gradient={gradient} sizes="200px" />
      {/* A plain gradient, not backdrop-filter — iOS Safari is known to render
          backdrop-filter far too strongly (sometimes near-opaque) on an element
          with overflow-hidden + a transformed ancestor, which is exactly this
          tile's shape (rounded, clipped, scales on :active). A gradient scrim
          has no such risk and renders identically everywhere. Legibility on
          the icon/label comes from the drop-shadow below instead of a blur. */}
      <div className="photo-scrim absolute inset-0 rounded-[var(--radius-card)]" />
      <div
        className="absolute inset-0 flex flex-col items-start p-3.5 text-white"
        style={{ filter: "drop-shadow(0 1px 4px rgb(0 0 0 / 0.55))" }}
      >
        {/* The icon is the hero here, not the label — it owns most of the
            tile's vertical space and is the thing your eye lands on first. */}
        <Icon size={44} strokeWidth={1.6} className="mb-auto" aria-hidden="true" />
        <span className="text-lg font-semibold leading-tight tracking-tight">{label}</span>
      </div>
    </Link>
  );
}
