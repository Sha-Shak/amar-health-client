import { api } from "@/lib/api-client";
import type { AuthResult, User } from "./types";

export const authApi = {
  signupPhone: (input: { name?: string; phone: string; password: string }) =>
    api.post<AuthResult>("/patient/auth/signup-phone", input, { auth: false }),

  loginPhone: (input: { phone: string; password: string }) =>
    api.post<AuthResult>("/patient/auth/login-phone", input, { auth: false }),

  googleAuth: (idToken: string) =>
    api.post<AuthResult>("/patient/auth/google", { idToken }, { auth: false }),

  signupEmail: (input: { name?: string; email: string; password: string }) =>
    api.post<AuthResult>("/patient/auth/signup-email", input, { auth: false }),

  loginEmail: (input: { email: string; password: string }) =>
    api.post<AuthResult>("/patient/auth/login-email", input, { auth: false }),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>(
      "/patient/auth/forgot-password",
      { email },
      { auth: false }
    ),

  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>(
      `/patient/auth/reset-password/${token}`,
      { password },
      { auth: false }
    ),

  getMe: () => api.get<User>("/patient/me"),

  updateMe: (patch: Record<string, unknown>) => api.patch<User>("/patient/me", patch),

  requestPresignedUrl: (purpose: "avatar" | "document", contentType: string) =>
    api.post<{ uploadUrl: string; fileKey: string }>("/uploads/presigned-url", {
      purpose,
      contentType,
    }),

  exportData: () =>
    api.post<{
      profile: Record<string, unknown>;
      documents: unknown[];
      reminders: unknown[];
      bookings: unknown[];
      generatedAt: string;
    }>("/patient/me/export-data"),

  requestDeletion: () => api.post<{ message: string }>("/patient/me/request-deletion"),

  generateEmergencyPass: () =>
    api.post<{ shareToken: string; generatedAt: string }>("/patient/me/emergency-pass/generate"),

  getEmergencyPassByToken: (shareToken: string) =>
    api.get<{
      name?: string;
      bloodGroup?: string;
      allergies?: string[];
      medicalConditions?: string[];
      emergencyContact?: { name?: string; relationship?: string; phone?: string };
    }>(`/emergency-pass/${shareToken}`, { auth: false }),
};

// The presigned uploadUrl is a direct storage endpoint (§9) — bytes go straight
// there via PUT, not through the JSON envelope api-client uses everywhere else.
export async function uploadFile(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("Upload failed — please try again");
}
