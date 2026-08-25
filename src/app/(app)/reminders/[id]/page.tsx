"use client";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { DoseScheduleStepper } from "@/components/reminders/dose-schedule-stepper";
import { remindersApi } from "@/features/reminders/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronLeft, Clock3 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ReminderDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = useParams<{ id: string }>().id;
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const { data: reminder, isLoading } = useQuery({
    queryKey: ["reminders", "detail", id],
    queryFn: () => remindersApi.get(id),
  });

  const [title, setTitle] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [dosage, setDosage] = useState("");
  const [doseSchedule, setDoseSchedule] = useState({ morning: 0, afternoon: 0, night: 0 });

  if (reminder && !initialized) {
    setTitle(reminder.title);
    if (reminder.type === "medicine") {
      setDosage(reminder.dosage);
      setDoseSchedule(reminder.doseSchedule);
    }
    setInitialized(true);
  }

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["reminders"] });
  }

  const updateMutation = useMutation({
    mutationFn: () => {
      const patch: Record<string, unknown> = { title };
      if (reminder?.type === "medicine") {
        patch.dosage = dosage;
      }
      return remindersApi.update(id, patch);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["reminders", "detail", id], updated);
      invalidateAll();
      toast.success("Reminder updated");
    },
    onError: () => toast.error("Couldn't save changes"),
  });

  const snoozeMutation = useMutation({
    mutationFn: (minutes: number) => remindersApi.snooze(id, minutes),
    onSuccess: (updated) => {
      queryClient.setQueryData(["reminders", "detail", id], updated);
      invalidateAll();
      toast.success("Snoozed");
    },
    onError: () => toast.error("Couldn't snooze — it may not be active right now"),
  });

  const cancelMutation = useMutation({
    mutationFn: () => remindersApi.cancel(id),
    onSuccess: () => {
      invalidateAll();
      toast.success("Reminder cancelled");
      router.replace("/reminders");
    },
    onError: () => toast.error("Couldn't cancel that reminder"),
  });

  if (isLoading || !reminder) {
    return <div className="flex flex-1 items-center justify-center text-ink-700">Loading…</div>;
  }

  const isMedicineGroup = reminder.type === "medicine" && reminder.groupId;

  return (
    <div className="mx-auto w-full max-w-sm flex-1 px-6 py-6">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="tap-target -ml-2 mb-4 rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>

      <h1 className="mb-1 text-2xl font-bold capitalize">{reminder.type} reminder</h1>
      {reminder.nextFireAt && (
        <p className="mb-5 text-sm text-ink-500">
          Next: {format(new Date(reminder.nextFireAt), "MMM d, h:mm a")}
        </p>
      )}

      {isMedicineGroup && (
        <p className="mb-4 rounded-[var(--radius-sm)] bg-primary-50 px-4 py-3 text-sm text-primary-800">
          This medicine has multiple daily doses. Editing here only changes this time slot.
        </p>
      )}

      <div className="glass-panel space-y-5 p-6">
        <TextField label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} />

        {reminder.type === "medicine" && (
          <>
            <TextField label="Dosage" name="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} />
            <DoseScheduleStepper value={doseSchedule} onChange={setDoseSchedule} />
            <p className="text-xs text-ink-500">
              The dose schedule shown here reflects the whole prescription; only this slot&apos;s timing is
              edited by saving.
            </p>
          </>
        )}

        {updateMutation.isError && (
          <p className="text-sm text-coral-600">{errorMessage(updateMutation.error)}</p>
        )}

        <Button
          className="w-full"
          disabled={updateMutation.isPending || reminder.status !== "active"}
          onClick={() => updateMutation.mutate()}
        >
          {updateMutation.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>

      {reminder.status === "active" && (
        <div className="mt-4 flex gap-2">
          {[15, 60].map((minutes) => (
            <Button
              key={minutes}
              variant="glass"
              className="flex-1"
              disabled={snoozeMutation.isPending}
              onClick={() => snoozeMutation.mutate(minutes)}
            >
              <Clock3 size={16} className="mr-1.5 inline" aria-hidden="true" />
              Snooze {minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}
            </Button>
          ))}
        </div>
      )}

      {reminder.status !== "cancelled" && (
        <div className="mt-6">
          {!confirmingCancel ? (
            <button
              type="button"
              onClick={() => setConfirmingCancel(true)}
              className="tap-target w-full text-center text-sm font-medium text-coral-600"
            >
              Cancel this reminder
            </button>
          ) : (
            <div className="glass-panel space-y-3 p-4 text-center">
              <p className="text-sm font-medium">Cancel this reminder?</p>
              <div className="flex gap-3">
                <Button variant="glass" className="flex-1" onClick={() => setConfirmingCancel(false)}>
                  Keep it
                </Button>
                <Button
                  className="flex-1 !bg-coral-600"
                  disabled={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate()}
                >
                  {cancelMutation.isPending ? "Cancelling…" : "Cancel it"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
