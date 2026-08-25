"use client";

import { FilterChips } from "@/components/search/filter-chips";
import { BLOOD_GROUPS, urgencyLabel, type BloodGroup } from "@/features/blood-donation/types";
import { bloodDonationApi } from "@/features/blood-donation/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, Droplets, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const GROUP_OPTIONS = BLOOD_GROUPS.map((g) => ({ value: g, label: g }));

const URGENCY_STYLES: Record<string, string> = {
  critical: "bg-coral-600 text-white",
  urgent: "bg-coral-100 text-coral-700",
  normal: "bg-primary-50 text-primary-700",
};

export default function BloodRequestsPage() {
  const router = useRouter();
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | null>(null);

  const resultsQuery = useInfiniteQuery({
    queryKey: ["blood-requests", "list", bloodGroup],
    queryFn: ({ pageParam }) =>
      bloodDonationApi.listRequests({ bloodGroup: bloodGroup ?? undefined, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const requests = resultsQuery.data?.pages.flatMap((p) => p.items) ?? [];

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
        <h1 className="text-2xl font-bold">Blood requests</h1>
      </div>

      <div className="mb-4">
        <FilterChips options={GROUP_OPTIONS} value={bloodGroup} onChange={setBloodGroup} allLabel="All" />
      </div>

      {resultsQuery.isLoading && <p className="py-12 text-center text-sm text-ink-500">Loading…</p>}

      {!resultsQuery.isLoading && requests.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Droplets size={28} className="text-ink-500" aria-hidden="true" />
          <p className="text-sm text-ink-500">No open requests right now.</p>
        </div>
      )}

      <div className="space-y-2 pb-6">
        {requests.map((request) => (
          <Link
            key={request._id}
            href={`/blood-donation/requests/${request._id}`}
            className="glass-panel block p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral-50 text-lg font-extrabold text-coral-600">
                  {request.bloodGroup}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{request.hospitalName}</p>
                  <div className="flex items-center gap-1 text-sm text-ink-500">
                    <MapPin size={12} className="shrink-0" aria-hidden="true" />
                    <span className="truncate">{request.location}</span>
                  </div>
                </div>
              </div>
              <span
                className={`shrink-0 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold ${URGENCY_STYLES[request.urgency]}`}
              >
                {urgencyLabel(request.urgency)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
              <span>
                {request.unitsFulfilled}/{request.unitsNeeded} units ·{" "}
                {request.interestCount ?? 0} interested
              </span>
              <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
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
