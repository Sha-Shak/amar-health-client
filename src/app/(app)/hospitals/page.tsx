"use client";

import { FilterChips } from "@/components/search/filter-chips";
import { SearchBar } from "@/components/search/search-bar";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { photos } from "@/config/photos";
import { directoryApi } from "@/features/directory/api";
import { HOSPITAL_TYPES, hospitalTypeLabel, type HospitalType } from "@/features/directory/types";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Building2, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TYPE_OPTIONS = HOSPITAL_TYPES.map((t) => ({ value: t, label: hospitalTypeLabel(t) }));

export default function HospitalsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<HospitalType | null>(null);
  const debouncedQuery = useDebouncedValue(query, 300);

  const resultsQuery = useInfiniteQuery({
    queryKey: ["hospitals", "search", debouncedQuery, type],
    queryFn: ({ pageParam }) =>
      directoryApi.searchHospitals({ q: debouncedQuery || undefined, type: type ?? undefined, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const hospitals = resultsQuery.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8">
      <h1 className="mb-4 text-2xl font-bold">Hospitals</h1>

      <div className="mb-4 space-y-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Search hospitals" />
        <FilterChips options={TYPE_OPTIONS} value={type} onChange={setType} allLabel="All" />
      </div>

      {resultsQuery.isLoading && <p className="py-12 text-center text-sm text-ink-500">Loading…</p>}

      {!resultsQuery.isLoading && hospitals.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Building2 size={28} className="text-ink-500" aria-hidden="true" />
          <p className="text-sm text-ink-500">No hospitals found.</p>
        </div>
      )}

      <div className="space-y-2 pb-6">
        {hospitals.map((hospital) => (
          <Link
            key={hospital._id}
            href={`/hospitals/${hospital._id}`}
            className="glass-panel flex gap-3 p-3"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)]">
              <PhotoSlot alt="" src={hospital.photoUrl || photos.tiles.hospitals} gradient="from-coral-600 to-ink-900" />
            </div>
            <div className="min-w-0 flex-1 py-0.5">
              <p className="truncate font-semibold">{hospital.name}</p>
              <div className="flex items-center gap-1 text-sm text-ink-500">
                <MapPin size={13} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{hospital.address}</span>
              </div>
              <p className="text-xs text-ink-500">{hospitalTypeLabel(hospital.type)}</p>
            </div>
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
