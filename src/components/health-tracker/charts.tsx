"use client";

import { format, parseISO } from "date-fns";

const MOOD_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];
const MOOD_EMOJI = ["😞", "🙁", "😐", "🙂", "😄"];

// Bars, not a dot-per-point sparkline — a sparkline with 2-3 points reads as
// a couple of floating dots with nothing connecting them ("squashed"); bars
// stay legible at any point count since each one owns real width and a
// visible minimum height.
export function BarTrendChart({
  points,
  color = "var(--color-primary-600)",
}: {
  points: { date: string; value: number }[];
  color?: string;
}) {
  if (points.length === 0) {
    return <p className="py-6 text-center text-xs text-ink-500">No data yet</p>;
  }

  const values = points.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const CHART_HEIGHT = 84;
  const MIN_BAR = 10;

  return (
    <div className="flex items-end gap-2 overflow-x-auto pb-1" style={{ height: CHART_HEIGHT + 22 }}>
      {points.map((p) => {
        const barHeight = MIN_BAR + ((p.value - min) / range) * (CHART_HEIGHT - MIN_BAR);
        return (
          <div key={p.date} className="flex shrink-0 flex-col items-center gap-1" style={{ width: 26 }}>
            <div
              className="w-full rounded-t-md transition-all"
              style={{ height: barHeight, backgroundColor: color }}
              title={String(p.value)}
            />
            <span className="text-[9px] leading-none text-ink-500">{format(parseISO(p.date), "d")}</span>
          </div>
        );
      })}
    </div>
  );
}

// Paired bars for two related series sharing one axis (blood pressure's
// systolic/diastolic) — same min-height-bar treatment as BarTrendChart.
export function PairedBarChart({
  points,
  colorA,
  colorB,
}: {
  points: { date: string; a: number; b: number }[];
  colorA: string;
  colorB: string;
}) {
  if (points.length === 0) {
    return <p className="py-6 text-center text-xs text-ink-500">No data yet</p>;
  }

  const all = points.flatMap((p) => [p.a, p.b]);
  const max = Math.max(...all);
  const min = Math.min(...all);
  const range = max - min || 1;
  const CHART_HEIGHT = 84;
  const MIN_BAR = 10;

  return (
    <div className="flex items-end gap-3 overflow-x-auto pb-1" style={{ height: CHART_HEIGHT + 22 }}>
      {points.map((p) => (
        <div key={p.date} className="flex shrink-0 flex-col items-center gap-1">
          <div className="flex items-end gap-1" style={{ height: CHART_HEIGHT }}>
            <div
              className="w-2.5 rounded-t-md"
              style={{ height: MIN_BAR + ((p.a - min) / range) * (CHART_HEIGHT - MIN_BAR), backgroundColor: colorA }}
            />
            <div
              className="w-2.5 rounded-t-md"
              style={{ height: MIN_BAR + ((p.b - min) / range) * (CHART_HEIGHT - MIN_BAR), backgroundColor: colorB }}
            />
          </div>
          <span className="text-[9px] leading-none text-ink-500">{format(parseISO(p.date), "d")}</span>
        </div>
      ))}
    </div>
  );
}

export function MoodDonut({ counts }: { counts: number[] }) {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) return <p className="py-6 text-center text-xs text-ink-500">No mood logged yet</p>;

  const r = 40;
  const circumference = 2 * Math.PI * r;
  const segments = counts.reduce<{ dash: number; offset: number; color: string }[]>((acc, count, i) => {
    const dash = (count / total) * circumference;
    const prevEnd = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    acc.push({ dash, offset: prevEnd, color: MOOD_COLORS[i] });
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" width={92} height={92} className="-rotate-90 shrink-0">
        <circle cx={50} cy={50} r={r} fill="none" stroke="var(--color-ink-500)" strokeOpacity={0.12} strokeWidth={16} />
        {segments.map(
          (s, i) =>
            counts[i] > 0 && (
              <circle
                key={i}
                cx={50}
                cy={50}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={16}
                strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                strokeDashoffset={-s.offset}
              />
            ),
        )}
      </svg>
      <div className="space-y-1.5">
        {counts.map(
          (count, i) =>
            count > 0 && (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: MOOD_COLORS[i] }} />
                <span className="text-ink-900">{MOOD_EMOJI[i]}</span>
                <span className="text-ink-500">
                  {count} day{count === 1 ? "" : "s"}
                </span>
              </div>
            ),
        )}
      </div>
    </div>
  );
}

export function ScoreRing({ value, label }: { value: number; label: string }) {
  const r = 46;
  const circumference = 2 * Math.PI * r;
  const dash = (value / 100) * circumference;
  const color =
    value >= 85
      ? "var(--color-success-500)"
      : value >= 70
        ? "var(--color-primary-600)"
        : value >= 50
          ? "var(--color-amber-500)"
          : "var(--color-coral-600)";

  return (
    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx={50} cy={50} r={r} fill="none" stroke="var(--color-ink-500)" strokeOpacity={0.12} strokeWidth={10} />
        <circle
          cx={50}
          cy={50}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <p className="text-3xl font-bold text-ink-900">{value}</p>
        <p className="text-xs font-medium text-ink-500">{label}</p>
      </div>
    </div>
  );
}
