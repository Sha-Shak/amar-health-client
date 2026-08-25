export type EmergencyContact = { name?: string; relationship?: string; phone?: string };

export type NotificationPreferences = {
  reminderAlerts: boolean;
  bookingUpdates: boolean;
  familyAlerts: boolean;
  productUpdates: boolean;
};

export type User = {
  _id: string;
  phone?: string;
  email?: string;
  name?: string;
  patientCode: string;
  authMethod: "phone_password" | "email_password" | "google";
  profileComplete: boolean;
  avatarUrl?: string;
  dob?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  bloodGroup?: string;
  nid?: string;
  emergencyContact?: EmergencyContact;
  medicalConditions?: string[];
  allergies?: string[];
  preferredLanguage?: "en" | "bn";
  notificationPreferences?: NotificationPreferences;
  isVerified?: boolean;
  emergencyPass?: { shareToken?: string; generatedAt?: string };
  status: "active" | "deleted";
};

export type AuthResult = {
  user: User;
  profileComplete: boolean;
  accessToken: string;
  refreshToken: string;
};
