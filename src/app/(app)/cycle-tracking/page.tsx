"use client";

import { CycleCalendar, monthKey } from "@/components/cycle-tracking/cycle-calendar";
import { DayEditor } from "@/components/cycle-tracking/day-editor";
import { cycleTrackingApi } from "@/features/cycle-tracking/api";
import { phaseLabel } from "@/features/cycle-tracking/types";
import { useQuery } from "@tanstack/react-query";
import { eachDayOfInterval, endOfMonth, format, isToday, parseISO, startOfMonth } from "date-fns";
import { CalendarHeart, ChevronLeft, Droplets, Settings2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CycleTrackingPage() {
  const router = useRouter();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const monthStr = monthKey(month);

  const summaryQuery = useQuery({
    queryKey: ["cycle-summary"],
    queryFn: cycleTrackingApi.getSummary,
  });

  const logsQuery = useQuery({
    queryKey: ["cycle-logs", monthStr],
    queryFn: () =>
      cycleTrackingApi.listLogs(
        format(startOfMonth(month), "yyyy-MM-dd"),
        format(endOfMonth(month), "yyyy-MM-dd"),
      ),
  });

  const summary = summaryQuery.data;
  const logs = logsQuery.data ?? [];
  const selectedLog = logs.find((l) => l.date === selectedDateStr);

  const periodDates = logs.filter((l) => l.isPeriodDay).map((l) => parseISO(l.date));
  const loggedDates = logs
    .filter((l) => !l.isPeriodDay && (l.symptoms?.length || l.mood || l.notes))
    .map((l) => parseISO(l.date));

  const predictedPeriodDates =
    summary?.predictedNextPeriodStart && summary.predictedPeriodEnd
      ? eachDayOfInterval({
          start: parseISO(summary.predictedNextPeriodStart),
          end: parseISO(summary.predictedPeriodEnd),
        })
      : [];
  const fertileDates =
    summary?.fertileWindowStart && summary.fertileWindowEnd
      ? eachDayOfInterval({
          start: parseISO(summary.fertileWindowStart),
          end: parseISO(summary.fertileWindowEnd),
        })
      : [];
  const ovulationDates = summary?.ovulationDate ? [parseISO(summary.ovulationDate)] : [];

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
          <CalendarHeart size={20} className="text-rose-600" aria-hidden="true" />
          Cycle Tracker
        </h1>
        <Link
          href="/cycle-tracking/settings"
          aria-label="Cycle settings"
          className="tap-target -mr-2 rounded-full text-ink-700"
        >
          <Settings2 size={20} aria-hidden="true" />
        </Link>
      </div>

      <div className="glass-panel-rose mb-5 space-y-3 p-5">
        <div className="flex items-center gap-3">
          <span className="tap-target rounded-full bg-rose-50 text-rose-600">
            <Droplets size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink-900">{phaseLabel(summary?.phase ?? null)}</p>
            {summary?.currentCycleDay != null ? (
              <p className="text-sm text-ink-500">Day {summary.currentCycleDay} of your cycle</p>
            ) : (
              <p className="text-sm text-ink-500">Log a period day to start tracking</p>
            )}
          </div>
        </div>
        {summary?.daysUntilNextPeriod != null && (
          <p className="text-sm text-ink-700">
            {summary.daysUntilNextPeriod > 0
              ? `Period expected in ${summary.daysUntilNextPeriod} day${summary.daysUntilNextPeriod === 1 ? "" : "s"}`
              : summary.daysUntilNextPeriod === 0
                ? "Period expected today"
                : `Period is ${Math.abs(summary.daysUntilNextPeriod)} day${Math.abs(summary.daysUntilNextPeriod) === 1 ? "" : "s"} late`}
          </p>
        )}
        {summary && summary.cyclesLogged > 0 && (
          <div className="flex gap-4 border-t border-rose-500/15 pt-3 text-center text-xs text-ink-500">
            <div className="flex-1">
              <p className="text-base font-bold text-rose-600">{summary.avgCycleLength}</p>
              <p>Avg cycle (days)</p>
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-rose-600">{summary.avgPeriodLength}</p>
              <p>Avg period (days)</p>
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel mb-5 p-4">
        <CycleCalendar
          month={month}
          onMonthChange={setMonth}
          selected={selectedDate}
          onSelect={setSelectedDate}
          periodDates={periodDates}
          predictedPeriodDates={predictedPeriodDates}
          fertileDates={fertileDates}
          ovulationDates={ovulationDates}
          loggedDates={loggedDates}
        />
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-500">
          <Legend swatch="bg-rose-500" label="Period" />
          <Legend swatch="border border-dashed border-rose-400/70" label="Predicted" />
          <Legend swatch="bg-rose-50" label="Fertile" />
          <Legend swatch="border-2 border-rose-500" label="Ovulation" />
        </div>
        {!isToday(selectedDate) && (
          <button
            type="button"
            onClick={() => {
              setSelectedDate(new Date());
              setMonth(startOfMonth(new Date()));
            }}
            className="mt-3 text-sm font-medium text-primary-700"
          >
            Jump to today
          </button>
        )}
      </div>

      <DayEditor key={selectedDateStr} date={selectedDate} log={selectedLog} monthKey={monthStr} />
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${swatch}`} />
      {label}
    </span>
  );
}
