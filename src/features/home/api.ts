import { api } from "@/lib/api-client";
import type { Reminder, VaultDocument, VaultSummary } from "./types";

export const homeApi = {
  getTodayReminders: () => api.get<Reminder[]>("/reminders?range=today"),

  getVaultSummary: () => api.get<VaultSummary>("/vault/summary"),

  getRecentDocuments: () => api.get<VaultDocument[]>("/vault/documents"),

  markReminderTaken: (id: string) =>
    api.post<Reminder>(`/reminders/${id}/mark-taken`),
};
