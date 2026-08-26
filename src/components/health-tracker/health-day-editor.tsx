"use client";

import { healthTrackerApi } from "@/features/health-tracker/api";
import { MOOD_EMOJIS, STRESS_EMOJIS, type HealthLog, type MetricType } from "@/features/health-tracker/types";
import { errorMessage } from "@/lib/error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Step = { key: string; node: React.ReactNode };

// Remounted via `key={date}` from the parent (same pattern as the Cycle
// Tracker's DayEditor) so local draft state — including which step the
// wizard is on — always starts fresh from that day's existing log, no
// resync effect needed.
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
  const [waterLiters, setWaterLiters] = useState(log?.waterLiters ?? 0);
  const [exerciseMinutes, setExerciseMinutes] = useState(log?.exerciseMinutes ?? 0);
  const [screenTimeHours, setScreenTimeHours] = useState(log?.screenTimeHours ?? 0);
  const [notes, setNotes] = useState(log?.notes ?? "");
  const [stepIndex, setStepIndex] = useState(0);

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
        waterLiters: has("water") ? waterLiters : undefined,
        exerciseMinutes: has("exercise") ? exerciseMinutes : undefined,
        screenTimeHours: has("screen_time") ? screenTimeHours : undefined,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      invalidate();
      toast.success(`Saved ${format(date, "MMM d")}`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => healthTrackerApi.deleteLog(dateStr),
    onSuccess: () => {
      invalidate();
      toast("Cleared this day");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const steps: Step[] = [
    has("mood") && {
      key: "mood",
      node: <EmojiScale label="How's your mood?" emojis={MOOD_EMOJIS} value={mood} onChange={setMood} />,
    },
    has("stress") && {
      key: "stress",
      node: <EmojiScale label="How stressed are you?" emojis={STRESS_EMOJIS} value={stress} onChange={setStress} />,
    },
    has("weight") && {
      key: "weight",
      node: <NumberField label="Weight" unit="kg" value={weightKg} onChange={setWeightKg} step="0.1" />,
    },
    has("blood_pressure") && {
      key: "blood_pressure",
      node: (
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
      ),
    },
    has("blood_glucose") && {
      key: "blood_glucose",
      node: <NumberField label="Blood glucose" unit="mg/dL" value={bloodGlucose} onChange={setBloodGlucose} />,
    },
    has("heart_rate") && {
      key: "heart_rate",
      node: <NumberField label="Heart rate" unit="bpm" value={heartRate} onChange={setHeartRate} />,
    },
    has("sleep") && {
      key: "sleep",
      node: <NumberField label="Sleep" unit="hrs" value={sleepHours} onChange={setSleepHours} step="0.5" />,
    },
    has("water") && {
      key: "water",
      node: (
        <SliderField label="Water" unit="L" value={waterLiters} onChange={setWaterLiters} min={0} max={6} step={0.25} />
      ),
    },
    has("exercise") && {
      key: "exercise",
      node: (
        <SliderField
          label="Exercise"
          unit="min"
          value={exerciseMinutes}
          onChange={setExerciseMinutes}
          min={0}
          max={180}
          step={5}
        />
      ),
    },
    has("screen_time") && {
      key: "screen_time",
      node: (
        <SliderField
          label="Screen time"
          unit="hrs"
          value={screenTimeHours}
          onChange={setScreenTimeHours}
          min={0}
          max={16}
          step={0.5}
        />
      ),
    },
    {
      key: "notes",
      node: (
        <div className="space-y-1.5">
          <label htmlFor="health-notes" className="text-sm font-medium text-ink-700">
            Anything else? (optional)
          </label>
          <textarea
            id="health-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            autoFocus
            className="w-full rounded-[var(--radius-sm)] border border-primary-400/30 bg-surface-70 px-4 py-3 text-ink-900 outline-none focus:border-primary-600/40 focus:ring-2 focus:ring-primary-600/30"
          />
        </div>
      ),
    },
  ].filter(Boolean) as Step[];

  const clampedIndex = Math.min(stepIndex, steps.length - 1);
  const isLastStep = clampedIndex === steps.length - 1;
  const remaining = steps.length - 1 - clampedIndex;

  function goNext() {
    if (isLastStep) {
      saveMutation.mutate();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <div className="glass-panel space-y-5 overflow-hidden p-5">
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

      {/* Progress dots double as a jump-to-step control — tapping one skips
          straight there, which matters once there are 8+ steps and someone
          wants to fix an earlier answer without stepping back through all
          of them. */}
      <div className="flex items-center justify-center gap-1.5">
        {steps.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStepIndex(i)}
            aria-label={`Go to step ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === clampedIndex ? "w-6 bg-primary-600" : "w-1.5 bg-primary-600/25"
            }`}
          />
        ))}
      </div>
      <p className="-mt-3 text-center text-xs text-ink-500">
        {remaining === 0 ? "Last one" : `${remaining} more after this`}
      </p>

      {/* key={clampedIndex} gives each step a quick fade/slide-in so moving
          through the wizard has some motion to it instead of an abrupt
          content swap. */}
      <div key={clampedIndex} className="animate-stagger-in" style={{ minHeight: "6rem" }}>
        {steps[clampedIndex]?.node}
      </div>

      {saveMutation.isError && (
        <p className="text-sm text-coral-600">{errorMessage(saveMutation.error)}</p>
      )}
      {deleteMutation.isError && (
        <p className="text-sm text-coral-600">{errorMessage(deleteMutation.error)}</p>
      )}

      <div className="flex items-center gap-2">
        {clampedIndex > 0 && (
          <button
            type="button"
            onClick={goBack}
            aria-label="Previous"
            className="tap-target rounded-full bg-surface-60 text-ink-700"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={goNext}
          disabled={saveMutation.isPending}
          className="tap-target flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-pill)] bg-primary-600 font-semibold text-white disabled:opacity-60"
        >
          {isLastStep ? (
            saveMutation.isPending ? (
              "Saving…"
            ) : (
              "Save"
            )
          ) : (
            <>
              Next
              <ChevronRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
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
          className="h-2 w-full accent-primary-600"
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
        autoFocus
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
  compact = false,
}: {
  label: string;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  compact?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className={compact ? "text-ink-700" : "font-medium text-ink-700"}>{label}</span>
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
        aria-label={label}
        className="w-full accent-primary-600"
      />
    </div>
  );
}
