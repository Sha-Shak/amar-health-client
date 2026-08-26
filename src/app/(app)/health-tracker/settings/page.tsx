"use client";

import { healthTrackerApi } from "@/features/health-tracker/api";
import {
  FREQUENCIES,
  METRIC_META,
  METRIC_TYPES,
  type Frequency,
  type HealthTrackerSettings,
  type MetricType,
} from "@/features/health-tracker/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function HealthTrackerSettingsPage() {
  const router = useRouter();

  const settingsQuery = useQuery({
    queryKey: ["health-settings"],
    queryFn: healthTrackerApi.getSettings,
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

      {settingsQuery.data && <SettingsForm initial={settingsQuery.data} />}
    </div>
  );
}

function SettingsForm({ initial }: { initial: HealthTrackerSettings }) {
  const queryClient = useQueryClient();
  const [frequency, setFrequency] = useState<Frequency>(initial.frequency);
  const [enabledMetrics, setEnabledMetrics] = useState<MetricType[]>(initial.enabledMetrics);

  const saveMutation = useMutation({
    mutationFn: () => healthTrackerApi.updateSettings({ frequency, enabledMetrics }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-settings"] });
      queryClient.invalidateQueries({ queryKey: ["health-insights"] });
      toast.success("Saved");
    },
  });

  function toggleMetric(m: MetricType) {
    setEnabledMetrics((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 px-1 text-sm font-medium text-ink-500">Check-in frequency</p>
        <div className="flex gap-2">
          {FREQUENCIES.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              className={`tap-target flex-1 rounded-[var(--radius-pill)] px-3 text-sm font-medium capitalize ${
                frequency === f ? "bg-primary-600 text-white" : "bg-surface-60 text-ink-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-sm font-medium text-ink-500">Metrics to track</p>
        <div className="glass-panel divide-y divide-black/5 p-2">
          {METRIC_TYPES.map((m) => {
            const meta = METRIC_META[m];
            const active = enabledMetrics.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleMetric(m)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink-900">{meta.label}</span>
                  <span className="block text-sm text-ink-500">{meta.description}</span>
                </span>
                <span
                  className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                    active ? "border-primary-600 bg-primary-600" : "border-ink-500/30"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="tap-target w-full rounded-[var(--radius-pill)] bg-primary-600 font-semibold text-white disabled:opacity-60"
      >
        {saveMutation.isPending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
