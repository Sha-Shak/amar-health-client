"use client";

import { reminderSubtitle, reminderTime } from "@/features/home/format";
import type { Reminder } from "@/features/reminders/types";
import { Check, Pill, Repeat, Stethoscope } from "lucide-react";
import Link from "next/link";

const ICONS = { medicine: Pill, habit: Repeat, appointment: Stethoscope } as const;

export function ReminderRow({
  reminder,
  onMarkTaken,
  isMarking,
}: {
  reminder: Reminder;
  onMarkTaken: (id: string) => void;
  isMarking: boolean;
}) {
  const Icon = ICONS[reminder.type];
  const isDone = reminder.status === "completed" || reminder.status === "cancelled";

  return (
    <div className="glass-panel flex items-center gap-3 p-4">
      <Link href={`/reminders/${reminder._id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <span className="tap-target shrink-0 rounded-full bg-primary-50 text-primary-700">
          <Icon size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`truncate font-medium ${isDone ? "text-ink-500 line-through" : ""}`}>
            {reminder.title}
          </p>
          <p className="truncate text-sm text-ink-500">{reminderSubtitle(reminder)}</p>
        </div>
        <span className="shrink-0 text-sm text-ink-500">{reminderTime(reminder)}</span>
      </Link>
      {reminder.status === "active" && (
        <button
          type="button"
          onClick={() => onMarkTaken(reminder._id)}
          disabled={isMarking}
          aria-label={`Mark ${reminder.title} as done`}
          className="tap-target shrink-0 rounded-full bg-primary-50 text-primary-700 disabled:opacity-50"
        >
          <Check size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
