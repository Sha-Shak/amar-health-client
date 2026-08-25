import type { Specialty } from "@/features/directory/types";

export type ChatMessage = {
  _id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  suggestedSpecialty?: Specialty;
  isEmergencyFlag: boolean;
  createdAt: string;
};

export type Conversation = {
  _id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type SendMessageResult = {
  conversationId: string;
  message: ChatMessage;
  suggestedSpecialty: Specialty | null;
  isEmergencyFlag: boolean;
};
