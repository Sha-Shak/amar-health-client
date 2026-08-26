export const FLOW_LEVELS = ["spotting", "light", "medium", "heavy"] as const;
export type FlowLevel = (typeof FLOW_LEVELS)[number];

export const SYMPTOMS = [
  "Cramps",
  "Headache",
  "Bloating",
  "Fatigue",
  "Backache",
  "Acne",
  "Nausea",
  "Tender breasts",
  "Cravings",
] as const;

export const MOODS = ["Happy", "Calm", "Sensitive", "Sad", "Irritable", "Anxious"] as const;

export type CyclePhase = "period" | "fertile" | "ovulation" | "luteal" | "follicular";

export type CycleLog = {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  isPeriodDay: boolean;
  flow?: FlowLevel;
  symptoms?: string[];
  mood?: string;
  notes?: string;
};

export type CycleSettings = {
  avgCycleLength: number;
  avgPeriodLength: number;
};

export type CycleSummary = {
  avgCycleLength: number;
  avgPeriodLength: number;
  lastPeriodStart: string | null;
  currentCycleDay: number | null;
  predictedNextPeriodStart: string | null;
  predictedPeriodEnd: string | null;
  ovulationDate: string | null;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
  daysUntilNextPeriod: number | null;
  phase: CyclePhase | null;
  cyclesLogged: number;
};

export function phaseLabel(phase: CyclePhase | null): string {
  switch (phase) {
    case "period":
      return "On your period";
    case "fertile":
      return "Fertile window";
    case "ovulation":
      return "Ovulation day";
    case "luteal":
      return "Luteal phase";
    case "follicular":
      return "Follicular phase";
    default:
      return "Not enough data yet";
  }
}
