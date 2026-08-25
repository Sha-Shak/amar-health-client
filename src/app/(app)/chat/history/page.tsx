"use client";

import { chatApi } from "@/features/chat/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChatHistoryPage() {
  const router = useRouter();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: chatApi.listConversations,
  });

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="tap-target -ml-2 rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-bold">Chat history</h1>
      </div>

      {isLoading && <p className="py-12 text-center text-sm text-ink-500">Loading…</p>}

      {!isLoading && conversations?.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <MessageCircle size={28} className="text-ink-500" aria-hidden="true" />
          <p className="text-sm text-ink-500">No conversations yet.</p>
        </div>
      )}

      <div className="space-y-2 pb-6">
        {conversations?.map((conversation) => (
          <Link
            key={conversation._id}
            href={`/chat/${conversation._id}`}
            className="glass-panel flex items-center justify-between gap-3 p-3.5"
          >
            <p className="min-w-0 flex-1 truncate font-medium">{conversation.title}</p>
            <p className="shrink-0 text-xs text-ink-500">
              {format(new Date(conversation.updatedAt), "MMM d")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
