"use client";

import { FilterChips } from "@/components/search/filter-chips";
import { SearchBar } from "@/components/search/search-bar";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { directoryApi } from "@/features/directory/api";
import { SPECIALTIES, SPECIALTY_SEARCH_TERM, specialtyLabel, type Specialty } from "@/features/directory/types";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BadgeCheck, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const SPECIALTY_OPTIONS = SPECIALTIES.map((s) => ({ value: s, label: specialtyLabel(s) }));

export default function FindCarePage() {
  const searchParams = useSearchParams();
  const specialtyParam = searchParams.get("specialty");
  const initialSpecialty =
    (SPECIALTIES as readonly string[]).find((s) => s === specialtyParam) as Specialty | undefined;

  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<Specialty | null>(initialSpecialty ?? null);
  const debouncedQuery = useDebouncedValue(query, 300);

  const resultsQuery = useInfiniteQuery({
    queryKey: ["doctors", "search", debouncedQuery, specialty],
    queryFn: ({ pageParam }) =>
      directoryApi.searchDoctors({
        q: debouncedQuery || undefined,
        specialty: specialty ? SPECIALTY_SEARCH_TERM[specialty] : undefined,
        cursor: pageParam,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const doctors = resultsQuery.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8">
      <h1 className="mb-4 text-2xl font-bold">Find Care</h1>

      <div className="mb-4 space-y-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Search doctors" />
        <FilterChips
          options={SPECIALTY_OPTIONS}
          value={specialty}
          onChange={setSpecialty}
          allLabel="All"
        />
      </div>

      {resultsQuery.isLoading && (
        <p className="py-12 text-center text-sm text-ink-500">Searching…</p>
      )}

      {!resultsQuery.isLoading && doctors.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Stethoscope size={28} className="text-ink-500" aria-hidden="true" />
          <p className="text-sm text-ink-500">No doctors found.</p>
        </div>
      )}

      <div className="space-y-2 pb-6">
        {doctors.map((doctor) => (
          <Link key={doctor._id} href={`/find-care/${doctor._id}`} className="glass-panel flex gap-3 p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-primary-50">
              {doctor.photoUrl ? (
                <PhotoSlot alt="" src={doctor.photoUrl} />
              ) : (
                <AvatarPlaceholder />
              )}
            </div>
            <div className="min-w-0 flex-1 py-0.5">
              <div className="flex items-center gap-1">
                <p className="truncate font-semibold">{doctor.name}</p>
                <BadgeCheck size={15} className="shrink-0 text-primary-600" aria-hidden="true" />
              </div>
              <p className="truncate text-sm text-ink-500">
                {doctor.specialties.map(specialtyLabel).join(", ")}
              </p>
              {doctor.experienceYears !== undefined && (
                <p className="text-xs text-ink-500">{doctor.experienceYears} yrs experience</p>
              )}
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
