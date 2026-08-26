export type NotificationType =
  | "reminder_due"
  | "blood_request_match"
  | "donation_eligible"
  | "family_invite"
  | "system";

export type AppNotification = {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};
