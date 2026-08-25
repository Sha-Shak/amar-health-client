import { api } from "@/lib/api-client";
import type { Generic, Medicine, MedicineAutocompleteItem, MedicineDetail } from "./types";

export type MedicineSortBy = "brandName" | "genericName" | "manufacturerName";

export const medicinesApi = {
  search: (params: {
    q?: string;
    genericId?: string;
    sortBy?: MedicineSortBy;
    sortOrder?: "asc" | "desc";
    cursor?: string | null;
  }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.genericId) qs.set("genericId", params.genericId);
    if (params.sortBy) qs.set("sortBy", params.sortBy);
    if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
    if (params.cursor) qs.set("cursor", params.cursor);
    const query = qs.toString();
    return api.getPaginated<Medicine>(`/medicines/search${query ? `?${query}` : ""}`, { auth: false });
  },

  autocomplete: (q: string) =>
    api.get<MedicineAutocompleteItem[]>(`/medicines/autocomplete?q=${encodeURIComponent(q)}`, {
      auth: false,
    }),

  getMedicine: (id: string) => api.get<MedicineDetail>(`/medicines/${id}`, { auth: false }),

  listGenerics: (q?: string) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    const query = qs.toString();
    return api.getPaginated<Generic>(`/generics${query ? `?${query}` : ""}`, { auth: false });
  },
};
