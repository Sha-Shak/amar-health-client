"use client";

import { FilterChips } from "@/components/search/filter-chips";
import { SearchBar } from "@/components/search/search-bar";
import { formatBdt } from "@/components/search/currency";
import { testsApi } from "@/features/tests/api";
import { priceRange } from "@/features/tests/types";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { FlaskConical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TestsSearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, 300);

  const categoriesQuery = useQuery({
    queryKey: ["tests", "categories"],
    queryFn: testsApi.getCategories,
  });

  const resultsQuery = useInfiniteQuery({
    queryKey: ["tests", "search", debouncedQuery, category],
    queryFn: ({ pageParam }) =>
      testsApi.search({ q: debouncedQuery || undefined, category: category ?? undefined, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const results = resultsQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const categoryOptions = (categoriesQuery.data ?? []).map((c) => ({ value: c, label: c }));

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8">
      <h1 className="mb-4 text-2xl font-bold">Diagnostic Tests</h1>

      <div className="mb-4 space-y-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Search tests, e.g. CT Scan" />
        {categoryOptions.length > 0 && (
          <FilterChips options={categoryOptions} value={category} onChange={setCategory} allLabel="All" />
        )}
      </div>

      {resultsQuery.isLoading && (
        <p className="py-12 text-center text-sm text-ink-500">Loading…</p>
      )}

      {!resultsQuery.isLoading && results.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <FlaskConical size={28} className="text-ink-500" aria-hidden="true" />
          <p className="text-sm text-ink-500">No tests found.</p>
        </div>
      )}

      <div className="space-y-2 pb-6">
        {results.map((test) => {
          const range = priceRange(test.prices);
          return (
            <Link key={test._id} href={`/tests/${test._id}`} className="glass-panel flex items-center gap-3 p-4">
              <span className="tap-target shrink-0 rounded-full bg-primary-50 text-primary-700">
                <FlaskConical size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{test.test_name}</p>
                <p className="text-sm text-ink-500">{test.category}</p>
              </div>
              {range && (
                <p className="shrink-0 text-sm font-semibold text-primary-700">
                  {range.min === range.max
                    ? formatBdt(range.min)
                    : `${formatBdt(range.min)}–${formatBdt(range.max)}`}
                </p>
              )}
            </Link>
          );
        })}

        {resultsQuery.hasNextPage && (
          <button
            type="button"
            onClick={() => resultsQuery.fetchNextPage()}
            disabled={resultsQuery.isFetchingNextPage}
            className="tap-target w-full rounded-[var(--radius-pill)] bg-surface-60 text-sm font-medium text-ink-700"
          >
            {resultsQuery.isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}
