import { api } from "@/lib/api-client";
import type { ChatMessage, Conversation, SendMessageResult } from "./types";

export const chatApi = {
  sendMessage: (input: { conversationId?: string; content: string }) =>
    api.post<SendMessageResult>("/chat/message", input),

  listConversations: () => api.get<Conversation[]>("/chat/conversations"),

  getMessages: (conversationId: string) =>
    api.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`),
};
