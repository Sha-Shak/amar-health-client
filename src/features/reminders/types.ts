export type ReminderStatus = "active" | "completed" | "snoozed" | "cancelled";
export type ReminderType = "medicine" | "habit" | "appointment";
export type Slot = "morning" | "afternoon" | "night";
export type MealTiming = "before_meal" | "after_meal" | "with_meal" | "none";
export type RepeatPattern = "daily" | "weekly" | "custom_days";

type ReminderBase = {
  _id: string;
  title: string;
  status: ReminderStatus;
  notifyBeforeMinutes: number;
  nextFireAt?: string;
  groupId?: string | null;
};

export type DoseSchedule = { morning: number; afternoon: number; night: number };
export type NotificationTimes = Partial<Record<Slot, string>>;

export type MedicineReminder = ReminderBase & {
  type: "medicine";
  dosage: string;
  doseSchedule: DoseSchedule;
  notificationTimes?: NotificationTimes;
  slot: Slot;
  mealTiming: MealTiming;
  durationDays?: number | "ongoing";
  startDate: string;
};

export type HabitReminder = ReminderBase & {
  type: "habit";
  time: string;
  repeatPattern: RepeatPattern;
  daysOfWeek?: string[];
};

export type AppointmentReminder = ReminderBase & {
  type: "appointment";
  dateTime: string;
  doctorId?: string;
  doctorName?: string;
  chamberId?: string;
  location?: string;
};

export type Reminder = MedicineReminder | HabitReminder | AppointmentReminder;

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const NOTIFY_BEFORE_OPTIONS = [5, 10, 15, 30, 60, 720, 1440] as const;

export function notifyBeforeLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min before`;
  if (minutes < 1440) return `${minutes / 60} hr before`;
  return `${minutes / 1440} day before`;
}
