"use client";

import { notificationsApi } from "@/features/notifications/api";
import type { AppNotification, NotificationType } from "@/features/notifications/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Droplets, HeartPulse, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";

const ICONS: Record<NotificationType, ComponentType<{ size?: number; className?: string }>> = {
  reminder_due: Bell,
  blood_request_match: Droplets,
  donation_eligible: HeartPulse,
  family_invite: Users,
  system: Bell,
};

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationsApi.list(),
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = notificationsQuery.data?.items ?? [];
  const hasUnread = notifications.some((n) => !n.read);

  function handleTap(notification: AppNotification) {
    if (!notification.read) markReadMutation.mutate(notification._id);
    if (notification.link) router.push(notification.link);
  }

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8 pb-24">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {hasUnread && (
          <button
            type="button"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-1 text-sm font-semibold text-primary-700"
          >
            <CheckCheck size={16} aria-hidden="true" />
            Mark all read
          </button>
        )}
      </div>

      {notificationsQuery.isLoading && (
        <p className="py-12 text-center text-sm text-ink-500">Loading…</p>
      )}

      {!notificationsQuery.isLoading && notifications.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Bell size={28} className="text-ink-500" aria-hidden="true" />
          <p className="text-sm text-ink-500">You&apos;re all caught up — nothing here yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((notification) => {
          const Icon = ICONS[notification.type] ?? Bell;
          return (
            <button
              key={notification._id}
              type="button"
              onClick={() => handleTap(notification)}
              className={`glass-panel flex w-full items-start gap-3 p-4 text-left transition-colors ${
                notification.read ? "" : "bg-primary-50/60"
              }`}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700"
                aria-hidden="true"
              >
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-semibold">{notification.title}</span>
                  {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-coral-500" />}
                </span>
                <span className="mt-0.5 block text-sm text-ink-500">{notification.body}</span>
                <span className="mt-1 block text-xs text-ink-400">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
