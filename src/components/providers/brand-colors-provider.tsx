"use client";

import { generateAccentScale, generatePrimaryScale, isValidHex } from "@/lib/color-scale";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const DEFAULT_BRAND_COLORS = {
  primary: "#14b8a6",
  coral: "#ff6b5b",
  rose: "#f4436e",
} as const;

export type BrandColorRole = keyof typeof DEFAULT_BRAND_COLORS;

const STORAGE_KEY = "hv-brand-colors";

type BrandColors = Record<BrandColorRole, string>;

type BrandColorsContextValue = {
  colors: BrandColors;
  setColor: (role: BrandColorRole, hex: string) => void;
  reset: () => void;
};

const BrandColorsContext = createContext<BrandColorsContextValue | null>(null);

function readStored(): BrandColors {
  if (typeof window === "undefined") return { ...DEFAULT_BRAND_COLORS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_BRAND_COLORS };
    const parsed = JSON.parse(raw);
    return {
      primary: isValidHex(parsed.primary) ? parsed.primary : DEFAULT_BRAND_COLORS.primary,
      coral: isValidHex(parsed.coral) ? parsed.coral : DEFAULT_BRAND_COLORS.coral,
      rose: isValidHex(parsed.rose) ? parsed.rose : DEFAULT_BRAND_COLORS.rose,
    };
  } catch {
    return { ...DEFAULT_BRAND_COLORS };
  }
}

function applyToDocument(colors: BrandColors) {
  const root = document.documentElement;
  const primaryScale = generatePrimaryScale(colors.primary);
  const coralScale = generateAccentScale(colors.coral);
  const roseScale = generateAccentScale(colors.rose);

  for (const [shade, hex] of Object.entries(primaryScale)) {
    root.style.setProperty(`--color-primary-${shade}`, hex);
  }
  for (const [shade, hex] of Object.entries(coralScale)) {
    root.style.setProperty(`--color-coral-${shade}`, hex);
  }
  for (const [shade, hex] of Object.entries(roseScale)) {
    root.style.setProperty(`--color-rose-${shade}`, hex);
  }
}

function clearOverrides() {
  const root = document.documentElement;
  for (const shade of ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"]) {
    root.style.removeProperty(`--color-primary-${shade}`);
  }
  for (const shade of ["50", "100", "400", "500", "600"]) {
    root.style.removeProperty(`--color-coral-${shade}`);
    root.style.removeProperty(`--color-rose-${shade}`);
  }
}

// Applies user-picked brand colors as inline CSS custom property overrides on
// <html>, which win over the plain :root definitions in tokens.css without
// needing to touch that file at runtime. Colors persist in localStorage —
// there is deliberately no server sync, this is a per-device preference.
export function BrandColorsProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<BrandColors>(() => ({ ...DEFAULT_BRAND_COLORS }));

  useEffect(() => {
    const stored = readStored();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColors(stored);
    const isDefault =
      stored.primary === DEFAULT_BRAND_COLORS.primary &&
      stored.coral === DEFAULT_BRAND_COLORS.coral &&
      stored.rose === DEFAULT_BRAND_COLORS.rose;
    if (!isDefault) applyToDocument(stored);
  }, []);

  const setColor = useCallback((role: BrandColorRole, hex: string) => {
    if (!isValidHex(hex)) return;
    setColors((prev) => {
      const next = { ...prev, [role]: hex };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      applyToDocument(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    clearOverrides();
    setColors({ ...DEFAULT_BRAND_COLORS });
  }, []);

  return (
    <BrandColorsContext.Provider value={{ colors, setColor, reset }}>{children}</BrandColorsContext.Provider>
  );
}

export function useBrandColors() {
  const ctx = useContext(BrandColorsContext);
  if (!ctx) throw new Error("useBrandColors must be used within BrandColorsProvider");
  return ctx;
}
