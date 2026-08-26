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
  waterLiters: METRIC_META.water,
  exerciseMinutes: METRIC_META.exercise,
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
        <div className="space-y-4">
          {Object.entries(insights.trends)
            .filter(([, points]) => points.length > 0)
            .map(([field, points]) => {
              const meta = NUMERIC_FIELD_TO_METRIC[field];
              if (!meta) return null;
              return <MetricCard key={field} label={meta.label} unit={meta.unit} points={points.map((p) => p.value)} />;
            })}

          {insights.bloodPressure.length > 0 && (
            <section className="glass-panel p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <p className="font-semibold text-ink-900">Blood pressure</p>
                <p className="text-sm text-ink-500">
                  <span className="text-base font-bold text-primary-700">
                    {insights.bloodPressure[insights.bloodPressure.length - 1].systolic}/
                    {insights.bloodPressure[insights.bloodPressure.length - 1].diastolic}
                  </span>{" "}
                  mmHg
                </p>
              </div>
              {insights.bloodPressure.length > 1 ? (
                <div className="space-y-2">
                  <LegendedSparkline
                    label="Systolic"
                    color="var(--color-coral-600)"
                    points={insights.bloodPressure.map((p) => p.systolic)}
                  />
                  <LegendedSparkline
                    label="Diastolic"
                    color="var(--color-primary-600)"
                    points={insights.bloodPressure.map((p) => p.diastolic)}
                  />
                </div>
              ) : (
                <NotEnoughDataHint />
              )}
            </section>
          )}

          {insights.screenTime.length > 0 && (
            <section className="glass-panel p-4">
              <p className="mb-3 font-semibold text-ink-900">Screen time (minutes/day)</p>
              {insights.screenTime.length > 1 ? (
                <div className="space-y-3">
                  <LegendedSparkline
                    label="Work"
                    color="var(--color-primary-600)"
                    unit="min"
                    height={32}
                    points={insights.screenTime.map((p) => p.work)}
                  />
                  <LegendedSparkline
                    label="Entertainment"
                    color="var(--color-amber-500)"
                    unit="min"
                    height={32}
                    points={insights.screenTime.map((p) => p.entertainment)}
                  />
                  <LegendedSparkline
                    label="Doomscrolling"
                    color="var(--color-coral-600)"
                    unit="min"
                    height={32}
                    points={insights.screenTime.map((p) => p.scrolling)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <ScreenTimeStat label="Work" value={insights.screenTime[0].work} />
                  <ScreenTimeStat label="Fun" value={insights.screenTime[0].entertainment} />
                  <ScreenTimeStat label="Scroll" value={insights.screenTime[0].scrolling} />
                </div>
              )}
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

function MetricCard({ label, unit, points }: { label: string; unit: string; points: number[] }) {
  const latest = points[points.length - 1];
  return (
    <section className="glass-panel p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="font-semibold text-ink-900">{label}</p>
        <p className="text-sm text-ink-500">
          <span className="text-base font-bold text-primary-700">{latest}</span>
          {unit ? ` ${unit}` : ""}
        </p>
      </div>
      {points.length > 1 ? <Sparkline points={points} /> : <NotEnoughDataHint />}
    </section>
  );
}

function NotEnoughDataHint() {
  return <p className="text-xs text-ink-500">Log a few more check-ins to see a trend here.</p>;
}

function LegendedSparkline({
  label,
  color,
  unit,
  points,
  height,
}: {
  label: string;
  color: string;
  unit?: string;
  points: number[];
  height?: number;
}) {
  const latest = points[points.length - 1];
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-ink-900">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
          {label}
        </span>
        <span className="text-ink-500">
          {latest}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <Sparkline points={points} color={color} height={height} />
    </div>
  );
}

function ScreenTimeStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-lg font-bold text-primary-700">{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  );
}
