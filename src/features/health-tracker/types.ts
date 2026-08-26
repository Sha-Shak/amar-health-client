export const METRIC_TYPES = [
  "weight",
  "blood_pressure",
  "blood_glucose",
  "heart_rate",
  "mood",
  "stress",
  "sleep",
  "water",
  "exercise",
  "screen_time",
] as const;
export type MetricType = (typeof METRIC_TYPES)[number];

export const METRIC_META: Record<MetricType, { label: string; unit: string; description: string }> = {
  weight: { label: "Weight", unit: "kg", description: "Body weight" },
  blood_pressure: { label: "Blood pressure", unit: "mmHg", description: "Systolic / diastolic" },
  blood_glucose: { label: "Blood glucose", unit: "mg/dL", description: "For diabetes tracking" },
  heart_rate: { label: "Heart rate", unit: "bpm", description: "Resting heart rate" },
  mood: { label: "Mood", unit: "", description: "How you're feeling" },
  stress: { label: "Stress", unit: "", description: "Stress level" },
  sleep: { label: "Sleep", unit: "hrs", description: "Hours slept" },
  water: { label: "Water", unit: "L", description: "Water intake" },
  exercise: { label: "Exercise", unit: "min", description: "Minutes of activity" },
  screen_time: { label: "Screen time", unit: "hrs", description: "Total time on your phone/computer" },
};

export const FREQUENCIES = ["daily", "weekly", "monthly"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export type HealthLog = {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weightKg?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodGlucose?: number;
  heartRate?: number;
  mood?: number; // 1-5
  stress?: number; // 1-5
  sleepHours?: number;
  waterLiters?: number;
  exerciseMinutes?: number;
  screenTimeHours?: number;
  notes?: string;
};

export type HealthTrackerSettings = {
  frequency: Frequency;
  enabledMetrics: MetricType[];
};

export type TrendPoint = { date: string; value: number };
export type BloodPressurePoint = { date: string; systolic: number; diastolic: number };

export type ScoreComponent = { key: string; label: string; score: number };
export type HealthScore = { value: number | null; label: string | null; breakdown: ScoreComponent[] };

export type HealthInsights = {
  trends: Record<string, TrendPoint[]>;
  bloodPressure: BloodPressurePoint[];
  moodCounts: number[]; // index 0 = mood level 1 ... index 4 = mood level 5
  healthScore: HealthScore;
  heightCm: number | null;
  latestDate: string | null;
  totalLogged: number;
  loggedDates: string[];
};

export const MOOD_EMOJIS = ["😞", "🙁", "😐", "🙂", "😄"] as const;
export const STRESS_EMOJIS = ["😌", "🙂", "😐", "😖", "🤯"] as const;

export function nextDueDate(lastLoggedDate: string | null, frequency: Frequency): Date | null {
  if (!lastLoggedDate) return null;
  const last = new Date(`${lastLoggedDate}T00:00:00`);
  const next = new Date(last);
  if (frequency === "daily") next.setDate(next.getDate() + 1);
  else if (frequency === "weekly") next.setDate(next.getDate() + 7);
  else next.setMonth(next.getMonth() + 1);
  return next;
}
