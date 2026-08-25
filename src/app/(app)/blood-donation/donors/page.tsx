"use client";

import { FilterChips } from "@/components/search/filter-chips";
import { TierBadge } from "@/components/blood-donation/tier-badge";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { bloodDonationApi } from "@/features/blood-donation/api";
import { BLOOD_GROUPS, type BloodGroup } from "@/features/blood-donation/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronLeft, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const GROUP_OPTIONS = BLOOD_GROUPS.map((g) => ({ value: g, label: g }));

export default function BloodDonorsPage() {
  const router = useRouter();
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | null>(null);

  const resultsQuery = useInfiniteQuery({
    queryKey: ["blood-donors", "list", bloodGroup],
    queryFn: ({ pageParam }) =>
      bloodDonationApi.listDonors({ bloodGroup: bloodGroup ?? undefined, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const donors = resultsQuery.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="tap-target -ml-2 rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-bold">Available donors</h1>
      </div>

      <div className="mb-4">
        <FilterChips options={GROUP_OPTIONS} value={bloodGroup} onChange={setBloodGroup} allLabel="All" />
      </div>

      {resultsQuery.isLoading && <p className="py-12 text-center text-sm text-ink-500">Loading…</p>}

      {!resultsQuery.isLoading && donors.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Users size={28} className="text-ink-500" aria-hidden="true" />
          <p className="text-sm text-ink-500">No available donors for this group yet.</p>
        </div>
      )}

      <div className="space-y-2 pb-6">
        {donors.map((donor) => (
          <div key={donor._id} className="glass-panel flex items-center gap-3 p-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary-50">
              {donor.avatarUrl ? <PhotoSlot alt="" src={donor.avatarUrl} /> : <AvatarPlaceholder />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{donor.name ?? "Anonymous"}</p>
              <TierBadge totalDonations={donor.bloodDonor.totalDonations} />
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral-50 text-sm font-bold text-coral-600">
              {donor.bloodGroup}
            </span>
          </div>
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
