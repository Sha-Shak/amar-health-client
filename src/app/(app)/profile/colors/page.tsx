"use client";

import { DEFAULT_BRAND_COLORS, useBrandColors, type BrandColorRole } from "@/components/providers/brand-colors-provider";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

const ROLES: { role: BrandColorRole; label: string; description: string }[] = [
  { role: "primary", label: "Primary", description: "Buttons, links, the app's main teal identity" },
  { role: "coral", label: "Blood Donation", description: "Accents on the Blood Donation feature" },
  { role: "rose", label: "Cycle Tracker", description: "Accents on the Cycle Tracker feature" },
];

export default function BrandColorsPage() {
  const router = useRouter();
  const { colors, setColor, reset } = useBrandColors();

  const isDefault =
    colors.primary === DEFAULT_BRAND_COLORS.primary &&
    colors.coral === DEFAULT_BRAND_COLORS.coral &&
    colors.rose === DEFAULT_BRAND_COLORS.rose;

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-6">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="tap-target -ml-2 rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        {!isDefault && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 text-sm font-medium text-ink-700"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Reset to default
          </button>
        )}
      </div>
      <h1 className="mb-1 text-2xl font-bold">App colors</h1>
      <p className="mb-6 text-ink-700">
        Pick a color for each part of the app — every shade used in buttons, badges, and cards is
        generated from it automatically. Saved on this device only.
      </p>

      <div className="glass-panel divide-y divide-black/5 p-2">
        {ROLES.map(({ role, label, description }) => (
          <label
            key={role}
            className="flex cursor-pointer items-center gap-3 px-3 py-3.5"
          >
            <span
              className="h-9 w-9 shrink-0 rounded-full border border-black/10"
              style={{ backgroundColor: colors[role] }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-ink-900">{label}</span>
              <span className="block truncate text-sm text-ink-500">{description}</span>
            </span>
            <span className="text-sm font-medium uppercase text-ink-500">{colors[role]}</span>
            <input
              type="color"
              value={colors[role]}
              onChange={(e) => setColor(role, e.target.value)}
              className="sr-only"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
