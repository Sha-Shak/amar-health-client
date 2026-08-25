"use client";

import { ChatComposer } from "./chat-composer";
import { MessageBubble } from "./message-bubble";
import { chatApi } from "@/features/chat/api";
import type { ChatMessage } from "@/features/chat/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function ChatThread({
  conversationId: initialConversationId,
  initialMessages,
}: {
  conversationId?: string;
  initialMessages?: ChatMessage[];
}) {
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const bottomRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage({ conversationId, content }),
    onMutate: (content) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: `temp-${Date.now()}`,
          conversationId: conversationId ?? "",
          role: "user",
          content,
          isEmergencyFlag: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    },
    onSuccess: (result) => {
      setConversationId(result.conversationId);
      setMessages((prev) => [...prev, result.message]);
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
    onError: () => toast.error("Couldn't send that — try again"),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mutation.isPending]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-4 pt-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-ink-500">
            <p className="text-sm">
              Tell me what symptoms you&apos;re having and I&apos;ll help point you toward the
              right kind of care. This isn&apos;t a diagnosis — for emergencies, call 999.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message._id} message={message} />
        ))}

        {mutation.isPending && (
          <div className="flex justify-start">
            <div className="glass-panel flex items-center gap-1 rounded-[var(--radius-card)] rounded-bl-md px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-500 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-500 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-500" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-5 pb-2">
        <ChatComposer onSend={(content) => mutation.mutate(content)} disabled={mutation.isPending} />
      </div>
    </div>
  );
}
