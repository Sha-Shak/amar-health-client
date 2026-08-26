"use client";

import { Sparkline } from "@/components/health-tracker/sparkline";
import { healthTrackerApi } from "@/features/health-tracker/api";
import { METRIC_META } from "@/features/health-tracker/types";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const NUMERIC_FIELD_TO_METRIC: Record<string, { label: string; unit: string }> = {
  weightKg: METRIC_META.weight,
  bloodGlucose: METRIC_META.blood_glucose,
  heartRate: METRIC_META.heart_rate,
  mood: METRIC_META.mood,
  stress: METRIC_META.stress,
  sleepHours: METRIC_META.sleep,
  waterGlasses: METRIC_META.water,
};

export default function HealthInsightsPage() {
  const router = useRouter();

  const insightsQuery = useQuery({
    queryKey: ["health-insights"],
    queryFn: healthTrackerApi.getInsights,
  });

  const insights = insightsQuery.data;

  return (
    <div className="mx-auto w-full max-w-sm px-5 py-6">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="tap-target -ml-2 rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="flex items-center gap-2 text-lg font-bold">
          <BarChart3 size={20} className="text-primary-600" aria-hidden="true" />
          Insights
        </h1>
      </div>

      {insightsQuery.isLoading && <p className="text-sm text-ink-500">Loading…</p>}

      {insights && insights.totalLogged === 0 && (
        <div className="glass-panel p-5 text-center text-sm text-ink-700">
          Log a check-in and your trends will start showing up here.
        </div>
      )}

      {insights && insights.totalLogged > 0 && (
        <div className="space-y-5">
          {Object.entries(insights.trends)
            .filter(([, points]) => points.length > 0)
            .map(([field, points]) => {
              const meta = NUMERIC_FIELD_TO_METRIC[field];
              if (!meta) return null;
              const latest = points[points.length - 1].value;
              return (
                <section key={field} className="glass-panel p-4">
                  <div className="mb-2 flex items-baseline justify-between">
                    <p className="font-semibold text-ink-900">{meta.label}</p>
                    <p className="text-sm text-ink-500">
                      Latest: <span className="font-semibold text-primary-700">{latest}</span>{" "}
                      {meta.unit}
                    </p>
                  </div>
                  <Sparkline points={points.map((p) => p.value)} />
                </section>
              );
            })}

          {insights.bloodPressure.length > 0 && (
            <section className="glass-panel p-4">
              <div className="mb-2 flex items-baseline justify-between">
                <p className="font-semibold text-ink-900">Blood pressure</p>
                <p className="text-sm text-ink-500">
                  Latest:{" "}
                  <span className="font-semibold text-primary-700">
                    {insights.bloodPressure[insights.bloodPressure.length - 1].systolic}/
                    {insights.bloodPressure[insights.bloodPressure.length - 1].diastolic}
                  </span>{" "}
                  mmHg
                </p>
              </div>
              <Sparkline points={insights.bloodPressure.map((p) => p.systolic)} color="var(--color-coral-600)" />
              <div className="mt-1">
                <Sparkline points={insights.bloodPressure.map((p) => p.diastolic)} color="var(--color-primary-600)" />
              </div>
            </section>
          )}

          {insights.screenTime.length > 0 && (
            <section className="glass-panel p-4">
              <p className="mb-3 font-semibold text-ink-900">Screen time (minutes/day)</p>
              <ScreenTimeRow label="Work" color="var(--color-primary-600)" values={insights.screenTime.map((p) => p.work)} />
              <ScreenTimeRow
                label="Entertainment"
                color="var(--color-amber-500)"
                values={insights.screenTime.map((p) => p.entertainment)}
              />
              <ScreenTimeRow
                label="Doomscrolling"
                color="var(--color-coral-600)"
                values={insights.screenTime.map((p) => p.scrolling)}
              />
            </section>
          )}

          <p className="px-1 text-xs text-ink-500">
            {insights.totalLogged} check-in{insights.totalLogged === 1 ? "" : "s"} logged so far.
          </p>
        </div>
      )}
    </div>
  );
}

function ScreenTimeRow({ label, color, values }: { label: string; color: string; values: number[] }) {
  const latest = values[values.length - 1];
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-ink-900">{label}</span>
        <span className="text-ink-500">{latest} min</span>
      </div>
      <Sparkline points={values} color={color} height={32} />
    </div>
  );
}
