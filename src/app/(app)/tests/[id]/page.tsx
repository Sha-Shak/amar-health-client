"use client";

import { formatBdt } from "@/components/search/currency";
import { testsApi } from "@/features/tests/api";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function TestDetailPage() {
  const router = useRouter();
  const id = useParams<{ id: string }>().id;

  const { data: test, isLoading } = useQuery({
    queryKey: ["tests", "detail", id],
    queryFn: () => testsApi.getTest(id),
  });

  if (isLoading || !test) {
    return <div className="flex flex-1 items-center justify-center text-ink-700">Loading…</div>;
  }

  const sortedPrices = [...test.prices].sort((a, b) => a.price - b.price);
  const cheapest = sortedPrices[0]?.price;

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="tap-target -ml-2 mb-2 rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>

      <p className="text-sm text-ink-500">{test.category}</p>
      <h1 className="mb-5 text-2xl font-bold">{test.test_name}</h1>

      <div className="glass-panel divide-y divide-black/5 p-1">
        {sortedPrices.map((p) => (
          <div key={p._id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">{p.center_name}</span>
              {p.price === cheapest && (
                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">
                  Lowest
                </span>
              )}
            </div>
            <span className="font-semibold">{formatBdt(p.price)}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-ink-500">
        Prices are listed by each center and may change — confirm before you visit.
      </p>
    </div>
  );
}
