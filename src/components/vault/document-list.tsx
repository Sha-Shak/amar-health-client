"use client";

import { vaultApi } from "@/features/vault/api";
import type { DocumentType } from "@/features/vault/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FolderHeart } from "lucide-react";
import { DocumentCard } from "./document-card";

export function DocumentList({ type }: { type?: DocumentType }) {
  const query = useInfiniteQuery({
    queryKey: ["vault", "documents", type ?? "all"],
    queryFn: ({ pageParam }) => vaultApi.listDocuments({ type, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const documents = query.data?.pages.flatMap((p) => p.items) ?? [];

  if (query.isLoading) {
    return <p className="px-5 py-8 text-center text-sm text-ink-500">Loading…</p>;
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
        <FolderHeart size={28} className="text-ink-500" aria-hidden="true" />
        <p className="text-sm text-ink-500">No documents yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 px-5 pb-6">
      {documents.map((doc) => (
        <DocumentCard key={doc._id} document={doc} />
      ))}
      {query.hasNextPage && (
        <button
          type="button"
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
          className="tap-target w-full rounded-[var(--radius-pill)] bg-surface-60 text-sm font-medium text-ink-700"
        >
          {query.isFetchingNextPage ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
