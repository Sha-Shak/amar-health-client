"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { prescriptionsApi } from "@/features/prescriptions/api";
import { PrescriptionView } from "@/features/prescriptions/prescription-view";
import { errorMessage } from "@/lib/error-message";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function PatientPrescriptionPage() {
  const router = useRouter();
  const id = useParams<{ id: string }>().id;
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["patient", "prescription", id],
    queryFn: () => prescriptionsApi.get(id),
    retry: false,
  });

  return (
    <div className="mx-auto w-full max-w-md flex-1 space-y-4 px-5 py-6">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="tap-target -ml-2 rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>

      {isLoading && <p className="text-sm text-ink-500">Loading…</p>}
      {isError && <p className="text-sm text-coral-600">{errorMessage(error)}</p>}
      {data && <PrescriptionView p={data} lang={user?.preferredLanguage ?? "en"} />}
    </div>
  );
}
