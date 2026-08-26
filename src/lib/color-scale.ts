// Derives a full CSS-variable shade scale from a single picked hex — lets a
// user-chosen brand color drive every place that color is used (buttons,
// badges, borders) without needing them to pick ten individual shades.
// Ratios are eyeballed against this app's existing default palette (teal
// 50→900) rather than a formal color-science curve — good enough for a
// user-facing customizer, not meant to be perceptually perfect.

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("")}`;
}

function mix(hex: string, target: [number, number, number], ratio: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [tr, tg, tb] = target;
  return rgbToHex(r + (tr - r) * ratio, g + (tg - g) * ratio, b + (tb - b) * ratio);
}

const WHITE: [number, number, number] = [255, 255, 255];
const BLACK: [number, number, number] = [0, 0, 0];

export function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

// Full 10-stop scale, for the primary brand color.
export function generatePrimaryScale(base: string): Record<string, string> {
  return {
    "50": mix(base, WHITE, 0.94),
    "100": mix(base, WHITE, 0.85),
    "200": mix(base, WHITE, 0.68),
    "300": mix(base, WHITE, 0.42),
    "400": mix(base, WHITE, 0.15),
    "500": base,
    "600": mix(base, BLACK, 0.14),
    "700": mix(base, BLACK, 0.28),
    "800": mix(base, BLACK, 0.42),
    "900": mix(base, BLACK, 0.55),
  };
}

// Shorter scale — matches what coral/rose actually define in tokens.css.
export function generateAccentScale(base: string): Record<string, string> {
  return {
    "50": mix(base, WHITE, 0.94),
    "100": mix(base, WHITE, 0.85),
    "400": mix(base, WHITE, 0.15),
    "500": base,
    "600": mix(base, BLACK, 0.14),
  };
}
