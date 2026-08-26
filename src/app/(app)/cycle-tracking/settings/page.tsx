"use client";

import { cycleTrackingApi } from "@/features/cycle-tracking/api";
import type { CycleSettings } from "@/features/cycle-tracking/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CycleSettingsPage() {
  const router = useRouter();

  const settingsQuery = useQuery({
    queryKey: ["cycle-settings"],
    queryFn: cycleTrackingApi.getSettings,
  });

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-6">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="tap-target -ml-2 mb-2 rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <h1 className="mb-1 text-2xl font-bold">Cycle settings</h1>
      <p className="mb-6 text-ink-700">
        These averages seed predictions until enough real history is logged — they update
        automatically from your logs after that.
      </p>

      {settingsQuery.data && <SettingsForm initial={settingsQuery.data} />}
    </div>
  );
}

// Only mounted once settingsQuery.data exists (see above), so the form's
// local draft state can initialize straight from props — no effect needed
// to resync it once the query resolves.
function SettingsForm({ initial }: { initial: CycleSettings }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [avgCycleLength, setAvgCycleLength] = useState(initial.avgCycleLength);
  const [avgPeriodLength, setAvgPeriodLength] = useState(initial.avgPeriodLength);

  const saveMutation = useMutation({
    mutationFn: () => cycleTrackingApi.updateSettings({ avgCycleLength, avgPeriodLength }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycle-settings"] });
      queryClient.invalidateQueries({ queryKey: ["cycle-summary"] });
      toast.success("Saved");
      router.back();
    },
  });

  return (
    <div className="glass-panel-rose space-y-5 p-6">
      <NumberStepper
        label="Average cycle length"
        unit="days"
        value={avgCycleLength}
        min={15}
        max={60}
        onChange={setAvgCycleLength}
      />
      <NumberStepper
        label="Average period length"
        unit="days"
        value={avgPeriodLength}
        min={1}
        max={14}
        onChange={setAvgPeriodLength}
      />
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

function NumberStepper({
  label,
  unit,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink-700">{label}</p>
      <div className="flex items-center justify-between rounded-[var(--radius-sm)] bg-surface-60 px-4 py-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Decrease ${label}`}
          className="tap-target rounded-full bg-surface-70 text-lg font-bold text-ink-700"
        >
          −
        </button>
        <span className="font-semibold text-ink-900">
          {value} {unit}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`Increase ${label}`}
          className="tap-target rounded-full bg-surface-70 text-lg font-bold text-ink-700"
        >
          +
        </button>
      </div>
    </div>
  );
}
