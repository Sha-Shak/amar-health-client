import { api } from "@/lib/api-client";
import type { DiagnosticTest, TestAutocompleteItem } from "./types";

export const testsApi = {
  search: (params: { q?: string; category?: string; cursor?: string | null }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.category) qs.set("category", params.category);
    if (params.cursor) qs.set("cursor", params.cursor);
    return api.getPaginated<DiagnosticTest>(`/tests/search?${qs.toString()}`, { auth: false });
  },

  getCategories: () => api.get<string[]>("/tests/categories", { auth: false }),

  autocomplete: (q: string) =>
    api.get<TestAutocompleteItem[]>(`/tests/autocomplete?q=${encodeURIComponent(q)}`, {
      auth: false,
    }),

  getTest: (id: string) => api.get<DiagnosticTest>(`/tests/${id}`, { auth: false }),
};
