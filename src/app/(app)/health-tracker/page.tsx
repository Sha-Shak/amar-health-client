"use client";

import { HealthCalendar } from "@/components/health-tracker/health-calendar";
import { HealthDayEditor } from "@/components/health-tracker/health-day-editor";
import { TrackerSettingsForm } from "@/components/health-tracker/tracker-settings-form";
import { healthTrackerApi } from "@/features/health-tracker/api";
import { nextDueDate } from "@/features/health-tracker/types";
import { startTour, useAutoTour } from "@/lib/tour";
import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format, isPast, isToday, parseISO, startOfMonth } from "date-fns";
import { BarChart3, ChevronLeft, HeartPulse, HelpCircle, Settings2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function monthKey(date: Date) {
  return format(date, "yyyy-MM");
}

export default function HealthTrackerPage() {
  const router = useRouter();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const monthStr = monthKey(month);

  const settingsQuery = useQuery({
    queryKey: ["health-settings"],
    queryFn: healthTrackerApi.getSettings,
  });

  const insightsQuery = useQuery({
    queryKey: ["health-insights"],
    queryFn: healthTrackerApi.getInsights,
  });

  const logsQuery = useQuery({
    queryKey: ["health-logs", monthStr],
    queryFn: () =>
      healthTrackerApi.listLogs(
        format(startOfMonth(month), "yyyy-MM-dd"),
        format(endOfMonth(month), "yyyy-MM-dd"),
      ),
  });

  const settings = settingsQuery.data;
  const logs = logsQuery.data ?? [];
  const selectedLog = logs.find((l) => l.date === selectedDateStr);

  const goodDates = logs.filter((l) => l.mood != null && l.mood >= 4).map((l) => parseISO(l.date));
  const okDates = logs.filter((l) => l.mood === 3).map((l) => parseISO(l.date));
  const toughDates = logs.filter((l) => l.mood != null && l.mood <= 2).map((l) => parseISO(l.date));
  const neutralLoggedDates = logs.filter((l) => l.mood == null).map((l) => parseISO(l.date));

  const due =
    settings && insightsQuery.data
      ? nextDueDate(insightsQuery.data.latestDate, settings.frequency)
      : null;
  const isDue = !insightsQuery.data?.latestDate || (due && (isPast(due) || isToday(due)));

  const tourSteps = [
      {
        popover: {
          title: "Health Tracker, in short",
          description: "Log the metrics you picked, on the schedule you chose — the calendar shows how you're trending.",
        },
      },
      {
        element: '[data-tour="ht-calendar"]',
        disableActiveInteraction: true,
        popover: {
          title: "Tap any day to log it",
          description: "Colors show how that day went — green for good, amber for okay, coral for tough.",
        },
      },
      {
        element: '[data-tour="ht-insights"]',
        disableActiveInteraction: true,
        popover: {
          title: "Insights",
          description: "Trends across everything you've logged, plus an overall health score once you have enough data.",
        },
      },
      {
        element: '[data-tour="ht-settings"]',
        disableActiveInteraction: true,
        popover: {
          title: "Change anytime",
          description: "Adjust your check-in frequency or which metrics you track here.",
        },
      },
  ];

  useAutoTour("health-tracker-overview", tourSteps, Boolean(settings?.setupComplete));

  return (
    <div className="mx-auto w-full max-w-sm px-5 pb-28 pt-6">
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
          <HeartPulse size={20} className="text-primary-600" aria-hidden="true" />
          Health Tracker
        </h1>
        <div className="-mr-2 flex items-center">
          {settings?.setupComplete && (
            <button
              type="button"
              aria-label="Replay tour"
              onClick={() => startTour("health-tracker-overview", tourSteps)}
              className="tap-target rounded-full text-ink-700"
            >
              <HelpCircle size={20} aria-hidden="true" />
            </button>
          )}
          <Link
            href="/health-tracker/insights"
            aria-label="Health insights"
            data-tour="ht-insights"
            className="tap-target rounded-full text-ink-700"
          >
            <BarChart3 size={20} aria-hidden="true" />
          </Link>
          <Link
            href="/health-tracker/settings"
            aria-label="Health tracker settings"
            data-tour="ht-settings"
            className="tap-target rounded-full text-ink-700"
          >
            <Settings2 size={20} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {settings && !settings.setupComplete ? (
        <div className="space-y-5">
          <div className="glass-panel space-y-1 p-4">
            <p className="font-semibold text-ink-900">Let&apos;s set up your tracking</p>
            <p className="text-sm text-ink-700">
              Pick how often you want to check in and which metrics matter to you — you can always
              change these later in settings.
            </p>
          </div>
          <TrackerSettingsForm initial={settings} submitLabel="Get started" />
        </div>
      ) : (
        <>
          {isDue && settings && (
            <div className="glass-panel mb-5 flex items-center gap-3 p-4">
              <span className="tap-target rounded-full bg-primary-50 text-primary-700">
                <HeartPulse size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-900">Time for your check-in</p>
                <p className="text-sm text-ink-500">
                  {settings.frequency[0].toUpperCase() + settings.frequency.slice(1)} check-ins — log
                  today below
                </p>
              </div>
            </div>
          )}

          <div className="glass-panel mb-5 p-4" data-tour="ht-calendar">
            <HealthCalendar
              month={month}
              onMonthChange={setMonth}
              selected={selectedDate}
              onSelect={setSelectedDate}
              goodDates={goodDates}
              okDates={okDates}
              toughDates={toughDates}
              neutralLoggedDates={neutralLoggedDates}
            />
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-500">
              <Legend swatch="bg-success-500" label="Good day" />
              <Legend swatch="bg-amber-500" label="Okay" />
              <Legend swatch="bg-coral-500" label="Tough" />
              <Legend swatch="bg-primary-600" label="Logged" />
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

          {settings && logsQuery.isFetched && (
            <HealthDayEditor
              key={selectedDateStr}
              date={selectedDate}
              log={selectedLog}
              monthKey={monthStr}
              enabledMetrics={settings.enabledMetrics}
            />
          )}
        </>
      )}
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
