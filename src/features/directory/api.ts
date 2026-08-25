import { api } from "@/lib/api-client";
import type { Doctor, DoctorDetail, Hospital, HospitalDetail, HospitalType, Tier } from "./types";

export const directoryApi = {
  searchDoctors: (params: { q?: string; specialty?: string; tier?: Tier; cursor?: string | null }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.specialty) qs.set("specialty", params.specialty);
    if (params.tier) qs.set("tier", params.tier);
    if (params.cursor) qs.set("cursor", params.cursor);
    const query = qs.toString();
    return api.getPaginated<Doctor>(`/doctors${query ? `?${query}` : ""}`, { auth: false });
  },

  getDoctor: (id: string) => api.get<DoctorDetail>(`/doctors/${id}`, { auth: false }),

  searchHospitals: (params: { q?: string; type?: HospitalType; cursor?: string | null }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.type) qs.set("type", params.type);
    if (params.cursor) qs.set("cursor", params.cursor);
    const query = qs.toString();
    return api.getPaginated<Hospital>(`/hospitals${query ? `?${query}` : ""}`, { auth: false });
  },

  getHospital: (id: string) => api.get<HospitalDetail>(`/hospitals/${id}`, { auth: false }),
};
