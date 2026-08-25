export type { Reminder, ReminderStatus, MedicineReminder, HabitReminder, AppointmentReminder } from "@/features/reminders/types";

export type VaultSummary = {
  prescriptionCount: number;
  reportCount: number;
  billCount: number;
};

export type VaultDocument = {
  _id: string;
  type: "prescription" | "report" | "bill";
  fileUrl?: string;
  tag?: string;
  doctorName?: string;
  documentDate?: string;
  createdAt: string;
};
