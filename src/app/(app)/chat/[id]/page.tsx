"use client";

import { ChatThread } from "@/components/chat/chat-thread";
import { chatApi } from "@/features/chat/api";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function ChatConversationPage() {
  const router = useRouter();
  const id = useParams<{ id: string }>().id;

  const { data: messages, isLoading } = useQuery({
    queryKey: ["chat", "messages", id],
    queryFn: () => chatApi.getMessages(id),
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 px-5 pt-8">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="tap-target -ml-2 rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-bold">AI Assistant</h1>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-ink-500">
          Loading…
        </div>
      ) : (
        <ChatThread conversationId={id} initialMessages={messages} />
      )}
    </div>
  );
}
