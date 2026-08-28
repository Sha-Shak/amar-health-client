import { api } from "@/lib/api-client";
import type { PatientPrescription, PrescriptionListItem } from "./types";

export const prescriptionsApi = {
  list: (cursor?: string | null) => {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return api.getPaginated<PrescriptionListItem>(`/patient/prescriptions${qs}`);
  },

  get: (id: string) => api.get<PatientPrescription>(`/patient/prescriptions/${id}`),

  createReminders: (
    id: string,
    notificationTimes?: Partial<Record<"morning" | "afternoon" | "night", string>>,
  ) => api.post<unknown[]>(`/prescriptions/${id}/create-reminders`, { notificationTimes }),
};
