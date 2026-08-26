"use client";

import { healthTrackerApi } from "@/features/health-tracker/api";
import { MOOD_EMOJIS, STRESS_EMOJIS, type HealthLog, type MetricType } from "@/features/health-tracker/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Remounted via `key={date}` from the parent (same pattern as the Cycle
// Tracker's DayEditor) so local draft state always starts fresh from that
// day's existing log with no resync effect needed.
export function HealthDayEditor({
  date,
  log,
  monthKey,
  enabledMetrics,
}: {
  date: Date;
  log: HealthLog | undefined;
  monthKey: string;
  enabledMetrics: MetricType[];
}) {
  const queryClient = useQueryClient();
  const dateStr = format(date, "yyyy-MM-dd");
  const has = (m: MetricType) => enabledMetrics.includes(m);

  const [weightKg, setWeightKg] = useState(log?.weightKg?.toString() ?? "");
  const [systolic, setSystolic] = useState(log?.bloodPressureSystolic?.toString() ?? "");
  const [diastolic, setDiastolic] = useState(log?.bloodPressureDiastolic?.toString() ?? "");
  const [bloodGlucose, setBloodGlucose] = useState(log?.bloodGlucose?.toString() ?? "");
  const [heartRate, setHeartRate] = useState(log?.heartRate?.toString() ?? "");
  const [mood, setMood] = useState<number | undefined>(log?.mood);
  const [stress, setStress] = useState<number | undefined>(log?.stress);
  const [sleepHours, setSleepHours] = useState(log?.sleepHours?.toString() ?? "");
  const [waterGlasses, setWaterGlasses] = useState(log?.waterGlasses ?? 0);
  const [screenWork, setScreenWork] = useState(log?.screenTimeWorkMinutes ?? 0);
  const [screenFun, setScreenFun] = useState(log?.screenTimeEntertainmentMinutes ?? 0);
  const [screenScroll, setScreenScroll] = useState(log?.screenTimeScrollingMinutes ?? 0);
  const [notes, setNotes] = useState(log?.notes ?? "");

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["health-logs", monthKey] });
    queryClient.invalidateQueries({ queryKey: ["health-insights"] });
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      healthTrackerApi.upsertLog(dateStr, {
        weightKg: weightKg ? Number(weightKg) : undefined,
        bloodPressureSystolic: systolic ? Number(systolic) : undefined,
        bloodPressureDiastolic: diastolic ? Number(diastolic) : undefined,
        bloodGlucose: bloodGlucose ? Number(bloodGlucose) : undefined,
        heartRate: heartRate ? Number(heartRate) : undefined,
        mood,
        stress,
        sleepHours: sleepHours ? Number(sleepHours) : undefined,
        waterGlasses: has("water") ? waterGlasses : undefined,
        screenTimeWorkMinutes: has("screen_time") ? screenWork : undefined,
        screenTimeEntertainmentMinutes: has("screen_time") ? screenFun : undefined,
        screenTimeScrollingMinutes: has("screen_time") ? screenScroll : undefined,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      invalidate();
      toast.success(`Saved ${format(date, "MMM d")}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => healthTrackerApi.deleteLog(dateStr),
    onSuccess: () => {
      invalidate();
      toast("Cleared this day");
    },
  });

  return (
    <div className="glass-panel space-y-5 p-5">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-ink-900">{format(date, "EEEE, MMM d")}</p>
        {log && (
          <button
            type="button"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            aria-label="Clear this day's log"
            className="tap-target rounded-full text-ink-500 hover:text-coral-600"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {has("mood") && (
        <EmojiScale label="Mood" emojis={MOOD_EMOJIS} value={mood} onChange={setMood} />
      )}
      {has("stress") && (
        <EmojiScale label="Stress" emojis={STRESS_EMOJIS} value={stress} onChange={setStress} />
      )}

      {has("weight") && (
        <NumberField label="Weight" unit="kg" value={weightKg} onChange={setWeightKg} step="0.1" />
      )}

      {has("blood_pressure") && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-ink-700">Blood pressure (mmHg)</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Systolic"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-primary-400/30 bg-surface-70 px-4 py-3 text-ink-900 outline-none focus:border-primary-600/40 focus:ring-2 focus:ring-primary-600/30"
            />
            <span className="text-ink-500">/</span>
            <input
              type="number"
              placeholder="Diastolic"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-primary-400/30 bg-surface-70 px-4 py-3 text-ink-900 outline-none focus:border-primary-600/40 focus:ring-2 focus:ring-primary-600/30"
            />
          </div>
        </div>
      )}

      {has("blood_glucose") && (
        <NumberField label="Blood glucose" unit="mg/dL" value={bloodGlucose} onChange={setBloodGlucose} />
      )}

      {has("heart_rate") && (
        <NumberField label="Heart rate" unit="bpm" value={heartRate} onChange={setHeartRate} />
      )}

      {has("sleep") && (
        <NumberField label="Sleep" unit="hrs" value={sleepHours} onChange={setSleepHours} step="0.5" />
      )}

      {has("water") && (
        <SliderField label="Water" unit="glasses" value={waterGlasses} onChange={setWaterGlasses} min={0} max={15} />
      )}

      {has("screen_time") && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink-700">Screen time (minutes)</p>
          <SliderField label="Work" value={screenWork} onChange={setScreenWork} min={0} max={600} step={15} />
          <SliderField label="Entertainment" value={screenFun} onChange={setScreenFun} min={0} max={600} step={15} />
          <SliderField label="Doomscrolling" value={screenScroll} onChange={setScreenScroll} min={0} max={600} step={15} />
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="health-notes" className="text-sm font-medium text-ink-700">
          Notes (optional)
        </label>
        <textarea
          id="health-notes"
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
        className="tap-target w-full rounded-[var(--radius-pill)] bg-primary-600 font-semibold text-white disabled:opacity-60"
      >
        {saveMutation.isPending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

function EmojiScale({
  label,
  emojis,
  value,
  onChange,
}: {
  label: string;
  emojis: readonly string[];
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  const level = value ?? Math.ceil(emojis.length / 2);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-700">{label}</p>
        <span className="text-3xl leading-none transition-transform duration-150" key={level}>
          {emojis[level - 1]}
        </span>
      </div>
      <div>
        <input
          type="range"
          min={1}
          max={emojis.length}
          step={1}
          value={level}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className="h-2 w-full appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-primary-600"
          style={{
            background: "linear-gradient(to right, var(--color-coral-500), var(--color-amber-500), var(--color-success-500))",
          }}
        />
        {value == null && <p className="mt-1 text-xs text-ink-500">Drag to set</p>}
      </div>
    </div>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  step,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-ink-700">
        {label} {unit && <span className="text-ink-500">({unit})</span>}
      </label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[var(--radius-sm)] border border-primary-400/30 bg-surface-70 px-4 py-3 text-ink-900 outline-none focus:border-primary-600/40 focus:ring-2 focus:ring-primary-600/30"
      />
    </div>
  );
}

function SliderField({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink-700">{label}</span>
        <span className="font-semibold text-primary-700">
          {value}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary-600"
      />
    </div>
  );
}
