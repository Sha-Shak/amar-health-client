"use client";

import { cycleTrackingApi } from "@/features/cycle-tracking/api";
import type { CycleInsights } from "@/features/cycle-tracking/types";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { BarChart3, ChevronLeft, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CycleInsightsPage() {
  const router = useRouter();

  const insightsQuery = useQuery({
    queryKey: ["cycle-insights"],
    queryFn: cycleTrackingApi.getInsights,
  });

  const insights = insightsQuery.data;

  async function handleShare() {
    if (!insights) return;
    const text = buildShareText(insights);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Cycle summary — Amar Health", text });
        return;
      } catch {
        // User cancelled the share sheet — fall through to clipboard below
        // only if share genuinely isn't usable, not on every cancel.
        return;
      }
    }
    await navigator.clipboard.writeText(text);
    toast.success("Summary copied — paste it wherever you'd like to share it");
  }

  return (
    <div className="mx-auto w-full max-w-sm px-5 py-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="tap-target -ml-2 rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="flex items-center gap-2 text-lg font-bold">
          <BarChart3 size={20} className="text-rose-600" aria-hidden="true" />
          Insights
        </h1>
        <button
          type="button"
          onClick={handleShare}
          disabled={!insights}
          aria-label="Share summary"
          className="tap-target -mr-2 rounded-full text-ink-700 disabled:opacity-40"
        >
          <Share2 size={20} aria-hidden="true" />
        </button>
      </div>

      {insightsQuery.isLoading && <p className="text-sm text-ink-500">Loading…</p>}

      {insights && insights.cyclesConsidered === 0 && (
        <div className="glass-panel p-5 text-center text-sm text-ink-700">
          Log a couple of periods and this page will start showing your cycle history and patterns.
        </div>
      )}

      {insights && insights.cyclesConsidered > 0 && (
        <div className="space-y-5">
          <section>
            <p className="mb-2 px-1 text-sm font-medium text-ink-500">Cycle history</p>
            <div className="glass-panel divide-y divide-black/5 p-2">
              {insights.recentCycles
                .slice()
                .reverse()
                .map((cycle) => (
                  <div key={cycle.start} className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-sm font-medium text-ink-900">
                      {format(parseISO(cycle.start), "MMM d, yyyy")}
                    </span>
                    <span className="text-sm text-ink-500">
                      {cycle.cycleLength != null ? `${cycle.cycleLength}-day cycle` : "Ongoing"} · period{" "}
                      {cycle.periodLength}d
                    </span>
                  </div>
                ))}
            </div>
          </section>

          {insights.avgPainLevel != null && (
            <section className="glass-panel flex items-center justify-between p-4">
              <span className="text-sm font-medium text-ink-700">Average pain level</span>
              <span className="text-lg font-bold text-rose-600">{insights.avgPainLevel}/10</span>
            </section>
          )}

          {insights.topSymptoms.length > 0 && (
            <FrequencySection title="Most common symptoms" items={insights.topSymptoms} />
          )}

          {insights.topMoods.length > 0 && (
            <FrequencySection title="Most common moods" items={insights.topMoods} />
          )}

          <p className="px-1 text-xs text-ink-500">
            Based on your last {insights.cyclesConsidered} logged cycle
            {insights.cyclesConsidered === 1 ? "" : "s"}. These are personal patterns, not a diagnosis —
            share them with a doctor if something feels off.
          </p>
        </div>
      )}
    </div>
  );
}

function FrequencySection({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  const max = Math.max(...items.map((i) => i.count));
  return (
    <section>
      <p className="mb-2 px-1 text-sm font-medium text-ink-500">{title}</p>
      <div className="glass-panel space-y-2.5 p-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-ink-900">{item.label}</span>
              <span className="text-ink-500">{item.count}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-primary-600/15">
              <div
                className="h-full rounded-full bg-primary-600"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function buildShareText(insights: CycleInsights): string {
  const lines: string[] = [];
  lines.push("Cycle summary — Amar Health");
  lines.push(`Based on the last ${insights.cyclesConsidered} logged cycle(s)`);
  lines.push("");
  lines.push("Recent cycles:");
  for (const cycle of insights.recentCycles.slice().reverse()) {
    const cycleLen = cycle.cycleLength != null ? `${cycle.cycleLength}-day cycle, ` : "";
    lines.push(`- ${format(parseISO(cycle.start), "MMM d, yyyy")} — ${cycleLen}period ${cycle.periodLength}d`);
  }
  if (insights.avgPainLevel != null) {
    lines.push("");
    lines.push(`Average pain level: ${insights.avgPainLevel}/10`);
  }
  if (insights.topSymptoms.length > 0) {
    lines.push("");
    lines.push("Most common symptoms:");
    for (const s of insights.topSymptoms) lines.push(`- ${s.label} (${s.count})`);
  }
  if (insights.topMoods.length > 0) {
    lines.push("");
    lines.push("Most common moods:");
    for (const m of insights.topMoods) lines.push(`- ${m.label} (${m.count})`);
  }
  lines.push("");
  lines.push("These are personal patterns, not a medical diagnosis.");
  return lines.join("\n");
}
