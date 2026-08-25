"use client";

import { ReminderRow } from "@/components/reminders/reminder-row";
import { remindersApi } from "@/features/reminders/api";
import type { Reminder } from "@/features/reminders/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TABS = [
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
] as const;

export default function RemindersPage() {
  const [range, setRange] = useState<"today" | "upcoming">("today");
  const queryClient = useQueryClient();

  const remindersQuery = useQuery({
    queryKey: ["reminders", "list", range],
    queryFn: () => remindersApi.list({ range }),
  });

  const markTakenMutation = useMutation({
    mutationFn: remindersApi.markTaken,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["reminders", "list", range] });
      const previous = queryClient.getQueryData<{ items: Reminder[]; nextCursor: string | null }>([
        "reminders",
        "list",
        range,
      ]);
      queryClient.setQueryData(["reminders", "list", range], (current: typeof previous) =>
        current
          ? { ...current, items: current.items.filter((r) => r._id !== id) }
          : current
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(["reminders", "list", range], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["reminders", "today"] });
    },
  });

  const reminders = remindersQuery.data?.items ?? [];

  return (
    <div className="relative flex-1">
      <div className="mx-auto w-full max-w-sm px-5 pt-8">
        <h1 className="mb-4 text-2xl font-bold">Reminders</h1>

        <div className="glass-panel mb-4 flex gap-1 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setRange(tab.value)}
              className={`flex-1 rounded-[var(--radius-pill)] px-2 py-2 text-sm font-semibold transition-colors ${
                range === tab.value ? "bg-primary-600 text-white" : "text-ink-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {remindersQuery.isLoading && (
          <p className="py-12 text-center text-sm text-ink-500">Loading…</p>
        )}

        {!remindersQuery.isLoading && reminders.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Bell size={28} className="text-ink-500" aria-hidden="true" />
            <p className="text-sm text-ink-500">
              {range === "today" ? "Nothing due today." : "No upcoming reminders."}
            </p>
          </div>
        )}

        <div className="space-y-2 pb-24">
          {reminders.map((reminder) => (
            <ReminderRow
              key={reminder._id}
              reminder={reminder}
              onMarkTaken={markTakenMutation.mutate}
              isMarking={markTakenMutation.isPending}
            />
          ))}
        </div>
      </div>

      <Link
        href="/reminders/add"
        aria-label="Add reminder"
        className="tap-target fixed bottom-28 right-5 z-30 h-14 w-14 rounded-full bg-primary-600 text-white shadow-[0_12px_28px_-8px_rgb(13_148_136/0.7)]"
      >
        <Plus size={24} className="mx-auto" aria-hidden="true" />
      </Link>
    </div>
  );
}
