import type { DoseSchedule, MealTiming, PrescriptionMedicine } from "./types";

type Lang = "en" | "bn";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
function toBnDigits(s: string | number): string {
  return String(s).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}
function num(n: string | number, lang: Lang): string {
  return lang === "bn" ? toBnDigits(n) : String(n);
}

const SLOT_LABEL: Record<keyof DoseSchedule, Record<Lang, string>> = {
  morning: { en: "morning", bn: "সকাল" },
  afternoon: { en: "noon", bn: "দুপুর" },
  night: { en: "night", bn: "রাত" },
};

const MEAL_LABEL: Record<MealTiming, Record<Lang, string>> = {
  before_meal: { en: "before food", bn: "খাবারের আগে" },
  after_meal: { en: "after food", bn: "খাবারের পরে" },
  with_meal: { en: "with food", bn: "খাবারের সাথে" },
  none: { en: "", bn: "" },
};

const AND: Record<Lang, string> = { en: " and ", bn: " ও " };

function slotsPhrase(dose: DoseSchedule, lang: Lang): string {
  const parts = (Object.keys(SLOT_LABEL) as (keyof DoseSchedule)[])
    .filter((k) => (dose?.[k] ?? 0) > 0)
    .map((k) => {
      const count = dose[k];
      const label = SLOT_LABEL[k][lang];
      return count > 1 ? `${num(count, lang)}× ${label}` : label;
    });
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")}${AND[lang]}${parts[parts.length - 1]}`;
}

function durationPhrase(d: PrescriptionMedicine["durationDays"], lang: Lang): string {
  if (d == null || d === "") return "";
  if (typeof d === "number") {
    return lang === "bn" ? `${num(d, lang)} দিন` : `for ${d} day${d === 1 ? "" : "s"}`;
  }
  if (/^ongoing$/i.test(d)) return lang === "bn" ? "চলমান" : "ongoing";
  return lang === "bn" ? toBnDigits(d) : d;
}

/**
 * Plain-language instruction a patient can act on, in their language.
 * e.g. "1 tablet — morning and night, after food, for 5 days"
 *      "১টি ট্যাবলেট — সকাল ও রাত, খাবারের পরে, ৫ দিন"
 */
export function plainSig(m: PrescriptionMedicine, lang: Lang = "en"): string {
  const dosage = lang === "bn" ? toBnDigits(m.dosage) : m.dosage;
  const bits = [
    slotsPhrase(m.doseSchedule, lang),
    MEAL_LABEL[m.mealTiming]?.[lang],
    durationPhrase(m.durationDays, lang),
  ].filter(Boolean);
  return bits.length ? `${dosage} — ${bits.join(", ")}` : dosage;
}

/** "1 + 0 + 1" pattern, digits localised. */
export function dosePattern(dose: DoseSchedule, lang: Lang = "en"): string {
  return `${num(dose?.morning ?? 0, lang)} + ${num(dose?.afternoon ?? 0, lang)} + ${num(dose?.night ?? 0, lang)}`;
}

export function medDisplayName(m: PrescriptionMedicine): { name: string; generic?: string; strength?: string } {
  if (m.medicineId && typeof m.medicineId === "object") {
    return { name: m.medicineId.brandName, generic: m.medicineId.genericName, strength: m.medicineId.strength };
  }
  return { name: m.freeTextName ?? "Medicine" };
}
