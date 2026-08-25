"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Switch } from "@/components/ui/switch";
import { authApi } from "@/features/auth/api";
import type { NotificationPreferences } from "@/features/auth/types";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const DEFAULT_PREFS: NotificationPreferences = {
  reminderAlerts: true,
  bookingUpdates: true,
  familyAlerts: true,
  productUpdates: false,
};

const ROWS: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  { key: "reminderAlerts", label: "Reminder alerts", description: "Medicine, habit, and appointment reminders" },
  { key: "bookingUpdates", label: "Booking updates", description: "Confirmations and changes to your bookings" },
  { key: "familyAlerts", label: "Family alerts", description: "Activity from people in your family group" },
  { key: "productUpdates", label: "Product updates", description: "New features and occasional announcements" },
];

export default function NotificationsPage() {
  const router = useRouter();
  const { user, refetch } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>(
    () => user?.notificationPreferences ?? DEFAULT_PREFS
  );

  const saveMutation = useMutation({
    mutationFn: (next: NotificationPreferences) =>
      authApi.updateMe({ notificationPreferences: next }),
    onSuccess: () => refetch(),
    onError: () => toast.error("Couldn't save that — try again"),
  });

  function toggle(key: keyof NotificationPreferences, checked: boolean) {
    const next = { ...prefs, [key]: checked };
    setPrefs(next);
    saveMutation.mutate(next);
  }

  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-6">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="tap-target -ml-2 mb-2 self-start rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <h1 className="mb-6 text-2xl font-bold">Notifications</h1>

      <div className="glass-panel divide-y divide-black/5">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center gap-3 px-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{row.label}</p>
              <p className="text-sm text-ink-500">{row.description}</p>
            </div>
            <Switch checked={prefs[row.key]} onChange={(checked) => toggle(row.key, checked)} label={row.label} />
          </div>
        ))}
      </div>
    </div>
  );
}
