import { api } from "@/lib/api-client";
import type { HealthInsights, HealthLog, HealthTrackerSettings } from "./types";

export const healthTrackerApi = {
  getSettings: () => api.get<HealthTrackerSettings>("/health-tracker/settings"),

  updateSettings: (patch: Partial<HealthTrackerSettings>) =>
    api.patch<HealthTrackerSettings>("/health-tracker/settings", patch),

  getInsights: () => api.get<HealthInsights>("/health-tracker/insights"),

  listLogs: (from: string, to: string) =>
    api.get<HealthLog[]>(`/health-tracker/logs?from=${from}&to=${to}`),

  upsertLog: (date: string, patch: Partial<Omit<HealthLog, "_id" | "userId" | "date">>) =>
    api.patch<HealthLog>(`/health-tracker/logs/${date}`, patch),

  deleteLog: (date: string) => api.delete<{ message: string }>(`/health-tracker/logs/${date}`),
};
