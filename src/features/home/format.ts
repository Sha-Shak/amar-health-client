import type { Reminder } from "./types";

export function reminderSubtitle(reminder: Reminder): string {
  if (reminder.type === "medicine") return reminder.dosage;
  if (reminder.type === "habit") return formatTime(reminder.time);
  return reminder.doctorName ?? reminder.location ?? "Appointment";
}

export function reminderTime(reminder: Reminder): string {
  if (!reminder.nextFireAt) return "";
  const date = new Date(reminder.nextFireAt);
  const diffMs = date.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin <= 0 && diffMin > -30) return "Now";
  if (diffMin < 0) return "Overdue";
  if (diffMin < 60) return `In ${diffMin}m`;

  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
