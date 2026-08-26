"use client";

import { BarTrendChart, MoodDonut, PairedBarChart, ScoreRing } from "@/components/health-tracker/charts";
import { healthTrackerApi } from "@/features/health-tracker/api";
import { METRIC_META } from "@/features/health-tracker/types";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const NUMERIC_FIELD_TO_METRIC: Record<string, { label: string; unit: string; color: string }> = {
  weightKg: { ...METRIC_META.weight, color: "var(--color-primary-600)" },
  bloodGlucose: { ...METRIC_META.blood_glucose, color: "var(--color-coral-600)" },
  heartRate: { ...METRIC_META.heart_rate, color: "var(--color-coral-600)" },
  sleepHours: { ...METRIC_META.sleep, color: "var(--color-primary-600)" },
  waterLiters: { ...METRIC_META.water, color: "var(--color-primary-600)" },
  exerciseMinutes: { ...METRIC_META.exercise, color: "var(--color-success-500)" },
  screenTimeHours: { ...METRIC_META.screen_time, color: "var(--color-amber-500)" },
};

export default function HealthInsightsPage() {
  const router = useRouter();

  const insightsQuery = useQuery({
    queryKey: ["health-insights"],
    queryFn: healthTrackerApi.getInsights,
  });

  const insights = insightsQuery.data;

  return (
    <div className="mx-auto w-full max-w-sm px-5 pb-28 pt-6">
      <div className="mb-5 flex items-center gap-3">
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
        <div className="glass-panel p-6 text-center">
          <p className="mb-1 font-semibold text-ink-900">Nothing to show yet</p>
          <p className="text-sm text-ink-700">
            Log a check-in on the Health Tracker and your trends will start showing up here.
          </p>
        </div>
      )}

      {insights && insights.totalLogged > 0 && (
        <div className="space-y-5">
          {insights.healthScore.value != null && (
            <section className="glass-panel-strong flex items-center gap-4 p-5">
              <ScoreRing value={insights.healthScore.value} label={insights.healthScore.label ?? ""} />
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="font-semibold text-ink-900">Health score</p>
                <p className="text-xs text-ink-500">
                  Combines the metrics below with recent data — not a diagnosis, just a quick
                  pulse-check.
                </p>
                <div className="space-y-1 pt-1">
                  {insights.healthScore.breakdown.map((c) => (
                    <div key={c.key} className="flex items-center gap-2">
                      <span className="w-20 shrink-0 truncate text-[11px] text-ink-500">{c.label}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-500/15">
                        <div
                          className="h-full rounded-full bg-primary-600"
                          style={{ width: `${c.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {insights.moodCounts.some((c) => c > 0) && (
            <section className="glass-panel p-4">
              <p className="mb-3 font-semibold text-ink-900">Mood distribution</p>
              <MoodDonut counts={insights.moodCounts} />
            </section>
          )}

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
                  <BarTrendChart points={points} color={meta.color} />
                </section>
              );
            })}

          {insights.bloodPressure.length > 0 && (
            <section className="glass-panel p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold text-ink-900">Blood pressure</p>
                <p className="text-sm text-ink-500">
                  <span className="font-semibold text-primary-700">
                    {insights.bloodPressure[insights.bloodPressure.length - 1].systolic}/
                    {insights.bloodPressure[insights.bloodPressure.length - 1].diastolic}
                  </span>{" "}
                  mmHg
                </p>
              </div>
              <div className="mb-2 flex gap-4 text-xs text-ink-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-coral-600)" }} />
                  Systolic
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-primary-600)" }} />
                  Diastolic
                </span>
              </div>
              <PairedBarChart
                points={insights.bloodPressure.map((p) => ({ date: p.date, a: p.systolic, b: p.diastolic }))}
                colorA="var(--color-coral-600)"
                colorB="var(--color-primary-600)"
              />
            </section>
          )}

          <p className="px-1 text-center text-xs text-ink-500">
            {insights.totalLogged} check-in{insights.totalLogged === 1 ? "" : "s"} logged so far.
          </p>
        </div>
      )}
    </div>
  );
}
