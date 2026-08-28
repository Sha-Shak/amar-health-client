"use client";

import { prescriptionsApi } from "@/features/prescriptions/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PrescriptionsPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["patient", "prescriptions", "list"],
    queryFn: () => prescriptionsApi.list(),
  });

  const items = data?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-md flex-1 space-y-4 px-5 py-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="tap-target -ml-2 rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="text-xl font-bold text-ink-900">Prescriptions</h1>
      </div>

      {isLoading && <p className="text-sm text-ink-500">Loading…</p>}
      {!isLoading && items.length === 0 && (
        <div className="glass-panel p-6 text-center text-sm text-ink-500">
          Your prescriptions from Amar Health doctors will show up here.
        </div>
      )}

      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p._id}>
            <Link
              href={`/prescriptions/${p._id}`}
              className="glass-panel flex items-center gap-3 p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <FileText size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink-900">
                  {p.diagnosis || "Prescription"}
                </p>
                <p className="truncate text-xs text-ink-500">
                  {p.doctorId?.name ?? "Doctor"}
                  {" · "}
                  {format(new Date(p.finalizedAt ?? p.createdAt), "d MMM yyyy")}
                </p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-ink-400" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
