"use client";

import { FilterChips } from "@/components/search/filter-chips";
import { SearchBar } from "@/components/search/search-bar";
import { medicinesApi, type MedicineSortBy } from "@/features/medicines/api";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ArrowDownAZ, Pill } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const SORT_OPTIONS: { value: MedicineSortBy; label: string }[] = [
  { value: "brandName", label: "Brand name" },
  { value: "genericName", label: "Generic" },
  { value: "manufacturerName", label: "Manufacturer" },
];

export default function MedicineSearchPage() {
  const [query, setQuery] = useState("");
  const [genericId, setGenericId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<MedicineSortBy>("brandName");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);

  // A fixed browse page of generics as filter chips — the collection is far too
  // large to list exhaustively, so this is "common ones to start from," not
  // "every generic." Typing in the search box still searches by brand name.
  const genericsQuery = useQuery({
    queryKey: ["medicines", "generics-chips"],
    queryFn: () => medicinesApi.listGenerics(),
  });

  const resultsQuery = useInfiniteQuery({
    queryKey: ["medicines", "search", debouncedQuery, genericId, sortBy],
    queryFn: ({ pageParam }) =>
      medicinesApi.search({
        q: debouncedQuery || undefined,
        genericId: genericId ?? undefined,
        sortBy,
        cursor: pageParam,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const medicines = resultsQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const genericOptions = (genericsQuery.data?.items ?? []).map((g) => ({ value: g._id, label: g.name }));

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Medicine</h1>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortMenuOpen((v) => !v)}
            className="tap-target flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-white/60 px-3 text-sm font-medium text-ink-700"
          >
            <ArrowDownAZ size={16} aria-hidden="true" />
            Sort
          </button>
          {sortMenuOpen && (
            <div className="glass-panel absolute right-0 top-12 z-10 w-44 space-y-1 p-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.value);
                    setSortMenuOpen(false);
                  }}
                  className={`tap-target w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm ${
                    sortBy === opt.value ? "bg-primary-600 text-white" : "text-ink-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Search medicines by name" />
        {genericOptions.length > 0 && (
          <FilterChips options={genericOptions} value={genericId} onChange={setGenericId} allLabel="All generics" />
        )}
      </div>

      {resultsQuery.isLoading && (
        <p className="py-12 text-center text-sm text-ink-500">Loading…</p>
      )}

      {!resultsQuery.isLoading && medicines.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Pill size={28} className="text-ink-500" aria-hidden="true" />
          <p className="text-sm text-ink-500">No medicines found.</p>
        </div>
      )}

      <div className="space-y-2 pb-6">
        {medicines.map((med) => (
          <Link key={med._id} href={`/medicine/${med._id}`} className="glass-panel flex items-center gap-3 p-4">
            <span className="tap-target shrink-0 rounded-full bg-primary-50 text-primary-700">
              <Pill size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {med.brandName}
                {med.strength ? ` ${med.strength}` : ""}
              </p>
              <p className="truncate text-sm text-ink-500">
                {[med.genericName, med.manufacturerName].filter(Boolean).join(" · ")}
              </p>
            </div>
            {med.dosageFormName && (
              <span className="shrink-0 text-xs text-ink-500">{med.dosageFormName}</span>
            )}
          </Link>
        ))}

        {resultsQuery.hasNextPage && (
          <button
            type="button"
            onClick={() => resultsQuery.fetchNextPage()}
            disabled={resultsQuery.isFetchingNextPage}
            className="tap-target w-full rounded-[var(--radius-pill)] bg-white/60 text-sm font-medium text-ink-700"
          >
            {resultsQuery.isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}
