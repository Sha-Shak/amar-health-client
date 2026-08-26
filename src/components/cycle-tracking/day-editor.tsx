"use client";

import { cycleTrackingApi } from "@/features/cycle-tracking/api";
import {
  ENERGY_LEVELS,
  FLOW_LEVELS,
  MOODS,
  SYMPTOMS,
  type CycleLog,
  type EnergyLevel,
  type FlowLevel,
} from "@/features/cycle-tracking/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Remounted (via `key={date}` from the parent) whenever the selected date
// changes, so its local draft state always starts fresh from that day's
// existing log — no effect needed to resync state when the date prop changes.
export function DayEditor({ date, log, monthKey }: { date: Date; log: CycleLog | undefined; monthKey: string }) {
  const queryClient = useQueryClient();
  const dateStr = format(date, "yyyy-MM-dd");

  const [isPeriodDay, setIsPeriodDay] = useState(log?.isPeriodDay ?? false);
  const [flow, setFlow] = useState<FlowLevel | undefined>(log?.flow);
  const [symptoms, setSymptoms] = useState<string[]>(log?.symptoms ?? []);
  const [mood, setMood] = useState<string | undefined>(log?.mood);
  const [painLevel, setPainLevel] = useState<number | undefined>(log?.painLevel);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | undefined>(log?.energyLevel);
  const [notes, setNotes] = useState(log?.notes ?? "");

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["cycle-logs", monthKey] });
    queryClient.invalidateQueries({ queryKey: ["cycle-summary"] });
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      cycleTrackingApi.upsertLog(dateStr, {
        isPeriodDay,
        flow: isPeriodDay ? flow : undefined,
        symptoms,
        mood,
        painLevel,
        energyLevel,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      invalidate();
      toast.success(`Saved ${format(date, "MMM d")}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => cycleTrackingApi.deleteLog(dateStr),
    onSuccess: () => {
      invalidate();
      setIsPeriodDay(false);
      setFlow(undefined);
      setSymptoms([]);
      setMood(undefined);
      setPainLevel(undefined);
      setEnergyLevel(undefined);
      setNotes("");
      toast("Cleared this day");
    },
  });

  function toggleSymptom(s: string) {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  return (
    <div className="glass-panel-rose space-y-5 p-5">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-ink-900">{format(date, "EEEE, MMM d")}</p>
        {log && (
          <button
            type="button"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            aria-label="Clear this day's log"
            className="tap-target rounded-full text-ink-500 hover:text-rose-600"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsPeriodDay((v) => !v)}
        className={`flex w-full items-center justify-between rounded-[var(--radius-sm)] px-4 py-3 text-sm font-semibold transition-colors ${
          isPeriodDay ? "bg-rose-500 text-white" : "bg-surface-60 text-ink-700"
        }`}
      >
        Period day
        <span
          className={`h-5 w-5 rounded-full border-2 ${isPeriodDay ? "border-white bg-white/30" : "border-ink-500/30"}`}
        />
      </button>

      {isPeriodDay && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-ink-700">Flow</p>
          <div className="flex gap-2">
            {FLOW_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFlow(level)}
                className={`tap-target flex-1 rounded-[var(--radius-pill)] px-2 text-xs font-medium capitalize ${
                  flow === level ? "bg-rose-500 text-white" : "bg-surface-60 text-ink-700"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-ink-700">Symptoms</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSymptom(s)}
              className={`tap-target rounded-[var(--radius-pill)] px-3 text-sm font-medium ${
                symptoms.includes(s) ? "bg-primary-600 text-white" : "bg-surface-60 text-ink-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-ink-700">Mood</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood((prev) => (prev === m ? undefined : m))}
              className={`tap-target rounded-[var(--radius-pill)] px-3 text-sm font-medium ${
                mood === m ? "bg-primary-600 text-white" : "bg-surface-60 text-ink-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="cycle-pain" className="text-sm font-medium text-ink-700">
            Pain level
          </label>
          <span className="text-sm font-semibold text-rose-600">
            {painLevel != null ? painLevel : "—"}
          </span>
        </div>
        <input
          id="cycle-pain"
          type="range"
          min={0}
          max={10}
          step={1}
          value={painLevel ?? 0}
          onChange={(e) => setPainLevel(Number(e.target.value))}
          className="w-full accent-rose-500"
        />
        <div className="flex justify-between text-xs text-ink-500">
          <span>No pain</span>
          <span>Severe</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-ink-700">Energy</p>
        <div className="flex gap-2">
          {ENERGY_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setEnergyLevel((prev) => (prev === level ? undefined : level))}
              className={`tap-target flex-1 rounded-[var(--radius-pill)] px-2 text-sm font-medium capitalize ${
                energyLevel === level ? "bg-primary-600 text-white" : "bg-surface-60 text-ink-700"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="cycle-notes" className="text-sm font-medium text-ink-700">
          Notes (optional)
        </label>
        <textarea
          id="cycle-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-[var(--radius-sm)] border border-primary-400/30 bg-surface-70 px-4 py-3 text-ink-900 outline-none focus:border-primary-600/40 focus:ring-2 focus:ring-primary-600/30"
        />
      </div>

      <button
        type="button"
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="tap-target w-full rounded-[var(--radius-pill)] bg-rose-500 font-semibold text-white disabled:opacity-60"
      >
        {saveMutation.isPending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
