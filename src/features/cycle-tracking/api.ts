import { api } from "@/lib/api-client";
import type { CycleLog, CycleSettings, CycleSummary } from "./types";

export const cycleTrackingApi = {
  getSummary: () => api.get<CycleSummary>("/cycle-tracking/summary"),

  getSettings: () => api.get<CycleSettings>("/cycle-tracking/settings"),

  updateSettings: (patch: Partial<CycleSettings>) =>
    api.patch<CycleSettings>("/cycle-tracking/settings", patch),

  listLogs: (from: string, to: string) =>
    api.get<CycleLog[]>(`/cycle-tracking/logs?from=${from}&to=${to}`),

  upsertLog: (date: string, patch: Partial<Omit<CycleLog, "_id" | "userId" | "date">>) =>
    api.patch<CycleLog>(`/cycle-tracking/logs/${date}`, patch),

  deleteLog: (date: string) => api.delete<{ message: string }>(`/cycle-tracking/logs/${date}`),
};
