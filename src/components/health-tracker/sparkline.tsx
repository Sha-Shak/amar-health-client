"use client";

// A minimal hand-rolled line chart — no charting library, just an SVG
// polyline scaled to its own min/max. Good enough for a "here's the trend"
// glance; anything more sophisticated belongs in a real charting lib if this
// ever needs zoom/tooltips/multi-series.
export function Sparkline({
  points,
  color = "var(--color-primary-600)",
  height = 56,
  min: minOverride,
  max: maxOverride,
}: {
  points: number[];
  color?: string;
  height?: number;
  min?: number;
  max?: number;
}) {
  if (points.length === 0) {
    return <div style={{ height }} className="flex items-center justify-center text-xs text-ink-500">No data yet</div>;
  }
  if (points.length === 1) {
    return (
      <svg viewBox="0 0 100 24" preserveAspectRatio="none" style={{ height }} className="w-full">
        <circle cx="50" cy="12" r="3" fill={color} />
      </svg>
    );
  }

  const min = minOverride ?? Math.min(...points);
  const max = maxOverride ?? Math.max(...points);
  const range = max - min || 1;
  const w = 100;
  const h = 24;
  const step = w / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = i * step;
    const y = h - ((p - min) / range) * h;
    return [x, y] as const;
  });

  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const [lastX, lastY] = coords[coords.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height }} className="w-full overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2.5} fill={color} />
    </svg>
  );
}
