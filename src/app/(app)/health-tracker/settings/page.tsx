"use client";

import { TrackerSettingsForm } from "@/components/health-tracker/tracker-settings-form";
import { useAuth } from "@/components/providers/auth-provider";
import { authApi } from "@/features/auth/api";
import { healthTrackerApi } from "@/features/health-tracker/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function HealthTrackerSettingsPage() {
  const router = useRouter();
  const { user, refetch } = useAuth();

  const settingsQuery = useQuery({
    queryKey: ["health-settings"],
    queryFn: healthTrackerApi.getSettings,
  });

  const [heightCm, setHeightCm] = useState(() => user?.heightCm?.toString() ?? "");
  const heightMutation = useMutation({
    mutationFn: () => authApi.updateMe({ heightCm: heightCm ? Number(heightCm) : undefined }),
    onSuccess: () => {
      refetch();
      toast.success("Height saved");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <div className="mx-auto w-full max-w-sm px-6 pb-28 pt-6">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="tap-target -ml-2 mb-2 rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <h1 className="mb-1 text-2xl font-bold">Health Tracker settings</h1>
      <p className="mb-6 text-ink-700">
        Choose how often you want to check in, and which of your own metrics show up in that
        check-in.
      </p>

      {!user?.heightCm && (
        <div className="glass-panel mb-5 space-y-2 p-4">
          <p className="font-semibold text-ink-900">What&apos;s your height?</p>
          <p className="text-sm text-ink-700">
            Used together with a logged weight to work out your BMI for the health score below —
            optional, but the score is more complete with it.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="e.g. 170"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-primary-400/30 bg-surface-70 px-4 py-3 text-ink-900 outline-none focus:border-primary-600/40 focus:ring-2 focus:ring-primary-600/30"
            />
            <span className="shrink-0 text-sm text-ink-500">cm</span>
          </div>
          <button
            type="button"
            onClick={() => heightMutation.mutate()}
            disabled={!heightCm || heightMutation.isPending}
            className="tap-target rounded-[var(--radius-pill)] bg-primary-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {heightMutation.isPending ? "Saving…" : "Save height"}
          </button>
          {heightMutation.isError && (
            <p className="text-sm text-coral-600">{errorMessage(heightMutation.error)}</p>
          )}
        </div>
      )}

      {settingsQuery.data && <TrackerSettingsForm initial={settingsQuery.data} />}
    </div>
  );
}
