import { api } from "@/lib/api-client";
import type { AppNotification } from "./types";

export const notificationsApi = {
  list: (cursor?: string | null) => {
    const qs = new URLSearchParams();
    if (cursor) qs.set("cursor", cursor);
    return api.getPaginated<AppNotification>(`/notifications?${qs.toString()}`);
  },

  getUnreadCount: () => api.get<{ count: number }>("/notifications/unread-count"),

  markRead: (id: string) => api.patch<{ message: string }>(`/notifications/${id}/read`),

  markAllRead: () => api.post<{ message: string }>("/notifications/read-all"),

  getVapidPublicKey: () => api.get<{ publicKey: string }>("/notifications/vapid-public-key"),
};
