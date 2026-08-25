import { api } from "@/lib/api-client";
import type { CreateDocumentInput, DocumentType, VaultDocument, VaultSummary } from "./types";

export const vaultApi = {
  getSummary: () => api.get<VaultSummary>("/vault/summary"),

  listDocuments: (params: { type?: DocumentType; cursor?: string | null }) => {
    const qs = new URLSearchParams();
    if (params.type) qs.set("type", params.type);
    if (params.cursor) qs.set("cursor", params.cursor);
    const query = qs.toString();
    return api.getPaginated<VaultDocument>(`/vault/documents${query ? `?${query}` : ""}`);
  },

  getDocument: (id: string) => api.get<VaultDocument>(`/vault/documents/${id}`),

  createDocument: (input: CreateDocumentInput) =>
    api.post<VaultDocument>("/vault/documents", input),

  updateDocument: (id: string, patch: Partial<CreateDocumentInput>) =>
    api.patch<VaultDocument>(`/vault/documents/${id}`, patch),

  deleteDocument: (id: string) => api.delete<{ message: string } | VaultDocument>(`/vault/documents/${id}`),

  requestPresignedUrl: (contentType: string) =>
    api.post<{ uploadUrl: string; fileKey: string }>("/uploads/presigned-url", {
      purpose: "document",
      contentType,
    }),
};

export async function uploadDocumentFile(uploadUrl: string, blob: Blob, contentType: string) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });
  if (!res.ok) throw new Error("Upload failed — please try again");
}

export type { DocumentType, VaultDocument, VaultSummary } from "./types";
