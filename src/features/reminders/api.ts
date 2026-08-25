import { api } from "@/lib/api-client";
import type { Reminder, ReminderStatus, ReminderType } from "./types";

export type CreateReminderInput =
  | {
      type: "medicine";
      title: string;
      notifyBeforeMinutes?: number;
      dosage: string;
      doseSchedule: { morning: number; afternoon: number; night: number };
      notificationTimes?: Partial<Record<"morning" | "afternoon" | "night", string>>;
      mealTiming: "before_meal" | "after_meal" | "with_meal" | "none";
      durationDays?: number | "ongoing";
      startDate: string;
    }
  | {
      type: "habit";
      title: string;
      notifyBeforeMinutes?: number;
      repeatPattern: "daily" | "weekly" | "custom_days";
      daysOfWeek?: string[];
      time: string;
    }
  | {
      type: "appointment";
      title: string;
      notifyBeforeMinutes?: number;
      doctorId?: string;
      doctorName?: string;
      dateTime: string;
      location?: string;
    };

export const remindersApi = {
  list: (params: { range?: "today" | "upcoming"; type?: ReminderType; status?: ReminderStatus; cursor?: string | null }) => {
    const qs = new URLSearchParams();
    if (params.range) qs.set("range", params.range);
    if (params.type) qs.set("type", params.type);
    if (params.status) qs.set("status", params.status);
    if (params.cursor) qs.set("cursor", params.cursor);
    return api.getPaginated<Reminder>(`/reminders?${qs.toString()}`);
  },

  create: (input: CreateReminderInput) => api.post<Reminder[]>("/reminders", input),

  get: (id: string) => api.get<Reminder>(`/reminders/${id}`),

  update: (id: string, patch: Record<string, unknown>) => api.patch<Reminder>(`/reminders/${id}`, patch),

  cancel: (id: string) => api.delete<Reminder>(`/reminders/${id}`),

  markTaken: (id: string) => api.post<Reminder>(`/reminders/${id}/mark-taken`),

  snooze: (id: string, minutes: number) => api.post<Reminder>(`/reminders/${id}/snooze`, { minutes }),
};
