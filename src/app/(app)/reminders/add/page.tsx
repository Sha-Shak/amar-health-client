"use client";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { DoctorAutocomplete } from "@/components/reminders/doctor-autocomplete";
import { DoseScheduleStepper } from "@/components/reminders/dose-schedule-stepper";
import { remindersApi, type CreateReminderInput } from "@/features/reminders/api";
import {
  NOTIFY_BEFORE_OPTIONS,
  WEEKDAYS,
  notifyBeforeLabel,
  type DoseSchedule,
  type MealTiming,
  type ReminderType,
  type RepeatPattern,
} from "@/features/reminders/types";
import { errorMessage } from "@/lib/error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, ChevronLeft, Pill, Repeat } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// CalendarClock, not Stethoscope — Stethoscope's glyph isn't drawn centered in
// its own viewBox (unlike Pill/Repeat), so it visibly sat off-center in the
// icon circle even though the circle itself was centered correctly.
const TYPE_OPTIONS: { value: ReminderType; label: string; icon: typeof Pill; description: string }[] = [
  { value: "medicine", label: "Medicine", icon: Pill, description: "Doses with meal timing" },
  { value: "habit", label: "Habit", icon: Repeat, description: "Daily or weekly routine" },
  { value: "appointment", label: "Appointment", icon: CalendarClock, description: "A doctor visit" },
];

export default function AddReminderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [type, setType] = useState<ReminderType | null>(null);

  const [title, setTitle] = useState("");
  const [notifyBeforeMinutes, setNotifyBeforeMinutes] = useState(10);

  // medicine
  const [dosage, setDosage] = useState("");
  const [doseSchedule, setDoseSchedule] = useState<DoseSchedule>({ morning: 1, afternoon: 0, night: 1 });
  const [mealTiming, setMealTiming] = useState<MealTiming>("after_meal");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [durationDays, setDurationDays] = useState("5");
  const [ongoing, setOngoing] = useState(false);

  // habit
  const [repeatPattern, setRepeatPattern] = useState<RepeatPattern>("daily");
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [time, setTime] = useState("09:00");

  // appointment
  const [doctorName, setDoctorName] = useState("");
  const [doctorId, setDoctorId] = useState<string | undefined>();
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");

  const createMutation = useMutation({
    mutationFn: (input: CreateReminderInput) => remindersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      router.replace("/reminders");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) return;

    if (type === "medicine") {
      createMutation.mutate({
        type: "medicine",
        title,
        notifyBeforeMinutes,
        dosage,
        doseSchedule,
        mealTiming,
        startDate,
        durationDays: ongoing ? "ongoing" : Number(durationDays),
      });
    } else if (type === "habit") {
      createMutation.mutate({
        type: "habit",
        title,
        notifyBeforeMinutes,
        repeatPattern,
        daysOfWeek: repeatPattern === "daily" ? undefined : daysOfWeek,
        time,
      });
    } else {
      createMutation.mutate({
        type: "appointment",
        title,
        notifyBeforeMinutes,
        doctorId,
        doctorName: doctorName || undefined,
        dateTime: new Date(dateTime).toISOString(),
        location: location || undefined,
      });
    }
  }

  if (!type) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-6">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="tap-target -ml-2 self-start rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="mb-1 mt-4 text-2xl font-bold">New reminder</h1>
        <p className="mb-6 text-ink-700">What would you like to be reminded about?</p>
        <div className="space-y-3">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className="glass-panel tap-target flex w-full items-center justify-start gap-4 px-5 py-4 text-left"
            >
              <span className="tap-target rounded-full bg-primary-50 text-primary-700">
                <opt.icon size={20} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold">{opt.label}</span>
                <span className="block text-sm text-ink-500">{opt.description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-6">
      <button
        type="button"
        onClick={() => setType(null)}
        aria-label="Go back"
        className="tap-target -ml-2 self-start rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>

      <h1 className="mb-6 mt-4 text-2xl font-bold">
        New {TYPE_OPTIONS.find((o) => o.value === type)?.label.toLowerCase()} reminder
      </h1>

      <form onSubmit={handleSubmit} className="glass-panel space-y-5 p-6">
        <TextField label="Title" name="title" required value={title} onChange={(e) => setTitle(e.target.value)} />

        {type === "medicine" && (
          <>
            <TextField
              label="Dosage"
              name="dosage"
              placeholder="e.g. 1 tablet"
              required
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
            <DoseScheduleStepper value={doseSchedule} onChange={setDoseSchedule} />
            <SelectField
              label="Meal timing"
              value={mealTiming}
              onChange={(v) => setMealTiming(v as MealTiming)}
              options={[
                { value: "before_meal", label: "Before meal" },
                { value: "after_meal", label: "After meal" },
                { value: "with_meal", label: "With meal" },
                { value: "none", label: "No meal restriction" },
              ]}
            />
            <TextField
              label="Start date"
              name="startDate"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <TextField
                  label="Duration (days)"
                  name="durationDays"
                  type="number"
                  min={1}
                  disabled={ongoing}
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 pb-3 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={ongoing}
                  onChange={(e) => setOngoing(e.target.checked)}
                  className="h-4 w-4 accent-primary-600"
                />
                Ongoing
              </label>
            </div>
          </>
        )}

        {type === "habit" && (
          <>
            <SelectField
              label="Repeats"
              value={repeatPattern}
              onChange={(v) => setRepeatPattern(v as RepeatPattern)}
              options={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Specific days" },
              ]}
            />
            {repeatPattern !== "daily" && (
              <div>
                <p className="mb-2 text-sm font-medium text-ink-700">Days</p>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => {
                    const active = daysOfWeek.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setDaysOfWeek((prev) =>
                            active ? prev.filter((d) => d !== day) : [...prev, day]
                          )
                        }
                        className={`tap-target rounded-[var(--radius-pill)] px-3 text-sm font-medium ${
                          active ? "bg-primary-600 text-white" : "bg-white/60 text-ink-700"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <TextField
              label="Time"
              name="time"
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </>
        )}

        {type === "appointment" && (
          <>
            <DoctorAutocomplete
              name={doctorName}
              doctorId={doctorId}
              onChange={({ name, doctorId }) => {
                setDoctorName(name);
                setDoctorId(doctorId);
              }}
            />
            <TextField
              label="Date & time"
              name="dateTime"
              type="datetime-local"
              required
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
            <TextField
              label="Location (optional)"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </>
        )}

        <SelectField
          label="Notify me"
          value={String(notifyBeforeMinutes)}
          onChange={(v) => setNotifyBeforeMinutes(Number(v))}
          options={NOTIFY_BEFORE_OPTIONS.map((m) => ({ value: String(m), label: notifyBeforeLabel(m) }))}
        />

        {createMutation.isError && (
          <p className="text-sm text-coral-600">{errorMessage(createMutation.error)}</p>
        )}

        <Button type="submit" className="w-full" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Saving…" : "Save reminder"}
        </Button>
      </form>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-ink-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[var(--radius-sm)] border border-black/5 bg-white/70 px-4 py-3 text-ink-900 outline-none focus:border-primary-600/40 focus:ring-2 focus:ring-primary-600/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
